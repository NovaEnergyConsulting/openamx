import { parse as parseYaml } from "yaml";

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
export function parseFrontMatter(content: string): FrontMatterResult {
  // Must start with --- on first line
  const lines = content.split(/\r?\n/);
  if (!lines.length || lines[0].trim() !== "---") {
    return { metadata: {}, body: content, bodyStartLine: 1 };
  }

  // Find the closing ---
  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex === -1) {
    return {
      metadata: {},
      body: content,
      bodyStartLine: 1,
      error: "Malformed front matter: missing closing --- delimiter",
    };
  }

  const frontMatterText = lines.slice(1, closingIndex).join("\n");
  const lineBreaks = [...content.matchAll(/\r?\n/g)];
  const bodyOffset = lineBreaks[closingIndex]?.index !== undefined
    ? lineBreaks[closingIndex].index! + lineBreaks[closingIndex][0].length
    : content.length;
  const body = content.slice(bodyOffset);
  const bodyStartLine = bodyOffset < content.length ? closingIndex + 2 : closingIndex + 1;

  let metadata: Record<string, unknown> = {};
  if (frontMatterText.trim().length > 0) {
    try {
      const parsed = parseYaml(frontMatterText);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        metadata = parsed as Record<string, unknown>;
      } else if (parsed != null) {
        return {
          metadata: {},
          body,
          bodyStartLine,
          error:
            "Malformed front matter: front matter must be a mapping (key: value)",
        };
      }
    } catch (err: any) {
      return {
        metadata: {},
        body,
        bodyStartLine,
        error: `Malformed front matter: ${err?.message ?? "invalid YAML"}`,
      };
    }
  }

  return { metadata, body, bodyStartLine };
}
