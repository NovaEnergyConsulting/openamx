<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { DesktopRPCClient, InputConfiguration, OpenDocument, ProjectFile, RecentProject, RunSummary, TextAnalysis, TextDiagnostic, WorkbenchState } from "../shared/rpc";
import { Button } from "@/components/ui/button";
import CodeEditor from "./CodeEditor.vue";
import CommandPalette from "./components/CommandPalette.vue";
import ProjectExplorer from "./components/ProjectExplorer.vue";
import WelcomeView from "./components/WelcomeView.vue";
import WorkbenchTabs from "./components/WorkbenchTabs.vue";
import type { DrawerDock, ShellCommand, ShellFocusMode, ShellTheme } from "./shell";

const props = defineProps<{ rpc: DesktopRPCClient }>();
const document = ref<OpenDocument | null>(null);
const workbench = ref<WorkbenchState>({ tabs: [], generation: 0, inputSettingsRevision: 0 });
const projectRoot = ref("");
const recents = ref<RecentProject[]>([]);
const palette = ref(false);
const focusMode = ref<ShellFocusMode>("none");
const drawerDock = ref<DrawerDock>((localStorage.getItem("openamx.drawer-dock") as DrawerDock) || "bottom");
const theme = ref<ShellTheme>((localStorage.getItem("openamx.theme") as ShellTheme) || "system");
const explorerWidth = ref(220);
const previewWidth = ref(44);
const editorElement = ref<InstanceType<typeof CodeEditor> | null>(null);
let invoker: HTMLElement | null = null;
let focusInvoker: HTMLElement | null = null;
const preview = ref("");
const analysis = ref<TextAnalysis>({ diagnostics: [], completions: [] });
const staticAnalysis = ref<TextAnalysis>({ diagnostics: [], completions: [] });
const inputConfiguration = ref<InputConfiguration>({ inputs: [], diagnostics: [] });
const inputOverrides = ref("");
const validation = ref<"aggregate" | "fail-fast">("aggregate");
const summary = ref<RunSummary>({ values: [] });
const runState = ref<"idle" | "running" | "success" | "failure" | "cancelled" | "stale">("idle");
const previewState = ref<"idle" | "running" | "success" | "failure" | "cancelled" | "stale">("idle");
const activeJobId = ref<number | null>(null);
const jobStage = ref("");
const exportStatus = ref("");
const files = ref<ProjectFile[]>([]);
const status = ref("Open a project and an .amx file to begin.");
const pending = ref(false);
let bufferRevision = 0;
let previewRequest = 0;
let runRequest = 0;
let exportRequest = 0;
let navigationRequest = 0;
let staticRequest = 0;
let pendingEdit: Promise<void> = Promise.resolve();
let pendingInputSettings: Promise<void> = Promise.resolve();

function mappings(): string[] { return inputOverrides.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean); }
function syncInputSettings(): Promise<void> {
	const inputMappings = mappings();
	const selectedValidation = validation.value;
	pendingInputSettings = pendingInputSettings.then(async () => {
		const result = await props.rpc.request.setInputSettings({ inputMappings, validation: selectedValidation });
		if (result.ok) workbench.value = result.state;
	});
	return pendingInputSettings;
}
function cancelActiveJob() { const jobId = activeJobId.value; if (jobId === null) return; activeJobId.value = null; jobStage.value = ""; void props.rpc.request.cancelJob({ jobId }); }
async function executeJob(operation: "run" | "preview" | "html" | "pdf" | "docx", destination?: string) {
	await pendingEdit; await pendingInputSettings; if (!workbench.value.requestIdentity) await syncWorkbench();
	const identity = workbench.value.requestIdentity; if (!identity) throw new Error("Open an active AMX document before starting a job.");
	const started = await props.rpc.request.startJob({ operation, identity, destination }); if (!started.ok) throw new Error(started.error.message);
	let job = started.job; const jobId = job.identity.jobId; activeJobId.value = jobId; jobStage.value = job.stage ?? "";
	for (let attempt = 0; ["running", "committing"].includes(job.status) && attempt < 600; attempt++) {
		await new Promise(resolve => setTimeout(resolve, 50)); if (activeJobId.value !== jobId) return undefined;
		const polled = await props.rpc.request.getJob({ jobId }); if (!polled.ok) throw new Error(polled.error.message); job = polled.job; jobStage.value = job.stage ?? "";
	}
	if (["running", "committing"].includes(job.status)) { void props.rpc.request.cancelJob({ jobId }); throw new Error("The desktop job did not complete before its polling limit."); }
	if (activeJobId.value === jobId) activeJobId.value = null; jobStage.value = ""; return job;
}

function isCurrent(revision: number): boolean {
	return revision === bufferRevision;
}

function resetResults() {
	summary.value = { values: [] };
	runState.value = "idle";
	exportRequest++;
	exportStatus.value = "";
}

function invalidateInputResults() {
	cancelActiveJob();
	bufferRevision++;
	previewRequest++;
	pending.value = false;
	resetResults();
	preview.value = "";
	previewState.value = "idle";
}

function validationChanged() {
	invalidateInputResults();
	void syncInputSettings().then(() => refresh());
}

function inputMappingsChanged() {
	invalidateInputResults();
	void syncInputSettings();
}

async function syncWorkbench() {
	const result = await props.rpc.request.getWorkbench();
	if (result.ok) workbench.value = result.state;
}

async function syncRecents() {
	const result = await props.rpc.request.getRecents();
	if (result.ok) recents.value = result.projects;
}

async function loadProject() {
	const listing = await props.rpc.request.listProjectFiles();
	files.value = listing.ok ? listing.files : [];
	await syncWorkbench();
	await syncRecents();
	return listing.ok ? undefined : listing.error.message;
}

async function restore(root: string) {
	if (root === projectRoot.value) return;
	await pendingEdit;
	const request = ++navigationRequest;
	const recent = recents.value.find(item => item.root === root);
	const result = await props.rpc.request.restoreProject({ root });
	if (request !== navigationRequest) return;
	if (!result.ok) { if (result.error.code !== "DESKTOP_CANCELLED") status.value = result.error.message; await syncRecents(); return; }
	clearView();
	inputOverrides.value = "";
	projectRoot.value = result.root;
	explorerWidth.value = recent?.explorerWidth ?? 220;
	previewWidth.value = recent?.previewWidth ?? 44;
	await loadProject();
	if (result.state.active) {
		const active = await props.rpc.request.selectTab({ path: result.state.active });
		if (active.ok) document.value = active.document;
	} else document.value = null;
	status.value = "Project restored without unsaved text or report results.";
}

async function clearRecents() {
	const result = await props.rpc.request.clearSession();
	if (result.ok) recents.value = result.projects;
}

function setFocusMode(mode: "none" | "editor" | "preview") {
	const next = focusMode.value === mode ? "none" : mode;
	if (focusMode.value === "none" && next !== "none") focusInvoker = window.document.activeElement instanceof HTMLElement ? window.document.activeElement : null;
	focusMode.value = next;
	if (focusMode.value === "editor") requestAnimationFrame(() => editorElement.value?.focus());
	else if (focusMode.value === "preview") requestAnimationFrame(() => window.document.querySelector<HTMLIFrameElement>(".preview-pane iframe")?.focus());
	else focusInvoker?.focus();
}

async function resizeExplorer(delta: number) {
	explorerWidth.value = Math.max(160, Math.min(400, explorerWidth.value + delta));
	await props.rpc.request.setPanelSizes({ explorerWidth: explorerWidth.value, previewWidth: previewWidth.value });
}

async function resizePreview(delta: number) {
	previewWidth.value = Math.max(25, Math.min(65, previewWidth.value + delta));
	await props.rpc.request.setPanelSizes({ explorerWidth: explorerWidth.value, previewWidth: previewWidth.value });
}

function showPalette() {
	invoker = window.document.activeElement instanceof HTMLElement ? window.document.activeElement : null;
	palette.value = true;
}

function dismissPalette() {
	palette.value = false;
	invoker?.focus();
}

function cycleTab(direction: number) {
	const tabs = workbench.value.tabs;
	const index = tabs.findIndex(tab => tab.path === workbench.value.active);
	if (index >= 0 && tabs.length > 1) void selectTab(tabs[(index + direction + tabs.length) % tabs.length].path);
}

const commands = computed<ShellCommand[]>(() => [
	{ id: "project.open", label: "Open project", shortcut: "Ctrl/Cmd+O", enabled: true, run: openProject },
	{ id: "file.open", label: "Open file", shortcut: "Ctrl/Cmd+Shift+O", enabled: !!projectRoot.value, disabledReason: "Open a project first", run: () => openDocument() },
	{ id: "tab.next", label: "Next tab", shortcut: "Ctrl/Cmd+Alt+Right", enabled: workbench.value.tabs.length > 1, disabledReason: "Open another tab first", run: () => cycleTab(1) },
	{ id: "tab.previous", label: "Previous tab", shortcut: "Ctrl/Cmd+Alt+Left", enabled: workbench.value.tabs.length > 1, disabledReason: "Open another tab first", run: () => cycleTab(-1) },
	{ id: "document.save", label: "Save active tab", shortcut: "Ctrl/Cmd+S", enabled: !!document.value?.dirty, disabledReason: "No unsaved active tab", run: save },
	{ id: "document.format", label: "Format active tab", enabled: !!document.value, disabledReason: "Open an AMX document first", run: format },
	{ id: "document.run", label: "Run active document", shortcut: "Ctrl/Cmd+Enter", enabled: !!workbench.value.active, disabledReason: "Open an AMX document first", run: runAnalysis },
	{ id: "document.preview", label: "Refresh preview", shortcut: "Ctrl/Cmd+Shift+Enter", enabled: !!workbench.value.active, disabledReason: "Open an AMX document first", run: refresh },
	{ id: "project.search", label: "Search project", shortcut: "Ctrl/Cmd+Shift+F", enabled: !!projectRoot.value, disabledReason: "Open a project first", run: () => requestAnimationFrame(() => window.document.querySelector<HTMLInputElement>("#project-search")?.focus()) },
	{ id: "view.focus-editor", label: "Focus editor", enabled: !!document.value, disabledReason: "Open a document first", run: () => setFocusMode("editor") },
	{ id: "view.focus-preview", label: "Focus preview", enabled: !!workbench.value.active, disabledReason: "Open an AMX document first", run: () => setFocusMode("preview") },
	{ id: "document.export-html", label: "Export HTML", enabled: !!workbench.value.active, disabledReason: "Open an AMX document first", run: saveHtml },
	{ id: "document.export-pdf", label: "Export PDF", enabled: !!workbench.value.active, disabledReason: "Open an AMX document first", run: exportPdf },
	{ id: "document.export-docx", label: "Export DOCX", enabled: !!workbench.value.active, disabledReason: "Open an AMX document first", run: exportDocx },
	{ id: "project.clear-recents", label: "Clear recent projects", enabled: !!recents.value.length, disabledReason: "History is empty", run: clearRecents }
]);

function onKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") {
		if (palette.value) dismissPalette();
		else if (focusMode.value !== "none") setFocusMode("none");
		return;
	}
	const modifier = event.ctrlKey || event.metaKey;
	if (!modifier) return;
	if (event.altKey && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
		event.preventDefault(); cycleTab(event.key === "ArrowRight" ? 1 : -1); return;
	}
	if (event.altKey) return;
	if (event.shiftKey && event.key.toLowerCase() === "p") { event.preventDefault(); showPalette(); return; }
	let command: string | undefined;
	if (event.key.toLowerCase() === "o" && !event.shiftKey) command = "Open project";
	else if (event.key.toLowerCase() === "o" && event.shiftKey) command = "Open file";
	else if (event.key.toLowerCase() === "s" && !event.shiftKey) command = "Save active tab";
	else if (event.key.toLowerCase() === "f" && event.shiftKey) command = "Search project";
	else if (event.key === "Enter") command = event.shiftKey ? "Preview active document" : "Run active document";
	if (!command) return;
	event.preventDefault();
	const selected = commands.value.find(item => item.label === command);
	if (selected?.enabled) void selected.run();
}

function setTheme(next: ShellTheme) {
	theme.value = next;
	localStorage.setItem("openamx.theme", next);
	window.document.documentElement.dataset.theme = next;
}

function setDrawerDock(next: DrawerDock) {
	drawerDock.value = next;
	localStorage.setItem("openamx.drawer-dock", next);
}

function dragDivider(event: PointerEvent, divider: "explorer" | "preview") {
	const start = event.clientX;
	const initial = divider === "explorer" ? explorerWidth.value : previewWidth.value;
	const width = window.document.querySelector<HTMLElement>(".workbench")?.clientWidth ?? 1;
	const move = (moveEvent: PointerEvent) => {
		if (divider === "explorer") explorerWidth.value = Math.max(160, Math.min(400, initial + moveEvent.clientX - start));
		else previewWidth.value = Math.max(25, Math.min(65, initial - ((moveEvent.clientX - start) / width) * 100));
	};
	const finish = () => {
		window.removeEventListener("pointermove", move);
		window.removeEventListener("pointerup", finish);
		void props.rpc.request.setPanelSizes({ explorerWidth: explorerWidth.value, previewWidth: previewWidth.value });
	};
	window.addEventListener("pointermove", move);
	window.addEventListener("pointerup", finish, { once: true });
}

onMounted(() => { setTheme(theme.value); window.addEventListener("keydown", onKeydown); void syncRecents(); });
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

function clearView() {
	cancelActiveJob();
	bufferRevision++;
	previewRequest++;
	staticRequest++;
	preview.value = "";
	previewState.value = "idle";
	analysis.value = { diagnostics: [], completions: [] };
	staticAnalysis.value = { diagnostics: [], completions: [] };
	inputConfiguration.value = { inputs: [], diagnostics: [] };
	resetResults();
}

async function openProject() {
	await pendingEdit;
	const request = ++navigationRequest;
	const result = await props.rpc.request.pickProject();
	if (request !== navigationRequest) return;
	if (!result.ok) { status.value = result.error.message; return; }
	if (result.cancelled) return;
	if (result.root === projectRoot.value) {
		const listingError = await loadProject();
		status.value = listingError ?? `Project ready: ${files.value.length} .amx file(s).`;
		return;
	}
	clearView();
	inputOverrides.value = "";
	document.value = null;
	projectRoot.value = result.root ?? "";
	const listingError = await loadProject();
	if (workbench.value.active) {
		const active = await props.rpc.request.readDocument();
		if (active.ok) document.value = active.document;
	}
	const recent = recents.value.find(item => item.root === projectRoot.value);
	explorerWidth.value = recent?.explorerWidth ?? 220;
	previewWidth.value = recent?.previewWidth ?? 44;
	status.value = listingError ?? (document.value ? `Restored active file. ${files.value.length} .amx file(s) in project.` : `Project ready: ${files.value.length} .amx file(s). Select a file in the explorer or use Open file.`);
}

async function activate(result: Awaited<ReturnType<typeof props.rpc.request.openDocument>>) {
	if (!result.ok) { status.value = result.error.message; return; }
	clearView();
	document.value = result.document;
	await syncWorkbench();
	void refreshStaticAnalysis(result.document.path, result.document.revision);
	status.value = `Active: ${result.document.path.split(/[\\/]/).pop()}`;
}

async function refreshStaticAnalysis(path: string, revision: number) {
	const request = ++staticRequest;
	staticAnalysis.value = { diagnostics: [], completions: [] };
	try {
		const result = await props.rpc.request.analyzeBuffer();
		if (request === staticRequest && document.value?.path === path && document.value.revision === revision && result.ok) staticAnalysis.value = result.analysis;
	} catch {
		if (request === staticRequest && document.value?.path === path && document.value.revision === revision) {
			staticAnalysis.value = { diagnostics: [{ code: "DESKTOP_RPC", message: "Static analysis is unavailable." }], completions: [] };
		}
	}
}

async function navigateDiagnostic(item: TextDiagnostic) {
	if (!item.file || !item.line) return;
	if (document.value?.path !== item.file) await openDocument(item.file);
	if (document.value?.path === item.file) requestAnimationFrame(() => editorElement.value?.selectLocation(item.line!, item.column ?? 1));
}

async function openDocument(path?: string) {
	const request = ++navigationRequest;
	if (path) {
		const result = await props.rpc.request.openDocument({ path });
		if (request === navigationRequest) await activate(result);
		return;
	}
	const result = await props.rpc.request.pickDocument();
	if (request !== navigationRequest) return;
	if (!result.ok) { status.value = result.error.message; return; }
	if (result.cancelled || !result.document) return;
	await activate({ ok: true, document: result.document });
}

async function selectTab(path: string) {
	await pendingEdit;
	const request = ++navigationRequest;
	const result = await props.rpc.request.selectTab({ path });
	if (request === navigationRequest) await activate(result);
}

async function closeTab(path: string) {
	await pendingEdit;
	await syncWorkbench();
	const tab = workbench.value.tabs.find(item => item.path === path);
	const action = tab?.dirty || tab?.conflict
		? window.confirm("Save changes before closing? Cancel keeps this tab open.") ? "save" : window.confirm("Discard changes and close? Cancel keeps this tab open.") ? "discard" : "cancel"
		: "discard";
	const result = await props.rpc.request.closeTab({ path, action });
	if (!result.ok) { status.value = result.error.message; await syncWorkbench(); return; }
	if (action === "cancel") return;
	workbench.value = result.state;
	clearView();
	const next = result.state.active;
	document.value = null;
	if (next) await selectTab(next);
	status.value = result.state.active ? "Tab closed." : "No active document.";
}

async function reload() {
	await pendingEdit;
	if (!document.value || (document.value.dirty && !window.confirm("Discard unsaved changes and reload?"))) return;
	await activate(await props.rpc.request.reloadTab({ action: "discard" }));
}

async function refresh() {
	await pendingEdit;
	await syncInputSettings();
	if (!document.value) return;
	const revision = bufferRevision;
	const request = ++previewRequest;
	preview.value = "";
	previewState.value = "running";
	pending.value = true;
	const selectedInputs = mappings();
	let rendered: Awaited<ReturnType<typeof executeJob>>;
	let configured: Awaited<ReturnType<typeof props.rpc.request.getInputConfiguration>>;
	try {
		[rendered, configured] = await Promise.all([
			executeJob("preview"),
			props.rpc.request.getInputConfiguration({ inputMappings: selectedInputs })
		]);
	} catch (error) {
		if (isCurrent(revision) && request === previewRequest) {
			preview.value = "";
			previewState.value = "failure";
			analysis.value = { diagnostics: [{ code: "DESKTOP_RPC", message: error instanceof Error ? error.message.slice(0, 1000) : "Preview request failed." }], completions: [] };
			status.value = "Preview failed for the current buffer.";
			pending.value = false;
		}
		return;
	}
	if (!isCurrent(revision) || request !== previewRequest) {
		if (request === previewRequest) pending.value = false;
		return;
	}
	if (configured.ok) inputConfiguration.value = configured.configuration;
	if (!rendered) {
		previewState.value = "cancelled";
		pending.value = false;
		return;
	}
	if (rendered.status === "succeeded" && rendered.result?.kind === "preview") {
		preview.value = rendered.result.html ?? "";
		analysis.value = { diagnostics: rendered.diagnostics, completions: [] };
		previewState.value = "success";
	} else if (rendered.status === "cancelled" || rendered.status === "superseded") {
		previewState.value = rendered.status === "cancelled" ? "cancelled" : "stale";
	} else {
		preview.value = "";
		previewState.value = "failure";
		analysis.value = { diagnostics: rendered.diagnostics, completions: [] };
	}
	const issues = [...analysis.value.diagnostics, ...inputConfiguration.value.diagnostics];
	status.value = issues.length ? `${issues.length} issue(s)` : "Preview reflects the current buffer.";
	pending.value = false;
}

async function updateText(text: string) {
	if (!document.value) return;
	const path = document.value.path;
	const revision = ++bufferRevision;
	staticRequest++;
	staticAnalysis.value = { diagnostics: [], completions: [] };
	previewRequest++;
	pending.value = false;
	preview.value = "";
	previewState.value = "running";
	resetResults();
	const write = props.rpc.request.updateBuffer({ text, path, sequence: revision });
	pendingEdit = write.then(() => undefined, () => undefined);
	const result = await write;
	if (!isCurrent(revision)) return;
	if (!result.ok) { status.value = result.error.message; return; }
	document.value = result.document;
	await syncWorkbench();
	void refreshStaticAnalysis(path, result.document.revision);
}

async function save() {
	await pendingEdit;
	const result = await props.rpc.request.saveDocument();
	status.value = result.ok ? "Saved." : result.error.message;
	if (result.ok) document.value = result.document;
	else {
		const latest = await props.rpc.request.readDocument();
		if (latest.ok) document.value = latest.document;
	}
	await syncWorkbench();
}

async function format() {
	await pendingEdit;
	if (!document.value) return;
	const path = document.value.path;
	const revision = document.value.revision;
	const generation = workbench.value.generation;
	const result = await props.rpc.request.formatBuffer();
	if (document.value?.path !== path || document.value.revision !== revision || workbench.value.generation !== generation) return;
	if (!result.ok) { status.value = result.error.message; return; }
	editorElement.value?.replaceText(result.text);
}

async function runAnalysis() {
	await pendingEdit;
	await syncInputSettings();
	if (!document.value) return;
	const revision = bufferRevision;
	const request = ++runRequest;
	previewRequest++;
	preview.value = "";
	previewState.value = "idle";
	runState.value = "running";
	summary.value = { values: [] };
	let result: Awaited<ReturnType<typeof executeJob>>;
	try {
		result = await executeJob("run");
	} catch (error) {
		if (isCurrent(revision) && request === runRequest) {
			runState.value = "failure";
			summary.value = { values: [] };
			analysis.value = { ...analysis.value, diagnostics: [{ code: "DESKTOP_RPC", message: error instanceof Error ? error.message.slice(0, 1000) : "Run request failed." }] };
		}
		return;
	}
	if (!isCurrent(revision) || request !== runRequest) return;
	if (!result) { runState.value = "cancelled"; return; }
	if (result.status === "cancelled" || result.status === "superseded") {
		runState.value = result.status === "cancelled" ? "cancelled" : "stale";
		return;
	}
	if (result.status !== "succeeded" || result.result?.kind !== "run") {
		runState.value = "failure";
		analysis.value = { ...analysis.value, diagnostics: result.diagnostics };
		return;
	}
	summary.value = result.result.summary ?? { values: [] };
	analysis.value = { ...analysis.value, diagnostics: result.diagnostics };
	runState.value = result.diagnostics.length ? "failure" : "success";
	status.value = result.diagnostics.length ? "Analysis failed for the current buffer." : "Analysis completed for the current buffer.";
}

async function exportDocument(format: "html" | "pdf" | "docx", extension: ".html" | ".pdf" | ".docx") {
	await pendingEdit;
	await syncInputSettings();
	if (!document.value) return;
	const started = bufferRevision;
	const request = ++exportRequest;
	const label = format.toUpperCase();
	exportStatus.value = `Choosing ${label} destination…`;
	const destination = await props.rpc.request.pickDestination({ extension });
	if (!isCurrent(started) || request !== exportRequest) return;
	if (!destination.ok) { exportStatus.value = destination.error.message; return; }
	if (destination.cancelled || !destination.path) { exportStatus.value = ""; return; }
	const revision = bufferRevision;
	exportStatus.value = `Preparing ${label}…`;
	let result: Awaited<ReturnType<typeof executeJob>>;
	try {
		result = await executeJob(format, destination.path);
	} catch (error) {
		if (isCurrent(revision) && request === exportRequest) exportStatus.value = error instanceof Error ? error.message.slice(0, 1000) : `${label} export request failed.`;
		return;
	}
	if (!isCurrent(revision) || request !== exportRequest) return;
	if (!result) { exportStatus.value = "Export cancelled."; return; }
	if (result.status === "cancelled" || result.status === "superseded") { exportStatus.value = result.status === "cancelled" ? "Export cancelled." : "Export superseded."; return; }
	if (result.status !== "succeeded" || result.result?.kind !== "export") {
		analysis.value = { ...analysis.value, diagnostics: result.diagnostics };
		exportStatus.value = `${label} export failed.`;
	} else exportStatus.value = `Saved ${result.result.path} (${(result.result.bytes ?? 0).toLocaleString()} bytes)`;
}

const saveHtml = () => exportDocument("html", ".html");
const exportPdf = () => exportDocument("pdf", ".pdf");
const exportDocx = () => exportDocument("docx", ".docx");

function displayDiagnostic(item: TextDiagnostic): string {
	const context = [item.inputName, item.dataPath, item.dataLine ? `data line ${item.dataLine}` : ""].filter(Boolean).join(" · ");
	return context ? `${item.message} (${context})` : item.message;
}
</script>

<!-- Legacy Sprint 036 surface retained only as source context during the shell migration.
	<main>
		<header><span class="wordmark">OpenAMX</span><span class="eyebrow">WORKBENCH</span><Button type="button" @click="showPalette">Commands…</Button></header>
		<section class="toolbar" aria-label="Project controls">
			<Button type="button" @click="openProject">Open project</Button>
			<Button type="button" :disabled="!projectRoot" @click="openDocument()">Open file</Button>
			<span class="project-label">{{ projectRoot || "No project" }}</span>
			<select v-if="recents.length" aria-label="Recent projects" @change="restore(($event.target as HTMLSelectElement).value)"><option value="">Recent projects</option><option v-for="recent in recents" :key="recent.root" :value="recent.root">{{ recent.root }}</option></select>
			<Button v-if="recents.length" type="button" @click="clearRecents">Clear history</Button>
			<span class="project-feedback" role="status" aria-live="polite">{{ status }}</span>
		</section>
		<div class="panel-controls" aria-label="Workbench layout">
			<button v-for="panel in ['explorer', 'inputs', 'export'] as const" :key="panel" :aria-pressed="sidePanel === panel" @click="sidePanel = panel">{{ panel }}</button>
			<button v-for="panel in ['preview', 'diagnostics', 'results'] as const" :key="panel" :aria-pressed="detailPanel === panel" @click="detailPanel = panel">{{ panel }}</button>
			<button :aria-pressed="focusMode === 'editor'" @click="setFocusMode('editor')">Focus editor</button>
			<button :aria-pressed="focusMode === 'preview'" @click="setFocusMode('preview')">Focus preview</button>
			<button title="Narrow explorer" aria-label="Narrow explorer" @click="resizeExplorer(-24)">−</button><button title="Widen explorer" aria-label="Widen explorer" @click="resizeExplorer(24)">+</button>
			<button title="Narrow preview" aria-label="Narrow preview" @click="resizePreview(-5)">−</button><button title="Widen preview" aria-label="Widen preview" @click="resizePreview(5)">+</button>
		</div>
		<section class="workflow" :class="{ 'mobile-hidden': sidePanel !== 'inputs' && sidePanel !== 'export' }" aria-label="Analysis workflow">
			<div class="workflow-grid" :class="{ 'mobile-hidden': sidePanel === 'export' }">
				<label class="mapping-control">Per-run input paths <span>one name=path mapping per line</span><textarea v-model="inputOverrides" :disabled="!document" aria-label="Per-run input mappings" spellcheck="false" placeholder="assets=data/assets.json" @input="inputMappingsChanged" @change="refresh"></textarea></label>
				<div class="run-controls">
					<label>Validation <select v-model="validation" :disabled="!document" @change="validationChanged"><option value="aggregate">Aggregate</option><option value="fail-fast">Fail fast</option></select></label>
					<div class="button-row"><Button :disabled="!document || runState === 'running'" type="button" @click="runAnalysis">{{ runState === "running" ? "Running…" : "Run analysis" }}</Button><Button :disabled="!document || pending" type="button" @click="refresh">Refresh preview</Button></div>
					<p class="workflow-status">{{ status }}<span v-if="jobStage"> · {{ jobStage }}</span></p>
					<Button v-if="activeJobId !== null" type="button" @click="cancelActiveJob">Cancel current job</Button>
				</div>
				<div class="configuration" aria-label="Input configuration sources">
					<strong>INPUT SOURCES</strong>
					<p v-for="input in inputConfiguration.inputs" :key="input.name"><code>{{ input.name }}</code><span>{{ input.source }}</span></p>
					<p v-if="!inputConfiguration.inputs.length" class="muted">No declared inputs.</p>
				</div>
			</div>
			<div class="export-row" :class="{ 'mobile-hidden': sidePanel !== 'export' }">
				<Button :disabled="!workbench.active" type="button" @click="saveHtml">Save HTML…</Button>
				<Button :disabled="!workbench.active" type="button" @click="exportPdf">Export PDF…</Button>
				<Button :disabled="!workbench.active" type="button" @click="exportDocx">Export DOCX…</Button>
				<span class="export-status" aria-live="polite">{{ exportStatus }}</span>
			</div>
		</section>
		<div class="workbench" :class="`focus-${focusMode}`" :style="{ '--explorer-width': `${explorerWidth}px`, '--preview-width': `${previewWidth}%` }">
			<aside :class="{ 'mobile-hidden': sidePanel !== 'explorer' }"><p class="kicker">PROJECT FILES</p><input id="project-search" v-model="search" aria-label="Search project files" placeholder="Search files"><div v-for="[folder, entries] in groupedFiles" :key="folder"><p class="folder">{{ folder }}</p><button v-for="file in entries" :key="file" class="file" :class="{ selected: workbench.active?.endsWith(file) }" @click="openDocument(file)">{{ file.split('/').pop() }}</button></div><p v-if="!files.length" class="muted">No project files.</p><p v-else-if="!visibleFiles.length" class="muted">No matching files.</p></aside>
			<section class="editor-pane" aria-label="AMX editor">
				<nav class="tabs" aria-label="Open tabs"><div v-for="tab in workbench.tabs" :key="tab.path" class="tab"><button :aria-current="workbench.active === tab.path ? 'page' : undefined" @click="selectTab(tab.path)">{{ tab.path.split(/[\\/]/).pop() }} <span v-if="workbench.active === tab.path">Active</span><span v-if="tab.dirty">*</span><span v-if="tab.conflict">!</span></button><button title="Close tab" :aria-label="`Close ${tab.path}`" @click="closeTab(tab.path)">×</button></div></nav>
				<div class="pane-header"><strong>{{ document?.path ?? "No document" }}</strong><span v-if="document?.dirty" class="dirty">Unsaved</span><span v-if="document?.conflict" class="failure">Conflict</span><span class="actions"><Button :disabled="!document" type="button" @click="editorElement?.openSearch()">Find</Button><Button :disabled="!document || pending" type="button" @click="format">Format</Button><Button :disabled="!document || !document.dirty" type="button" @click="save">Save</Button></span></div>
				<div v-if="document" class="entry-actions"><Button @click="reload">Reload…</Button></div>
				<CodeEditor v-if="document" ref="editorElement" :path="document.path" :text="document.text" @change="updateText" />
				<div class="diagnostics" :class="{ 'mobile-hidden': detailPanel !== 'diagnostics' }" aria-live="polite"><p v-for="(item, index) in staticAnalysis.diagnostics" :key="`static-${item.code}-${item.line}-${index}`"><button class="diagnostic-link" :disabled="!item.file || !item.line" @click="navigateDiagnostic(item)">Static · {{ item.code }} {{ item.file?.split(/[\\/]/).pop() }} ({{ item.line }}:{{ item.column }}) {{ displayDiagnostic(item) }}</button></p><p v-for="(item, index) in [...analysis.diagnostics, ...inputConfiguration.diagnostics]" :key="`${item.code}-${item.line}-${index}`"><strong>Run · {{ item.code }}</strong> {{ displayDiagnostic(item) }} <span v-if="item.line">({{ item.line }}:{{ item.column }})</span></p><p v-if="![...staticAnalysis.diagnostics, ...analysis.diagnostics, ...inputConfiguration.diagnostics].length" class="muted">No current diagnostics.</p></div>
			</section>
			<section class="preview-pane" :class="{ 'mobile-hidden': detailPanel !== 'preview' }" aria-label="Live HTML preview"><div class="pane-header"><strong>ACTIVE DOCUMENT PREVIEW · {{ workbench.active?.split(/[\\/]/).pop() ?? 'No document' }}</strong><span class="state" :class="`state-${previewState}`">{{ previewState }}</span></div><iframe :srcdoc="preview" sandbox="" title="OpenAMX live HTML preview"></iframe></section>
		</div>
		<section class="result-strip" :class="{ 'mobile-hidden': detailPanel !== 'results' }" aria-label="Analysis result">
			<div><strong>RUN RESULT</strong><span class="state" :class="`state-${runState}`">{{ runState }}</span></div>
			<p v-for="item in summary.values" :key="item.name"><code>{{ item.name }}</code><span>{{ item.value }}</span></p>
			<p v-if="!summary.values.length" class="muted">No current result values.</p>
		</section>
		<div v-if="palette" class="palette-backdrop" @click.self="dismissPalette"><section class="palette" role="dialog" aria-modal="true" aria-label="Commands"><input id="command-search" v-model="paletteQuery" aria-label="Search commands" placeholder="Find a command"><div v-for="command in matchingCommands" :key="command.name"><button :disabled="!command.enabled" :title="command.enabled ? command.shortcut : command.reason" @click="dismissPalette(); command.run()">{{ command.name }} <small>{{ command.enabled ? command.shortcut : command.reason }}</small></button></div><p v-if="!matchingCommands.length">No matching commands.</p><button @click="dismissPalette">Close</button></section></div>
	</main>
-->

<template>
	<main :class="`theme-${theme}`">
		<header class="app-header">
			<span class="wordmark">OpenAMX</span><span class="project-label">{{ projectRoot || "Welcome" }}</span><span class="header-spacer"></span>
			<select v-model="theme" aria-label="Theme" @change="setTheme(theme)"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>
			<button type="button" @click="showPalette">Commands</button>
		</header>
		<WelcomeView v-if="!projectRoot" :recents="recents" :status="status" @open-project="openProject" @restore="restore" @clear-recents="clearRecents" @open-help="status = 'Help and shortcut reference will be completed in Sprint 043.'" />
		<div v-else class="workbench" :class="[`focus-${focusMode}`, `drawer-${drawerDock}`]" :style="{ '--explorer-width': `${explorerWidth}px`, '--preview-width': `${previewWidth}%` }">
			<ProjectExplorer :files="files" :workbench="workbench" @open="openDocument" />
			<div class="divider divider-explorer" role="separator" aria-label="Resize explorer" aria-orientation="vertical" tabindex="0" @pointerdown.prevent="dragDivider($event, 'explorer')"></div>
			<section class="editor-pane" aria-label="Document editor">
				<WorkbenchTabs :workbench="workbench" @select="selectTab" @close="closeTab" />
				<div class="pane-header"><strong>{{ document?.path ?? "No document" }}</strong><span v-if="document?.dirty" class="dirty">Unsaved</span><span v-if="document?.conflict" class="failure">Conflict</span><span class="actions"><button :disabled="!document" type="button" @click="editorElement?.openSearch()">Find</button><button :disabled="!document || pending" type="button" @click="format">Format</button><button :disabled="!document || !document.dirty" type="button" @click="save">Save</button></span></div>
				<CodeEditor v-if="document?.kind === 'amx'" ref="editorElement" :path="document.path" :text="document.text" @change="updateText" />
				<div v-else class="file-kind-shell"><strong>{{ document?.kind ?? "document" }}</strong><p>This file shell preserves active-tab identity. Structured editing arrives in Sprint 041.</p></div>
			</section>
			<div class="divider divider-preview" role="separator" aria-label="Resize contextual pane" aria-orientation="vertical" tabindex="0" @pointerdown.prevent="dragDivider($event, 'preview')"></div>
			<section class="preview-pane" aria-label="Live HTML preview"><div class="pane-header"><strong>PREVIEW</strong><span class="state" :class="`state-${previewState}`">{{ previewState }}</span><span class="actions"><button type="button" :aria-pressed="focusMode === 'editor'" @click="setFocusMode('editor')">Source</button><button type="button" :aria-pressed="focusMode === 'preview'" @click="setFocusMode('preview')">Preview</button></span></div><iframe v-if="document?.kind === 'amx'" :srcdoc="preview" sandbox="" title="OpenAMX live HTML preview"></iframe><div v-else class="file-kind-shell"><strong>Context</strong><p>Select an AMX document to show its live report preview.</p></div></section>
			<section class="runtime-drawer" aria-label="Runtime drawer"><div class="drawer-heading"><strong>RUNTIME</strong><span class="state" :class="`state-${runState}`">{{ runState }}</span><span class="actions"><button type="button" :aria-pressed="drawerDock === 'bottom'" @click="setDrawerDock('bottom')">Bottom</button><button type="button" :aria-pressed="drawerDock === 'right'" @click="setDrawerDock('right')">Right</button><button v-if="activeJobId !== null" type="button" @click="cancelActiveJob">Cancel</button></span></div><p class="runtime-status" role="status" aria-live="polite">{{ status }}<span v-if="jobStage"> · {{ jobStage }}</span></p><div class="runtime-details"><p v-for="(item, index) in staticAnalysis.diagnostics" :key="`static-${item.code}-${index}`"><button class="diagnostic-link" :disabled="!item.file || !item.line" @click="navigateDiagnostic(item)">Static {{ item.code }}: {{ displayDiagnostic(item) }}</button></p><p v-for="(item, index) in analysis.diagnostics" :key="`run-${item.code}-${index}`">Run {{ item.code }}: {{ displayDiagnostic(item) }}</p><p v-for="item in summary.values" :key="item.name"><code>{{ item.name }}</code> {{ item.value }}</p><p v-if="!analysis.diagnostics.length && !staticAnalysis.diagnostics.length && !summary.values.length" class="muted">No runtime details.</p></div></section>
		</div>
		<CommandPalette :open="palette" :commands="commands" @dismiss="dismissPalette" />
	</main>
</template>