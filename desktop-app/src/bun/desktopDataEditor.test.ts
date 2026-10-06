import { describe, expect, it } from "bun:test";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDesktopService } from "./desktopService";

describe("Sprint 041 mapped data document boundary", () => {
	it("opens a private mapped input with an opaque tab identity and path-free session state", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-data-project-"));
		const privateRoot = mkdtempSync(join(tmpdir(), "openamx-private-data-"));
		const stateDirectory = join(root, ".openamx");
		const entry = join(root, "report.amx");
		const schemaModule = join(root, "schema.amx");
		const privateData = join(privateRoot, "rows.json");
		const sessionFile = join(privateRoot, "desktop-session.json");
		const originalText = '[{"id":"A","amount":1}]';
		mkdirSync(stateDirectory, { mode: 0o700 });
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: {} }));
		writeFileSync(join(stateDirectory, "local.json"), JSON.stringify({ version: 1, inputs: { rows: privateData } }), { mode: 0o600 });
		if (process.platform !== "win32") chmodSync(join(stateDirectory, "local.json"), 0o600);
		writeFileSync(entry, "```amx\ntype Row {\n  id: String\n  amount: Number\n}\ninput rows: Row[]\n```\n");
		writeFileSync(privateData, originalText);
		const service = createDesktopService(root, undefined, sessionFile);
		try {
			await service.request.openDocument({ path: entry });
			const opened = await service.request.openMappedInput({ name: "rows" });
			if (!opened.ok) throw new Error(opened.error.message);
			expect(opened.ok).toBe(true);
			expect(opened.document).toMatchObject({ kind: "external-data", external: true, inputName: "rows", dataFormat: "json", text: originalText });
			expect(opened.document.path).not.toBe(privateData);
			expect(JSON.stringify(opened.document)).not.toContain(privateData);
			expect(JSON.stringify(await service.request.getWorkbench())).not.toContain(privateData);
			expect(readFileSync(sessionFile, "utf8")).not.toContain(privateData);
		} finally {
			rmSync(root, { recursive: true, force: true });
			rmSync(privateRoot, { recursive: true, force: true });
		}
	});

	it("autosaves exact invalid external text and preserves an external edit on conflict", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-data-save-project-"));
		const privateRoot = mkdtempSync(join(tmpdir(), "openamx-data-save-private-"));
		const stateDirectory = join(root, ".openamx");
		const entry = join(root, "report.amx");
		const privateData = join(privateRoot, "rows.csv");
		const originalText = "id,value\nA,1\n";
		mkdirSync(stateDirectory, { mode: 0o700 });
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: {} }));
		writeFileSync(join(stateDirectory, "local.json"), JSON.stringify({ version: 1, inputs: { rows: privateData } }), { mode: 0o600 });
		if (process.platform !== "win32") chmodSync(join(stateDirectory, "local.json"), 0o600);
		writeFileSync(entry, "```amx\ntype Row {\n  id: String\n  amount: Number\n}\ninput rows: Row[]\n```\n");
		writeFileSync(privateData, originalText);
		const service = createDesktopService(root);
		try {
			await service.request.openDocument({ path: entry });
			const opened = await service.request.openMappedInput({ name: "rows" });
			if (!opened.ok) throw new Error(opened.error.message);
			expect(opened.ok).toBe(true);
			const privateTab = opened.document.path;
			expect((await service.request.setAutosave({ enabled: true, delayMs: 100 })).ok).toBe(true);
			const invalidText = "id,value\nA,not-a-number\n";
			const edited = await service.request.updateBuffer({ path: privateTab, text: invalidText, sequence: 1 });
			expect(edited.ok).toBe(true);
			await new Promise(resolve => setTimeout(resolve, 220));
			expect(readFileSync(privateData, "utf8")).toBe(invalidText);
			const secondEdit = "id,value\nB,2\n";
			const changed = await service.request.updateBuffer({ path: privateTab, text: secondEdit, sequence: 2 });
			expect(changed.ok).toBe(true);
			const externalEdit = "id,value\nExternal,99\n";
			writeFileSync(privateData, externalEdit);
			const saved = await service.request.saveDocument();
			expect(saved.ok).toBe(false);
			if (!saved.ok) {
				expect(saved.error.code).toBe("DESKTOP_CONFLICT");
				expect(saved.error.message).not.toContain(privateData);
			}
			expect(readFileSync(privateData, "utf8")).toBe(externalEdit);
		} finally {
			rmSync(root, { recursive: true, force: true });
			rmSync(privateRoot, { recursive: true, force: true });
		}
	});

	it("validates a mapped external tab against its owner AMX schema without returning its private path", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-data-schema-project-"));
		const privateRoot = mkdtempSync(join(tmpdir(), "openamx-data-schema-private-"));
		const stateDirectory = join(root, ".openamx");
		const entry = join(root, "report.amx");
		const schemaModule = join(root, "schema.amx");
		const privateData = join(privateRoot, "rows.json");
		mkdirSync(stateDirectory, { mode: 0o700 });
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: {} }));
		writeFileSync(join(stateDirectory, "local.json"), JSON.stringify({ version: 1, inputs: { rows: privateData } }), { mode: 0o600 });
		if (process.platform !== "win32") chmodSync(join(stateDirectory, "local.json"), 0o600);
		writeFileSync(schemaModule, "```amx\nexport type Row {\n  id: String\n  amount: Number\n}\n```\n");
		writeFileSync(entry, "```amx\nimport { Row } from \"./schema.amx\"\ninput rows: Row[]\n```\n");
		writeFileSync(privateData, '[{"id":"PRIVATE_DATA_SENTINEL","amount":2}]');
		const service = createDesktopService(root);
		try {
			await service.request.openDocument({ path: entry });
			const opened = await service.request.openMappedInput({ name: "rows" });
			expect(opened.ok).toBe(true);
			if (!opened.ok) throw new Error(opened.error.message);
			const workbench = await service.request.getWorkbench();
			expect(workbench.ok).toBe(true);
			if (!workbench.ok || !workbench.state.requestIdentity) throw new Error("Mapped data identity is unavailable.");
			const started = await service.request.startJob({ operation: "validate-data", identity: workbench.state.requestIdentity });
			expect(started.ok).toBe(true);
			if (!started.ok) throw new Error(started.error.message);
			let job = started.job;
			for (let attempt = 0; job.status === "running" && attempt < 100; attempt++) {
				await new Promise(resolve => setTimeout(resolve, 5));
				const polled = await service.request.getJob({ jobId: job.identity.jobId });
				if (!polled.ok) throw new Error(polled.error.message);
				job = polled.job;
			}
			if (job.status !== "succeeded") throw new Error(JSON.stringify({ status: job.status, diagnostics: job.diagnostics.map(item => ({ code: item.code, message: item.message.replaceAll(privateData, "[private input]") })) }));
			expect(job.result).toMatchObject({ kind: "data-validation", valid: true, schema: { name: "rows", type: "Row[]", fields: [{ name: "id", type: "String" }, { name: "amount", type: "Number" }] } });
			expect(JSON.stringify(job)).not.toContain(privateData);
			expect(JSON.stringify(job)).not.toContain("PRIVATE_DATA_SENTINEL");
		} finally {
			rmSync(root, { recursive: true, force: true });
			rmSync(privateRoot, { recursive: true, force: true });
		}
	});

	it("supersedes mapped-data validation when its owner changes before completion", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-data-stale-project-"));
		const privateRoot = mkdtempSync(join(tmpdir(), "openamx-data-stale-private-"));
		const stateDirectory = join(root, ".openamx");
		const entry = join(root, "report.amx");
		const schemaModule = join(root, "schema.amx");
		const privateData = join(privateRoot, "rows.json");
		mkdirSync(stateDirectory, { mode: 0o700 });
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: {} }));
		writeFileSync(join(stateDirectory, "local.json"), JSON.stringify({ version: 1, inputs: { rows: privateData } }), { mode: 0o600 });
		if (process.platform !== "win32") chmodSync(join(stateDirectory, "local.json"), 0o600);
		writeFileSync(schemaModule, "```amx\nexport type Row {\n  id: String\n  amount: Number\n}\n```\n");
		writeFileSync(entry, "```amx\nimport { Row } from \"./schema.amx\"\ninput rows: Row[]\n```\n");
		writeFileSync(privateData, '[{"id":"A","amount":1}]');
		const service = createDesktopService(root);
		try {
			await service.request.openDocument({ path: entry });
			const opened = await service.request.openMappedInput({ name: "rows" });
			if (!opened.ok) throw new Error(opened.error.message);
			const workbench = await service.request.getWorkbench();
			if (!workbench.ok || !workbench.state.requestIdentity) throw new Error("Mapped data identity is unavailable.");
			const starting = service.request.startJob({ operation: "validate-data", identity: workbench.state.requestIdentity });
			const editingOwner = service.request.updateBuffer({ path: entry, text: "```amx\nimport { Row } from \"./schema.amx\"\ninput rows: Row[]\n```\n\n" });
			const [started, edited] = await Promise.all([starting, editingOwner]);
			expect(edited.ok).toBe(true);
			if (!started.ok) throw new Error(started.error.message);
			const result = await service.request.getJob({ jobId: started.job.identity.jobId });
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.job.status).toBe("superseded");
				expect(result.job.result).toBeUndefined();
			}
			expect(readFileSync(privateData, "utf8")).toBe('[{"id":"A","amount":1}]');
		} finally {
			rmSync(root, { recursive: true, force: true });
			rmSync(privateRoot, { recursive: true, force: true });
		}
	});

	it("keeps failed mapped-data diagnostics free of private paths and source contents", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-data-diagnostic-project-"));
		const privateRoot = mkdtempSync(join(tmpdir(), "openamx-data-diagnostic-private-"));
		const stateDirectory = join(root, ".openamx");
		const entry = join(root, "report.amx");
		const schemaModule = join(root, "schema.amx");
		const privateData = join(privateRoot, "rows.json");
		const privateContent = '[{"id":"PRIVATE_CONTENT_SENTINEL","amount":"not-a-number"}]';
		mkdirSync(stateDirectory, { mode: 0o700 });
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: {} }));
		writeFileSync(join(stateDirectory, "local.json"), JSON.stringify({ version: 1, inputs: { rows: privateData } }), { mode: 0o600 });
		if (process.platform !== "win32") chmodSync(join(stateDirectory, "local.json"), 0o600);
		writeFileSync(schemaModule, "```amx\nexport type Row {\n  id: String\n  amount: Number\n}\n```\n");
		writeFileSync(entry, "```amx\nimport { Row } from \"./schema.amx\"\ninput rows: Row[]\n```\n");
		writeFileSync(privateData, privateContent);
		const service = createDesktopService(root);
		try {
			await service.request.openDocument({ path: entry });
			const opened = await service.request.openMappedInput({ name: "rows" });
			if (!opened.ok) throw new Error(opened.error.message);
			const workbench = await service.request.getWorkbench();
			if (!workbench.ok || !workbench.state.requestIdentity) throw new Error("Mapped data identity is unavailable.");
			const started = await service.request.startJob({ operation: "validate-data", identity: workbench.state.requestIdentity });
			if (!started.ok) throw new Error(started.error.message);
			let job = started.job;
			for (let attempt = 0; job.status === "running" && attempt < 100; attempt++) {
				await new Promise(resolve => setTimeout(resolve, 5));
				const polled = await service.request.getJob({ jobId: job.identity.jobId });
				if (!polled.ok) throw new Error(polled.error.message);
				job = polled.job;
			}
			expect(job.status).toBe("succeeded");
			expect(job.result).toMatchObject({ kind: "data-validation", valid: false });
			expect(job.diagnostics.length).toBeGreaterThan(0);
			expect(JSON.stringify(job)).not.toContain(privateData);
			expect(JSON.stringify(job)).not.toContain("PRIVATE_CONTENT_SENTINEL");
		} finally {
			rmSync(root, { recursive: true, force: true });
			rmSync(privateRoot, { recursive: true, force: true });
		}
	});

	it("cancels external autosave on discard and saves before closing on request", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-data-close-project-"));
		const privateRoot = mkdtempSync(join(tmpdir(), "openamx-data-close-private-"));
		const stateDirectory = join(root, ".openamx");
		const entry = join(root, "report.amx");
		const privateData = join(privateRoot, "rows.csv");
		const originalText = "id,value\nA,1\n";
		mkdirSync(stateDirectory, { mode: 0o700 });
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: {} }));
		writeFileSync(join(stateDirectory, "local.json"), JSON.stringify({ version: 1, inputs: { rows: privateData } }), { mode: 0o600 });
		if (process.platform !== "win32") chmodSync(join(stateDirectory, "local.json"), 0o600);
		writeFileSync(entry, "```amx\ninput rows: Row[]\n```\n");
		writeFileSync(privateData, originalText);
		const service = createDesktopService(root);
		try {
			await service.request.openDocument({ path: entry });
			await service.request.setAutosave({ enabled: true, delayMs: 100 });
			const first = await service.request.openMappedInput({ name: "rows" });
			if (!first.ok) throw new Error(first.error.message);
			const discardText = "id,value\nDiscarded,2\n";
			expect((await service.request.updateBuffer({ path: first.document.path, text: discardText })).ok).toBe(true);
			const discarded = await service.request.closeTab({ path: first.document.path, action: "discard" });
			expect(discarded.ok).toBe(true);
			await new Promise(resolve => setTimeout(resolve, 150));
			expect(readFileSync(privateData, "utf8")).toBe(originalText);
			const second = await service.request.openMappedInput({ name: "rows" });
			if (!second.ok) throw new Error(second.error.message);
			const savedText = "id,value\nSaved,3\n";
			expect((await service.request.updateBuffer({ path: second.document.path, text: savedText })).ok).toBe(true);
			const closed = await service.request.closeTab({ path: second.document.path, action: "save" });
			expect(closed.ok).toBe(true);
			if (closed.ok) expect(JSON.stringify(closed.state)).not.toContain(privateData);
			expect(readFileSync(privateData, "utf8")).toBe(savedText);
		} finally {
			rmSync(root, { recursive: true, force: true });
			rmSync(privateRoot, { recursive: true, force: true });
		}
	});

	it("opens and atomically saves a bounded 100,000-row CSV above the AMX text limit", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-data-100k-"));
		const stateDirectory = join(root, ".openamx");
		const csvPath = join(root, "rows.csv");
		mkdirSync(stateDirectory, { mode: 0o700 });
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: {} }));
		const csv = `asset,status,value\n${Array.from({ length: 100_000 }, (_, index) => `ASSET-${String(index + 1).padStart(6, "0")},Active,${(index % 997) / 10}`).join("\n")}\n`;
		writeFileSync(csvPath, csv);
		const service = createDesktopService(root);
		try {
			const opened = await service.request.openDocument({ path: csvPath });
			expect(opened.ok).toBe(true);
			if (!opened.ok) throw new Error(opened.error.message);
			expect(opened.document.text.length).toBeGreaterThan(2_000_000);
			await service.request.setAutosave({ enabled: false, delayMs: 500 });
			const updatedText = `${opened.document.text}ASSET-100001,Active,1\n`;
			const updated = await service.request.updateBuffer({ text: updatedText });
			expect(updated.ok).toBe(true);
			const saved = await service.request.saveDocument();
			expect(saved.ok).toBe(true);
			expect(readFileSync(csvPath, "utf8")).toBe(updatedText);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});

	it("inspects visible measurement units before evaluation on an in-memory data path", async () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-measurement-schema-"));
		const stateDirectory = join(root, ".openamx");
		const units = join(root, "units.amx");
		const entry = join(root, "report.amx");
		mkdirSync(stateDirectory, { mode: 0o700 });
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({ version: 1, inputs: {} }));
		writeFileSync(units, `\`\`\`amx
export dimension Length
export unit meter: Length
export unit kilometer = 1000 * meter
let divisor = 0
let mustNotEvaluate = 1 meter / divisor
\`\`\`
`);
		writeFileSync(entry, `\`\`\`amx
import { Length, meter, kilometer } from "./units.amx"
input distance: Length
export let outputs: Length[] = [1 kilometer]
\`\`\`
`);
		const service = createDesktopService(root);
		try {
			await service.request.openDocument({ path: entry });
			const workbench = await service.request.getWorkbench();
			expect(workbench.ok).toBe(true);
			if (!workbench.ok || !workbench.state.requestIdentity) throw new Error("Entry identity is unavailable.");
			const started = await service.request.startJob({
				operation: "validate-data",
				identity: workbench.state.requestIdentity,
				inputInspection: { name: "distance", format: "json", text: '{"value":2,"unit":"kilometer"}' }
			});
			expect(started.ok).toBe(true);
			if (!started.ok) throw new Error(started.error.message);
			let job = started.job;
			for (let attempt = 0; job.status === "running" && attempt < 100; attempt++) {
				await new Promise(resolve => setTimeout(resolve, 5));
				const polled = await service.request.getJob({ jobId: job.identity.jobId });
				if (!polled.ok) throw new Error(polled.error.message);
				job = polled.job;
			}
			expect(job.status).toBe("succeeded");
			expect(job.result).toMatchObject({
				kind: "data-validation",
				valid: true,
				schema: {
					name: "distance",
					measurement: { dimension: "Length", visibleUnits: ["kilometer", "meter"] }
				},
				outputs: [{
					name: "outputs",
					measurements: [{ path: "$", dimension: "Length", visibleUnits: ["kilometer", "meter"] }]
				}]
			});
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});