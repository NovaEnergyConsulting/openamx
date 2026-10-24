# Sprint 096 Blueprint: V0.16 Function AST and Parser

## Approach

1. Obtain separate Sprint 096 execution authorization and approval of the
   exact source/test/evidence file plan. Record initial branch/worktree and
   preserve unrelated changes and generated artifacts.
2. Read the accepted Sprint 095 contract and fixture/diagnostic matrices
   first. Use them as normative authority; do not reopen decisions D-095-01
   through D-095-15. D-095-13 is unrelated to parser acceptance and remains
   unallocated for Sprint 097.
3. Define a discriminated function-body AST. Preferred shape: keep the
   existing expression node as the expression-body payload and add a
   statement-body payload containing `StatementNode[]` plus body/opening/
   closing source locations. A discriminant must identify the form. Confirm
   exported AST compatibility and update consumers narrowly; do not infer
   form from source text or an untyped array.
4. Split the existing parser branch cleanly:
   - `=` keeps its existing expression parse path and regression behavior.
   - `{` invokes a function-body boundary scanner, then existing statement
     parsers with an explicit function-body context.
   - The matching close must be found with string-aware scanning. Reuse
     `findStringLiteralEnd` or an equivalent existing scanner; braces inside
     strings do not alter nesting depth.
   - Reject missing/malformed boundaries and trailing same-line tokens
     instead of swallowing the next statement or silently truncating input.
5. Extend parse context with a distinct function-return permission. Propagate
   it through statement-form `if` and `for`; update the for-statement parser
   to retain return nodes when this context is active. Keep expression-loop
   `allowReturn` separate, and do not pass function-return permission into
   expression-form for or braced-if expression parsing.
6. Enforce function-body statement allowlisting before general module-level
   declaration parsing. For prohibited statements, report
   `AMX3006: The '{keyword}' statement is not allowed in a function body.`
   at the exact keyword, including `export`/re-export and nested function
   declarations. Keep the existing statement grammar and nested-loop,
   `break`, and `continue` restrictions.
7. Add focused tests in `tests/parser.test.ts`, using fixture IDs from
   `parser-fixture-matrix.md`. Include direct `parseStatements` AST assertions
   and `parseDocumentText` location checks where original-document offsets
   matter.
8. Update AST consumers only enough to narrow expression vs statement body
   and keep TypeScript compilation valid. A consumer may preserve existing
   expression-body handling and explicitly defer statement-body semantics to
   its owning sprint; do not add a success-shaped runtime/checker behavior.
9. Run parser tests, a no-output TypeScript check, and approved whitespace/
   worktree checks. Record commands and raw outcomes in `builder-evidence.md`.

## Candidate AST Contract

This is an implementation recommendation, not a product decision beyond the
accepted requirement for an explicit representation:

```ts
type FunctionBodyNode =
  | { kind: 'expression'; expression: V02ExpressionNode }
  | {
      kind: 'statements';
      statements: StatementNode[];
      source: SourceLocation;
      openingSource: SourceLocation;
      closingSource: SourceLocation;
    };
```

The final implementation may use another equivalent discriminated shape if
it preserves the expression AST, records the closing-brace location, and
allows downstream consumers to narrow safely. Do not add a second parser
model that duplicates statement nodes.

## Parser Context Boundaries

| Context | Direct `return` | Statement-form `if`/`for` | Expression-form `for` | Braced-if expression |
| --- | --- | --- | --- | --- |
| Ordinary top-level statements | Rejected with approved function/loop-context message | Existing behavior | Existing behavior | Existing behavior |
| Expression-bodied function | Expression body only; nested return statements remain governed by existing expression constructs | Not a statement body | Existing type-checker prohibition remains; do not silently alter in 096 | Braced-if expression return produces its value, not function exit |
| Braced function statement body | Parsed as a function return | Function-return permission propagates; nested for remains prohibited | Existing expression AST may parse, but its placement remains rejected by static checking under D-095-15 | Expression return remains local to the braced-if expression |
| Expression-form loop | Return is the per-iteration collected expression | Existing loop behavior | Existing loop behavior | Existing behavior |

The implementation must use independent context flags or an equivalent
explicit context type so permission does not leak across these boundaries.

## Expected Source/Test Surfaces

- Primary AST/parser files: `src/ast/types.ts`,
  `src/parser/parseStatements.ts`, `src/parser/parseFor.ts`,
  `src/parser/parseIf.ts`, and `src/parser/stringScanner.ts` if its API needs
  a narrowly scoped reuse adjustment.
- Primary test file: `tests/parser.test.ts`.
- Potential compile-only AST consumers: `src/runtime/evaluateExpression.ts`,
  `src/typechecker/checkDocument.ts`, `src/editor/highlighting.ts`,
  `src/editor/symbols.ts`, and any additional exhaustive consumer exposed by
  the compiler. Keep those changes strictly to type narrowing/explicit
  deferral and record every touched path.
- No product host/editor files or other tests unless a compile/test failure
  proves a necessary direct AST consumer; obtain scope approval before
  widening beyond the agreed file plan.

## Verification

- Focused: `bun test tests/parser.test.ts`.
- Type-only, no generated output: `bunx tsc --noEmit` (or the repository's
  exact locally installed equivalent). Do not invoke a build script that
  generates or overwrites artifacts until its output boundary has been
  inspected and included in the approved plan.
- Final: `git diff --check` for approved changed files and `git status
  --short --branch` to identify all edits. Preserve accepted Sprint 095
  evidence exactly.

## Notes

Sprint 096 is a dependency of Sprints 097 and 098. Parsing and AST acceptance
do not imply that statement-body functions execute or type-check correctly.