<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { basicSetup, EditorView } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { openSearchPanel } from "@codemirror/search";

const props = defineProps<{ path: string; text: string }>();
const emit = defineEmits<{ change: [text: string] }>();
const host = ref<HTMLElement | null>(null);
const states = new Map<string, EditorState>();
const scrollPositions = new Map<string, number>();
let editor: EditorView | undefined;
let applyingExternal = false;

const extensions = [basicSetup, markdown(), EditorView.contentAttributes.of({ "aria-label": "OpenAMX source", spellcheck: "false" }), EditorView.updateListener.of(update => {
	if (update.docChanged && !applyingExternal) emit("change", update.state.doc.toString());
})];

function createState(text: string) {
	return EditorState.create({ doc: text, extensions });
}

function replaceText(text: string) {
	if (!editor || editor.state.doc.toString() === text) return;
	const current = editor.state.doc.toString();
	let prefix = 0;
	while (prefix < current.length && prefix < text.length && current[prefix] === text[prefix]) prefix++;
	let suffix = 0;
	while (suffix < current.length - prefix && suffix < text.length - prefix && current[current.length - suffix - 1] === text[text.length - suffix - 1]) suffix++;
	const scrollTop = editor.scrollDOM.scrollTop;
	editor.dispatch({ changes: { from: prefix, to: current.length - suffix, insert: text.slice(prefix, text.length - suffix) } });
	editor.scrollDOM.scrollTop = scrollTop;
}

function focus() { editor?.focus(); }
function openSearch() { if (editor) { editor.focus(); openSearchPanel(editor); } }

function selectLocation(line: number, column: number) {
	if (!editor || !Number.isSafeInteger(line) || line < 1 || line > editor.state.doc.lines) return;
	const sourceLine = editor.state.doc.line(line);
	const offset = Math.min(sourceLine.to, sourceLine.from + Math.max(0, column - 1));
	editor.dispatch({ selection: { anchor: offset }, scrollIntoView: true });
	editor.focus();
}

defineExpose({ focus, openSearch, replaceText, selectLocation });

onMounted(() => {
	editor = new EditorView({
		state: createState(props.text),
		parent: host.value!
	});
});

watch(() => [props.path, props.text] as const, ([path, text], [oldPath]) => {
	if (!editor) return;
	if (path !== oldPath) {
		states.set(oldPath, editor.state);
		scrollPositions.set(oldPath, editor.scrollDOM.scrollTop);
		const saved = states.get(path);
		editor.setState(saved?.doc.toString() === text ? saved : createState(text));
		editor.scrollDOM.scrollTop = scrollPositions.get(path) ?? 0;
		return;
	}
	if (editor.state.doc.toString() !== text) {
		applyingExternal = true;
		try { editor.setState(createState(text)); }
		finally { applyingExternal = false; }
	}
});

onUnmounted(() => { editor?.destroy(); editor = undefined; });
</script>

<template><div ref="host" class="code-editor" aria-label="OpenAMX source editor"></div></template>