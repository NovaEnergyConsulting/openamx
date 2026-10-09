import type { DataInputSchema, DataOutputSchema, TextDiagnostic, RunSummary } from "../shared/rpc";

export type DesktopJobOperation = "run" | "preview" | "html" | "pdf" | "docx" | "export-data" | "discover-outputs" | "validate-data";
export type DesktopJobStage = "starting" | "loading-inputs" | "evaluating" | "preparing-report" | "serializing";

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
	inputInspection?: { name: string; format: "json" | "csv"; text: string };
	dataOutput?: { name: string; format: "json" | "csv" };
}

export type WorkerJobResult =
	| { kind: "run"; summary: RunSummary; diagnostics: TextDiagnostic[] }
	| { kind: "preview"; html: string; diagnostics: TextDiagnostic[] }
	| { kind: "data-validation"; valid: boolean; schema: DataInputSchema; outputs: DataOutputSchema[]; outputsTruncated?: boolean; diagnostics: TextDiagnostic[] }
	| { kind: "output-discovery"; outputs: DataOutputSchema[]; outputsTruncated?: boolean }
	| { kind: "export"; format: "html"; data: string; bytes: number }
	| { kind: "export"; format: "pdf" | "docx"; data: ArrayBuffer; bytes: number }
	| { kind: "export"; format: "json" | "csv"; data: string; bytes: number; name: string };

export type WorkerJobMessage =
	| { kind: "progress"; jobId: number; stage: DesktopJobStage }
	| { kind: "complete"; jobId: number; result: WorkerJobResult }
	| { kind: "failed"; jobId: number; diagnostics: TextDiagnostic[] };