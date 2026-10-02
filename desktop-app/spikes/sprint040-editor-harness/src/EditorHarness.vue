<script setup lang="ts">
import { computed, ref } from "vue";
import CodeEditor from "../../../src/mainview/CodeEditor.vue";
import { editorCompletionFacts } from "../../../../src/editor/completion";
import { editorHighlightFacts } from "../../../../src/editor/highlighting";
import { editorSymbolFacts } from "../../../../src/editor/symbols";
import { parseDocumentText } from "../../../../src/parser/parseDocument";
import type { TextAnalysis } from "../../../src/shared/rpc";

const spacers = Array.from({ length: 24 }, (_, index) => `Narrative spacer ${index + 1}`).join("\r\n");
const fence = String.fromCharCode(96).repeat(3);
const initial = ["# \u{1F680} Report", "", spacers, "", `${fence}js`, "let ordinary = 1", fence, `${fence}amx`,
	"let earlier: Number = 2", "let current: Number = earlier + 1", "show missing", fence, ""].join("\r\n");
const text = ref(initial);
const staleText = initial;
const revision = ref(1);
const completionProbe = ref("not requested");
const selectionProbe = ref("not formatted");
const staleProbe = ref("not delivered");
const editor = ref<InstanceType<typeof CodeEditor> | null>(null);
const parsed = computed(() => {
	try { return parseDocumentText(text.value); }
	catch { return parseDocumentText(""); }
});
const highlights = computed(() => editorHighlightFacts(text.value, parsed.value));
const symbols = computed(() => editorSymbolFacts(text.value, "/project/report.amx", parsed.value));
const diagnosticLine = computed(() => text.value.slice(0, text.value.indexOf("show missing")).split(/\r?\n/).length);
const diagnostics = computed(() => [{ code: "AMX3001", message: "Unknown visualization", file: "report.amx", line: diagnosticLine.value, column: 6 }]);
const actions = computed(() => [{ from: text.value.indexOf("missing"), to: text.value.indexOf("missing") + 7,
	expected: "missing", replacement: "report", title: "Use visible view 'report'", code: "AMX3001", revision: revision.value }]);

async function changed(next: string) {
	await new Promise(resolve => setTimeout(resolve, 1000));
	text.value = next;
	revision.value++;
}

async function complete(offset: number): Promise<string[]> {
	const labels = editorCompletionFacts(text.value, offset, parsed.value).map(item => item.label);
	completionProbe.value = `${offset}: ${labels.slice(0, 5).join(", ")}`;
	return labels;
}

async function rename(offset: number, newName: string): Promise<boolean> {
	if (revision.value !== 1) return false;
	const oldName = "earlier";
	if (text.value.slice(offset, offset + oldName.length) !== oldName) return false;
	changed(text.value.slice(0, offset) + newName + text.value.slice(offset + oldName.length));
	return true;
}

function format() {
	const before = editor.value?.getSelectionOffset();
	const next = text.value.replace("let earlier", "let  earlier");
	editor.value?.replaceText(next);
	selectionProbe.value = `${before} -> ${editor.value?.getSelectionOffset()}`;
}

function deliverStaleText() {
	const before = editor.value?.getSelectionOffset();
	text.value = staleText;
	revision.value++;
	staleProbe.value = `${before} -> ${editor.value?.getSelectionOffset()}`;
}
</script>

<template>
	<main>
		<h1>Editor proof</h1>
		<button type="button" @click="format">Apply format edit</button>
		<button type="button" @click="deliverStaleText">Deliver stale acknowledgement</button>
		<CodeEditor ref="editor" path="/project/report.amx" :text="text" :revision="revision" :highlights="highlights" :diagnostics="diagnostics" :symbols="symbols" :actions="actions" :complete="complete" :rename="rename" @change="changed" />
		<output aria-live="polite">revision {{ revision }}</output>
		<output aria-label="Completion probe">{{ completionProbe }}</output>
		<output aria-label="Selection probe">{{ selectionProbe }}</output>
		<output aria-label="Stale echo probe">{{ staleProbe }}</output>
	</main>
</template>

<style>
html, body, #app { min-height: 100%; margin: 0; }
body { background: #e8efec; color: #192d2a; font: 14px system-ui, sans-serif; }
main { display: flex; width: min(920px, calc(100vw - 32px)); height: min(720px, calc(100vh - 32px)); flex-direction: column; gap: 10px; margin: 16px auto; padding: 12px; background: #fff; }
h1 { margin: 0; font: 600 18px system-ui, sans-serif; }
main > button { align-self: flex-start; }
.code-editor { flex: 1; min-height: 200px; min-width: 0; overflow: hidden; }
.code-editor .cm-editor { height: 100%; min-height: 200px; }
output { font: 12px monospace; }
</style>