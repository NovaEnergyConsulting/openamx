import type { RPCSchema } from "electrobun/main";

export interface PingResponse {
	nonce: string;
	runtime: "bun";
	version: string;
}

export interface DesktopRPCError { code: string; message: string; }
export type DesktopRPCResponse<T> = { ok: true } & T | { ok: false; error: DesktopRPCError };
export interface DesktopRequestOptions { maxRequestTime?: number; }
export type DocumentKind = "amx" | "csv" | "json" | "settings" | "external-data" | "html-output" | "pdf-output" | "docx-output";
export type ProjectFileKind = Exclude<DocumentKind, "external-data">;
export interface ProjectFile { path: string; kind: ProjectFileKind; }
export interface TrashItem { id: string; path: string; kind: ProjectFileKind; }
export interface RecoveryItem { path: string; kind: "amx" | "csv" | "json"; }
export interface OpenDocument { path: string; kind: DocumentKind; text: string; diskHash: string; dirty: boolean; conflict: boolean; revision: number; external?: boolean; label?: string; inputName?: string; dataFormat?: "json" | "csv"; }
export interface TabState { path: string; kind: DocumentKind; dirty: boolean; conflict: boolean; revision: number; label?: string; }
export interface ActiveDocumentRequestIdentity {
	canonicalActiveUri: string;
	projectGeneration: number;
	documentRevision: number;
	inputSettingsRevision: number;
}
export interface DesktopJobIdentity extends ActiveDocumentRequestIdentity { jobId: number; }
export type DesktopJobOperation = "run" | "preview" | "html" | "pdf" | "docx" | "validate-data";
export type DesktopJobStatus = "running" | "committing" | "succeeded" | "failed" | "cancelled" | "superseded";
export interface DataInputSchema {
	name: string;
	type: string;
	acceptedFormats: Array<"json" | "csv">;
	fields?: Array<{ name: string; type: string; optional: boolean; hasDefault: boolean }>;
	truncated?: boolean;
}
export interface DataOutputSchema {
	name: string;
	type: string;
	formats: Array<"json" | "csv">;
	truncated?: boolean;
}
export interface DesktopJobResult {
	kind: "run" | "preview" | "export" | "data-validation";
	summary?: RunSummary;
	html?: string;
	path?: string;
	bytes?: number;
	valid?: boolean;
	schema?: DataInputSchema;
	outputs?: DataOutputSchema[];
	outputsTruncated?: boolean;
}
export interface DesktopJobSnapshot {
	identity: DesktopJobIdentity;
	operation: DesktopJobOperation;
	status: DesktopJobStatus;
	cleanupPending: boolean;
	stage?: string;
	result?: DesktopJobResult;
	diagnostics: TextDiagnostic[];
}
export interface WorkbenchState { tabs: TabState[]; active?: string; generation: number; inputSettingsRevision: number; requestIdentity?: ActiveDocumentRequestIdentity; }
export type TransitionAction = "save-all" | "discard-all" | "cancel";
export interface RecentProject { root: string; active?: string; explorerWidth?: number; previewWidth?: number; }
export interface TextDiagnostic { code: string; message: string; file?: string; line?: number; column?: number; inputName?: string; dataPath?: string; dataLine?: number; dataColumn?: number; }
export interface TextAnalysis {
	diagnostics: TextDiagnostic[];
	completions: string[];
	highlights?: Array<{ from: number; to: number; kind: "keyword" | "declaration" | "reference" | "field" | "type" | "literal" }>;
	symbols?: Array<{ from: number; to: number; file: string; name: string; kind: string; detail: string; declaration: boolean; target: { file: string; from: number; to: number }; origin?: string }>;
	actions?: Array<{ from: number; to: number; expected: string; replacement: string; title: string; code: string; revision: number }>;
}
export interface RunSummary { values: Array<{ name: string; value: string | number | boolean | null }>; }
export interface InputConfiguration {
	inputs: Array<{ name: string; type: string; source: "project" | "local" | "per-run" | "missing"; status: "valid" | "unvalidated" | "missing" | "invalid"; line?: number; column?: number }>;
	diagnostics: TextDiagnostic[];
	revisions?: { local: string; project: string };
}
export type ReportSettingKey = "organization" | "logo" | "logoAlt" | "accent" | "author" | "status" | "classification" | "footer" | "sourceVisible";
export type ReportSettingsValues = Partial<Record<ReportSettingKey, string | boolean | null>>;
export interface ReportSettingsSnapshot {
	project: ReportSettingsValues;
	document: ReportSettingsValues;
	effective: ReportSettingsValues;
	projectRevision: string;
	documentRevision: number;
	accentFallback: boolean;
	diagnostics: TextDiagnostic[];
}

export interface DesktopRPCClient {
	request: {
		ping(params: { nonce: string }): Promise<PingResponse>;
		openProject(params: { path: string }): Promise<DesktopRPCResponse<{ root: string }>>;
		createProject(params: { path: string; action?: TransitionAction }): Promise<DesktopRPCResponse<{ root: string; document: OpenDocument; state: WorkbenchState }>>;
		pickCreateProject(params?: Record<string, never>, options?: DesktopRequestOptions): Promise<DesktopRPCResponse<{ cancelled: boolean; root?: string }>>;
		pickProject(params?: Record<string, never>, options?: DesktopRequestOptions): Promise<DesktopRPCResponse<{ cancelled: boolean; root?: string }>>;
		pickDocument(params?: Record<string, never>, options?: DesktopRequestOptions): Promise<DesktopRPCResponse<{ cancelled: boolean; document?: OpenDocument }>>;
		pickDestination(params: { extension: ".html" | ".pdf" | ".docx" }, options?: DesktopRequestOptions): Promise<DesktopRPCResponse<{ cancelled: boolean; path?: string }>>;
		openDocument(params: { path: string }): Promise<DesktopRPCResponse<{ document: OpenDocument }>>;
		selectTab(params: { path: string }): Promise<DesktopRPCResponse<{ document: OpenDocument }>>;
		getWorkbench(): Promise<DesktopRPCResponse<{ state: WorkbenchState }>>;
		getProjectContext(): Promise<DesktopRPCResponse<{ root?: string; state: WorkbenchState }>>;
		setInputSettings(params: { inputMappings: string[]; validation: "aggregate" | "fail-fast" }): Promise<DesktopRPCResponse<{ state: WorkbenchState }>>;
		pickInputMapping(params: { name: string; expectedRevision: string }, options?: DesktopRequestOptions): Promise<DesktopRPCResponse<{ configuration: InputConfiguration; state: WorkbenchState }>>;
		clearInputMapping(params: { name: string; scope: "session" | "local" | "project"; expectedRevision?: string }): Promise<DesktopRPCResponse<{ configuration: InputConfiguration; state: WorkbenchState }>>;
		promoteInputMapping(params: { name: string; expectedLocalRevision: string; expectedProjectRevision: string }): Promise<DesktopRPCResponse<{ configuration: InputConfiguration; state: WorkbenchState }>>;
		openMappedInput(params: { name: string }): Promise<DesktopRPCResponse<{ document: OpenDocument; inputName?: string; schema?: DataInputSchema; diagnostics?: TextDiagnostic[] }>>;
		getReportSettings(): Promise<DesktopRPCResponse<{ settings: ReportSettingsSnapshot }>>;
		pickReportLogo(params: Record<string, never>, options?: DesktopRequestOptions): Promise<DesktopRPCResponse<{ cancelled: boolean; path?: string }>>;
		setProjectReportSettings(params: { values: ReportSettingsValues; expectedRevision: string }): Promise<DesktopRPCResponse<{ settings: ReportSettingsSnapshot; state: WorkbenchState }>>;
		setDocumentReportSettings(params: { values: ReportSettingsValues; expectedRevision: number }): Promise<DesktopRPCResponse<{ settings: ReportSettingsSnapshot; document: OpenDocument; state: WorkbenchState }>>;
		setAutosave(params: { enabled: boolean; delayMs: number }): Promise<DesktopRPCResponse<{ enabled: boolean; delayMs: number }>>;
		startJob(params: { operation: DesktopJobOperation; identity: ActiveDocumentRequestIdentity; destination?: string; inputInspection?: { name: string; format: "json" | "csv"; text: string } }): Promise<DesktopRPCResponse<{ job: DesktopJobSnapshot }>>;
		getJob(params: { jobId: number }): Promise<DesktopRPCResponse<{ job: DesktopJobSnapshot }>>;
		cancelJob(params: { jobId: number }): Promise<DesktopRPCResponse<{ job: DesktopJobSnapshot }>>;
		prepareTransition(params: { action: TransitionAction }): Promise<DesktopRPCResponse<{ ready: boolean; state: WorkbenchState }>>;
		confirmQuit(): Promise<DesktopRPCResponse<{ ready: boolean }>>;
		getRecents(): Promise<DesktopRPCResponse<{ projects: RecentProject[] }>>;
		clearSession(): Promise<DesktopRPCResponse<{ projects: RecentProject[] }>>;
		getRecovery(): Promise<DesktopRPCResponse<{ available: boolean; root?: string; items: RecoveryItem[] }>>;
		resolveRecovery(params: { action: "restore" | "discard" }): Promise<DesktopRPCResponse<{ root?: string; state: WorkbenchState }>>;
		restoreProject(params: { root: string }): Promise<DesktopRPCResponse<{ root: string; state: WorkbenchState }>>;
		setPanelSizes(params: { explorerWidth: number; previewWidth: number }): Promise<DesktopRPCResponse<{ state: WorkbenchState }>>;
		closeTab(params: { path: string; action: "save" | "discard" | "cancel" }): Promise<DesktopRPCResponse<{ state: WorkbenchState }>>;
		reloadTab(params: { action: "discard" | "cancel" }): Promise<DesktopRPCResponse<{ document: OpenDocument }>>;
		listProjectFiles(): Promise<DesktopRPCResponse<{ files: ProjectFile[]; folders: string[] }>>;
		createProjectFile(params: { path: string; kind: "amx" | "csv" | "json" }): Promise<DesktopRPCResponse<{ document: OpenDocument; state: WorkbenchState }>>;
		createProjectFolder(params: { path: string }): Promise<DesktopRPCResponse<{ state: WorkbenchState }>>;
		duplicateProjectFile(params: { source: string; destination: string }): Promise<DesktopRPCResponse<{ document: OpenDocument; state: WorkbenchState }>>;
		moveProjectFile(params: { source: string; destination: string }): Promise<DesktopRPCResponse<{ state: WorkbenchState }>>;
		deleteProjectFile(params: { path: string }): Promise<DesktopRPCResponse<{ state: WorkbenchState }>>;
		listTrash(): Promise<DesktopRPCResponse<{ items: TrashItem[] }>>;
		restoreTrash(params: { id: string }): Promise<DesktopRPCResponse<{ state: WorkbenchState }>>;
		emptyTrash(): Promise<DesktopRPCResponse<{ state: WorkbenchState }>>;
		readDocument(): Promise<DesktopRPCResponse<{ document: OpenDocument }>>;
		updateBuffer(params: { text: string; path?: string; sequence?: number }): Promise<DesktopRPCResponse<{ document: OpenDocument }>>;
		saveDocument(): Promise<DesktopRPCResponse<{ document: OpenDocument }>>;
		formatBuffer(): Promise<DesktopRPCResponse<{ text: string }>>;
		analyzeBuffer(params?: { path?: string; revision?: number; cursorOffset?: number }): Promise<DesktopRPCResponse<{ analysis: TextAnalysis }>>;
		renameSymbol(params: { offset: number; newName: string; expectedRevision: number }): Promise<DesktopRPCResponse<{ document: OpenDocument; state: WorkbenchState }>>;
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
			createProject: { params: { path: string; action?: TransitionAction }; response: DesktopRPCResponse<{ root: string; document: OpenDocument; state: WorkbenchState }> };
			pickCreateProject: { params: Record<string, never>; response: DesktopRPCResponse<{ cancelled: boolean; root?: string }> };
			pickProject: { params: Record<string, never>; response: DesktopRPCResponse<{ cancelled: boolean; root?: string }> };
			pickDocument: { params: Record<string, never>; response: DesktopRPCResponse<{ cancelled: boolean; document?: OpenDocument }> };
			pickDestination: { params: { extension: ".html" | ".pdf" | ".docx" }; response: DesktopRPCResponse<{ cancelled: boolean; path?: string }> };
			openDocument: { params: { path: string }; response: DesktopRPCResponse<{ document: OpenDocument }> };
			selectTab: { params: { path: string }; response: DesktopRPCResponse<{ document: OpenDocument }> };
			getWorkbench: { params: Record<string, never>; response: DesktopRPCResponse<{ state: WorkbenchState }> };
			getProjectContext: { params: Record<string, never>; response: DesktopRPCResponse<{ root?: string; state: WorkbenchState }> };
			setInputSettings: { params: { inputMappings: string[]; validation: "aggregate" | "fail-fast" }; response: DesktopRPCResponse<{ state: WorkbenchState }> };
			pickInputMapping: { params: { name: string; expectedRevision: string }; response: DesktopRPCResponse<{ configuration: InputConfiguration; state: WorkbenchState }> };
			clearInputMapping: { params: { name: string; scope: "session" | "local" | "project"; expectedRevision?: string }; response: DesktopRPCResponse<{ configuration: InputConfiguration; state: WorkbenchState }> };
			promoteInputMapping: { params: { name: string; expectedLocalRevision: string; expectedProjectRevision: string }; response: DesktopRPCResponse<{ configuration: InputConfiguration; state: WorkbenchState }> };
			openMappedInput: { params: { name: string }; response: DesktopRPCResponse<{ document: OpenDocument; inputName?: string; schema?: DataInputSchema; diagnostics?: TextDiagnostic[] }> };
			getReportSettings: { params: Record<string, never>; response: DesktopRPCResponse<{ settings: ReportSettingsSnapshot }> };
			pickReportLogo: { params: Record<string, never>; response: DesktopRPCResponse<{ cancelled: boolean; path?: string }> };
			setProjectReportSettings: { params: { values: ReportSettingsValues; expectedRevision: string }; response: DesktopRPCResponse<{ settings: ReportSettingsSnapshot; state: WorkbenchState }> };
			setDocumentReportSettings: { params: { values: ReportSettingsValues; expectedRevision: number }; response: DesktopRPCResponse<{ settings: ReportSettingsSnapshot; document: OpenDocument; state: WorkbenchState }> };
			setAutosave: { params: { enabled: boolean; delayMs: number }; response: DesktopRPCResponse<{ enabled: boolean; delayMs: number }> };
			startJob: { params: { operation: DesktopJobOperation; identity: ActiveDocumentRequestIdentity; destination?: string; inputInspection?: { name: string; format: "json" | "csv"; text: string } }; response: DesktopRPCResponse<{ job: DesktopJobSnapshot }> };
			getJob: { params: { jobId: number }; response: DesktopRPCResponse<{ job: DesktopJobSnapshot }> };
			cancelJob: { params: { jobId: number }; response: DesktopRPCResponse<{ job: DesktopJobSnapshot }> };
			prepareTransition: { params: { action: TransitionAction }; response: DesktopRPCResponse<{ ready: boolean; state: WorkbenchState }> };
			confirmQuit: { params: Record<string, never>; response: DesktopRPCResponse<{ ready: boolean }> };
			getRecents: { params: Record<string, never>; response: DesktopRPCResponse<{ projects: RecentProject[] }> };
			clearSession: { params: Record<string, never>; response: DesktopRPCResponse<{ projects: RecentProject[] }> };
			getRecovery: { params: Record<string, never>; response: DesktopRPCResponse<{ available: boolean; root?: string; items: RecoveryItem[] }> };
			resolveRecovery: { params: { action: "restore" | "discard" }; response: DesktopRPCResponse<{ root?: string; state: WorkbenchState }> };
			restoreProject: { params: { root: string }; response: DesktopRPCResponse<{ root: string; state: WorkbenchState }> };
			setPanelSizes: { params: { explorerWidth: number; previewWidth: number }; response: DesktopRPCResponse<{ state: WorkbenchState }> };
			closeTab: { params: { path: string; action: "save" | "discard" | "cancel" }; response: DesktopRPCResponse<{ state: WorkbenchState }> };
			reloadTab: { params: { action: "discard" | "cancel" }; response: DesktopRPCResponse<{ document: OpenDocument }> };
			listProjectFiles: { params: Record<string, never>; response: DesktopRPCResponse<{ files: ProjectFile[]; folders: string[] }> };
			createProjectFile: { params: { path: string; kind: "amx" | "csv" | "json" }; response: DesktopRPCResponse<{ document: OpenDocument; state: WorkbenchState }> };
			createProjectFolder: { params: { path: string }; response: DesktopRPCResponse<{ state: WorkbenchState }> };
			duplicateProjectFile: { params: { source: string; destination: string }; response: DesktopRPCResponse<{ document: OpenDocument; state: WorkbenchState }> };
			moveProjectFile: { params: { source: string; destination: string }; response: DesktopRPCResponse<{ state: WorkbenchState }> };
			deleteProjectFile: { params: { path: string }; response: DesktopRPCResponse<{ state: WorkbenchState }> };
			listTrash: { params: Record<string, never>; response: DesktopRPCResponse<{ items: TrashItem[] }> };
			restoreTrash: { params: { id: string }; response: DesktopRPCResponse<{ state: WorkbenchState }> };
			emptyTrash: { params: Record<string, never>; response: DesktopRPCResponse<{ state: WorkbenchState }> };
			readDocument: { params: Record<string, never>; response: DesktopRPCResponse<{ document: OpenDocument }> };
			updateBuffer: { params: { text: string; path?: string; sequence?: number }; response: DesktopRPCResponse<{ document: OpenDocument }> };
			saveDocument: { params: Record<string, never>; response: DesktopRPCResponse<{ document: OpenDocument }> };
			formatBuffer: { params: Record<string, never>; response: DesktopRPCResponse<{ text: string }> };
			analyzeBuffer: { params: { path?: string; revision?: number; cursorOffset?: number }; response: DesktopRPCResponse<{ analysis: TextAnalysis }> };
			renameSymbol: { params: { offset: number; newName: string; expectedRevision: number }; response: DesktopRPCResponse<{ document: OpenDocument; state: WorkbenchState }> };
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