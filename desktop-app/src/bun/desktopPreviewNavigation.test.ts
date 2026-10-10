import { expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createDesktopService, resolvePreviewNavigationTarget } from "./desktopService";

test("preview navigation confirms opaque targets and opens only mapped HTTP or contained local files", async () => {
	const root = mkdtempSync(join(tmpdir(), "openamx-preview-navigation-"));
	const sourceDirectory = join(root, "source");
	const entryPath = join(sourceDirectory, "report.amx");
	const companionPath = join(sourceDirectory, "companion.pdf");
	const source = "# Heading\n\n[External](https://example.invalid/report) [Local](./companion.pdf) [Unsupported](javascript:alert(1))\n";
	const confirmations: Array<{ kind: "external"; href: string } | { kind: "local"; path: string }> = [];
	const openedExternal: string[] = [];
	const openedLocal: string[] = [];
	const actions: string[] = [];
	let allowOpen = true;
	let removeDuringConfirmation = false;
	mkdirSync(sourceDirectory);
	writeFileSync(entryPath, source);
	writeFileSync(companionPath, "local target");
	const service = createDesktopService(root, {
		async choose() { return undefined; },
		async confirmPreviewNavigation(target) {
			actions.push("confirm");
			confirmations.push(target);
			if (removeDuringConfirmation && target.kind === "local") rmSync(target.path);
			return allowOpen;
		},
		async openExternal(url) {
			actions.push("external");
			openedExternal.push(url);
			return true;
		},
		async openPath(path) {
			actions.push("local");
			openedLocal.push(path);
			return true;
		}
	});
	try {
		await service.request.openDocument({ path: entryPath });
		const getPreview = async () => {
			const state = await service.request.getWorkbench();
			if (!state.ok || !state.state.requestIdentity) throw new Error("Preview document identity is unavailable.");
			const started = await service.request.startJob({ operation: "preview", identity: state.state.requestIdentity });
			if (!started.ok) throw new Error(started.error.message);
			let job = started.job;
			for (let attempt = 0; job.status === "running" && attempt < 1000; attempt++) {
				await new Promise(resolve => setTimeout(resolve, 10));
				const current = await service.request.getJob({ jobId: job.identity.jobId });
				if (!current.ok) throw new Error(current.error.message);
				job = current.job;
			}
			if (job.status !== "succeeded" || job.result?.kind !== "preview" || !job.result.previewToken || !job.result.html) {
				throw new Error("Preview job did not produce its private navigation mapping.");
			}
			expect("targets" in job.result).toBe(false);
			const ids = [...job.result.html.matchAll(/data-openamx-target="([a-f0-9]{32})"/g)].map(match => match[1]);
			return { identity: state.state.requestIdentity, previewToken: job.result.previewToken, ids };
		};
		const preview = await getPreview();
		expect(preview.ids).toHaveLength(2);
		expect(confirmations).toHaveLength(0);

		const forged = Object.assign({
			targetId: preview.ids[0], previewToken: preview.previewToken, identity: preview.identity
		}, { href: "https://attacker.invalid/forged" });
		const rawTarget = await service.request.openPreviewTarget(forged);
		expect(rawTarget.ok).toBe(false);
		expect(confirmations).toHaveLength(0);

		const unknown = await service.request.openPreviewTarget({
			targetId: "f".repeat(32), previewToken: preview.previewToken, identity: preview.identity
		});
		expect(unknown.ok).toBe(false);
		expect(actions).toEqual([]);

		const external = await service.request.openPreviewTarget({
			targetId: preview.ids[0], previewToken: preview.previewToken, identity: preview.identity
		});
		expect(external).toEqual({ ok: true, opened: true });
		expect(confirmations[0]).toEqual({ kind: "external", href: "https://example.invalid/report" });
		expect(openedExternal).toEqual(["https://example.invalid/report"]);
		expect(actions).toEqual(["confirm", "external"]);

		allowOpen = false;
		const cancelled = await service.request.openPreviewTarget({
			targetId: preview.ids[1], previewToken: preview.previewToken, identity: preview.identity
		});
		expect(cancelled).toEqual({ ok: true, opened: false, cancelled: true });
		expect(confirmations[1]).toEqual({ kind: "local", path: resolve(companionPath) });
		expect(openedLocal).toEqual([]);
		expect(actions).toEqual(["confirm", "external", "confirm"]);

		allowOpen = true;
		const local = await service.request.openPreviewTarget({
			targetId: preview.ids[1], previewToken: preview.previewToken, identity: preview.identity
		});
		expect(local).toEqual({ ok: true, opened: true });
		expect(openedLocal).toEqual([resolve(companionPath)]);

		const replacement = await getPreview();
		const replaced = await service.request.openPreviewTarget({
			targetId: preview.ids[0], previewToken: preview.previewToken, identity: preview.identity
		});
		expect(replaced.ok).toBe(false);

		removeDuringConfirmation = true;
		const removed = await service.request.openPreviewTarget({
			targetId: replacement.ids[1], previewToken: replacement.previewToken, identity: replacement.identity
		});
		expect(removed.ok).toBe(false);
		expect(confirmations).toHaveLength(4);
		expect(openedLocal).toHaveLength(1);

		const invalidated = await service.request.invalidatePreviewTargets({
			previewToken: replacement.previewToken, identity: replacement.identity
		});
		expect(invalidated).toEqual({ ok: true, invalidated: true });
		const closed = await service.request.openPreviewTarget({
			targetId: replacement.ids[0], previewToken: replacement.previewToken, identity: replacement.identity
		});
		expect(closed.ok).toBe(false);

		await service.request.updateBuffer({ text: `${source}\nUpdated after preview.\n` });
		const stale = await service.request.openPreviewTarget({
			targetId: replacement.ids[0], previewToken: replacement.previewToken, identity: replacement.identity
		});
		expect(stale.ok).toBe(false);
		expect(openedExternal).toHaveLength(1);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("host revalidation rejects unsafe schemes, traversal, missing files, symlinks, and disallowed types", () => {
	const root = mkdtempSync(join(tmpdir(), "openamx-preview-target-validation-"));
	const sourceDirectory = join(root, "source");
	const entryPath = join(sourceDirectory, "report.amx");
	const allowedPath = join(sourceDirectory, "allowed.pdf");
	const rootPath = join(root, "outside.pdf");
	const disallowedPath = join(sourceDirectory, "program.exe");
	const outsidePath = join(dirname(root), `${root.split(/[\\/]/).pop()}-outside.pdf`);
	const symlinkPath = join(sourceDirectory, "linked.pdf");
	mkdirSync(sourceDirectory);
	writeFileSync(entryPath, "# Heading\n");
	writeFileSync(allowedPath, "allowed");
	writeFileSync(rootPath, "inside project");
	writeFileSync(disallowedPath, "disallowed");
	writeFileSync(outsidePath, "outside");
	let symlinkCreated = false;
	try {
		try {
			symlinkSync(outsidePath, symlinkPath, "file");
			symlinkCreated = true;
		} catch (error) {
			throw new Error(`Unable to create the required symlink validation fixture: ${error instanceof Error ? error.message : String(error)}`);
		}
		expect(resolvePreviewNavigationTarget({ kind: "external", href: "https://example.invalid/path" }, root, entryPath))
			.toEqual({ kind: "external", href: "https://example.invalid/path" });
		expect(resolvePreviewNavigationTarget({ kind: "external", href: "http://example.invalid/path" }, root, entryPath))
			.toEqual({ kind: "external", href: "http://example.invalid/path" });
		expect(() => resolvePreviewNavigationTarget({ kind: "external", href: "javascript:alert(1)" }, root, entryPath)).toThrow();
		expect(() => resolvePreviewNavigationTarget({ kind: "external", href: "file:///etc/passwd" }, root, entryPath)).toThrow();
		expect(() => resolvePreviewNavigationTarget({ kind: "external", href: "https://user@example.invalid/" }, root, entryPath)).toThrow();
		expect(resolvePreviewNavigationTarget({ kind: "local", path: "allowed.pdf" }, root, entryPath).kind).toBe("local");
		expect(resolvePreviewNavigationTarget({ kind: "local", path: "../outside.pdf" }, root, entryPath))
			.toEqual({ kind: "local", path: realpathSync(rootPath) });
		expect(() => resolvePreviewNavigationTarget({ kind: "local", path: "../../outside.pdf" }, root, entryPath)).toThrow();
		expect(() => resolvePreviewNavigationTarget({ kind: "local", path: "missing.pdf" }, root, entryPath)).toThrow();
		expect(() => resolvePreviewNavigationTarget({ kind: "local", path: "program.exe" }, root, entryPath)).toThrow();
		expect(() => resolvePreviewNavigationTarget({ kind: "local", path: "linked.pdf" }, root, entryPath)).toThrow();
		expect(existsSync(symlinkPath)).toBe(symlinkCreated);
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(outsidePath, { force: true });
	}
});
