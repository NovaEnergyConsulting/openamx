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
import { parseDocumentText } from "../src/parser/parseDocument";

function makeDocFromBody(body: string, metadata: Record<string, unknown> = {}): OpenAmxDocument {
  const nodes: OpenAmxDocument["nodes"] = [];
  let narrativeLines: string[] = [];
  const lines = body.split(/\r?\n/);

  function flushNarrative() {
    if (narrativeLines.length > 0) {
      nodes.push({ type: "narrative", content: narrativeLines.join("\n") });
      narrativeLines = [];
    }
  }

  for (let index = 0; index < lines.length; index++) {
    if (/^\s*let\s+/.test(lines[index])) {
      flushNarrative();
      nodes.push({
        type: "executableCodeBlock",
        content: `${lines[index]}\n`,
        statements: parseStatements(lines[index], { line: index + 1, column: 1 }),
        source: { line: index + 1, column: 1 }
      });
    } else {
      narrativeLines.push(lines[index]);
    }
  }
  flushNarrative();
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

describe("renderer - executable code display", () => {
  it("renders formatted executable declarations", () => {
    const body = `# Doc

let x = 1
let y = 2 + 3

Narrative here.
`;
    const doc = makeDocFromBody(body);
    const html = renderHtml(doc);
    expect(html).toContain('<pre><code class="language-amx">let x = 1\n</code></pre>');
    expect(html).toContain('<pre><code class="language-amx">let y = 2 + 3\n</code></pre>');
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

  it("applies resolved report identity metadata and hides source when explicitly disabled", () => {
    const doc: OpenAmxDocument = parseDocumentText(`---
title: My Report
report:
  organization: "Acme Utilities"
  author: "A. Analyst"
  footer: "Confidential"
  accent: "#123456"
  sourceVisible: false
---

# Hi

\`\`\`amx
let value = 1
\`\`\`
`);
    const html = renderHtml(doc, undefined, undefined, { report: doc.metadata.report as Record<string, unknown> });
    expect(html).toContain("Acme Utilities");
    expect(html).toContain("A. Analyst");
    expect(html).toContain("Confidential");
    expect(html).toContain("#123456");
    expect(html).not.toContain('<pre><code class="language-amx">');
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

  it("executes blocks before interpolation and safely displays code in document order", () => {
    const doc: OpenAmxDocument = {
      metadata: {},
      nodes: [
        { type: "narrative", content: "Before: {{ total }}.\n" },
        {
          type: "executableCodeBlock",
          content: 'let total = 1\nlet renderCount = 0\nlet markup = "<tag>&"\n',
          statements: parseStatements('let total = 1\nlet renderCount = 0\nlet markup = "<tag>&"', { line: 2, column: 1 }),
          source: { line: 1, column: 1 }
        },
        {
          type: "executableCodeBlock",
          content: "total += 2\nrenderCount += 1\n",
          statements: parseStatements("total += 2\nrenderCount += 1", { line: 8, column: 1 }),
          source: { line: 6, column: 1 }
        },
        { type: "narrative", content: "After: {{ total }}; rendered {{ renderCount }} time(s).\n" }
      ]
    };
    const html = renderHtml(doc);

    expect(html).toContain("<p>Before: 3.</p>");
    expect(html).toContain("<p>After: 3; rendered 1 time(s).</p>");
    expect(html).toContain('let markup = &quot;&lt;tag&gt;&amp;&quot;');
    expect(html.indexOf("Before: 3.")).toBeLessThan(html.indexOf("language-amx"));
    expect(html.indexOf("language-amx")).toBeLessThan(html.indexOf("After: 3;"));
    expect(html).not.toContain('<tag>');
  });

  it("preserves ordinary Markdown fences and does not execute bare declarations", () => {
    const doc: OpenAmxDocument = {
      metadata: {},
      nodes: [{
        type: "narrative",
        content: "```text\nlet hidden = 8\n```\n\nBare: {{ hidden }}"
      }]
    };

    expect(() => renderHtml(doc)).toThrow(AmxError);
    doc.nodes = [{
      type: "narrative",
      content: "```text\nlet hidden = 8\n```\n\nBare declaration remains narrative."
    }];
    const html = renderHtml(doc);
    expect(html).toContain('<pre><code class="language-text">let hidden = 8\n</code></pre>');
    expect(html).not.toContain('class="language-amx"');
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

    expect(html).toContain('<pre><code class="language-amx">let secret = 123\n</code></pre>');
  });
});

describe("renderer - V0.4 captured views", () => {
  it("places a shown table after its owning source and preserves snapshots", () => {
    const doc = parseDocumentText(`Intro
\`\`\`amx
type Asset {
  id: String
}
let assets: Asset[] = [Asset { id = "<A>" }]
table register = table(assets) {
  title: "Register & risks"
  column id as "Asset <id>"
}
show register
\`\`\`
Between
\`\`\`amx
assets = []
show register
\`\`\``);
    const html = renderHtml(doc, "views.amx");

    expect(html.match(/<table/g)?.length).toBe(4);
    expect(html).toContain("<caption>Register &amp; risks</caption>");
    expect(html).toContain("Asset &lt;id&gt;");
    expect(html).toContain("&lt;A&gt;");
    expect(html).toContain("No rows");
    expect(html.indexOf("language-amx")).toBeLessThan(html.indexOf("Register &amp; risks"));
    expect(html.indexOf("Register &amp; risks")).toBeLessThan(html.indexOf("Between"));
  });

  it("renders offline chart accessibility, data alternatives, and print markup", () => {
    const doc = parseDocumentText(`\`\`\`amx
let values: Number[] = [1, 2, 3]
chart amounts = line(values) {
  title: "Amounts <safe>"
  description: "Values & trends"
  series "Amount"
}
show amounts
\`\`\``);
    const html = renderHtml(doc, "chart.amx");

    expect(html).toContain('role="img"');
    expect(html).toContain("Amounts &lt;safe&gt;");
    expect(html).toContain("Values &amp; trends");
    expect(html).toContain("openamx-print-chart");
    expect(html).toContain("<svg");
    expect(html).not.toContain("<safe>");
    expect(renderHtml(doc, "chart.amx")).toBe(html);
  });

  it("renders measurement table cells in their own units and normalizes chart values to the first unit", () => {
    const doc = parseDocumentText(`\`\`\`amx
dimension Length
unit meter: Length
unit kilometer = 1000 * meter
type Sample {
  distance: Length
}
let samples: Sample[] = [
  Sample { distance = 1 kilometer },
  Sample { distance = 500 meter }
]
table register = table(samples) {
  title: "Distance register"
  column distance as "Distance"
}
let distances: Length[] = [1 kilometer, 500 meter]
chart amounts = line(distances) {
  title: "Distances"
  description: "Normalized values"
  series "Distance"
}
show register
show amounts
\`\`\``);
    const html = renderHtml(doc, "measurements.amx");
    expect(html).toContain(">1 kilometer</td>");
    expect(html).toContain(">500 meter</td>");
    expect(html).toContain("<th scope=\"col\">Distance (kilometer)</th>");
    expect(html).toContain("<td>1</td></tr><tr><td>2</td><td>0.5</td>");
  });

  it("normalizes each measurement series and scatter axis independently without changing row order", () => {
    const doc = parseDocumentText(`\`\`\`amx
dimension Length
dimension Time
unit meter: Length
unit kilometer = 1000 * meter
unit second: Time
unit hour = 3600 * second
type Point {
  category: String
  first: Length?
  second: Length?
  x: Length?
  y: Time?
  group: String
}
let points: Point[] = [
  Point { category = "A", first = null, second = 500 meter, x = 1000 meter, y = 3600 second, group = "G" },
  Point { category = "B", first = 2 kilometer, second = 1 kilometer, x = 1 kilometer, y = 1 hour, group = "G" }
]
chart columns = bar(points) {
  title: "Series"
  description: "Independent unit choices"
  category: category
  series first as "First"
  series second as "Second"
}
chart scatterPoints = scatter(points) {
  title: "Axes"
  description: "Independent axis units"
  x: x
  y: y
  group: group
}
show columns
show scatterPoints
\`\`\``);
    const html = renderHtml(doc, "chart-measurements.amx");
    expect(html).toContain("<th scope=\"col\">First (kilometer)</th>");
    expect(html).toContain("<th scope=\"col\">Second (meter)</th>");
    expect(html).toContain("<td>A</td><td></td><td>500</td>");
    expect(html).toContain("<td>B</td><td>2</td><td>1000</td>");
    expect(html).toContain("<th scope=\"col\">x (meter)</th>");
    expect(html).toContain("<th scope=\"col\">y (second)</th>");
    expect(html).toContain("<td>1000</td><td>3600</td><td>G</td>");
  });
});
