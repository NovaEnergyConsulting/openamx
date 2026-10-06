import { afterEach, describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseDocumentText } from "../src/parser/parseDocument";
import { parseExpression } from "../src/parser/parseExpression";
import { parseStatements } from "../src/parser/parseStatements";
import { evaluateDocument, evaluateDocumentEnvironment } from "../src/runtime/evaluateDocument";
import { evaluateExpression, evaluateStatements } from "../src/runtime/evaluateExpression";
import { Environment } from "../src/runtime/environment";
import { loadEntryModule } from "../src/runtime/moduleLoader";
import { AmxError } from "../src/diagnostics/errors";
import { formatAmx } from "../src/formatter/formatAmx";
import { analyzeEditorModules } from "../src/editor/moduleAnalysis";
import { editorCompletionFacts } from "../src/editor/completion";
import { editorHighlightFacts } from "../src/editor/highlighting";

const directories: string[] = [];

async function makeDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "openamx-list-"));
  directories.push(directory);
  return directory;
}

afterEach(async () => {
  for (const directory of directories) await rm(directory, { recursive: true, force: true });
  directories.length = 0;
});

function document(source: string) {
  return parseDocumentText(`\`\`\`amx\n${source}\n\`\`\`\n`);
}

function expectCode(run: () => unknown, code: string): AmxError {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(AmxError);
    expect((error as AmxError).code).toBe(code);
    return error as AmxError;
  }
  throw new Error(`Expected ${code}`);
}

describe("V0.9 one-based list reads and mutation statements", () => {
  it("reads first, last, computed and chained nullable elements with their checked types", () => {
    const source = [
      "type Box {",
      "  values: Number?[]",
      "}",
      "let box: Box = Box { values = [10, null, 30] }",
      "let first: Number? = box.values[1]",
      "let middle: Number? = box.values[1 + 1]",
      "let last: Number? = box.values[3]",
      "let position: Number = 1",
      "let byIdentifier: Number? = box.values[position]",
      "let nested: Number = [[4, 5]][1][2]",
      "let rangeItem: Number = [1 to 3][3]"
    ].join("\n");
    const result = evaluateDocument(document(source));
    expect(result).toMatchObject({ first: 10, middle: null, last: 30, byIdentifier: 10, nested: 5, rangeItem: 3 });

    const parsed = parseExpression("box.values[1 + 1]");
    expect(parsed).toMatchObject({
      type: "listAccess",
      receiver: { type: "fieldAccess", field: "values" },
      index: { type: "binaryExpression" }
    });
  });

  it("statically rejects provable invalid indices and reports LF/CRLF source positions", () => {
    for (const source of [
      "let value = [10, 20][0]",
      "let value = [10, 20][3]",
      "let value = [1 to 3][4]",
      "let value = [10, 20][1.5]",
      "let list: Number[] = [10]\nlet value = list[-1]",
      "let list: Number[] = [10]\nadd 2 to list at 0",
      "let list: Number[] = [10]\nremove 1 from list at -1"
    ]) {
      expectCode(() => evaluateDocument(document(source), "list.amx"), "AMX3009");
    }

    for (const newline of ["\n", "\r\n"]) {
      const source = ["```amx", "let values: Number[] = [1]", "let invalid = values[0]", "```", ""].join(newline);
      const error = expectCode(() => evaluateDocument(parseDocumentText(source), "bounds.amx"), "AMX3009");
      expect(error.line).toBe(3);
      expect(error.column).toBe(22);

      const mutationSource = ["```amx", "let values: Number[] = [1]", "add 2 to values at 2", "```", ""].join(newline);
      const mutationDocument = parseDocumentText(mutationSource);
      const mutationBlock = mutationDocument.nodes.find(node => node.type === "executableCodeBlock");
      const mutation = mutationBlock?.type === "executableCodeBlock" ? mutationBlock.statements[1] : undefined;
      expect(mutation).toMatchObject({
        type: "addStatement",
        targetSource: { line: 3, column: 10 },
        index: { type: "numberLiteral", source: { line: 3, column: 20 } }
      });
    }

    expectCode(() => evaluateDocument(document([
      "let values: Number[] = [1, 2]",
      "let index: Number = if true then 0 else 1",
      "let invalid = values[index]"
    ].join("\n"))), "AMX1008");
  });

  it("validates dynamic reads and returns AMX1008 for non-finite, wrong, and out-of-range values", () => {
    const environment = new Environment();
    environment.set("values", [10, 20]);
    environment.set("index", Number.POSITIVE_INFINITY);
    const nonFinite = expectCode(() => evaluateExpression(parseExpression("values[index]"), environment, "dynamic.amx"), "AMX1008");
    expect(nonFinite.line).toBe(1);

    environment.set("index", 0);
    expectCode(() => evaluateExpression(parseExpression("values[index]"), environment), "AMX1008");
    environment.set("index", 1.25);
    expectCode(() => evaluateExpression(parseExpression("values[index]"), environment), "AMX1008");
    environment.set("index", 3);
    expectCode(() => evaluateExpression(parseExpression("values[index]"), environment), "AMX1008");
    environment.set("index", "1");
    expectCode(() => evaluateExpression(parseExpression("values[index]"), environment), "AMX1008");
    environment.set("index", Number.NaN);
    expectCode(() => evaluateExpression(parseExpression("values[index]"), environment), "AMX1008");
  });

  it("appends, inserts at one-based positions and preserves local alias identity", () => {
    const result = evaluateDocument(document([
      "let values: Number[] = [10, 20]",
      "let alias: Number[] = values",
      "add 30 to values",
      "add 5 to values at 1",
      "add 15 to values at 3",
      "add 25 to values at 5",
      "add 40 to values at 7"
    ].join("\n")));
    expect(result.values).toEqual([5, 10, 15, 20, 25, 30, 40]);
    expect(result.alias).toBe(result.values);
  });

  it("accepts balanced multiline mutation values and preserves their order", () => {
    const result = evaluateDocument(document([
      "type Item {",
      "  id: Number",
      "}",
      "let items: Item[] = []",
      "add Item {",
      "  id = 7,",
      "} to items",
      "add Item {",
      "  id = 8,",
      "} to items at 1"
    ].join("\n")));
    expect(result.items).toEqual([{ id: 8 }, { id: 7 }]);
  });

  it("implements interval removal and validates-but-ignores the no-at count magnitude", () => {
    const result = evaluateDocument(document([
      "let values: Number[] = [1, 2, 3, 4, 5, 6, 7]",
      "let one: Number[] = [9, 10]",
      "remove 1 from values at 1",
      "remove 2 from values at 2",
      "remove 2 from values at 3",
      "remove 99 from values",
      "remove 1 from one"
    ].join("\n")));
    expect(result.values).toEqual([2]);
    expect(result.one).toEqual([9]);
  });

  it("rejects invalid dynamic mutations atomically and catches static element type errors", () => {
    const environment = new Environment();
    const values = [1, 2, 3];
    environment.set("values", values);
    environment.set("alias", values);
    environment.set("position", 5);

    expectCode(() => evaluateStatements(parseStatements("add 9 to values at position"), environment), "AMX1008");
    expect(values).toEqual([1, 2, 3]);
    expect(environment.get("alias")).toBe(values);

    environment.set("position", 2);
    environment.set("count", 3);
    expectCode(() => evaluateStatements(parseStatements("remove count from values at position"), environment), "AMX1008");
    expect(values).toEqual([1, 2, 3]);

    environment.set("count", 0);
    expectCode(() => evaluateStatements(parseStatements("remove count from values"), environment), "AMX1008");
    expect(values).toEqual([1, 2, 3]);
    environment.set("count", 1.5);
    expectCode(() => evaluateStatements(parseStatements("remove count from values"), environment), "AMX1008");
    expect(values).toEqual([1, 2, 3]);

    expectCode(() => evaluateDocument(document("let values: Number[] = [1]\nadd \"bad\" to values")), "AMX3002");
    expectCode(() => evaluateDocument(document("let values: Number[] = [1]\nadd 2 to values at true")), "AMX3002");
    expectCode(() => evaluateDocument(document("let values: Number[] = []\nremove 1 from values")), "AMX1008");
    expectCode(() => evaluateDocument(document("let values: Number[] = [1]\nremove 0 from values")), "AMX3009");
  });

  it("parses only named-list statement targets and forbids mutations in expression loops", () => {
    expect(() => parseStatements("add 1 to values[1]")).toThrow(expect.objectContaining({ code: "AMX3006" }));
    expect(() => parseStatements("remove 1 from values.field")).toThrow(expect.objectContaining({ code: "AMX3006" }));
    expectCode(() => evaluateDocument(document([
      "let values: Number[] = [1]",
      "let result = for item in values {",
      "  add item to values",
      "  return item",
      "}"
    ].join("\n"))), "AMX3003");
    expect(evaluateDocument(document("fn first(values: Number[]): Number = values[1]\nlet value = first([9])")).value).toBe(9);
  });

  it("iterates the original list snapshot while the live list is mutated", () => {
    const result = evaluateDocument(document([
      "let values: Number[] = [1, 2, 3]",
      "let visited: Number[] = []",
      "for item in values {",
      "  add item to visited",
      "  remove 1 from values at 1",
      "  add 9 to values",
      "}"
    ].join("\n")));
    expect(result.visited).toEqual([1, 2, 3]);
    expect(result.values).toEqual([9, 9, 9]);
  });

  it("keeps emitted view data isolated from later list mutation", () => {
    const environment = evaluateDocumentEnvironment(document([
      "type Item {",
      "  id: Number",
      "}",
      "let items: Item[] = [Item { id = 1 }]",
      "table report = table(items) {",
      "  title: \"Items\"",
      "  column id as \"ID\"",
      "}",
      "show report",
      "add Item { id = 2 } to items"
    ].join("\n")));
    expect(environment.get("items")).toHaveLength(2);
    expect(environment.viewEmissions[0].data).toEqual([{ id: 1 }]);
    expect(Object.isFrozen(environment.viewEmissions[0].data)).toBe(true);
  });

  it("protects imported, nested, and aliased list objects at runtime", async () => {
    const directory = await makeDirectory();
    const library = join(directory, "library.amx");
    await Bun.write(library, [
      "```amx",
      "export type Box {",
      "  values: Number[]",
      "}",
      "export let values: Number[] = [1, 2]",
      "export let box: Box = Box { values = [3, 4] }",
      "```"
    ].join("\n"));

    const cases = [
      'import { values } from "./library.amx"\nadd 3 to values',
      'import { values } from "./library.amx"\nlet alias: Number[] = values\nremove 1 from alias',
      'import { box, Box } from "./library.amx"\nlet nested: Number[] = box.values\nadd 5 to nested'
    ];
    for (const content of cases) {
      const entry = join(directory, `entry-${Math.random().toString(36).slice(2)}.amx`);
      await Bun.write(entry, `\`\`\`amx\n${content}\n\`\`\`\n`);
      try {
        await loadEntryModule(entry);
        throw new Error("Expected immutable-import mutation to fail");
      } catch (error) {
        expect(error).toBeInstanceOf(AmxError);
        expect((error as AmxError).code).toBe("AMX1008");
      }
    }
  });

  it("wires list syntax into shared editor facts and keeps formatter behavior stable", () => {
    const text = [
      "```amx",
      "let values: Number[] = [1]",
      "add 2 to values at 2",
      "remove 1 from values",
      "let first = values[1]",
      "```",
      "Narrative add 3 to values",
      "```js",
      "let inert = values[1]",
      "```",
      ""
    ].join("\n");
    const analysis = analyzeEditorModules(text);
    const highlights = editorHighlightFacts(text, analysis.document);
    const tokens = highlights.map(fact => text.slice(fact.from, fact.to));
    expect(tokens).toContain("add");
    expect(tokens).toContain("remove");
    expect(tokens).toContain("values");
    expect(tokens).not.toContain("inert");
    const narrativeOffset = text.indexOf("Narrative add") + "Narrative ".length;
    expect(highlights.some(fact => fact.from <= narrativeOffset && narrativeOffset < fact.to)).toBe(false);
    expect(editorCompletionFacts(text, text.indexOf("add 2"), analysis.document).map(item => item.label)).toContain("remove");

    const code = "let values: Number[] = [1]\nadd 2 to values at 2\nremove 1 from values";
    expect(formatAmx(code)).toBe(`${code}\n`);
    expect(() => analyzeEditorModules("```amx\nlet values: Number[] = [1]\nlet bad = values[0]\n```\n"))
      .toThrow(expect.objectContaining({ code: "AMX3009" }));
  });
});
