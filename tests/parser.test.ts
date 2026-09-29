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
import { parseExpression } from "../src/parser/parseExpression";
import { parseDocument } from "../src/parser/parseDocument";
import { ExecutableCodeBlockNode, NarrativeNode, VariableDeclarationNode } from "../src/ast/types";

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
  it("parses declarations with original-document source locations", () => {
    const statements = parseStatements("\n  let first = 1\nlet second = 2", { line: 7, column: 1 });
    expect(statements).toHaveLength(2);
    expect((statements[0] as VariableDeclarationNode).name).toBe("first");
    expect(statements[0].source).toEqual({ line: 8, column: 3 });
    expect(statements[1].source).toEqual({ line: 9, column: 1 });
  });

  it("does not treat a semicolon as a statement separator", () => {
    expect(() => parseStatements("let first = 1; let second = 2")).toThrow(/Invalid declaration/);
  });

  it("parses assignments, ranges, and expression-form loops with source locations", () => {
    const statements = parseStatements(
      "value = [3 to 1]\nlet doubled = for item in [1, 2] {\n  return item * 2\n}",
      { line: 4, column: 1 }
    );
    expect(statements[0].type).toBe("assignmentStatement");
    expect((statements[0] as any).expression.type).toBe("rangeExpression");
    expect((statements[1] as VariableDeclarationNode).expression.type).toBe("forExpression");
    expect((statements[1] as VariableDeclarationNode).expression.source).toEqual({ line: 5, column: 1 });
  });

  it("parses for-expressions nested inside ordinary expression positions", () => {
    const expression = parseExpression("sum(for item in [1, 2] {\nreturn item\n})");
    expect(expression.type).toBe("functionCall");
    expect((expression as any).arguments[0].type).toBe("forExpression");

    const combined = parseExpression("for item in [1] {\nreturn item\n} + 1");
    expect(combined.type).toBe("binaryExpression");
    expect((combined as any).left.type).toBe("forExpression");
  });

  it("preserves original locations on statements nested in loop bodies", () => {
    const [loop] = parseStatements("for item in [1] {\n  total += item\n}", { line: 10, column: 1 });
    expect(loop.source).toEqual({ line: 10, column: 1 });
    expect((loop as any).body[0].source).toEqual({ line: 11, column: 3 });
  });

  it("requires returns only in expression loops and rejects nested/control-flow forms", () => {
    expect(() => parseExpression("for item in [1] {\nlet value = item\n}"))
      .toThrow(/exactly one return expression/);
    expect(() => parseExpression("for item in [1] {\nreturn item\nreturn item + 1\n}"))
      .toThrow(/exactly one return expression/);
    expect(() => parseStatements("for item in [1] {\nreturn item\n}"))
      .toThrow(/cannot contain return/);
    expect(() => parseStatements("return 1")).toThrow(/only valid inside/);
    expect(() => parseStatements("for item in [1] {\nfor nested in [2] {\n}\n}"))
      .toThrow(/Nested loops/);
    expect(() => parseStatements("break")).toThrow(/Unsupported loop control/);
  });
});

describe("parseDocument (file orchestration)", () => {
  beforeEach(async () => {
    await cleanupTemp();
  });

  afterEach(async () => {
    await cleanupTemp();
  });

  it("keeps bare declarations as narrative and parses declarations only in amx fences", async () => {
    const content =
`---
title: Test Doc
status: draft
---

# Heading

Intro text.

  \`\`\`  amx${" ".repeat(2)}
  let inBlock = 2
  \`\`\`

let cost = 100

More narrative.`;
    const filePath = await writeTempAmx(content);
    const doc = await parseDocument(filePath);
    expect(doc.nodes.map(node => node.type)).toEqual(["narrative", "executableCodeBlock", "narrative"]);
    const block = doc.nodes[1] as ExecutableCodeBlockNode;
    expect(block.content).toBe("  let inBlock = 2\n");
    expect(block.statements).toHaveLength(1);
    expect((block.statements[0] as VariableDeclarationNode).name).toBe("inBlock");
    expect(block.source).toEqual({ line: 10, column: 3 });
    expect(block.statements[0].source).toEqual({ line: 11, column: 3 });
    expect((doc.nodes[2] as NarrativeNode).content).toContain("let cost = 100");
    expect((doc.nodes[2] as NarrativeNode).content).toContain("More narrative.");
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

  it("preserves source order, front matter, interpolation, and narrative around executable blocks", async () => {
    const content = `---
title: Test
---
# Test
let outside = 42
\`\`\`amx
let inside = 9
\`\`\`
Narrative {{ outside }} and {{ inside }}.
`;
    const filePath = await writeTempAmx(content);
    const doc = await parseDocument(filePath);
    expect(doc.metadata.title).toBe("Test");
    expect(doc.nodes.map(node => node.type)).toEqual(["narrative", "executableCodeBlock", "narrative"]);
    expect((doc.nodes[0] as NarrativeNode).content).toContain("let outside = 42");
    expect((doc.nodes[2] as NarrativeNode).content).toContain("{{ outside }} and {{ inside }}");
  });

  it("recognizes only an exact trimmed, case-sensitive amx info string", async () => {
    const content = [
      "```amx demo", "let rejectedLabel = 1", "```",
      "```AMX", "let rejectedCase = 1", "```",
      "~~~amx", "let rejectedTilde = 1", "~~~",
      "````amx", "let accepted = 1", "`````"
    ].join("\n");
    const doc = await parseDocument(await writeTempAmx(content));
    expect(doc.nodes.map(node => node.type)).toEqual(["narrative", "executableCodeBlock"]);
    expect((doc.nodes[0] as NarrativeNode).content).toContain("let rejectedLabel = 1");
    expect(((doc.nodes[1] as ExecutableCodeBlockNode).statements[0] as VariableDeclarationNode).name).toBe("accepted");
  });

  it("does not recognize short fences or openers indented by four spaces", async () => {
    for (const content of [
      "``amx\nlet short = 1\n``",
      "    ```amx\nlet indented = 1\n    ```"
    ]) {
      const doc = await parseDocument(await writeTempAmx(content));
      expect(doc.nodes).toHaveLength(1);
      expect((doc.nodes[0] as NarrativeNode).content).toBe(content);
    }
  });

  it("keeps amx-looking text inside ordinary fences opaque, including unclosed fences", async () => {
    const content = [
      "~~~markdown", "```amx", "let nested = 1", "```", "~~~",
      "```js", "let alsoNarrative = 2"
    ].join("\n");
    const doc = await parseDocument(await writeTempAmx(content));
    expect(doc.nodes).toHaveLength(1);
    expect((doc.nodes[0] as NarrativeNode).content).toBe(content);
  });

  it("requires a valid closer and reports unclosed executable fence at its opener", async () => {
    const filePath = await writeTempAmx("---\ntitle: Fence\n---\n  ```amx\nlet x = 1\n``` trailing");
    await expect(parseDocument(filePath)).rejects.toThrow(/Unclosed amx fence at 4:3/);

    const shortCloser = await writeTempAmx("````amx\nlet x = 1\n```\n");
    await expect(parseDocument(shortCloser)).rejects.toThrow(/Unclosed amx fence at 1:1/);
  });

  it("accepts up to three leading spaces and preserves CRLF narrative bytes", async () => {
    const content = "Heading\r\n   ```amx\r\n let x = 1\r\n   ````\r\nAfter\r\n";
    const doc = await parseDocument(await writeTempAmx(content));
    expect(doc.nodes.map(node => node.type)).toEqual(["narrative", "executableCodeBlock", "narrative"]);
    expect((doc.nodes[0] as NarrativeNode).content).toBe("Heading\r\n");
    expect((doc.nodes[2] as NarrativeNode).content).toBe("After\r\n");
  });
});

