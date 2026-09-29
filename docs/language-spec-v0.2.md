# OpenAMX Language Specification V0.2

V0.2 defines a breaking source-format change. This document is the authoritative language contract for V0.2. The V0.1 reference remains at `.agents/language-spec-v0.1.md`.

## 1. Document Model

An OpenAMX document is UTF-8 text containing optional YAML front matter, Markdown narrative, and explicitly fenced executable blocks. Front matter is metadata, not executable source. Narrative and executable blocks remain in document source order.

Only a backtick fence whose trimmed info string is exactly the case-sensitive string `amx` is executable. A declaration-looking line anywhere else is narrative, including a V0.1 bare `let` line, ordinary fenced code, and text inside tilde fences. Inline `{{ expression }}` is a separate narrative interpolation form; it does not open an executable block.

```amx
let replacementCost = 1250000
```

## 2. Fence Syntax

An executable opener consists of zero to three leading ASCII spaces, at least three consecutive backticks, and an info string which, after trimming surrounding whitespace, equals `amx`. The opener occupies its own line. For example, ````   ```  amx   ```` is executable; ` ```AMX ` and ` ```amx demo ` are not.

The closing line has zero to three leading spaces, at least as many consecutive backticks as the opener, and only whitespace after the backticks. A shorter run, a tilde run, or a line with trailing non-whitespace text does not close the block. The first matching closing line ends the block.

Other Markdown fences, including backtick fences with other labels and all tilde fences, are non-executable. Their contents are opaque to executable-fence detection, so an `amx`-looking line nested inside one does not start a block. An unclosed ordinary Markdown fence remains narrative. An unclosed executable `amx` fence is a parse error at its opening fence.

## 3. Source Locations

Source locations use 1-based line and column coordinates in the original document. Coordinates include front matter, fence delimiters, and all preceding narrative. Columns count UTF-16 code units, matching TypeScript and VS Code editor positions. An executable-block node points to its opening fence; a statement points to the first non-whitespace character of its source line. Parse errors identify the corresponding original-document location.

## 4. Separators and Layout

Newlines are the only separators between statements and between `match` arms. A semicolon is not a statement or arm separator and is invalid between adjacent constructs. A statement occupies one logical line unless it is a braced construct. Braced `for` bodies and `match` expressions may span lines. Expressions outside braced constructs do not implicitly continue across a newline.

## 5. V0.2 Grammar

The following grammar describes the committed V0.2 surface. `Expression` includes the V0.1 literals, identifiers, lists, function calls, parentheses, unary and binary operators, and single-line conditional expressions, together with the V0.2 range and match forms below. This grammar specifies later-sprint features as well as Sprint 007's declaration subset.

```text
Document          ::= FrontMatter? DocumentPart*
DocumentPart      ::= Narrative | ExecutableBlock
ExecutableBlock   ::= AmxOpener NewLine Statement* AmxCloser

Statement         ::= Declaration NewLine
                    | Assignment NewLine
                    | CompoundAssignment NewLine
                    | ForStatement
LoopBodyStatement ::= Declaration NewLine
                    | Assignment NewLine
                    | CompoundAssignment NewLine

Declaration       ::= "let" Identifier "=" Expression
Assignment        ::= Identifier "=" Expression
CompoundAssignment ::= Identifier "+=" Expression
ForStatement      ::= "for" Identifier "in" Expression "{" NewLine LoopBodyStatement* "}"
ForExpression     ::= "for" Identifier "in" Expression "{" NewLine
                      LoopBodyStatement* ReturnStatement LoopBodyStatement* "}"
ReturnStatement   ::= "return" Expression NewLine

Expression        ::= ForExpression
                    | Conditional
Conditional       ::= "if" Expression "then" Expression "else" Expression
                    | MatchExpression
                    | LogicalExpression
MatchExpression  ::= "match" Expression "{" NewLine MatchArm* "}"
MatchArm          ::= "case" MatchLiteral "=>" Expression NewLine
                    | "default" "=>" Expression NewLine
MatchLiteral      ::= NumberLiteral | "-" NumberLiteral | StringLiteral | BooleanLiteral

RangeExpression  ::= "[" Expression "to" Expression "]"
ListLiteral       ::= "[" (Expression ("," Expression)*)? "]"
Identifier        ::= Letter (Letter | Digit | "_")*
```

The grammar is intentionally conceptual around expression precedence and lexical details; those retain the V0.1 contract except where explicitly extended here. A newline within braces separates statements or match arms. It does not make an ordinary expression multiline. `ForStatement` is selected in statement context and has no return. `ForExpression` is selected anywhere an expression is accepted and has exactly one `ReturnStatement`; its return value is collected once per iteration, later body statements still execute, and an empty iterable produces `[]`. Loop bodies do not contain nested `for` statements.

## 6. Expression Operators

V0.1 expression forms remain supported: number, string and boolean literals; case-sensitive identifiers; list literals; function calls; parentheses; unary `-` and `not`; arithmetic `+`, `-`, `*`, `/`, `%`, `^`; comparisons `==`, `!=`, `>`, `>=`, `<`, `<=`; logical `and` and `or`; and `if ... then ... else ...` conditional expressions. Power `^` is right-associative. Existing V0.1 precedence is retained: grouping and calls, unary, power, multiplication/division/remainder, addition/subtraction, comparisons, `and`, `or`, then conditional expressions.

The inclusive integer range form is `[start to end]`. It yields each integer from `start` through `end`, ascending or descending with an implicit step of one. It is distinct from an explicit list literal such as `[1, 2, 3]`.

## 7. Bindings and Loops

Bindings are mutable. `let name = expression` creates a binding, and a repeated `let` updates an existing binding. `name = expression` replaces an existing binding; `name += expression` adds to an existing binding. References and assignments to undeclared identifiers are errors.

`for item in values { ... }` iterates over a list or range. In statement position, the loop body contains no `return` and the loop produces no value. In expression position, the loop body contains exactly one `return expression`; that expression is evaluated and collected once per iteration into a list, including when ordinary body statements follow the return. The return contributes a value but is not an early exit from the body or loop. An expression loop over empty input produces `[]`. The iteration variable is scoped to its loop and shadows/restores an existing binding of the same name; other declarations and mutations use the current shared environment and remain after the loop. A loop variable is rebound to the next iterable value at the start of each iteration. A `return` outside an expression-form loop is invalid. Nested loops, `break`, and `continue` are not part of V0.2.

## 8. Match Expressions

`match expression { ... }` is a value expression usable wherever an ordinary expression is accepted. Each arm occupies one line and has the form `case <number|string|boolean literal> => <expression>` or `default => <expression>`. A numeric case may have a leading unary minus. Exactly one `default` arm is required and it may appear anywhere among the arms; zero or more `case` arms are allowed, so a default-only match is valid. The scrutinee is evaluated once. Case values are compared using strict type-and-value equality with no coercion, in source order; the first matching case is selected, even if a later case repeats the same literal. Only the selected branch expression is evaluated. The default expression is evaluated only when no case matches. Guards, destructuring, and richer patterns are not part of V0.2.

Malformed arms, non-literal cases, and missing or duplicate defaults are parse errors at the relevant original-document match or arm location. The fallback is selected only after all case literals have been considered, regardless of its position among the arms.

## 9. Inline Interpolation and Execution

`{{ expression }}` remains distinct from executable blocks and is retained as narrative by the parser. It does not make surrounding text or a Markdown fence executable. The V0.2 execution/rendering pipeline evaluates executable blocks in source order with one shared document environment. All blocks execute exactly once before narrative rendering begins; inline expressions resolve against the final environment after all executable blocks run, including mutations in later blocks. Executable source is formatted and displayed in the rendered HTML in its original document position, separately from narrative Markdown and without interpolation.

## 10. Canonical Formatting and HTML Rendering

The formatter operates only on executable-block content, excluding fence delimiters and surrounding Markdown. It normalizes line endings to LF, removes leading/trailing blank lines and trailing horizontal whitespace, preserves blank lines between statements, and uses zero top-level indentation with two spaces per open braced `for`/`match` body. Opening braces stay on their header line; closing braces dedent before output. It preserves all non-whitespace token/text content within each logical line (including expression spelling, strings, and match-arm order) rather than rewriting expressions. Nonempty output ends in exactly one LF; empty input remains empty. Formatting is deterministic, idempotent, and must produce valid V0.2 source.

The HTML renderer preserves narrative Markdown rendering and emits each executable block at its source position as an escaped code element (for example, `<pre><code class="language-amx">…</code></pre>`). It displays formatted block content without fence delimiters, HTML-escaping markup-significant characters so source is displayed only as text. Interpolated values are HTML-escaped before narrative Markdown rendering so a computed string cannot inject markup. Executable content is not interpreted as HTML or interpolated as narrative. Output remains a complete standalone HTML document and uses front matter `title` as its document title when present.

## 11. VS Code Support

V0.2 provides an optional VS Code extension for `.amx` documents. It uses direct VS Code API providers in the Node-based extension host and reuses the core parser and canonical formatter. The extension formats only executable `amx` block contents, offers basic completion for language keywords, standard-library functions, and source-order-visible variables (including the active loop iterator), and reports parser-only diagnostics at document source locations. Ordinary Markdown and bare V0.1 declarations are not treated as executable code by these providers. The extension engine floor is VS Code 1.85.0 (`^1.85.0`). It can be developed and installed locally from a packaged VSIX; Marketplace publication is not required by V0.2.

## 12. V0.1 Migration

V0.2 is a breaking change. Bare V0.1 declarations are no longer executable and remain ordinary narrative. Move declarations into an `amx` fence:

```markdown
let annualRiskCost = 85000
```

becomes:

```amx
let annualRiskCost = 85000
```

There is no legacy mode that executes bare declarations. Ordinary Markdown code fences remain non-executable. Existing inline `{{ expression }}` syntax remains supported as a separate feature.

## 13. Implementation Boundaries and Non-Goals

Sprint 007 established the contract and parses declaration statements inside executable `amx` blocks. Sprint 008 implements mutation, ranges, and loops; Sprint 009 implements `match` parsing/evaluation. Sprint 010 integrates document-wide executable-block evaluation, formatting, rendering, and final-environment interpolation. Sprint 011 provides the optional VS Code extension.

V0.2 does not add imports, units, currency, charts, tables, Asset Management domain libraries, domain-specific types, V0.3 candidates, or a parser framework. The core remains general-purpose and uses the existing TypeScript hand-written parser.