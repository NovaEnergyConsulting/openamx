import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { createPingResponse } from "../src/shared/rpc";
import { createDesktopService } from "../src/bun/desktopService";
import { chooseSaveDestination, saveDialogCommand } from "../src/bun/nativeSaveDialog";

const result = createPingResponse("request-1", "1.4.2");
assert.deepEqual(result, { nonce: "request-1", runtime: "bun", version: "1.4.2" });
assert.deepEqual(Object.keys(result), ["nonce", "runtime", "version"]);
for (const platform of ["linux", "darwin", "win32"] as const) {
	const picker = saveDialogCommand(platform, "/project with spaces", ".html");
	assert.ok(picker.args.some(arg => arg.includes("report.html") || arg.includes("OPENAMX_SAVE_NAME")) || picker.env.OPENAMX_SAVE_NAME === "report.html");
	assert.equal(picker.args.some(arg => arg.includes("openFileDialog")), false);
}
assert.equal(await chooseSaveDestination("/project", ".html", "linux", async () => ({ stdout: "/project/new.html\n", stderr: "", exitCode: 0 })), "/project/new.html");
assert.equal(await chooseSaveDestination("/project", ".pdf", "linux", async () => ({ stdout: "", stderr: "", exitCode: 1 })), undefined);
assert.equal(await chooseSaveDestination("/project", ".pdf", "darwin", async () => ({ stdout: "", stderr: "execution error: User canceled. (-128)", exitCode: 1 })), undefined);
assert.equal(await chooseSaveDestination("/project", ".docx", "win32", async () => ({ stdout: "", stderr: "", exitCode: 0 })), undefined);
await assert.rejects(chooseSaveDestination("/project", ".html", "win32", async () => ({ stdout: "", stderr: "error", exitCode: 1 })), /Native save dialog failed/);
await assert.rejects(chooseSaveDestination("/project", ".html", "linux", async () => ({ stdout: "/project/invalid\nname.html", stderr: "", exitCode: 0 })), /invalid path/);
const webviewSource = readFileSync(join(import.meta.dir, "../src/mainview/App.vue"), "utf8");
assert.match(webviewSource, /sandbox=""/);
assert.doesNotMatch(webviewSource, /node:fs|node:child_process|loadEntryModule|loadInputValues|preparePdfReport|serializePdfReport|prepareDocxReport|serializeDocxReport|Bun\./);
console.log("Typed RPC and webview boundary contract passed (4 assertions)");

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
assert.match(readFileSync(join(createdProjectDirectory, "report.amx"), "utf8"), /export let title: Text = "New Report"/);
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

const root = mkdtempSync(join(tmpdir(), "openamx-desktop-"));
mkdirSync(join(root, "nested"));
const entry = join(root, "main.amx");
writeFileSync(entry, "# Saved\n\n```amx\nlet value = 1\n```\n");
writeFileSync(join(root, "nested", "module.amx"), "```amx\nlet value = 2\n```");
const outside = join(tmpdir(), `openamx-outside-${Date.now()}.amx`);
writeFileSync(outside, "```amx\nlet value = 3\n```");
symlinkSync(outside, join(root, "nested", "outside.amx"));

const service = createDesktopService();
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
console.log("Desktop session contract passed (11 assertions)");

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
const generationService = createDesktopService();
assert.equal((await generationService.request.openProject({ path: generationRoot })).ok, true);
assert.equal((await generationService.request.openDocument({ path: generationEntry })).ok, true);
const generationState = await generationService.request.getWorkbench();
assert.equal(generationState.ok, true);
if (!generationState.ok || !generationState.state.requestIdentity) throw new Error("Active identity unavailable before project-switch test.");
const protectedPdf = join(generationRoot, "existing.pdf");
writeFileSync(protectedPdf, "preserve-across-project-switch");
const projectSwitchJob = await generationService.request.startJob({
	operation: "pdf", identity: generationState.state.requestIdentity, destination: protectedPdf
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
const pendingExport = await service.request.startJob({ operation: "pdf", identity: jobStartState.state.requestIdentity, destination: cancelledPdf });
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
assert.deepEqual(inputConfig.configuration.inputs, [
	{ name: "amounts", source: "local" },
	{ name: "rows", source: "project" }
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
const htmlSave = await service.request.saveHtml({ path: "reports/analysis.html" });
const htmlDurationMs = performance.now() - htmlStartedAt;
assert.equal(htmlSave.ok, true);
if (!htmlSave.ok) throw new Error(htmlSave.error.message);
assert.equal(htmlSave.path, htmlPath);
assert.equal(readFileSync(htmlPath, "utf8"), previewWithInputs.html);
const pdfPath = join(reportDirectory, "analysis.pdf");
const pdfStartedAt = performance.now();
const pdfExport = await service.request.exportPdf({ path: "reports/analysis.pdf" });
const pdfDurationMs = performance.now() - pdfStartedAt;
assert.equal(pdfExport.ok, true);
if (!pdfExport.ok) throw new Error(pdfExport.error.message);
assert.equal(pdfExport.path, pdfPath);
assert.ok(pdfExport.bytes > 1000);
assert.match(readFileSync(pdfPath).toString("utf8", 0, 4), /^%PDF$/);
const docxPath = join(reportDirectory, "analysis.docx");
const docxStartedAt = performance.now();
const docxExport = await service.request.exportDocx({ path: "reports/analysis.docx" });
const docxDurationMs = performance.now() - docxStartedAt;
assert.equal(docxExport.ok, true);
if (!docxExport.ok) throw new Error(docxExport.error.message);
assert.equal(docxExport.path, docxPath);
assert.ok(docxExport.bytes > 1000);
assert.match(readFileSync(docxPath).toString("utf8", 0, 2), /^PK$/);
console.log(`Sprint 036 real pipelines: preview=${previewDurationMs.toFixed(1)} ms/${previewWithInputs.html.length} chars; HTML=${htmlDurationMs.toFixed(1)} ms/${Buffer.byteLength(readFileSync(htmlPath, "utf8"))} bytes; PDF=${pdfDurationMs.toFixed(1)} ms/${pdfExport.bytes} bytes; DOCX=${docxDurationMs.toFixed(1)} ms/${docxExport.bytes} bytes`);

const invalidSource = "```amx\nlet incomplete =\n```\n";
await service.request.updateBuffer({ text: invalidSource });
writeFileSync(htmlPath, "preserve-html");
writeFileSync(pdfPath, "preserve-pdf");
writeFileSync(docxPath, "preserve-docx");
const failedHtml = await service.request.saveHtml({ path: "reports/analysis.html" });
assert.equal(failedHtml.ok, true);
if (!failedHtml.ok) throw new Error(failedHtml.error.message);
assert.equal(failedHtml.diagnostics.length, 1);
assert.equal(readFileSync(htmlPath, "utf8"), "preserve-html");
const failedPreview = await service.request.previewBuffer();
assert.equal(failedPreview.ok, true);
if (!failedPreview.ok) throw new Error(failedPreview.error.message);
assert.equal(failedPreview.html, "");
assert.equal(failedPreview.diagnostics.length, 1);
const failedPdf = await service.request.exportPdf({ path: "reports/analysis.pdf" });
assert.equal(failedPdf.ok, true);
if (!failedPdf.ok) throw new Error(failedPdf.error.message);
assert.equal(failedPdf.diagnostics.length, 1);
assert.equal(readFileSync(pdfPath, "utf8"), "preserve-pdf");
const failedDocx = await service.request.exportDocx({ path: "reports/analysis.docx" });
assert.equal(failedDocx.ok, true);
if (!failedDocx.ok) throw new Error(failedDocx.error.message);
assert.equal(failedDocx.diagnostics.length, 1);
assert.equal(readFileSync(docxPath, "utf8"), "preserve-docx");
const htmlLink = join(reportDirectory, "linked.html");
await service.request.updateBuffer({ text: entrySource });
symlinkSync(htmlPath, htmlLink);
const rejectedHtmlLink = await service.request.saveHtml({ path: "reports/linked.html" });
assert.equal(rejectedHtmlLink.ok, true);
if (!rejectedHtmlLink.ok) throw new Error(rejectedHtmlLink.error.message);
assert.equal(rejectedHtmlLink.diagnostics[0]?.code, "AMX6001");
assert.equal(existsSync(htmlLink), true);
const outsideHtml = await service.request.saveHtml({ path: join(tmpdir(), `outside-${Date.now()}.html`) });
assert.equal(outsideHtml.ok, true);
if (!outsideHtml.ok) throw new Error(outsideHtml.error.message);
assert.equal(outsideHtml.diagnostics[0]?.code, "AMX6001");
const missingParentPdf = await service.request.exportPdf({ path: "missing/analysis.pdf" });
assert.equal(missingParentPdf.ok, true);
if (!missingParentPdf.ok) throw new Error(missingParentPdf.error.message);
assert.equal(missingParentPdf.diagnostics[0]?.code, "AMX6001");
assert.equal(readFileSync(pdfPath, "utf8"), "preserve-pdf");
const missingParentDocx = await service.request.exportDocx({ path: "missing/analysis.docx" });
assert.equal(missingParentDocx.ok, true);
if (!missingParentDocx.ok) throw new Error(missingParentDocx.error.message);
assert.equal(missingParentDocx.diagnostics[0]?.code, "AMX6001");
assert.equal(readFileSync(docxPath, "utf8"), "preserve-docx");
assert.equal(readFileSync(entry, "utf8"), savedSource);
console.log("Desktop workflow contract passed (precedence, validation, current-buffer, HTML/PDF safety)");

const ignored = join(root, "build");
mkdirSync(ignored);
writeFileSync(join(ignored, "hidden.amx"), "# hidden");
writeFileSync(join(root, ".hidden.amx"), "# hidden");
let selectedPath: string | undefined;
const picked = createDesktopService(undefined, { async choose() { return selectedPath; } });
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
selectedPath = outside;
assert.equal((await picked.request.pickDestination({ extension: ".html" })).ok, false);
selectedPath = join(root, "reports", "new-report.html");
const newDestination = await picked.request.pickDestination({ extension: ".html" });
assert.equal(newDestination.ok, true);
if (!newDestination.ok) throw new Error(newDestination.error.message);
assert.equal(newDestination.path, selectedPath);
assert.equal(existsSync(selectedPath), false);
selectedPath = join(root, "reports", "wrong.HTML");
assert.equal((await picked.request.pickDestination({ extension: ".html" })).ok, false);
selectedPath = undefined;
assert.deepEqual(await picked.request.pickDestination({ extension: ".pdf" }), { ok: true, cancelled: true });
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