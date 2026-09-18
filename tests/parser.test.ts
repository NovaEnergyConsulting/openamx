/**
 * Parser tests for Sprint 002: AST, Front Matter, Narrative Splitting.
 *
 * Covers:
 * - Front matter extraction (present, absent, multiple keys, errors)
 * - Narrative parsing (headings, paragraphs, bullets) as raw content
 * - Simple let declaration detection (name captured)
 * - Interleaved lets + narrative preserve source order
 * - Let declarations are stripped from narrative content
 * - Basic malformed front matter diagnostics
 *
 * No evaluation, full expression parsing, or rendering tested here.
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { parseFrontMatter } from "../src/parser/parseFrontMatter";
import { parseStatements } from "../src/parser/parseStatements";
import { parseDocument } from "../src/parser/parseDocument";
import { DocumentNode, NarrativeNode, VariableDeclarationNode } from "../src/ast/types";

const tmpFiles: string[] = [];

async function writeTempAmx(content: string): Promise<string> {
  const name = `openamx-test-${Date.now()}-${Math.random().toString(36).slice(2)}.amx`;
  const p = `./${name}`; // write in project root (gitignored patterns do not affect temp names)
  await Bun.write(p, content);
  tmpFiles.push(p);
  return p;
}

async function cleanupTemp() {
  for (const p of tmpFiles) {
    try { await Bun.write(p, ""); await Bun.write(p, ""); } catch {}
    try { await import("fs/promises").then(m => m.unlink(p)); } catch {}
  }
  tmpFiles.length = 0;
}

describe("parseFrontMatter", () => {
  it("returns empty metadata and full body when no front matter present", () => {
    const input = "# Heading\n\nSome text.";
    const res = parseFrontMatter(input);
    expect(res.metadata).toEqual({});
    expect(res.body).toBe(input);
    expect(res.error).toBeUndefined();
  });

  it("parses simple front matter with multiple keys", () => {
    const input =
`---
title: Hello OpenAMX
author: Test
version: 0.1
---
# Body starts here
Paragraph.`;
    const res = parseFrontMatter(input);
    expect(res.error).toBeUndefined();
    expect(res.metadata).toEqual({
      title: "Hello OpenAMX",
      author: "Test",
      version: 0.1
    });
    expect(res.body).toContain("# Body starts here");
    expect(res.body).not.toContain("title:");
  });

  it("handles empty front matter block (--- ... --- with no keys)", () => {
    const input =
`---
---
# After empty front matter`;
    const res = parseFrontMatter(input);
    expect(res.metadata).toEqual({});
    expect(res.body.trim()).toBe("# After empty front matter");
  });

  it("reports error for missing closing --- delimiter", () => {
    const input =
`---
title: No Close
# body without closing
`;
    const res = parseFrontMatter(input);
    expect(res.error).toMatch(/missing closing ---/);
    expect(res.metadata).toEqual({});
  });

  it("reports error for malformed YAML content", () => {
    const input =
`---
[ this is not valid yaml for frontmatter
---
body
`;
    const res = parseFrontMatter(input);
    expect(res.error).toMatch(/Malformed front matter/);
  });
});

describe("parseStatements", () => {
  it("parses pure narrative containing headings, paragraphs and bullets", () => {
    const body =
`# Heading 1

This is a paragraph.

## Heading 2

- bullet one
- bullet two

Final paragraph.`;
    const nodes = parseStatements(body);
    expect(nodes.length).toBe(1);
    const n = nodes[0] as NarrativeNode;
    expect(n.type).toBe("narrative");
    expect(n.content).toContain("# Heading 1");
    expect(n.content).toContain("This is a paragraph.");
    expect(n.content).toContain("- bullet one");
    expect(n.source?.line).toBe(1);
  });

  it("detects simple let declarations and captures name", () => {
    const body =
`let replacementCost = 1250000
let annualRiskCost = 85000`;
    const nodes = parseStatements(body);
    expect(nodes.length).toBe(2);
    const d0 = nodes[0] as VariableDeclarationNode;
    const d1 = nodes[1] as VariableDeclarationNode;
    expect(d0.type).toBe("variableDeclaration");
    expect(d0.name).toBe("replacementCost");
    expect(d1.name).toBe("annualRiskCost");
    // expression present (may be placeholder or literal)
    expect(d0.expression).toBeTruthy();
  });

  it("strips all let lines from narrative content", () => {
    const body =
`# Title

let x = 10

Some narrative text.

let y = 20

More text after.`;
    const nodes = parseStatements(body);
    // Three narrative segments separated by lets + 2 decls = 5 nodes
    expect(nodes.length).toBe(5);

    const n0 = nodes[0] as NarrativeNode;
    const d1 = nodes[1] as VariableDeclarationNode;
    const n2 = nodes[2] as NarrativeNode;
    const d3 = nodes[3] as VariableDeclarationNode;
    const n4 = nodes[4] as NarrativeNode;

    expect(n0.type).toBe("narrative");
    expect(n0.content).not.toContain("let x = 10");
    expect(n0.content).not.toContain("let y = 20");
    expect(n0.content).toContain("# Title");

    expect(d1.type).toBe("variableDeclaration");
    expect(d1.name).toBe("x");

    expect(n2.type).toBe("narrative");
    expect(n2.content).not.toContain("let");
    expect(n2.content).toContain("Some narrative text.");

    expect(d3.type).toBe("variableDeclaration");
    expect(d3.name).toBe("y");

    expect(n4.type).toBe("narrative");
    expect(n4.content).not.toContain("let");
    expect(n4.content).toContain("More text after.");
  });

  it("preserves exact source order when lets and narrative are interleaved", () => {
    const body =
`Intro paragraph.

let a = 1

## Section

let b = 2

End.`;
    const nodes = parseStatements(body);
    expect(nodes.length).toBe(5);

    expect((nodes[0] as NarrativeNode).type).toBe("narrative");
    expect((nodes[1] as VariableDeclarationNode).type).toBe("variableDeclaration");
    expect((nodes[1] as VariableDeclarationNode).name).toBe("a");

    expect((nodes[2] as NarrativeNode).type).toBe("narrative");
    expect((nodes[2] as NarrativeNode).content).toContain("## Section");

    expect((nodes[3] as VariableDeclarationNode).type).toBe("variableDeclaration");
    expect((nodes[3] as VariableDeclarationNode).name).toBe("b");

    expect((nodes[4] as NarrativeNode).type).toBe("narrative");
    expect((nodes[4] as NarrativeNode).content).toContain("End.");
  });

  it("attaches basic source locations (line numbers)", () => {
    const body =
`let first = 1
# heading
let second = 2`;
    const nodes = parseStatements(body);
    expect((nodes[0] as VariableDeclarationNode).source?.line).toBe(1);
    expect((nodes[1] as NarrativeNode).source?.line).toBe(2);
    expect((nodes[2] as VariableDeclarationNode).source?.line).toBe(3);
  });
});

describe("parseDocument (file orchestration)", () => {
  beforeEach(async () => {
    await cleanupTemp();
  });

  afterEach(async () => {
    await cleanupTemp();
  });

  it("reads UTF-8 file, extracts front matter and returns ordered nodes", async () => {
    const content =
`---
title: Test Doc
status: draft
---

# Heading

Intro text.

let cost = 100

More narrative.`;
    const filePath = await writeTempAmx(content);
    const doc = await parseDocument(filePath);

    expect(doc.metadata).toEqual({ title: "Test Doc", status: "draft" });
    expect(doc.nodes.length).toBeGreaterThanOrEqual(3);

    // First node narrative (after frontmatter)
    const first = doc.nodes[0] as NarrativeNode;
    expect(first.type).toBe("narrative");
    expect(first.content).toContain("# Heading");

    // Find the variable decl
    const decl = doc.nodes.find(n => (n as VariableDeclarationNode).type === "variableDeclaration") as VariableDeclarationNode;
    expect(decl).toBeTruthy();
    expect(decl.name).toBe("cost");

    // Ensure no let line leaked into any narrative
    for (const n of doc.nodes) {
      if ((n as NarrativeNode).type === "narrative") {
        expect((n as NarrativeNode).content).not.toMatch(/^\s*let\s/m);
      }
    }
  });

  it("throws clear error for malformed front matter when parsing document", async () => {
    const content =
`---
title: Bad
no closing here
# body
`;
    const filePath = await writeTempAmx(content);
    await expect(parseDocument(filePath)).rejects.toThrow(/Malformed front matter/);
  });

  // Additive test for spec §12: CLI uses parseDocument (covers frontmatter + statements + order)
  it("CLI parseDocument integration - full example with frontmatter and lets", async () => {
    const content = `---
title: Test
---
# Test

let x = 42

Narrative {{ x }}.
`;
    const filePath = await writeTempAmx(content);
    const doc = await parseDocument(filePath);
    expect(doc.metadata.title).toBe("Test");
    expect(doc.nodes.length).toBe(3); // narrative (heading), variableDeclaration, narrative
    expect((doc.nodes[0] as any).type).toBe("narrative");
    expect((doc.nodes[1] as any).type).toBe("variableDeclaration");
    expect((doc.nodes[2] as any).type).toBe("narrative");
  });
});

