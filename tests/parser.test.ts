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
import { parseDocument, parseDocumentText } from "../src/parser/parseDocument";
import { ExecutableCodeBlockNode, MatchExpressionNode, NarrativeNode, VariableDeclarationNode } from "../src/ast/types";
import { checkDocument } from "../src/typechecker/checkDocument";

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
  it("parses source-located types, annotations, constructors, access and null only inside amx fences", () => {
    const doc = parseDocumentText('type Hidden { id: String }\n~~~amx\ntype AlsoHidden {\n  id: String\n}\n~~~\n```amx\ntype Asset {\n  id: String\n  tags?: String[] = []\n  note?: String?\n}\nlet asset: Asset = Asset { id = "A" }\nlet label: String? = asset.note\nlet empty: String? = null\n```');
    const blocks = doc.nodes.filter(node => node.type === 'executableCodeBlock');
    expect(blocks).toHaveLength(1);
    const statements = (blocks[0] as ExecutableCodeBlockNode).statements;
    expect(statements).toHaveLength(4);
    expect(statements[0]).toMatchObject({ type: 'typeDeclaration', name: 'Asset', source: { line: 8, column: 1 }, fields: [
      { name: 'id', source: { line: 9, column: 3 }, annotation: { type: 'namedType', name: 'String' } },
      { name: 'tags', optional: true, annotation: { type: 'listType' } },
      { name: 'note', annotation: { type: 'nullableType' } }
    ] });
    expect(statements[1]).toMatchObject({ annotation: { name: 'Asset' }, expression: { type: 'recordConstructor' } });
    expect((statements[1] as VariableDeclarationNode).expression.source).toEqual({ line: 13, column: 20 });
    expect(statements[2]).toMatchObject({ expression: { type: 'fieldAccess', field: 'note' } });
    expect((statements[2] as VariableDeclarationNode).expression.source).toEqual({ line: 14, column: 27 });
    expect(statements[3]).toMatchObject({ expression: { type: 'nullLiteral' } });
  });
  it("parses record parents and override fields with token locations", () => {
    const statements = parseStatements(
      "type Asset extends Identifier, Named {\n  override id: Number\n  label?: String\n}\n",
      { line: 5, column: 1 }
    );
    expect(statements[0]).toMatchObject({
      type: 'typeDeclaration',
      name: 'Asset',
      parents: [
        { name: 'Identifier', source: { line: 5, column: 20 } },
        { name: 'Named', source: { line: 5, column: 32 } }
      ],
      fields: [
        { name: 'id', override: true, overrideSource: { line: 6, column: 3 }, source: { line: 6, column: 12 } },
        { name: 'label', optional: true, source: { line: 7, column: 3 } }
      ]
    });
  });
  it("parses enum declarations, literal members, exports and original token locations", () => {
    const statements = parseStatements(
      'export enum Status = {\n  OPEN = "open",\n  CLOSED = "closed"\n}\n',
      { line: 5, column: 1 }
    );
    expect(statements[0]).toMatchObject({
      type: 'enumDeclaration',
      name: 'Status',
      exported: true,
      nameSource: { line: 5, column: 13 },
      members: [
        { name: 'OPEN', nameSource: { line: 6, column: 3 }, valueSource: { line: 6, column: 10 }, value: { type: 'stringLiteral', value: 'open' } },
        { name: 'CLOSED', nameSource: { line: 7, column: 3 }, valueSource: { line: 7, column: 12 }, value: { type: 'stringLiteral', value: 'closed' } }
      ],
      closingSource: { line: 8, column: 1 }
    });
  });
  it("reports malformed enum member syntax at the original token location", () => {
    expect(() => parseStatements('enum Status = {\n  = 1\n}\n', { line: 5, column: 1 })).toThrow(
      expect.objectContaining({ code: 'AMX3006', line: 6, column: 3 })
    );
  });
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

  it("parses nested multiline records, lists and parenthesized expressions with trailing commas", () => {
    const [declaration] = parseStatements([
      'let value = Outer {',
      '  inner = Inner {',
      '    text = "}{, := delimiters",',
      '    amount = (1 + (4)),',
      '  },',
      '  tags = [',
      '    "left,}",',
      '    "right{:"',
      '  ],',
      '}',
      'let following = 7'
    ].join('\n'), { line: 3, column: 1 });

    expect(declaration).toMatchObject({
      type: 'variableDeclaration',
      source: { line: 3, column: 1 },
      expression: {
        type: 'recordConstructor',
        name: 'Outer',
        fields: [
          {
            name: 'inner',
            expression: {
              type: 'recordConstructor',
              name: 'Inner',
              fields: [{ name: 'text' }, { name: 'amount', expression: { type: 'binaryExpression' } }]
            }
          },
          { name: 'tags', expression: { type: 'listLiteral', elements: [{ value: 'left,}' }, { value: 'right{:' }] } }
        ]
      }
    });
    expect(parseStatements('let value = Outer {\n  field = 1,\n}\nlet next = 2')).toHaveLength(2);

    const lf = 'let value = Outer {\n  field = Inner { amount = 2, },\n}';
    const crlf = lf.replace(/\n/g, '\r\n');
    expect(parseStatements(crlf)).toEqual(parseStatements(lf));
  });

  it("rejects constructor colons and missing separators as AMX3006 while preserving annotation colons", () => {
    for (const source of ['let value = Item { field: 1 }', 'let value = Item { first = 1\nsecond = 2 }']) {
      expect(() => parseStatements(source)).toThrow(expect.objectContaining({ code: 'AMX3006' }));
    }
    expect(() => parseStatements('type Item {\n field: Number\n}\nlet value: Item = Item { field = 1 }')).not.toThrow();
  });

  it("reports equivalent multiline constructor source locations for LF and CRLF", () => {
    const sources = ['let value = Item {\n  field: 1\n}', 'let value = Item {\r\n  field: 1\r\n}'];
    for (const source of sources) {
      try {
        parseStatements(source, { line: 8, column: 1 });
        throw new Error('Expected constructor-colon syntax error');
      } catch (error) {
        expect(error).toMatchObject({ code: 'AMX3006', line: 9, column: 8 });
      }
    }
  });

  it("reports equivalent locations for incomplete multiline constructors", () => {
    const sources = ['let value = Item {\n  field = 1', 'let value = Item {\r\n  field = 1'];
    const locations = sources.map(source => {
      try {
        parseStatements(source, { line: 8, column: 1 });
        throw new Error('Expected incomplete record syntax error');
      } catch (error) {
        expect(error).toMatchObject({ code: 'AMX3006' });
        return { line: (error as { line: number }).line, column: (error as { column: number }).column };
      }
    });
    expect(locations[0]).toEqual(locations[1]);
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

describe("V0.9 string parsing", () => {
  const slash = String.fromCharCode(92);

  it("decodes the approved escapes in either quote style", () => {
    const cases: [string, string][] = [
      ['"double ' + slash + '" quote"', 'double " quote'],
      ["'single " + slash + "' quote'", "single ' quote"],
      ['"single ' + slash + "'" + ' quote"', "single ' quote"],
      ["'double " + slash + '" quote\'', 'double " quote'],
      ['"slash ' + slash + slash + ' path"', 'slash ' + slash + ' path'],
      ['"A' + slash + 'nB' + slash + 'rC' + slash + 'tD"', 'A\nB\rC\tD'],
      ["'A" + slash + 'nB' + slash + 'rC' + slash + "tD'", 'A\nB\rC\tD'],
      ['"' + slash + '${missing}"', '${missing}'],
      ["'${missing}'", '${missing}']
    ];
    for (const [source, expected] of cases) {
      expect(parseExpression(source)).toMatchObject({ type: 'stringLiteral', value: expected });
    }
  });

  it("parses full AMX expressions with nested delimiters and embedded quotes", () => {
    const source = '"prefix ${Item { label = "a } b", value = sum([1, 2]) }.label} suffix"';
    const parsed = parseExpression(source, { line: 4, column: 7 });
    expect(parsed.type).toBe('stringInterpolation');
    expect(parsed).toMatchObject({
      source: { line: 4, column: 7 },
      parts: ['prefix ', { type: 'fieldAccess', field: 'label', receiver: { type: 'recordConstructor', name: 'Item' } }, ' suffix']
    });
    const embedded = (parsed as Extract<typeof parsed, { type: 'stringInterpolation' }>).parts[1];
    expect(typeof embedded === 'string' || embedded.type !== 'fieldAccess' ? undefined : embedded.receiver.source)
      .toEqual({ line: 4, column: 17 });
  });

  it("decodes string escapes in literal match cases", () => {
    const source = 'match "A' + slash + 'nB" {\ncase "A' + slash + 'nB" => 1\ndefault => 0\n}';
    expect(parseExpression(source)).toMatchObject({ type: 'matchExpression', cases: [{ value: { value: 'A\nB' } }] });
    expect(() => parseExpression('match "a" {\ncase "' + slash + 'q" => 1\ndefault => 0\n}'))
      .toThrow(expect.objectContaining({ code: 'AMX3006' }));
  });

  it("uses AMX3006 for unknown, incomplete, multiline, and malformed string syntax", () => {
    const invalid = [
      '"' + slash + 'q"',
      '"trailing' + slash,
      '"missing close',
      '"${1 + 2"',
      '"${1 + }"',
      '"raw\nnewline"'
    ];
    for (const source of invalid) {
      expect(() => parseExpression(source, { line: 3, column: 5 }))
        .toThrow(expect.objectContaining({ code: 'AMX3006' }));
    }
  });

  it("maps interpolation parse diagnostics to original LF and CRLF source positions", () => {
    const locations = ['\n', '\r\n'].map(newline => {
      const source = `\`\`\`amx${newline}let value = "before \${1 + true}"${newline}\`\`\`${newline}`;
      const document = parseDocumentText(source);
      try {
        checkDocument(document, 'string.amx');
      } catch (error) {
        return { code: (error as { code: string }).code, line: (error as { line: number }).line, column: (error as { column: number }).column };
      }
      throw new Error('Expected interpolation type failure');
    });
    expect(locations).toEqual([
      { code: 'AMX3007', line: 2, column: 27 },
      { code: 'AMX3007', line: 2, column: 27 }
    ]);
  });
});

describe("Sprint 015 function, import, and export parsing", () => {
  it("parses a source-located function declaration with typed parameters and an expression body", () => {
    const [fn] = parseStatements("fn riskScore(severity: Number, occurrence: Number): Number = severity * occurrence", { line: 3, column: 1 });
    expect(fn).toMatchObject({
      type: 'functionDeclaration',
      name: 'riskScore',
      returnType: { type: 'namedType', name: 'Number' },
      parameters: [
        { name: 'severity', annotation: { type: 'namedType', name: 'Number' } },
        { name: 'occurrence', annotation: { type: 'namedType', name: 'Number' } }
      ],
      source: { line: 3, column: 1 }
    });
    expect((fn as any).body.type).toBe('binaryExpression');
    expect((fn as any).exported).toBeUndefined();
  });

  it("parses a multi-line function body containing a braced match expression", () => {
    const [fn] = parseStatements("fn classify(score: Number): String = match score {\n  case 1 => \"low\"\n  default => \"high\"\n}");
    expect((fn as any).body.type).toBe('matchExpression');
  });

  it("parses named local imports with per-name and path source locations", () => {
    const [imported] = parseStatements('import { Asset, riskScore } from "./libraries/asset-management.amx"', { line: 1, column: 1 });
    expect(imported).toMatchObject({
      type: 'importDeclaration',
      path: './libraries/asset-management.amx',
      names: [
        { name: 'Asset', source: { line: 1, column: 10 } },
        { name: 'riskScore', source: { line: 1, column: 17 } }
      ]
    });
    expect((imported as any).pathSource.column).toBeGreaterThan(0);
  });

  it("parses export prefixes on type, function, and let declarations while preserving keyword-aligned source columns", () => {
    const [typeDecl, fnDecl, letDecl] = parseStatements("export type Asset {\n  id: String\n}\nexport fn identity(id: String): String = id\nexport let ready: Boolean = true");
    expect(typeDecl).toMatchObject({ type: 'typeDeclaration', name: 'Asset', exported: true, source: { line: 1, column: 8 } });
    expect(fnDecl).toMatchObject({ type: 'functionDeclaration', name: 'identity', exported: true, source: { line: 4, column: 8 } });
    expect(letDecl).toMatchObject({ type: 'variableDeclaration', name: 'ready', exported: true, source: { line: 5, column: 8 } });
  });

  it("rejects fn, import, and export declarations inside loop bodies", () => {
    expect(() => parseStatements("for item in [1] {\n  fn bad(n: Number): Number = n\n}")).toThrow(/cannot occur in loops/);
    expect(() => parseStatements("for item in [1] {\n  import { A } from \"./a.amx\"\n}")).toThrow(/cannot occur in loops/);
    expect(() => parseStatements("for item in [1] {\n  export let x: Number = 1\n}")).toThrow(/cannot occur in loops/);
  });
});

describe("Sprint 016 logical input parsing", () => {
  it("parses source-located input declarations with scalar, nullable, list, and record types", () => {
    const statements = parseStatements(
      "import { Asset } from \"./assets.amx\"\ninput assets: Asset[]\ninput reviewedAt: DateTime?",
      { line: 5, column: 1 }
    );
    expect(statements).toMatchObject([
      { type: 'importDeclaration', source: { line: 5, column: 1 } },
      { type: 'inputDeclaration', name: 'assets', annotation: { type: 'listType' }, source: { line: 6, column: 1 } },
      { type: 'inputDeclaration', name: 'reviewedAt', annotation: { type: 'nullableType' }, source: { line: 7, column: 1 } }
    ]);
    expect((statements[1] as any).annotation.element).toMatchObject({ type: 'namedType', name: 'Asset' });
    expect((statements[2] as any).annotation.element).toMatchObject({ type: 'namedType', name: 'DateTime' });
    expect(() => parseStatements('input missingType')).toThrow(/Invalid input declaration at 1:1/);
    expect(() => parseStatements('for item in [1] {\n  input nested: Number\n}')).toThrow(/Input declarations cannot occur in loops/);
  });
});

describe("match expression parsing", () => {
  it("retains literal cases, their order, default placement, and original-document locations", () => {
    const [declaration] = parseStatements(
      '  let result = match 1 + 2 {\n    default => 0\n    case -2 => 1\n    case 3.5 => 2\n    case "three" => 3\n    case true => 4\n  }',
      { line: 12, column: 1 }
    );
    const match = (declaration as VariableDeclarationNode).expression as MatchExpressionNode;
    expect(match.source).toEqual({ line: 12, column: 16 });
    expect(match.expression.type).toBe('binaryExpression');
    expect(match.defaultSource).toEqual({ line: 13, column: 5 });
    expect(match.cases.map(arm => arm.value.value)).toEqual([-2, 3.5, 'three', true]);
    expect(match.cases[0].source).toEqual({ line: 14, column: 5 });
    expect(match.cases[0].value.source).toEqual({ line: 14, column: 10 });
    expect(match.cases[0].expression.source).toEqual({ line: 14, column: 16 });
  });

  it("accepts a default-only match and matches nested inside calls, branches, and loops", () => {
    expect((parseExpression('match 0 {\ndefault => 1\n}') as MatchExpressionNode).cases).toEqual([]);
    const call = parseExpression('sum([match 1 {\ncase 1 => 2\ndefault => 0\n}])');
    expect(call.type).toBe('functionCall');
    const nested = parseExpression('match match 1 {\ncase 1 => 2\ndefault => 0\n} {\ncase 2 => match 3 {\ncase 3 => 4\ndefault => 0\n}\ndefault => 0\n}');
    expect(nested.type).toBe('matchExpression');
    expect((nested as MatchExpressionNode).cases[0].expression.type).toBe('matchExpression');
    const [loop] = parseStatements('let values = for item in [1] {\n  return match item {\n    case 1 => 2\n    default => 0\n  }\n}', { line: 20, column: 1 });
    expect((loop as VariableDeclarationNode).expression.type).toBe('forExpression');
  });
  it("parses record constructors directly in match arms with source locations", () => {
      const match = parseExpression(
        'match 1 {\ncase 1 => Asset { id = "A" }\ndefault => Asset { id = "B" }\n}',
        { line: 20, column: 4 }
      ) as MatchExpressionNode;
      expect(match.cases[0].expression).toMatchObject({
        type: 'recordConstructor', name: 'Asset', source: { line: 21, column: 11 }
      });
      expect(match.defaultExpression).toMatchObject({
        type: 'recordConstructor', name: 'Asset', source: { line: 22, column: 12 }
      });
    });

  it("rejects missing or duplicate defaults and malformed arms with locations", () => {
    const invalid = [
      ['match 1 {\ncase 1 => 2\n}', /default.*1:1/],
      ['match 1 {\ndefault => 0\ndefault => 2\n}', /Duplicate default.*3:1/],
      ['match 1 {\ncase name => 2\ndefault => 0\n}', /literal.*2:1/],
      ['match 1 {\ncase [1] => 2\ndefault => 0\n}', /literal.*2:1/],
      ['match 1 {\ncase 1 + 2 => 3\ndefault => 0\n}', /literal.*2:1/],
      ['match 1 {\ncase 1 2\ndefault => 0\n}', /Expected =>.*2:1/],
      ['match 1 {\ncase 1 =>\ndefault => 0\n}', /Missing match arm expression.*2:/],
      ['match 1 {\ncase 1 => 2; default => 0\n}', /Unexpected character|Unexpected input/],
      ['match 1 { case 1 => 2\ndefault => 0\n}', /newlines.*1:/],
      ['match 1 {\ndefault => 0', /Unclosed match expression at 1:1/]
    ] as const;
    for (const [input, message] of invalid) {
      expect(() => parseExpression(input)).toThrow(message);
    }
  });
});

describe("V0.4 visualization parsing", () => {
  it("parses a typed table and later show in executable fences with original locations", () => {
    const doc = parseDocumentText(
      'Intro\n~~~amx\nshow ignored\n~~~\n```amx\ntype Asset {\n  id: String\n}\nlet assets: Asset[] = []\ntable register = table(assets) {\n  title: "Register"\n  column id as "Asset"\n}\n```\nBetween\n```amx\nshow register\n```'
    );
    const blocks = doc.nodes.filter(node => node.type === 'executableCodeBlock') as ExecutableCodeBlockNode[];
    expect(blocks).toHaveLength(2);
    expect(blocks[0].statements.map(statement => statement.type)).toEqual([
      'typeDeclaration', 'variableDeclaration', 'tableDeclaration'
    ]);
    const table = blocks[0].statements[2] as any;
    expect(table).toMatchObject({
      name: 'register', binding: 'assets', source: { line: 10, column: 1 },
      bindingSource: { line: 10, column: 24 },
      options: [
        { type: 'viewTitleOption', value: 'Register', source: { line: 11, column: 3 } },
        { type: 'tableColumnOption', field: 'id', label: 'Asset', fieldSource: { line: 12, column: 10 }, source: { line: 12, column: 3 } }
      ]
    });
    expect(blocks[1].statements[0]).toMatchObject({
      type: 'showStatement', name: 'register', source: { line: 17, column: 1 }, nameSource: { line: 17, column: 6 }
    });
  });

  it("parses record and scalar chart option forms in source order", () => {
    const statements = parseStatements(`chart barView = bar(assets) {
  title: "Bar"
  description: "Asset scores"
  category: id
  series score as "Score"
}
chart lineView = line(values) {
  title: "Line"
  description: "Scalar trend"
  series "Trend"
  labels: dates
}
chart scatterView = scatter(points) {
  title: "Scatter"
  description: "Point groups"
  x: xValue
  y: yValue
  group: groupName
}
show barView`);
    expect(statements.map(statement => statement.type)).toEqual([
      'chartDeclaration', 'chartDeclaration', 'chartDeclaration', 'showStatement'
    ]);
    expect(statements[0]).toMatchObject({
      kind: 'bar', binding: 'assets', options: [
        { type: 'viewTitleOption', value: 'Bar' },
        { type: 'viewDescriptionOption', value: 'Asset scores' },
        { type: 'chartFieldOption', role: 'category', field: 'id' },
        { type: 'chartSeriesOption', field: 'score', label: 'Score' }
      ]
    });
    expect(statements[1]).toMatchObject({
      kind: 'line', binding: 'values', options: [
        { type: 'viewTitleOption', value: 'Line' },
        { type: 'viewDescriptionOption', value: 'Scalar trend' },
        { type: 'chartSeriesOption', label: 'Trend' },
        { type: 'chartFieldOption', role: 'labels', field: 'dates' }
      ]
    });
    expect(statements[2]).toMatchObject({
      kind: 'scatter', options: [
        { type: 'viewTitleOption', value: 'Scatter' },
        { type: 'viewDescriptionOption', value: 'Point groups' },
        { type: 'chartFieldOption', role: 'x', field: 'xValue' },
        { type: 'chartFieldOption', role: 'y', field: 'yValue' },
        { type: 'chartFieldOption', role: 'group', field: 'groupName' }
      ]
    });
  });

  it("rejects malformed forms and preserves placement violations for static checking", () => {
    expect(() => parseStatements('table bad = line(items) {\n  title: "bad"\n}')).toThrow(/Invalid visualization declaration/);
    expect(() => parseStatements('chart bad = bar(items) {\n  subtitle: "bad"\n}')).toThrow(/Invalid chart option/);
    expect(() => parseStatements('chart bad = bar(items) {')).toThrow(/Unclosed visualization/);
    expect(parseStatements('export table bad = table(items) {\n  title: "bad"\n  column id as "ID"\n}')[0]).toMatchObject({
      type: 'tableDeclaration', exported: true
    });
    expect(parseStatements('for item in [1] {\n  table view = table(items) {\n    title: "T"\n    column id as "ID"\n  }\n}')[0]).toMatchObject({
      type: 'forStatement', body: [{ type: 'tableDeclaration' }]
    });
    expect(parseStatements('for item in [1] {\n  show view\n}')[0]).toMatchObject({
      type: 'forStatement', body: [{ type: 'showStatement' }]
    });
  });
});

describe("parseDocument (file orchestration)", () => {
  beforeEach(async () => {
    await cleanupTemp();
  });

  afterEach(async () => {
    await cleanupTemp();
  });

  it("retains nested match locations inside an executable block loop", async () => {
    const file = await writeTempAmx('---\ntitle: Match\n---\n\n```amx\nlet values = for item in [1] {\n  return match item {\n    case 1 => match 2 {\n      case 2 => item\n      default => 0\n    }\n    default => 0\n  }\n}\n```');
    const doc = await parseDocument(file);
    const block = doc.nodes.find(node => node.type === 'executableCodeBlock') as ExecutableCodeBlockNode;
    const loop = (block.statements[0] as VariableDeclarationNode).expression as any;
    const match = loop.body[0].expression as MatchExpressionNode;
    expect(match.source).toEqual({ line: 7, column: 10 });
    expect(match.cases[0].source).toEqual({ line: 8, column: 5 });
    expect(match.cases[0].expression.source).toEqual({ line: 8, column: 15 });
    expect((match.cases[0].expression as MatchExpressionNode).cases[0].expression.source)
      .toEqual({ line: 9, column: 17 });
  });

  it("parses in-memory text with the same front matter, blocks, and original locations", async () => {
    const content = "---\r\ntitle: Buffer\r\n---\r\nIntro\r\n```amx\r\nlet value = 2\r\n```\r\n";
    const fromText = parseDocumentText(content);
    const fromPath = await parseDocument(await writeTempAmx(content));

    expect(fromText).toEqual(fromPath);
    expect(fromText.metadata.title).toBe("Buffer");
    const block = fromText.nodes.find(node => node.type === "executableCodeBlock") as ExecutableCodeBlockNode;
    expect(block.source).toEqual({ line: 5, column: 1 });
    expect(block.statements[0].source).toEqual({ line: 6, column: 1 });
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

describe("Sprint 075 braced if fixtures", () => {
  const fixture = (id: string, source: string) =>
    parseDocumentText(`---\nfixture: ${id}\n---\n\`\`\`amx\n${source}\n\`\`\`\n`);
  const statements = (id: string, source: string) =>
    fixture(id, source).nodes.find(node => node.type === "executableCodeBlock") as ExecutableCodeBlockNode;

  it("parses IF-V01 through IF-V06 into distinct legacy, expression, and statement forms", () => {
    const legacy = statements("IF-V01", 'let selected: String = if true then "yes" else "no"').statements[0] as VariableDeclarationNode;
    expect(legacy.expression.type).toBe("conditionalExpression");

    const expression = statements("IF-V02", [
      "let selected: Number = if true {",
      "  let answer = 42",
      "  return answer",
      "} else {",
      "  return 0",
      "}",
      "let after: Number = 1"
    ].join("\n")).statements;
    expect((expression[0] as VariableDeclarationNode).expression.type).toBe("bracedIfExpression");
    expect(expression[1].type).toBe("variableDeclaration");

    for (const [id, source, hasElse] of [
      ["IF-V03", "if true {\n  let local: Number = 2\n}", false],
      ["IF-V06", "if true {\n  selected = 1\n} else {\n  selected = 2\n}", true]
    ] as const) {
      const statement = statements(id, source).statements[0];
      expect(statement.type).toBe("bracedIfStatement");
      expect("alternate" in statement && statement.alternate !== undefined).toBe(hasElse);
    }

    const nested = statements("IF-V04", [
      "let selected: Number = if true {",
      "  let nested: Number = if false {",
      "    return 1",
      "  } else {",
      "    return 2",
      "  }",
      "  return nested",
      "} else {",
      "  return 3",
      "}"
    ].join("\n")).statements[0] as VariableDeclarationNode;
    expect(nested.expression.type).toBe("bracedIfExpression");

    const selectedBranch = statements("IF-V05", [
      "let selected: Number = if true {",
      "  return 7",
      "} else {",
      "  return sqrt(-1)",
      "}"
    ].join("\n")).statements[0] as VariableDeclarationNode;
    expect(selectedBranch.expression.type).toBe("bracedIfExpression");
  });

  it("locates the missing expression else in IF-I01", () => {
    try {
      fixture("IF-I01", "let selected: Number = if true {\n  return 1\n}");
      throw new Error("Expected missing-else syntax diagnostic");
    } catch (error: any) {
      expect(error.code).toBe("AMX3006");
      expect(error.line).toBe(5);
      expect(error.column).toBe(24);
    }
  });
});
