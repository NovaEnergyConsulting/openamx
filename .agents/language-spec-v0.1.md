# Language Specification

Coding Agent Prompt: Build OpenAMX Prototype v0.1
You are assisting with the initial implementation of OpenAMX.

OpenAMX, short for Open Asset Management eXchange, is an open-source, text-based, computable document format for Asset Management knowledge. It is intended to behave like “Markdown on steroids”: plain text documents that combine human-readable narrative with executable calculations, variables, imports, and rendered outputs.

The goal of this task is to build the first working prototype.

Do not attempt to build the entire future vision. Focus on the smallest useful implementation that proves the following pipeline:

.amx source file
  -> parse
  -> evaluate
  -> render HTML

The initial implementation should be written in TypeScript.

---

# 1. Project Objective

Build a minimal OpenAMX prototype that can:

1. Read `.amx` files from disk.
2. Extract optional YAML-style front matter.
3. Parse Markdown-like narrative content.
4. Parse `let` variable declarations.
5. Evaluate simple expressions.
6. Replace inline computed expressions written as `{{ expression }}`.
7. Render the document as HTML.
8. Provide a CLI command to render an `.amx` file to `.html`.
9. Include automated tests for parser, evaluator, and renderer behaviour.

---

# 2. Core Concept

An OpenAMX document is a plain-text file with the extension `.amx`.

Example:

```amx
---
title: Transformer Replacement Strategy
author: Carlos Gamez
version: 0.1
status: draft
---

# Transformer Replacement Strategy

This document evaluates the replacement of Transformer TX-001.

let replacementCost = 1250000
let annualRiskCost = 85000
let projectLife = 25

let lifecycleRiskCost = annualRiskCost * projectLife
let totalLifecycleCost = replacementCost + lifecycleRiskCost

## Result

The lifecycle risk cost is {{ lifecycleRiskCost }}.

The total lifecycle cost is {{ totalLifecycleCost }}.


Expected evaluated context:

{
  "replacementCost": 1250000,
  "annualRiskCost": 85000,
  "projectLife": 25,
  "lifecycleRiskCost": 2125000,
  "totalLifecycleCost": 3375000
}


Expected rendered HTML should include:

<h1>Transformer Replacement Strategy</h1>
<p>This document evaluates the replacement of Transformer TX-001.</p>
<h2>Result</h2>
<p>The lifecycle risk cost is 2125000.</p>
<p>The total lifecycle cost is 3375000.</p>

3. MVP Scope

Implement only the following features in v0.1.

3.1 File Handling

Support reading files with extension:

.amx


Use UTF-8 encoding.

3.2 Front Matter

Support optional YAML-style front matter at the top of the file.

Example:

---
title: Hello OpenAMX
author: Carlos Gamez
version: 0.1
---


For the prototype, front matter may be parsed using a YAML parser package.

The parsed metadata should be stored in the document AST or document model.

3.3 Narrative Content

Support Markdown-like narrative content.

For v0.1, support:

# Heading 1
## Heading 2
### Heading 3

Paragraph text.

- Bullet item
- Bullet item


You may use a Markdown parser for rendering narrative content, but be careful to remove or ignore executable let declarations from the rendered narrative.

3.4 Variable Declarations

Support let declarations.

Examples:

let replacementCost = 1250000
let annualRiskCost = 85000
let projectLife = 25
let totalCost = replacementCost + annualRiskCost


Syntax:

VariableDeclaration ::= "let" Identifier "=" Expression NewLine
Identifier          ::= Letter (Letter | Digit | "_")*


Identifiers are case-sensitive.

Valid identifiers:

replacementCost
riskScore
asset_count
riskScore2026


Invalid identifiers:

2026Risk
asset count
replacement-cost

3.5 Expression Evaluation

Support the following expression features.

Number literals
let a = 10
let b = 0.06

String literals
let assetName = "Transformer TX-001"

Boolean literals
let isCritical = true
let isApproved = false

Variable references
let total = capex + opex

Arithmetic operators

Support:

+
-
*
/
%
^


Operator precedence should be respected.

Example:

let result = 10 + 5 * 2


Expected result:

{
  "result": 20
}

Parentheses
let result = (10 + 5) * 2


Expected result:

{
  "result": 30
}

Comparison operators

Support:

==
!=
>
>=
<
<=


Example:

let highRisk = riskScore >= 20

Logical operators

Support:

and
or
not


Example:

let highRisk = likelihood >= 4 and consequence >= 4

Conditional expressions

Support:

let priority = if riskScore >= 20 then "High" else "Low"


If feasible, also support chained conditionals:

let priority =
  if riskScore >= 20 then "High"
  else if riskScore >= 10 then "Medium"
  else "Low"


If chained conditionals are too much for the first pass, implement only the single-line conditional and document the limitation.

3.6 Inline Render Expressions

Support inline computed expressions using double curly braces.

Example:

The total lifecycle cost is {{ totalLifecycleCost }}.


The renderer should replace the placeholder with the evaluated value.

Example output:

<p>The total lifecycle cost is 3375000.</p>


Inline expressions should also support simple expressions, not only variable names.

Example:

The combined cost is {{ capex + opex }}.

3.7 Basic Standard Library

Implement these built-in functions:

sum(values)
min(values)
max(values)
mean(values)
round(value, digits)
abs(value)
sqrt(value)
pow(value, exponent)


For v0.1, list literals are optional. If list literals are not implemented, then sum, mean, min, and max can be deferred or implemented once list support exists.

If implementing list literals, support:

let values = [10, 20, 30]
let total = sum(values)
let average = mean(values)

4. Features Explicitly Out of Scope for First Prototype

Do not implement these yet unless the foundational architecture makes it trivial:

CSV imports.
JSON imports.
.amx imports.
Word export.
PDF export.
Units.
Currency formatting.
Charts.
Tables.
Asset management domain libraries.
ISO 55001 semantic schemas.
Visual editor.
VS Code extension.
Multi-file document packs.
Package manager.
Approval workflows.
Knowledge graph.
AI-assisted authoring.

However, design the architecture so that these features can be added later.

5. Proposed Architecture

Use a modular architecture.

Suggested repository structure:

openamx/
├── README.md
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── cli.ts
│   ├── parser/
│   │   ├── parseDocument.ts
│   │   ├── parseFrontMatter.ts
│   │   ├── parseStatements.ts
│   │   └── parseExpression.ts
│   ├── ast/
│   │   └── types.ts
│   ├── runtime/
│   │   ├── evaluateDocument.ts
│   │   ├── evaluateExpression.ts
│   │   ├── environment.ts
│   │   └── standardLibrary.ts
│   ├── renderer/
│   │   └── renderHtml.ts
│   └── diagnostics/
│       └── errors.ts
├── examples/
│   ├── hello-world.amx
│   └── transformer-strategy.amx
└── tests/
    ├── parser.test.ts
    ├── evaluator.test.ts
    └── renderer.test.ts


You may adjust this structure if there is a good reason, but keep the implementation modular.

6. AST Design

Create explicit AST types.

At minimum, support:

type OpenAmxDocument = {
  metadata: Record<string, unknown>;
  nodes: DocumentNode[];
};

type DocumentNode =
  | NarrativeNode
  | VariableDeclarationNode;

type NarrativeNode = {
  type: "narrative";
  content: string;
};

type VariableDeclarationNode = {
  type: "variableDeclaration";
  name: string;
  expression: ExpressionNode;
  source?: SourceLocation;
};


Expression nodes should support:

type ExpressionNode =
  | NumberLiteralNode
  | StringLiteralNode
  | BooleanLiteralNode
  | IdentifierNode
  | BinaryExpressionNode
  | UnaryExpressionNode
  | ConditionalExpressionNode
  | FunctionCallNode
  | ListLiteralNode;


Include source locations if practical:

type SourceLocation = {
  line: number;
  column: number;
};


Source locations are important for useful diagnostics, but they can be basic in v0.1.

7. Parser Requirements

The parser should:

Read the document as text.
Extract front matter if present.
Split content into statements and narrative blocks.
Recognise let declarations.
Parse expressions into AST nodes.
Preserve narrative blocks for rendering.
Preserve source order.

Important: rendered output should follow source order.

Example:

# Example

let a = 10

The value is {{ a }}.


The let declaration should not render as visible narrative, but the paragraph should render after a has been evaluated.

8. Expression Parser

Implement a proper expression parser.

Options:

Recursive descent parser.
Pratt parser.
Parser combinator.
Existing parsing library.

The expression parser must support operator precedence.

Recommended precedence from highest to lowest:

parentheses
function calls
unary: - not
power: ^
multiplication/division/modulo: * / %
addition/subtraction: + -
comparison: == != > >= < <=
logical and
logical or
conditional if/then/else


If using ^, decide whether it is right-associative and document the behaviour.

9. Evaluation Requirements

The evaluator should:

Create an environment/context.
Evaluate variable declarations in document order.
Store evaluated variables in the environment.
Evaluate inline expressions during rendering.
Throw clear errors for undefined variables.
Throw clear errors for invalid operations.
Support basic type checking.

Example error:

AMX1004 Undefined identifier 'opex'
File: strategy.amx
Line: 14
Column: 24


Diagnostics do not need to be perfect in the first prototype, but error messages should be clear.

10. Renderer Requirements

Implement an HTML renderer.

The renderer should:

Render Markdown narrative to HTML.
Replace {{ expression }} placeholders with evaluated values.
Omit let declarations from rendered output.
Preserve the order of narrative blocks.
Include document title metadata if appropriate.

Example source:

# Hello OpenAMX

let assetName = "Transformer TX-001"

The asset is {{ assetName }}.


Expected HTML:

<h1>Hello OpenAMX</h1>
<p>The asset is Transformer TX-001.</p>


A full HTML document is acceptable:

<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hello OpenAMX</title>
</head>
<body>
  ...
</body>
</html>

11. CLI Requirements

Create a CLI entry point.

Proposed commands:

openamx render input.amx --out output.html
openamx validate input.amx
openamx run input.amx


For the first prototype, implement at least:

openamx render input.amx --out output.html


Optional:

openamx run input.amx


Expected run behaviour:

parse the document
evaluate all variables
print evaluated context as JSON

Example:

openamx run examples/transformer-strategy.amx


Output:

{
  "replacementCost": 1250000,
  "annualRiskCost": 85000,
  "projectLife": 25,
  "lifecycleRiskCost": 2125000,
  "totalLifecycleCost": 3375000
}

12. Tests

Create automated tests.

Use a TypeScript-friendly test framework such as Vitest or Jest.

At minimum, include tests for:

Parser tests
Parses front matter.
Parses narrative.
Parses simple let declaration.
Parses arithmetic expression.
Parses inline expression inside narrative.
Evaluator tests
Evaluates numbers.
Evaluates strings.
Evaluates booleans.
Evaluates arithmetic.
Respects operator precedence.
Evaluates variables referencing previous variables.
Throws error for undefined variable.
Evaluates comparison expression.
Evaluates logical expression.
Evaluates conditional expression.
Renderer tests
Renders headings.
Renders paragraphs.
Removes let declarations from visible output.
Replaces inline expressions.
Renders computed arithmetic inline.
Produces stable HTML output.
13. Example Files

Create at least two example .amx files.

examples/hello-world.amx
---
title: Hello OpenAMX
version: 0.1
---

# Hello OpenAMX

let assetName = "Transformer TX-001"
let riskScore = 15

The asset under review is {{ assetName }}.

The calculated risk score is {{ riskScore }}.

examples/transformer-strategy.amx
---
title: Transformer Replacement Strategy
author: Carlos Gamez
version: 0.1
status: draft
---

# Transformer Replacement Strategy

This document evaluates the replacement of Transformer TX-001.

let replacementCost = 1250000
let annualRiskCost = 85000
let projectLife = 25

let lifecycleRiskCost = annualRiskCost * projectLife
let totalLifecycleCost = replacementCost + lifecycleRiskCost

## Result

The lifecycle risk cost is {{ lifecycleRiskCost }}.

The total lifecycle cost is {{ totalLifecycleCost }}.

let riskScore = 18
let priority = if riskScore >= 20 then "High" else "Medium"

The priority classification is {{ priority }}.

14. Documentation

Create basic documentation.

At minimum:

README.md
docs/language-spec-v0.1.md
comments in key parser/evaluator files where helpful

The README should explain:

what OpenAMX is
how to install dependencies
how to run tests
how to render an example
current MVP limitations
15. Implementation Preferences

Prefer simple, maintainable code over clever abstractions.

The prototype should be easy to understand and extend.

Do not prematurely optimise.

Avoid hardcoding Asset Management-specific concepts into the parser. The language core should remain general. Asset Management examples can be included in the examples directory.

16. Acceptance Criteria

The task is complete when all of the following are true:

The project installs successfully with npm install.
The project builds successfully with npm run build.
Tests run successfully with npm test.
The CLI can render examples/hello-world.amx to HTML.
The CLI can render examples/transformer-strategy.amx to HTML.
Inline expressions are correctly evaluated and replaced.
let declarations are not visible in rendered HTML.
Arithmetic expressions respect operator precedence.
Undefined variables produce a clear error.
The README explains how to use the prototype.
17. Suggested Commands

Add package scripts:

{
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "dev": "tsx src/cli.ts",
    "render:hello": "tsx src/cli.ts render examples/hello-world.amx --out examples/hello-world.html",
    "render:transformer": "tsx src/cli.ts render examples/transformer-strategy.amx --out examples/transformer-strategy.html"
  }
}

18. Final Deliverable

Produce a working TypeScript repository implementing the OpenAMX v0.1 prototype.

After implementation, provide:

A summary of what was built.
Any deviations from this prompt.
Known limitations.
Suggested next steps.

---

## Shorter version for a coding agent with limited context window

If your coding agent struggles with long prompts, use this condensed version:

```text
Build a TypeScript prototype for OpenAMX, a plain-text computable document format for Asset Management knowledge.

Implement a minimal `.amx -> parse -> evaluate -> render HTML` pipeline.

An `.amx` file combines Markdown-like narrative with executable `let` declarations and inline computed expressions.

Example:

---
title: Transformer Replacement Strategy
---

# Transformer Replacement Strategy

let replacementCost = 1250000
let annualRiskCost = 85000
let projectLife = 25

let lifecycleRiskCost = annualRiskCost * projectLife
let totalLifecycleCost = replacementCost + lifecycleRiskCost

The lifecycle risk cost is {{ lifecycleRiskCost }}.
The total lifecycle cost is {{ totalLifecycleCost }}.

Required features:
- Read UTF-8 `.amx` files.
- Parse optional YAML-style front matter.
- Parse Markdown-like narrative.
- Parse `let name = expression` declarations.
- Evaluate numbers, strings, booleans, variables, arithmetic, comparisons, logical operators, parentheses, and simple conditionals.
- Replace `{{ expression }}` placeholders in narrative.
- Render to HTML.
- Omit `let` declarations from rendered output.
- Provide CLI: `openamx render input.amx --out output.html`.
- Optional CLI: `openamx run input.amx` to print evaluated context as JSON.
- Include tests for parser, evaluator, and renderer.

Use TypeScript. Keep architecture modular:
src/parser
src/runtime
src/renderer
src/cli.ts
src/ast
src/diagnostics

Do not implement imports, CSV, JSON, Word export, PDF export, units, charts, tables, VS Code extension, or asset management schemas yet. Design so they can be added later.

Acceptance criteria:
- npm install succeeds.
- npm run build succeeds.
- npm test succeeds.
- examples/hello-world.amx renders to HTML.
- examples/transformer-strategy.amx renders to HTML.
- arithmetic respects precedence.
- undefined variables produce clear errors.
- README explains usage and limitations.