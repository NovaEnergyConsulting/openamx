import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createPingResponse } from "../src/shared/rpc";
import { createDesktopService } from "../src/bun/desktopService";
import { writeDesktopData, writeDesktopHtml } from "../src/bun/desktopWorkflow";
import { preparePdfDestination, writePdfAtomically } from "../../src/runtime/pdfDestination";
import { prepareDocxDestination, writeDocxAtomically } from "../../src/runtime/docxDestination";
import { desktopWorkerUrl } from "../src/bun/workerEntrypoint";
import type { WorkerJobMessage, WorkerJobRequest } from "../src/bun/jobProtocol";

function workerThatReturnsThenCloses(): Worker {
	const listeners = new Map<string, EventListener>();
	return {
		addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
			listeners.set(type, typeof listener === "function" ? listener : event => listener.handleEvent(event));
		},
		postMessage(request: WorkerJobRequest) {
			const result: WorkerJobMessage = {
				kind: "complete", jobId: request.jobId,
				result: { kind: "export", format: "html", data: "<html>race-free</html>", bytes: 23 }
			};
			listeners.get("message")?.(new MessageEvent("message", { data: result }));
			listeners.get("close")?.(new Event("close"));
		},
		terminate() { return Promise.resolve(0); }
	} as unknown as Worker;
}

const result = createPingResponse("request-1", "1.4.2");
assert.deepEqual(result, { nonce: "request-1", runtime: "bun", version: "1.4.2" });
assert.deepEqual(Object.keys(result), ["nonce", "runtime", "version"]);
const webviewSource = readFileSync(join(import.meta.dir, "../src/mainview/App.vue"), "utf8");
assert.match(webviewSource, /sandbox=""/);
assert.doesNotMatch(webviewSource, /node:fs|node:child_process|loadEntryModule|loadInputValues|preparePdfReport|serializePdfReport|prepareDocxReport|serializeDocxReport|Bun\./);
const workerTestRoot = mkdtempSync(join(tmpdir(), "openamx-worker-entry-"));
const sourceWorkerRoot = join(workerTestRoot, "source");
mkdirSync(sourceWorkerRoot);
writeFileSync(join(sourceWorkerRoot, "jobWorker.ts"), "");
assert.equal(fileURLToPath(desktopWorkerUrl(pathToFileURL(join(sourceWorkerRoot, "index.ts")).href)), join(sourceWorkerRoot, "jobWorker.ts"));
const packagedWorkerRoot = join(workerTestRoot, "packaged");
mkdirSync(packagedWorkerRoot);
writeFileSync(join(packagedWorkerRoot, "jobWorker.js"), "");
assert.equal(fileURLToPath(desktopWorkerUrl(pathToFileURL(join(packagedWorkerRoot, "index.js")).href)), join(packagedWorkerRoot, "jobWorker.js"));
console.log("Typed RPC and webview boundary contract passed (4 assertions)");

const workerCloseRaceRoot = mkdtempSync(join(tmpdir(), "openamx-worker-close-race-"));
const workerCloseRaceEntry = join(workerCloseRaceRoot, "report.amx");
const workerCloseRaceTarget = join(workerCloseRaceRoot, "report.html");
writeFileSync(workerCloseRaceEntry, "```amx\nexport let value: Number = 1\n```\n");
const workerCloseRaceService = createDesktopService(undefined, { async choose() { return workerCloseRaceTarget; } }, undefined, workerThatReturnsThenCloses);
assert.equal((await workerCloseRaceService.request.openProject({ path: workerCloseRaceRoot })).ok, true);
assert.equal((await workerCloseRaceService.request.openDocument({ path: workerCloseRaceEntry })).ok, true);
const workerCloseRaceSelection = await workerCloseRaceService.request.pickDestination({ extension: ".html", fileName: "report.html" });
assert.equal(workerCloseRaceSelection.ok, true);
if (!workerCloseRaceSelection.ok || !workerCloseRaceSelection.selectionId) throw new Error("Expected worker-close-race destination selection.");
const workerCloseRaceWorkbench = await workerCloseRaceService.request.getWorkbench();
if (!workerCloseRaceWorkbench.ok || !workerCloseRaceWorkbench.state.requestIdentity) throw new Error("Active identity unavailable for worker-close-race test.");
const workerCloseRaceStart = await workerCloseRaceService.request.startJob({ operation: "html", identity: workerCloseRaceWorkbench.state.requestIdentity, selectionId: workerCloseRaceSelection.selectionId });
assert.equal(workerCloseRaceStart.ok, true);
if (!workerCloseRaceStart.ok) throw new Error(workerCloseRaceStart.error.message);
let workerCloseRaceJob = workerCloseRaceStart.job;
for (let attempt = 0; attempt < 100 && ["running", "committing"].includes(workerCloseRaceJob.status); attempt++) {
	await new Promise(resolve => setTimeout(resolve, 5));
	const polled = await workerCloseRaceService.request.getJob({ jobId: workerCloseRaceStart.job.identity.jobId });
	if (!polled.ok) throw new Error(polled.error.message);
	workerCloseRaceJob = polled.job;
}
assert.equal(workerCloseRaceJob.status, "succeeded", JSON.stringify(workerCloseRaceJob));
assert.equal(readFileSync(workerCloseRaceTarget, "utf8"), "<html>race-free</html>");
console.log("Worker result followed by immediate close does not fail atomic export commit");

const createdProjectRoot = mkdtempSync(join(tmpdir(), "openamx-create-parent-"));
const createdProjectDirectory = join(createdProjectRoot, "new-project");
mkdirSync(createdProjectDirectory);
const creationService = createDesktopService();
const createdProject = await creationService.request.createProject({ path: createdProjectDirectory });
assert.equal(createdProject.ok, true);
if (!createdProject.ok) throw new Error(createdProject.error.message);
assert.equal(createdProject.root, createdProjectDirectory);
assert.equal(createdProject.document.path, join(createdProjectDirectory, "report.amx"));
assert.deepEqual(JSON.parse(readFileSync(join(createdProjectDirectory, ".openamx", "project.json"), "utf8")), { version: 1, inputs: {} });
assert.match(readFileSync(join(createdProjectDirectory, "report.amx"), "utf8"), /export let title: String = "New Report"/);
const createdReportAnalysis = await creationService.request.analyzeBuffer();
assert.equal(createdReportAnalysis.ok, true);
if (!createdReportAnalysis.ok) throw new Error(createdReportAnalysis.error.message);
assert.deepEqual(createdReportAnalysis.analysis.diagnostics, []);
assert.equal((await creationService.request.listProjectFiles()).ok, true);
const pickedProjectDirectory = join(createdProjectRoot, "picked-project");
mkdirSync(pickedProjectDirectory);
const pickerCreationService = createDesktopService(undefined, { async choose() { return pickedProjectDirectory; } });
assert.deepEqual(await pickerCreationService.request.pickCreateProject(), { ok: true, cancelled: false, root: pickedProjectDirectory });
assert.deepEqual(await pickerCreationService.request.getProjectContext(), {
	ok: true,
	root: pickedProjectDirectory,
	state: {
		tabs: [{ path: join(pickedProjectDirectory, "report.amx"), kind: "amx", dirty: false, conflict: false, revision: 0 }],
		active: join(pickedProjectDirectory, "report.amx"), generation: 1, inputSettingsRevision: 0,
		requestIdentity: {
			canonicalActiveUri: pathToFileURL(join(pickedProjectDirectory, "report.amx")).href,
			projectGeneration: 1, documentRevision: 0, inputSettingsRevision: 0
		}
	}
});
const nonEmptyProjectDirectory = join(createdProjectRoot, "non-empty");
mkdirSync(nonEmptyProjectDirectory);
writeFileSync(join(nonEmptyProjectDirectory, "existing.txt"), "preserve");
const rejectedCreation = await creationService.request.createProject({ path: nonEmptyProjectDirectory });
assert.equal(rejectedCreation.ok, false);
assert.equal(existsSync(join(nonEmptyProjectDirectory, ".openamx", "project.json")), false);
assert.equal(readFileSync(join(nonEmptyProjectDirectory, "existing.txt"), "utf8"), "preserve");
console.log("Sprint 038 project creation assertions passed");

const autosaveRoot = mkdtempSync(join(tmpdir(), "openamx-autosave-"));
const autosaveEntry = join(autosaveRoot, "invalid.amx");
writeFileSync(autosaveEntry, "```amx\nlet value = 1\n```\n");
const autosaveService = createDesktopService();
assert.equal((await autosaveService.request.openProject({ path: autosaveRoot })).ok, true);
assert.equal((await autosaveService.request.openDocument({ path: autosaveEntry })).ok, true);
assert.deepEqual(await autosaveService.request.setAutosave({ enabled: true, delayMs: 100 }), { ok: true, enabled: true, delayMs: 100 });
const invalidAutosaveText = "```amx\nlet value =\n```\n";
assert.equal((await autosaveService.request.updateBuffer({ text: invalidAutosaveText })).ok, true);
await new Promise(resolve => setTimeout(resolve, 150));
assert.equal(readFileSync(autosaveEntry, "utf8"), invalidAutosaveText);
assert.deepEqual(await autosaveService.request.setAutosave({ enabled: false, delayMs: 100 }), { ok: true, enabled: false, delayMs: 100 });
console.log("Sprint 038 autosave assertions passed");

const recoveryRoot = mkdtempSync(join(tmpdir(), "openamx-recovery-"));
const recoveryEntry = join(recoveryRoot, "draft.amx");
const recoverySession = join(recoveryRoot, "local-session.json");
writeFileSync(recoveryEntry, "```amx\nlet value = 1\n```\n");
const recoverySource = createDesktopService(undefined, undefined, recoverySession);
assert.equal((await recoverySource.request.openProject({ path: recoveryRoot })).ok, true);
assert.equal((await recoverySource.request.openDocument({ path: recoveryEntry })).ok, true);
const recoveryText = "```amx\nlet value =\n```\n";
assert.equal((await recoverySource.request.updateBuffer({ text: recoveryText })).ok, true);
const recoveryListing = await recoverySource.request.getRecovery();
assert.equal(recoveryListing.ok, true);
if (!recoveryListing.ok) throw new Error(recoveryListing.error.message);
assert.deepEqual(recoveryListing.items, [{ path: "draft.amx", kind: "amx" }]);
assert.equal(readFileSync(recoveryEntry, "utf8"), "```amx\nlet value = 1\n```\n");
const recoveryRestart = createDesktopService(undefined, undefined, recoverySession);
const restartListing = await recoveryRestart.request.getRecovery();
assert.equal(restartListing.ok, true);
if (!restartListing.ok) throw new Error(restartListing.error.message);
assert.equal(restartListing.available, true);
const restoredRecovery = await recoveryRestart.request.resolveRecovery({ action: "restore" });
assert.equal(restoredRecovery.ok, true);
const restoredRecoveryDocument = await recoveryRestart.request.readDocument();
assert.equal(restoredRecoveryDocument.ok, true);
if (!restoredRecoveryDocument.ok) throw new Error(restoredRecoveryDocument.error.message);
assert.equal(restoredRecoveryDocument.document.text, recoveryText);
assert.equal(readFileSync(recoveryEntry, "utf8"), "```amx\nlet value = 1\n```\n");
assert.equal((await recoveryRestart.request.resolveRecovery({ action: "discard" })).ok, true);
console.log("Sprint 038 recovery assertions passed");

const trashRoot = mkdtempSync(join(tmpdir(), "openamx-trash-"));
const trashEntry = join(trashRoot, "recover.amx");
writeFileSync(trashEntry, "```amx\nlet value = 1\n```\n");
const trashService = createDesktopService();
assert.equal((await trashService.request.openProject({ path: trashRoot })).ok, true);
assert.equal((await trashService.request.deleteProjectFile({ path: "recover.amx" })).ok, true);
assert.equal(existsSync(trashEntry), false);
const trashItems = await trashService.request.listTrash();
assert.equal(trashItems.ok, true);
if (!trashItems.ok) throw new Error(trashItems.error.message);
assert.deepEqual(trashItems.items.map(item => ({ path: item.path, kind: item.kind })), [{ path: "recover.amx", kind: "amx" }]);
assert.equal((await trashService.request.restoreTrash({ id: trashItems.items[0]!.id })).ok, true);
assert.equal(readFileSync(trashEntry, "utf8"), "```amx\nlet value = 1\n```\n");
assert.equal((await trashService.request.deleteProjectFile({ path: "recover.amx" })).ok, true);
assert.equal((await trashService.request.emptyTrash()).ok, true);
assert.deepEqual(await trashService.request.listTrash(), { ok: true, items: [] });
console.log("Sprint 038 trash and restore assertions passed");

const fileOperationsRoot = mkdtempSync(join(tmpdir(), "openamx-file-operations-"));
const fileOperationsService = createDesktopService();
assert.equal((await fileOperationsService.request.openProject({ path: fileOperationsRoot })).ok, true);
assert.equal((await fileOperationsService.request.createProjectFolder({ path: "notes" })).ok, true);
const emptyFolderListing = await fileOperationsService.request.listProjectFiles();
assert.equal(emptyFolderListing.ok, true);
if (!emptyFolderListing.ok) throw new Error(emptyFolderListing.error.message);
assert.deepEqual(emptyFolderListing.folders, ["notes"]);
const createdAmx = await fileOperationsService.request.createProjectFile({ path: "notes/draft.amx", kind: "amx" });
assert.equal(createdAmx.ok, true);
if (!createdAmx.ok) throw new Error(createdAmx.error.message);
assert.match(readFileSync(join(fileOperationsRoot, "notes", "draft.amx"), "utf8"), /# New Document/);
const duplicatedAmx = await fileOperationsService.request.duplicateProjectFile({ source: "notes/draft.amx", destination: "notes/draft-copy.amx" });
assert.equal(duplicatedAmx.ok, true);
assert.equal(readFileSync(join(fileOperationsRoot, "notes", "draft-copy.amx"), "utf8"), readFileSync(join(fileOperationsRoot, "notes", "draft.amx"), "utf8"));
assert.equal((await fileOperationsService.request.createProjectFile({ path: "notes/draft.amx", kind: "amx" })).ok, false);
assert.equal((await fileOperationsService.request.createProjectFolder({ path: ".openamx/hidden" })).ok, false);
assert.equal((await fileOperationsService.request.duplicateProjectFile({ source: "notes/draft.amx", destination: "../outside.amx" })).ok, false);
console.log("Sprint 038 file operation assertions passed");

const moveRoot = mkdtempSync(join(tmpdir(), "openamx-move-"));
mkdirSync(join(moveRoot, "lib"));
mkdirSync(join(moveRoot, "lib", "inner"));
mkdirSync(join(moveRoot, "schemas"));
const moveSource = join(moveRoot, "lib", "value.amx");
const moveDependency = join(moveRoot, "lib", "inner", "factor.amx");
const moveEntry = join(moveRoot, "main.amx");
const secondMoveEntry = join(moveRoot, "other.amx");
const aliasMoveEntry = join(moveRoot, "alias-user.amx");
writeFileSync(moveSource, '```amx\nimport { factor } from "./inner/factor.amx"\nexport let value: Number = factor * 41\n```\n');
writeFileSync(moveDependency, "```amx\nexport let factor: Number = 1\n```\n");
writeFileSync(moveEntry, '# Main\n\n```amx\nimport { value } from "./lib/value.amx"\nexport let result: Number = value + 1\n```\n');
writeFileSync(secondMoveEntry, '```amx\nimport { value } from "./lib/value.amx"\nexport let other: Number = value + 2\n```\n');
symlinkSync(moveSource, join(moveRoot, "alias.amx"));
writeFileSync(aliasMoveEntry, '```amx\nimport { value } from "./alias.amx"\nexport let aliasValue: Number = value\n```\n');
const moveService = createDesktopService();
assert.equal((await moveService.request.openProject({ path: moveRoot })).ok, true);
assert.equal((await moveService.request.setAutosave({ enabled: false, delayMs: 500 })).ok, true);
assert.equal((await moveService.request.openDocument({ path: moveEntry })).ok, true);
const unsavedEntryText = '# Unsaved main\n\n```amx\nimport { value } from "./lib/value.amx"\nexport let result: Number = value + 1\n```\n';
assert.equal((await moveService.request.updateBuffer({ text: unsavedEntryText })).ok, true);
assert.equal((await moveService.request.openDocument({ path: secondMoveEntry })).ok, true);
assert.equal((await moveService.request.openDocument({ path: moveSource })).ok, true);
const unsavedModuleText = '```amx\nimport { factor } from "./inner/factor.amx"\nexport let value: Number = factor * 43\n```\n';
assert.equal((await moveService.request.updateBuffer({ text: unsavedModuleText })).ok, true);
const symlinkMove = await moveService.request.moveProjectFile({ source: moveSource, destination: "schemas/value.amx" });
assert.equal(symlinkMove.ok, false);
assert.equal(existsSync(moveSource), true);
assert.equal(existsSync(join(moveRoot, "schemas", "value.amx")), false);
unlinkSync(aliasMoveEntry);
unlinkSync(join(moveRoot, "alias.amx"));
const movedResult = await moveService.request.moveProjectFile({ source: moveSource, destination: "schemas/value.amx" });
if (!movedResult.ok) throw new Error(movedResult.error.message);
assert.equal(movedResult.ok, true);
assert.equal(existsSync(moveSource), false);
const movedModuleExpectedText = unsavedModuleText.replace("./inner/factor.amx", "../lib/inner/factor.amx");
assert.equal(readFileSync(join(moveRoot, "schemas", "value.amx"), "utf8"), movedModuleExpectedText);
assert.match(readFileSync(join(moveRoot, "schemas", "value.amx"), "utf8"), /from "\.\.\/lib\/inner\/factor\.amx"/);
assert.match(readFileSync(moveEntry, "utf8"), /from "\.\/schemas\/value\.amx"/);
assert.match(readFileSync(secondMoveEntry, "utf8"), /from "\.\/schemas\/value\.amx"/);
assert.equal(movedResult.state.active, join(moveRoot, "schemas", "value.amx"));
const movedEntryTab = await moveService.request.selectTab({ path: moveEntry });
assert.equal(movedEntryTab.ok, true);
if (!movedEntryTab.ok) throw new Error(movedEntryTab.error.message);
assert.match(movedEntryTab.document.text, /from "\.\/schemas\/value\.amx"/);
assert.match(movedEntryTab.document.text, /# Unsaved main/);
const collisionMove = await moveService.request.moveProjectFile({ source: moveEntry, destination: "schemas/value.amx" });
assert.equal(collisionMove.ok, false);
assert.match(readFileSync(moveEntry, "utf8"), /from "\.\/schemas\/value\.amx"/);
const movedRun = await moveService.request.runBuffer();
assert.equal(movedRun.ok, true);
console.log("Sprint 038 transactional AMX move assertions passed");

const staleMoveRoot = mkdtempSync(join(tmpdir(), "openamx-move-conflict-"));
mkdirSync(join(staleMoveRoot, "lib"));
mkdirSync(join(staleMoveRoot, "new-lib"));
const staleMoveSource = join(staleMoveRoot, "lib", "value.amx");
const staleMoveEntry = join(staleMoveRoot, "main.amx");
writeFileSync(staleMoveSource, "```amx\nexport let value: Number = 1\n```\n");
writeFileSync(staleMoveEntry, '```amx\nimport { value } from "./lib/value.amx"\nexport let result: Number = value\n```\n');
const staleMoveService = createDesktopService();
assert.equal((await staleMoveService.request.openProject({ path: staleMoveRoot })).ok, true);
assert.equal((await staleMoveService.request.openDocument({ path: staleMoveEntry })).ok, true);
assert.equal((await staleMoveService.request.openDocument({ path: staleMoveSource })).ok, true);
const externallyChangedEntry = '```amx\nimport { value } from "./lib/value.amx"\nexport let result: Number = value + 1\n```\n';
writeFileSync(staleMoveEntry, externallyChangedEntry);
const staleMoveResult = await staleMoveService.request.moveProjectFile({ source: staleMoveSource, destination: "new-lib/value.amx" });
assert.equal(staleMoveResult.ok, false);
assert.equal(readFileSync(staleMoveEntry, "utf8"), externallyChangedEntry);
assert.equal(existsSync(staleMoveSource), true);
assert.equal(existsSync(join(staleMoveRoot, "new-lib", "value.amx")), false);
console.log("Sprint 038 stale move conflict assertions passed");

const root = mkdtempSync(join(tmpdir(), "openamx-desktop-"));
mkdirSync(join(root, "nested"));
const entry = join(root, "main.amx");
writeFileSync(entry, "# Saved\n\n```amx\nlet value = 1\n```\n");
writeFileSync(join(root, "nested", "module.amx"), "```amx\nlet value = 2\n```");
const outside = join(tmpdir(), `openamx-outside-${Date.now()}.amx`);
writeFileSync(outside, "```amx\nlet value = 3\n```");
symlinkSync(outside, join(root, "nested", "outside.amx"));

let selectedServiceDestination: string | undefined;
const service = createDesktopService(undefined, {
	async choose() { return selectedServiceDestination; },
	confirmOverwrite() { return true; }
});
async function selectedExport(target: string, operation: "html" | "pdf" | "docx") {
	selectedServiceDestination = target;
	const selection = await service.request.pickDestination({ extension: `.${operation}` as ".html" | ".pdf" | ".docx", fileName: basename(target) });
	if (!selection.ok) return selection;
	if (selection.cancelled || !selection.selectionId) throw new Error("Expected a native destination selection.");
	const active = await service.request.getWorkbench();
	if (!active.ok || !active.state.requestIdentity) throw new Error("Active export identity is unavailable.");
	const started = await service.request.startJob({ operation, identity: active.state.requestIdentity, selectionId: selection.selectionId });
	if (!started.ok) return started;
	let job = started.job;
	for (let attempt = 0; attempt < 200 && ["running", "committing"].includes(job.status); attempt++) {
		await new Promise(resolve => setTimeout(resolve, 10));
		const polled = await service.request.getJob({ jobId: job.identity.jobId });
		if (!polled.ok) throw new Error(polled.error.message);
		job = polled.job;
	}
	return { ok: true as const, job };
}
assert.deepEqual(await service.request.setAutosave({ enabled: false, delayMs: 500 }), { ok: true, enabled: false, delayMs: 500 });
const project = await service.request.openProject({ path: root });
assert.equal(project.ok, true);
const opened = await service.request.openDocument({ path: entry });
assert.equal(opened.ok, true);
if (!opened.ok) throw new Error(opened.error.message);
const initialWorkbench = await service.request.getWorkbench();
assert.equal(initialWorkbench.ok, true);
if (!initialWorkbench.ok) throw new Error(initialWorkbench.error.message);
assert.deepEqual(initialWorkbench.state.requestIdentity, {
	canonicalActiveUri: pathToFileURL(entry).href,
	projectGeneration: initialWorkbench.state.generation,
	documentRevision: opened.document.revision,
	inputSettingsRevision: 0
});
const changedSettings = await service.request.setInputSettings({ inputMappings: [], validation: "fail-fast" });
assert.equal(changedSettings.ok, true);
if (!changedSettings.ok) throw new Error(changedSettings.error.message);
assert.equal(changedSettings.state.inputSettingsRevision, 1);
const sameSettings = await service.request.setInputSettings({ inputMappings: [], validation: "fail-fast" });
assert.equal(sameSettings.ok, true);
if (!sameSettings.ok) throw new Error(sameSettings.error.message);
assert.equal(sameSettings.state.inputSettingsRevision, 1);
const resetSettings = await service.request.setInputSettings({ inputMappings: [], validation: "aggregate" });
assert.equal(resetSettings.ok, true);
if (!resetSettings.ok) throw new Error(resetSettings.error.message);
assert.equal(resetSettings.state.inputSettingsRevision, 2);
const changed = await service.request.updateBuffer({ text: "# Unsaved\n\n```amx\nlet value = 42\n```\n" });
assert.equal(changed.ok, true);
if (!changed.ok) throw new Error(changed.error.message);
assert.equal(changed.document.dirty, true);
const moduleTab = await service.request.openDocument({ path: join(root, "nested", "module.amx") });
assert.equal(moduleTab.ok, true);
await service.request.updateBuffer({ text: "# Dirty module\n" });
const restoredEntry = await service.request.selectTab({ path: entry });
assert.equal(restoredEntry.ok, true);
if (!restoredEntry.ok) throw new Error(restoredEntry.error.message);
assert.equal(restoredEntry.document.text, changed.document.text);
const restoredModule = await service.request.selectTab({ path: join(root, "nested", "module.amx") });
assert.equal(restoredModule.ok, true);
if (!restoredModule.ok) throw new Error(restoredModule.error.message);
assert.equal(restoredModule.document.text, "# Dirty module\n");
await service.request.selectTab({ path: entry });
const lateModuleEdit = await service.request.updateBuffer({ path: join(root, "nested", "module.amx"), text: "# latest module edit\n", sequence: 10 });
assert.equal(lateModuleEdit.ok, true);
const olderModuleEdit = await service.request.updateBuffer({ path: join(root, "nested", "module.amx"), text: "# stale module edit\n", sequence: 9 });
assert.equal(olderModuleEdit.ok, false);
const stillEntry = await service.request.readDocument();
assert.equal(stillEntry.ok, true);
if (!stillEntry.ok) throw new Error(stillEntry.error.message);
assert.equal(stillEntry.document.text, changed.document.text);
const preview = await service.request.previewBuffer();
assert.equal(preview.ok, true);
if (!preview.ok) throw new Error(preview.error.message);
assert.match(preview.html, /Unsaved/);
const files = await service.request.listProjectFiles();
assert.equal(files.ok, true);
if (!files.ok) throw new Error(files.error.message);
assert.deepEqual(files.files.map(file => file.path).sort(), ["main.amx", "nested/module.amx"]);
const rejected = await service.request.openDocument({ path: outside });
assert.equal(rejected.ok, false);
writeFileSync(entry, "# Changed elsewhere\n");
const conflict = await service.request.saveDocument();
assert.equal(conflict.ok, false);
if (conflict.ok) throw new Error("Expected a save conflict");
assert.equal(conflict.error.code, "DESKTOP_CONFLICT");
await service.request.updateBuffer({ text: "```amx\nlet value = 1\n" });
const diagnostics = await service.request.analyzeBuffer();
assert.equal(diagnostics.ok, true);
if (!diagnostics.ok) throw new Error(diagnostics.error.message);
assert.equal(diagnostics.analysis.diagnostics[0]?.code, "AMX3001");
assert.equal(diagnostics.analysis.diagnostics[0]?.file, entry);
assert.equal(diagnostics.analysis.diagnostics[0]?.line, 1);
await service.request.updateBuffer({ text: "# \u{1F600}\r\n\r\n```amx\r\nlet value =\r\n```\r\n" });
const originalLocation = await service.request.analyzeBuffer();
assert.equal(originalLocation.ok, true);
if (!originalLocation.ok) throw new Error(originalLocation.error.message);
assert.equal(originalLocation.analysis.diagnostics[0]?.file, entry);
assert.equal(originalLocation.analysis.diagnostics[0]?.line, 4);
const incompleteCompletionText = "```amx\nlet earlier: Number = 2\nlet unfinished: Number = \n```\n";
const incompleteCompletionDocument = await service.request.updateBuffer({ text: incompleteCompletionText });
assert.equal(incompleteCompletionDocument.ok, true);
if (!incompleteCompletionDocument.ok) throw new Error(incompleteCompletionDocument.error.message);
const incompleteCompletion = await service.request.analyzeBuffer({
	path: entry,
	revision: incompleteCompletionDocument.document.revision,
	cursorOffset: incompleteCompletionText.indexOf("let unfinished") + "let unfinished: Number = ".length
});
assert.equal(incompleteCompletion.ok, true);
if (!incompleteCompletion.ok) throw new Error(incompleteCompletion.error.message);
assert.ok(incompleteCompletion.analysis.completions.includes("earlier"));
assert.ok(!incompleteCompletion.analysis.completions.includes("unfinished"));
assert.equal(incompleteCompletion.analysis.diagnostics[0]?.code, "AMX3001");
console.log("Desktop session contract passed (11 assertions)");

const actionRoot = mkdtempSync(join(tmpdir(), "openamx-editor-action-"));
const actionEntry = join(actionRoot, "report.amx");
const uniqueActionText = "```amx\ntype Row {\n  id: String\n}\nlet rows: Row[] = []\ntable report = table(rows) {\n  title: \"Report\"\n  column id as \"ID\"\n}\nshow reprot\n```\n";
writeFileSync(actionEntry, uniqueActionText);
const actionService = createDesktopService();
assert.equal((await actionService.request.openProject({ path: actionRoot })).ok, true);
const openedActionEntry = await actionService.request.openDocument({ path: actionEntry });
assert.equal(openedActionEntry.ok, true);
if (!openedActionEntry.ok) throw new Error(openedActionEntry.error.message);
const uniqueActionAnalysis = await actionService.request.analyzeBuffer({ path: actionEntry, revision: openedActionEntry.document.revision });
assert.equal(uniqueActionAnalysis.ok, true);
if (!uniqueActionAnalysis.ok) throw new Error(uniqueActionAnalysis.error.message);
assert.equal(uniqueActionAnalysis.analysis.diagnostics[0]?.code, "AMX3001");
assert.ok(uniqueActionAnalysis.analysis.highlights?.some(fact => uniqueActionText.slice(fact.from, fact.to) === "show"));
assert.equal(uniqueActionAnalysis.analysis.actions?.[0]?.expected, "reprot");
assert.equal(uniqueActionAnalysis.analysis.actions?.[0]?.replacement, "report");
const ambiguousActionText = uniqueActionText.replace(/show reprot/, "table overview = table(rows) {\n  title: \"Overview\"\n  column id as \"ID\"\n}\nshow reprot");
const ambiguousActionBuffer = await actionService.request.updateBuffer({ text: ambiguousActionText });
assert.equal(ambiguousActionBuffer.ok, true);
if (!ambiguousActionBuffer.ok) throw new Error(ambiguousActionBuffer.error.message);
const ambiguousActionAnalysis = await actionService.request.analyzeBuffer({ path: actionEntry, revision: ambiguousActionBuffer.document.revision });
assert.equal(ambiguousActionAnalysis.ok, true);
if (!ambiguousActionAnalysis.ok) throw new Error(ambiguousActionAnalysis.error.message);
assert.deepEqual(ambiguousActionAnalysis.analysis.actions, []);

const renameRoot = mkdtempSync(join(tmpdir(), "openamx-symbol-rename-"));
const renameDependency = join(renameRoot, "model.amx");
const renameEntry = join(renameRoot, "report.amx");
const renameDependencyText = "```amx\nexport let amount: Number = 2\n```\n";
const renameEntryText = "```amx\nimport { amount } from \"./model.amx\"\nexport let result: Number = amount + amount\n```\n";
writeFileSync(renameDependency, renameDependencyText);
writeFileSync(renameEntry, renameEntryText);
const renameService = createDesktopService();
assert.equal((await renameService.request.openProject({ path: renameRoot })).ok, true);
const renameOpened = await renameService.request.openDocument({ path: renameEntry });
assert.equal(renameOpened.ok, true);
if (!renameOpened.ok) throw new Error(renameOpened.error.message);
const staleRename = await renameService.request.renameSymbol({ offset: renameEntryText.lastIndexOf("amount"), newName: "quantity", expectedRevision: renameOpened.document.revision - 1 });
assert.equal(staleRename.ok, false);
const renamed = await renameService.request.renameSymbol({ offset: renameEntryText.lastIndexOf("amount"), newName: "quantity", expectedRevision: renameOpened.document.revision });
assert.equal(renamed.ok, true);
if (!renamed.ok) throw new Error(renamed.error.message);
assert.equal(readFileSync(renameDependency, "utf8"), renameDependencyText.replaceAll("amount", "quantity"));
assert.equal(readFileSync(renameEntry, "utf8"), renameEntryText.replaceAll("amount", "quantity"));
const beforeCollision = readFileSync(renameEntry, "utf8");
const collisionRename = await renameService.request.renameSymbol({ offset: beforeCollision.indexOf("quantity"), newName: "result", expectedRevision: renamed.document.revision });
assert.equal(collisionRename.ok, false);
assert.equal(readFileSync(renameEntry, "utf8"), beforeCollision);
const reservedRename = await renameService.request.renameSymbol({ offset: beforeCollision.indexOf("quantity"), newName: "if", expectedRevision: renamed.document.revision });
assert.equal(reservedRename.ok, false);
assert.equal(readFileSync(renameEntry, "utf8"), beforeCollision);

const dataRoot = join(root, "data");
mkdirSync(dataRoot);
const entrySource = `# Analysis\n\n\`\`\`amx\nimport { Row, addTen } from "./nested/module.amx"\ninput amounts: Number[]\ninput rows: Row[]\nexport let result: Number = addTen(sum(amounts) + sum(for row in rows {\n  return row.amount\n}))\n\`\`\`\n`;
const savedSource = `# Analysis\n\n\`\`\`amx\nimport { Row, addTen } from "./nested/module.amx"\ninput amounts: Number[]\ninput rows: Row[]\nexport let result: Number = addTen(1)\n\`\`\`\n`;
writeFileSync(entry, savedSource);
const dependencyPath = join(root, "nested", "module.amx");
const savedDependencySource = `\`\`\`amx\nexport type Row {\n  amount: Number\n}\nexport fn addTen(value: Number): Number = value + 10\n\`\`\`\n`;
writeFileSync(dependencyPath, savedDependencySource);
writeFileSync(join(dataRoot, "amounts.json"), "[2, 3]");
writeFileSync(join(dataRoot, "rows.csv"), "amount\n4\n6\n");
const reopened = await service.request.openDocument({ path: entry });
assert.equal(reopened.ok, true);
const explicitReload = await service.request.reloadTab({ action: "discard" });
assert.equal(explicitReload.ok, true);
const unsaved = await service.request.updateBuffer({ text: entrySource });
assert.equal(unsaved.ok, true);
const openedDependency = await service.request.openDocument({ path: join(root, "nested", "module.amx") });
assert.equal(openedDependency.ok, true);
const overlayDependencySource = `\`\`\`amx\nexport type Row {\n  amount: Number\n}\nexport fn addTen(value: Number): Number = value + 20\n\`\`\`\n`;
const dirtyDependency = await service.request.updateBuffer({ text: overlayDependencySource });
assert.equal(dirtyDependency.ok, true);
const activeReport = await service.request.selectTab({ path: entry });
assert.equal(activeReport.ok, true);
if (!activeReport.ok) throw new Error(activeReport.error.message);
const editorFacts = await service.request.analyzeBuffer({ path: entry, revision: activeReport.document.revision, cursorOffset: entrySource.indexOf("export let result") });
assert.equal(editorFacts.ok, true);
if (!editorFacts.ok) throw new Error(editorFacts.error.message);
assert.equal(editorFacts.analysis.diagnostics.length, 0);
assert.ok(editorFacts.analysis.completions.includes("addTen"));
assert.ok(editorFacts.analysis.highlights?.some(fact => entrySource.slice(fact.from, fact.to) === "result"));
assert.ok(editorFacts.analysis.symbols?.some(fact => fact.name === "addTen" && fact.origin === dependencyPath));
assert.ok(editorFacts.analysis.symbols?.some(fact => fact.name === "result" && fact.declaration));
const staleEditorFacts = await service.request.analyzeBuffer({ path: entry, revision: activeReport.document.revision - 1, cursorOffset: 0 });
assert.equal(staleEditorFacts.ok, false);
const overlayRun = await service.request.runBuffer({
	inputMappings: [`amounts=${join(dataRoot, "amounts.json")}`, `rows=${join(dataRoot, "rows.csv")}`]
});
assert.equal(overlayRun.ok, true);
if (!overlayRun.ok) throw new Error(overlayRun.error.message);
assert.deepEqual(overlayRun.diagnostics, []);
assert.deepEqual(overlayRun.summary.values.find(value => value.name === "result"), { name: "result", value: 35 });
assert.equal(readFileSync(dependencyPath, "utf8"), savedDependencySource);
const unchangedEntry = await service.request.selectTab({ path: entry });
assert.equal(unchangedEntry.ok, true);
if (!unchangedEntry.ok) throw new Error(unchangedEntry.error.message);
assert.equal(unchangedEntry.document.text, entrySource);
const overlayPreview = await service.request.previewBuffer({
	inputMappings: [`amounts=${join(dataRoot, "amounts.json")}`, `rows=${join(dataRoot, "rows.csv")}`]
});
assert.equal(overlayPreview.ok, true);
if (!overlayPreview.ok) throw new Error(overlayPreview.error.message);
assert.deepEqual(overlayPreview.diagnostics, []);
assert.ok(overlayPreview.html.length > 0);

const jobMappings = [`amounts=${join(dataRoot, "amounts.json")}`, `rows=${join(dataRoot, "rows.csv")}`];
const jobSettings = await service.request.setInputSettings({ inputMappings: jobMappings, validation: "aggregate" });
assert.equal(jobSettings.ok, true);
if (!jobSettings.ok) throw new Error(jobSettings.error.message);
const runIdentity = jobSettings.state.requestIdentity;
assert.ok(runIdentity);
if (!runIdentity) throw new Error("Active document request identity was not available.");
const startedRun = await service.request.startJob({ operation: "run", identity: runIdentity });
assert.equal(startedRun.ok, true);
if (!startedRun.ok) throw new Error(startedRun.error.message);
let completedRun = startedRun.job;
for (let attempt = 0; attempt < 100 && ["running", "committing"].includes(completedRun.status); attempt++) {
	await new Promise(resolve => setTimeout(resolve, 10));
	const polled = await service.request.getJob({ jobId: startedRun.job.identity.jobId });
	assert.equal(polled.ok, true);
	if (!polled.ok) throw new Error(polled.error.message);
	completedRun = polled.job;
}
assert.equal(completedRun.status, "succeeded");
assert.equal(completedRun.identity.jobId, startedRun.job.identity.jobId);
assert.deepEqual(completedRun.result, { kind: "run", summary: { values: [{ name: "result", value: 35 }] } });

const validDataJob = await service.request.startJob({
	operation: "validate-data", identity: runIdentity,
	inputInspection: { name: "rows", format: "json", text: "[{\"amount\":8}]" }
});
assert.equal(validDataJob.ok, true);
if (!validDataJob.ok) throw new Error(validDataJob.error.message);
let validatedData = validDataJob.job;
for (let attempt = 0; attempt < 100 && validatedData.status === "running"; attempt++) {
	await new Promise(resolve => setTimeout(resolve, 10));
	const polled = await service.request.getJob({ jobId: validDataJob.job.identity.jobId });
	assert.equal(polled.ok, true);
	if (!polled.ok) throw new Error(polled.error.message);
	validatedData = polled.job;
}
assert.equal(validatedData.status, "succeeded");
assert.deepEqual(validatedData.result, {
	kind: "data-validation", valid: true,
	schema: {
		name: "rows", type: "Row[]", acceptedFormats: ["json", "csv"],
		fields: [{ name: "amount", type: "Number", optional: false, hasDefault: false }]
		},
	outputs: [{ name: "result", type: "Number", formats: ["json"] }]
});
assert.deepEqual(validatedData.diagnostics, []);

const outputRoot = join(root, "named-output-project");
mkdirSync(outputRoot);
mkdirSync(join(outputRoot, "data"));
mkdirSync(join(outputRoot, ".openamx"));
const outputEntry = join(outputRoot, "report.amx");
const outputEntryText = "# Unsaved report graph\n\nResult: {{ result }}\n\n```amx\nimport { Row, base } from \"./model.amx\"\ninput values: Number[]\ninput rows: Row[]\nexport let result: Number = base + sum(values)\nexport let results: Row[] = rows\nlet privateValue: Number = 99\n```\n";
writeFileSync(outputEntry, outputEntryText);
const outputModel = join(outputRoot, "model.amx");
writeFileSync(outputModel, "```amx\nexport type Row {\n  amount: Number\n}\nexport let base: Number = 10\n```\n");
writeFileSync(join(outputRoot, "data", "values.json"), "[5]");
writeFileSync(join(outputRoot, "data", "rows.csv"), "amount\n2\n");
writeFileSync(join(outputRoot, ".openamx", "project.json"), JSON.stringify({ version: 1, inputs: { values: "data/values.json", rows: "data/rows.csv" } }));
let selectedOutputPath: string | undefined;
let openedOutputPath = "";
let revealedOutputPath = "";
const outputService = createDesktopService(undefined, {
	async choose() { return selectedOutputPath; },
	confirmOverwrite() { return true; },
	openPath(path) { openedOutputPath = path; return true; },
	revealPath(path) { revealedOutputPath = path; return true; }
});
assert.equal((await outputService.request.setAutosave({ enabled: false, delayMs: 500 })).ok, true);
assert.equal((await outputService.request.openProject({ path: outputRoot })).ok, true);
assert.equal((await outputService.request.openDocument({ path: outputEntry })).ok, true);
assert.equal((await outputService.request.openDocument({ path: outputModel })).ok, true);
assert.equal((await outputService.request.updateBuffer({ text: "```amx\nexport type Row {\n  amount: Number\n}\nexport let base: Number = 30\n```\n" })).ok, true);
assert.equal((await outputService.request.openDocument({ path: outputEntry })).ok, true);
assert.equal((await outputService.request.updateBuffer({ text: `${outputEntryText}\n# current active buffer\n` })).ok, true);
const discoveryWorkbench = await outputService.request.getWorkbench();
assert.equal(discoveryWorkbench.ok, true);
if (!discoveryWorkbench.ok || !discoveryWorkbench.state.requestIdentity) throw new Error("Active identity unavailable before output discovery.");
const discoveredOutputs = await outputService.request.startJob({ operation: "discover-outputs", identity: discoveryWorkbench.state.requestIdentity });
assert.equal(discoveredOutputs.ok, true);
if (!discoveredOutputs.ok) throw new Error(discoveredOutputs.error.message);
let outputDiscovery = discoveredOutputs.job;
for (let attempt = 0; attempt < 100 && outputDiscovery.status === "running"; attempt++) {
	await new Promise(resolve => setTimeout(resolve, 10));
	const polled = await outputService.request.getJob({ jobId: discoveredOutputs.job.identity.jobId });
	assert.equal(polled.ok, true);
	if (!polled.ok) throw new Error(polled.error.message);
	outputDiscovery = polled.job;
}
assert.equal(outputDiscovery.status, "succeeded");
assert.deepEqual(outputDiscovery.result, { kind: "output-discovery", outputs: [
	{ name: "result", type: "Number", formats: ["json"] },
	{ name: "results", type: "Row[]", formats: ["json", "csv"] }
] });

async function runOutputExport(target: string, operation: "html" | "pdf" | "docx" | "export-data", dataOutput?: { name: string; format: "json" | "csv" }) {
	selectedOutputPath = target;
	const extension = operation === "export-data" ? `.${dataOutput!.format}` as ".json" | ".csv" : `.${operation}` as ".html" | ".pdf" | ".docx";
	const selection = await outputService.request.pickDestination({ extension, fileName: basename(target) });
	if (!selection.ok) throw new Error(selection.error.message);
	if (selection.cancelled || !selection.selectionId) throw new Error("Native output selection was cancelled.");
	const active = await outputService.request.getWorkbench();
	if (!active.ok || !active.state.requestIdentity) throw new Error("Active output identity is unavailable.");
	const started = await outputService.request.startJob({ operation, identity: active.state.requestIdentity, selectionId: selection.selectionId, dataOutput });
	if (!started.ok) throw new Error(started.error.message);
	let job = started.job;
	for (let attempt = 0; attempt < 100 && ["running", "committing"].includes(job.status); attempt++) {
		await new Promise(resolve => setTimeout(resolve, 10));
		const polled = await outputService.request.getJob({ jobId: job.identity.jobId });
		if (!polled.ok) throw new Error(polled.error.message);
		job = polled.job;
	}
	return job;
}

const namedJsonPath = join(outputRoot, "data", "result.json");
selectedOutputPath = namedJsonPath;
const namedJsonSelection = await outputService.request.pickDestination({ extension: ".json", fileName: "result.json" });
assert.equal(namedJsonSelection.ok, true);
if (!namedJsonSelection.ok) throw new Error(namedJsonSelection.error.message);
assert.equal(namedJsonSelection.path, undefined);
assert.equal(namedJsonSelection.fileName, "result.json");
const namedJsonJob = await outputService.request.startJob({
	operation: "export-data", identity: outputDiscovery.identity, selectionId: namedJsonSelection.selectionId,
	dataOutput: { name: "result", format: "json" }
});
assert.equal(namedJsonJob.ok, true);
if (!namedJsonJob.ok) throw new Error(namedJsonJob.error.message);
let namedJsonResult = namedJsonJob.job;
for (let attempt = 0; attempt < 100 && ["running", "committing"].includes(namedJsonResult.status); attempt++) {
	await new Promise(resolve => setTimeout(resolve, 10));
	const polled = await outputService.request.getJob({ jobId: namedJsonJob.job.identity.jobId });
	assert.equal(polled.ok, true);
	if (!polled.ok) throw new Error(polled.error.message);
	namedJsonResult = polled.job;
}
const namedJsonWorkbench = await outputService.request.getWorkbench();
assert.equal(namedJsonResult.status, "succeeded", JSON.stringify({ job: namedJsonResult, state: namedJsonWorkbench }));
assert.equal(namedJsonResult.result?.kind, "export");
if (namedJsonResult.result?.kind !== "export") throw new Error("Expected named JSON output.");
assert.equal(namedJsonResult.result.name, "result");
assert.equal(namedJsonResult.result.path, undefined);
assert.equal(typeof namedJsonResult.result.outputId, "string");
assert.equal(namedJsonResult.result.fileName, "result.json");
assert.equal(readFileSync(namedJsonPath, "utf8"), "35\n");
assert.equal(JSON.stringify(namedJsonResult).includes(namedJsonPath), false);
if (!namedJsonResult.result.outputId) throw new Error("Export output ID was not returned.");
assert.deepEqual(await outputService.request.openExportedOutput({ outputId: namedJsonResult.result.outputId, action: "open" }), { ok: true });
assert.deepEqual(await outputService.request.openExportedOutput({ outputId: namedJsonResult.result.outputId, action: "reveal" }), { ok: true });
assert.equal(openedOutputPath, namedJsonPath);
assert.equal(revealedOutputPath, namedJsonPath);

const namedRowsJsonPath = join(outputRoot, "data", "results.json");
const rowsJsonStartedAt = performance.now();
const namedRowsJson = await runOutputExport(namedRowsJsonPath, "export-data", { name: "results", format: "json" });
const rowsJsonDurationMs = performance.now() - rowsJsonStartedAt;
assert.equal(namedRowsJson.status, "succeeded");
assert.deepEqual(JSON.parse(readFileSync(namedRowsJsonPath, "utf8")), [{ amount: 2 }]);
const namedRowsCsvPath = join(outputRoot, "data", "results.csv");
const rowsCsvStartedAt = performance.now();
const namedRowsCsv = await runOutputExport(namedRowsCsvPath, "export-data", { name: "results", format: "csv" });
const rowsCsvDurationMs = performance.now() - rowsCsvStartedAt;
assert.equal(namedRowsCsv.status, "succeeded");
assert.equal(readFileSync(namedRowsCsvPath, "utf8"), "amount\n2\n");

const outputHtmlPath = join(outputRoot, "data", "report.html");
const htmlOutputStartedAt = performance.now();
const currentHtml = await runOutputExport(outputHtmlPath, "html");
const htmlOutputDurationMs = performance.now() - htmlOutputStartedAt;
assert.equal(currentHtml.status, "succeeded");
assert.match(readFileSync(outputHtmlPath, "utf8"), /Unsaved report graph/);
assert.match(readFileSync(outputHtmlPath, "utf8"), /35/);
assert.match(readFileSync(outputHtmlPath, "utf8"), /current active buffer/);
assert.equal(JSON.stringify(currentHtml).includes("PRIVATE_EXPORT_PATH_SENTINEL"), false);

const outputPdfPath = join(outputRoot, "data", "report.pdf");
const currentPdf = await runOutputExport(outputPdfPath, "pdf");
assert.equal(currentPdf.status, "succeeded");
assert.match(readFileSync(outputPdfPath).toString("utf8", 0, 4), /^%PDF$/);
const outputDocxPath = join(outputRoot, "data", "report.docx");
const currentDocx = await runOutputExport(outputDocxPath, "docx");
assert.equal(currentDocx.status, "succeeded");
assert.match(readFileSync(outputDocxPath).toString("utf8", 0, 2), /^PK$/);
console.log(`Sprint 042 five-format serialization: JSON=${rowsJsonDurationMs.toFixed(1)} ms; CSV=${rowsCsvDurationMs.toFixed(1)} ms; HTML=${htmlOutputDurationMs.toFixed(1)} ms; PDF=${currentPdf.result?.bytes} bytes; DOCX=${currentDocx.result?.bytes} bytes`);

const serializationBase = await outputService.request.readDocument();
if (!serializationBase.ok) throw new Error(serializationBase.error.message);
const slowReportText = `# Cancellable PDF preparation\n\n${"This report paragraph exists to make trusted PDF preparation and serialization measurable.\n\n".repeat(8000)}${serializationBase.document.text}`;
assert.equal((await outputService.request.updateBuffer({ text: slowReportText })).ok, true);
const serializationCancelPath = join(outputRoot, "data", "cancel-during-serialization.pdf");
writeFileSync(serializationCancelPath, "preserve-during-pdf-serialization");
selectedOutputPath = serializationCancelPath;
const serializationSelection = await outputService.request.pickDestination({ extension: ".pdf", fileName: "cancel-during-serialization.pdf" });
assert.equal(serializationSelection.ok, true);
if (!serializationSelection.ok || !serializationSelection.selectionId) throw new Error("Expected a selected PDF cancellation destination.");
const serializationWorkbench = await outputService.request.getWorkbench();
if (!serializationWorkbench.ok || !serializationWorkbench.state.requestIdentity) throw new Error("Active identity unavailable before PDF serialization cancellation.");
const serializationRssBefore = process.memoryUsage().rss;
const serializationStart = await outputService.request.startJob({
	operation: "pdf", identity: serializationWorkbench.state.requestIdentity, selectionId: serializationSelection.selectionId
});
assert.equal(serializationStart.ok, true);
if (!serializationStart.ok) throw new Error(serializationStart.error.message);
let serializationJob = serializationStart.job;
for (let attempt = 0; attempt < 1000 && serializationJob.status === "running" && serializationJob.stage !== "serializing"; attempt++) {
	await new Promise(resolve => setTimeout(resolve, 2));
	const polled = await outputService.request.getJob({ jobId: serializationStart.job.identity.jobId });
	if (!polled.ok) throw new Error(polled.error.message);
	serializationJob = polled.job;
}
assert.equal(serializationJob.status, "running");
assert.equal(serializationJob.stage, "serializing");
const serializationCancelStarted = performance.now();
const serializationCancelled = await outputService.request.cancelJob({ jobId: serializationStart.job.identity.jobId });
const serializationCancelAckMs = performance.now() - serializationCancelStarted;
assert.equal(serializationCancelled.ok, true);
if (!serializationCancelled.ok) throw new Error(serializationCancelled.error.message);
assert.equal(serializationCancelled.job.status, "cancelled");
assert.ok(serializationCancelAckMs < 250, `PDF serialization cancellation acknowledgement took ${serializationCancelAckMs.toFixed(2)} ms`);
assert.equal(readFileSync(serializationCancelPath, "utf8"), "preserve-during-pdf-serialization");
let serializationCleanup = serializationCancelled.job;
for (let attempt = 0; attempt < 500 && serializationCleanup.cleanupPending; attempt++) {
	await new Promise(resolve => setTimeout(resolve, 2));
	const polled = await outputService.request.getJob({ jobId: serializationStart.job.identity.jobId });
	if (!polled.ok) throw new Error(polled.error.message);
	serializationCleanup = polled.job;
}
assert.equal(serializationCleanup.cleanupPending, false);
const serializationRssDelta = process.memoryUsage().rss - serializationRssBefore;
console.log(`Sprint 042 PDF serialization cancellation: stage=serializing, ack=${serializationCancelAckMs.toFixed(2)} ms, worker close observed, RSS delta=${serializationRssDelta} bytes`);
assert.equal((await outputService.request.updateBuffer({ text: serializationBase.document.text })).ok, true);

const writeFailurePath = join(outputRoot, "data", "write-failure.json");
writeFileSync(writeFailurePath, "preserve-before-write-failure");
await assert.rejects(writeDesktopData(outputRoot, writeFailurePath, ".json", [], "replacement", () => { throw new Error("injected pre-commit failure"); }), /Failed to write JSON output/);
assert.equal(readFileSync(writeFailurePath, "utf8"), "preserve-before-write-failure");
assert.equal(readdirSync(join(outputRoot, "data")).some(name => name.includes("write-failure.json") && name.endsWith(".tmp")), false);
const writeFailureCases = [
	{ extension: ".html" as const, name: "write-failure.html", contents: "preserve-html-write-failure" },
	{ extension: ".csv" as const, name: "write-failure.csv", contents: "preserve-csv-write-failure" },
	{ extension: ".pdf" as const, name: "write-failure.pdf", contents: "preserve-pdf-write-failure" },
	{ extension: ".docx" as const, name: "write-failure.docx", contents: "preserve-docx-write-failure" }
];
for (const item of writeFailureCases) {
	const target = join(outputRoot, "data", item.name);
	writeFileSync(target, item.contents);
	if (item.extension === ".html") {
		await assert.rejects(writeDesktopHtml(outputRoot, target, outputEntry, [], "replacement", () => { throw new Error("injected pre-commit failure"); }, true), /Failed to write HTML/);
	} else if (item.extension === ".csv") {
		await assert.rejects(writeDesktopData(outputRoot, target, item.extension, [], "replacement", () => { throw new Error("injected pre-commit failure"); }, true), /Failed to write CSV output/);
	} else if (item.extension === ".pdf") {
		const destination = await preparePdfDestination(target, outputEntry, []);
		await assert.rejects(writePdfAtomically(destination, new Uint8Array([1, 2, 3]), () => { throw new Error("injected pre-commit failure"); }), /Failed to write PDF/);
	} else {
		const destination = await prepareDocxDestination(target, outputEntry, []);
		await assert.rejects(writeDocxAtomically(destination, new Uint8Array([1, 2, 3]), () => { throw new Error("injected pre-commit failure"); }), /Failed to write DOCX/);
	}
	assert.equal(readFileSync(target, "utf8"), item.contents);
}
assert.equal(readdirSync(join(outputRoot, "data")).some(name => name.includes("write-failure") && name.endsWith(".tmp")), false);

const destinationRacePath = join(outputRoot, "data", "destination-race.json");
writeFileSync(destinationRacePath, "original destination bytes");
selectedOutputPath = destinationRacePath;
const destinationRaceSelection = await outputService.request.pickDestination({ extension: ".json", fileName: "destination-race.json" });
assert.equal(destinationRaceSelection.ok, true);
if (!destinationRaceSelection.ok || !destinationRaceSelection.selectionId) throw new Error("Expected an overwrite selection.");
writeFileSync(destinationRacePath, "external change after confirmation");
const outputIdentity = await outputService.request.getWorkbench();
if (!outputIdentity.ok || !outputIdentity.state.requestIdentity) throw new Error("Active identity is unavailable for overwrite race test.");
const destinationRaceJob = await outputService.request.startJob({
	operation: "export-data", identity: outputIdentity.state.requestIdentity, selectionId: destinationRaceSelection.selectionId,
	dataOutput: { name: "result", format: "json" }
});
assert.equal(destinationRaceJob.ok, true);
if (!destinationRaceJob.ok) throw new Error(destinationRaceJob.error.message);
let destinationRaceResult = destinationRaceJob.job;
for (let attempt = 0; attempt < 100 && ["running", "committing"].includes(destinationRaceResult.status); attempt++) {
	await new Promise(resolve => setTimeout(resolve, 10));
	const polled = await outputService.request.getJob({ jobId: destinationRaceJob.job.identity.jobId });
	if (!polled.ok) throw new Error(polled.error.message);
	destinationRaceResult = polled.job;
}
assert.equal(destinationRaceResult.status, "failed");
assert.match(destinationRaceResult.diagnostics[0]?.message ?? "", /changed after overwrite confirmation/);
assert.equal(readFileSync(destinationRacePath, "utf8"), "external change after confirmation");

const staleSelectionPath = join(outputRoot, "data", "stale-selection.html");
selectedOutputPath = staleSelectionPath;
const staleSelection = await outputService.request.pickDestination({ extension: ".html", fileName: "stale-selection.html" });
assert.equal(staleSelection.ok, true);
if (!staleSelection.ok || !staleSelection.selectionId) throw new Error("Expected a selected HTML destination.");
const staleIdentity = await outputService.request.getWorkbench();
if (!staleIdentity.ok || !staleIdentity.state.requestIdentity) throw new Error("Active identity is unavailable for stale selection test.");
const activeOutputDocument = await outputService.request.readDocument();
if (!activeOutputDocument.ok) throw new Error(activeOutputDocument.error.message);
assert.equal((await outputService.request.updateBuffer({ text: `${activeOutputDocument.document.text}\n# changed after selection\n` })).ok, true);
const staleSelectionJob = await outputService.request.startJob({ operation: "html", identity: staleIdentity.state.requestIdentity, selectionId: staleSelection.selectionId });
assert.equal(staleSelectionJob.ok, false);
assert.equal(existsSync(staleSelectionPath), false);
assert.equal((await outputService.request.updateBuffer({ text: activeOutputDocument.document.text })).ok, true);

const valuesInputPath = join(outputRoot, "data", "values.json");
const validValuesInput = readFileSync(valuesInputPath, "utf8");
writeFileSync(valuesInputPath, "{");
const invalidInputExports = [
	{ operation: "html" as const, extension: ".html" as const },
	{ operation: "pdf" as const, extension: ".pdf" as const },
	{ operation: "docx" as const, extension: ".docx" as const },
	{ operation: "export-data" as const, extension: ".json" as const, dataOutput: { name: "result", format: "json" as const } },
	{ operation: "export-data" as const, extension: ".csv" as const, dataOutput: { name: "results", format: "csv" as const } }
];
for (const [index, item] of invalidInputExports.entries()) {
	const target = join(outputRoot, "data", `invalid-input-${index}${item.extension}`);
	const sentinel = `preserve-invalid-input-${index}`;
	writeFileSync(target, sentinel);
	const failed = await runOutputExport(target, item.operation, item.dataOutput);
	assert.equal(failed.status, "failed", `${item.operation}${item.dataOutput ? `:${item.dataOutput.format}` : ""}`);
	assert.equal(readFileSync(target, "utf8"), sentinel);
	assert.equal(JSON.stringify(failed).includes(valuesInputPath), false);
}
writeFileSync(valuesInputPath, validValuesInput);

const projectConfigPath = join(outputRoot, ".openamx", "project.json");
const validProjectConfig = readFileSync(projectConfigPath, "utf8");
writeFileSync(projectConfigPath, JSON.stringify({ version: 1, inputs: { values: "data/values.json", rows: "data/rows.csv" }, report: { organization: 42 } }));
for (const [index, format] of (["html", "pdf", "docx"] as const).entries()) {
	const target = join(outputRoot, "data", `invalid-settings-${index}.${format}`);
	const sentinel = `preserve-invalid-settings-${format}`;
	writeFileSync(target, sentinel);
	const failed = await runOutputExport(target, format);
	assert.equal(failed.status, "failed", format);
	assert.equal(readFileSync(target, "utf8"), sentinel);
}
writeFileSync(projectConfigPath, validProjectConfig);

const cancelledJsonPath = join(outputRoot, "data", "cancelled.json");
writeFileSync(cancelledJsonPath, "preserve-before-json-cancel");
selectedOutputPath = cancelledJsonPath;
const cancelledJsonSelection = await outputService.request.pickDestination({ extension: ".json", fileName: "cancelled.json" });
assert.equal(cancelledJsonSelection.ok, true);
if (!cancelledJsonSelection.ok) throw new Error(cancelledJsonSelection.error.message);
const cancelledJsonWorkbench = await outputService.request.getWorkbench();
if (!cancelledJsonWorkbench.ok || !cancelledJsonWorkbench.state.requestIdentity) throw new Error("Active identity unavailable before JSON cancellation.");
const cancelledJsonJob = await outputService.request.startJob({
	operation: "export-data", identity: cancelledJsonWorkbench.state.requestIdentity, selectionId: cancelledJsonSelection.selectionId,
	dataOutput: { name: "result", format: "json" }
});
assert.equal(cancelledJsonJob.ok, true);
if (!cancelledJsonJob.ok) throw new Error(cancelledJsonJob.error.message);
const cancelledJsonResult = await outputService.request.cancelJob({ jobId: cancelledJsonJob.job.identity.jobId });
assert.equal(cancelledJsonResult.ok, true);
if (!cancelledJsonResult.ok) throw new Error(cancelledJsonResult.error.message);
assert.equal(cancelledJsonResult.job.status, "cancelled");
assert.equal(readFileSync(cancelledJsonPath, "utf8"), "preserve-before-json-cancel");

const privateDataSentinel = "PRIVATE_DATA_SENTINEL";
const invalidDataJob = await service.request.startJob({
	operation: "validate-data", identity: runIdentity,
	inputInspection: { name: "rows", format: "json", text: `[{"amount":"${privateDataSentinel}"}]` }
});
assert.equal(invalidDataJob.ok, true);
if (!invalidDataJob.ok) throw new Error(invalidDataJob.error.message);
let invalidData = invalidDataJob.job;
for (let attempt = 0; attempt < 100 && invalidData.status === "running"; attempt++) {
	await new Promise(resolve => setTimeout(resolve, 10));
	const polled = await service.request.getJob({ jobId: invalidDataJob.job.identity.jobId });
	assert.equal(polled.ok, true);
	if (!polled.ok) throw new Error(polled.error.message);
	invalidData = polled.job;
}
assert.equal(invalidData.status, "succeeded");
assert.equal(invalidData.result?.kind, "data-validation");
if (invalidData.result?.kind !== "data-validation") throw new Error("Expected data validation metadata.");
assert.equal(invalidData.result.valid, false);
assert.equal(invalidData.diagnostics[0]?.code, "AMX4003");
assert.equal(JSON.stringify(invalidData).includes(privateDataSentinel), false);
assert.equal(JSON.stringify(invalidData.diagnostics).includes(dataRoot), false);

const largeValidationText = `[${Array.from({ length: 100_000 }, () => "{\"amount\":1}").join(",")}]`;
const staleDataJob = await service.request.startJob({
	operation: "validate-data", identity: runIdentity,
	inputInspection: { name: "rows", format: "json", text: largeValidationText }
});
assert.equal(staleDataJob.ok, true);
if (!staleDataJob.ok) throw new Error(staleDataJob.error.message);
await service.request.updateBuffer({ path: entry, text: `${entrySource}\n# invalidate in-flight data work\n` });
const staleDataResult = await service.request.getJob({ jobId: staleDataJob.job.identity.jobId });
assert.equal(staleDataResult.ok, true);
if (!staleDataResult.ok) throw new Error(staleDataResult.error.message);
assert.equal(staleDataResult.job.status, "superseded");
await service.request.updateBuffer({ path: entry, text: entrySource });

const importWorkbench = await service.request.getWorkbench();
assert.equal(importWorkbench.ok, true);
if (!importWorkbench.ok || !importWorkbench.state.requestIdentity) throw new Error("Active identity unavailable before imported-source test.");
const staleImportJob = await service.request.startJob({
	operation: "validate-data", identity: importWorkbench.state.requestIdentity,
	inputInspection: { name: "rows", format: "json", text: largeValidationText }
});
assert.equal(staleImportJob.ok, true);
if (!staleImportJob.ok) throw new Error(staleImportJob.error.message);
const newerDependencySource = `${overlayDependencySource}\n# newer imported source\n`;
assert.equal((await service.request.updateBuffer({ path: dependencyPath, text: newerDependencySource })).ok, true);
const staleImportResult = await service.request.getJob({ jobId: staleImportJob.job.identity.jobId });
assert.equal(staleImportResult.ok, true);
if (!staleImportResult.ok) throw new Error(staleImportResult.error.message);
assert.equal(staleImportResult.job.status, "superseded");
assert.equal((await service.request.updateBuffer({ path: dependencyPath, text: overlayDependencySource })).ok, true);

const settingsStaleWorkbench = await service.request.getWorkbench();
if (!settingsStaleWorkbench.ok || !settingsStaleWorkbench.state.requestIdentity) throw new Error("Active identity unavailable before settings revision test.");
const settingsStaleJob = await service.request.startJob({
	operation: "validate-data", identity: settingsStaleWorkbench.state.requestIdentity,
	inputInspection: { name: "rows", format: "json", text: largeValidationText }
});
assert.equal(settingsStaleJob.ok, true);
if (!settingsStaleJob.ok) throw new Error(settingsStaleJob.error.message);
assert.equal((await service.request.setInputSettings({ inputMappings: jobMappings, validation: "fail-fast" })).ok, true);
const supersededSettings = await service.request.getJob({ jobId: settingsStaleJob.job.identity.jobId });
assert.equal(supersededSettings.ok, true);
if (!supersededSettings.ok) throw new Error(supersededSettings.error.message);
assert.equal(supersededSettings.job.status, "superseded");
assert.equal((await service.request.setInputSettings({ inputMappings: jobMappings, validation: "aggregate" })).ok, true);

const mappedDataPath = join(dataRoot, "rows.csv");
const mappedDataBefore = readFileSync(mappedDataPath, "utf8");
const dataStaleWorkbench = await service.request.getWorkbench();
if (!dataStaleWorkbench.ok || !dataStaleWorkbench.state.requestIdentity) throw new Error("Active identity unavailable before mapped data revision test.");
const dataStaleJob = await service.request.startJob({
	operation: "validate-data", identity: dataStaleWorkbench.state.requestIdentity,
	inputInspection: { name: "rows", format: "json", text: largeValidationText }
});
assert.equal(dataStaleJob.ok, true);
if (!dataStaleJob.ok) throw new Error(dataStaleJob.error.message);
writeFileSync(mappedDataPath, `${mappedDataBefore}\n`);
const supersededData = await service.request.getJob({ jobId: dataStaleJob.job.identity.jobId });
assert.equal(supersededData.ok, true);
if (!supersededData.ok) throw new Error(supersededData.error.message);
assert.equal(supersededData.job.status, "superseded");
writeFileSync(mappedDataPath, mappedDataBefore);

const cancellationInput = `[${Array.from({ length: 250_000 }, () => "{\"amount\":1}").join(",")}]`;
const cancellationWorkbench = await service.request.getWorkbench();
assert.equal(cancellationWorkbench.ok, true);
if (!cancellationWorkbench.ok || !cancellationWorkbench.state.requestIdentity) throw new Error("Active identity unavailable before cancellation test.");
const cancellationStart = performance.now();
const cancellationRssBefore = process.memoryUsage().rss;
const cancellingDataJob = await service.request.startJob({
	operation: "validate-data", identity: cancellationWorkbench.state.requestIdentity,
	inputInspection: { name: "rows", format: "json", text: cancellationInput }
});
assert.equal(cancellingDataJob.ok, true);
if (!cancellingDataJob.ok) throw new Error(cancellingDataJob.error.message);
let cancellationSnapshot = cancellingDataJob.job;
for (let attempt = 0; attempt < 200 && cancellationSnapshot.status === "running" && cancellationSnapshot.stage === "starting"; attempt++) {
	await new Promise(resolve => setTimeout(resolve, 10));
	const polled = await service.request.getJob({ jobId: cancellingDataJob.job.identity.jobId });
	assert.equal(polled.ok, true);
	if (!polled.ok) throw new Error(polled.error.message);
	cancellationSnapshot = polled.job;
}
assert.ok(cancellationSnapshot.status === "running" && cancellationSnapshot.stage !== "starting", JSON.stringify(cancellationSnapshot));
const cancellationAckStart = performance.now();
const cancelledDataJob = await service.request.cancelJob({ jobId: cancellingDataJob.job.identity.jobId });
const cancellationAckMs = performance.now() - cancellationAckStart;
assert.equal(cancelledDataJob.ok, true);
if (!cancelledDataJob.ok) throw new Error(cancelledDataJob.error.message);
assert.equal(cancelledDataJob.job.status, "cancelled");
assert.ok(cancellationAckMs < 250, `Cancellation acknowledgement took ${cancellationAckMs.toFixed(2)} ms`);
assert.equal(cancelledDataJob.job.result, undefined);
let cleanupSnapshot = cancelledDataJob.job;
for (let attempt = 0; attempt < 200 && cleanupSnapshot.cleanupPending; attempt++) {
	await new Promise(resolve => setTimeout(resolve, 5));
	const polled = await service.request.getJob({ jobId: cancellingDataJob.job.identity.jobId });
	assert.equal(polled.ok, true);
	if (!polled.ok) throw new Error(polled.error.message);
	cleanupSnapshot = polled.job;
}
assert.equal(cleanupSnapshot.cleanupPending, false);
const cancellationRssDelta = process.memoryUsage().rss - cancellationRssBefore;
assert.ok(JSON.stringify(invalidData).length < 4096);
console.log(`Sprint 036 real JSON validation cancellation: ack=${cancellationAckMs.toFixed(2)} ms; payload=${cancellationInput.length} chars; RSS delta=${cancellationRssDelta} bytes; worker close observed`);

const tabSwitchWorkbench = await service.request.getWorkbench();
assert.equal(tabSwitchWorkbench.ok, true);
if (!tabSwitchWorkbench.ok || !tabSwitchWorkbench.state.requestIdentity) throw new Error("Active identity unavailable before tab-switch test.");
const pendingTabJob = await service.request.startJob({
	operation: "validate-data", identity: tabSwitchWorkbench.state.requestIdentity,
	inputInspection: { name: "rows", format: "json", text: largeValidationText }
});
assert.equal(pendingTabJob.ok, true);
if (!pendingTabJob.ok) throw new Error(pendingTabJob.error.message);
await service.request.selectTab({ path: dependencyPath });
const switchedTabJob = await service.request.getJob({ jobId: pendingTabJob.job.identity.jobId });
assert.equal(switchedTabJob.ok, true);
if (!switchedTabJob.ok) throw new Error(switchedTabJob.error.message);
assert.equal(switchedTabJob.job.status, "superseded");
await service.request.selectTab({ path: entry });

const generationRoot = join(root, "generation-project");
mkdirSync(generationRoot);
const generationEntry = join(generationRoot, "report.amx");
writeFileSync(generationEntry, "```amx\nexport let total: Number = 1 + 2\n```\n");
const nextGenerationRoot = join(root, "next-generation-project");
mkdirSync(nextGenerationRoot);
writeFileSync(join(nextGenerationRoot, "next.amx"), "```amx\nlet next: Number = 1\n```\n");
let generationDestination: string | undefined;
const generationService = createDesktopService(undefined, { async choose() { return generationDestination; }, confirmOverwrite() { return true; } });
assert.equal((await generationService.request.openProject({ path: generationRoot })).ok, true);
assert.equal((await generationService.request.openDocument({ path: generationEntry })).ok, true);
const generationState = await generationService.request.getWorkbench();
assert.equal(generationState.ok, true);
if (!generationState.ok || !generationState.state.requestIdentity) throw new Error("Active identity unavailable before project-switch test.");
const protectedPdf = join(generationRoot, "existing.pdf");
writeFileSync(protectedPdf, "preserve-across-project-switch");
generationDestination = protectedPdf;
const generationSelection = await generationService.request.pickDestination({ extension: ".pdf", fileName: "existing.pdf" });
assert.equal(generationSelection.ok, true);
if (!generationSelection.ok) throw new Error(generationSelection.error.message);
const projectSwitchJob = await generationService.request.startJob({
	operation: "pdf", identity: generationState.state.requestIdentity, selectionId: generationSelection.selectionId
});
assert.equal(projectSwitchJob.ok, true);
if (!projectSwitchJob.ok) throw new Error(projectSwitchJob.error.message);
assert.equal((await generationService.request.openProject({ path: nextGenerationRoot })).ok, true);
const supersededProjectJob = await generationService.request.getJob({ jobId: projectSwitchJob.job.identity.jobId });
assert.equal(supersededProjectJob.ok, true);
if (!supersededProjectJob.ok) throw new Error(supersededProjectJob.error.message);
assert.equal(supersededProjectJob.job.status, "superseded");
assert.equal(readFileSync(protectedPdf, "utf8"), "preserve-across-project-switch");
let projectCleanup = supersededProjectJob.job;
for (let attempt = 0; attempt < 200 && projectCleanup.cleanupPending; attempt++) {
	await new Promise(resolve => setTimeout(resolve, 5));
	const polled = await generationService.request.getJob({ jobId: projectSwitchJob.job.identity.jobId });
	assert.equal(polled.ok, true);
	if (!polled.ok) throw new Error(polled.error.message);
	projectCleanup = polled.job;
}
assert.equal(projectCleanup.cleanupPending, false);

const metadataRoot = join(root, "bounded-schema-project");
mkdirSync(metadataRoot);
const metadataEntry = join(metadataRoot, "report.amx");
const metadataType = join(metadataRoot, "types.amx");
const wideFields = Array.from({ length: 501 }, (_, index) => `  field${index}: String`).join("\n");
const exportedValues = Array.from({ length: 101 }, (_, index) => `export let value${index}: Number = ${index}`).join("\n");
writeFileSync(metadataType, ["```amx", `export type Row {\n${wideFields}\n}`, "```", ""].join("\n"));
writeFileSync(metadataEntry, ["```amx", "import { Row } from \"./types.amx\"", "input rows: Row[]", exportedValues, "```", ""].join("\n"));
const metadataService = createDesktopService();
assert.equal((await metadataService.request.openProject({ path: metadataRoot })).ok, true);
assert.equal((await metadataService.request.openDocument({ path: metadataEntry })).ok, true);
const metadataState = await metadataService.request.getWorkbench();
assert.equal(metadataState.ok, true);
if (!metadataState.ok || !metadataState.state.requestIdentity) throw new Error("Active identity unavailable before metadata-bound test.");
const boundedMetadataJob = await metadataService.request.startJob({
	operation: "validate-data", identity: metadataState.state.requestIdentity,
	inputInspection: { name: "rows", format: "json", text: "[]" }
});
assert.equal(boundedMetadataJob.ok, true);
if (!boundedMetadataJob.ok) throw new Error(boundedMetadataJob.error.message);
let boundedMetadata = boundedMetadataJob.job;
for (let attempt = 0; attempt < 100 && boundedMetadata.status === "running"; attempt++) {
	await new Promise(resolve => setTimeout(resolve, 10));
	const polled = await metadataService.request.getJob({ jobId: boundedMetadataJob.job.identity.jobId });
	assert.equal(polled.ok, true);
	if (!polled.ok) throw new Error(polled.error.message);
	boundedMetadata = polled.job;
}
assert.equal(boundedMetadata.status, "succeeded");
if (boundedMetadata.result?.kind !== "data-validation") throw new Error("Expected bounded schema result.");
assert.equal(boundedMetadata.result.schema.fields?.length, 500);
assert.equal(boundedMetadata.result.schema.truncated, true);
assert.equal(boundedMetadata.result.outputs?.length, 100);
assert.equal(boundedMetadata.result.outputsTruncated, true);
assert.ok(JSON.stringify(boundedMetadata).length < 200_000);

const cancelledPdf = join(root, "cancelled-report.pdf");
writeFileSync(cancelledPdf, "preserve-before-cancel");
const jobStartState = await service.request.getWorkbench();
assert.equal(jobStartState.ok, true);
if (!jobStartState.ok) throw new Error(jobStartState.error.message);
if (!jobStartState.state.requestIdentity) throw new Error("Active document request identity was not available.");
selectedServiceDestination = cancelledPdf;
const cancelledPdfSelection = await service.request.pickDestination({ extension: ".pdf", fileName: "cancelled-report.pdf" });
assert.equal(cancelledPdfSelection.ok, true);
if (!cancelledPdfSelection.ok) throw new Error(cancelledPdfSelection.error.message);
const pendingExport = await service.request.startJob({ operation: "pdf", identity: jobStartState.state.requestIdentity, selectionId: cancelledPdfSelection.selectionId });
if (!pendingExport.ok) throw new Error(pendingExport.error.message);
if (!pendingExport.ok) throw new Error(pendingExport.error.message);
const cancelledExport = await service.request.cancelJob({ jobId: pendingExport.job.identity.jobId });
assert.equal(cancelledExport.ok, true);
if (!cancelledExport.ok) throw new Error(cancelledExport.error.message);
assert.equal(cancelledExport.job.status, "cancelled");
assert.equal(readFileSync(cancelledPdf, "utf8"), "preserve-before-cancel");

const previewStartState = await service.request.getWorkbench();
assert.equal(previewStartState.ok, true);
if (!previewStartState.ok) throw new Error(previewStartState.error.message);
if (!previewStartState.state.requestIdentity) throw new Error("Active document request identity was not available.");
const pendingPreview = await service.request.startJob({ operation: "preview", identity: previewStartState.state.requestIdentity });
assert.equal(pendingPreview.ok, true);
if (!pendingPreview.ok) throw new Error(pendingPreview.error.message);
await service.request.updateBuffer({ path: entry, text: `${entrySource}\n# newer revision\n` });
const supersededPreview = await service.request.getJob({ jobId: pendingPreview.job.identity.jobId });
assert.equal(supersededPreview.ok, true);
if (!supersededPreview.ok) throw new Error(supersededPreview.error.message);
assert.equal(supersededPreview.job.status, "superseded");
await service.request.updateBuffer({ path: entry, text: entrySource });

await service.request.selectTab({ path: dependencyPath });
await service.request.reloadTab({ action: "discard" });
const activeModule = await service.request.readDocument();
assert.equal(activeModule.ok, true);
const workbench = await service.request.getWorkbench();
assert.equal(workbench.ok, true);
if (!workbench.ok) throw new Error(workbench.error.message);
assert.equal(workbench.state.active, dependencyPath);
await service.request.selectTab({ path: entry });
const invalidValidation = await service.request.runBuffer({ validation: "invalid" as "aggregate" });
assert.equal(invalidValidation.ok, true);
if (!invalidValidation.ok) throw new Error(invalidValidation.error.message);
assert.equal(invalidValidation.diagnostics[0]?.code, "AMX4001");
const run = await service.request.runBuffer({
	inputMappings: [`amounts=${join(dataRoot, "amounts.json")}`, `rows=${join(dataRoot, "rows.csv")}`]
});
assert.equal(run.ok, true);
if (!run.ok) throw new Error(run.error.message);
assert.deepEqual(run.diagnostics, []);
assert.deepEqual(run.summary.values.find(value => value.name === "result"), { name: "result", value: 25 });
assert.deepEqual(run.summary.values.map(value => value.name), ["result"]);
assert.equal(readFileSync(entry, "utf8"), savedSource);
const resetOperationSettings = await service.request.setInputSettings({ inputMappings: [], validation: "aggregate" });
assert.equal(resetOperationSettings.ok, true);

const projectConfigDirectory = join(root, ".openamx");
mkdirSync(projectConfigDirectory);
const localConfigPath = join(projectConfigDirectory, "local.json");
const projectAmounts = join(dataRoot, "project-amounts.json");
const localAmounts = join(dataRoot, "local-amounts.json");
const perRunAmounts = join(dataRoot, "per-run-amounts.json");
writeFileSync(projectAmounts, "[1]");
writeFileSync(localAmounts, "[2]");
writeFileSync(perRunAmounts, "[3]");
writeFileSync(join(projectConfigDirectory, "project.json"), JSON.stringify({ version: 1, inputs: { amounts: "data/project-amounts.json", rows: "data/rows.csv" } }));
writeFileSync(localConfigPath, JSON.stringify({ version: 1, inputs: { amounts: "data/local-amounts.json" } }));
if (process.platform !== "win32") chmodSync(localConfigPath, 0o600);
const inputConfig = await service.request.getInputConfiguration();
assert.equal(inputConfig.ok, true);
if (!inputConfig.ok) throw new Error(inputConfig.error.message);
assert.deepEqual(inputConfig.configuration.inputs.map(({ name, type, source, status }) => ({ name, type, source, status })), [
	{ name: "amounts", type: "Number[]", source: "local", status: "unvalidated" },
	{ name: "rows", type: "Row[]", source: "project", status: "unvalidated" }
]);
if (process.platform !== "win32") {
	chmodSync(localConfigPath, 0o644);
	const insecureConfig = await service.request.getInputConfiguration();
	assert.equal(insecureConfig.ok, true);
	if (!insecureConfig.ok) throw new Error(insecureConfig.error.message);
	assert.match(insecureConfig.configuration.diagnostics[0]?.message ?? "", /permissions/);
	chmodSync(localConfigPath, 0o600);
}
const localRun = await service.request.runBuffer();
assert.equal(localRun.ok, true);
if (!localRun.ok) throw new Error(localRun.error.message);
assert.equal(localRun.summary.values.find(value => value.name === "result")?.value, 22);
const perRun = await service.request.runBuffer({ inputMappings: [`amounts=${perRunAmounts}`] });
assert.equal(perRun.ok, true);
if (!perRun.ok) throw new Error(perRun.error.message);
assert.equal(perRun.summary.values.find(value => value.name === "result")?.value, 23);
writeFileSync(localConfigPath, JSON.stringify({ version: 1, inputs: {} }));
const projectRun = await service.request.runBuffer();
assert.equal(projectRun.ok, true);
if (!projectRun.ok) throw new Error(projectRun.error.message);
assert.equal(projectRun.summary.values.find(value => value.name === "result")?.value, 21);

const traversalTarget = join(tmpdir(), `openamx-traversal-${Date.now()}.json`);
writeFileSync(traversalTarget, "[9]");
writeFileSync(join(projectConfigDirectory, "project.json"), JSON.stringify({ version: 1, inputs: { amounts: relative(root, traversalTarget), rows: "data/rows.csv" } }));
const traversedConfig = await service.request.getInputConfiguration();
assert.equal(traversedConfig.ok, true);
if (!traversedConfig.ok) throw new Error(traversedConfig.error.message);
assert.match(traversedConfig.configuration.diagnostics[0]?.message ?? "", /inside the project/);
const projectLink = join(dataRoot, "external.json");
symlinkSync(traversalTarget, projectLink);
writeFileSync(join(projectConfigDirectory, "project.json"), JSON.stringify({ version: 1, inputs: { amounts: "data/external.json", rows: "data/rows.csv" } }));
const linkedConfig = await service.request.getInputConfiguration();
assert.equal(linkedConfig.ok, true);
if (!linkedConfig.ok) throw new Error(linkedConfig.error.message);
assert.match(linkedConfig.configuration.diagnostics[0]?.message ?? "", /inside the project/);
unlinkSync(projectLink);

writeFileSync(join(projectConfigDirectory, "project.json"), JSON.stringify({ version: 1, inputs: { amounts: "data/project-amounts.json", rows: "data/rows.csv" }, unexpected: true }));
const invalidConfig = await service.request.getInputConfiguration();
assert.equal(invalidConfig.ok, true);
if (!invalidConfig.ok) throw new Error(invalidConfig.error.message);
assert.equal(invalidConfig.configuration.diagnostics[0]?.code, "DESKTOP_CONFIG");
writeFileSync(join(projectConfigDirectory, "project.json"), JSON.stringify({ version: 1, inputs: { amounts: "data/project-amounts.json", rows: "data/rows.csv" } }));

const invalidPrivateInput = join(tmpdir(), `openamx-private-${Date.now()}.json`);
writeFileSync(localConfigPath, JSON.stringify({ version: 1, inputs: { amounts: invalidPrivateInput } }));
const privateFailure = await service.request.runBuffer();
assert.equal(privateFailure.ok, true);
if (!privateFailure.ok) throw new Error(privateFailure.error.message);
assert.equal(privateFailure.diagnostics[0]?.code, "AMX4001");
assert.equal(privateFailure.diagnostics.some(item => item.message.includes(invalidPrivateInput)), false);

writeFileSync(localConfigPath, JSON.stringify({ version: 1, inputs: {} }));
writeFileSync(projectAmounts, "{");
writeFileSync(join(dataRoot, "rows.csv"), "unknown\nvalue\n");
const aggregate = await service.request.runBuffer();
assert.equal(aggregate.ok, true);
if (!aggregate.ok) throw new Error(aggregate.error.message);
assert.ok(aggregate.diagnostics.length >= 2);
assert.deepEqual(aggregate.summary.values, []);
const failFast = await service.request.runBuffer({ validation: "fail-fast" });
assert.equal(failFast.ok, true);
if (!failFast.ok) throw new Error(failFast.error.message);
assert.equal(failFast.diagnostics.length, 1);

writeFileSync(projectAmounts, "[1]");
writeFileSync(join(dataRoot, "rows.csv"), "amount\n4\n6\n");
const previewStartedAt = performance.now();
const previewWithInputs = await service.request.previewBuffer();
const previewDurationMs = performance.now() - previewStartedAt;
assert.equal(previewWithInputs.ok, true);
if (!previewWithInputs.ok) throw new Error(previewWithInputs.error.message);
assert.deepEqual(previewWithInputs.diagnostics, []);
const reportDirectory = join(root, "reports");
mkdirSync(reportDirectory);
const htmlPath = join(reportDirectory, "analysis.html");
const htmlStartedAt = performance.now();
const htmlSave = await selectedExport(htmlPath, "html");
const htmlDurationMs = performance.now() - htmlStartedAt;
assert.equal(htmlSave.ok, true);
if (!htmlSave.ok) throw new Error(htmlSave.error.message);
assert.equal(htmlSave.job.status, "succeeded");
assert.equal(htmlSave.job.result?.kind, "export");
if (htmlSave.job.result?.kind !== "export") throw new Error("Expected HTML export result.");
assert.equal(htmlSave.job.result.fileName, "analysis.html");
assert.equal(htmlSave.job.result.path, undefined);
assert.equal(readFileSync(htmlPath, "utf8"), previewWithInputs.html);
const pdfPath = join(reportDirectory, "analysis.pdf");
const pdfStartedAt = performance.now();
const pdfExport = await selectedExport(pdfPath, "pdf");
const pdfDurationMs = performance.now() - pdfStartedAt;
assert.equal(pdfExport.ok, true);
if (!pdfExport.ok) throw new Error(pdfExport.error.message);
assert.equal(pdfExport.job.status, "succeeded");
assert.ok((pdfExport.job.result?.bytes ?? 0) > 1000);
assert.match(readFileSync(pdfPath).toString("utf8", 0, 4), /^%PDF$/);
const docxPath = join(reportDirectory, "analysis.docx");
const docxStartedAt = performance.now();
const docxExport = await selectedExport(docxPath, "docx");
const docxDurationMs = performance.now() - docxStartedAt;
assert.equal(docxExport.ok, true);
if (!docxExport.ok) throw new Error(docxExport.error.message);
assert.equal(docxExport.job.status, "succeeded");
assert.ok((docxExport.job.result?.bytes ?? 0) > 1000);
assert.match(readFileSync(docxPath).toString("utf8", 0, 2), /^PK$/);
console.log(`Sprint 042 real pipelines: preview=${previewDurationMs.toFixed(1)} ms/${previewWithInputs.html.length} chars; HTML=${htmlDurationMs.toFixed(1)} ms/${Buffer.byteLength(readFileSync(htmlPath, "utf8"))} bytes; PDF=${pdfDurationMs.toFixed(1)} ms/${pdfExport.job.result?.bytes} bytes; DOCX=${docxDurationMs.toFixed(1)} ms/${docxExport.job.result?.bytes} bytes`);

const invalidSource = "```amx\nlet incomplete =\n```\n";
await service.request.updateBuffer({ text: invalidSource });
writeFileSync(htmlPath, "preserve-html");
writeFileSync(pdfPath, "preserve-pdf");
writeFileSync(docxPath, "preserve-docx");
const failedHtml = await selectedExport(htmlPath, "html");
assert.equal(failedHtml.ok, false, JSON.stringify(failedHtml));
if (failedHtml.ok) throw new Error("Invalid AMX export unexpectedly started.");
assert.equal(readFileSync(htmlPath, "utf8"), "preserve-html");
const failedPreview = await service.request.previewBuffer();
assert.equal(failedPreview.ok, true);
if (!failedPreview.ok) throw new Error(failedPreview.error.message);
assert.equal(failedPreview.html, "");
assert.equal(failedPreview.diagnostics.length, 1);
const failedPdf = await selectedExport(pdfPath, "pdf");
assert.equal(failedPdf.ok, false);
if (failedPdf.ok) throw new Error("Invalid AMX PDF export unexpectedly started.");
assert.equal(readFileSync(pdfPath, "utf8"), "preserve-pdf");
const failedDocx = await selectedExport(docxPath, "docx");
assert.equal(failedDocx.ok, false);
if (failedDocx.ok) throw new Error("Invalid AMX DOCX export unexpectedly started.");
assert.equal(readFileSync(docxPath, "utf8"), "preserve-docx");
const htmlLink = join(reportDirectory, "linked.html");
await service.request.updateBuffer({ text: entrySource });
symlinkSync(htmlPath, htmlLink);
const rejectedHtmlLink = await selectedExport(htmlLink, "html");
assert.equal(rejectedHtmlLink.ok, false);
assert.equal(existsSync(htmlLink), true);
const outsideHtmlPath = join(tmpdir(), `outside-${Date.now()}.html`);
const outsideHtml = await selectedExport(outsideHtmlPath, "html");
assert.equal(outsideHtml.ok, true);
if (!outsideHtml.ok) throw new Error(outsideHtml.error.message);
assert.equal(outsideHtml.job.status, "succeeded");
assert.equal(existsSync(outsideHtmlPath), true);
unlinkSync(outsideHtmlPath);
const missingParentPdf = await selectedExport(join(root, "missing", "analysis.pdf"), "pdf");
assert.equal(missingParentPdf.ok, false);
assert.equal(readFileSync(pdfPath, "utf8"), "preserve-pdf");
const missingParentDocx = await selectedExport(join(root, "missing", "analysis.docx"), "docx");
assert.equal(missingParentDocx.ok, false);
assert.equal(readFileSync(docxPath, "utf8"), "preserve-docx");
assert.equal(readFileSync(entry, "utf8"), savedSource);
console.log("Desktop workflow contract passed (precedence, validation, current-buffer, HTML/PDF safety)");

const ignored = join(root, "build");
mkdirSync(ignored);
writeFileSync(join(ignored, "hidden.amx"), "# hidden");
writeFileSync(join(root, ".hidden.amx"), "# hidden");
let selectedPath: string | undefined;
let overwriteAccepted = false;
let destinationPickerCalls = 0;
let destinationPickerOptions: { directory: boolean; extension?: string; fileName?: string } | undefined;
const picked = createDesktopService(undefined, {
	async choose(options) { destinationPickerCalls++; destinationPickerOptions = options; return selectedPath; },
	confirmOverwrite() { return overwriteAccepted; }
});
const cancelledProject = await picked.request.pickProject();
assert.deepEqual(cancelledProject, { ok: true, cancelled: true });
selectedPath = entry;
assert.equal((await picked.request.pickProject()).ok, false);
selectedPath = root;
assert.equal((await picked.request.pickProject()).ok, true);
selectedPath = join(ignored, "hidden.amx");
assert.equal((await picked.request.pickDocument()).ok, false);
selectedPath = join(root, "nested", "outside.amx");
assert.equal((await picked.request.pickDocument()).ok, false);
selectedPath = outside;
assert.equal((await picked.request.pickDocument()).ok, false);
selectedPath = entry;
assert.equal((await picked.request.pickDocument()).ok, true);
selectedPath = undefined;
assert.deepEqual(await picked.request.pickDocument(), { ok: true, cancelled: true });
const listed = await picked.request.listProjectFiles();
assert.equal(listed.ok, true);
if (!listed.ok) throw new Error(listed.error.message);
assert.equal(listed.files.some(file => file.path.includes("hidden")), false);
const beforeCancel = await picked.request.getWorkbench();
assert.equal(beforeCancel.ok, true);
const cancelledClose = await picked.request.closeTab({ path: entry, action: "cancel" });
assert.deepEqual(cancelledClose, beforeCancel);
await picked.request.updateBuffer({ text: "# dirty entry" });
const callsBeforeInvalidName = destinationPickerCalls;
const rejectedFilename = await picked.request.pickDestination({ extension: ".html", fileName: "../escape.html" });
assert.equal(rejectedFilename.ok, false);
assert.equal(destinationPickerCalls, callsBeforeInvalidName);
selectedPath = outside;
assert.equal((await picked.request.pickDestination({ extension: ".html", fileName: "report.html" })).ok, false);
selectedPath = join(tmpdir(), `outside-${Date.now()}.html`);
const externalDestination = await picked.request.pickDestination({ extension: ".html", fileName: basename(selectedPath) });
assert.equal(externalDestination.ok, true);
if (!externalDestination.ok) throw new Error(externalDestination.error.message);
assert.equal(externalDestination.path, undefined);
assert.equal(externalDestination.fileName, basename(selectedPath));
assert.equal(JSON.stringify(externalDestination).includes(selectedPath), false);
const originalHtml = readFileSync(htmlPath, "utf8");
selectedPath = htmlPath;
overwriteAccepted = false;
assert.deepEqual(await picked.request.pickDestination({ extension: ".html", fileName: basename(htmlPath) }), { ok: true, cancelled: true });
assert.equal(readFileSync(htmlPath, "utf8"), originalHtml);
overwriteAccepted = true;
const overwriteSelection = await picked.request.pickDestination({ extension: ".html", fileName: basename(htmlPath) });
assert.equal(overwriteSelection.ok, true);
if (!overwriteSelection.ok) throw new Error(overwriteSelection.error.message);
assert.equal(overwriteSelection.fileName, basename(htmlPath));
overwriteAccepted = false;
selectedPath = join(root, "reports", "new-report.html");
const newDestination = await picked.request.pickDestination({ extension: ".html", fileName: basename(selectedPath) });
assert.equal(newDestination.ok, true);
if (!newDestination.ok) throw new Error(newDestination.error.message);
assert.equal(newDestination.path, undefined);
assert.equal(newDestination.fileName, basename(selectedPath));
assert.equal(typeof newDestination.selectionId, "string");
assert.equal(destinationPickerOptions?.directory, true);
assert.equal(destinationPickerOptions?.fileName, basename(selectedPath));
assert.equal(existsSync(selectedPath), false);
selectedPath = join(root, "reports", "wrong.HTML");
assert.equal((await picked.request.pickDestination({ extension: ".html", fileName: "wrong.HTML" })).ok, false);
selectedPath = undefined;
assert.deepEqual(await picked.request.pickDestination({ extension: ".pdf", fileName: "report.pdf" }), { ok: true, cancelled: true });
writeFileSync(entry, "# external edit");
const failedClose = await picked.request.closeTab({ path: entry, action: "save" });
assert.equal(failedClose.ok, false);
const afterFailedClose = await picked.request.readDocument();
assert.equal(afterFailedClose.ok, true);
if (!afterFailedClose.ok) throw new Error(afterFailedClose.error.message);
assert.equal(afterFailedClose.document.text, "# dirty entry");
assert.equal(afterFailedClose.document.conflict, true);
assert.equal(readFileSync(entry, "utf8"), "# external edit");
assert.equal((await picked.request.closeTab({ path: entry, action: "discard" })).ok, true);
const noEntry = await picked.request.runBuffer();
assert.equal(noEntry.ok, true);
if (!noEntry.ok) throw new Error(noEntry.error.message);
assert.match(noEntry.diagnostics[0]?.message ?? "", /Open an active AMX document/);
console.log("Sprint 029 picker, tab guard and entry assertions passed");

const sessionFile = join(root, "private-session.json");
const sessionService = createDesktopService(undefined, { async choose() { return root; } }, sessionFile);
assert.equal((await sessionService.request.pickProject()).ok, true);
await sessionService.request.openDocument({ path: join(root, "nested", "module.amx") });
const secret = "PRIVATE_UNSAVED_DATA_DO_NOT_STORE";
await sessionService.request.updateBuffer({ text: secret });
const serialized = readFileSync(sessionFile, "utf8");
assert.equal(serialized.includes(secret), false);
assert.equal(serialized.includes("local.json"), false);
assert.equal(serialized.includes("project-amounts.json"), false);
const restoredSession = createDesktopService(undefined, undefined, sessionFile);
const restoredProject = await restoredSession.request.restoreProject({ root });
assert.equal(restoredProject.ok, true);
const restoredDocument = await restoredSession.request.readDocument();
assert.equal(restoredDocument.ok, true);
if (!restoredDocument.ok) throw new Error(restoredDocument.error.message);
assert.notEqual(restoredDocument.document.text, secret);
assert.equal(restoredDocument.document.dirty, false);
await restoredSession.request.clearSession();
assert.equal(readFileSync(sessionFile, "utf8"), "[]");
console.log("Sprint 029 private session restore assertions passed");

let releasePicker: ((path: string) => void) | undefined;
const delayed = createDesktopService(root, {
	choose() { return new Promise<string>(resolve => { releasePicker = resolve; }); }
});
const pendingPick = delayed.request.pickDocument();
const otherProject = mkdtempSync(join(tmpdir(), "openamx-switch-"));
assert.equal((await delayed.request.openProject({ path: otherProject })).ok, true);
releasePicker?.(entry);
assert.deepEqual(await pendingPick, { ok: true, cancelled: true });
const stateAfterPick = await delayed.request.getWorkbench();
assert.equal(stateAfterPick.ok, true);
if (!stateAfterPick.ok) throw new Error(stateAfterPick.error.message);
assert.equal(stateAfterPick.state.tabs.length, 0);
console.log("Sprint 029 stale picker response assertions passed");

const conflictService = createDesktopService(root);
assert.equal((await conflictService.request.openDocument({ path: join(root, "nested", "module.amx") })).ok, true);
writeFileSync(join(root, "nested", "module.amx"), "# changed externally\n");
const conflictedTabs = await conflictService.request.getWorkbench();
assert.equal(conflictedTabs.ok, true);
if (!conflictedTabs.ok) throw new Error(conflictedTabs.error.message);
assert.equal(conflictedTabs.state.tabs[0]?.conflict, true);
const cancelledReload = await conflictService.request.reloadTab({ action: "cancel" });
assert.equal(cancelledReload.ok, true);
if (!cancelledReload.ok) throw new Error(cancelledReload.error.message);
assert.equal(cancelledReload.document.conflict, true);
const reloadedConflict = await conflictService.request.reloadTab({ action: "discard" });
assert.equal(reloadedConflict.ok, true);
const resavedText = "# safe replacement\n";
await conflictService.request.updateBuffer({ text: resavedText });
const savedAtomically = await conflictService.request.saveDocument();
assert.equal(savedAtomically.ok, true);
assert.equal(readFileSync(join(root, "nested", "module.amx"), "utf8"), resavedText);
assert.equal(readdirSync(join(root, "nested")).some(name => name.endsWith(".tmp")), false);
writeFileSync(sessionFile, JSON.stringify([{ root, active: "../private.amx", entry: ".hidden.amx", explorerWidth: 9999, previewWidth: -1 }]));
const poisonedSession = createDesktopService(undefined, undefined, sessionFile);
const safeRecents = await poisonedSession.request.getRecents();
assert.equal(safeRecents.ok, true);
if (!safeRecents.ok) throw new Error(safeRecents.error.message);
assert.deepEqual(safeRecents.projects, [{ root, active: undefined, explorerWidth: undefined, previewWidth: undefined }]);
console.log("Sprint 029 external conflict and substituted session assertions passed");

const migrationActive = join("nested", "module.amx");
const reportSourceBeforeMigration = readFileSync(entry, "utf8");
writeFileSync(sessionFile, JSON.stringify([{ root, active: migrationActive, entry: "main.amx", explorerWidth: 240, previewWidth: 40 }]));
let migrationWorkerCreations = 0;
const migratedSession = createDesktopService(undefined, undefined, sessionFile, () => { migrationWorkerCreations++; throw new Error("Migration must not start a worker."); });
const migratedRecent = await migratedSession.request.getRecents();
assert.equal(migratedRecent.ok, true);
if (!migratedRecent.ok) throw new Error(migratedRecent.error.message);
assert.deepEqual(migratedRecent.projects, [{ root, active: migrationActive, explorerWidth: 240, previewWidth: 40 }]);
const migratedProject = await migratedSession.request.restoreProject({ root });
assert.equal(migratedProject.ok, true);
const migratedDocument = await migratedSession.request.readDocument();
assert.equal(migratedDocument.ok, true);
if (!migratedDocument.ok) throw new Error(migratedDocument.error.message);
assert.equal(migratedDocument.document.path, join(root, migrationActive));
assert.equal(migratedDocument.document.kind, "amx");
assert.equal(JSON.parse(readFileSync(sessionFile, "utf8"))[0].entry, undefined);
assert.equal(readFileSync(entry, "utf8"), reportSourceBeforeMigration);
assert.equal(migrationWorkerCreations, 0);
writeFileSync(sessionFile, JSON.stringify([{ root, entry: "main.amx" }]));
const entryOnlySession = createDesktopService(undefined, undefined, sessionFile);
assert.equal((await entryOnlySession.request.restoreProject({ root })).ok, true);
const entryOnlyWorkbench = await entryOnlySession.request.getWorkbench();
assert.equal(entryOnlyWorkbench.ok, true);
if (!entryOnlyWorkbench.ok) throw new Error(entryOnlyWorkbench.error.message);
assert.equal(entryOnlyWorkbench.state.tabs.length, 0);
assert.equal(readFileSync(entry, "utf8"), reportSourceBeforeMigration);
assert.equal(migrationWorkerCreations, 0);
console.log("Sprint 043 V0.5 session migration assertions passed");

const transitionService = createDesktopService(root);
await transitionService.request.openDocument({ path: entry });
await transitionService.request.updateBuffer({ text: "# keep this entry\n" });
writeFileSync(entry, "# changed after opening\n");
const cancelledTransition = await transitionService.request.prepareTransition({ action: "cancel" });
assert.equal(cancelledTransition.ok, true);
if (!cancelledTransition.ok) throw new Error(cancelledTransition.error.message);
assert.equal(cancelledTransition.ready, false);
const failedTransition = await transitionService.request.prepareTransition({ action: "save-all" });
assert.equal(failedTransition.ok, false);
const retainedTransition = await transitionService.request.readDocument();
assert.equal(retainedTransition.ok, true);
if (!retainedTransition.ok) throw new Error(retainedTransition.error.message);
assert.equal(retainedTransition.document.text, "# keep this entry\n");
assert.equal((await transitionService.request.prepareTransition({ action: "discard-all" })).ok, true);
console.log("Sprint 029 transition cancel, conflict and discard assertions passed");

let nextSelection = root;
let decision: "cancel" | "save-all" | "discard-all" = "cancel";
const switching = createDesktopService(undefined, {
	async choose() { return nextSelection; },
	async confirmTransition() { return decision; }
});
assert.equal((await switching.request.pickProject()).ok, true);
await switching.request.openDocument({ path: entry });
await switching.request.updateBuffer({ text: "# keep switch buffer\n" });
nextSelection = otherProject;
assert.deepEqual(await switching.request.pickProject(), { ok: true, cancelled: true });
assert.equal((await switching.request.getWorkbench()).ok, true);
decision = "save-all";
writeFileSync(entry, "# switch conflict\n");
assert.equal((await switching.request.pickProject()).ok, false);
const stillOpen = await switching.request.readDocument();
assert.equal(stillOpen.ok, true);
if (!stillOpen.ok) throw new Error(stillOpen.error.message);
assert.equal(stillOpen.document.text, "# keep switch buffer\n");
decision = "discard-all";
const switched = await switching.request.pickProject();
assert.equal(switched.ok, true);
if (!switched.ok) throw new Error(switched.error.message);
assert.equal(switched.root, otherProject);
const afterSwitch = await switching.request.getWorkbench();
assert.equal(afterSwitch.ok, true);
if (!afterSwitch.ok) throw new Error(afterSwitch.error.message);
assert.equal(afterSwitch.state.tabs.length, 0);
console.log("Sprint 029 picker project-switch confirmation assertions passed");

const quitService = createDesktopService(undefined, {
	async choose() { return root; }, async confirmTransition() { return decision; }
});
await quitService.request.openProject({ path: root });
await quitService.request.openDocument({ path: entry });
await quitService.request.updateBuffer({ text: "# quit unsaved\n" });
decision = "cancel";
assert.deepEqual(await quitService.request.confirmQuit(), { ok: true, ready: false });
decision = "save-all";
writeFileSync(entry, "# quit conflict\n");
assert.equal((await quitService.request.confirmQuit()).ok, false);
const quitRetained = await quitService.request.readDocument();
assert.equal(quitRetained.ok, true);
if (!quitRetained.ok) throw new Error(quitRetained.error.message);
assert.equal(quitRetained.document.text, "# quit unsaved\n");
decision = "discard-all";
assert.deepEqual(await quitService.request.confirmQuit(), { ok: true, ready: true });
console.log("Sprint 029 quit confirmation assertions passed");

decision = "save-all";
const savingSwitch = createDesktopService(undefined, {
	async choose() { return nextSelection; }, async confirmTransition() { return decision; }
});
await savingSwitch.request.openProject({ path: root });
await savingSwitch.request.openDocument({ path: entry });
await savingSwitch.request.updateBuffer({ text: "# saved on switch\n" });
assert.equal((await savingSwitch.request.pickProject()).ok, true);
assert.equal(readFileSync(entry, "utf8"), "# saved on switch\n");

const restoreSessionFile = join(root, "restore-session.json");
const restoringSwitch = createDesktopService(undefined, {
	async choose() { return nextSelection; }, async confirmTransition() { return decision; }
}, restoreSessionFile);
await restoringSwitch.request.openProject({ path: root });
await restoringSwitch.request.openDocument({ path: entry });
await restoringSwitch.request.openProject({ path: otherProject });
const otherEntry = join(otherProject, "other.amx");
writeFileSync(otherEntry, "# other\n");
await restoringSwitch.request.openDocument({ path: otherEntry });
await restoringSwitch.request.updateBuffer({ text: "# pending other\n" });
decision = "cancel";
const cancelledRestore = await restoringSwitch.request.restoreProject({ root });
assert.equal(cancelledRestore.ok, false);
const retainedOther = await restoringSwitch.request.readDocument();
assert.equal(retainedOther.ok, true);
if (!retainedOther.ok) throw new Error(retainedOther.error.message);
assert.equal(retainedOther.document.text, "# pending other\n");
decision = "discard-all";
const approvedRestore = await restoringSwitch.request.restoreProject({ root });
assert.equal(approvedRestore.ok, true);
if (!approvedRestore.ok) throw new Error(approvedRestore.error.message);
assert.equal(approvedRestore.root, root);
assert.equal(readFileSync(otherEntry, "utf8"), "# other\n");
console.log("Sprint 029 save-all switch and guarded recent restore assertions passed");

const pickedRecent = createDesktopService(undefined, { async choose() { return root; } }, restoreSessionFile);
const selectedRecent = await pickedRecent.request.pickProject();
assert.equal(selectedRecent.ok, true);
const pickedState = await pickedRecent.request.getWorkbench();
assert.equal(pickedState.ok, true);
if (!pickedState.ok) throw new Error(pickedState.error.message);
assert.equal(pickedState.state.active, entry);
assert.equal((await pickedRecent.request.readDocument()).ok, true);
console.log("Sprint 029 native project selection restores validated recent tabs");

const multiSave = createDesktopService(root);
await multiSave.request.openDocument({ path: entry });
const entryBeforeMultiSave = readFileSync(entry, "utf8");
await multiSave.request.updateBuffer({ text: "# pending entry save\n" });
await multiSave.request.openDocument({ path: join(root, "nested", "module.amx") });
await multiSave.request.updateBuffer({ text: "# pending dependency save\n" });
writeFileSync(join(root, "nested", "module.amx"), "# conflicting dependency\n");
const blockedMultiSave = await multiSave.request.prepareTransition({ action: "save-all" });
assert.equal(blockedMultiSave.ok, false);
assert.equal(readFileSync(entry, "utf8"), entryBeforeMultiSave);
const multiState = await multiSave.request.getWorkbench();
assert.equal(multiState.ok, true);
if (!multiState.ok) throw new Error(multiState.error.message);
assert.equal(multiState.state.tabs.filter(tab => tab.dirty).length, 2);
console.log("Sprint 029 multi-tab save preflight assertions passed");
console.log("Final active resources:", process.getActiveResourcesInfo());