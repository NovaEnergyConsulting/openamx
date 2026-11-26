import type { OpenAmxDocument } from "../ast/types";
import type { EditorModuleAnalysis } from "./moduleAnalysis";
import { type EditorRange } from "./sourceRanges";
export interface EditorSymbolIdentity {
    file: string;
    from: number;
    to: number;
}
export interface EditorSymbolFact extends EditorRange {
    file: string;
    name: string;
    target: EditorSymbolIdentity;
    parent?: EditorSymbolIdentity;
    declaration: boolean;
    kind: string;
    detail: string;
    origin?: string;
}
/** Build identity-bearing symbol occurrences; uncertain parser spans and duplicate declarations have no target. */
export declare function editorSymbolFacts(text: string, entryFile: string, entryDocument: OpenAmxDocument, analysis?: EditorModuleAnalysis, moduleSources?: ReadonlyMap<string, string>): EditorSymbolFact[];
//# sourceMappingURL=symbols.d.ts.map