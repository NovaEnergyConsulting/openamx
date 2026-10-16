# Sprint 089 Acceptance Criteria

Sprint 089 is complete when every applicable V0.14 contract requirement has
integrated, requirement-traceable evidence across its implementation and
authoring surfaces; all failures/unavailable checks have explicit
disposition and ownership; and a separate Lead Developer/product-owner
records the V0.14 closeout disposition. Sprint 089 adds no product scope and
does not authorize release or publication.

## Requirement-to-Evidence Matrix

- Every applicable ID in Sprint 084's
  `requirement-test-matrix.md` is represented in Sprint 089
  `builder-evidence.md`: `V14-CON-*`, `V14-IS-*`, `V14-MATH-*`,
  `V14-MEAS-*`, `V14-TEXT-*`, `V14-FMT-*`, `V14-COMP-*`, and
  `V14-TRACE-*`.
- Each row identifies the canonical fixture(s), expected behavior,
  implementation and relevant surfaces, exact command/action, evidence
  artifact, status, residual owner, and required follow-up/disposition.
- Core/runtime, shared editor services, VS Code, desktop, documentation/help,
  and examples are recorded separately wherever applicable.
- All 44 Sprint 084 canonical fixture IDs are dispositioned. Positive,
  negative, boundary, source-range, and compatibility cases have directly
  asserted expected results; no requirement is treated as covered by a
  representative case where the contract requires broader coverage.
- Each result is one of `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, or `NOT RUN`.
  A separate accepted residual remains visibly a failure/unavailable result
  with its separate disposition; it is never silently converted to PASS.

## Core Language and Standard Library

- Run all accepted `is` cases: grammar/precedence/associativity, source-order
  and import target resolution, exact diagnostics, structural recursive
  records, lists/empty lists, optional/null behavior, enum membership,
  Measurement vector matching, false nonmatches, and no flow-sensitive
  narrowing.
- Run all 15 math functions and `PI`/`E`, with approved expected values and
  tolerance, radians/log bases, math domains/boundaries, finite behavior,
  dimensionless Measurement normalization, dimensioned Measurement errors,
  and exact diagnostics.
- Run the full approved Measurement-aware standard-library matrix:
  compatible/incompatible dimensions, conversions and result units,
  aggregate first-unit behavior, selected original `min`/`max` units,
  typed empty `sum`, empty errors, `abs`/`round`, dimensional `sqrt`, and
  integer-literal `pow` semantics.
- Run all accepted text and numeric formatting cases: string/list lengths,
  Unicode code points and combining marks, exact Unicode 15.1 whitespace
  set and exclusions, zero/default/oversized/invalid counts, full format
  grammar, locale separators and allowlist, grouping, percent, literal
  currency, tie rounding, negative values/zero, Measurement displayed-value
  suffixes, and exact error diagnostics.
- Confirm approved direct-call fixtures remain correct:
  `sin(1 / 0)` -> `AMXSL001`,
  `right("A", 1 / 0)` -> `AMXSL003`,
  `format(1 / 0, "0")` -> `AMXSL006`.
  Existing finite Number-binding behavior remains unchanged.
- Exact diagnostic identities/messages, original-document locations,
  UTF-16 columns, exclusive ends, LF/CRLF behavior, and editor range
  conversions match the approved Sprint 084 fixtures.
- Existing parser, type checker, evaluator, modules, Measurement,
  formatter, editor, and CLI regressions pass or are recorded against
  concrete prior results. A successful build is not a substitute for these
  assertions.

## Cross-Surface, Documentation, and Examples

- Full root `bun test` and `bun run build` outcomes are recorded, including
  complete counts and individual failures.
- The VS Code Extension Development Host suite is run. V0.14-specific tests,
  syntax scopes, completion, diagnostics/ranges, formatting, and type-target
  navigation are recorded separately from the suite aggregate.
- Desktop typecheck, web build, RPC contract, and focused UI tests are run.
  Vite workflow harness, user-reported local deployment confirmation, and
  direct native/package evidence are distinct statuses with separate
  artifacts. Native/package validation is marked BLOCKED/UNAVAILABLE when
  the supported route is missing.
- Desktop RPC sandbox-occurrence failures and VS Code Windows path/cleanup
  failures are compared with prior baselines. No assertions, path handling,
  sandbox policy, CSP, or security boundaries are weakened.
- The V0.14 specification, root README, VS Code guide, and searchable desktop
  Help match the approved contract and do not overstate release,
  publication, integrated acceptance, accessibility, or platform support.
- All three examples are analyzed and executed with expected output
  bindings and Measurement units. Formatter output is idempotent and
  diagnostics/source ranges remain useful and exact.
- Evidence distinguishes shared-service/unit success from actual VS Code
  and desktop user-visible behavior. No result is inferred from a neighboring
  surface, earlier sprint, build, or unavailable host.

## Evidence, Residuals, and Closeout

- `builder-evidence.md` contains exact commands, directories, tool/runtime
  versions, aggregate and per-test counts, fixture IDs, artifact/log/
  screenshot paths, initial failures and retries, status, residual owner,
  and follow-up.
- Prior Sprint 088 outcomes remain accurately distinguished: its raw
  Extension Development Host result was 17 passed/8 failed on the final
  retry, while the user separately accepted its disposition after local
  deployment validation; its UI automation used the Vite harness, while the
  user separately reported local desktop build/deployment testing without
  supplying a native log/CDP artifact. Preserve those records and report
  fresh Sprint 089 runs independently.
- The desktop RPC sandbox-occurrence historical mismatch remains visible
  unless directly rerun; a failure is not waived by a different test.
- Builder recommendation identifies every residual and owner. A separate
  Lead Developer/product-owner explicitly records `ACCEPTED/CLOSED` with
  named residuals or `BLOCKED/OPEN` with required follow-up. Builder
  evidence/recommendation alone is not V0.14 acceptance.
- Closeout changes no product scope and does not itself authorize release,
  publication, version changes, package release, or platform certification.
