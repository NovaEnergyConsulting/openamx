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
export interface TextAnalysis {
	diagnostics: Array<{ code: string; message: string; file?: string; line?: number; column?: number }>;
	completions: string[];
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
		previewBuffer(): Promise<DesktopRPCResponse<{ html: string; diagnostics: TextAnalysis["diagnostics"] }>>;
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
			previewBuffer: { params: Record<string, never>; response: DesktopRPCResponse<{ html: string; diagnostics: TextAnalysis["diagnostics"] }> };
		};
	}>;
	webview: RPCSchema;
};