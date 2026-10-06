/// <reference types="bun" />
import { AmxError, type AmxDiagnostic } from "../../../src/diagnostics/errors";
import { loadEntryModule } from "../../../src/runtime/moduleLoader";
import { prepareReport } from "../../../src/renderer/reportPreparation";
import { renderPreparedHtml } from "../../../src/renderer/renderHtml";
import { preparePdfReport, serializePdfReport } from "../../../src/renderer/reportPdf";
import { prepareDocxReport, serializeDocxReport } from "../../../src/renderer/reportDocx";
import { serializeOutputs } from "../../../src/runtime/outputData";
import type { TextDiagnostic, RunSummary } from "../shared/rpc";
import type { WorkerJobMessage, WorkerJobRequest, WorkerJobResult } from "./jobProtocol";

declare var self: Worker;

const MAX_TEXT = 2_000_000;
const MAX_OVERLAY_MODULES = 100;
const MAX_OVERLAY_TEXT = 20_000_000;
const MAX_HTML = 8_000_000;
const MAX_BINARY_EXPORT = 32_000_000;
const MAX_INSPECTION_TEXT = 20_000_000;
const MAX_SCHEMA_FIELDS = 500;
const MAX_SCHEMA_TEXT = 100;

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
		const diagnostics: AmxDiagnostic[] = error.diagnostics?.length ? error.diagnostics : [error];
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
	if (request.operation === "validate-data") {
		const inspection = request.inputInspection;
		if (!inspection || !/^[A-Za-z][A-Za-z0-9_]{0,99}$/.test(inspection.name)
			|| (inspection.format !== "json" && inspection.format !== "csv") || inspection.text.length > MAX_INSPECTION_TEXT)
			throw new Error("In-memory data inspection exceeds its request bounds or has an invalid input.");
	} else if (request.inputInspection) {
		throw new Error("Input inspection is valid only for a validate-data job.");
	}
}

async function execute(request: WorkerJobRequest): Promise<WorkerJobResult> {
	validateRequest(request);
	send({ kind: "progress", jobId: request.jobId, stage: "loading-inputs" });
	const loaded = await loadEntryModule(request.entryPath, {
		entryText: request.entryText,
		sourceOverlay: new Map(request.sourceOverlay),
		inputMappings: request.inputMappings,
		validation: request.validation,
		inputInspection: request.inputInspection,
		outputInspection: request.operation === "discover-outputs",
		outputMappings: request.operation === "export-data" && request.dataOutput
			? [`${request.dataOutput.name}=desktop-output.${request.dataOutput.format}`]
			: undefined
	});
	if (request.operation === "run") return { kind: "run", summary: summarize(loaded), diagnostics: [] };
	if (request.operation === "validate-data") {
		if (!loaded.inputInspection) throw new Error("Input inspection did not return schema metadata.");
		const inputSchema = loaded.inputInspection.schema;
		const fields = inputSchema.fields;
		const inputTruncated = inputSchema.name.length > MAX_SCHEMA_TEXT || inputSchema.type.length > MAX_SCHEMA_TEXT
			|| (inputSchema.measurement?.dimension.length ?? 0) > MAX_SCHEMA_TEXT
			|| (inputSchema.measurement?.visibleUnits.length ?? 0) > MAX_SCHEMA_FIELDS
			|| (fields?.length ?? 0) > MAX_SCHEMA_FIELDS
			|| !!fields?.some(field => field.name.length > MAX_SCHEMA_TEXT || field.type.length > MAX_SCHEMA_TEXT
				|| (field.measurement?.dimension.length ?? 0) > MAX_SCHEMA_TEXT
				|| (field.measurement?.visibleUnits.length ?? 0) > MAX_SCHEMA_FIELDS);
		const outputsTruncated = loaded.inputInspection.outputs.length > 100;
		return {
			kind: "data-validation",
			valid: loaded.inputInspection.valid,
			schema: {
				name: inputSchema.name.slice(0, MAX_SCHEMA_TEXT),
				type: inputSchema.type.slice(0, MAX_SCHEMA_TEXT),
				acceptedFormats: inputSchema.acceptedFormats,
				...(inputSchema.measurement ? { measurement: {
					dimension: inputSchema.measurement.dimension.slice(0, MAX_SCHEMA_TEXT),
					visibleUnits: inputSchema.measurement.visibleUnits.slice(0, MAX_SCHEMA_FIELDS)
				} } : {}),
				...(fields ? { fields: fields.slice(0, MAX_SCHEMA_FIELDS).map(field => ({
					name: field.name.slice(0, MAX_SCHEMA_TEXT), type: field.type.slice(0, MAX_SCHEMA_TEXT),
					optional: field.optional, hasDefault: field.hasDefault,
					...(field.measurement ? { measurement: {
						dimension: field.measurement.dimension.slice(0, MAX_SCHEMA_TEXT),
						visibleUnits: field.measurement.visibleUnits.slice(0, MAX_SCHEMA_FIELDS)
					} } : {})
				})) } : {}),
				...(inputTruncated ? { truncated: true } : {})
			},
			outputs: loaded.inputInspection.outputs.slice(0, 100).map(output => ({
				name: output.name.slice(0, MAX_SCHEMA_TEXT), type: output.type.slice(0, MAX_SCHEMA_TEXT),
				formats: output.formats,
				...(output.measurements ? { measurements: output.measurements.slice(0, MAX_SCHEMA_FIELDS).map(measurement => ({
					path: measurement.path.slice(0, MAX_SCHEMA_TEXT),
					dimension: measurement.dimension.slice(0, MAX_SCHEMA_TEXT),
					visibleUnits: measurement.visibleUnits.slice(0, MAX_SCHEMA_FIELDS)
				})) } : {}),
				...(output.name.length > MAX_SCHEMA_TEXT || output.type.length > MAX_SCHEMA_TEXT
					|| !!output.measurements?.some(item => item.path.length > MAX_SCHEMA_TEXT || item.dimension.length > MAX_SCHEMA_TEXT || item.visibleUnits.length > MAX_SCHEMA_FIELDS)
					|| (output.measurements?.length ?? 0) > MAX_SCHEMA_FIELDS ? { truncated: true } : {})
			})),
			...(outputsTruncated ? { outputsTruncated: true } : {}),
			diagnostics: loaded.inputInspection.diagnostics.slice(0, 100).map(item => ({
				code: item.code.slice(0, 32), message: item.message.slice(0, 1000),
				line: item.line, column: item.column, inputName: item.inputName?.slice(0, 100),
				dataPath: item.dataPath?.slice(0, 500), dataLine: item.dataLine, dataColumn: item.dataColumn
			}))
		};
	}
	if (request.operation === "discover-outputs") {
		const outputs = loaded.outputSchemas ?? [];
		return {
			kind: "output-discovery",
			outputs: outputs.slice(0, 100).map(output => ({
				name: output.name.slice(0, MAX_SCHEMA_TEXT), type: output.type.slice(0, MAX_SCHEMA_TEXT), formats: output.formats,
				...(output.measurements ? { measurements: output.measurements.slice(0, MAX_SCHEMA_FIELDS).map(measurement => ({
					path: measurement.path.slice(0, MAX_SCHEMA_TEXT),
					dimension: measurement.dimension.slice(0, MAX_SCHEMA_TEXT),
					visibleUnits: measurement.visibleUnits.slice(0, MAX_SCHEMA_FIELDS)
				})) } : {}),
				...(output.name.length > MAX_SCHEMA_TEXT || output.type.length > MAX_SCHEMA_TEXT
					|| (output.measurements?.length ?? 0) > MAX_SCHEMA_FIELDS
					|| !!output.measurements?.some(item => item.path.length > MAX_SCHEMA_TEXT || item.dimension.length > MAX_SCHEMA_TEXT || item.visibleUnits.length > MAX_SCHEMA_FIELDS)
					? { truncated: true } : {})
			})),
			...(outputs.length > 100 ? { outputsTruncated: true } : {})
		};
	}
	if (request.operation === "export-data") {
		const selection = request.dataOutput;
		if (!selection || !/^[A-Za-z][A-Za-z0-9_]{0,99}$/.test(selection.name)
			|| (selection.format !== "json" && selection.format !== "csv"))
			throw new Error("Named data export selection is invalid.");
		const output = loaded.outputs.find(item => item.name === selection.name && item.format === selection.format);
		if (!output) throw new Error(`Export '${selection.name}' is not eligible for ${selection.format.toUpperCase()}.`);
		const serialized = serializeOutputs([output], loaded.env)[0];
		if (!serialized || serialized.contents.length > MAX_BINARY_EXPORT) throw new Error(`Data output exceeds the ${MAX_BINARY_EXPORT}-character limit.`);
		return { kind: "export", format: selection.format, data: serialized.contents, bytes: Buffer.byteLength(serialized.contents), name: selection.name };
	}

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
		const transfer = result.kind === "export" && (result.format === "pdf" || result.format === "docx") ? [result.data] : [];
		send({ kind: "complete", jobId: request.jobId, result }, transfer);
	} catch (error) {
		send({ kind: "failed", jobId: request.jobId, diagnostics: failureDiagnostics(error) });
	}
	self.onmessage = null;
};