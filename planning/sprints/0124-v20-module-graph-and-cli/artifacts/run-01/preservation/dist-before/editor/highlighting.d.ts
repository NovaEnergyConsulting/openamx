import type { OpenAmxDocument } from "../ast/types";
import { type EditorRange } from "./sourceRanges";
export interface EditorHighlightFact extends EditorRange {
    kind: "keyword" | "declaration" | "reference" | "field" | "type" | "literal";
}
/** Return parser-proven tokens only; narrative and ordinary fences never enter the AST statement walk. */
export declare function editorHighlightFacts(text: string, document: OpenAmxDocument): EditorHighlightFact[];
export declare function isExecutableBlockOffset(text: string, document: OpenAmxDocument, offset: number): boolean;
//# sourceMappingURL=highlighting.d.ts.map