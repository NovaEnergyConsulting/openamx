import { ref } from "vue";
import { editorCompletionFacts, prepareEditorCompletion } from "../../../../src/editor/completion";
import { editorHighlightFacts } from "../../../../src/editor/highlighting";
import type { EditorModuleAnalysis } from "../../../../src/editor/moduleAnalysis";
import { editorSymbolFacts } from "../../../../src/editor/symbols";
import { parseDocumentText } from "../../../../src/parser/parseDocument";
import { checkDocument } from "../../../../src/typechecker/checkDocument";
import type { DesktopRPCClient, DesktopJobIdentity, DesktopJobSnapshot, DesktopJobResult, OpenDocument, TextAnalysis, TextDiagnostic, WorkbenchState } from "../../../src/shared/rpc";

const projectRoot = "/sprint042-browser-fixture";
let activePath = `${projectRoot}/report.amx`;
const secondPath = `${projectRoot}/second.amx`;
let documentRevision = 0;
let generation = 0;
let inputSettingsRevision = 0;
let currentText = "# Sprint 042 report\n\n```amx\nexport let result: Number = 3\n```\n";
let savedText = currentText;
let lastAnalysis: TextAnalysis | undefined;
let autosaveDelayMs = 500;
let autosaveTimer: ReturnType<typeof setTimeout> | undefined;
let previewCompletions = 0;
let previewAutosavedAtCompletion: boolean[] = [];
let previewStartedAt: number[] = [];
let previewNavigationCalls: Array<{ targetId: string; previewToken: string }> = [];
let windowsExplorerPathFixture = false;
let lastOpenedPath = "";
let inputSettingsKey = "[]";
let nextJobId = 0;
let selectedId = 0;
const jobs = new Map<number, DesktopJobSnapshot>();
export const failNextPreview = ref(false);

function analyzeSingleDocument(document: ReturnType<typeof parseDocumentText>, file: string): EditorModuleAnalysis {
	return {
		document,
		importedTypes: new Map(),
		importedEnums: new Map(),
		importedFunctions: new Map(),
		importedBindings: new Map(),
		importedDimensions: new Map(),
		importedUnits: new Map(),
		...checkDocument(document, file, { moduleIdentity: file })
	};
}

function locatedDiagnostic(value: unknown, file: string): TextDiagnostic | undefined {
	if (typeof value !== "object" || value === null) return undefined;
	const diagnostic = value as { code?: unknown; message?: unknown; file?: unknown; line?: unknown; column?: unknown };
	if (typeof diagnostic.code !== "string" || typeof diagnostic.message !== "string") return undefined;
	return {
		code: diagnostic.code,
		message: diagnostic.message,
		file: typeof diagnostic.file === "string" ? diagnostic.file : file,
		line: typeof diagnostic.line === "number" ? diagnostic.line : undefined,
		column: typeof diagnostic.column === "number" ? diagnostic.column : undefined
	};
}

function analysisDiagnostic(error: unknown, file: string): TextDiagnostic[] {
	if (typeof error === "object" && error !== null) {
		const diagnostics = (error as { diagnostics?: unknown }).diagnostics;
		if (Array.isArray(diagnostics)) {
			const located = diagnostics.slice(0, 100)
				.map(item => locatedDiagnostic(item, file))
				.filter((item): item is TextDiagnostic => item !== undefined);
			if (located.length) return located;
		}
	}
	const located = locatedDiagnostic(error, file);
	if (located) return [located];
	const message = error instanceof Error ? error.message : String(error);
	const location = message.match(/\bat (\d+):(\d+)/);
	return [{
		code: "AMX3001",
		message,
		file,
		line: location ? Number(location[1]) : undefined,
		column: location ? Number(location[2]) : undefined
	}];
}

function analyzeBufferText(text: string, file: string, cursorOffset?: number): TextAnalysis {
	let moduleAnalysis: EditorModuleAnalysis | undefined;
	let parsedDocument: ReturnType<typeof parseDocumentText> | undefined;
	let analysisError: unknown;
	try {
		parsedDocument = parseDocumentText(text);
		try { moduleAnalysis = analyzeSingleDocument(parsedDocument, file); }
		catch (error) { analysisError = error; }
	} catch (error) {
		analysisError = error;
	}

	let completions: string[] = [];
	if (cursorOffset !== undefined) {
		const offset = Math.max(0, Math.min(text.length, cursorOffset));
		const prepared = prepareEditorCompletion(text, offset);
		if (prepared) {
			try {
				const completionAnalysis = prepared.text === text && moduleAnalysis
					? moduleAnalysis : analyzeSingleDocument(prepared.document, file);
				completions = editorCompletionFacts(prepared.text, offset, prepared.document, completionAnalysis, text)
					.map(item => item.label).slice(0, 200);
			} catch { completions = []; }
		}
	}

	return {
		diagnostics: analysisError ? analysisDiagnostic(analysisError, file) : [],
		completions,
		highlights: parsedDocument ? editorHighlightFacts(text, parsedDocument).slice(0, 20_000) : [],
		symbols: moduleAnalysis ? editorSymbolFacts(text, file, moduleAnalysis.document, moduleAnalysis).slice(0, 20_000) : []
	};
}

function identity(): WorkbenchState["requestIdentity"] {
	return {
		canonicalActiveUri: `file://${activePath}`,
		projectGeneration: generation,
		documentRevision,
		inputSettingsRevision
	};
}

function state(): WorkbenchState {
	return {
		tabs: [{ path: activePath, kind: "amx", dirty: false, conflict: false, revision: documentRevision }],
		active: activePath, generation, inputSettingsRevision, requestIdentity: identity()
	};
}

function document(): OpenDocument {
	return { path: activePath, kind: "amx", text: currentText, diskHash: "fixture", dirty: documentRevision > 0, conflict: false, revision: documentRevision };
}

function finishJob(operation: string, requestIdentity: NonNullable<WorkbenchState["requestIdentity"]>): DesktopJobSnapshot {
	const jobIdentity: DesktopJobIdentity = { ...requestIdentity, jobId: ++nextJobId };
	let result: DesktopJobResult | undefined;
	let diagnostics: DesktopJobSnapshot["diagnostics"] = [];
	let status: DesktopJobSnapshot["status"] = operation === "preview" ? "running" : "succeeded";
	if (operation === "discover-outputs") result = { kind: "output-discovery", outputs: [{ name: "result", type: "Number", formats: ["json"] }] };
	else if (operation === "preview") {
		const previewSource = currentText;
		const pending: DesktopJobSnapshot = { identity: jobIdentity, operation: "preview", status, cleanupPending: false, diagnostics, result };
		const previewToken = jobIdentity.jobId.toString(16).padStart(64, "0");
		jobs.set(jobIdentity.jobId, pending);
		setTimeout(() => {
			previewCompletions++;
			previewAutosavedAtCompletion.push(savedText === previewSource);
			if (failNextPreview.value) {
				failNextPreview.value = false;
				pending.status = "failed";
				pending.diagnostics = [{ code: "AMX3001", message: "Simulated current-buffer diagnostic", file: activePath, line: 3, column: 1 }];
			} else {
				const value = previewSource.match(/export let result: Number = (\d+)/)?.[1] ?? "unknown";
				pending.status = "succeeded";
				const navigation = previewSource.includes("Preview navigation fixture")
					? `<h2 id="inside">Inside</h2><a href="#" data-openamx-target="eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee">Open external link</a><a href="#inside">Internal anchor</a>`
					: "";
				const bootstrap = `<script nonce="fixture-nonce">(()=>{const token=${JSON.stringify(previewToken)};let port;window.addEventListener("message",event=>{const data=event.data;if(event.source!==parent||!data||data.type!=="openamx-preview-init"||data.previewToken!==token||event.ports.length!==1)return;port=event.ports[0];port.start()},{once:true});document.addEventListener("click",event=>{const source=event.target;if(!(source instanceof Element))return;const link=source.closest("a[data-openamx-target]");if(!link)return;event.preventDefault();if(!event.isTrusted||!navigator.userActivation?.isActive||!port)return;const targetId=link.getAttribute("data-openamx-target");if(!targetId)return;port.postMessage({version:1,type:"navigate",previewToken:token,targetId})},true)})();</script>`;
				pending.result = {
					kind: "preview", previewToken,
					html: `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-fixture-nonce'; img-src data:; connect-src 'none'">${bootstrap}</head><body><h1>Current preview</h1><p>${value}</p>${navigation}</body></html>`
				};
			}
		}, 250);
		return pending;
	} else if (operation === "run") result = { kind: "run", summary: { values: [{ name: "result", value: 3 }] } };
	else result = { kind: "export", outputId: `mock-output-${jobIdentity.jobId}`, fileName: `report.${operation === "export-data" ? "json" : operation}`, bytes: 256, ...(operation === "export-data" ? { name: "result" } : {}) };
	const job: DesktopJobSnapshot = { identity: jobIdentity, operation: operation as DesktopJobSnapshot["operation"], status, cleanupPending: false, diagnostics, result };
	jobs.set(jobIdentity.jobId, job);
	return job;
}

const request = {
	async ping({ nonce }: { nonce: string }) { return { nonce, runtime: "bun" as const, version: "browser-harness" }; },
	async pickProject() { generation++; return { ok: true as const, cancelled: false, root: projectRoot }; },
	async pickCreateProject() { generation++; return { ok: true as const, cancelled: false, root: projectRoot }; },
	async getWorkbench() { return { ok: true as const, state: state() }; },
	async getProjectContext() { return { ok: true as const, root: projectRoot, state: state() }; },
	async listProjectFiles() {
		if (windowsExplorerPathFixture) {
			return {
				ok: true as const,
				files: [
					{ path: "report.amx", kind: "amx" as const },
					{ path: "second.amx", kind: "amx" as const },
					{ path: "libraries\\asset-management.amx", kind: "amx" as const }
				],
				folders: ["libraries"]
			};
		}
		return { ok: true as const, files: [{ path: `${projectRoot}/report.amx`, kind: "amx" as const }, { path: secondPath, kind: "amx" as const }], folders: [] };
	},
	async getRecents() { return { ok: true as const, projects: [] }; },
	async getRecovery() { return { ok: true as const, available: false, items: [] }; },
	async setAutosave({ enabled, delayMs }: { enabled: boolean; delayMs: number }) { autosaveDelayMs = delayMs; return { ok: true as const, enabled, delayMs }; },
	async readDocument() { return { ok: true as const, document: document() }; },
	async openDocument({ path }: { path: string }) {
		activePath = path;
		lastOpenedPath = path;
		if (activePath === secondPath && !currentText.includes("Second fixture")) currentText = "# Second fixture\n\n```amx\nexport let result: Number = 5\n```\n";
		else if (activePath.endsWith("/report.amx") && !currentText.includes("Sprint 042 report")) currentText = "# Sprint 042 report\n\n```amx\nexport let result: Number = 3\n```\n";
		return { ok: true as const, document: document() };
	},
	async selectTab({ path }: { path: string }) { activePath = path; return { ok: true as const, document: document() }; },
	async setInputSettings({ inputMappings, validation }: { inputMappings: string[]; validation: "aggregate" | "fail-fast" }) {
		const next = JSON.stringify({ inputMappings, validation });
		if (next !== inputSettingsKey) { inputSettingsKey = next; inputSettingsRevision++; }
		return { ok: true as const, state: state() };
	},
	async getInputConfiguration() { return { ok: true as const, configuration: { inputs: [], diagnostics: [] } }; },
	async analyzeBuffer({ cursorOffset }: { path?: string; revision?: number; cursorOffset?: number } = {}) {
		const analysis = analyzeBufferText(currentText, activePath, cursorOffset);
		lastAnalysis = analysis;
		return { ok: true as const, analysis };
	},
	async updateBuffer({ text }: { text: string }) {
		currentText = text;
		documentRevision++;
		if (autosaveTimer) clearTimeout(autosaveTimer);
		autosaveTimer = setTimeout(() => { savedText = currentText; autosaveTimer = undefined; }, autosaveDelayMs);
		return { ok: true as const, document: document() };
	},
	async startJob({ operation, identity: requestIdentity }: { operation: string; identity: NonNullable<WorkbenchState["requestIdentity"]> }) {
		if (operation === "preview") previewStartedAt.push(performance.now());
		return { ok: true as const, job: finishJob(operation, requestIdentity) };
	},
	async getJob({ jobId }: { jobId: number }) {
		const job = jobs.get(jobId);
		return job ? { ok: true as const, job } : { ok: false as const, error: { code: "MISSING", message: "Job missing" } };
	},
	async cancelJob({ jobId }: { jobId: number }) {
		const prior = jobs.get(jobId);
		if (!prior) return { ok: false as const, error: { code: "MISSING", message: "Job missing" } };
		const job = { ...prior, status: "cancelled" as const, result: undefined };
		jobs.set(jobId, job);
		return { ok: true as const, job };
	},
	async openPreviewTarget({ targetId, previewToken }: { targetId: string; previewToken: string }) {
		if (targetId !== "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" || !/^[a-f0-9]{64}$/.test(previewToken)) {
			return { ok: false as const, error: { code: "PREVIEW", message: "Preview target rejected." } };
		}
		previewNavigationCalls.push({ targetId, previewToken });
		return { ok: true as const, opened: true };
	},
	async invalidatePreviewTargets() { return { ok: true as const, invalidated: true }; },
	async pickDestination({ extension }: { extension: string }) {
		return { ok: true as const, cancelled: false, selectionId: `selection-${++selectedId}`, fileName: `report${extension}` };
	},
	async openExportedOutput() { return { ok: true as const }; },
	async setPanelSizes() { return { ok: true as const, state: state() }; },
	async saveDocument() { documentRevision++; return { ok: true as const, document: document() }; }
};

export const rpc = { request } as unknown as DesktopRPCClient;

export function setWindowsExplorerPathFixture(enabled: boolean) {
	windowsExplorerPathFixture = enabled;
}

export function harnessSnapshot() {
	return { currentText, savedText, lastOpenedPath, lastAnalysis, previewCompletions, previewStartedAt: [...previewStartedAt], previewAutosavedAtCompletion: [...previewAutosavedAtCompletion], previewNavigationCalls: [...previewNavigationCalls] };
}
