import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDesktopService } from "./desktopService";
import type { DesktopJobSnapshot, DesktopRPCClient } from "../shared/rpc";

function fixture() {
	const root = mkdtempSync(join(tmpdir(), "openamx-css-editor-"));
	const entry = join(root, "report.amx");
	const stylesheet = join(root, "theme.css");
	mkdirSync(join(root, ".openamx"));
	writeFileSync(join(root, ".openamx", "project.json"), JSON.stringify({
		version: 1, inputs: {}, report: { stylesheet: "theme.css" }
	}));
	writeFileSync(entry, "# Styled report\n");
	writeFileSync(stylesheet, "body { color: navy; }\n");
	return { root, entry, stylesheet };
}

async function completedJob(service: DesktopRPCClient, job: DesktopJobSnapshot): Promise<DesktopJobSnapshot> {
	for (let attempt = 0; job.status === "running" && attempt < 200; attempt++) {
		await new Promise(resolve => setTimeout(resolve, 10));
		const result = await service.request.getJob({ jobId: job.identity.jobId });
		if (!result.ok) throw new Error(result.error.message);
		job = result.job;
	}
	expect(job.status).toBe("succeeded");
	return job;
}

describe("editable project CSS files", () => {
	it("lists, opens, edits, and saves CSS without running AMX and protects disk conflicts", async () => {
		const { root, stylesheet } = fixture();
		const service = createDesktopService(root);
		try {
			await service.request.setAutosave({ enabled: false, delayMs: 500 });
			const listing = await service.request.listProjectFiles();
			if (!listing.ok) throw new Error(listing.error.message);
			expect(listing.files).toContainEqual({ path: "theme.css", kind: "css" });
			const opened = await service.request.openDocument({ path: stylesheet });
			if (!opened.ok) throw new Error(opened.error.message);
			expect(opened.document.kind).toBe("css");
			const text = "body {\r\n  color: teal;\r\n}\r\n";
			const edited = await service.request.updateBuffer({ text });
			if (!edited.ok) throw new Error(edited.error.message);
			expect(edited.document).toMatchObject({ text, dirty: true });
			expect(await service.request.analyzeBuffer()).toEqual({ ok: true, analysis: { diagnostics: [], completions: [] } });
			expect((await service.request.formatBuffer()).ok).toBe(false);
			const saved = await service.request.saveDocument();
			if (!saved.ok) throw new Error(saved.error.message);
			expect(saved.document.dirty).toBe(false);
			expect(readFileSync(stylesheet, "utf8")).toBe(text);
			await service.request.updateBuffer({ text: "body { color: red; }\n" });
			writeFileSync(stylesheet, "body { color: green; }\n");
			const conflict = await service.request.saveDocument();
			expect(conflict.ok).toBe(false);
			if (!conflict.ok) expect(conflict.error.code).toBe("DESKTOP_CONFLICT");
			expect(readFileSync(stylesheet, "utf8")).toBe("body { color: green; }\n");
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("uses unsaved CSS for preview and HTML export and reverts after discarding the tab", async () => {
		const { root, entry, stylesheet } = fixture();
		const destination = join(root, "report.html");
		const service = createDesktopService(root, { async choose() { return destination; } });
		try {
			await service.request.setAutosave({ enabled: false, delayMs: 500 });
			await service.request.openDocument({ path: entry });
			await service.request.openDocument({ path: stylesheet });
			await service.request.updateBuffer({ text: "body { color: teal; }\n" });
			await service.request.selectTab({ path: entry });
			const preview = await service.request.previewBuffer();
			if (!preview.ok) throw new Error(preview.error.message);
			expect(preview.diagnostics).toEqual([]);
			expect(preview.html).toContain("body { color: teal; }");
			expect(preview.html).not.toContain("body { color: navy; }");
			expect(readFileSync(stylesheet, "utf8")).toBe("body { color: navy; }\n");
			const selected = await service.request.pickDestination({ extension: ".html", fileName: "report.html" });
			if (!selected.ok || !selected.selectionId) throw new Error("Export selection failed.");
			const state = await service.request.getWorkbench();
			if (!state.ok || !state.state.requestIdentity) throw new Error("AMX identity is unavailable.");
			const started = await service.request.startJob({
				operation: "html", identity: state.state.requestIdentity, selectionId: selected.selectionId
			});
			if (!started.ok) throw new Error(started.error.message);
			await completedJob(service, started.job);
			expect(readFileSync(destination, "utf8")).toContain("body { color: teal; }");
			const closed = await service.request.closeTab({ path: stylesheet, action: "discard" });
			expect(closed.ok).toBe(true);
			const reverted = await service.request.previewBuffer();
			if (!reverted.ok) throw new Error(reverted.error.message);
			expect(reverted.html).toContain("body { color: navy; }");
			expect(reverted.html).not.toContain("body { color: teal; }");
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("creates, duplicates, moves, trashes, and restores CSS project files", async () => {
		const { root } = fixture();
		const service = createDesktopService(root);
		try {
			const created = await service.request.createProjectFile({ path: "new.css", kind: "css" });
			if (!created.ok) throw new Error(created.error.message);
			expect(created.document).toMatchObject({ kind: "css", text: "\n" });
			const duplicated = await service.request.duplicateProjectFile({ source: "new.css", destination: "copy.css" });
			if (!duplicated.ok) throw new Error(duplicated.error.message);
			expect(duplicated.document.kind).toBe("css");
			const moved = await service.request.moveProjectFile({ source: "copy.css", destination: "renamed.css" });
			if (!moved.ok) throw new Error(moved.error.message);
			expect(moved.state.tabs.some(tab => tab.path === join(root, "renamed.css") && tab.kind === "css")).toBe(true);
			const deleted = await service.request.deleteProjectFile({ path: "renamed.css" });
			if (!deleted.ok) throw new Error(deleted.error.message);
			const trash = await service.request.listTrash();
			if (!trash.ok) throw new Error(trash.error.message);
			expect(trash.items[0]).toMatchObject({ path: "renamed.css", kind: "css" });
			expect((await service.request.restoreTrash({ id: trash.items[0]!.id })).ok).toBe(true);
			expect(readFileSync(join(root, "renamed.css"), "utf8")).toBe("\n");
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("recovers unsaved CSS without writing it to disk", async () => {
		const { root, stylesheet } = fixture();
		const sessionFile = join(root, ".openamx", "session.json");
		const service = createDesktopService(root, undefined, sessionFile);
		try {
			await service.request.setAutosave({ enabled: false, delayMs: 500 });
			await service.request.openDocument({ path: stylesheet });
			const text = "body { color: teal; }\n";
			await service.request.updateBuffer({ text });
			const restarted = createDesktopService(undefined, undefined, sessionFile);
			const recovery = await restarted.request.getRecovery();
			if (!recovery.ok) throw new Error(recovery.error.message);
			expect(recovery.items).toEqual([{ path: "theme.css", kind: "css" }]);
			const restored = await restarted.request.resolveRecovery({ action: "restore" });
			if (!restored.ok) throw new Error(restored.error.message);
			const document = await restarted.request.readDocument();
			if (!document.ok) throw new Error(document.error.message);
			expect(document.document).toMatchObject({ kind: "css", text, dirty: true });
			expect(readFileSync(stylesheet, "utf8")).toBe("body { color: navy; }\n");
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("autosaves CSS source text through the normal save path", async () => {
		const { root, stylesheet } = fixture();
		const service = createDesktopService(root);
		try {
			await service.request.openDocument({ path: stylesheet });
			await service.request.setAutosave({ enabled: true, delayMs: 100 });
			const text = "body { color: teal; }\n";
			await service.request.updateBuffer({ text });
			await new Promise(resolve => setTimeout(resolve, 220));
			expect(readFileSync(stylesheet, "utf8")).toBe(text);
			const state = await service.request.getWorkbench();
			if (!state.ok) throw new Error(state.error.message);
			expect(state.state.tabs[0]!.dirty).toBe(false);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
