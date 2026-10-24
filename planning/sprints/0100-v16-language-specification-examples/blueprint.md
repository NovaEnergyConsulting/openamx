# Sprint 100 Blueprint: V0.16 Language Specification and Examples

## Approach

1. Obtain separate Sprint 100 execution authorization and approval of the
   exact spec/example/reference/help/test/resource file plan. Record initial
   worktree state and preserve all accepted Sprint 095-099 evidence and
   existing generated outputs.
2. Read the accepted Sprint 095 contract/diagnostics and later implementation
   evidence. Treat implementation behavior as evidence only where it agrees
   with the approved contract; do not edit the contract or silently introduce
   new behavior.
3. Draft `docs/language-spec-v0.16.md` in the additive style of V0.14:
   - compatibility/source rules and exact version additions;
   - expression and statement function declaration grammar;
   - complete approved function-body statement inventory and prohibited
     statements/controls;
   - function return semantics vs expression-loop and braced-if-expression
     return semantics;
   - all-path analysis, zero-iteration loops, unreachable checking, exact
     diagnostics/locations;
   - lexical scope, parameter assignment, shadowing, declaration order,
     visibility, and no captures/recursion/forward references;
   - recursive array-only copies per list parameter, repeated-argument
     independence, opaque non-array elements, and direct list results;
   - parser/runtime/checker exclusions and links to earlier contracts.
4. Create `examples/15_Function_Bodies.amx` as an input-free standalone
   reference. Use objectives/prerequisites/desktop workflow/expected outcome/
   navigation sections consistent with 08-14. Keep the current guided
   sequence, 03 lesson outcomes, and references 13/14 intact.
5. The valid reference should run end-to-end and make expected values
   inspectable for:
   - one expression-bodied function and one braced function;
   - nested if/else returns and a statement-loop return followed by a
     fallback return;
   - parameter rebinding and lexical local scope;
   - local list mutation/result; nested-list argument copies; repeated
     argument independence;
   - no invalid/missing-return function in the success document.
6. Add a separate invalid-only source under `examples/fixtures/invalid/`
   that has a reachable fallthrough path. Test it directly and assert
   `AMXF4001: Missing return value from function` at the function closing
   brace. Label it as negative-only in the spec/example explanation and tests.
7. Add reference 15 to the index as a standalone reference. Avoid adding it
   to the guided prerequisite route. Add a link from lesson 03 only if it
   improves discoverability without changing its role or outcomes.
8. Update README, desktop Help search terms/topic, and extension README links.
   Extend `tests/examples.test.ts`, `tests/numbered-guide.test.ts`,
   `desktop-app/src/bun/guideResources.ts` plus its parity tests, and the
   Help UI topic assertions as required by the approved file plan.
9. Run the valid reference through parser/checker/evaluator/CLI and assert
   exact expected values. Test the negative fixture independently. Check
   spec links, index classification/navigation, offline allowlist and
   byte-parity/resource materialization without overwriting existing output.
10. Record exact paths, commands, expected/actual results, platform limits,
    and residuals in `builder-evidence.md`. Sprint 100 does not close V0.16;
    Sprint 101 owns integrated acceptance.

## Proposed Reference Fixture Outline

This is a teaching outline, not a finalized user document. Preserve newline
statement separators and avoid prohibited syntax:

```amx
fn triple(value: Number): Number = value * 3

fn choose(value: Number): String {
  if value > 10 {
    return "high"
  } else {
    if value > 0 {
      return "positive"
    } else {
      return "other"
    }
  }
}

fn firstOrDefault(values: Number[]): Number {
  for value in values {
    return value
  }
  return 0
}

fn append(values: Number[]): Number[] {
  add 9 to values
  return values
}
```

The final example should add concise, isolated tests for nested-list copy and
repeated parameters, without adding nested statement loops or record-mutation
claims. Keep enough output assertions to make caller isolation visible.

## Exact Public Contract Facts

- Valid body statement forms: initialized `let`, assignment, `+=`, standalone
  if/optional else, statement-form for, return, named-list add/remove.
- Nested statement loops, expression-form loops inside functions, `break`,
  `continue`, module/document declarations, output actions, nested function
  declarations, recursion, forward references, closures, and visibility
  redesign are excluded.
- Newlines separate statements; semicolons are invalid.
- Statement return exits the function, including through allowed nested
  control flow. Braced-if-expression branch returns provide expression
  values; expression-loop returns collect one result per iteration elsewhere.
- A path falls through after an if lacking else unless a later statement
  returns. A loop alone never proves return because it can run zero times.
  Every explicit return and unreachable statement is checked; there is no
  unreachable-code warning.
- Same-scope `let` updates. Nested scope may shadow and then restores the
  visible outer binding. Assignment cannot create a binding or alter a
  caller/document binding.
- List argument copies recursively clone arrays only, separately per
  parameter; non-array elements are opaque. Mutated local arrays returned by
  a function are the direct result.

## Verification

- Root: focused `tests/examples.test.ts` and `tests/numbered-guide.test.ts`;
  `bunx tsc --noEmit` if the approved plan requires it.
- Desktop: focused guide-resource parity/materialization tests and
  Help-center test if modified.
- Use temporary paths for generated outputs. Preserve existing guide build
  artifacts and test-result directories; do not run broad builds into stable
  paths without an approved output boundary.
- `git diff --check`, final changed-path review, and record all unrun host or
  platform checks.

## Notes

Sprint 100 depends on Sprints 095 and 096, both accepted. Sprints 097-099 are
also accepted and supply feature evidence. Sprint 101 remains the integrated
closeout and does not authorize release/publication by itself.