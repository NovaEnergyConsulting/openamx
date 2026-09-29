/**
 * Evaluator tests for Sprint 003: Variable Declarations + Basic Arithmetic Expressions.
 *
 * Covers:
 * - Literals (number, string, boolean)
 * - Simple arithmetic (+ - * / % ^)
 * - Operator precedence
 * - Parentheses
 * - Variable references (previous declarations)
 * - Forward references produce undefined error
 * - Undefined identifier produces AMX1004-style error with location
 * - Right-associativity of ^
 * - Unary minus
 *
 * No comparisons, logicals, conditionals, calls, lists, or stdlib tested here.
 */

import { describe, it, expect, beforeEach } from "bun:test";
import { parseStatements } from "../src/parser/parseStatements";
import { evaluateDocument } from "../src/runtime/evaluateDocument";
import { OpenAmxDocument } from "../src/ast/types";
import { AmxError } from "../src/diagnostics/errors";
import { Environment } from "../src/runtime/environment";
import { evaluateStatements } from "../src/runtime/evaluateExpression";
import { parseExpression } from "../src/parser/parseExpression";
import { evaluateExpression } from "../src/runtime/evaluateExpression";
import { parseDocumentText } from "../src/parser/parseDocument";
import { checkDocument, checkingActivated } from "../src/typechecker/checkDocument";
import { renderHtml } from "../src/renderer/renderHtml";

describe("Sprint 014 activated checking and records", () => {
  const document = (source: string) => parseDocumentText(`\`\`\`amx\n${source}\n\`\`\``);
  const run = (source: string) => evaluateDocument(document(source), 'case.amx');

  it("materializes defaults, nullable omissions and nested records in declaration order with fresh copies", () => {
    const values = run(`type Inner {\n  name: String\n}\ntype Outer {\n  id: Number\n  inner: Inner = Inner { name: "A" }\n  tags: String[] = []\n  note?: String?\n}\nlet first: Outer = Outer { id: 1 }\nlet second: Outer = Outer { id: 2, note: null }\nlet name: String = first.inner.name`);
    expect(values).toMatchObject({ first: { id: 1, inner: { name: 'A' }, tags: [], note: null }, second: { id: 2, note: null }, name: 'A' });
    expect(Object.keys(values.first as object)).toEqual(['id', 'inner', 'tags', 'note']);
    expect((values.first as any).tags).not.toBe((values.second as any).tags);
    expect((values.first as any).inner).not.toBe((values.second as any).inner);
  });

  it("narrows a nullable record only within the checked if branch", () => {
    expect(run('type Item {\n  price: Number = -2\n}\nlet item: Item? = Item { }\nlet price: Number = if item != null then item.price else 0').price).toBe(-2);
    expect(run('type Item {\n  price: Number\n}\nlet item: Item? = null\nlet price: Number = if item == null then 0 else item.price').price).toBe(0);
    expect(() => run('type Item {\n  price: Number\n}\nlet item: Item? = null\nlet price = item.price')).toThrow(AmxError);
  });

  it("checks operators, conditions, loops, match, standard library, bindings and DateTime", () => {
    expect(run(`let now: DateTime = "2024-02-29T12:30:00.123Z"\nlet dates: DateTime?[] = [now, null]\nlet numbers: Number[] = [1 to 3]\nlet total: Number = sum(numbers)\nlet doubled: Number[] = for item in numbers {\n  return item * 2\n}\nfor number in doubled {\n  total += number\n}\nlet answer: Number = if total > 3 and not false then match total {\n  case 18 => round(total / 2)\n  default => 0\n} else 0\nlet same: Boolean = now == "2024-02-29T12:30:00.123Z"`).answer).toBe(9);
  });

  it("rejects each static category before evaluation, with source and file", () => {
    const cases: [string, string][] = [
      ['let value: Number = unknown', 'AMX3001'],
      ['let value = null', 'AMX3002'],
      ['let value = [null]', 'AMX3003'],
      ['let value: Number = "bad"', 'AMX3002'],
      ['let value: Number = if 1 then 2 else 3', 'AMX3002'],
      ['let value: Number = 1 + true', 'AMX3002'],
      ['let value: Boolean = [1] == [1]', 'AMX3003'],
      ['let value: Number = mystery(1)', 'AMX3004'],
      ['let value: Number = round(1, true)', 'AMX3002'],
      ['let value: Number[] = [1, "x"]', 'AMX3002'],
      ['let value: Number = match 1 {\n case "1" => 1\n default => 2\n}', 'AMX3002'],
      ['let value: Number = match 1 {\n case 1 => "wrong"\n default => 2\n}', 'AMX3002'],
      ['let value: Number[] = for item in 1 {\n return item\n}', 'AMX3003'],
      ['let value: DateTime = "2023-02-29T12:00:00Z"', 'AMX3002'],
      ['type A {\n  id: Number\n}\nlet a: A = A { id: 1, id: 2 }', 'AMX3005'],
      ['type A {\n  id: Number\n}\nlet a: A = A { extra: 1 }', 'AMX3001'],
      ['type A {\n  id: Number\n}\nlet a: A = A { }', 'AMX3002'],
      ['type A {\n  id: Number\n}\nlet a: A = A { id: 1 }\nlet b = a.missing', 'AMX3001'],
      ['type A {\n  id?: Number\n}', 'AMX3005'],
      ['type A {\n  id: Number = unknown\n}', 'AMX3005'],
      ['type A {\n  id: A\n}', 'AMX3001'],
      ['let value: Number = 1\nvalue = "wrong"', 'AMX3002']
    ];
    for (const [source, code] of cases) {
      try {
        run(source);
        throw new Error(`Expected ${code}: ${source}`);
      } catch (error) {
        expect(error).toBeInstanceOf(AmxError);
        expect((error as AmxError).code).toBe(code);
        expect((error as AmxError).file).toBe('case.amx');
        expect((error as AmxError).line).toBeGreaterThan(0);
      }
    }
  });

  it("checks all blocks before evaluation and rendering but leaves V0.2-only truthiness alone", () => {
    const invalid = parseDocumentText('```amx\nlet values = min([])\n```\n```amx\nlet bad: Number = "x"\n```');
    expect(() => checkDocument(invalid, 'case.amx')).toThrow(AmxError);
    expect(() => evaluateDocument(invalid, 'case.amx')).toThrow(AmxError);
    expect(() => renderHtml(invalid)).toThrow(AmxError);
    const legacy = document('let mixed = [1, "two"]\nlet truthy = if 1 then 3 else 4');
    expect(checkingActivated(legacy)).toBe(false);
    expect(evaluateDocument(legacy)).toMatchObject({ mixed: [1, 'two'], truthy: 3 });
  });
});

describe("Sprint 016 logical input checking", () => {
  const check = (source: string) => checkDocument(parseDocumentText(`\`\`\`amx\n${source}\n\`\`\``), 'inputs.amx');

  it("makes inputs typed, immutable, and source-order constrained", () => {
    expect(() => check('let value: Number = 1\ninput later: Number')).toThrow(AmxError);
    expect(() => check('input value: Number\nlet value: Number = 1')).toThrow(/conflicts with an input/);
    expect(() => check('input value: Number\nvalue = 2')).toThrow(/immutable input/);
    expect(() => check('input value: Number\nimport { other } from "./other.amx"')).toThrow(/Import declarations must precede/);
    expect(() => check('input value: Number\ninput value: Number')).toThrow(/collides with another declaration/);
    expect(() => check('input value: Number\nlet result: Number = value')).not.toThrow();
  });

  it("validates typed computed bindings through direct document evaluation", () => {
    const document = parseDocumentText('```amx\nlet value: Number = 1 / 0\n```');
    expect(() => evaluateDocument(document, 'computed.amx')).toThrow(AmxError);
    try {
      evaluateDocument(document, 'computed.amx');
    } catch (error) {
      expect((error as AmxError).code).toBe('AMX4003');
    }
  });
});

describe("evaluator - match expressions", () => {
  const run = (text: string, env = new Environment()) => evaluateExpression(parseExpression(text), env);

  it("selects number, negative, decimal, string, and boolean cases without coercion", () => {
    for (const [value, pattern] of [['2', '2'], ['-2', '-2'], ['2.5', '2.5'], ['"a"', '"a"'], ['true', 'true'], ['false', 'false']]) {
      expect(run(`match ${value} {\ncase ${pattern} => 7\ndefault => 0\n}`)).toBe(7);
    }
    expect(run('match 1 {\ncase "1" => 9\ncase true => 8\ndefault => 3\n}')).toBe(3);
    expect(run('match true {\ncase 1 => 9\ndefault => 3\n}')).toBe(3);
  });

  it("uses first matching case even when default appears first or between cases", () => {
    expect(run('match 2 {\ndefault => 0\ncase 2 => 4\ncase 2 => 5\n}')).toBe(4);
    expect(run('match 2 {\ncase 1 => 1\ndefault => 0\ncase 2 => 6\n}')).toBe(6);
    expect(run('match 2 {\ncase 1 => 1\ndefault => 9\n}')).toBe(9);
    expect(run('match 2 {\ndefault => 8\n}')).toBe(8);
  });

  it("evaluates the scrutinee once and only the selected branch", () => {
    const env = new Environment();
    env.set('values', [1]);
    env.set('count', 0);
    expect(run('match (for item in values {\ncount += 1\nreturn item\n}) {\ncase 1 => missing\ndefault => 7\n}', env)).toBe(7);
    expect(env.get('count')).toBe(1);
    expect(run('match 1 {\ncase 1 => 4\ncase 1 => missing\ndefault => alsoMissing\n}')).toBe(4);
    expect(run('match 9 {\ncase 1 => missing\ndefault => 5\n}')).toBe(5);
    expect(() => run('match 1 {\ncase 1 => missing\ndefault => 0\n}')).toThrow(AmxError);
  });

  it("composes with arithmetic, boolean scrutinees, nesting, declarations and loop results", () => {
    expect(run('match (1 + 2 > 2) and not false {\ncase true => 10\ndefault => 0\n} + 1')).toBe(11);
    expect(run('match match 1 {\ncase 1 => 2\ndefault => 0\n} {\ncase 2 => match 3 {\ncase 3 => 4\ndefault => 0\n}\ndefault => 0\n}')).toBe(4);
    const env = new Environment();
    evaluateStatements(parseStatements('let values = for item in [1, 2] {\n  return match item {\n    case 1 => 10\n    default => 20\n  }\n}'), env);
    expect(env.get('values')).toEqual([10, 20]);
  });
});

function makeDocFromBody(body: string): OpenAmxDocument {
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
  return { metadata: {}, nodes };
}

describe("evaluator - literals", () => {
  it("evaluates number literal", () => {
    const doc = makeDocFromBody("let x = 42");
    const ctx = evaluateDocument(doc);
    expect(ctx.x).toBe(42);
  });

  it("evaluates decimal number literal", () => {
    const doc = makeDocFromBody("let pi = 3.14159");
    const ctx = evaluateDocument(doc);
    expect(ctx.pi).toBe(3.14159);
  });

  it("evaluates string literal", () => {
    const doc = makeDocFromBody('let name = "Transformer TX-001"');
    const ctx = evaluateDocument(doc);
    expect(ctx.name).toBe("Transformer TX-001");
  });

  it("evaluates boolean literals", () => {
    const doc = makeDocFromBody("let isCritical = true\nlet isApproved = false");
    const ctx = evaluateDocument(doc);
    expect(ctx.isCritical).toBe(true);
    expect(ctx.isApproved).toBe(false);
  });
});

describe("evaluator - arithmetic", () => {
  it("evaluates simple addition", () => {
    const doc = makeDocFromBody("let a = 10\nlet b = 5\nlet sum = a + b");
    const ctx = evaluateDocument(doc);
    expect(ctx.sum).toBe(15);
  });

  it("evaluates subtraction, multiplication, division", () => {
    const doc = makeDocFromBody("let r = (100 - 20) * 3 / 2");
    const ctx = evaluateDocument(doc);
    expect(ctx.r).toBe(120);
  });

  it("evaluates modulo", () => {
    const doc = makeDocFromBody("let m = 17 % 5");
    const ctx = evaluateDocument(doc);
    expect(ctx.m).toBe(2);
  });

  it("evaluates power (right-associative)", () => {
    // 2 ^ 3 ^ 2 should be 2 ^ (3 ^ 2) = 2 ^ 9 = 512
    const doc = makeDocFromBody("let p = 2 ^ 3 ^ 2");
    const ctx = evaluateDocument(doc);
    expect(ctx.p).toBe(512);
  });

  it("evaluates unary minus", () => {
    const doc = makeDocFromBody("let neg = -42\nlet diff = 10 + -3");
    const ctx = evaluateDocument(doc);
    expect(ctx.neg).toBe(-42);
    expect(ctx.diff).toBe(7);
  });
});

describe("evaluator - precedence and parentheses", () => {
  it("respects operator precedence (* before +)", () => {
    const doc = makeDocFromBody("let r = 10 + 5 * 2");
    const ctx = evaluateDocument(doc);
    expect(ctx.r).toBe(20);
  });

  it("parentheses override precedence", () => {
    const doc = makeDocFromBody("let r = (10 + 5) * 2");
    const ctx = evaluateDocument(doc);
    expect(ctx.r).toBe(30);
  });

  it("mixed precedence with power and unary", () => {
    // -2 ^ 3 should parse as -(2 ^ 3) because unary is higher than ^
    const doc = makeDocFromBody("let r = -2 ^ 3");
    const ctx = evaluateDocument(doc);
    expect(ctx.r).toBe(-8);
  });
});

describe("evaluator - variable references and order", () => {
  it("allows reference to previously declared variable", () => {
    const doc = makeDocFromBody(
      "let base = 100\nlet multiplier = 3\nlet result = base * multiplier"
    );
    const ctx = evaluateDocument(doc);
    expect(ctx.result).toBe(300);
  });

  it("forward reference produces undefined error (AMX1004)", () => {
    const doc = makeDocFromBody("let a = b + 1\nlet b = 10");
    expect(() => evaluateDocument(doc)).toThrow(AmxError);
    try {
      evaluateDocument(doc);
    } catch (e: any) {
      expect(e.code).toBe("AMX1004");
      expect(e.message).toContain("Undefined identifier 'b'");
    }
  });

  it("undefined variable produces AMX1004 with location when available", () => {
    const body = "let x = unknownVar";
    const doc = makeDocFromBody(body);
    try {
      evaluateDocument(doc);
      throw new Error("Expected error");
    } catch (e: any) {
      expect(e).toBeInstanceOf(AmxError);
      expect(e.code).toBe("AMX1004");
      expect(e.message).toBe("Undefined identifier 'unknownVar'");
      // Source location should be present (line 1 from the let)
      expect(e.line).toBe(1);
    }
  });
});

describe("evaluator - document evaluation", () => {
  it("evaluates document in source order and returns final context", () => {
    const body =
`let replacementCost = 1250000
let annualRiskCost = 85000
let projectLife = 25

let lifecycleRiskCost = annualRiskCost * projectLife
let totalLifecycleCost = replacementCost + lifecycleRiskCost`;
    const doc = makeDocFromBody(body);
    const ctx = evaluateDocument(doc);

    expect(ctx.replacementCost).toBe(1250000);
    expect(ctx.annualRiskCost).toBe(85000);
    expect(ctx.projectLife).toBe(25);
    expect(ctx.lifecycleRiskCost).toBe(2125000);
    expect(ctx.totalLifecycleCost).toBe(3375000);
  });

  it("ignores narrative nodes during evaluation", () => {
    const doc: OpenAmxDocument = {
      metadata: {},
      nodes: [{ type: "narrative", content: "# Heading\n\nlet value = 99\n\nMore narrative after." }]
    };
    const ctx = evaluateDocument(doc);
    expect(ctx.value).toBeUndefined();
    expect(Object.keys(ctx)).toHaveLength(0);
  });

  it("shares mutations between executable blocks and ignores bare declarations", () => {
    const doc: OpenAmxDocument = {
      metadata: {},
      nodes: [
        {
          type: "executableCodeBlock",
          content: "let total = 2\n",
          statements: parseStatements("let total = 2", { line: 2, column: 1 })
        },
        {
          type: "narrative",
          content: "let ignored = 100"
        },
        {
          type: "executableCodeBlock",
          content: "total += 3\n",
          statements: parseStatements("total += 3", { line: 5, column: 1 })
        }
      ]
    };
    const ctx = evaluateDocument(doc);

    expect(ctx).toEqual({ total: 5 });
  });

  it("evaluates ranges, loops, and match across later executable blocks", () => {
    const doc: OpenAmxDocument = {
      metadata: {},
      nodes: [
        {
          type: "executableCodeBlock",
          content: "let total = 0\nlet values = [1 to 3]\n",
          statements: parseStatements("let total = 0\nlet values = [1 to 3]", { line: 2, column: 1 })
        },
        {
          type: "executableCodeBlock",
          content: "for item in values {\n  total += item\n}\nlet label = match total {\ncase 6 => \"ok\"\ndefault => \"bad\"\n}\n",
          statements: parseStatements(
            "for item in values {\n  total += item\n}\nlet label = match total {\ncase 6 => \"ok\"\ndefault => \"bad\"\n}",
            { line: 6, column: 1 }
          )
        },
        {
          type: "executableCodeBlock",
          content: "total += 1\n",
          statements: parseStatements("total += 1", { line: 14, column: 1 })
        }
      ]
    };
    const ctx = evaluateDocument(doc);

    expect(ctx.total).toBe(7);
    expect(ctx.label).toBe("ok");
  });
});

describe("evaluator - comparisons", () => {
  it("evaluates all six comparison operators", () => {
    const doc = makeDocFromBody(
      "let eq = 5 == 5\nlet ne = 5 != 4\nlet gt = 5 > 4\nlet ge = 5 >= 5\nlet lt = 3 < 4\nlet le = 3 <= 3"
    );
    const ctx = evaluateDocument(doc);
    expect(ctx.eq).toBe(true);
    expect(ctx.ne).toBe(true);
    expect(ctx.gt).toBe(true);
    expect(ctx.ge).toBe(true);
    expect(ctx.lt).toBe(true);
    expect(ctx.le).toBe(true);
  });

  it("compares after arithmetic", () => {
    const doc = makeDocFromBody("let r = (2 + 3) > 4");
    const ctx = evaluateDocument(doc);
    expect(ctx.r).toBe(true);
  });
});

describe("evaluator - logicals", () => {
  it("evaluates and / or / not", () => {
    const doc = makeDocFromBody(
      "let a = true and false\nlet b = true or false\nlet c = not false\nlet d = not (1 == 2)"
    );
    const ctx = evaluateDocument(doc);
    expect(ctx.a).toBe(false);
    expect(ctx.b).toBe(true);
    expect(ctx.c).toBe(true);
    expect(ctx.d).toBe(true);
  });

  it("treats non-zero/non-empty as truthy for logicals", () => {
    const doc = makeDocFromBody("let r = 5 and \"x\"");
    const ctx = evaluateDocument(doc);
    expect(ctx.r).toBe(true);
  });
});

describe("evaluator - conditionals", () => {
  it("selects consequent when test is truthy", () => {
    const doc = makeDocFromBody("let x = if 1 < 2 then 10 else 20");
    const ctx = evaluateDocument(doc);
    expect(ctx.x).toBe(10);
  });

  it("selects alternate when test is falsy", () => {
    const doc = makeDocFromBody("let y = if false then 1 else 2");
    const ctx = evaluateDocument(doc);
    expect(ctx.y).toBe(2);
  });

  it("supports nested expressions in branches", () => {
    const doc = makeDocFromBody("let z = if 3 > 1 then 1 + 2 else 0");
    const ctx = evaluateDocument(doc);
    expect(ctx.z).toBe(3);
  });
});

describe("evaluator - list literals", () => {
  it("evaluates simple list literal", () => {
    const doc = makeDocFromBody("let xs = [1, 2, 3]");
    const ctx = evaluateDocument(doc);
    expect(ctx.xs).toEqual([1, 2, 3]);
  });

  it("evaluates list with mixed expressions", () => {
    const doc = makeDocFromBody("let a = 10\nlet ys = [a + 1, 2 * 3, false]");
    const ctx = evaluateDocument(doc);
    expect(ctx.ys).toEqual([11, 6, false]);
  });

  it("supports empty list", () => {
    const doc = makeDocFromBody("let empty = []");
    const ctx = evaluateDocument(doc);
    expect(ctx.empty).toEqual([]);
  });
});

describe("evaluator - standard library", () => {
  it("sum computes numeric sum of list", () => {
    const doc = makeDocFromBody("let s = sum([1, 2, 3, 4])");
    const ctx = evaluateDocument(doc);
    expect(ctx.s).toBe(10);
  });

  it("min / max return extremes", () => {
    const doc = makeDocFromBody("let mn = min([3, 1, 4, 1, 5])\nlet mx = max([3, 1, 4, 1, 5])");
    const ctx = evaluateDocument(doc);
    expect(ctx.mn).toBe(1);
    expect(ctx.mx).toBe(5);
  });

  it("mean computes arithmetic average", () => {
    const doc = makeDocFromBody("let m = mean([10, 20, 30])");
    const ctx = evaluateDocument(doc);
    expect(ctx.m).toBe(20);
  });

  it("round supports optional digits", () => {
    const doc = makeDocFromBody("let r1 = round(3.14159)\nlet r2 = round(3.14159, 2)");
    const ctx = evaluateDocument(doc);
    expect(ctx.r1).toBe(3);
    expect(ctx.r2).toBe(3.14);
  });

  it("abs, sqrt, pow work", () => {
    const doc = makeDocFromBody("let a = abs(-7)\nlet s = sqrt(16)\nlet p = pow(2, 3)");
    const ctx = evaluateDocument(doc);
    expect(ctx.a).toBe(7);
    expect(ctx.s).toBe(4);
    expect(ctx.p).toBe(8);
  });

  it("stdlib functions accept variables holding lists", () => {
    const doc = makeDocFromBody("let data = [2, 4, 6]\nlet total = sum(data)");
    const ctx = evaluateDocument(doc);
    expect(ctx.total).toBe(12);
  });
});

describe("evaluator - stdlib errors", () => {
  it("sum on non-list produces AMX2001", () => {
    const doc = makeDocFromBody("let bad = sum(42)");
    expect(() => evaluateDocument(doc)).toThrow(AmxError);
    try { evaluateDocument(doc); } catch (e: any) {
      expect(e.code).toBe("AMX2001");
      expect(e.message).toContain("sum expects a list");
    }
  });

  it("min/max/mean on empty list produce AMX2004", () => {
    const doc = makeDocFromBody("let m = min([])");
    expect(() => evaluateDocument(doc)).toThrow(AmxError);
    try { evaluateDocument(doc); } catch (e: any) {
      expect(e.code).toBe("AMX2004");
    }
  });

  it("wrong argument count for pow produces AMX2003", () => {
    const doc = makeDocFromBody("let p = pow(2)");
    expect(() => evaluateDocument(doc)).toThrow(AmxError);
    try { evaluateDocument(doc); } catch (e: any) {
      expect(e.code).toBe("AMX2003");
    }
  });

  it("sqrt of negative produces AMX2005", () => {
    const doc = makeDocFromBody("let s = sqrt(-1)");
    expect(() => evaluateDocument(doc)).toThrow(AmxError);
    try { evaluateDocument(doc); } catch (e: any) {
      expect(e.code).toBe("AMX2005");
    }
  });
});

describe("evaluator - precedence mixing", () => {
  it("comparisons lower than arithmetic", () => {
    const doc = makeDocFromBody("let r = 1 + 2 == 3");
    const ctx = evaluateDocument(doc);
    expect(ctx.r).toBe(true);
  });

  it("and/or lower than comparisons", () => {
    const doc = makeDocFromBody("let r = 1 < 2 and 3 > 2");
    const ctx = evaluateDocument(doc);
    expect(ctx.r).toBe(true);
  });

  it("conditional has lowest precedence", () => {
    const doc = makeDocFromBody("let r = if 1 < 2 then 10 + 1 else 0");
    const ctx = evaluateDocument(doc);
    expect(ctx.r).toBe(11);
  });
});

describe("evaluator - full document integration", () => {
  it("evaluates document mixing arithmetic, comparisons, lists, calls, conditionals", () => {
    const body =
`let values = [10, 20, 30]
let total = sum(values)
let avg = mean(values)
let high = max(values)
let isHigh = high > 25
let label = if isHigh then "high" else "low"
let final = total + round(avg)`;
    const doc = makeDocFromBody(body);
    const ctx = evaluateDocument(doc);
    expect(ctx.total).toBe(60);
    expect(ctx.avg).toBe(20);
    expect(ctx.high).toBe(30);
    expect(ctx.isHigh).toBe(true);
    expect(ctx.label).toBe("high");
    expect(ctx.final).toBe(80);
  });
});

describe("evaluator - Sprint 008 mutation, ranges, and loops", () => {
  it("updates repeated declarations and applies assignment and += to existing bindings", () => {
    const env = new Environment();
    evaluateStatements(parseStatements("let total = 2\nlet total = total + 3\ntotal += 4\ntotal = total * 2"), env);
    expect(env.get("total")).toBe(18);
  });

  it("uses AMX1004 with source locations for undefined writes", () => {
    for (const statement of ["missing = 1", "missing += 1"]) {
      const env = new Environment();
      try {
        evaluateStatements(parseStatements(statement, { line: 8, column: 1 }), env);
        throw new Error("Expected assignment error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(AmxError);
        expect(error.code).toBe("AMX1004");
        expect(error.line).toBe(8);
        expect(error.column).toBe(1);
      }
    }
  });

  it("evaluates ascending, descending, and equal inclusive ranges distinctly from lists", () => {
    const env = new Environment();
    evaluateStatements(parseStatements(
      "let ascending = [1 to 3]\nlet descending = [3 to 1]\nlet equal = [2 to 2]\nlet list = [1, 3]"
    ), env);
    expect(env.get("ascending")).toEqual([1, 2, 3]);
    expect(env.get("descending")).toEqual([3, 2, 1]);
    expect(env.get("equal")).toEqual([2]);
    expect(env.get("list")).toEqual([1, 3]);
  });

  it("rejects non-finite and non-integer range bounds with locations", () => {
    for (const expression of ["[1.5 to 3]", "[1 to 1 / 0]"]) {
      const env = new Environment();
      try {
        evaluateStatements(parseStatements(`let values = ${expression}`, { line: 6, column: 1 }), env);
        throw new Error("Expected range error");
      } catch (error: any) {
        expect(error).toBeInstanceOf(AmxError);
        expect(error.code).toBe("AMX1005");
        expect(error.line).toBe(6);
      }
    }
  });

  it("runs statement loops over lists and ranges with shared side effects", () => {
    const env = new Environment();
    evaluateStatements(parseStatements(
      "let total = 0\nfor item in [1, 2, 3] {\n  total += item\n  let observed = item\n}\nfor step in [1 to 2] {\n  total += step\n}"
    ), env);
    expect(env.get("total")).toBe(9);
    expect(env.get("observed")).toBe(3);
    expect(env.has("item")).toBe(false);
    expect(env.has("step")).toBe(false);
  });

  it("collects one expression-loop return per iteration and runs later statements", () => {
    const env = new Environment();
    evaluateStatements(parseStatements(
      "let total = 0\nlet results = for item in [1 to 3] {\n  return item * 2\n  total += item\n}"
    ), env);
    expect(env.get("results")).toEqual([2, 4, 6]);
    expect(env.get("total")).toBe(6);
  });

  it("returns an empty list for an empty expression loop", () => {
    const env = new Environment();
    evaluateStatements(parseStatements("let results = for item in [] {\nreturn item\n}"), env);
    expect(env.get("results")).toEqual([]);
    expect(env.has("item")).toBe(false);
  });

  it("evaluates an expression loop inside a function argument", () => {
    const env = new Environment();
    evaluateStatements(parseStatements(
      "let total = sum(for item in [1 to 3] {\nreturn item\n})"
    ), env);
    expect(env.get("total")).toBe(6);
  });

  it("restores a shadowed iterator after success and evaluation failure", () => {
    const env = new Environment();
    env.set("item", 99);
    evaluateStatements(parseStatements("for item in [1, 2] {\nitem += 1\n}"), env);
    expect(env.get("item")).toBe(99);

    expect(() => evaluateStatements(parseStatements(
      "let values = for item in [1] {\nreturn item\nmissing = 2\n}"
    ), env)).toThrow(AmxError);
    expect(env.get("item")).toBe(99);
  });

  it("rejects non-list loop values with a source-located diagnostic", () => {
    const env = new Environment();
    try {
      evaluateStatements(parseStatements("for item in 3 {\n}\n", { line: 11, column: 1 }), env);
      throw new Error("Expected iterable error");
    } catch (error: any) {
      expect(error).toBeInstanceOf(AmxError);
      expect(error.code).toBe("AMX1006");
      expect(error.line).toBe(11);
    }
  });
});
