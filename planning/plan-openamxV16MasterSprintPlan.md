# OpenAMX V0.16 Master Sprint Plan

## Problem and Proposed Approach

OpenAMX functions currently use expression bodies, such as
`fn triple(value: Number): Number = value * 3`. This is concise and should
remain fully supported, but it does not provide a direct way to organize
multi-step calculations with local values and statement-level control flow.

V0.16 will add brace-delimited function bodies containing multiple statements,
including local declarations, conditionals, loops, assignments, list
operations, and explicit returns. Every reachable path must return a value
compatible with the declared return type. A return inside a nested conditional
or loop exits the function call. Function locals remain confined to the call,
and list arguments use isolated value semantics so mutations cannot affect
caller-owned lists.

The version will carry the feature through the AST, parser, runtime,
type-checker, formatter, documentation, examples, and both editor surfaces.
The V0.16 contract sprint will turn path analysis and list-copy behavior into
executable cases before implementation begins. The sprint sequence continues
at 095, following V0.15 Sprints 090-094.

This plan records the proposed and confirmed V0.16 scope. It does not
authorize implementation, release, or publication.

## Confirmed Product Decisions

- **Function syntax:** Preserve `fn name(...): Type = expression`; add
  `fn name(...): Type { statements }`.
- **Return behavior:** A `return` in a braced function exits the function,
  including when nested in an if or loop. Every reachable path must return a
  type-compatible value.
- **Function locals:** Use lexical block scope. Local bindings do not escape
  the function call, and assignment to parameters or locals does not change
  caller bindings.
- **List arguments:** Give each list parameter a deep, independent local copy,
  including nested lists and repeated arguments. Mutations to that copy do not
  affect the caller's list.
- **List results:** Local lists may be mutated and returned; the returned list
  is the function result, consistent with the existing expression-body model.
- **Function-body statements:** Support local declarations, assignment,
  if/else, statement-form loops, return, and list mutation. Exclude
  module/document declarations and output actions.
- **Compatibility:** Preserve existing visibility and declaration-order
  behavior. Do not add recursion, forward-reference, or closure capabilities.
- **Authoring support:** Update the language spec and runnable examples, plus
  formatter, highlighting, completion, navigation, and relevant diagnostics
  in VS Code and desktop.
- **Sprint numbering:** Begin V0.16 with Sprint 095.

## Recommended Approach

- Begin with an executable contract covering both declaration forms, return
  flow, local scope, list copies, diagnostics, and backward compatibility.
  Resolve any edge case the existing statement or type model cannot prove
  before implementation rather than silently broadening behavior.
- Represent expression and statement bodies explicitly in the function AST.
  Keep expression parsing on the existing path and parse braced bodies using
  established statement parsing and source-location conventions.
- Reuse isolated function call frames and existing lexical-scope mechanisms.
  Use explicit return propagation that exits the function from nested control
  flow; retain a defensive runtime failure for unexpected fallthrough.
- Analyze return completeness statically. An if without an else and a loop
  that may execute zero times are potential fallthrough paths unless later
  statements ensure a return.
- Keep parser, runtime, and type-checker contracts focused on functions.
  Preserve existing module/import/export behavior and unrelated language
  constructs.
- Extend shared editor facts and their host integrations rather than
  duplicating language semantics. Test the VS Code TextMate grammar and the
  desktop CodeMirror experience alongside shared parser-derived facts.
- Add a versioned language specification and concise examples demonstrating
  both function forms, all-path returns, local scope, and list value behavior.
  Existing expression-bodied examples remain valid.

## Confirmed Scope

### Function Syntax and Runtime

- Parse and evaluate braced multi-statement function bodies while retaining
  the current expression-bodied syntax and behavior.
- Permit the confirmed function-safe statement forms: local declarations,
  assignment, if/else, statement-form loops, return, and list mutation.
- Require a compatible return value on every reachable path. Returns nested
  in conditionals or loops terminate the function call.
- Keep function locals within their lexical scope and discard the call frame
  after completion. Parameters are local values, not writable aliases to
  caller bindings.
- Copy list arguments recursively and independently for each parameter.
  Local lists and copied list arguments may be mutated inside the function;
  the returned list, when present, is the function result.
- Exclude module/document declarations and output actions from function
  bodies. Do not add closures, recursion, or new declaration visibility rules.

### Static Checking, Formatting, and Editor Support

- Type-check every explicit return against the declared return type and
  diagnose missing, incomplete, or incompatible return paths at source-grounded
  locations.
- Format braced function bodies consistently and idempotently without
  changing expression spelling or the existing expression-body format.
- Update shared syntax highlighting, completion, navigation, and diagnostic
  facts for parameters, local bindings, and function bodies.
- Update VS Code syntax grammar/providers and desktop CodeMirror integration;
  cover both surfaces with focused host/UI tests.

### Specification, Examples, and Acceptance

- Add `docs/language-spec-v0.16.md` as the versioned contract for this feature.
- Add runnable examples for expression and braced function forms, nested
  control flow, complete and incomplete return paths, local scope, and list
  argument/result behavior.
- Update relevant README and desktop help references so authors can find the
  new syntax and examples.
- Verify parser, runtime, type checker, formatter, editor, modules, and
  examples together; preserve existing behavior outside the approved scope.

## Explicit Exclusions

- Recursion, forward-reference, closure, or function visibility redesign.
- New general-purpose statement or expression features unrelated to braced
  function bodies.
- Module/document declarations, output actions, or other document-level
  effects inside functions.
- Broad editor redesign, new editor capabilities beyond the confirmed
  formatter/highlighting/completion/navigation/diagnostic work, or changes to
  unrelated rendering/export behavior.
- Release engineering, version publication, certification claims, or changes
  to historical sprint records/status.

## Sprint Sequence

Continue after V0.15 Sprint 094, beginning with Sprint 095.

### Sprint 095: Function Body Contract and Technical Gate

- Specify both function declaration forms, allowed statements, return
  propagation, type compatibility, lexical locals, list argument/result
  behavior, diagnostics, and compatibility boundaries.
- Define executable cases for complete and incomplete branches, statements
  after returns, returns inside loops, fallthrough, and nested/repeated list
  arguments.
- Resolve path-sensitive return analysis and recursive list-copy behavior
  before implementation; record any remaining contract limitations explicitly.

### Sprint 096: Function AST and Parser (depends on Sprint 095)

- Extend the function AST to represent either an expression body or a
  statement body without changing existing expression-body parsing.
- Parse braced bodies using existing statement parsing, with correct source
  locations and function return context.
- Reject malformed/unclosed bodies and function-body declarations/actions
  outside the approved statement contract.
- Add parser tests for both forms, nested braces and strings, invalid syntax,
  and source-location behavior.

### Sprint 097: Function Runtime and List Value Semantics (depends on Sprint 096)

- Evaluate statement bodies in isolated call frames and propagate returns
  from nested if/loop statements to the function call.
- Preserve lexical local lifetime and prevent assignment or list mutation
  from changing caller-owned bindings or lists.
- Deep-copy list arguments independently per parameter, including nested
  lists; return list results to the caller as the call result.
- Add runtime tests for nested returns, local mutation, argument isolation,
  repeated arguments, and returned lists.

### Sprint 098: Return-Path and Type Checking (depends on Sprint 096; parallel with Sprint 097)

- Validate explicit return expressions against the function's declared type.
- Prove all reachable function paths return. Account for absent else branches,
  loops that can execute zero times, and later statements after conditional
  paths.
- Emit stable, source-accurate diagnostics for invalid return types and
  missing return paths; keep runtime fallthrough failure as a defensive guard.
- Add focused positive and negative type-check tests for each control-flow
  shape in the approved contract.

### Sprint 099: Formatter and Editor Integration (depends on Sprints 096 and 098)

- Format braced functions idempotently and preserve the established formatting
  behavior of expression-bodied functions.
- Extend shared editor facts for highlighting, parameter/local completion,
  navigation, and syntax/type diagnostics in function bodies.
- Update the VS Code TextMate grammar and providers, and the desktop CodeMirror
  editor integration, with focused host/UI tests.

### Sprint 100: Language Specification and Examples (depends on Sprints 095 and 096)

- Create the V0.16 language specification and runnable examples after the
  syntax contract is stable; validate their behavior after Sprints 097 and 098.
- Demonstrate both function forms, nested control flow, required returns,
  local bindings, list copying/mutation, and returned lists.
- Update relevant README and desktop help references; keep old examples and
  expression-bodied programs valid.

### Sprint 101: Integrated Acceptance and V0.16 Closeout (depends on Sprints 097-100)

- Run focused parser, evaluator, type-checker, formatter, editor, module, and
  example tests, followed by the applicable repository verification gate.
- Verify expression-body compatibility, braced-body return/type behavior,
  lexical scope, list isolation, formatter stability, and both editor surfaces.
- Record exact evidence, unavailable checks, platform limitations, and
  residuals. Closeout adds no product feature scope.

## Relevant Files and Surfaces

- `src/ast/types.ts` — `FunctionDeclarationNode` currently stores an
  expression body.
- `src/parser/parseStatements.ts`, `src/parser/parseIf.ts`, and
  `src/parser/parseFor.ts` — function parsing, statement parsing, and existing
  braced control-flow behavior.
- `src/runtime/evaluateExpression.ts` and `src/runtime/environment.ts` —
  function calls, return handling, scoped statements, and isolated call frames.
- `src/typechecker/checkDocument.ts` — function declaration checking and
  return/type analysis.
- `src/formatter/formatAmx.ts`, `tests/parser.test.ts`,
  `tests/evaluator.test.ts`, `tests/formatter.test.ts`, and focused type-check
  tests — parser/runtime/formatting acceptance.
- `src/editor/highlighting.ts`, `src/editor/completion.ts`,
  `src/editor/symbols.ts`, `src/editor/sourceRanges.ts`, and
  `tests/editor.test.ts` — shared editor facts and source mapping.
- `vscode-extension/amx.tmGrammar.json`, `vscode-extension/src/providers/`,
  and `vscode-extension/src/test/providers.host.ts` — VS Code grammar,
  providers, and host tests.
- `desktop-app/src/mainview/CodeEditor.vue` and `desktop-app/tests/ui/` —
  desktop editor integration and UI acceptance.
- `docs/language-spec-v0.16.md`, `examples/`, `README.md`, and desktop help
  content — authoring contract, runnable examples, and discoverability.
- Any additional files identified by tracing affected parser, checker,
  runtime, formatter, or editor contracts during Sprint 095/096.

## Verification

- Both function forms parse and execute; parser tests cover malformed and
  unclosed bodies, nested braces/strings, and original source locations.
- Runtime tests prove nested returns exit the function, locals do not escape,
  list argument copies are deep and independent, local mutations are isolated,
  and returned lists reach the caller.
- Type-check tests cover compatible and incompatible returns, missing else
  branches, partial returns, loops that may not execute, and fallthrough.
- Formatter and editor tests cover idempotent formatting, highlighting,
  parameter/local completion, navigation, and source-accurate diagnostics in
  shared services, VS Code, and desktop.
- Runnable examples and module export/import tests cover both syntax forms;
  existing expression-bodied functions remain compatible.
- Record the focused and repository-wide test results and any residual or
  platform limitation without making unsupported certification claims.