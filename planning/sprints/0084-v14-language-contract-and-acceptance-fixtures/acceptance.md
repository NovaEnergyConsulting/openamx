# Sprint 084 Acceptance Criteria

Sprint 084 is complete when the confirmed V0.14 scope has a reviewed,
unambiguous, source-located contract and a traceable fixture matrix that can
be implemented without inventing semantics. Sprint 084 does not implement
V0.14 or authorize release or publication.

## Contract Artifacts

- `grammar-examples.md` contains the final `is` grammar, target-type
  resolution rules, precedence/associativity, valid and invalid examples,
  and exact expected results for all confirmed runtime behavior.
- The `is` contract covers primitive, structural record, enum, list,
  optional/null, and Measurement/dimension matching; nested values,
  additional record fields, optional target fields, empty lists, incompatible
  values, and source-order/import visibility are explicit.
- The contract preserves enum underlying primitive representation and
  membership semantics; equal primitive values in distinct enums are not
  assigned nominal identity.
- The contract explicitly states that `is` is a runtime predicate and adds
  no flow-sensitive type narrowing.
- Mathematical signatures and types cover every new function and `PI`/`E`.
  Radians, `ln`/`log` bases, Measurement input conversion, dimensions,
  mathematical domains, finite inputs/results, and numerical comparison
  tolerances are explicit.
- Every existing Number- or numeric-list standard-library function has an
  explicit Measurement applicability and result-unit disposition. Compatible
  dimensions, conversion rules, and the distinct aggregate versus `min`/
  `max` result-unit rules are captured without contradicting the master plan.
- Text contracts specify Unicode code-point counting/slicing, list length,
  exact trim whitespace behavior, omitted counts, zero/oversized counts, and
  rejection of negative, non-integral, or otherwise invalid counts.
- `format` has a finite grammar and explicit locale allowlist. Decimal
  precision and rounding, grouping, percent scaling, currency literals,
  negative values, Measurement suffix spacing, and invalid or unsupported
  patterns/locales have exact expected output or diagnostic behavior.
- Decisions that could change or reduce confirmed scope are explicitly
  approved by the product decision owner or recorded as blockers. Proposed
  examples are not silently promoted to approved behavior.

## Fixtures and Diagnostics

- `diagnostic-matrix.md` covers malformed `is` syntax, unresolved/invalid
  target types, all required math domain and finite-result failures,
  incompatible Measurement operations, invalid text counts, invalid
  formatter patterns/locales, and applicable arity/type errors.
- Each negative case records its stable fixture ID, exact diagnostic
  identity/message, failure phase, primary location, and secondary location
  when useful. A valid non-match is explicitly `false`, not an error.
- Fixture source locations are measured against complete original documents,
  including front matter and executable-fence lines. Lines and columns are
  1-based; columns are UTF-16 code units; diagnostic ends are exclusive.
  LF and CRLF mappings are covered.
- `requirement-test-matrix.md` maps every applicable V0.14 master-plan
  requirement to fixture IDs, expected behavior, owning later sprint and
  surface, and required evidence.
- Fixture IDs, source text, outcomes, diagnostic entries, and requirement
  rows agree across all three contract artifacts.

## Compatibility and Boundaries

- Existing AMX syntax, diagnostics, Measurement dimensional compatibility,
  unit conversion, existing `sqrt` negative-domain behavior, and standard
  library results outside the approved additions are protected by explicit
  regression cases.
- Unsupported `format` patterns/locales and invalid math domains do not
  produce silent fallback strings, `NaN`, infinity, or success-shaped values.
- No production implementation, release/version change, publication,
  unrelated feature work, or platform-certification claim occurs.
- `builder-evidence.md` records exact review/check actions, outcomes,
  decisions, blockers, residuals, and the Builder recommendation. A
  recommendation is not product approval.
- The Lead Developer/product owner records the contract disposition before
  Sprint 085 begins. If any required behavior remains unresolved, the
  dependent implementation work is explicitly BLOCKED.
