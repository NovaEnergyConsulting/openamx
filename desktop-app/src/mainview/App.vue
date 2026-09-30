<script setup lang="ts">
import { ref } from "vue";
import type { DesktopRPCClient, InputConfiguration, OpenDocument, RunSummary, TextAnalysis, TextDiagnostic } from "../shared/rpc";
import { Button } from "@/components/ui/button";

const props = defineProps<{ rpc: DesktopRPCClient }>();
const projectPath = ref("");
const filePath = ref("");
const document = ref<OpenDocument | null>(null);
const preview = ref("");
const analysis = ref<TextAnalysis>({ diagnostics: [], completions: [] });
const inputConfiguration = ref<InputConfiguration>({ inputs: [], diagnostics: [] });
const inputOverrides = ref("");
const validation = ref<"aggregate" | "fail-fast">("aggregate");
const htmlDestination = ref("analysis.html");
const pdfDestination = ref("analysis.pdf");
const docxDestination = ref("analysis.docx");
const summary = ref<RunSummary>({ values: [] });
const runState = ref<"idle" | "running" | "success" | "failure">("idle");
const previewState = ref<"idle" | "running" | "success" | "failure">("idle");
const exportStatus = ref("");
const files = ref<string[]>([]);
const status = ref("Open a project and an .amx file to begin.");
const pending = ref(false);
let bufferRevision = 0;
let previewRequest = 0;
let runRequest = 0;
let htmlRequest = 0;
let pdfRequest = 0;
let docxRequest = 0;

function mappings(): string[] {
	return inputOverrides.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
}

function isCurrent(revision: number): boolean {
	return revision === bufferRevision;
}

function resetResults() {
	summary.value = { values: [] };
	runState.value = "idle";
	exportStatus.value = "";
}

function invalidateInputResults() {
	resetResults();
	preview.value = "";
	previewState.value = "idle";
}

function validationChanged() {
	invalidateInputResults();
	void refresh();
}

async function openProject() {
	const result = await props.rpc.request.openProject({ path: projectPath.value });
	if (!result.ok) { status.value = result.error.message; return; }
	const listing = await props.rpc.request.listProjectFiles();
	if (listing.ok) files.value = listing.files.map(file => file.path);
	status.value = `Project ready: ${result.root}`;
}

async function openDocument() {
	const result = await props.rpc.request.openDocument({ path: filePath.value });
	if (!result.ok) { status.value = result.error.message; return; }
	bufferRevision++;
	document.value = result.document;
	preview.value = "";
	previewState.value = "idle";
	analysis.value = { diagnostics: [], completions: [] };
	inputConfiguration.value = { inputs: [], diagnostics: [] };
	inputOverrides.value = "";
	resetResults();
	status.value = `Opened ${result.document.path}`;
	await refresh();
}

async function refresh() {
	if (!document.value) return;
	const revision = bufferRevision;
	const request = ++previewRequest;
	previewState.value = "running";
	pending.value = true;
	const selectedInputs = mappings();
	let rendered: Awaited<ReturnType<typeof props.rpc.request.previewBuffer>>;
	let configured: Awaited<ReturnType<typeof props.rpc.request.getInputConfiguration>>;
	try {
		[rendered, configured] = await Promise.all([
			props.rpc.request.previewBuffer({ inputMappings: selectedInputs, validation: validation.value }),
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
	if (rendered.ok) {
		preview.value = rendered.html;
		analysis.value = { diagnostics: rendered.diagnostics, completions: [] };
		previewState.value = rendered.diagnostics.length ? "failure" : "success";
	} else {
		preview.value = "";
		previewState.value = "failure";
		analysis.value = { diagnostics: [{ code: rendered.error.code, message: rendered.error.message }], completions: [] };
	}
	const issues = [...analysis.value.diagnostics, ...inputConfiguration.value.diagnostics];
	status.value = issues.length ? `${issues.length} issue(s)` : "Preview reflects the current buffer.";
	pending.value = false;
}

async function updateText(text: string) {
	if (!document.value) return;
	const revision = ++bufferRevision;
	previewRequest++;
	pending.value = false;
	preview.value = "";
	previewState.value = "running";
	resetResults();
	const result = await props.rpc.request.updateBuffer({ text });
	if (!isCurrent(revision)) return;
	if (!result.ok) { status.value = result.error.message; return; }
	document.value = result.document;
	await refresh();
}

async function save() {
	const result = await props.rpc.request.saveDocument();
	status.value = result.ok ? "Saved." : result.error.message;
	if (result.ok) document.value = result.document;
}

async function format() {
	const result = await props.rpc.request.formatBuffer();
	if (!result.ok) { status.value = result.error.message; return; }
	await updateText(result.text);
}

async function runAnalysis() {
	if (!document.value) return;
	const revision = bufferRevision;
	const request = ++runRequest;
	runState.value = "running";
	summary.value = { values: [] };
	let result: Awaited<ReturnType<typeof props.rpc.request.runBuffer>>;
	try {
		result = await props.rpc.request.runBuffer({ inputMappings: mappings(), validation: validation.value });
	} catch (error) {
		if (isCurrent(revision) && request === runRequest) {
			runState.value = "failure";
			summary.value = { values: [] };
			analysis.value = { ...analysis.value, diagnostics: [{ code: "DESKTOP_RPC", message: error instanceof Error ? error.message.slice(0, 1000) : "Run request failed." }] };
		}
		return;
	}
	if (!isCurrent(revision) || request !== runRequest) return;
	if (!result.ok) {
		runState.value = "failure";
		analysis.value = { ...analysis.value, diagnostics: [{ code: result.error.code, message: result.error.message }] };
		return;
	}
	summary.value = result.summary;
	analysis.value = { ...analysis.value, diagnostics: result.diagnostics };
	runState.value = result.diagnostics.length ? "failure" : "success";
	status.value = result.diagnostics.length ? "Analysis failed for the current buffer." : "Analysis completed for the current buffer.";
}

async function saveHtml() {
	if (!document.value) return;
	const revision = bufferRevision;
	const request = ++htmlRequest;
	exportStatus.value = "Saving HTML…";
	let result: Awaited<ReturnType<typeof props.rpc.request.saveHtml>>;
	try {
		result = await props.rpc.request.saveHtml({ path: htmlDestination.value, inputMappings: mappings(), validation: validation.value });
	} catch (error) {
		if (isCurrent(revision) && request === htmlRequest) exportStatus.value = error instanceof Error ? error.message.slice(0, 1000) : "HTML save request failed.";
		return;
	}
	if (!isCurrent(revision) || request !== htmlRequest) return;
	if (!result.ok) { exportStatus.value = result.error.message; return; }
	if (result.diagnostics.length) {
		analysis.value = { ...analysis.value, diagnostics: result.diagnostics };
		exportStatus.value = "HTML save failed.";
	} else exportStatus.value = `Saved ${result.path}`;
}

async function exportPdf() {
	if (!document.value) return;
	const revision = bufferRevision;
	const request = ++pdfRequest;
	exportStatus.value = "Preparing PDF…";
	let result: Awaited<ReturnType<typeof props.rpc.request.exportPdf>>;
	try {
		result = await props.rpc.request.exportPdf({ path: pdfDestination.value, inputMappings: mappings(), validation: validation.value });
	} catch (error) {
		if (isCurrent(revision) && request === pdfRequest) exportStatus.value = error instanceof Error ? error.message.slice(0, 1000) : "PDF export request failed.";
		return;
	}
	if (!isCurrent(revision) || request !== pdfRequest) return;
	if (!result.ok) { exportStatus.value = result.error.message; return; }
	if (result.diagnostics.length) {
		analysis.value = { ...analysis.value, diagnostics: result.diagnostics };
		exportStatus.value = "PDF export failed.";
	} else exportStatus.value = `Saved ${result.path} (${result.bytes.toLocaleString()} bytes)`;
}

async function exportDocx() {
	if (!document.value) return;
	const revision = bufferRevision;
	const request = ++docxRequest;
	exportStatus.value = "Preparing DOCX…";
	let result: Awaited<ReturnType<typeof props.rpc.request.exportDocx>>;
	try {
		result = await props.rpc.request.exportDocx({ path: docxDestination.value, inputMappings: mappings(), validation: validation.value });
	} catch (error) {
		if (isCurrent(revision) && request === docxRequest) exportStatus.value = error instanceof Error ? error.message.slice(0, 1000) : "DOCX export request failed.";
		return;
	}
	if (!isCurrent(revision) || request !== docxRequest) return;
	if (!result.ok) { exportStatus.value = result.error.message; return; }
	if (result.diagnostics.length) {
		analysis.value = { ...analysis.value, diagnostics: result.diagnostics };
		exportStatus.value = "DOCX export failed.";
	} else exportStatus.value = `Saved ${result.path} (${result.bytes.toLocaleString()} bytes)`;
}

function displayDiagnostic(item: TextDiagnostic): string {
	const context = [item.inputName, item.dataPath, item.dataLine ? `data line ${item.dataLine}` : ""].filter(Boolean).join(" · ");
	return context ? `${item.message} (${context})` : item.message;
}
</script>

<template>
	<main>
		<header><span class="wordmark">OpenAMX</span><span class="eyebrow">AUTHORING FOUNDATION / V0.4</span></header>
		<section class="toolbar" aria-label="Project controls">
			<input v-model="projectPath" aria-label="Project path" placeholder="Project folder path" @keyup.enter="openProject">
			<Button type="button" @click="openProject">Open project</Button>
			<input v-model="filePath" aria-label="Document path" placeholder="Entry .amx path" @keyup.enter="openDocument">
			<Button type="button" @click="openDocument">Open file</Button>
		</section>
		<section class="workflow" aria-label="Analysis workflow">
			<div class="workflow-grid">
				<label class="mapping-control">Per-run input paths <span>one name=path mapping per line</span><textarea v-model="inputOverrides" :disabled="!document" aria-label="Per-run input mappings" spellcheck="false" placeholder="assets=data/assets.json" @input="invalidateInputResults" @change="refresh"></textarea></label>
				<div class="run-controls">
					<label>Validation <select v-model="validation" :disabled="!document" @change="validationChanged"><option value="aggregate">Aggregate</option><option value="fail-fast">Fail fast</option></select></label>
					<div class="button-row"><Button :disabled="!document || runState === 'running'" type="button" @click="runAnalysis">{{ runState === "running" ? "Running…" : "Run analysis" }}</Button><Button :disabled="!document || pending" type="button" @click="refresh">Refresh preview</Button></div>
					<p class="workflow-status" aria-live="polite">{{ status }}</p>
				</div>
				<div class="configuration" aria-label="Input configuration sources">
					<strong>INPUT SOURCES</strong>
					<p v-for="input in inputConfiguration.inputs" :key="input.name"><code>{{ input.name }}</code><span>{{ input.source }}</span></p>
					<p v-if="!inputConfiguration.inputs.length" class="muted">No declared inputs.</p>
				</div>
			</div>
			<div class="export-row">
				<label>HTML destination <input v-model="htmlDestination" :disabled="!document" aria-label="HTML destination"></label><Button :disabled="!document" type="button" @click="saveHtml">Save HTML</Button>
				<label>PDF destination <input v-model="pdfDestination" :disabled="!document" aria-label="PDF destination"></label><Button :disabled="!document" type="button" @click="exportPdf">Export PDF</Button>
				<label>DOCX destination <input v-model="docxDestination" :disabled="!document" aria-label="DOCX destination"></label><Button :disabled="!document" type="button" @click="exportDocx">Export DOCX</Button>
				<span class="export-status" aria-live="polite">{{ exportStatus }}</span>
			</div>
		</section>
		<div class="workbench">
			<aside><p class="kicker">LOCAL MODULES</p><button v-for="file in files" :key="file" class="file" @click="filePath = file; void openDocument()">{{ file }}</button><p v-if="!files.length" class="muted">No project loaded.</p></aside>
			<section class="editor-pane" aria-label="AMX editor">
				<div class="pane-header"><strong>{{ document?.path ?? "No document" }}</strong><span v-if="document?.dirty" class="dirty">Unsaved</span><span v-if="document?.conflict" class="failure">Conflict</span><span class="actions"><Button :disabled="!document || pending" type="button" @click="format">Format</Button><Button :disabled="!document || !document.dirty" type="button" @click="save">Save</Button></span></div>
				<textarea :value="document?.text ?? ''" :disabled="!document" spellcheck="false" aria-label="AMX source" @input="updateText(($event.target as HTMLTextAreaElement).value)"></textarea>
				<div class="diagnostics" aria-live="polite"><p v-for="(item, index) in [...analysis.diagnostics, ...inputConfiguration.diagnostics]" :key="`${item.code}-${item.line}-${index}`"><strong>{{ item.code }}</strong> {{ displayDiagnostic(item) }} <span v-if="item.line">({{ item.line }}:{{ item.column }})</span></p><p v-if="![...analysis.diagnostics, ...inputConfiguration.diagnostics].length" class="muted">{{ status }}</p></div>
			</section>
			<section class="preview-pane" aria-label="Live HTML preview"><div class="pane-header"><strong>LIVE PREVIEW</strong><span class="state" :class="`state-${previewState}`">{{ previewState }}</span></div><iframe :srcdoc="preview" sandbox="" title="OpenAMX live HTML preview"></iframe></section>
		</div>
		<section class="result-strip" aria-label="Analysis result">
			<div><strong>RUN RESULT</strong><span class="state" :class="`state-${runState}`">{{ runState }}</span></div>
			<p v-for="item in summary.values" :key="item.name"><code>{{ item.name }}</code><span>{{ item.value }}</span></p>
			<p v-if="!summary.values.length" class="muted">No current result values.</p>
		</section>
	</main>
</template>