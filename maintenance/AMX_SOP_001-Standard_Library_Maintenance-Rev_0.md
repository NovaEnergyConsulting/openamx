# Standard Operating Procedure

## AMX_SOP_001 — Standard Library Maintenance

| Control | Value |
| --- | --- |
| Revision | 0 |
| Owner | OpenAMX project maintainer |
| Status | Initial issue |
| Applies to | Native AMX standard-library functions |

## 1. Purpose

This procedure describes how to add, change, test, document, and maintain native
AMX standard-library functions. Follow it whenever a function is added or its
signature, accepted values, result, errors, or dimensional behavior changes.

## 2. Scope and architecture

In this procedure, the **standard library** means the built-in functions callable
from AMX expressions without an import. At the current revision, the functions
are `sum`, `min`, `max`, `mean`, `round`, `abs`, `sqrt`, and `pow`.

These built-ins have coordinated implementations in:

| Concern | Primary location |
| --- | --- |
| Runtime implementation and runtime validation | [`src/runtime/standardLibrary.ts`](../src/runtime/standardLibrary.ts) |
| Function-call evaluation and measurement-aware behavior | [`src/runtime/evaluateExpression.ts`](../src/runtime/evaluateExpression.ts) |
| Function signatures, inference, and reserved names | [`src/typechecker/checkDocument.ts`](../src/typechecker/checkDocument.ts) |
| Editor completion | [`src/editor/completion.ts`](../src/editor/completion.ts) |
| AMX syntax highlighting | [`vscode-extension/amx.tmGrammar.json`](../vscode-extension/amx.tmGrammar.json) |
| Runtime, static-checking, and integration tests | [`tests/evaluator.test.ts`](../tests/evaluator.test.ts) |
| VS Code completion and grammar tests | [`vscode-extension/src/test/providers.host.ts`](../vscode-extension/src/test/providers.host.ts) |
| Current language contract | [`docs/language-spec-v0.13.md`](../docs/language-spec-v0.13.md), or the latest approved language specification |

The root [`libraries/`](../libraries) directory contains importable AMX modules,
not native built-ins. Adding an exported AMX function to one of those modules is
not the same change: use the module/import procedures and contracts instead.
Do not add a native function to a library module as a substitute for implementing
it in the runtime.

## 3. Procedure

### 3.1 Approve and define the function contract

Before coding, obtain maintainer approval for the function name and behavior.
Record the following in the change description and use the same contract in code,
tests, and documentation:

1. The lowercase function name and AMX call syntax.
2. The number of arguments, including which arguments are optional.
3. Accepted AMX value types and any conversions. Do not rely on incidental
   JavaScript coercion.
4. The result type and behavior for ordinary and boundary inputs.
5. Empty-list, invalid-domain, non-finite-result, and other error behavior.
6. Whether the function accepts measurements; if so, define dimension and unit
   behavior, including the result unit.
7. Whether the function is pure and deterministic. Standard-library functions
   must not add hidden I/O, mutable global state, or environment-dependent
   behavior.
8. Whether the name conflicts with AMX declarations, another built-in, or an
   existing imported/module convention.

Keep existing function behavior backward-compatible unless a separately approved
language change explicitly permits a breaking change.

### 3.2 Inventory the existing registration points

Search the repository for existing built-in names and related tests before
editing. On Windows, run from the repository root:

```powershell
rg -n "sum|min|max|mean|round|abs|sqrt|pow|standardLibrary|stdlibNames|standardFunctions|builtin-functions" src tests vscode-extension docs README.md
```

For the proposed name, search that name as well. Check every relevant result;
the function list is currently repeated in the runtime dispatch, checker,
completion provider, and TextMate grammar. Do not assume adding a runtime `case`
registers the function throughout OpenAMX.

### 3.3 Implement runtime behavior

1. Add the function to `evaluateStandardLibraryCall` in
   [`src/runtime/standardLibrary.ts`](../src/runtime/standardLibrary.ts).
2. Validate argument count and values before computing. Reuse `ensureArgCount`,
   `ensureMinArgCount`, `ensureList`, and `ensureNumber` only when their defined
   behavior matches the approved contract.
3. Throw an `AmxError` with the original source location and file when reporting
   a runtime error. Preserve the established `AMX200x` error meanings; do not
   reuse an existing code for a different condition. If a new diagnostic code
   is necessary, coordinate its allocation and documentation with the
   maintainer.
4. Handle empty collections, invalid domains, overflow, and non-finite results
   deliberately. Do not return a success-shaped fallback for invalid input.
5. Keep the implementation deterministic and free of unrelated side effects.

The generic expression-call path in
[`src/runtime/evaluateExpression.ts`](../src/runtime/evaluateExpression.ts)
delegates to `evaluateStandardLibraryCall`. Inspect `evalFunctionCall` before
changing it: measurement lists and measurement arguments have special handling
there. If the new function supports measurements, add the appropriate
measurement-aware evaluation and validation there as well as in the static
checker. If it does not support measurements, ensure the checker rejects them
instead of letting an unintended runtime path accept them.

### 3.4 Register static typing and name rules

In [`src/typechecker/checkDocument.ts`](../src/typechecker/checkDocument.ts):

1. Add the name and arity to `signatures`. The checker uses this metadata to
   recognize a built-in and validate argument count; inspect the call-inference
   branch to determine where accepted argument types and result types are
   actually enforced.
2. Add the name to `stdlibNames`. This set is used when resolving names and
   preventing declarations from shadowing built-ins.
3. Implement or extend the function-call inference branch for the new
   function's accepted argument types, result type, and static domain checks.
   Follow the existing behavior for list aggregations and numeric functions;
   do not infer a result type from the runtime implementation alone.
4. If the function has dimension-specific rules, validate those at check time
   where possible and return the correct measurement type. Match runtime
   behavior and use the project's existing diagnostics for type or
   measurement-domain errors.
5. Check other function-specific checker logic, such as constant-expression or
   dimensional `pow` handling, and update it only if the new function requires
   equivalent treatment.

Keep the function's registration consistent between `signatures` and
`stdlibNames`, and verify that user-defined declarations with that name are
rejected according to the existing reserved-name rules.

### 3.5 Update editor support

1. Add the function name to `standardFunctions` in
   [`src/editor/completion.ts`](../src/editor/completion.ts). This source list
   feeds the editor's function completion facts.
2. Add the name to the built-in function alternative in
   [`vscode-extension/amx.tmGrammar.json`](../vscode-extension/amx.tmGrammar.json)
   so calls receive the built-in syntax-highlighting scope.
3. Extend
   [`vscode-extension/src/test/providers.host.ts`](../vscode-extension/src/test/providers.host.ts)
   to assert that completion offers the new function in an executable AMX
   block, does not offer it in narrative Markdown, and that the grammar
   classifies its call as a built-in where the existing grammar tests cover
   tokenization.

Do not change completion or highlighting behavior outside AMX executable
contexts.

### 3.6 Document and demonstrate the public contract

Update the latest approved language specification with the function's syntax,
signature, accepted inputs, result, boundary behavior, errors, and measurement
semantics (if applicable). The v0.13 specification is the current specification
at this SOP revision; when a later approved specification exists, use that
document or an approved additive language-contract document instead.

Do not rewrite historical specifications to make them appear to have included
a later function. Add a small executable example where it helps users
understand the behavior. Keep the example consistent with tests and the
approved contract.

### 3.7 Add tests

Extend [`tests/evaluator.test.ts`](../tests/evaluator.test.ts) with executable
AMX-level tests covering all applicable cases:

- A representative successful call and its exact result.
- Minimum, maximum, and optional argument counts.
- Accepted and rejected types, including static-checker behavior.
- Boundary and error cases, asserting the expected AMX diagnostic code and
  source location where relevant.
- List input, if applicable, including a value stored in a variable and empty
  lists when the contract permits them.
- Measurement values, compatible and incompatible dimensions, and result-unit
  behavior when measurements are supported.
- Use within a larger expression or document so parser, type checker,
  evaluator, and rendering entry points continue to work together.

Add or update editor completion and grammar assertions in the VS Code extension
host tests as described in Section 3.5. Keep tests deterministic; do not use
snapshot-only coverage where a direct result or diagnostic assertion is
possible.

### 3.8 Validate the change

Run these commands from the repository root:

```powershell
bun test tests/evaluator.test.ts
bun run build
bun test
```

If editor completion or the TextMate grammar changed, also run the VS Code
extension tests from its directory:

```powershell
Set-Location vscode-extension
bun run test
```

Resolve failures caused by the change before submitting it. Do not suppress a
failing test or weaken an existing assertion to make the change pass. Report
unrelated baseline failures separately with their command and output.

### 3.9 Review and release

Before requesting review, confirm that:

- Runtime behavior, static inference, and documented behavior agree.
- The built-in name is registered at each applicable call site.
- Existing function names cannot be shadowed accidentally.
- Measurement handling and error locations are correct, if applicable.
- Tests cover both success and failure behavior.
- Root build and tests pass; extension tests pass when extension files changed.
- No historical language contract or unrelated AMX library module was changed
  unnecessarily.

Include the function's contract, implementation locations, tests run, and any
compatibility or diagnostic-code changes in the pull request description.
Release notes or versioning are governed by the project's normal release
process; adding a function does not itself authorize a new language-version
claim.

## 4. Maintenance rule

When modifying an existing built-in, use the same procedure as for a new
function. Treat its name, accepted arguments, result, diagnostics, dimensional
behavior, and documented examples as a public language contract. Make
compatibility decisions explicitly, and update the runtime, checker, editor,
tests, and current documentation together wherever each surface applies.
