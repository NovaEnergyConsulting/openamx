/**
 * Result of front matter parsing.
 */
export interface FrontMatterResult {
    metadata: Record<string, unknown>;
    body: string;
    /** 1-based original-document line containing the beginning of body. */
    bodyStartLine: number;
    /** Present when YAML was malformed. */
    error?: string;
}
/**
 * Detects optional YAML front matter delimited by --- ... --- at the very start.
 * Returns metadata (empty object if absent) and the remaining body.
 * Uses the 'yaml' package for parsing.
 *
 * Malformed front matter (no closing delimiter or invalid YAML) yields an error message
 * but still returns the original content as body so callers can decide how to surface it.
 */
export declare function parseFrontMatter(content: string): FrontMatterResult;
//# sourceMappingURL=parseFrontMatter.d.ts.map