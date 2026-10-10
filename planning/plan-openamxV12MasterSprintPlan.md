# Plan: OpenAMX V0.12 Core AMX Language Features

Confirmed planning scope. This plan defines required behavior, not implemented or verified functionality. V0.12 is a focused core-language version covering the three capabilities in the [language feature ideas](./ideas/amx-language-features-2.md): record inheritance, enumerations, and braced `if` expressions/statements. Preserve existing behavior outside these additions.

Continue sprint numbering after V0.11 Sprint 071, beginning with Sprint 072. Publication of this plan does not authorize feature implementation or release.

## Recommended Approach

- Extend the existing parser, AST, type checker, runtime, formatter, and module handling. Preserve source-order visibility, imports/exports, diagnostics, and type checking except where this contract explicitly extends them.
- Keep record inheritance as property reuse, not parent-type assignability. This allows the approved type-changing override while avoiding unsound values at parent-typed use sites.
- Represent enum access as its underlying primitive value; do not add a separate nominal enum type.
- Implement block-form `if` as both an expression and a control-flow statement. Preserve the legacy expression form, give expression-block returns a local value-producing role, and keep branch-local declarations from leaking.
- Keep both editor clients consistent through their existing language capabilities. Extend the existing test/build infrastructure rather than adding parallel tooling.
- If implementation feasibility appears to require changing one of the confirmed behavior contracts, stop for a product decision rather than silently weakening it.

## Confirmed Feature Scope

### Record Inheritance

- Support declarations such as `type Asset extends Identifier,Namer { ... }`, with one or more record parents. A child receives the effective fields of its parents, including fields those parents inherited.
- Inheritance reuses properties only; it does not make a child assignable to a parent. Parent and child record types remain distinct for type checking.
- Any duplicate inherited property name requires an explicit child `override`, including same-type duplicates from multiple parents. A child redeclaration of any inherited property also requires `override`.
- `override` is valid only when a parent supplies that property. It may replace the inherited type, optionality, and default behavior; the child's declaration defines the complete field contract.
- Parent references follow existing visibility, source-order, and import/export rules. Reject unknown, forward, non-record, and cyclic parent references with source-located diagnostics.
- Constructing a child record uses its complete effective property set and existing required/optional/default validation behavior.

### Enumerations

- Support declarations such as:

  ```amx
  enum Status = {
      DRAFT,
      ACTIVE,
      CLOSED
  }
  ```

- When no member has an explicit value, assign numeric values starting at `1` in declaration order.
- If any member has an explicit value, every member must have a literal value and all values in that enum must be the same primitive type: all `String` or all `Number`. Constant expressions are not accepted as enum values.
- Member names and values must be unique. The idea example that assigns `2` to two numeric members must be corrected to unique values.
- Access such as `Status.ACTIVE` evaluates to its underlying primitive `String` or `Number`; enum declarations do not add a distinct nominal type.
- Enum declarations and references follow existing module visibility and source-order rules.

### Braced `if` Expressions and Statements

- Preserve the existing expression form `if condition then value else value`.
- Add braced `if` expressions with statement blocks. An expression requires an `else`, and every path in each value-producing branch must end in an explicit `return expression`. That return supplies the `if` expression's value; it does not return from an enclosing context.
- Add standalone braced `if` statements for control flow. Their `else` block is optional. Bodies accept existing executable statement forms subject to their current context restrictions.
- Conditions remain Boolean-checked. Expression branches use the existing conditional-expression type-compatibility rules, and evaluation executes only the selected branch.
- `let` declarations inside a branch are block-local and unavailable outside the block. Assignments to existing outer bindings remain visible after the branch executes.
- Reject expression blocks if any possible path fails to return a value.

### Supporting Work and Explicit Exclusions

- Update both VS Code and desktop editor behavior across existing affected language features, including syntax highlighting, formatting, diagnostics, completion, symbols/navigation, and related analysis where already supported.
- Update the V0.12 language specification, examples, and relevant editor help. These are additive language changes; no migration guide is required.
- Do not add record subtyping, methods/traits, a general scope redesign, enum aliases/flags, mixed-type enums, implicit values in partially explicit enums, expression-valued enum members, new loop semantics, unrelated language features, reporting/desktop features, or release engineering.

## Sprint Sequence

### Sprint 072: V0.12 Language Contract and Acceptance Fixtures

- Translate the confirmed semantics into grammar examples, a diagnostic matrix, and requirement-to-test fixtures before implementation.
- Lock source locations, module behavior, formatter expectations, valid/invalid inheritance and enum cases, and `if` return-path rules.
- Any proposed change that weakens or alters the agreed contract requires a product decision.

### Sprint 073: Record Inheritance (depends on Sprint 072)

- Implement parent resolution, inherited field composition, and strict `override` validation.
- Ensure child construction and existing record validation operate on the child's effective fields.
- Cover multiple and transitive parents, collisions, invalid overrides, changed override types, optional/default replacement, modules, and child-to-parent assignment rejection.

### Sprint 074: Enumerations (depends on Sprint 072)

- Implement enum declarations, member access, implicit numbering, explicit literal validation, uniqueness checks, and module behavior.
- Cover empty/duplicate names, duplicate values, mixed types, missing values in partially explicit enums, expression-valued members, and primitive runtime values.

### Sprint 075: Braced `if` Expressions and Statements (depends on Sprint 072)

- Implement braced expression and statement forms, block parsing, branch scoping, statement execution, and value-returning expression paths.
- Verify every expression path returns, expression `else` is required, statement `else` is optional, and return does not escape the conditional expression.
- Preserve and regression-test the existing single-line conditional expression.

### Sprint 076: Editor and Language Documentation Integration (depends on Sprints 073, 074, and 075)

- Update both editor clients and existing language tooling for the new declarations and control-flow syntax.
- Add examples and publish the V0.12 language specification.
- Verify formatter idempotence, useful diagnostics/source ranges, highlighting, and existing completion/navigation/outline behavior where applicable.

### Sprint 077: Integrated Acceptance and V0.12 Closeout (depends on Sprint 076)

- Complete cross-surface feature and regression acceptance across the core language, VS Code extension, and desktop editor.
- Run focused checks followed by integrated root, extension, and desktop validation. Record exact results, unavailable checks, and residuals.
- Closeout adds no product scope and does not itself authorize publication.

Sprints 073–075 all depend on Sprint 072. Although their feature contracts are independent, they share parser and type-checker surfaces, so sequence integration deliberately. Sprint 076 depends on all three feature sprints; Sprint 077 depends on feature and editor/documentation work.

## Relevant Files

- [AST types](../src/ast/types.ts), [statement parser](../src/parser/parseStatements.ts), [expression parser](../src/parser/parseExpression.ts), [loop parser](../src/parser/parseFor.ts), and [document parser](../src/parser/parseDocument.ts).
- [Type checker](../src/typechecker/checkDocument.ts), [declaration registry](../src/typechecker/declarationRegistry.ts), [document evaluator](../src/runtime/evaluateDocument.ts), [expression evaluator](../src/runtime/evaluateExpression.ts), and [formatter](../src/formatter/formatAmx.ts).
- Shared editor services: [highlighting](../src/editor/highlighting.ts), [completion](../src/editor/completion.ts), [symbols](../src/editor/symbols.ts), and related analysis/refactoring modules.
- VS Code grammar at `vscode-extension/amx.tmGrammar.json`, existing providers, and VS Code host tests.
- Desktop CodeMirror editor and existing desktop editor/UI tests.
- [Parser tests](../tests/parser.test.ts), [evaluator tests](../tests/evaluator.test.ts), [formatter tests](../tests/formatter.test.ts), [editor tests](../tests/editor.test.ts), and [module tests](../tests/modules.test.ts).
- New [V0.12 language specification](../docs/language-spec-v0.12.md), relevant examples, and editor help content.

## Verification

1. Test parser acceptance/rejection and source locations for each new grammar form. Verify formatting preserves meaning and is idempotent.
2. For records, cover single/multiple/transitive parents, imported parents, optional/default fields, inherited collisions, missing/unnecessary/valid overrides, changed override types, complete construction, and rejection of child-to-parent assignment.
3. For enums, cover implicit values starting at `1`; explicit homogeneous string and number literals; unique member names/values; rejection of duplicate values, mixed types, partial assignments, and expressions; primitive member results; and module visibility.
4. For `if`, cover unchanged legacy expressions; braced expression branches with returns on all paths; missing return paths; required expression `else`; optional statement `else`; branch-local declarations; persistent outer assignments; nested branches; Boolean/type diagnostics; selected-branch-only evaluation; and non-escaping expression returns.
5. Verify matching syntax support in VS Code and desktop, including highlighting, formatting, diagnostics, completion, symbols/navigation, and related existing analysis. Add integration coverage for each supported capability.
6. Run focused root tests for parser, evaluator/type checking, formatter, editor, and modules, then the root build and test suite. Run the VS Code extension host tests and desktop RPC tests, typecheck, web build, and relevant editor UI tests using existing project scripts.
7. Record exact validation results and any unavailable checks. A successful build alone is not sufficient evidence for language semantics or editor behavior.

This plan does not claim implementation, build, test completion, or release readiness.
