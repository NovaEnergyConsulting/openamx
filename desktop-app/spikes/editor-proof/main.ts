import { basicSetup, EditorView } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";

const sample = '# Field notes\n\nNarrative text is not AMX code.\n\n```amx\nlet load = 42\nlet label = "inspection"\n```\n\n```js\nlet inert = true\n```\n';
const editorParent = document.getElementById("editor")!;
const state = document.getElementById("state")!;
const editor = new EditorView({
  doc: sample,
  extensions: [basicSetup, markdown(), EditorView.contentAttributes.of({ "aria-label": "OpenAMX source" }), EditorView.updateListener.of(update => {
    if (update.docChanged || update.selectionSet) {
      state.textContent = `${update.state.doc.lines} lines; selection ${update.state.selection.main.from}-${update.state.selection.main.to}`;
    }
  })],
  parent: editorParent
});

document.getElementById("focus")!.addEventListener("click", () => editor.focus());
document.getElementById("large")!.addEventListener("click", () => editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: sample.repeat(500) } }));
document.getElementById("reset")!.addEventListener("click", () => editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: sample } }));
state.textContent = `${editor.state.doc.lines} lines; selection 0-0`;