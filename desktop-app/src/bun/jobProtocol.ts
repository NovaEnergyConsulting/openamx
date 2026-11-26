import type { DataInputSchema, DataOutputSchema, TextDiagnostic, RunSummary } from "../shared/rpc";
import type { PreviewNavigationTarget } from "../../../src/renderer/renderHtml";
import type { TranspileResult } from "../../../src/transpiler/types";

export type DesktopJobOperation = "run" | "preview" | "html" | "pdf" | "docx" | "export-data" | "discover-outputs" | "validate-data" | "transpile";
export type DesktopJobStage = "starting" | "loading-inputs" | "evaluating" | "preparing-report" | "serializing" | "resolving-graph" | "preparing-output" | "confirming-overwrite" | "committing";

export interface WorkerJobRequest {
	kind: "start";
	jobId: number;
	operation: DesktopJobOperation;
	entryPath: string;
	entryText: string;
	projectRoot: string;
	sourceOverlay: Array<[string, string]>;
	inputMappings: string[];
	validation: "aggregate" | "fail-fast";
	pdfDestinationPath?: string;
	docxDestinationPath?: string;
	htmlDestinationPath?: string;
	inputInspection?: { name: string; format: "json" | "csv"; text: string };
	dataOutput?: { name: string; format: "json" | "csv" };
}

export type WorkerJobResult =
	| { kind: "run"; summary: RunSummary; diagnostics: TextDiagnostic[] }
	| { kind: "preview"; html: string; previewToken: string; targets: Readonly<Record<string, PreviewNavigationTarget>>; diagnostics: TextDiagnostic[] }
	| { kind: "data-validation"; valid: boolean; schema: DataInputSchema; outputs: DataOutputSchema[]; outputsTruncated?: boolean; diagnostics: TextDiagnostic[] }
	| { kind: "output-discovery"; outputs: DataOutputSchema[]; outputsTruncated?: boolean }
	| { kind: "typescript-graph"; graph: Extract<TranspileResult, { ok: true }>; moduleCount: number; bytes: number; payloadBytes: number }
	| { kind: "export"; format: "html"; data: string; bytes: number }
	| { kind: "export"; format: "pdf" | "docx"; data: ArrayBuffer; bytes: number }
	| { kind: "export"; format: "json" | "csv"; data: string; bytes: number; name: string };

export type WorkerJobMessage =
	| { kind: "progress"; jobId: number; stage: DesktopJobStage }
	| { kind: "complete"; jobId: number; result: WorkerJobResult }
	| { kind: "failed"; jobId: number; diagnostics: TextDiagnostic[] };

export const MAX_TRANSPILE_MODULES = 100;
export const MAX_TRANSPILE_GRAPH_BYTES = 32_000_000;

export function createTypeScriptGraphResult(graph: Extract<TranspileResult, { ok: true }>): Extract<WorkerJobResult, { kind: "typescript-graph" }> {
	if (!graph.modules.length || graph.modules.length > MAX_TRANSPILE_MODULES)
		throw new Error(`TypeScript graph exceeds the ${MAX_TRANSPILE_MODULES}-module limit.`);
	const bytes = graph.modules.reduce((total, module) => total + Buffer.byteLength(module.code, "utf8"), 0);
	const result = { kind: "typescript-graph" as const, graph, moduleCount: graph.modules.length, bytes, payloadBytes: 0 };
	let payloadBytes = Buffer.byteLength(JSON.stringify(result), "utf8");
	for (let attempt = 0; attempt < 4; attempt++) {
		const exactBytes = Buffer.byteLength(JSON.stringify({ ...result, payloadBytes }), "utf8");
		if (exactBytes === payloadBytes) break;
		payloadBytes = exactBytes;
	}
	if (payloadBytes > MAX_TRANSPILE_GRAPH_BYTES)
		throw new Error(`TypeScript graph payload exceeds the ${MAX_TRANSPILE_GRAPH_BYTES}-byte limit.`);
	return { ...result, payloadBytes };
}

export function isBoundedTypeScriptGraphResult(value: unknown): value is Extract<WorkerJobResult, { kind: "typescript-graph" }> {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	const result = value as Record<string, unknown>;
	if (Object.keys(result).sort().join(",") !== "bytes,graph,kind,moduleCount,payloadBytes"
		|| result.kind !== "typescript-graph" || !Number.isSafeInteger(result.bytes) || !Number.isSafeInteger(result.moduleCount)
		|| !Number.isSafeInteger(result.payloadBytes) || (result.bytes as number) < 0
		|| (result.payloadBytes as number) < 0 || (result.payloadBytes as number) > MAX_TRANSPILE_GRAPH_BYTES) return false;
	const graph = result.graph;
	if (!graph || typeof graph !== "object" || Array.isArray(graph)) return false;
	const graphRecord = graph as Record<string, unknown>;
	if (Object.keys(graphRecord).sort().join(",") !== "entryModuleId,modules,ok" || graphRecord.ok !== true
		|| typeof graphRecord.entryModuleId !== "string" || graphRecord.entryModuleId.length > 4096
		|| !Array.isArray(graphRecord.modules) || graphRecord.modules.length < 1
		|| graphRecord.modules.length > MAX_TRANSPILE_MODULES || result.moduleCount !== graphRecord.modules.length) return false;
	let codeBytes = 0;
	for (const item of graphRecord.modules) {
		if (!item || typeof item !== "object" || Array.isArray(item)) return false;
		const module = item as Record<string, unknown>;
		if (Object.keys(module).sort().join(",") !== "code,moduleId,outputPath,sourcePath"
			|| typeof module.moduleId !== "string" || !module.moduleId || module.moduleId.length > 4096
			|| typeof module.sourcePath !== "string" || module.sourcePath.length > 4096
			|| typeof module.outputPath !== "string" || !module.outputPath || module.outputPath.length > 4096
			|| module.outputPath.includes("\\") || typeof module.code !== "string") return false;
		codeBytes += Buffer.byteLength(module.code, "utf8");
	}
	if (codeBytes !== result.bytes || codeBytes > MAX_TRANSPILE_GRAPH_BYTES
		|| !graphRecord.modules.some(module => (module as Record<string, unknown>).moduleId === graphRecord.entryModuleId)) return false;
	try {
		return Buffer.byteLength(JSON.stringify(value), "utf8") === result.payloadBytes;
	} catch {
		return false;
	}
}