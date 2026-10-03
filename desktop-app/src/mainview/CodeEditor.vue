<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { basicSetup, EditorView } from "codemirror";
import { indentWithTab } from "@codemirror/commands";
import { autocompletion, startCompletion, type CompletionContext } from "@codemirror/autocomplete";
import { markdown } from "@codemirror/lang-markdown";
import { Compartment, EditorSelection, EditorState, StateEffect, StateField } from "@codemirror/state";
import { Decoration, EditorView as CodeMirrorView, hoverTooltip, keymap } from "@codemirror/view";
import { openSearchPanel } from "@codemirror/search";
import type { EditorHighlightFact } from "../../../src/editor/highlighting";
import type { TextAnalysis, TextDiagnostic } from "../shared/rpc";

type EditorSymbol = NonNullable<TextAnalysis["symbols"]>[number];
type EditorAction = NonNullable<TextAnalysis["actions"]>[number];
const props = defineProps<{ path: string; text: string; revision?: number; wrapLines?: boolean; highlights?: EditorHighlightFact[]; diagnostics?: TextDiagnostic[]; symbols?: EditorSymbol[]; actions?: EditorAction[]; complete?: (offset: number) => Promise<string[]>; rename?: (offset: number, newName: string) => Promise<boolean> }>();
const emit = defineEmits<{ change: [text: string]; navigate: [path: string, offset: number]; references: [items: EditorSymbol[]] }>();
const host = ref<HTMLElement | null>(null);
const renameInput = ref<HTMLInputElement | null>(null);
const renameTarget = ref<EditorSymbol | null>(null);
const renameValue = ref("");
const states = new Map<string, EditorState>();
const scrollPositions = new Map<string, number>();
let editor: EditorView | undefined;
let applyingExternal = false;
let hasUnacknowledgedEdits = false;
const wrapping = new Compartment();

function normalizedEditorText(text: string): string { return text.replace(/\r\n/g, "\n"); }
function sourceText(editorText: string): string {
	const separator = props.text.includes("\r\n") ? "\r\n" : "\n";
	return editorText.replace(/\n/g, separator);
}

function toEditorOffset(sourceOffset: number): number {
	const limit = Math.max(0, Math.min(sourceOffset, props.text.length));
	let editorOffset = 0;
	for (let index = 0; index < limit; index++, editorOffset++) {
		if (props.text[index] === "\r" && props.text[index + 1] === "\n") index++;
	}
	return editorOffset;
}

function toSourceOffset(editorOffset: number): number {
	const target = Math.max(0, Math.min(editorOffset, editor?.state.doc.length ?? editorOffset));
	let sourceOffset = 0;
	let currentEditorOffset = 0;
	while (currentEditorOffset < target && sourceOffset < props.text.length) {
		if (props.text[sourceOffset] === "\r" && props.text[sourceOffset + 1] === "\n") sourceOffset += 2;
		else sourceOffset++;
		currentEditorOffset++;
	}
	return sourceOffset;
}

const setEditorFacts = StateEffect.define<{ highlights: EditorHighlightFact[]; diagnostics: TextDiagnostic[] }>();
const highlightField = StateField.define({
	create: () => Decoration.none,
	update(decorations, transaction) {
		decorations = decorations.map(transaction.changes);
		for (const effect of transaction.effects) {
			if (!effect.is(setEditorFacts)) continue;
			const marks = effect.value.highlights
				.map(fact => ({ from: toEditorOffset(fact.from), to: toEditorOffset(fact.to), kind: fact.kind }))
				.filter(fact => fact.from >= 0 && fact.to <= transaction.newDoc.length && fact.from < fact.to)
				.map(fact => Decoration.mark({ class: `amx-token amx-token-${fact.kind}` }).range(fact.from, fact.to));
			for (const item of effect.value.diagnostics) {
				if (!item.line || item.line < 1 || item.line > transaction.newDoc.lines) continue;
				const line = transaction.newDoc.line(item.line);
				const from = Math.min(line.to, line.from + Math.max(0, (item.column ?? 1) - 1));
				const to = Math.min(line.to, from + 1);
				if (from < to) marks.push(Decoration.mark({ class: "amx-diagnostic" }).range(from, to));
			}
			decorations = Decoration.set(marks, true);
		}
		return decorations;
	},
	provide: field => EditorView.decorations.from(field)
});

function completionSource(context: CompletionContext) {
	if (!props.complete) return null;
	const word = context.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/);
	if (!word && !context.explicit) return null;
	return props.complete(toSourceOffset(context.pos)).then(labels => ({
		from: word?.from ?? context.pos,
		options: labels.map(label => ({ label, type: "text" }))
	}));
}

function applyEditorFacts(highlights = props.highlights, diagnostics = props.diagnostics) {
	if (!editor || hasUnacknowledgedEdits || editor.state.doc.toString() !== normalizedEditorText(props.text)) return;
	editor.dispatch({ effects: setEditorFacts.of({ highlights: highlights ?? [], diagnostics: diagnostics ?? [] }) });
}

function symbolAt(offset: number): EditorSymbol | undefined {
	return props.symbols?.find(symbol => toEditorOffset(symbol.from) <= offset && offset < toEditorOffset(symbol.to));
}

function definitionAt(view: CodeMirrorView) {
	const symbol = symbolAt(view.state.selection.main.head);
	if (!symbol) return false;
	emit("navigate", symbol.target.file, symbol.target.from);
	return true;
}

function referencesAt(view: CodeMirrorView) {
	const symbol = symbolAt(view.state.selection.main.head);
	if (!symbol) return false;
	const references = props.symbols?.filter(item => item.target.file === symbol.target.file
		&& item.target.from === symbol.target.from && item.target.to === symbol.target.to) ?? [];
	emit("references", references);
	return true;
}

function beginRename(view: CodeMirrorView) {
	const symbol = symbolAt(view.state.selection.main.head);
	if (!symbol || !props.rename) return false;
	renameTarget.value = symbol;
	renameValue.value = symbol.name;
	void nextTick(() => renameInput.value?.focus());
	return true;
}

function cancelRename() { renameTarget.value = null; }

async function confirmRename() {
	const target = renameTarget.value;
	if (!target || !props.rename || !/^[A-Za-z][A-Za-z0-9_]*$/.test(renameValue.value)) return;
	if (await props.rename(target.from, renameValue.value)) renameTarget.value = null;
}


const extensions = [keymap.of([indentWithTab, { key: "F12", run: definitionAt }, { key: "Shift-F12", run: referencesAt }, { key: "F2", run: beginRename },
	{ key: "Ctrl-Space", run: startCompletion }, { key: "Cmd-Space", run: startCompletion }]),
	basicSetup, markdown(), wrapping.of(props.wrapLines === false ? [] : EditorView.lineWrapping), highlightField, autocompletion({ override: [completionSource] }),
	hoverTooltip((_view, position) => {
		const symbol = symbolAt(position);
		if (!symbol) return null;
		return { pos: symbol.from, end: symbol.to, create() {
			const dom = window.document.createElement("div");
			dom.className = "amx-symbol-tooltip";
			dom.textContent = symbol.detail + (symbol.origin ? `\nImported from ${symbol.origin.split(/[\\/]/).pop()}` : "");
			return { dom };
		} };
	}),
	EditorView.domEventHandlers({ mousedown(event, view) {
		if (!event.ctrlKey && !event.metaKey) return false;
		const position = view.posAtCoords({ x: event.clientX, y: event.clientY });
		if (position === null) return false;
		const symbol = symbolAt(position);
		if (!symbol) return false;
		emit("navigate", symbol.target.file, symbol.target.from);
		return true;
	} }),
	EditorView.contentAttributes.of({ "aria-label": "OpenAMX source", spellcheck: "false" }), EditorView.updateListener.of(update => {
	if (update.docChanged && !applyingExternal) {
		hasUnacknowledgedEdits = true;
		emit("change", sourceText(update.state.doc.toString()));
	}
})];

function createState(text: string) {
	return EditorState.create({ doc: normalizedEditorText(text), extensions });
}

function replaceText(text: string) {
	text = normalizedEditorText(text);
	if (!editor || editor.state.doc.toString() === text) return;
	const current = editor.state.doc.toString();
	let prefix = 0;
	while (prefix < current.length && prefix < text.length && current[prefix] === text[prefix]) prefix++;
	let suffix = 0;
	while (suffix < current.length - prefix && suffix < text.length - prefix && current[current.length - suffix - 1] === text[text.length - suffix - 1]) suffix++;
	const scrollTop = editor.scrollDOM.scrollTop;
	const changeFrom = prefix;
	const changeTo = current.length - suffix;
	const insertedLength = text.length - prefix - suffix;
	const mapPosition = (position: number) => position <= changeFrom
		? position
		: position >= changeTo ? position + insertedLength - (changeTo - changeFrom) : changeFrom + insertedLength;
	const selection = EditorSelection.create(editor.state.selection.ranges.map(range =>
		EditorSelection.range(mapPosition(range.anchor), mapPosition(range.head)),
	), editor.state.selection.mainIndex);
	editor.dispatch({ changes: { from: changeFrom, to: changeTo, insert: text.slice(prefix, text.length - suffix) }, selection });
	editor.scrollDOM.scrollTop = scrollTop;
}

function focus() { editor?.focus(); }
function openSearch() { if (editor) { editor.focus(); openSearchPanel(editor); } }

function selectLocation(line: number, column: number) {
	if (!editor || !Number.isSafeInteger(line) || line < 1 || line > editor.state.doc.lines) return;
	const sourceLine = editor.state.doc.line(line);
	const offset = Math.min(sourceLine.to, sourceLine.from + Math.max(0, column - 1));
	editor.dispatch({ selection: { anchor: toEditorOffset(offset) }, scrollIntoView: true });
	editor.focus();
}

function selectOffset(offset: number) {
	if (!editor || !Number.isSafeInteger(offset) || offset < 0 || offset > props.text.length) return;
	editor.dispatch({ selection: { anchor: offset }, scrollIntoView: true });
	editor.focus();
}

function getSelectionOffset() { return editor ? toSourceOffset(editor.state.selection.main.head) : undefined; }

function applyAction(action: EditorAction) {
	if (!editor || props.revision !== action.revision || editor.state.doc.toString() !== normalizedEditorText(props.text)
		|| editor.state.doc.sliceString(toEditorOffset(action.from), toEditorOffset(action.to)) !== action.expected) return;
	editor.dispatch({ changes: { from: toEditorOffset(action.from), to: toEditorOffset(action.to), insert: action.replacement } });
	editor.focus();
}

defineExpose({ focus, openSearch, replaceText, selectLocation, selectOffset, getSelectionOffset, applyAction });

onMounted(() => {
	editor = new EditorView({
		state: createState(props.text),
		parent: host.value!
	});
	editor.dispatch({ effects: setEditorFacts.of({ highlights: props.highlights ?? [], diagnostics: props.diagnostics ?? [] }) });
});

watch(() => [props.path, props.text, props.revision] as const, ([path, text], [oldPath]) => {
	if (!editor) return;
	if (path !== oldPath) {
		hasUnacknowledgedEdits = false;
		states.set(oldPath, editor.state);
		scrollPositions.set(oldPath, editor.scrollDOM.scrollTop);
		const saved = states.get(path);
		editor.setState(saved?.doc.toString() === text ? saved : createState(text));
		editor.dispatch({ effects: wrapping.reconfigure(props.wrapLines === false ? [] : EditorView.lineWrapping) });
		editor.scrollDOM.scrollTop = scrollPositions.get(path) ?? 0;
		applyEditorFacts();
		return;
	}
	const incomingText = normalizedEditorText(text);
	if (editor.state.doc.toString() === incomingText) {
		hasUnacknowledgedEdits = false;
		applyEditorFacts();
		return;
	}
	if (hasUnacknowledgedEdits) return;
	applyingExternal = true;
	try {
		replaceText(text);
		hasUnacknowledgedEdits = false;
		applyEditorFacts();
	} finally { applyingExternal = false; }
});

watch(() => props.wrapLines, wrapLines => {
	if (editor) editor.dispatch({ effects: wrapping.reconfigure(wrapLines === false ? [] : EditorView.lineWrapping) });
});

watch(() => [props.highlights, props.diagnostics] as const, () => applyEditorFacts());

onUnmounted(() => { editor?.destroy(); editor = undefined; });
</script>

<template>
	<div ref="host" class="code-editor" aria-label="OpenAMX source editor"></div>
	<div v-if="actions?.length" class="editor-code-actions" role="group" aria-label="Code actions">
		<button v-for="action in actions" :key="`${action.code}-${action.from}-${action.revision}`" type="button" @click="applyAction(action)">{{ action.title }}</button>
	</div>
	<form v-if="renameTarget" class="editor-rename" @submit.prevent="confirmRename" @keydown.esc.prevent="cancelRename">
		<label>Rename {{ renameTarget.name }} <input ref="renameInput" v-model="renameValue" aria-label="New symbol name" pattern="[A-Za-z][A-Za-z0-9_]*" maxlength="128"></label>
		<button type="submit">Apply</button><button type="button" @click="cancelRename">Cancel</button>
	</form>
</template>

<style scoped>
.code-editor :deep(.amx-token-keyword) { color: var(--amx-token-keyword, #8b3f52); font-weight: 600; }
.code-editor :deep(.amx-token-declaration) { color: var(--amx-token-declaration, #176b55); font-weight: 600; }
.code-editor :deep(.amx-token-reference) { color: var(--amx-token-reference, #315b9a); }
.code-editor :deep(.amx-token-field) { color: var(--amx-token-field, #a45b18); }
.code-editor :deep(.amx-token-type) { color: var(--amx-token-type, #315c75); }
.code-editor :deep(.amx-token-literal) { color: var(--amx-token-literal, #087768); }
.code-editor :deep(.amx-diagnostic) { text-decoration: underline wavy #c33f49; text-underline-offset: 3px; }
.editor-code-actions { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 8px; border-top: 1px solid #c5cdcf; background: #f5f7f7; }
.editor-code-actions button { min-height: 28px; padding: 4px 8px; border: 1px solid #8c9b9f; border-radius: 3px; background: #fff; color: #18282d; font: 11px "DM Sans", sans-serif; }
.editor-code-actions button:hover, .editor-code-actions button:focus-visible { outline: 2px solid #075a82; outline-offset: 1px; }
.editor-rename { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; padding: 7px 8px; border-top: 1px solid #c5cdcf; background: #f5f7f7; color: #18282d; font: 11px "DM Sans", sans-serif; }
.editor-rename label { display: flex; flex: 1; min-width: 180px; align-items: center; gap: 7px; }
.editor-rename input { min-width: 0; flex: 1; min-height: 28px; padding: 4px 6px; border: 1px solid #8c9b9f; border-radius: 3px; background: #fff; color: #18282d; font: 12px "DM Mono", monospace; }
.editor-rename button { min-height: 28px; padding: 4px 8px; border: 1px solid #8c9b9f; border-radius: 3px; background: #fff; color: #18282d; font: 11px "DM Sans", sans-serif; }
</style>