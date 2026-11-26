import type { DocumentNode, OpenAmxDocument } from "../ast/types";
import type { EditorModuleAnalysis } from "./moduleAnalysis";
export type EditorCompletionKind = "keyword" | "function" | "class" | "variable" | "reference" | "field";
export interface EditorCompletionFact {
    label: string;
    kind: EditorCompletionKind;
}
export interface PreparedEditorCompletion {
    text: string;
    document: OpenAmxDocument;
}
/** Parse the complete buffer when possible, otherwise retain only proven prior statements inside an exact AMX fence. */
export declare function prepareEditorCompletion(text: string, cursorOffset: number): PreparedEditorCompletion | undefined;
/** Return only candidates proven visible before the cursor in the parsed source order. */
export declare function editorCompletionFacts(text: string, cursorOffset: number, parsed: OpenAmxDocument, analysis?: EditorModuleAnalysis, contextText?: string): EditorCompletionFact[];
export declare function executableBlockContentStart(text: string, node: Extract<DocumentNode, {
    type: "executableCodeBlock";
}>): number | undefined;
//# sourceMappingURL=completion.d.ts.map