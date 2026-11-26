import type { OpenAmxDocument } from "../ast/types";
import { type EditorRange } from "./sourceRanges";
import type { EditorSymbolFact, EditorSymbolIdentity } from "./symbols";
export interface EditorDiagnosticFact extends EditorRange {
    code: string;
    message: string;
}
export interface EditorCodeActionFact extends EditorRange {
    title: string;
    expected: string;
    replacement: string;
    code: string;
}
export interface EditorRenameFact {
    target: EditorSymbolIdentity;
    name: string;
    edits: Array<{
        file: string;
    } & EditorRange>;
}
export declare function isSafeRenameIdentifier(name: string): boolean;
export declare function editorCodeActionFacts(text: string, document: OpenAmxDocument, diagnostics: readonly EditorDiagnosticFact[]): EditorCodeActionFact[];
export declare function editorRenameFact(facts: readonly EditorSymbolFact[], file: string, offset: number): EditorRenameFact | undefined;
//# sourceMappingURL=refactoring.d.ts.map