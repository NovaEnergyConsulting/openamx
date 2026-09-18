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
import { OpenAmxDocument, VariableDeclarationNode } from "../src/ast/types";
import { AmxError } from "../src/diagnostics/errors";

function makeDocFromBody(body: string): OpenAmxDocument {
  const nodes = parseStatements(body);
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
    const body =
`# Heading

Some text here.

let value = 99

More narrative after.`;
    const doc = makeDocFromBody(body);
    const ctx = evaluateDocument(doc);
    expect(ctx.value).toBe(99);
    expect(Object.keys(ctx).length).toBe(1);
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
