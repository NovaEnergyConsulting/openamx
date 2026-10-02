import { describe, expect, it } from "bun:test";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { parseFrontMatter } from "../../../src/parser/parseFrontMatter";
import { createDesktopService } from "./desktopService";
import { readConfigurationRevision } from "./configuration";
import { updateReportFrontmatter } from "./desktopSettings";

describe("current-buffer report settings edits", () => {
	it("preserves narrative, unrelated YAML keys, comments, and line endings", () => {
		const source = "---\r\ntitle: Existing title\r\n# keep this note\r\ncustom: value\r\nreport:\r\n  author: Old\r\n---\r\n# Body\r\n";
		const updated = updateReportFrontmatter(source, { author: "New", sourceVisible: false });
		expect(updated).toContain("# keep this note\r\n");
		expect(updated).toContain("custom: value\r\n");
		expect(updated.endsWith("---\r\n# Body\r\n")).toBe(true);
		expect(parseFrontMatter(updated).metadata).toEqual({
			title: "Existing title", custom: "value", report: { author: "New", sourceVisible: false }
		});
	});

	it("adds frontmatter without changing the existing document body", () => {
		const source = "# Body\n\nKeep this narrative.\n";
		const updated = updateReportFrontmatter(source, { organization: "North" });
		expect(parseFrontMatter(updated).metadata).toEqual({ report: { organization: "North" } });
		expect(parseFrontMatter(updated).body).toBe(source);
	});

	it("refuses malformed existing frontmatter", () => {
		expect(() => updateReportFrontmatter("---\nreport: [broken\n---\nBody", { author: "New" })).toThrow(/invalid YAML/);
	});
});

describe("Sprint 039 trusted settings RPC", () => {
	it("persists private mappings, explicitly promotes contained files, and invalidates request identity", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-settings-rpc-"));
		const stateDirectory = join(root, ".openamx");
		const dataDirectory = join(root, "data");
		mkdirSync(stateDirectory, { mode: 0o700 });
		mkdirSync(dataDirectory);
		const entry = join(root, "report.amx");
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: {}, report: { footer: "Keep footer" } }));
		writeFileSync(entry, "---\ntitle: Kept title\ncustom: Keep this\n---\n# Body\n\n```amx\ninput amounts: Number[]\n```\n");
		const privateInput = join(tmpdir(), `openamx-private-${Date.now()}.json`);
		const privateContents = "[123456789]";
		writeFileSync(privateInput, privateContents);
		let picked: string | undefined = privateInput;
		const service = createDesktopService(undefined, { async choose() { return picked; } });
		try {
			service.setProjectRoot(root);
			await service.request.openDocument({ path: entry });
			await service.request.setAutosave({ enabled: false, delayMs: 500 });
			const before = await service.request.getInputConfiguration();
			expect(before.ok).toBe(true);
			if (!before.ok) throw new Error(before.error.message);
			expect(before.configuration.inputs[0]).toMatchObject({ name: "amounts", type: "Number[]", source: "missing", status: "missing" });
			const priorWorkbench = await service.request.getWorkbench();
			const priorIdentity = priorWorkbench.ok ? priorWorkbench.state.requestIdentity : undefined;
			const selected = await service.request.pickInputMapping({ name: "amounts", expectedRevision: before.configuration.revisions!.local });
			expect(selected.ok).toBe(true);
			if (!selected.ok) throw new Error(selected.error.message);
			expect(selected.configuration.inputs[0]).toMatchObject({ source: "local", status: "unvalidated" });
			expect(JSON.stringify(selected).includes(privateInput)).toBe(false);
			expect(JSON.stringify(selected).includes(privateContents)).toBe(false);
			expect(selected.state.requestIdentity?.inputSettingsRevision).toBeGreaterThan(priorIdentity?.inputSettingsRevision ?? 0);
			const deniedPromotion = await service.request.promoteInputMapping({
				name: "amounts", expectedLocalRevision: selected.configuration.revisions!.local, expectedProjectRevision: selected.configuration.revisions!.project
			});
			expect(deniedPromotion.ok).toBe(false);
			if (!deniedPromotion.ok) expect(deniedPromotion.error.message).toMatch(/inside the project/);
			const afterPrivatePickRevision = selected.configuration.revisions!.local;
			const linkedInput = join(dataDirectory, "linked.json");
			symlinkSync(privateInput, linkedInput);
			picked = linkedInput;
			const linkedPick = await service.request.pickInputMapping({ name: "amounts", expectedRevision: afterPrivatePickRevision });
			expect(linkedPick.ok).toBe(false);
			picked = "//network/share/amounts.json";
			const networkPick = await service.request.pickInputMapping({ name: "amounts", expectedRevision: afterPrivatePickRevision });
			expect(networkPick.ok).toBe(false);
			picked = undefined;
			const cancelledPick = await service.request.pickInputMapping({ name: "amounts", expectedRevision: afterPrivatePickRevision });
			expect(cancelledPick.ok).toBe(true);
			if (cancelledPick.ok) expect(cancelledPick.configuration.revisions?.local).toBe(afterPrivatePickRevision);
			const containedInput = join(dataDirectory, "amounts.json");
			writeFileSync(containedInput, "[1,2,3]");
			const localConfigPath = join(stateDirectory, "local.json");
			writeFileSync(localConfigPath, JSON.stringify({ version: 1, inputs: { amounts: relative(root, containedInput) } }), { mode: 0o600 });
			if (process.platform !== "win32") chmodSync(localConfigPath, 0o600);
			const projectRevision = readConfigurationRevision(root, "project");
			const localRevision = readConfigurationRevision(root, "local");
			const promoted = await service.request.promoteInputMapping({ name: "amounts", expectedLocalRevision: localRevision, expectedProjectRevision: projectRevision });
			expect(promoted.ok).toBe(true);
			if (!promoted.ok) throw new Error(promoted.error.message);
			expect(promoted.configuration.inputs[0]?.source).toBe("local");
			expect(JSON.parse(readFileSync(join(stateDirectory, "project.json"), "utf8")).inputs.amounts).toBe("data/amounts.json");
			const cleared = await service.request.clearInputMapping({ name: "amounts", scope: "project", expectedRevision: promoted.configuration.revisions!.project });
			expect(cleared.ok).toBe(true);
			if (cleared.ok) expect(cleared.configuration.inputs[0]?.source).toBe("local");
		} finally {
			rmSync(root, { recursive: true, force: true });
			rmSync(privateInput, { force: true });
		}
	});

	it("rejects a picker result after the active document changes", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-settings-stale-picker-"));
		const stateDirectory = join(root, ".openamx");
		mkdirSync(stateDirectory, { mode: 0o700 });
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: {} }));
		const entry = join(root, "report.amx");
		const other = join(root, "other.amx");
		writeFileSync(entry, "```amx\ninput amounts: Number[]\n```\n");
		writeFileSync(other, "# Other\n");
		const privateInput = join(tmpdir(), `openamx-stale-picker-${Date.now()}.json`);
		writeFileSync(privateInput, "[55]");
		let finishPicker!: (value: string | undefined) => void;
		const service = createDesktopService(undefined, { choose: () => new Promise(resolve => { finishPicker = resolve; }) });
		try {
			service.setProjectRoot(root);
			await service.request.openDocument({ path: entry });
			const config = await service.request.getInputConfiguration();
			expect(config.ok).toBe(true);
			if (!config.ok) throw new Error(config.error.message);
			const pending = service.request.pickInputMapping({ name: "amounts", expectedRevision: config.configuration.revisions!.local });
			await service.request.openDocument({ path: other });
			finishPicker(privateInput);
			const stale = await pending;
			expect(stale.ok).toBe(false);
			if (!stale.ok) expect(stale.error.code).toBe("DESKTOP_STALE");
			expect(existsSync(join(stateDirectory, "local.json"))).toBe(false);
		} finally {
			rmSync(root, { recursive: true, force: true });
			rmSync(privateInput, { force: true });
		}
	});

	it("merges scoped report settings, rejects stale writes, and preserves current-buffer YAML/body", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-report-settings-rpc-"));
		const stateDirectory = join(root, ".openamx");
		const dataDirectory = join(root, "data");
		mkdirSync(stateDirectory, { mode: 0o700 });
		mkdirSync(dataDirectory);
		writeFileSync(join(dataDirectory, "rows.csv"), "row\n1\n");
		const entry = join(root, "report.amx");
		const body = "# Report body\n\nKeep every narrative byte.\n";
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: { rows: "data/rows.csv" }, report: { footer: "Preserve me" } }));
		const originalText = `---\r\ntitle: Existing title\r\n# Preserve this comment\r\ncustom: untouched\r\n---\r\n${body}`;
		writeFileSync(entry, originalText);
		const service = createDesktopService();
		try {
			service.setProjectRoot(root);
			await service.request.openDocument({ path: entry });
			await service.request.setAutosave({ enabled: false, delayMs: 500 });
			const initial = await service.request.getReportSettings();
			expect(initial.ok).toBe(true);
			if (!initial.ok) throw new Error(initial.error.message);
			const projectUpdated = await service.request.setProjectReportSettings({ values: { organization: "North" }, expectedRevision: initial.settings.projectRevision });
			expect(projectUpdated.ok).toBe(true);
			if (!projectUpdated.ok) throw new Error(projectUpdated.error.message);
			expect(JSON.parse(readFileSync(join(stateDirectory, "project.json"), "utf8"))).toEqual({
				version: 1, inputs: { rows: "data/rows.csv" }, report: { footer: "Preserve me", organization: "North" }
			});
			const beforeConflict = projectUpdated.settings.projectRevision;
			writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: { rows: "data/rows.csv" }, report: { footer: "External edit" } }));
			const staleProject = await service.request.setProjectReportSettings({ values: { author: "Must not write" }, expectedRevision: beforeConflict });
			expect(staleProject.ok).toBe(false);
			expect(readFileSync(join(stateDirectory, "project.json"), "utf8")).toContain("External edit");
			const current = await service.request.getReportSettings();
			expect(current.ok).toBe(true);
			if (!current.ok) throw new Error(current.error.message);
			const updatedDocument = await service.request.setDocumentReportSettings({ values: { author: "Current author", sourceVisible: false }, expectedRevision: current.settings.documentRevision });
			expect(updatedDocument.ok).toBe(true);
			if (!updatedDocument.ok) throw new Error(updatedDocument.error.message);
			expect(updatedDocument.document.text).toContain("# Preserve this comment\r\n");
			expect(updatedDocument.document.text).toContain("custom: untouched\r\n");
			expect(updatedDocument.document.text.endsWith(`---\r\n${body}`)).toBe(true);
			expect(parseFrontMatter(updatedDocument.document.text).metadata.report).toEqual({ author: "Current author", sourceVisible: false });
			const staleDocument = await service.request.setDocumentReportSettings({ values: { organization: "Stale" }, expectedRevision: current.settings.documentRevision });
			expect(staleDocument.ok).toBe(false);
			expect(readFileSync(entry, "utf8")).toBe(originalText);
			const projectAfter = JSON.parse(readFileSync(join(stateDirectory, "project.json"), "utf8"));
			expect(projectAfter.inputs).toEqual({ rows: "data/rows.csv" });
			expect(projectAfter.report).toEqual({ footer: "External edit" });
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("validates picker-selected report logos before returning project-relative paths", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-logo-settings-rpc-"));
		const stateDirectory = join(root, ".openamx");
		const assetDirectory = join(root, "assets");
		mkdirSync(stateDirectory, { mode: 0o700 });
		mkdirSync(assetDirectory);
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: {} }));
		const entry = join(root, "report.amx");
		writeFileSync(entry, "# Report\n");
		const logo = join(assetDirectory, "mark.png");
		writeFileSync(logo, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"));
		let picked: string | undefined = logo;
		const service = createDesktopService(undefined, { async choose() { return picked; } });
		try {
			service.setProjectRoot(root);
			await service.request.openDocument({ path: entry });
			const selection = await service.request.pickReportLogo({});
			expect(selection).toEqual({ ok: true, cancelled: false, path: "assets/mark.png" });
			const snapshot = await service.request.getReportSettings();
			expect(snapshot.ok).toBe(true);
			if (!snapshot.ok) throw new Error(snapshot.error.message);
			const invalid = await service.request.setProjectReportSettings({ values: { logo: "missing.png", logoAlt: "Missing logo" }, expectedRevision: snapshot.settings.projectRevision });
			expect(invalid.ok).toBe(false);
			expect(JSON.parse(readFileSync(join(stateDirectory, "project.json"), "utf8"))).toEqual({ version: 1, inputs: {} });
			picked = undefined;
			expect(await service.request.pickReportLogo({})).toEqual({ ok: true, cancelled: true });
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});