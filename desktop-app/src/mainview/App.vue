<script setup lang="ts">
import { ref, watch } from "vue";
import type { DesktopRPCClient, OpenDocument, TextAnalysis } from "../shared/rpc";
import { Button } from "@/components/ui/button";

const props = defineProps<{ rpc: DesktopRPCClient }>();
const projectPath = ref("");
const filePath = ref("");
const document = ref<OpenDocument | null>(null);
const preview = ref("");
const analysis = ref<TextAnalysis>({ diagnostics: [], completions: [] });
const files = ref<string[]>([]);
const status = ref("Open a project and an .amx file to begin.");
const pending = ref(false);

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
	document.value = result.document;
	status.value = `Opened ${result.document.path}`;
	await refresh();
}

async function refresh() {
	if (!document.value) return;
	const [diagnostics, rendered] = await Promise.all([
		props.rpc.request.analyzeBuffer(),
		props.rpc.request.previewBuffer()
	]);
	if (diagnostics.ok) analysis.value = diagnostics.analysis;
	if (rendered.ok) {
		preview.value = rendered.html;
		if (rendered.diagnostics.length) analysis.value = { ...analysis.value, diagnostics: rendered.diagnostics };
	}
	status.value = analysis.value.diagnostics.length ? `${analysis.value.diagnostics.length} issue(s)` : "Preview is current buffer output.";
}

async function updateText(text: string) {
	if (!document.value) return;
	const result = await props.rpc.request.updateBuffer({ text });
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

watch(() => document.value?.text, (text, previous) => {
	if (text !== undefined && text !== previous) void refresh();
});
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
		<div class="workbench">
			<aside><p class="kicker">LOCAL MODULES</p><button v-for="file in files" :key="file" class="file" @click="filePath = file; void openDocument()">{{ file }}</button><p v-if="!files.length" class="muted">No project loaded.</p></aside>
			<section class="editor-pane" aria-label="AMX editor">
				<div class="pane-header"><strong>{{ document?.path ?? "No document" }}</strong><span v-if="document?.dirty" class="dirty">Unsaved</span><span v-if="document?.conflict" class="failure">Conflict</span><span class="actions"><Button :disabled="!document || pending" type="button" @click="format">Format</Button><Button :disabled="!document || !document.dirty" type="button" @click="save">Save</Button></span></div>
				<textarea :value="document?.text ?? ''" :disabled="!document" spellcheck="false" aria-label="AMX source" @input="updateText(($event.target as HTMLTextAreaElement).value)"></textarea>
				<div class="diagnostics" aria-live="polite"><p v-for="item in analysis.diagnostics" :key="`${item.code}-${item.line}-${item.message}`"><strong>{{ item.code }}</strong> {{ item.message }} <span v-if="item.line">({{ item.line }}:{{ item.column }})</span></p><p v-if="!analysis.diagnostics.length" class="muted">{{ status }}</p></div>
			</section>
			<section class="preview-pane" aria-label="Live HTML preview"><div class="pane-header"><strong>LIVE PREVIEW</strong><span class="muted">Current buffer</span></div><iframe :srcdoc="preview" sandbox="" title="OpenAMX live HTML preview"></iframe></section>
		</div>
	</main>
</template>