/// <reference types="bun" />
import { AmxError } from "../../../src/diagnostics/errors";
import { loadEntryModule } from "../../../src/runtime/moduleLoader";
import { prepareReport } from "../../../src/renderer/reportPreparation";
import { renderPreparedHtml } from "../../../src/renderer/renderHtml";
import { preparePdfReport, serializePdfReport } from "../../../src/renderer/reportPdf";
import { prepareDocxReport, serializeDocxReport } from "../../../src/renderer/reportDocx";
import type { TextDiagnostic, RunSummary } from "../shared/rpc";
import type { WorkerJobMessage, WorkerJobRequest, WorkerJobResult } from "./jobProtocol";

declare var self: Worker;

const MAX_TEXT = 2_000_000;
const MAX_OVERLAY_MODULES = 100;
const MAX_OVERLAY_TEXT = 20_000_000;
const MAX_HTML = 8_000_000;
const MAX_BINARY_EXPORT = 32_000_000;

function send(message: WorkerJobMessage, transfer: Transferable[] = []): void {
	self.postMessage(message, transfer);
}

function summarize(loaded: Awaited<ReturnType<typeof loadEntryModule>>): RunSummary {
	const inputs = new Set<string>();
	for (const node of loaded.doc.nodes) {
		if (node.type !== "executableCodeBlock") continue;
		for (const statement of node.statements) if (statement.type === "inputDeclaration") inputs.add(statement.name);
	}
	const values: RunSummary["values"] = [];
	for (const [name, value] of Object.entries(loaded.env.toObject())) {
		if (inputs.has(name) || values.length >= 100) continue;
		if (value === null || typeof value === "boolean" || typeof value === "number") values.push({ name, value });
		else if (typeof value === "string") values.push({ name, value: value.slice(0, 500) });
		else if (Array.isArray(value)) values.push({ name, value: `[${value.length} items]` });
		else if (typeof value === "object") values.push({ name, value: "Record" });
	}
	return { values };
}

function failureDiagnostics(error: unknown): TextDiagnostic[] {
	if (error instanceof AmxError) {
		const diagnostics = error.diagnostics?.length ? error.diagnostics : [error];
		return diagnostics.slice(0, 100).map(item => ({
			code: item.code.slice(0, 32), message: item.message.slice(0, 1000), file: item.file?.slice(0, 4096),
			line: item.line, column: item.column, inputName: item.inputName?.slice(0, 100),
			dataPath: item.dataPath?.slice(0, 500), dataLine: item.dataLine, dataColumn: item.dataColumn
		}));
	}
	return [{ code: "DESKTOP_JOB", message: (error instanceof Error ? error.message : String(error)).slice(0, 1000) }];
}

function validateRequest(request: WorkerJobRequest): void {
	if (!Number.isSafeInteger(request.jobId) || request.jobId < 1) throw new Error("Invalid worker job identity.");
	if (request.entryText.length > MAX_TEXT || request.sourceOverlay.length > MAX_OVERLAY_MODULES || request.inputMappings.length > 100)
		throw new Error("Worker request exceeds its item or document limit.");
	let overlayTextLength = 0;
	for (const [path, text] of request.sourceOverlay) {
		if (path.length > 4096 || text.length > MAX_TEXT) throw new Error("Worker overlay item exceeds its limit.");
		overlayTextLength += text.length;
	}
	if (overlayTextLength > MAX_OVERLAY_TEXT) throw new Error("Worker overlay exceeds its total text limit.");
	if (request.inputMappings.some(mapping => mapping.length > 8192)) throw new Error("Worker input mapping exceeds its limit.");
}

async function execute(request: WorkerJobRequest): Promise<WorkerJobResult> {
	validateRequest(request);
	send({ kind: "progress", jobId: request.jobId, stage: "loading-inputs" });
	const loaded = await loadEntryModule(request.entryPath, {
		entryText: request.entryText,
		sourceOverlay: new Map(request.sourceOverlay),
		inputMappings: request.inputMappings,
		validation: request.validation
	});
	if (request.operation === "run") return { kind: "run", summary: summarize(loaded), diagnostics: [] };

	send({ kind: "progress", jobId: request.jobId, stage: "preparing-report" });
	const prepared = await prepareReport(loaded.doc, loaded.env, { file: request.entryPath, projectRoot: request.projectRoot });
	if (request.operation === "preview" || request.operation === "html") {
		const html = renderPreparedHtml(prepared);
		if (html.length > MAX_HTML) throw new Error(`HTML output exceeds the ${MAX_HTML}-character limit.`);
		return request.operation === "preview"
			? { kind: "preview", html, diagnostics: [] }
			: { kind: "export", format: "html", data: html, bytes: Buffer.byteLength(html) };
	}

	send({ kind: "progress", jobId: request.jobId, stage: "serializing" });
	const bytes = request.operation === "pdf"
		? await serializePdfReport(preparePdfReport(prepared))
		: await serializeDocxReport(prepareDocxReport(prepared));
	if (bytes.length > MAX_BINARY_EXPORT) throw new Error(`Report output exceeds the ${MAX_BINARY_EXPORT}-byte limit.`);
	const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
	return { kind: "export", format: request.operation, data, bytes: bytes.length };
}

self.onmessage = async (event: MessageEvent<WorkerJobRequest>) => {
	const request = event.data;
	try {
		const result = await execute(request);
		const transfer = result.kind === "export" && result.format !== "html" ? [result.data] : [];
		send({ kind: "complete", jobId: request.jobId, result }, transfer);
	} catch (error) {
		send({ kind: "failed", jobId: request.jobId, diagnostics: failureDiagnostics(error) });
	}
	self.onmessage = null;
};