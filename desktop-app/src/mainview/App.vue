<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { CircleHelp, Database, Download, ExternalLink, Eye, FolderOpen, Pause, Play, RefreshCw, Settings, SlidersHorizontal } from "@lucide/vue";
import type { DataInputSchema, DataOutputSchema, DesktopExportAction, DesktopJobOperation, DesktopRPCClient, InputConfiguration, OpenDocument, ProjectFile, RecentProject, RecoveryItem, ReportSettingsSnapshot, ReportSettingsValues, RunSummary, TextAnalysis, TextDiagnostic, WorkbenchState } from "../shared/rpc";
import { Button } from "@/components/ui/button";
import CodeEditor from "./CodeEditor.vue";
import CommandPalette from "./components/CommandPalette.vue";
import DataEditorPane from "./components/DataEditorPane.vue";
import ExportDialog from "./components/ExportDialog.vue";
import HelpCenterDialog from "./components/HelpCenterDialog.vue";
import InputsPanel from "./components/InputsPanel.vue";
import PreferencesDialog from "./components/PreferencesDialog.vue";
import ProjectExplorer from "./components/ProjectExplorer.vue";
import ReportSettingsDialog from "./components/ReportSettingsDialog.vue";
import WelcomeView from "./components/WelcomeView.vue";
import WorkbenchTabs from "./components/WorkbenchTabs.vue";
import { createDiagnosticSummary } from "./diagnosticSummary";
import type { DrawerDock, ShellCommand, ShellFocusMode, ShellTheme } from "./shell";

const props = defineProps<{ rpc: DesktopRPCClient }>();
const document = ref<OpenDocument | null>(null);
const workbench = ref<WorkbenchState>({ tabs: [], generation: 0, inputSettingsRevision: 0 });
const projectRoot = ref("");
const recents = ref<RecentProject[]>([]);
const recovery = ref<RecoveryItem[]>([]);
const palette = ref(false);
const helpOpen = ref(false);
const helpSection = ref("getting-started");
const preferencesOpen = ref(false);
const editorWrapLines = ref(localStorage.getItem("openamx.editor-wrap") !== "false");
const autosaveEnabled = ref(localStorage.getItem("openamx.autosave") !== "false");
const autosaveDelayMs = ref(Number(localStorage.getItem("openamx.autosave-delay")) || 500);
const diagnosticTrail = ref<Array<{ at: string; codes: string[] }>>([]);
const focusMode = ref<ShellFocusMode>("none");
const drawerDock = ref<DrawerDock>((localStorage.getItem("openamx.drawer-dock") as DrawerDock) || "bottom");
const theme = ref<ShellTheme>((localStorage.getItem("openamx.theme") as ShellTheme) || "system");
const explorerWidth = ref(220);
const previewWidth = ref(44);
const editorElement = ref<InstanceType<typeof CodeEditor> | null>(null);
const dataEditorElement = ref<InstanceType<typeof DataEditorPane> | null>(null);
let invoker: HTMLElement | null = null;
let focusInvoker: HTMLElement | null = null;
let settingsInvoker: HTMLElement | null = null;
const preview = ref("");
const previewPaused = ref(false);
const analysis = ref<TextAnalysis>({ diagnostics: [], completions: [] });
const staticAnalysis = ref<TextAnalysis>({ diagnostics: [], completions: [] });
const inputConfiguration = ref<InputConfiguration>({ inputs: [], diagnostics: [] });
const dataEditorContexts = ref(new Map<string, { inputName: string; schema?: DataInputSchema; diagnostics: TextDiagnostic[]; ownerPath?: string; declarationLine?: number; declarationColumn?: number }>());
const contextView = ref<"preview" | "inputs" | "data">("preview");
const reportSettings = ref<ReportSettingsSnapshot | null>(null);
const reportSettingsOpen = ref(false);
const reportSettingsBusy = ref(false);
const reportSettingsError = ref("");
const inputsBusy = ref(false);
const inputOverrides = ref("");
const validation = ref<"aggregate" | "fail-fast">("aggregate");
const summary = ref<RunSummary>({ values: [] });
const runState = ref<"idle" | "running" | "success" | "failure" | "cancelled" | "stale">("idle");
const previewState = ref<"idle" | "running" | "success" | "failure" | "cancelled" | "stale">("idle");
const activeJobId = ref<number | null>(null);
const cleanupJobId = ref<number | null>(null);
const cleanupPending = ref(false);
const jobStage = ref("");
const exportStatus = ref("");
const exportDialogOpen = ref(false);
const exportOutputs = ref<DataOutputSchema[]>([]);
const exportOutputsTruncated = ref(false);
const exportFormat = ref<"html" | "pdf" | "docx" | "json" | "csv">("html");
const exportBinding = ref("");
const exportFileName = ref("report.html");
const exportBusy = ref(false);
const exportDialogError = ref("");
const completedOutputId = ref("");
const completedOutputName = ref("");
const runtimeExpanded = ref(false);
const files = ref<ProjectFile[]>([]);
const folders = ref<string[]>([]);
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
let dataValidationTimer: ReturnType<typeof setTimeout> | undefined;
let previewTimer: ReturnType<typeof setTimeout> | undefined;
const lastGoodPreviews = new Map<string, { html: string; revision: number; projectGeneration: number; settingsRevision: number; stale: boolean }>();

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
async function cancelActiveJob() {
	const jobId = activeJobId.value;
	if (jobId === null) return;
	try {
		const cancelled = await props.rpc.request.cancelJob({ jobId });
		if (activeJobId.value !== jobId) return;
		if (cancelled.ok && cancelled.job.status === "committing") {
			jobStage.value = "committing";
			status.value = "The atomic file replacement has started and cannot be interrupted.";
			return;
		}
		if (cancelled.ok && cancelled.job.cleanupPending) {
			cleanupJobId.value = jobId;
			cleanupPending.value = true;
			void observeWorkerCleanup(jobId);
		}
	} catch { status.value = "Unable to confirm job cancellation."; }
	if (activeJobId.value === jobId) {
		activeJobId.value = null;
		jobStage.value = "";
	}
}
async function executeJob(operation: DesktopJobOperation, selectionId?: string, dataOutput?: { name: string; format: "json" | "csv" }) {
	await pendingEdit; await pendingInputSettings; if (!workbench.value.requestIdentity) await syncWorkbench();
	const identity = workbench.value.requestIdentity; if (!identity) throw new Error("Open an active AMX document before starting a job.");
	const started = await props.rpc.request.startJob({ operation, identity, selectionId, dataOutput }); if (!started.ok) throw new Error(started.error.message);
	let job = started.job; const jobId = job.identity.jobId; activeJobId.value = jobId; jobStage.value = job.stage ?? "";
	cleanupJobId.value = null; cleanupPending.value = false;
	for (let attempt = 0; ["running", "committing"].includes(job.status) && attempt < 600; attempt++) {
		await new Promise(resolve => setTimeout(resolve, 50)); if (activeJobId.value !== jobId) return undefined;
		const polled = await props.rpc.request.getJob({ jobId }); if (!polled.ok) throw new Error(polled.error.message); job = polled.job; jobStage.value = job.stage ?? "";
	}
	if (["running", "committing"].includes(job.status)) { void props.rpc.request.cancelJob({ jobId }); throw new Error("The desktop job did not complete before its polling limit."); }
	if (activeJobId.value === jobId) activeJobId.value = null;
	jobStage.value = "";
	if (job.cleanupPending) { cleanupPending.value = true; cleanupJobId.value = jobId; void observeWorkerCleanup(jobId); }
	return job;
}

async function observeWorkerCleanup(jobId: number) {
	for (let attempt = 0; attempt < 200; attempt++) {
		if (cleanupJobId.value !== jobId) return;
		const result = await props.rpc.request.getJob({ jobId });
		if (!result.ok || !result.job.cleanupPending) {
			if (cleanupJobId.value === jobId) { cleanupPending.value = false; cleanupJobId.value = null; }
			return;
		}
		await new Promise(resolve => setTimeout(resolve, 10));
	}
}

function isCurrent(revision: number): boolean {
	return revision === bufferRevision;
}

function resetResults() {
	summary.value = { values: [] };
	runState.value = "idle";
	exportRequest++;
	exportStatus.value = "";
	completedOutputId.value = "";
	completedOutputName.value = "";
}

function markLastGoodStale(path = document.value?.path) {
	if (!path) return;
	const cached = lastGoodPreviews.get(path);
	if (cached) cached.stale = true;
	if (document.value?.path === path && preview.value) previewState.value = "stale";
}

function markAllLastGoodStale() {
	for (const cached of lastGoodPreviews.values()) cached.stale = true;
	if (document.value?.kind === "amx" && preview.value) previewState.value = "stale";
}

function schedulePreview() {
	if (previewTimer) clearTimeout(previewTimer);
	if (previewPaused.value || document.value?.kind !== "amx") return;
	previewTimer = setTimeout(() => { previewTimer = undefined; void refresh(); }, 400);
}

function togglePreviewPause() {
	previewPaused.value = !previewPaused.value;
	if (previewPaused.value) {
		if (previewTimer) clearTimeout(previewTimer);
		previewTimer = undefined;
		cancelActiveJob();
		markLastGoodStale();
		if (!preview.value) previewState.value = "idle";
	} else schedulePreview();
}

function invalidateInputResults() {
	cancelActiveJob();
	if (exportDialogOpen.value) { exportDialogOpen.value = false; exportRequest++; }
	bufferRevision++;
	previewRequest++;
	pending.value = false;
	resetResults();
	markAllLastGoodStale();
	if (!preview.value) previewState.value = "idle";
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

async function syncInputConfiguration() {
	const path = document.value?.path;
	const revision = document.value?.revision;
	if (!path || document.value?.kind !== "amx") { inputConfiguration.value = { inputs: [], diagnostics: [] }; return; }
	const result = await props.rpc.request.getInputConfiguration();
	if (result.ok && document.value?.path === path && document.value.revision === revision) inputConfiguration.value = result.configuration;
}

function applyInputValidation(diagnostics: TextDiagnostic[], completed: boolean) {
	const invalid = new Set(diagnostics.map(item => item.inputName).filter((name): name is string => !!name));
	inputConfiguration.value = {
		...inputConfiguration.value,
		inputs: inputConfiguration.value.inputs.map(input => ({
			...input,
			status: invalid.has(input.name) ? "invalid" : completed && input.source !== "missing" ? "valid" : input.status
		}))
	};
}

async function browseInput(name: string) {
	if (!inputConfiguration.value.revisions || inputsBusy.value) return;
	const path = document.value?.path;
	const revision = document.value?.revision;
	inputsBusy.value = true;
	try {
		const result = await props.rpc.request.pickInputMapping({ name, expectedRevision: inputConfiguration.value.revisions.local }, { maxRequestTime: Infinity });
		if (document.value?.path !== path || document.value?.revision !== revision) return;
		if (!result.ok) { status.value = result.error.message; return; }
		inputConfiguration.value = result.configuration;
		workbench.value = result.state;
		if (result.configuration.inputs.some(input => input.name === name && input.source !== "missing")) {
			status.value = `Updated mapping for ${name}.`;
			invalidateInputResults();
			void refresh();
		}
	} finally { inputsBusy.value = false; }
}

async function clearInput(name: string, scope: "session" | "local" | "project") {
	const expectedRevision = scope === "local" ? inputConfiguration.value.revisions?.local : scope === "project" ? inputConfiguration.value.revisions?.project : undefined;
	inputsBusy.value = true;
	try {
		const result = await props.rpc.request.clearInputMapping({ name, scope, expectedRevision });
		if (!result.ok) { status.value = result.error.message; return; }
		inputConfiguration.value = result.configuration;
		workbench.value = result.state;
		invalidateInputResults();
		void refresh();
	} finally { inputsBusy.value = false; }
}

async function promoteInput(name: string) {
	const revisions = inputConfiguration.value.revisions;
	if (!revisions || inputsBusy.value) return;
	inputsBusy.value = true;
	try {
		const result = await props.rpc.request.promoteInputMapping({ name, expectedLocalRevision: revisions.local, expectedProjectRevision: revisions.project });
		if (!result.ok) { status.value = result.error.message; return; }
		inputConfiguration.value = result.configuration;
		workbench.value = result.state;
		status.value = `Promoted ${name} to project defaults.`;
		invalidateInputResults();
		void refresh();
	} finally { inputsBusy.value = false; }
}

async function openMappedInput(name: string) {
	const owner = document.value;
	const declaration = inputConfiguration.value.inputs.find(input => input.name === name);
	const result = await props.rpc.request.openMappedInput({ name });
	if (!result.ok) { status.value = result.error.message; return; }
	dataEditorContexts.value.set(result.document.path, {
		inputName: result.inputName ?? name, schema: result.schema, diagnostics: result.diagnostics ?? [],
		ownerPath: owner?.kind === "amx" ? owner.path : undefined, declarationLine: declaration?.line, declarationColumn: declaration?.column
	});
	await activate(result);
}

async function navigateInputDiagnostic(item: TextDiagnostic) {
	if (item.file && item.line && item.file === document.value?.path) {
		requestAnimationFrame(() => editorElement.value?.selectLocation(item.line!, item.column ?? 1));
		return;
	}
	if (item.inputName) await openMappedInput(item.inputName);
}

async function openReportSettings() {
	if (!document.value || document.value.kind !== "amx") { status.value = "Open an AMX document to edit report settings."; return; }
	settingsInvoker = window.document.activeElement instanceof HTMLElement ? window.document.activeElement : null;
	const result = await props.rpc.request.getReportSettings();
	if (!result.ok) { status.value = result.error.message; return; }
	reportSettingsError.value = "";
	reportSettings.value = result.settings;
	reportSettingsOpen.value = true;
}

async function pickReportLogo(scope: "project" | "document") {
	const result = await props.rpc.request.pickReportLogo({}, { maxRequestTime: Infinity });
	if (!result.ok) { reportSettingsError.value = result.error.message; return; }
	if (!result.cancelled && result.path && reportSettings.value) {
		const target = scope === "project" ? reportSettings.value.project : reportSettings.value.document;
		reportSettings.value = { ...reportSettings.value, [scope]: { ...target, logo: result.path } };
	}
}

function closeReportSettings() {
	reportSettingsOpen.value = false;
	requestAnimationFrame(() => settingsInvoker?.focus());
}

async function saveReportSettings(scope: "project" | "document", values: ReportSettingsValues) {
	if (!reportSettings.value || reportSettingsBusy.value) return;
	reportSettingsBusy.value = true;
	try {
		if (scope === "project") {
			const result = await props.rpc.request.setProjectReportSettings({ values, expectedRevision: reportSettings.value.projectRevision });
			if (!result.ok) { reportSettingsError.value = result.error.message; status.value = result.error.message; return; }
			reportSettings.value = result.settings;
			workbench.value = result.state;
		} else {
			const result = await props.rpc.request.setDocumentReportSettings({ values, expectedRevision: reportSettings.value.documentRevision });
			if (!result.ok) { reportSettingsError.value = result.error.message; status.value = result.error.message; return; }
			reportSettings.value = result.settings;
			document.value = result.document;
			workbench.value = result.state;
		}
		reportSettingsError.value = "";
		closeReportSettings();
		invalidateInputResults();
		status.value = "Report settings saved.";
		await syncInputConfiguration();
		void refresh();
	} finally { reportSettingsBusy.value = false; }
}

async function syncRecents() {
	const result = await props.rpc.request.getRecents();
	if (result.ok) recents.value = result.projects;
}

async function syncRecovery() {
	const result = await props.rpc.request.getRecovery();
	if (result.ok) recovery.value = result.items;
}

async function resolveRecovery(action: "restore" | "discard") {
	const result = await props.rpc.request.resolveRecovery({ action });
	if (!result.ok) { status.value = result.error.message; return; }
	if (action === "discard") { await syncRecovery(); status.value = "Discarded recovery snapshots."; return; }
	if (!result.root) { status.value = "No recovery snapshot is available."; return; }
	clearView();
	projectRoot.value = result.root;
	workbench.value = result.state;
	const active = await props.rpc.request.readDocument();
	if (active.ok) document.value = active.document;
	const listingError = await loadProject();
	await syncRecovery();
	status.value = listingError ?? "Restored unsaved buffers without writing them to disk.";
}

async function loadProject() {
	const listing = await props.rpc.request.listProjectFiles();
	files.value = listing.ok ? listing.files : [];
	folders.value = listing.ok ? listing.folders : [];
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

function closeExportWorkflow() {
	exportDialogOpen.value = false;
	exportRequest++;
	cancelActiveJob();
}

function setExportFormat(format: "html" | "pdf" | "docx" | "json" | "csv") {
	const base = format === "json" || format === "csv" ? exportBinding.value || "output" : "report";
	exportFormat.value = format;
	exportFileName.value = `${base}.${format}`;
}

function setExportBinding(name: string) {
	exportBinding.value = name;
	if (exportFormat.value === "json" || exportFormat.value === "csv") exportFileName.value = `${name || "output"}.${exportFormat.value}`;
}

function cycleTab(direction: number) {
	const tabs = workbench.value.tabs;
	const index = tabs.findIndex(tab => tab.path === workbench.value.active);
	if (index >= 0 && tabs.length > 1) void selectTab(tabs[(index + direction + tabs.length) % tabs.length].path);
}

const commands = computed<ShellCommand[]>(() => [
	{ id: "help.open", label: "Help and shortcuts", enabled: true, run: () => openHelp("getting-started") },
	{ id: "help.release-notes", label: "Release notes", enabled: true, run: () => openHelp("release-notes") },
	{ id: "help.diagnostic-export", label: "Download diagnostic summary", enabled: true, run: downloadDiagnosticSummary },
	{ id: "preferences.open", label: "Preferences", enabled: true, run: () => { preferencesOpen.value = true; } },
	{ id: "project.open", label: "Open project", shortcut: "Ctrl/Cmd+O", enabled: true, run: openProject },
	{ id: "project.create", label: "Create project", enabled: true, run: createProject },
	{ id: "project.new-amx", label: "New AMX file", enabled: !!projectRoot.value, disabledReason: "Open a project first", run: () => createProjectFile("amx") },
	{ id: "project.new-folder", label: "New folder", enabled: !!projectRoot.value, disabledReason: "Open a project first", run: createProjectFolder },
	{ id: "project.duplicate-file", label: "Duplicate active file", enabled: !!document.value && ["amx", "csv", "json"].includes(document.value.kind), disabledReason: "Open an editable project file first", run: duplicateProjectFile },
	{ id: "project.move-file", label: "Move or rename active file", enabled: !!document.value && ["amx", "csv", "json"].includes(document.value.kind), disabledReason: "Open an editable project file first", run: moveActiveProjectFile },
	{ id: "file.open", label: "Open file", shortcut: "Ctrl/Cmd+Shift+O", enabled: !!projectRoot.value, disabledReason: "Open a project first", run: () => openDocument() },
	{ id: "tab.next", label: "Next tab", shortcut: "Ctrl/Cmd+Alt+Right", enabled: workbench.value.tabs.length > 1, disabledReason: "Open another tab first", run: () => cycleTab(1) },
	{ id: "tab.previous", label: "Previous tab", shortcut: "Ctrl/Cmd+Alt+Left", enabled: workbench.value.tabs.length > 1, disabledReason: "Open another tab first", run: () => cycleTab(-1) },
	{ id: "document.save", label: "Save active tab", shortcut: "Ctrl/Cmd+S", enabled: !!document.value?.dirty, disabledReason: "No unsaved active tab", run: save },
	{ id: "document.format", label: "Format active tab", enabled: document.value?.kind === "amx", disabledReason: "Open an AMX document first", run: format },
	{ id: "document.run", label: "Run active document", shortcut: "Ctrl/Cmd+Enter", enabled: document.value?.kind === "amx", disabledReason: "Open an AMX document first", run: runAnalysis },
	{ id: "document.preview", label: "Refresh preview", shortcut: "Ctrl/Cmd+Shift+Enter", enabled: document.value?.kind === "amx", disabledReason: "Open an AMX document first", run: refresh },
	{ id: "document.preview-toggle", label: previewPaused.value ? "Resume live preview" : "Pause live preview", enabled: document.value?.kind === "amx", disabledReason: "Open an AMX document first", run: togglePreviewPause },
	{ id: "report.settings", label: "Report Settings", enabled: document.value?.kind === "amx", disabledReason: "Open an AMX document first", run: openReportSettings },
	{ id: "project.search", label: "Search project", shortcut: "Ctrl/Cmd+Shift+F", enabled: !!projectRoot.value, disabledReason: "Open a project first", run: () => requestAnimationFrame(() => window.document.querySelector<HTMLInputElement>("#project-search")?.focus()) },
	{ id: "view.focus-editor", label: "Focus editor", enabled: !!document.value, disabledReason: "Open a document first", run: () => setFocusMode("editor") },
	{ id: "view.focus-preview", label: "Focus preview", enabled: document.value?.kind === "amx", disabledReason: "Open an AMX document first", run: () => setFocusMode("preview") },
	{ id: "document.export", label: "Export…", enabled: document.value?.kind === "amx", disabledReason: "Open an AMX document first", run: openExportWorkflow },
	{ id: "project.clear-recents", label: "Clear recent projects", enabled: !!recents.value.length, disabledReason: "History is empty", run: clearRecents }
]);

function onKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") {
		if (palette.value) dismissPalette();
		else if (helpOpen.value) helpOpen.value = false;
		else if (preferencesOpen.value) preferencesOpen.value = false;
		else if (exportDialogOpen.value) closeExportWorkflow();
		else if (reportSettingsOpen.value) closeReportSettings();
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

function openHelp(section = "getting-started") {
	helpSection.value = section;
	helpOpen.value = true;
}

function downloadDiagnosticSummary() {
	const diagnosticCodes = [...staticAnalysis.value.diagnostics, ...analysis.value.diagnostics, ...inputConfiguration.value.diagnostics].map(item => item.code);
	const contents = createDiagnosticSummary({
		generatedAt: new Date().toISOString(),
		openTabs: workbench.value.tabs.length,
		dirtyTabs: workbench.value.tabs.filter(tab => tab.dirty).length,
		diagnosticCodes,
		events: diagnosticTrail.value
	});
	const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
	const link = window.document.createElement("a");
	link.href = url;
	link.download = "openamx-diagnostic-summary.json";
	link.click();
	URL.revokeObjectURL(url);
	status.value = "Downloaded a diagnostic summary without paths, messages, source, or input values.";
}

watch(() => [...staticAnalysis.value.diagnostics, ...analysis.value.diagnostics, ...inputConfiguration.value.diagnostics].map(item => item.code), codes => {
	if (!codes.length) return;
	diagnosticTrail.value = [...diagnosticTrail.value, { at: new Date().toISOString(), codes: codes.slice(0, 100) }].slice(-20);
});

async function savePreferences(value: { theme: ShellTheme; drawerDock: DrawerDock; wrapLines: boolean; autosave: boolean; autosaveDelayMs: number }) {
	if (!Number.isSafeInteger(value.autosaveDelayMs) || value.autosaveDelayMs < 100 || value.autosaveDelayMs > 10_000) return;
	const result = await props.rpc.request.setAutosave({ enabled: value.autosave, delayMs: value.autosaveDelayMs });
	if (!result.ok) { status.value = result.error.message; return; }
	setTheme(value.theme);
	setDrawerDock(value.drawerDock);
	editorWrapLines.value = value.wrapLines;
	localStorage.setItem("openamx.editor-wrap", String(value.wrapLines));
	autosaveEnabled.value = result.enabled;
	autosaveDelayMs.value = result.delayMs;
	localStorage.setItem("openamx.autosave", String(result.enabled));
	localStorage.setItem("openamx.autosave-delay", String(result.delayMs));
	preferencesOpen.value = false;
	status.value = "Preferences saved on this device.";
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

onMounted(() => { setTheme(theme.value); setDrawerDock(drawerDock.value); void props.rpc.request.setAutosave({ enabled: autosaveEnabled.value, delayMs: autosaveDelayMs.value }); window.addEventListener("keydown", onKeydown); void syncRecents(); void syncRecovery(); });
onUnmounted(() => {
	window.removeEventListener("keydown", onKeydown);
	if (previewTimer) clearTimeout(previewTimer);
	cancelActiveJob();
});

function clearView() {
	if (previewTimer) clearTimeout(previewTimer);
	previewTimer = undefined;
	exportDialogOpen.value = false;
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
	const result = await props.rpc.request.pickProject({}, { maxRequestTime: Infinity });
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

async function createProject(starterSource?: string) {
	await pendingEdit;
	const request = ++navigationRequest;
	let failure = "";
	let cancelled = false;
	try {
		const result = await props.rpc.request.pickCreateProject({}, { maxRequestTime: Infinity });
		if (!result.ok) failure = result.error.message;
		else cancelled = result.cancelled;
	} catch (error) {
		failure = error instanceof Error ? error.message : "Project creation request failed.";
	}
	if (request !== navigationRequest) return;
	const context = await props.rpc.request.getProjectContext();
	if (request !== navigationRequest) return;
	if (cancelled && (!context.ok || !context.root)) return;
	if (!context.ok || !context.root) { status.value = failure || "Project creation did not return a project."; return; }
	clearView();
	inputOverrides.value = "";
	projectRoot.value = context.root;
	document.value = null;
	const listingError = await loadProject();
	if (workbench.value.active) {
		const active = await props.rpc.request.readDocument();
		if (active.ok) document.value = active.document;
	}
	if (starterSource && document.value?.kind === "amx") await updateText(starterSource);
	status.value = listingError ?? (starterSource ? "Created a starter project. The report is open and will autosave locally." : document.value ? "Created a new project and opened report.amx." : "Created a new project. Select report.amx in the explorer.");
}

async function activate(result: Awaited<ReturnType<typeof props.rpc.request.openDocument>>) {
	if (!result.ok) { status.value = result.error.message; return; }
	clearView();
	document.value = result.document;
	contextView.value = result.document.kind === "amx" ? "preview" : "data";
	await syncWorkbench();
	if (result.document.kind === "amx") {
		const cached = lastGoodPreviews.get(result.document.path);
		preview.value = cached?.html ?? "";
		const identity = workbench.value.requestIdentity;
		const matches = !!cached && !cached.stale && cached.revision === result.document.revision
			&& cached.projectGeneration === workbench.value.generation
			&& cached.settingsRevision === (identity?.inputSettingsRevision ?? -1);
		previewState.value = cached ? (matches ? "success" : "stale") : "idle";
		void refreshStaticAnalysis(result.document.path, result.document.revision);
		schedulePreview();
	} else {
		preview.value = "";
		if (["csv", "json", "external-data"].includes(result.document.kind)) void validateMappedData(result.document.path, result.document.revision);
	}
	void syncInputConfiguration();
	status.value = `Active: ${result.document.label ?? result.document.path.split(/[\\/]/).pop()}`;
}

async function validateMappedData(path: string, revision: number) {
	const context = dataEditorContexts.value.get(path);
	if (!context?.inputName || !workbench.value.requestIdentity || document.value?.path !== path || document.value.revision !== revision) return;
	try {
		const job = await executeJob("validate-data");
		if (!job || document.value?.path !== path || document.value.revision !== revision || workbench.value.requestIdentity?.documentRevision !== revision) return;
		const next = new Map(dataEditorContexts.value);
		if (job.status === "succeeded" && job.result?.kind === "data-validation") {
			next.set(path, { ...context, schema: job.result.schema, diagnostics: job.diagnostics });
		} else if (job.status === "failed") {
			next.set(path, { ...context, diagnostics: job.diagnostics });
		}
		dataEditorContexts.value = next;
	} catch (error) {
		if (document.value?.path !== path || document.value.revision !== revision) return;
		const next = new Map(dataEditorContexts.value);
		next.set(path, { ...context, diagnostics: [{ code: "DESKTOP_JOB", message: error instanceof Error ? error.message : "Unable to validate mapped data." }] });
		dataEditorContexts.value = next;
	}
}

function navigateMappedDeclaration(path: string) {
	const context = dataEditorContexts.value.get(path);
	if (!context?.ownerPath || !context.declarationLine) return;
	void openDocument(context.ownerPath).then(() => requestAnimationFrame(() => editorElement.value?.selectLocation(context.declarationLine!, context.declarationColumn ?? 1)));
}

function navigateDataDiagnostic(path: string, item: TextDiagnostic) {
	if (document.value?.path !== path || !item.dataLine) return;
	dataEditorElement.value?.focusDataLocation(item.dataLine, item.dataColumn ?? 1);
}

async function refreshStaticAnalysis(path: string, revision: number) {
	const request = ++staticRequest;
	staticAnalysis.value = { diagnostics: [], completions: [] };
	try {
		const result = await props.rpc.request.analyzeBuffer({ path, revision });
		if (request === staticRequest && document.value?.path === path && document.value.revision === revision && result.ok) staticAnalysis.value = result.analysis;
	} catch {
		if (request === staticRequest && document.value?.path === path && document.value.revision === revision) {
			staticAnalysis.value = { diagnostics: [{ code: "DESKTOP_RPC", message: "Static analysis is unavailable." }], completions: [] };
		}
	}
}

async function requestCompletions(cursorOffset: number): Promise<string[]> {
	await pendingEdit;
	const active = document.value;
	if (!active || active.kind !== "amx") return [];
	const result = await props.rpc.request.analyzeBuffer({ path: active.path, revision: active.revision, cursorOffset });
	if (!result.ok || document.value?.path !== active.path || document.value.revision !== active.revision) return [];
	return result.analysis.completions;
}

async function navigateSymbol(path: string, offset: number) {
	if (document.value?.path !== path) await openDocument(path);
	if (document.value?.path === path) requestAnimationFrame(() => editorElement.value?.selectOffset(offset));
}

async function showReferences(items: NonNullable<TextAnalysis["symbols"]>) {
	const references = items.filter(item => !item.declaration);
	if (!references.length) { status.value = "No proven references."; return; }
	const currentIndex = references.findIndex(item => item.file === document.value?.path && item.from === editorElement.value?.getSelectionOffset?.());
	const nextIndex = (currentIndex + 1) % references.length;
	const next = references[nextIndex]!;
	status.value = `Reference ${nextIndex + 1} of ${references.length} for ${next.name}.`;
	await navigateSymbol(next.file, next.from);
}

async function renameSymbol(offset: number, newName: string): Promise<boolean> {
	await pendingEdit;
	const active = document.value;
	if (!active || active.kind !== "amx") return false;
	const result = await props.rpc.request.renameSymbol({ offset, newName, expectedRevision: active.revision });
	if (!result.ok) { status.value = result.error.message; return false; }
	if (document.value?.path !== active.path || document.value.revision !== active.revision) return false;
	document.value = result.document;
	workbench.value = result.state;
	status.value = `Renamed symbol to ${newName}.`;
	void refreshStaticAnalysis(active.path, result.document.revision);
	return true;
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
	const result = await props.rpc.request.pickDocument({}, { maxRequestTime: Infinity });
	if (request !== navigationRequest) return;
	if (!result.ok) { status.value = result.error.message; return; }
	if (result.cancelled || !result.document) return;
	await activate({ ok: true, document: result.document });
}

async function createProjectFile(kind: "amx" | "csv" | "json") {
	const path = window.prompt(`New ${kind.toUpperCase()} file path`, `untitled.${kind}`)?.trim();
	if (!path) return;
	const result = await props.rpc.request.createProjectFile({ path, kind });
	if (!result.ok) { status.value = result.error.message; return; }
	clearView();
	document.value = result.document;
	workbench.value = result.state;
	const listingError = await loadProject();
	status.value = listingError ?? `Created ${path}.`;
}

async function createProjectFolder() {
	const path = window.prompt("New folder path")?.trim();
	if (!path) return;
	const result = await props.rpc.request.createProjectFolder({ path });
	if (!result.ok) { status.value = result.error.message; return; }
	workbench.value = result.state;
	const listingError = await loadProject();
	status.value = listingError ?? `Created ${path}.`;
}

async function duplicateProjectFile() {
	if (!document.value) return;
	const destination = window.prompt("Duplicate file path")?.trim();
	if (!destination) return;
	const result = await props.rpc.request.duplicateProjectFile({ source: document.value.path, destination });
	if (!result.ok) { status.value = result.error.message; return; }
	clearView();
	document.value = result.document;
	workbench.value = result.state;
	const listingError = await loadProject();
	status.value = listingError ?? `Created ${destination}.`;
}

async function moveActiveProjectFile() {
	await pendingEdit;
	const active = document.value;
	if (!active || !["amx", "csv", "json"].includes(active.kind)) return;
	const request = ++navigationRequest;
	const projectGeneration = workbench.value.generation;
	const name = active.path.split(/[\\/]/).pop() ?? "";
	const destination = window.prompt("Move or rename to project-relative path", name)?.trim();
	if (!destination || request !== navigationRequest) return;
	const result = await props.rpc.request.moveProjectFile({ source: active.path, destination });
	if (request !== navigationRequest || workbench.value.generation !== projectGeneration) {
		await loadProject();
		return;
	}
	if (!result.ok) { status.value = result.error.message; return; }
	clearView();
	workbench.value = result.state;
	const movedDocument = await props.rpc.request.readDocument();
	if (movedDocument.ok) document.value = movedDocument.document;
	const listingError = await loadProject();
	status.value = listingError ?? `Moved ${name} to ${destination}.`;
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
	if (document.value?.kind !== "amx") return;
	const revision = bufferRevision;
	const request = ++previewRequest;
	cancelActiveJob();
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
			previewState.value = preview.value ? "stale" : "failure";
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
		lastGoodPreviews.set(document.value.path, {
			html: preview.value, revision: document.value.revision,
			projectGeneration: workbench.value.generation, settingsRevision: workbench.value.inputSettingsRevision, stale: false
		});
		while (lastGoodPreviews.size > 10) lastGoodPreviews.delete(lastGoodPreviews.keys().next().value!);
		analysis.value = { diagnostics: rendered.diagnostics, completions: [] };
		previewState.value = "success";
	} else if (rendered.status === "cancelled" || rendered.status === "superseded") {
		previewState.value = preview.value ? "stale" : rendered.status === "cancelled" ? "cancelled" : "stale";
	} else {
		previewState.value = preview.value ? "stale" : "failure";
		analysis.value = { diagnostics: rendered.diagnostics, completions: [] };
	}
	applyInputValidation(rendered.diagnostics, rendered.status === "succeeded");
	const issues = [...analysis.value.diagnostics, ...inputConfiguration.value.diagnostics];
	status.value = issues.length ? `Preview is stale; ${issues.length} issue(s).` : "Preview reflects the current buffer.";
	pending.value = false;
}

async function updateText(text: string) {
	if (!document.value) return;
	const path = document.value.path;
	const currentDocument = document.value;
	cancelActiveJob();
	if (exportDialogOpen.value) { exportDialogOpen.value = false; exportRequest++; }
	const revision = ++bufferRevision;
	staticRequest++;
	staticAnalysis.value = { diagnostics: [], completions: [] };
	previewRequest++;
	pending.value = false;
	markAllLastGoodStale();
	previewState.value = preview.value ? "stale" : "running";
	resetResults();
	const write = props.rpc.request.updateBuffer({ text, path, sequence: revision });
	pendingEdit = write.then(() => undefined, () => undefined);
	const result = await write;
	if (!isCurrent(revision)) return;
	if (!result.ok) { status.value = result.error.message; return; }
	document.value = result.document;
	await syncWorkbench();
	if (result.document.kind === "amx") {
		void refreshStaticAnalysis(path, result.document.revision);
		schedulePreview();
	}
	else if (dataEditorContexts.value.has(path)) {
		if (dataValidationTimer) clearTimeout(dataValidationTimer);
		dataValidationTimer = setTimeout(() => void validateMappedData(path, result.document.revision), 250);
	}
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
	cancelActiveJob();
	previewRequest++;
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
		applyInputValidation(result.diagnostics, false);
		return;
	}
	summary.value = result.result.summary ?? { values: [] };
	analysis.value = { ...analysis.value, diagnostics: result.diagnostics };
	applyInputValidation(result.diagnostics, true);
	runState.value = result.diagnostics.length ? "failure" : "success";
	status.value = result.diagnostics.length ? "Analysis failed for the current buffer." : "Analysis completed for the current buffer.";
}

async function openExportWorkflow() {
	await pendingEdit;
	await syncInputSettings();
	if (document.value?.kind !== "amx") return;
	const path = document.value.path;
	const revision = document.value.revision;
	exportDialogOpen.value = true;
	exportBusy.value = true;
	exportDialogError.value = "";
	exportOutputs.value = [];
	exportOutputsTruncated.value = false;
	exportFormat.value = "html";
	exportBinding.value = "";
	exportFileName.value = "report.html";
	try {
		const discovered = await executeJob("discover-outputs");
		if (document.value?.path !== path || document.value.revision !== revision) return;
		if (!discovered || discovered.status !== "succeeded" || discovered.result?.kind !== "output-discovery") {
			exportDialogError.value = discovered?.diagnostics[0]?.message ?? "Unable to discover current export formats.";
			return;
		}
		exportOutputs.value = discovered.result.outputs ?? [];
		exportOutputsTruncated.value = !!discovered.result.outputsTruncated;
		exportBinding.value = exportOutputs.value[0]?.name ?? "";
	} catch (error) {
		exportDialogError.value = error instanceof Error ? error.message.slice(0, 1000) : "Unable to discover current export formats.";
	} finally {
		exportBusy.value = false;
	}
}

async function performExport() {
	if (document.value?.kind !== "amx" || exportBusy.value) return;
	const format = exportFormat.value;
	const dataFormat = format === "json" || format === "csv" ? format : undefined;
	const dataOutput = dataFormat ? { name: exportBinding.value, format: dataFormat } : undefined;
	const operation: DesktopJobOperation = dataFormat ? "export-data" : format as "html" | "pdf" | "docx";
	const extension = `.${format}` as ".html" | ".pdf" | ".docx" | ".json" | ".csv";
	const path = document.value.path;
	const revision = document.value.revision;
	const request = ++exportRequest;
	exportDialogError.value = "";
	exportBusy.value = true;
	try {
		const selection = await props.rpc.request.pickDestination({ extension, fileName: exportFileName.value }, { maxRequestTime: Infinity });
		if (!isCurrent(bufferRevision) || request !== exportRequest || document.value?.path !== path || document.value.revision !== revision) return;
		if (!selection.ok) { exportDialogError.value = selection.error.message; return; }
		if (selection.cancelled || !selection.selectionId) return;
		const job = await executeJob(operation, selection.selectionId, dataOutput);
		if (!isCurrent(bufferRevision) || request !== exportRequest || document.value?.path !== path || document.value.revision !== revision) return;
		if (!job) { exportDialogError.value = "Export cancelled."; return; }
		if (job.status !== "succeeded" || job.result?.kind !== "export") {
			analysis.value = { ...analysis.value, diagnostics: job.diagnostics };
			exportDialogError.value = job.diagnostics[0]?.message ?? `The ${format.toUpperCase()} export failed.`;
			return;
		}
		completedOutputId.value = job.result.outputId ?? "";
		completedOutputName.value = job.result.fileName ?? `${format.toUpperCase()} export`;
		exportStatus.value = `Saved ${completedOutputName.value} (${(job.result.bytes ?? 0).toLocaleString()} bytes)`;
		exportDialogOpen.value = false;
		await loadProject();
	} catch (error) {
		if (isCurrent(bufferRevision) && request === exportRequest) exportDialogError.value = error instanceof Error ? error.message.slice(0, 1000) : "Export request failed.";
	} finally {
		exportBusy.value = false;
	}
}

async function openExportedOutput(action: DesktopExportAction) {
	if (!completedOutputId.value) return;
	const result = await props.rpc.request.openExportedOutput({ outputId: completedOutputId.value, action });
	status.value = result.ok ? `${action === "open" ? "Opened" : "Revealed"} ${completedOutputName.value}.` : result.error.message;
}

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
				<span class="export-status" aria-live="polite">{{ exportStatus }}</span>
			</div>
		</section>
		<div class="workbench" :class="`focus-${focusMode}`" :style="{ '--explorer-width': `${explorerWidth}px`, '--preview-width': `${previewWidth}%` }">
			<aside :class="{ 'mobile-hidden': sidePanel !== 'explorer' }"><p class="kicker">PROJECT FILES</p><input id="project-search" v-model="search" aria-label="Search project files" placeholder="Search files"><div v-for="[folder, entries] in groupedFiles" :key="folder"><p class="folder">{{ folder }}</p><button v-for="file in entries" :key="file" class="file" :class="{ selected: workbench.active?.endsWith(file) }" @click="openDocument(file)">{{ file.split('/').pop() }}</button></div><p v-if="!files.length" class="muted">No project files.</p><p v-else-if="!visibleFiles.length" class="muted">No matching files.</p></aside>
			<section class="editor-pane" aria-label="AMX editor">
				<nav class="tabs" aria-label="Open tabs"><div v-for="tab in workbench.tabs" :key="tab.path" class="tab"><button :aria-current="workbench.active === tab.path ? 'page' : undefined" @click="selectTab(tab.path)">{{ tab.path.split(/[\\/]/).pop() }} <span v-if="workbench.active === tab.path">Active</span><span v-if="tab.dirty">*</span><span v-if="tab.conflict">!</span></button><button title="Close tab" :aria-label="`Close ${tab.path}`" @click="closeTab(tab.path)">×</button></div></nav>
				<div class="pane-header"><strong>{{ document?.path ?? "No document" }}</strong><span v-if="document?.dirty" class="dirty">Unsaved</span><span v-if="document?.conflict" class="failure">Conflict</span><span class="actions"><Button :disabled="!document" type="button" @click="editorElement?.openSearch()">Find</Button><Button :disabled="!document || pending" type="button" @click="format">Format</Button><Button :disabled="!document || !document.dirty" type="button" @click="save">Save</Button></span></div>
				<div v-if="document" class="entry-actions"><Button @click="reload">Reload…</Button></div>
				<CodeEditor v-if="document" ref="editorElement" :path="document.path" :text="document.text" :revision="document.revision" :highlights="staticAnalysis.highlights" :diagnostics="staticAnalysis.diagnostics" :symbols="staticAnalysis.symbols" :actions="staticAnalysis.actions" :complete="requestCompletions" :rename="renameSymbol" @change="updateText" @navigate="navigateSymbol" @references="showReferences" />
				<div class="diagnostics" :class="{ 'mobile-hidden': detailPanel !== 'diagnostics' }" aria-live="polite"><p v-for="(item, index) in staticAnalysis.diagnostics" :key="`static-${item.code}-${item.line}-${index}`"><button class="diagnostic-link" :disabled="!item.file || !item.line" @click="navigateDiagnostic(item)">Static · {{ item.code }} {{ item.file?.split(/[\\/]/).pop() }} ({{ item.line }}:{{ item.column }}) {{ displayDiagnostic(item) }}</button></p><p v-for="(item, index) in [...analysis.diagnostics, ...inputConfiguration.diagnostics]" :key="`${item.code}-${item.line}-${index}`"><strong>Run · {{ item.code }}</strong> {{ displayDiagnostic(item) }} <span v-if="item.line">({{ item.line }}:{{ item.column }})</span></p><p v-if="![...staticAnalysis.diagnostics, ...analysis.diagnostics, ...inputConfiguration.diagnostics].length" class="muted">No current diagnostics.</p></div>
			</section>
			<section class="preview-pane" :class="{ 'mobile-hidden': detailPanel !== 'preview' }" aria-label="Live HTML preview"><div class="pane-header"><strong>ACTIVE DOCUMENT PREVIEW · {{ workbench.active?.split(/[\\/]/).pop() ?? 'No document' }}</strong><span class="state" :class="`state-${previewState}`">{{ previewState }}</span></div><iframe :srcdoc="preview" sandbox="allow-scripts" title="OpenAMX live HTML preview"></iframe></section>
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
			<button type="button" aria-label="Help and shortcuts" title="Help and shortcuts" @click="openHelp('getting-started')"><CircleHelp :size="16" /></button>
			<button type="button" aria-label="Preferences" title="Preferences" @click="preferencesOpen = true"><Settings :size="16" /></button>
			<button type="button" @click="showPalette">Commands</button>
		</header>
		<WelcomeView v-if="!projectRoot" :recents="recents" :recovery="recovery" :status="status" @open-project="openProject" @create-project="createProject" @restore="restore" @restore-recovery="resolveRecovery('restore')" @discard-recovery="resolveRecovery('discard')" @clear-recents="clearRecents" @open-help="openHelp" />
		<div v-else class="workbench" :class="[`focus-${focusMode}`, `drawer-${drawerDock}`]" :style="{ '--explorer-width': `${explorerWidth}px`, '--preview-width': `${previewWidth}%` }">
			<ProjectExplorer :files="files" :folders="folders" :workbench="workbench" :can-move-active="!!document && ['amx', 'csv', 'json'].includes(document.kind)" @open="openDocument" @create-amx="createProjectFile('amx')" @create-folder="createProjectFolder" @move-active="moveActiveProjectFile" />
			<div class="divider divider-explorer" role="separator" aria-label="Resize explorer" aria-orientation="vertical" tabindex="0" @pointerdown.prevent="dragDivider($event, 'explorer')"></div>
			<section class="editor-pane" aria-label="Document editor">
				<WorkbenchTabs :workbench="workbench" @select="selectTab" @close="closeTab" />
				<div class="pane-header"><strong>{{ document?.label ?? document?.path ?? "No document" }}</strong><span v-if="document?.dirty" class="dirty">Unsaved</span><span v-if="document?.conflict" class="failure">Conflict</span><span class="actions"><button :disabled="document?.kind !== 'amx'" type="button" @click="editorElement?.openSearch()">Find</button><button :disabled="document?.kind !== 'amx' || pending" type="button" @click="format">Format</button><button :disabled="!document || !document.dirty" type="button" @click="save">Save</button></span></div>
				<CodeEditor v-if="document?.kind === 'amx'" ref="editorElement" :path="document.path" :text="document.text" :revision="document.revision" :wrap-lines="editorWrapLines" :highlights="staticAnalysis.highlights" :diagnostics="staticAnalysis.diagnostics" :symbols="staticAnalysis.symbols" :actions="staticAnalysis.actions" :complete="requestCompletions" :rename="renameSymbol" @change="updateText" @navigate="navigateSymbol" @references="showReferences" />
				<DataEditorPane v-else-if="document?.kind === 'csv' || document?.kind === 'json' || document?.kind === 'external-data'" ref="dataEditorElement" :key="document.path" :kind="document.kind === 'external-data' ? document.dataFormat ?? 'json' : document.kind" :text="document.text" :revision="document.revision" :external="document.external" :input-name="dataEditorContexts.get(document.path)?.inputName ?? document.inputName" :schema="dataEditorContexts.get(document.path)?.schema" :diagnostics="dataEditorContexts.get(document.path)?.diagnostics" @change="updateText" @navigate-declaration="navigateMappedDeclaration(document.path)" />
				<div v-else class="file-kind-shell"><strong>{{ document?.kind ?? "document" }}</strong><p>This file is read-only in the current workbench.</p></div>
			</section>
			<div class="divider divider-preview" role="separator" aria-label="Resize contextual pane" aria-orientation="vertical" tabindex="0" @pointerdown.prevent="dragDivider($event, 'preview')"></div>
			<section class="preview-pane" aria-label="Active document context">
				<div class="pane-header context-pane-header">
					<div class="context-tabs" role="tablist" aria-label="Context view">
						<button v-if="document?.kind === 'amx'" type="button" role="tab" :aria-selected="contextView === 'preview'" @click="contextView = 'preview'"><Eye :size="14" /> Preview</button>
						<button v-if="document?.kind === 'amx'" type="button" role="tab" :aria-selected="contextView === 'inputs'" @click="contextView = 'inputs'"><Database :size="14" /> Inputs</button>
						<button v-else-if="document?.kind === 'csv' || document?.kind === 'json' || document?.kind === 'external-data'" type="button" role="tab" aria-selected="true"><Database :size="14" /> Data</button>
					</div>
					<span v-if="contextView === 'preview'" class="state" :class="`state-${previewPaused ? 'paused' : previewState}`">{{ previewPaused ? "paused" : previewState }}</span>
					<span class="actions">
						<button v-if="document?.kind === 'amx' && !previewPaused" type="button" title="Pause live preview" aria-label="Pause live preview" @click="togglePreviewPause"><Pause :size="14" /></button>
						<button v-else-if="document?.kind === 'amx'" type="button" title="Resume live preview" aria-label="Resume live preview" @click="togglePreviewPause"><Play :size="14" /></button>
						<button v-if="document?.kind === 'amx'" type="button" title="Refresh preview" aria-label="Refresh preview" @click="refresh"><RefreshCw :size="14" /></button>
						<button v-if="document?.kind === 'amx'" type="button" title="Export active document" aria-label="Export active document" @click="openExportWorkflow"><Download :size="14" /> Export</button>
						<button type="button" :disabled="document?.kind !== 'amx'" @click="openReportSettings"><SlidersHorizontal :size="14" /> Report settings</button>
						<!-- <button v-if="document?.kind === 'amx'" type="button" :aria-pressed="focusMode === 'editor'" @click="setFocusMode('editor')">Source</button>
						<button v-if="document?.kind === 'amx'" type="button" :aria-pressed="focusMode === 'preview'" @click="setFocusMode('preview')">Preview</button> -->
					</span>
				</div>
				<InputsPanel v-if="contextView === 'inputs' && document?.kind === 'amx'" :configuration="inputConfiguration" :diagnostics="analysis.diagnostics" :validation="validation" :busy="inputsBusy" @browse="browseInput" @clear="clearInput" @promote="promoteInput" @open="openMappedInput" @diagnostic="navigateInputDiagnostic" @validation-change="validation = $event; validationChanged()" @declaration="(line, column) => editorElement?.selectLocation(line, column)" />
				<section v-else-if="contextView === 'data' && (document?.kind === 'csv' || document?.kind === 'json' || document?.kind === 'external-data')" class="inputs-panel data-inspector" aria-label="Data schema and validation">
					<header class="context-heading"><div><p class="eyebrow">{{ document.external ? "EXTERNAL / PRIVATE" : "ACTIVE DATA" }}</p><h2>Schema</h2></div></header>
					<p v-if="dataEditorContexts.get(document.path)?.schema" class="data-schema-summary">{{ dataEditorContexts.get(document.path)?.schema?.name }} · {{ dataEditorContexts.get(document.path)?.schema?.type }}</p>
					<p v-else class="inputs-empty">{{ dataEditorContexts.get(document.path)?.inputName ? "Loading mapped input schema…" : "Open this file from a declared AMX input to inspect its schema." }}</p>
					<button v-if="dataEditorContexts.get(document.path)?.ownerPath && dataEditorContexts.get(document.path)?.declarationLine" type="button" class="text-button" @click="navigateMappedDeclaration(document.path)">Go to AMX input declaration</button>
					<div v-if="dataEditorContexts.get(document.path)?.schema?.fields?.length" class="data-schema-fields">
						<p v-for="field in dataEditorContexts.get(document.path)?.schema?.fields" :key="field.name"><code>{{ field.name }}</code><span>{{ field.type }}<template v-if="field.optional"> · optional</template><template v-if="field.hasDefault"> · default</template></span></p>
					</div>
					<button v-for="(diagnostic, index) in dataEditorContexts.get(document.path)?.diagnostics" :key="`${diagnostic.code}-${index}`" type="button" class="data-inspector-diagnostic" :disabled="!diagnostic.dataLine" @click="navigateDataDiagnostic(document.path, diagnostic)">{{ diagnostic.code }} · {{ diagnostic.message }}<small v-if="diagnostic.dataPath || diagnostic.dataLine">{{ diagnostic.dataPath }}<template v-if="diagnostic.dataLine"> ({{ diagnostic.dataLine }}:{{ diagnostic.dataColumn ?? 1 }})</template></small></button>
				</section>
				<template v-else>
					<iframe v-if="document?.kind === 'amx'" :srcdoc="preview" sandbox="allow-scripts" title="OpenAMX live HTML preview"></iframe>
					<div v-else class="file-kind-shell"><strong>Context</strong><p>Select an AMX document to show its live report preview.</p></div>
				</template>
			</section>
			<section class="runtime-drawer" aria-label="Runtime drawer">
				<div class="drawer-heading">
					<strong>RUNTIME</strong><span class="state" :class="`state-${activeJobId !== null ? 'running' : runState}`">{{ activeJobId !== null ? "running" : runState }}</span>
					<span v-if="jobStage" class="drawer-stage">{{ jobStage }}</span><span class="header-spacer"></span>
					<button v-if="document?.kind === 'amx'" type="button" title="Run active document" aria-label="Run active document" @click="runAnalysis"><Play :size="14" /></button>
					<button v-if="activeJobId !== null" type="button" title="Cancel current job" aria-label="Cancel current job" @click="cancelActiveJob">Cancel</button>
					<button type="button" :aria-expanded="runtimeExpanded" @click="runtimeExpanded = !runtimeExpanded">{{ runtimeExpanded ? "Hide details" : "Details" }}</button>
					<button type="button" :aria-pressed="drawerDock === 'bottom'" @click="setDrawerDock('bottom')">Bottom</button>
					<button type="button" :aria-pressed="drawerDock === 'right'" @click="setDrawerDock('right')">Right</button>
				</div>
				<p class="runtime-status" role="status" aria-live="polite">{{ status }}<span v-if="jobStage"> · {{ jobStage }}</span></p>
				<progress v-if="activeJobId !== null" class="runtime-progress" aria-label="Current operation is running"></progress>
				<p v-if="cleanupPending" class="runtime-status" role="status" aria-live="polite">Worker cleanup is pending.</p>
				<p v-if="exportStatus" class="export-status" aria-live="polite">{{ exportStatus }}</p>
				<div v-if="completedOutputId" class="output-actions">
					<button type="button" title="Open exported file" aria-label="Open exported file" @click="openExportedOutput('open')"><ExternalLink :size="14" /> Open</button>
					<button type="button" title="Reveal exported file" aria-label="Reveal exported file" @click="openExportedOutput('reveal')"><FolderOpen :size="14" /> Reveal</button>
				</div>
				<div v-if="runtimeExpanded" class="runtime-details">
					<p v-for="(item, index) in staticAnalysis.diagnostics" :key="`static-${item.code}-${index}`"><button class="diagnostic-link" :disabled="!item.file || !item.line" @click="navigateDiagnostic(item)">Static {{ item.code }}: {{ displayDiagnostic(item) }}</button></p>
					<p v-for="(item, index) in analysis.diagnostics" :key="`run-${item.code}-${index}`"><button class="diagnostic-link" :disabled="!item.file || !item.line" @click="navigateDiagnostic(item)">Run {{ item.code }}: {{ displayDiagnostic(item) }}</button></p>
					<p v-for="item in summary.values" :key="item.name"><code>{{ item.name }}</code> {{ item.value }}</p>
					<p v-for="item in inputConfiguration.diagnostics" :key="`input-${item.code}-${item.inputName}`"><button class="diagnostic-link" :disabled="!item.line && !item.inputName" @click="navigateInputDiagnostic(item)">Input {{ item.code }}: {{ displayDiagnostic(item) }}</button></p>
					<p v-if="!analysis.diagnostics.length && !staticAnalysis.diagnostics.length && !summary.values.length && !inputConfiguration.diagnostics.length" class="muted">No runtime details.</p>
				</div>
			</section>
		</div>
		<CommandPalette :open="palette" :commands="commands" @dismiss="dismissPalette" />
		<HelpCenterDialog :open="helpOpen" :initial-section="helpSection" :shortcuts="commands" @close="helpOpen = false" @create-project="helpOpen = false; createProject($event)" @export-diagnostics="downloadDiagnosticSummary" />
		<PreferencesDialog :open="preferencesOpen" :theme="theme" :drawer-dock="drawerDock" :wrap-lines="editorWrapLines" :autosave="autosaveEnabled" :autosave-delay-ms="autosaveDelayMs" @close="preferencesOpen = false" @save="savePreferences" />
		<ExportDialog :open="exportDialogOpen" :active-label="document?.label ?? document?.path.split(/[\\/]/).pop() ?? ''" :outputs="exportOutputs" :selected-format="exportFormat" :selected-output="exportBinding" :file-name="exportFileName" :busy="exportBusy" :error="exportDialogError" :outputs-truncated="exportOutputsTruncated" @close="closeExportWorkflow" @format="setExportFormat" @output="setExportBinding" @file-name="exportFileName = $event" @export="performExport" />
		<ReportSettingsDialog :open="reportSettingsOpen" :settings="reportSettings" :busy="reportSettingsBusy" :error="reportSettingsError" @close="closeReportSettings" @save="saveReportSettings" @pick-logo="pickReportLogo" />
	</main>
</template>