# Sprint 098 Requirements: V0.16 Return-Path and Type Checking

## Document Status and Entry Gate

Architect-prepared Sprint 098 documentation. Sprint 096 is
`ACCEPTED/CLOSED WITH RECORDED RESIDUALS` (2026-10-24), and Sprint 097 is
`ACCEPTED/CLOSED WITH RECORDED RESIDUALS` (2026-10-24). Their accepted AST,
parser, runtime, diagnostics, and test evidence are the implementation
baseline.

Sprint 098 depends on Sprint 096 and may proceed in parallel with Sprint 097
under the V0.16 master plan; both prerequisite sprints are now accepted. This
document authorizes planning only. Obtain separate explicit Sprint 098
execution authorization and approval of the concrete file-by-file
implementation/evidence plan before editing source or tests.

## Goal

Statically type-check every explicit return in a braced function body against
its declared return type and prove that every reachable function path returns
a compatible value. Emit the accepted, source-grounded missing-return
diagnostic without changing the existing braced-if-expression diagnostic or
the expression-loop return model.

Sprint 098 is type-checker work. It does not implement parser/runtime
behavior, formatting, editor support, user documentation/examples, release,
or publication.

## Authority and Inputs

- Scope and sequence:
  [`plan-openamxV16MasterSprintPlan.md`](../../plan-openamxV16MasterSprintPlan.md),
  Sprint 098.
- Normative V0.16 behavior:
  [accepted Sprint 095 function-body contract](../0095-v16-function-body-contract-technical-gate/function-body-contract.md),
  [control-flow fixtures](../0095-v16-function-body-contract-technical-gate/control-flow-fixtures.md),
  and [diagnostic matrix](../0095-v16-function-body-contract-technical-gate/diagnostic-matrix.md).
- Later accepted runtime/diagnostic disposition:
  [Sprint 097 Builder evidence](../0097-v16-function-runtime-list-value-semantics/builder-evidence.md),
  which resolves D-095-13 as `AMXF4002` and records Sprint 097 acceptance.
- Parser/AST authority:
  [Sprint 096 evidence](../0096-v16-function-ast-parser/builder-evidence.md)
  and `src/ast/types.ts` (`FunctionBodyNode` expression/statements union,
  including statement-body closing source).
- Current checker references: `src/typechecker/checkDocument.ts`,
  `src/diagnostics/errors.ts`, `tests/parser.test.ts`, and focused checker,
  evaluator, and module tests.

## In Scope

- Register and emit `AMXF4001: Missing return value from function` at the
  statement function's closing brace when any reachable path can fall through.
- Type-check every `returnStatement` in a statement-body function against
  the declared function return type, including returns in nested statement
  if/else and for bodies and returns after an earlier unconditional return.
- Analyze statement sequences path-sensitively:
  - a direct return terminates that reachable continuation;
  - an if without else may fall through;
  - an if/else terminates only when both branches terminate;
  - a statement loop may execute zero times and cannot guarantee a return;
  - a later statement can close a remaining fallthrough path;
  - statements after a terminating statement are still checked but do not
    make the already-terminated path fall through again.
- Type-check all function-body statements and expressions in source order,
  including unreachable statements, without emitting an unreachable warning.
- Preserve lexical type scopes: same-scope repeated `let` updates; nested
  block locals may shadow; branch/loop declarations do not escape; assignment
  targets must already be visible; loop iterator type/name is scoped and
  restored.
- Keep return semantics separated by AST context: function statement returns
  participate in function flow; braced-if-expression returns contribute to
  that expression's type/value flow; expression-form-loop returns retain
  collection behavior outside functions and remain prohibited in functions.
- Preserve existing visibility/order rules, no-capture behavior, and
  diagnostics for forward references/recursion.
- Add focused static-check tests for positive/negative return types, all-path
  shapes, lexical scope, expression-context boundaries, compatibility, and
  exact diagnostic code/message/source points.

## Out of Scope

- Parser/AST changes or runtime return propagation/list-copy behavior; Sprints
  096 and 097 are accepted.
- Replacing the defensive runtime fallthrough guard. Sprint 097 implemented
  `AMXF4002: Function finished without returning a valid expression` at the
  closing brace. Keep it as a guard for invalid/harness-created ASTs; valid
  incomplete source should fail static checking first with `AMXF4001`.
- Formatter/editor/VS Code/desktop integration; Sprint 099 owns these.
- V0.16 language specification, runnable examples, README/help updates; Sprint
  100 owns these.
- Release/version change, publication, unrelated language/checker refactors,
  or platform-certification claims.
- Changes to accepted Sprint 095-097 evidence or historical sprint records.

## Constraints and Gates

- Use `AMXF4001` exactly for missing function return; do not reuse `AMX3021`,
  which remains `Every possible path in an if expression must return a value`.
- Preserve the existing incompatible-return diagnostic:
  `AMX3002: Expected {expected}, got {actual}` at the return expression.
- Preserve unknown/out-of-scope identifier `AMX3001` and unknown function
  `AMX3004` behavior, including for unreachable statements.
- `AMXF4002` is the runtime fallthrough diagnostic allocated and implemented
  in Sprint 097. Do not use it as the static missing-return error or remove
  the defensive runtime path.
- A statement loop is never a proof of function return because it can execute
  zero times, even if every executed iteration returns.
- Every explicit return must be checked, even if control flow makes it
  unreachable at runtime. Unreachable statements do not produce a new warning.
- Preserve expression-body checking as-is. Do not route expression functions
  through the statement-flow analyzer.
- Keep this sprint focused on the checker and focused tests; parser/runtime
  accepted files are compatibility references, not targets for cleanup.