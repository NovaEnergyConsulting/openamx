import { ref } from "vue";
import { editorCompletionFacts, prepareEditorCompletion } from "../../../../src/editor/completion";
import { editorHighlightFacts } from "../../../../src/editor/highlighting";
import type { EditorModuleAnalysis } from "../../../../src/editor/moduleAnalysis";
import { editorSymbolFacts } from "../../../../src/editor/symbols";
import { formatAmxDocument } from "../../../../src/formatter/formatAmx";
import { parseDocumentText } from "../../../../src/parser/parseDocument";
import { checkDocument } from "../../../../src/typechecker/checkDocument";
import type { DesktopRPCClient, DesktopJobIdentity, DesktopJobSnapshot, DesktopJobResult, OpenDocument, TextAnalysis, TextDiagnostic, WorkbenchState } from "../../../src/shared/rpc";

const fixtureScenario = new URLSearchParams(window.location.search).get("scenario") ?? "";
let projectRoot = "/sprint042-browser-fixture";
let activePath = `${projectRoot}/report.amx`;
let secondPath = `${projectRoot}/second.amx`;
let cssPath = `${projectRoot}/styles.css`;
let csvPath = `${projectRoot}/data.csv`;
let jsonPath = `${projectRoot}/data.json`;
let linkedAmxPath = `${projectRoot}/linked.amx`;
const reportSource = "# Sprint 042 report\n\n```amx\nexport let result: Number = 3\n```\n";
const secondSource = "# Second fixture\n\n```amx\nexport let result: Number = 5\n```\n";
const cssSource = ".fixture { color: #123456; }\n";
const csvSource = "value\n3\n";
const jsonSource = "{\"value\":3}\n";
const recoveredSource = "# Recovered unsaved fixture\n\n```amx\nexport let result: Number = 41\n```\n";
const staleSource = "# Stale analysis fixture\n\n```amx\nexport let result: Number = \"stale\"\n```\n";
let documentRevision = 0;
let generation = 0;
let inputSettingsRevision = 0;
let hasActiveDocument = true;
let currentText = reportSource;
let savedText = currentText;
let lastAnalysis: TextAnalysis | undefined;
let autosaveDelayMs = 500;
let autosaveTimer: ReturnType<typeof setTimeout> | undefined;
let previewCompletions = 0;
let previewAutosavedAtCompletion: boolean[] = [];
let previewStartedAt: number[] = [];
let previewCompletionLog: Array<{ identity: DesktopJobIdentity; status: string; currentPath: string | null }> = [];
let analysisRequests: Array<{ path: string; revision: number; cursorOffsetProvided: boolean; identity: NonNullable<WorkbenchState["requestIdentity"]> }> = [];
let analysisCompletionLog: Array<{ path: string; revision: number; diagnosticCount: number; currentPath: string | null }> = [];
let jobRequests: Array<{ operation: string; identity: NonNullable<WorkbenchState["requestIdentity"]> }> = [];
let bufferWrites: Array<{ path: string; text: string }> = [];
let previewNavigationCalls: Array<{ targetId: string; previewToken: string }> = [];
let windowsExplorerPathFixture = false;
let projectExplorerWorkflowFixture = fixtureScenario === "project-explorer-workflows";
let lastOpenedPath = "";
const explorerCalls: Array<{ operation: string; source?: string; destination?: string; path?: string; action?: "open" | "reveal"; confirmOutboundImports?: boolean; kind?: string }> = [];
let mockTrashItems: Array<{ id: string; path: string; kind: "amx" | "csv" | "json" | "css" }> = [];
const rejectedTrashRestores = new Set<string>();
const workflowFolders = new Set<string>();
const workflowRemovedFiles = new Set<string>();
let inputSettingsKey = "[]";
let nextJobId = 0;
let selectedId = 0;
let initialFailureUsed = false;
const jobs = new Map<number, DesktopJobSnapshot>();
const createdFiles = new Map<string, { kind: "amx" | "csv" | "json" | "css"; text: string }>();
export const failNextPreview = ref(false);

function kindForPath(path: string): "amx" | "csv" | "json" | "css" {
	if (path.endsWith(".css")) return "css";
	if (path.endsWith(".csv")) return "csv";
	if (path.endsWith(".json")) return "json";
	return "amx";
}

function sourceForPath(path: string): string {
	const created = createdFiles.get(path);
	if (created) return created.text;
	if (fixtureScenario === "stale" && path.endsWith("/report.amx")) return staleSource;
	if (path === secondPath) return secondSource;
	if (path === cssPath) return cssSource;
	if (path === csvPath) return csvSource;
	if (path === jsonPath) return jsonSource;
	if (path === linkedAmxPath) return "# Linked AMX fixture\n";
	if (path.endsWith("/recovered.amx")) return recoveredSource;
	return reportSource;
}

function projectPaths(root: string) {
	projectRoot = root;
	activePath = `${root}/report.amx`;
	secondPath = `${root}/second.amx`;
	cssPath = `${root}/styles.css`;
	csvPath = `${root}/data.csv`;
	jsonPath = `${root}/data.json`;
	linkedAmxPath = `${root}/linked.amx`;
}

function workflowRelativePath(path: string): string {
	const relative = path.startsWith(`${projectRoot}/`) ? path.slice(projectRoot.length + 1) : path;
	return relative.replaceAll("\\", "/");
}

function workflowListedPath(path: string): string {
	return workflowRelativePath(path).replaceAll("/", "\\");
}

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
	if (!hasActiveDocument) return undefined;
	return {
		canonicalActiveUri: `file://${activePath}`,
		projectGeneration: generation,
		documentRevision,
		inputSettingsRevision
	};
}

function state(): WorkbenchState {
	const active = hasActiveDocument ? activePath : undefined;
	return {
		tabs: active ? [{ path: active, kind: kindForPath(active), dirty: documentRevision > 0, conflict: false, revision: documentRevision }] : [],
		active, generation, inputSettingsRevision, requestIdentity: identity()
	};
}

function document(): OpenDocument {
	return { path: activePath, kind: kindForPath(activePath), text: currentText, diskHash: "fixture", dirty: currentText !== savedText, conflict: false, revision: documentRevision };
}

function previewBootstrap(token: string): string {
	return `<script nonce="fixture-nonce">(()=>{const token=${JSON.stringify(token)};let port;let scheduled=false;const progress=()=>{const maximum=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);return maximum>0?Math.max(0,Math.min(1,window.scrollY/maximum)):0};const reportScroll=()=>{if(!port||scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;if(port)port.postMessage({version:1,type:"scroll",previewToken:token,progress:progress()})})};window.addEventListener("scroll",reportScroll,{passive:true});window.addEventListener("message",event=>{const data=event.data;if(event.source!==parent||!data||data.type!=="openamx-preview-init"||data.previewToken!==token||event.ports.length!==1)return;port=event.ports[0];port.onmessage=message=>{const value=message.data;if(!value||typeof value!=="object"||Array.isArray(value)||Object.keys(value).length!==4||value.version!==1||value.type!=="set-scroll"||value.previewToken!==token||typeof value.progress!=="number"||!Number.isFinite(value.progress)||value.progress<0||value.progress>1)return;const maximum=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);window.scrollTo(0,maximum*value.progress)};port.start()},{once:true});document.addEventListener("click",event=>{const source=event.target;if(!(source instanceof Element))return;const link=source.closest("a[data-openamx-target]");if(!link)return;event.preventDefault();if(!event.isTrusted||!navigator.userActivation?.isActive||!port)return;const targetId=link.getAttribute("data-openamx-target");if(!targetId)return;port.postMessage({version:1,type:"navigate",previewToken:token,targetId})},true)})();</script>`;
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
			if (pending.status === "cancelled" || pending.status === "superseded") {
				previewCompletionLog.push({ identity: jobIdentity, status: pending.status, currentPath: hasActiveDocument ? activePath : null });
				return;
			}
			if (failNextPreview.value || (fixtureScenario === "initial-failure" && !initialFailureUsed)) {
				failNextPreview.value = false;
				initialFailureUsed = true;
				pending.status = "failed";
				pending.diagnostics = [{ code: "AMX3001", message: "Simulated current-buffer diagnostic", file: activePath, line: 3, column: 1 }];
			} else {
				const value = previewSource.match(/export let result: Number = (\d+)/)?.[1] ?? "unknown";
				pending.status = "succeeded";
				const navigation = previewSource.includes("Preview navigation fixture")
					? `<h2 id="inside">Inside</h2><a href="#" data-openamx-target="eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee">Open external link</a><a href="#inside">Internal anchor</a>`
					: previewSource.includes("Preview AMX link fixture")
						? `<a href="#" data-openamx-target="ffffffffffffffffffffffffffffffff">Open related AMX</a>`
					: "";
				const bootstrap = previewBootstrap(previewToken);
				const scrollRows = previewSource.includes("Scroll sync fixture")
					? Array.from({ length: 120 }, (_, index) => `<p>scroll preview line ${index}</p>`).join("")
					: "";
				pending.result = {
					kind: "preview", previewToken,
					html: `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-fixture-nonce'; img-src data:; connect-src 'none'">${bootstrap}</head><body><h1>Current preview</h1><p>${value}</p>${navigation}${scrollRows}</body></html>`
				};
			}
			previewCompletionLog.push({ identity: jobIdentity, status: pending.status, currentPath: hasActiveDocument ? activePath : null });
		}, fixtureScenario === "stale" && jobIdentity.canonicalActiveUri.endsWith("/report.amx") ? 800 : 250);
		return pending;
	} else if (operation === "run") result = { kind: "run", summary: { values: [{ name: "result", value: 3 }] } };
	else if (operation === "validate-data") result = {
		kind: "data-validation", valid: true,
		schema: { name: "DataRecord", type: "JSON", acceptedFormats: ["json"], fields: [{ name: "value", type: "Number", optional: false, hasDefault: false }] }
	};
	else result = { kind: "export", outputId: `mock-output-${jobIdentity.jobId}`, fileName: `report.${operation === "export-data" ? "json" : operation}`, bytes: 256, ...(operation === "export-data" ? { name: "result" } : {}) };
	const job: DesktopJobSnapshot = { identity: jobIdentity, operation: operation as DesktopJobSnapshot["operation"], status, cleanupPending: false, diagnostics, result };
	jobs.set(jobIdentity.jobId, job);
	return job;
}

const request = {
	async ping({ nonce }: { nonce: string }) { return { nonce, runtime: "bun" as const, version: "browser-harness" }; },
	async pickProject() {
		if (projectRoot !== "/sprint042-browser-fixture") generation++;
		if (projectExplorerWorkflowFixture) {
			createdFiles.clear();
			workflowFolders.clear();
			workflowRemovedFiles.clear();
			mockTrashItems = [];
			explorerCalls.length = 0;
		}
		if (fixtureScenario === "empty") hasActiveDocument = false;
		else {
			hasActiveDocument = true;
			projectPaths("/sprint042-browser-fixture");
			currentText = reportSource;
			savedText = currentText;
			documentRevision = 0;
		}
		return { ok: true as const, cancelled: false, root: projectRoot };
	},
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
		if (projectExplorerWorkflowFixture) {
			const baseFiles = [
				{ path: "report.amx", kind: "amx" as const },
				{ path: "data.csv", kind: "csv" as const },
				{ path: "libraries\\asset-management.amx", kind: "amx" as const },
				{ path: "reports\\preview.html", kind: "html-output" as const }
			];
			return {
				ok: true as const,
				files: [
					...baseFiles.filter(file => !workflowRemovedFiles.has(workflowRelativePath(file.path))),
				...[...createdFiles].filter(([path]) => !workflowRemovedFiles.has(workflowRelativePath(path))).map(([path, file]) => ({ path: workflowListedPath(path), kind: file.kind }))
				],
				folders: ["libraries", "reports", ...workflowFolders].map(workflowListedPath)
			};
		}
		return {
			ok: true as const,
			files: [
				{ path: `${projectRoot}/report.amx`, kind: "amx" as const },
				{ path: secondPath, kind: "amx" as const },
				{ path: cssPath, kind: "css" as const },
				{ path: csvPath, kind: "csv" as const },
				{ path: jsonPath, kind: "json" as const },
				...[...createdFiles].map(([path, file]) => ({ path, kind: file.kind }))
			],
			folders: []
		};
	},
	async createProjectFile({ path, kind }: { path: string; kind: "amx" | "csv" | "json" | "css" }) {
		explorerCalls.push({ operation: "createProjectFile", path, kind });
		if (projectExplorerWorkflowFixture && path.includes("reject")) return { ok: false as const, error: { code: "CREATE_REJECTED", message: "Simulated file creation rejection." } };
		activePath = `${projectRoot}/${path}`;
		hasActiveDocument = true;
		currentText = kind === "amx" ? "# New AMX fixture\n" : "\n";
		documentRevision = 0;
		createdFiles.set(activePath, { kind, text: currentText });
		generation++;
		return { ok: true as const, document: document(), state: state() };
	},
	async createProjectFolder({ path }: { path: string }) {
		explorerCalls.push({ operation: "createProjectFolder", path });
		if (projectExplorerWorkflowFixture && path.includes("reject")) return { ok: false as const, error: { code: "CREATE_REJECTED", message: "Simulated folder creation rejection." } };
		if (projectExplorerWorkflowFixture) workflowFolders.add(workflowRelativePath(path));
		return { ok: true as const, state: state() };
	},
	async duplicateProjectFile({ source, destination }: { source: string; destination: string }) {
		explorerCalls.push({ operation: "duplicateProjectFile", source, destination });
		if (projectExplorerWorkflowFixture && destination.includes("reject")) return { ok: false as const, error: { code: "DUPLICATE_REJECTED", message: "Simulated duplicate rejection." } };
		const kind = kindForPath(source);
		activePath = `${projectRoot}/${destination}`;
		hasActiveDocument = true;
		currentText = source === activePath ? currentText : sourceForPath(source);
		documentRevision = 0;
		createdFiles.set(activePath, { kind, text: currentText });
		generation++;
		return { ok: true as const, document: document(), state: state() };
	},
	async moveProjectFile({ source, destination }: { source: string; destination: string }) {
		explorerCalls.push({ operation: "moveProjectFile", source, destination });
		if (projectExplorerWorkflowFixture && destination.includes("collision")) return { ok: false as const, error: { code: "MOVE_COLLISION", message: "Simulated destination collision." } };
		const kind = kindForPath(source);
		activePath = `${projectRoot}/${destination}`;
		hasActiveDocument = true;
		if (projectExplorerWorkflowFixture) {
			workflowRemovedFiles.add(workflowRelativePath(source));
			createdFiles.set(activePath, { kind, text: currentText });
		}
		createdFiles.set(activePath, { kind, text: currentText });
		generation++;
		return { ok: true as const, state: state() };
	},
	async deleteProjectFile({ path, confirmOutboundImports = false }: { path: string; confirmOutboundImports?: boolean }) {
		explorerCalls.push({ operation: "deleteProjectFile", path, confirmOutboundImports });
		if (path === "report.amx" && !confirmOutboundImports) return { ok: false as const, error: { code: "DESKTOP_CONFIRMATION_REQUIRED", message: "Confirm AMX import impact." } };
		mockTrashItems = [...mockTrashItems, { id: `trash-${mockTrashItems.length + 1}`, path, kind: kindForPath(path) }];
		if (projectExplorerWorkflowFixture) {
			workflowRemovedFiles.add(workflowRelativePath(path));
			if (activePath === `${projectRoot}/${workflowRelativePath(path)}`) hasActiveDocument = false;
		}
		return { ok: true as const, state: state() };
	},
	async listTrash() { explorerCalls.push({ operation: "listTrash" }); return { ok: true as const, items: [...mockTrashItems] }; },
	async restoreTrash({ id }: { id: string }) {
		explorerCalls.push({ operation: "restoreTrash", path: id });
		const item = mockTrashItems.find(candidate => candidate.id === id);
		if (projectExplorerWorkflowFixture && item?.path.includes("restore-fail") && !rejectedTrashRestores.has(id)) {
			rejectedTrashRestores.add(id);
			return { ok: false as const, error: { code: "RESTORE_REJECTED", message: "Simulated restore rejection." } };
		}
		if (projectExplorerWorkflowFixture && item) workflowRemovedFiles.delete(workflowRelativePath(item.path));
		mockTrashItems = mockTrashItems.filter(item => item.id !== id);
		return { ok: true as const, state: state() };
	},
	async emptyTrash() { explorerCalls.push({ operation: "emptyTrash" }); mockTrashItems = []; return { ok: true as const, state: state() }; },
	async openProjectItem({ path, action }: { path: string; action: "open" | "reveal" }) {
		explorerCalls.push({ operation: "openProjectItem", path, action });
		return { ok: true as const, opened: true };
	},
	async getRecents() {
		return { ok: true as const, projects: ["recent", "empty-recent"].includes(fixtureScenario) ? [{ root: "/sprint042-recent-fixture", active: "/sprint042-recent-fixture/report.amx" }] : [] };
	},
	async getRecovery() {
		const available = ["recovery", "recovery-empty"].includes(fixtureScenario);
		return { ok: true as const, available, items: available ? [{ path: "/sprint042-recovery-fixture/recovered.amx", kind: "amx" as const }] : [] };
	},
	async resolveRecovery({ action }: { action: "restore" | "discard" }) {
		if (action === "discard") return { ok: true as const, state: state() };
		projectPaths("/sprint042-recovery-fixture");
		hasActiveDocument = fixtureScenario !== "recovery-empty";
		currentText = recoveredSource;
		savedText = "# Saved recovery fixture version\n";
		documentRevision = 1;
		generation++;
		return { ok: true as const, root: projectRoot, state: state() };
	},
	async restoreProject({ root }: { root: string }) {
		projectPaths(root);
		hasActiveDocument = fixtureScenario !== "empty-recent";
		currentText = "# Recent project fixture\n\n```amx\nexport let result: Number = 23\n```\n";
		savedText = currentText;
		documentRevision = 0;
		generation++;
		return { ok: true as const, root, state: state() };
	},
	async setAutosave({ enabled, delayMs }: { enabled: boolean; delayMs: number }) { autosaveDelayMs = delayMs; return { ok: true as const, enabled, delayMs }; },
	async readDocument() { return hasActiveDocument ? { ok: true as const, document: document() } : { ok: false as const, error: { code: "NO_ACTIVE_DOCUMENT", message: "No active document" } }; },
	async formatBuffer() { return { ok: true as const, text: formatAmxDocument(currentText) }; },
	async openDocument({ path }: { path: string }) {
		const changedPath = path !== activePath;
		activePath = path;
		hasActiveDocument = true;
		lastOpenedPath = path;
		if (changedPath) documentRevision = 0;
		currentText = sourceForPath(activePath);
		savedText = currentText;
		return { ok: true as const, document: document() };
	},
	async selectTab({ path }: { path: string }) {
		const changedPath = path !== activePath;
		activePath = path;
		hasActiveDocument = true;
		if (changedPath) { currentText = sourceForPath(path); savedText = currentText; documentRevision = 0; }
		return { ok: true as const, document: document() };
	},
	async setInputSettings({ inputMappings, validation }: { inputMappings: string[]; validation: "aggregate" | "fail-fast" }) {
		const next = JSON.stringify({ inputMappings, validation });
		if (next !== inputSettingsKey) { inputSettingsKey = next; inputSettingsRevision++; }
		return { ok: true as const, state: state() };
	},
	async getInputConfiguration() {
		return {
			ok: true as const,
			configuration: {
				inputs: fixtureScenario === "mapped" ? [{ name: "sourceData", type: "Record", source: "project" as const, status: "unvalidated" as const, line: 1, column: 1 }] : [],
				diagnostics: [],
				...(fixtureScenario === "mapped" ? { revisions: { local: "local-revision", project: "project-revision" } } : {})
			}
		};
	},
	async openMappedInput({ name }: { name: string }) {
		activePath = `${projectRoot}/mapped-data.json`;
		hasActiveDocument = true;
		currentText = jsonSource;
		savedText = currentText;
		documentRevision = 0;
		generation++;
		return {
			ok: true as const,
			document: { ...document(), kind: "external-data" as const, external: true, dataFormat: "json" as const, inputName: name },
			inputName: name,
			schema: { name: "DataRecord", type: "JSON", acceptedFormats: ["json" as const], fields: [{ name: "value", type: "Number", optional: false, hasDefault: false }] },
			diagnostics: []
		};
	},
	async analyzeBuffer({ path: requestedPath, revision: requestedRevision, cursorOffset }: { path?: string; revision?: number; cursorOffset?: number } = {}) {
		const path = requestedPath ?? activePath;
		const revision = requestedRevision ?? documentRevision;
		const requestIdentity = { canonicalActiveUri: `file://${path}`, projectGeneration: generation, documentRevision: revision, inputSettingsRevision };
		analysisRequests.push({ path, revision, cursorOffsetProvided: cursorOffset !== undefined, identity: requestIdentity });
		const requestedText = sourceForPath(path);
		if (fixtureScenario === "stale" && path.endsWith("/report.amx")) await new Promise(resolve => setTimeout(resolve, 700));
		const analysis = analyzeBufferText(requestedText, path, cursorOffset);
		analysisCompletionLog.push({ path, revision, diagnosticCount: analysis.diagnostics.length, currentPath: hasActiveDocument ? activePath : null });
		lastAnalysis = analysis;
		return { ok: true as const, analysis };
	},
	async updateBuffer({ text }: { text: string }) {
		currentText = text;
		bufferWrites.push({ path: activePath, text });
		const created = createdFiles.get(activePath);
		if (created) createdFiles.set(activePath, { ...created, text });
		documentRevision++;
		if (autosaveTimer) clearTimeout(autosaveTimer);
		autosaveTimer = setTimeout(() => { savedText = currentText; autosaveTimer = undefined; }, autosaveDelayMs);
		return { ok: true as const, document: document() };
	},
	async startJob({ operation, identity: requestIdentity }: { operation: string; identity: NonNullable<WorkbenchState["requestIdentity"]> }) {
		jobRequests.push({ operation, identity: { ...requestIdentity } });
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
		prior.status = "cancelled";
		prior.result = undefined;
		jobs.set(jobId, prior);
		return { ok: true as const, job: prior };
	},
	async openPreviewTarget({ targetId, previewToken }: { targetId: string; previewToken: string }) {
		if (!["eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "ffffffffffffffffffffffffffffffff"].includes(targetId)
			|| !/^[a-f0-9]{64}$/.test(previewToken)) {
			return { ok: false as const, error: { code: "PREVIEW", message: "Preview target rejected." } };
		}
		previewNavigationCalls.push({ targetId, previewToken });
		if (targetId === "ffffffffffffffffffffffffffffffff") {
			activePath = linkedAmxPath;
			hasActiveDocument = true;
			lastOpenedPath = linkedAmxPath;
			currentText = "# Linked AMX fixture\n";
			savedText = currentText;
			documentRevision = 0;
			return { ok: true as const, opened: true, document: document() };
		}
		return { ok: true as const, opened: true };
	},
	async invalidatePreviewTargets() { return { ok: true as const, invalidated: true }; },
	async pickDestination({ extension }: { extension: string }) {
		return { ok: true as const, cancelled: false, selectionId: `selection-${++selectedId}`, fileName: `report${extension}` };
	},
	async openExportedOutput() { return { ok: true as const }; },
	async setPanelSizes() { return { ok: true as const, state: state() }; },
	async saveDocument() { documentRevision++; savedText = currentText; return { ok: true as const, document: document() }; }
};

export const rpc = { request } as unknown as DesktopRPCClient;

export function setWindowsExplorerPathFixture(enabled: boolean) {
	windowsExplorerPathFixture = enabled;
}

export function harnessSnapshot() {
	return {
		currentText,
		savedText,
		lastOpenedPath,
		lastAnalysis,
		activePath: hasActiveDocument ? activePath : null,
		projectRoot,
		generation,
		documentRevision,
		analysisRequests: [...analysisRequests],
		analysisCompletionLog: [...analysisCompletionLog],
		jobRequests: [...jobRequests],
		bufferWrites: [...bufferWrites],
		previewCompletions,
		previewStartedAt: [...previewStartedAt],
		previewAutosavedAtCompletion: [...previewAutosavedAtCompletion],
		previewCompletionLog: [...previewCompletionLog],
		previewNavigationCalls: [...previewNavigationCalls],
		explorerCalls: [...explorerCalls]
	};
}
