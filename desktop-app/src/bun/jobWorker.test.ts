import { expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { WorkerJobMessage, WorkerJobRequest } from "./jobProtocol";

test("trusted worker runs AMX and returns bounded path-free progress and result", async () => {
	const root = mkdtempSync(join(tmpdir(), "openamx-job-worker-"));
	const entryPath = join(root, "report.amx");
	writeFileSync(entryPath, "```amx\nexport let total: Number = 2 + 3\n```\n");
	const worker = new Worker(new URL("./jobWorker.ts", import.meta.url).href);
	const messages: WorkerJobMessage[] = [];
	let resolveComplete!: (message: WorkerJobMessage) => void;
	let rejectFailure!: (error: Error) => void;
	const completed = new Promise<WorkerJobMessage>((resolve, reject) => {
		resolveComplete = resolve;
		rejectFailure = reject;
	});
	worker.addEventListener("message", event => {
		const message = event.data as WorkerJobMessage;
		messages.push(message);
		if (message.kind === "complete") resolveComplete(message);
		if (message.kind === "failed") rejectFailure(new Error(message.diagnostics[0]?.message ?? "Worker failed."));
	});
	worker.addEventListener("error", event => rejectFailure(new Error(event.message)));

	try {
		const request: WorkerJobRequest = {
			kind: "start", jobId: 41, operation: "run", entryPath,
			entryText: "```amx\nexport let total: Number = 2 + 3\n```\n",
			projectRoot: root, sourceOverlay: [], inputMappings: [], validation: "aggregate"
		};
		worker.postMessage(request);
		const result = await Promise.race([
			completed,
			new Promise<never>((_, reject) => setTimeout(() => reject(new Error("worker job timed out")), 5000))
		]);
		expect(result.kind).toBe("complete");
		if (result.kind !== "complete") throw new Error("Expected worker completion.");
		expect(result.result).toEqual({ kind: "run", summary: { values: [{ name: "total", value: 5 }] }, diagnostics: [] });
		expect(messages[0]).toEqual({ kind: "progress", jobId: 41, stage: "loading-inputs" });
		expect(JSON.stringify(messages)).not.toContain(root);
		expect(JSON.stringify(messages).length).toBeLessThan(1024);
	} finally {
		worker.terminate();
		rmSync(root, { recursive: true, force: true });
	}
});

test("trusted worker serializes only explicitly exported compatible data bindings", async () => {
	const root = mkdtempSync(join(tmpdir(), "openamx-job-output-"));
	const entryPath = join(root, "report.amx");
	const source = "```amx\nexport let total: Number = 2 + 3\nlet privateTotal: Number = 9\n```\n";
	writeFileSync(entryPath, source);
	const worker = new Worker(new URL("./jobWorker.ts", import.meta.url).href);
	try {
		const completed = new Promise<WorkerJobMessage>((resolve, reject) => {
			worker.addEventListener("message", event => {
				const message = event.data as WorkerJobMessage;
				if (message.kind === "complete") resolve(message);
				if (message.kind === "failed") reject(new Error(message.diagnostics[0]?.message ?? "Worker failed."));
			});
			worker.addEventListener("error", event => reject(new Error(event.message)));
		});
		const request: WorkerJobRequest = {
			kind: "start", jobId: 42, operation: "export-data", entryPath, entryText: source,
			projectRoot: root, sourceOverlay: [], inputMappings: [], validation: "aggregate",
			dataOutput: { name: "total", format: "json" }
		};
		worker.postMessage(request);
		const result = await Promise.race([
			completed,
			new Promise<never>((_, reject) => setTimeout(() => reject(new Error("worker job timed out")), 5000))
		]);
		expect(result.kind).toBe("complete");
		if (result.kind !== "complete") throw new Error("Expected worker completion.");
		expect(result.result).toEqual({ kind: "export", format: "json", data: "5\n", bytes: 2, name: "total" });
		expect(JSON.stringify(result)).not.toContain("privateTotal");
	} finally {
		worker.terminate();
		rmSync(root, { recursive: true, force: true });
	}
});

test("trusted worker rejects an invalid untyped program before returning a run result", async () => {
	const root = mkdtempSync(join(tmpdir(), "openamx-job-invalid-"));
	const entryPath = join(root, "report.amx");
	const source = "```amx\nlet value = \"three\" + 1\n```\n";
	writeFileSync(entryPath, source);
	const worker = new Worker(new URL("./jobWorker.ts", import.meta.url).href);
	try {
		const completed = new Promise<WorkerJobMessage>((resolve, reject) => {
			worker.addEventListener("message", event => {
				const message = event.data as WorkerJobMessage;
				if (message.kind === "complete" || message.kind === "failed") resolve(message);
			});
			worker.addEventListener("error", event => reject(new Error(event.message)));
		});
		const request: WorkerJobRequest = {
			kind: "start", jobId: 43, operation: "run", entryPath, entryText: source,
			projectRoot: root, sourceOverlay: [], inputMappings: [], validation: "aggregate"
		};
		worker.postMessage(request);
		const result = await Promise.race([
			completed,
			new Promise<never>((_, reject) => setTimeout(() => reject(new Error("worker job timed out")), 5000))
		]);
		expect(result.kind).toBe("failed");
		if (result.kind !== "failed") throw new Error("Expected static-check failure.");
		expect(result.diagnostics[0]?.code).toBe("AMX3007");
	} finally {
		worker.terminate();
		rmSync(root, { recursive: true, force: true });
	}
});

test("trusted worker exports shared-model chart SVG in searchable PDF output", async () => {
	const root = mkdtempSync(join(tmpdir(), "openamx-worker-pdf-chart-"));
	const entryPath = join(root, "report.amx");
	const source = `# Worker chart report\n\n\`\`\`amx\ntype Row {\n  label: String\n  value: Number\n}\nlet rows: Row[] = [Row { label = "First", value = -2 }, Row { label = "Second", value = 0 }]\nchart scores = bar(rows) {\n  title: "Static PDF chart"\n  description: "Shared model worker export"\n  category: label\n  series value as "Score"\n}\nshow scores\n\`\`\``;
	writeFileSync(entryPath, source);
	const worker = new Worker(new URL("./jobWorker.ts", import.meta.url).href);
	try {
		const completed = new Promise<WorkerJobMessage>((resolve, reject) => {
			worker.addEventListener("message", event => {
				const message = event.data as WorkerJobMessage;
				if (message.kind === "complete") resolve(message);
				if (message.kind === "failed") reject(new Error(message.diagnostics[0]?.message ?? "Worker PDF export failed."));
			});
			worker.addEventListener("error", event => reject(new Error(event.message)));
		});
		const request: WorkerJobRequest = {
			kind: "start", jobId: 44, operation: "pdf", entryPath, entryText: source,
			projectRoot: root, sourceOverlay: [], inputMappings: [], validation: "aggregate"
		};
		worker.postMessage(request);
		const result = await Promise.race([
			completed,
			new Promise<never>((_, reject) => setTimeout(() => reject(new Error("worker PDF export timed out")), 10000))
		]);
		expect(result.kind).toBe("complete");
		if (result.kind !== "complete" || result.result.kind !== "export" || result.result.format !== "pdf")
			throw new Error("Expected a worker PDF export result.");
		const data = new Uint8Array(result.result.data);
		expect(data[0]).toBe(0x25);
		const pdf = await getDocument({ data, useSystemFonts: true, disableFontFace: true }).promise;
		const pages: string[] = [];
		for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
			const page = await pdf.getPage(pageNumber);
			pages.push((await page.getTextContent()).items.map(item => "str" in item ? item.str : "").join(" "));
		}
		const text = pages.join(" ");
		expect(text).toContain("Worker chart report");
		expect(text).toContain("Static PDF chart");
		expect(text).toContain("Shared model worker export");
		expect(text).toContain("First");
		expect(text).toContain("Second");
		expect(text).toContain("Score");
	} finally {
		worker.terminate();
		rmSync(root, { recursive: true, force: true });
	}
});