# Sprint 084 Blueprint: V0.14 Language Contract and Acceptance Fixtures

## Approach

1. Obtain explicit Sprint 084 execution authorization and approval of the
   concrete file-by-file execution/evidence plan. Preserve the starting
   worktree and existing V0.13 artifacts. Do not modify production files.
2. Read the V0.14 master plan, current language specifications, relevant
   parser/type-checker/runtime/library code, and prior contract-gate
   artifacts. Record the existing syntax and semantics that V0.14 must
   preserve.
3. Finalize `grammar-examples.md`:
   - Specify the `is` expression and type-reference grammar using the
     project's established type notation.
   - Lock precedence and associativity against arithmetic, comparisons,
     Measurement conversion, `and`, `or`, and conditional expressions.
   - Define source-order/import visibility and how a type reference is
     distinguished from a runtime value.
   - Complete positive and negative examples for every confirmed `is`
     behavior and each standard-library family.
   - Mark each example as a contract fixture, expected result, and
     implementation-test destination.
4. Resolve the Measurements and standard-library applicability table.
   Preserve the confirmed compatible-dimension and unit-result rules.
   Identify each existing function as Measurement-preserving,
   Measurement-transforming, or Number-only, with an explicit reason and
   acceptance case. Escalate any scope-changing choice instead of assuming
   it.
5. Finalize the math and text contracts. Specify exact signatures, valid
   argument counts/types, radians and logarithm bases, all mathematical
   domains, finite-result handling, constants, Unicode code-point behavior,
   whitespace set, and `left`/`right` count boundaries.
6. Finalize the numeric formatter contract. Record its grammar, supported
   locale identifiers and locale effects, precision and rounding,
   grouping, percent and currency behavior, negative formatting,
   Measurement unit suffix, and explicit rejection cases. Keep the subset
   narrow, deterministic, and offline.
7. Complete `diagnostic-matrix.md`. For every invalid fixture, record the
   final diagnostic identity and exact message, trigger, primary/secondary
   source ranges, and expected failure boundary. Reuse an existing
   diagnostic only when its semantics and message genuinely match.
8. Complete `requirement-test-matrix.md`. Map every V0.14 master-plan
   requirement to one or more stable fixture IDs, exact expected behavior,
   owner sprint/surface, and implementation evidence expected later.
9. Cross-check that examples, diagnostic entries, and matrix rows agree.
   Recalculate source locations from the complete canonical AMX documents,
   including front matter and AMX fences; include LF/CRLF and UTF-16
   location cases.
10. Record all decisions, evidence, limitations, and remaining questions in
    `builder-evidence.md`. Submit a contract-lock recommendation. If an
    unresolved detail changes confirmed scope or cannot be decided within
    this authority, mark the dependent contract BLOCKED and request a
    specific product decision.

## Files in This Sprint

- `requirements.md`
- `blueprint.md`
- `acceptance.md`
- `handoff-prompt.md`
- `grammar-examples.md`
- `diagnostic-matrix.md`
- `requirement-test-matrix.md`
- `builder-evidence.md`

The source examples and matrices are contract artifacts only. Production
language code, runtime tests, user documentation, and runnable V0.14
examples belong to downstream sprints.

## Verification

- Verify every confirmed requirement in the V0.14 master plan is represented
  in the requirement-to-test matrix.
- Verify every proposed behavior is either precisely specified and approved
  or explicitly marked unresolved/blocked; no silent defaults remain.
- Verify grammar examples, expected outcomes, diagnostic entries, and matrix
  fixture IDs are mutually consistent.
- Verify each negative fixture's code, exact message, and primary source
  range against its complete original-document source.
- Verify the proposal preserves existing language and Measurement contracts
  outside the approved additions.
- Do not count the current production parser/runtime as accepting V0.14
  examples; feature implementation and runtime verification begin in later
  authorized sprints.
- Do not run broad implementation suites as a proxy for contract completion.
  Run only checks needed to validate the planning artifacts and any explicitly
  authorized isolated contract probe.

## Notes

Sprint 084 is a dependency gate for Sprints 085-089, not a feature sprint.
No implementation sprint may reduce a confirmed requirement or substitute a
partial behavior without a recorded product decision.
