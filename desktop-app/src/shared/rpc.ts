import type { RPCSchema } from "electrobun/main";

export interface PingResponse {
	nonce: string;
	runtime: "bun";
	version: string;
}

export interface DesktopRPCError { code: string; message: string; }
export type DesktopRPCResponse<T> = { ok: true } & T | { ok: false; error: DesktopRPCError };
export interface ProjectFile { path: string; kind: "module"; }
export interface OpenDocument { path: string; text: string; diskHash: string; dirty: boolean; conflict: boolean; }
export interface TextDiagnostic { code: string; message: string; file?: string; line?: number; column?: number; inputName?: string; dataPath?: string; dataLine?: number; dataColumn?: number; }
export interface TextAnalysis {
	diagnostics: TextDiagnostic[];
	completions: string[];
}
export interface RunSummary { values: Array<{ name: string; value: string | number | boolean | null }>; }
export interface InputConfiguration {
	inputs: Array<{ name: string; source: "project" | "local" | "per-run" | "missing" }>;
	diagnostics: TextDiagnostic[];
}

export interface DesktopRPCClient {
	request: {
		ping(params: { nonce: string }): Promise<PingResponse>;
		openProject(params: { path: string }): Promise<DesktopRPCResponse<{ root: string }>>;
		openDocument(params: { path: string }): Promise<DesktopRPCResponse<{ document: OpenDocument }>>;
		listProjectFiles(): Promise<DesktopRPCResponse<{ files: ProjectFile[] }>>;
		readDocument(): Promise<DesktopRPCResponse<{ document: OpenDocument }>>;
		updateBuffer(params: { text: string }): Promise<DesktopRPCResponse<{ document: OpenDocument }>>;
		saveDocument(): Promise<DesktopRPCResponse<{ document: OpenDocument }>>;
		formatBuffer(): Promise<DesktopRPCResponse<{ text: string }>>;
		analyzeBuffer(): Promise<DesktopRPCResponse<{ analysis: TextAnalysis }>>;
		getInputConfiguration(params?: { inputMappings?: string[] }): Promise<DesktopRPCResponse<{ configuration: InputConfiguration }>>;
		runBuffer(params?: { inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }): Promise<DesktopRPCResponse<{ summary: RunSummary; diagnostics: TextAnalysis["diagnostics"] }>>;
		previewBuffer(params?: { inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }): Promise<DesktopRPCResponse<{ html: string; diagnostics: TextAnalysis["diagnostics"] }>>;
		saveHtml(params: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }): Promise<DesktopRPCResponse<{ path: string; diagnostics: TextDiagnostic[] }>>;
		exportPdf(params: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }): Promise<DesktopRPCResponse<{ path: string; bytes: number; diagnostics: TextDiagnostic[] }>>;
		exportDocx(params: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }): Promise<DesktopRPCResponse<{ path: string; bytes: number; diagnostics: TextDiagnostic[] }>>;
	};
}

export function createPingResponse(nonce: string, version: string): PingResponse {
	return { nonce, runtime: "bun", version };
}

export type DesktopRPCSchema = {
	bun: RPCSchema<{
		requests: {
			ping: {
				params: { nonce: string };
				response: PingResponse;
			};
			openProject: { params: { path: string }; response: DesktopRPCResponse<{ root: string }> };
			openDocument: { params: { path: string }; response: DesktopRPCResponse<{ document: OpenDocument }> };
			listProjectFiles: { params: Record<string, never>; response: DesktopRPCResponse<{ files: ProjectFile[] }> };
			readDocument: { params: Record<string, never>; response: DesktopRPCResponse<{ document: OpenDocument }> };
			updateBuffer: { params: { text: string }; response: DesktopRPCResponse<{ document: OpenDocument }> };
			saveDocument: { params: Record<string, never>; response: DesktopRPCResponse<{ document: OpenDocument }> };
			formatBuffer: { params: Record<string, never>; response: DesktopRPCResponse<{ text: string }> };
			analyzeBuffer: { params: Record<string, never>; response: DesktopRPCResponse<{ analysis: TextAnalysis }> };
			runBuffer: { params: { inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }; response: DesktopRPCResponse<{ summary: RunSummary; diagnostics: TextAnalysis["diagnostics"] }> };
			getInputConfiguration: { params: { inputMappings?: string[] }; response: DesktopRPCResponse<{ configuration: InputConfiguration }> };
			previewBuffer: { params: { inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }; response: DesktopRPCResponse<{ html: string; diagnostics: TextAnalysis["diagnostics"] }> };
			saveHtml: { params: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }; response: DesktopRPCResponse<{ path: string; diagnostics: TextDiagnostic[] }> };
			exportPdf: { params: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }; response: DesktopRPCResponse<{ path: string; bytes: number; diagnostics: TextDiagnostic[] }> };
			exportDocx: { params: { path: string; inputMappings?: string[]; validation?: "aggregate" | "fail-fast" }; response: DesktopRPCResponse<{ path: string; bytes: number; diagnostics: TextDiagnostic[] }> };
		};
	}>;
	webview: RPCSchema;
};