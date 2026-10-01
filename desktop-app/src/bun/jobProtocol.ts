import type { TextDiagnostic, RunSummary } from "../shared/rpc";

export type DesktopJobOperation = "run" | "preview" | "html" | "pdf" | "docx";
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
}

export type WorkerJobResult =
	| { kind: "run"; summary: RunSummary; diagnostics: TextDiagnostic[] }
	| { kind: "preview"; html: string; diagnostics: TextDiagnostic[] }
	| { kind: "export"; format: "html"; data: string; bytes: number }
	| { kind: "export"; format: "pdf" | "docx"; data: ArrayBuffer; bytes: number };

export type WorkerJobMessage =
	| { kind: "progress"; jobId: number; stage: DesktopJobStage }
	| { kind: "complete"; jobId: number; result: WorkerJobResult }
	| { kind: "failed"; jobId: number; diagnostics: TextDiagnostic[] };