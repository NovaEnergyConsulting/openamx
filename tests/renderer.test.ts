/**
 * Renderer tests for Sprint 005: Renderer + Inline {{ }} + HTML.
 *
 * Covers:
 * - Headings (#, ##, ###) render as h1/h2/h3.
 * - Paragraphs and bullet lists render correctly.
 * - let declarations are completely absent from final HTML.
 * - Simple {{ var }} substitution.
 * - Complex {{ expr }} (arithmetic, comparisons, logicals, conditionals, lists, stdlib).
 * - Multiple substitutions within one narrative block.
 * - Frontmatter title appears in <title>.
 * - Output is stable/deterministic.
 * - Full pipeline in-memory smoke test (parseStatements + renderHtml).
 *
 * Uses explicit string/contains assertions (per decisions.md). No snapshots.
 */

import { describe, it, expect } from "bun:test";
import { parseStatements } from "../src/parser/parseStatements";
import { renderHtml } from "../src/renderer/renderHtml";
import { OpenAmxDocument } from "../src/ast/types";
import { AmxError } from "../src/diagnostics/errors";

function makeDocFromBody(body: string, metadata: Record<string, unknown> = {}): OpenAmxDocument {
  const nodes = parseStatements(body);
  return { metadata, nodes };
}

describe("renderer - headings paragraphs bullets", () => {
  it("renders # as h1, ## as h2, ### as h3", () => {
    const doc = makeDocFromBody("# Title\n\n## Section\n\n### Detail");
    const html = renderHtml(doc);
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<h2>Section</h2>");
    expect(html).toContain("<h3>Detail</h3>");
  });

  it("renders paragraphs and bullet lists", () => {
    const doc = makeDocFromBody("Hello world.\n\n- one\n- two");
    const html = renderHtml(doc);
    expect(html).toContain("<p>Hello world.</p>");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<li>two</li>");
  });
});

describe("renderer - let omission", () => {
  it("omits all let declarations from output", () => {
    const body = `# Doc

let x = 1
let y = 2 + 3

Narrative here.
`;
    const doc = makeDocFromBody(body);
    const html = renderHtml(doc);
    expect(html).not.toContain("let x");
    expect(html).not.toContain("let y");
    expect(html).not.toContain("= 1");
    expect(html).not.toContain("= 2 + 3");
    expect(html).toContain("<h1>Doc</h1>");
    expect(html).toContain("Narrative here.");
  });
});

describe("renderer - inline substitution", () => {
  it("substitutes simple {{ var }}", () => {
    const body = `let name = "Transformer TX-001"

The asset is {{ name }}.`;
    const doc = makeDocFromBody(body);
    const html = renderHtml(doc);
    expect(html).toContain("<p>The asset is Transformer TX-001.</p>");
  });

  it("substitutes complex expressions (arithmetic, comparisons, logicals, conditionals, lists, stdlib)", () => {
    const body = `let a = 10
let b = 20
let vals = [1, 2, 3]
let total = sum(vals)
let ok = a < b and total == 6
let label = if ok then "good" else "bad"
let rounded = round(3.14159, 2)

Result: {{ a + b }} {{ total }} {{ ok }} {{ label }} {{ rounded }} {{ vals }}`;
    const doc = makeDocFromBody(body);
    const html = renderHtml(doc);
    expect(html).toContain("Result: 30 6 true good 3.14 1, 2, 3");
  });

  it("handles multiple substitutions in one narrative block", () => {
    const body = `let x = 2
let y = 3
Value: {{ x }} and {{ y }} makes {{ x + y }}.`;
    const doc = makeDocFromBody(body);
    const html = renderHtml(doc);
    expect(html).toContain("<p>Value: 2 and 3 makes 5.</p>");
  });

  it("surfaces AMX1004 for undefined var inside {{ }}", () => {
    const body = `The value is {{ missing }}.`;
    const doc = makeDocFromBody(body);
    expect(() => renderHtml(doc)).toThrow(AmxError);
    try {
      renderHtml(doc);
    } catch (e: any) {
      expect(e.code).toBe("AMX1004");
      expect(e.message).toContain("Undefined identifier 'missing'");
    }
  });
});

describe("renderer - title and determinism", () => {
  it("uses frontmatter title in <title> when present", () => {
    const doc = makeDocFromBody("# Hi", { title: "My Report" });
    const html = renderHtml(doc);
    expect(html).toContain("<title>My Report</title>");
  });

  it("falls back to 'OpenAMX Document' when no title", () => {
    const doc = makeDocFromBody("# Hi", {});
    const html = renderHtml(doc);
    expect(html).toContain("<title>OpenAMX Document</title>");
  });

  it("produces identical output for identical input (stable)", () => {
    const body = `let x = 42

# Report

Value is {{ x }}.`;
    const doc1 = makeDocFromBody(body, { title: "R" });
    const doc2 = makeDocFromBody(body, { title: "R" });
    const h1 = renderHtml(doc1);
    const h2 = renderHtml(doc2);
    expect(h1).toBe(h2);
  });
});

describe("renderer - full pipeline smoke test (in-memory)", () => {
  it("parseStatements → renderHtml produces expected structure and substitution", () => {
    const body = `---
title: Smoke Test
---

# Heading

let secret = 123

Paragraph with {{ 2 + 2 }}.

- item {{ "A" }}
`;
    const doc = makeDocFromBody(body, { title: "Smoke Test" });
    const html = renderHtml(doc);

    // Full document shape
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<title>Smoke Test</title>");
    expect(html).toContain("<h1>Heading</h1>");
    expect(html).toContain("<p>Paragraph with 4.</p>");
    expect(html).toContain("<li>item A</li>");

    // lets never appear
    expect(html).not.toContain("let secret");
    expect(html).not.toContain("123");
  });
});

