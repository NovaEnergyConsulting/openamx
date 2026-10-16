# Sprint 089 Requirements: Integrated Acceptance and V0.14 Closeout

## Status and Authority

Sprint 089 is the integrated acceptance and closeout gate for V0.14. Sprints
084-088 are recorded as separately accepted/closed. Their Builder evidence
and dispositions are inputs, not substitutes for Sprint 089's current,
requirement-traceable verification.

Execution authorization and approval of the concrete file-by-file
verification/evidence plan are required before starting checks or changing
planning ledgers/evidence files. This preparation does not authorize release,
publication, package/version changes, or platform certification.

Scope authority:

- [`plan-openamxV14MasterSprintPlan.md`](../../plan-openamxV14MasterSprintPlan.md)
- Accepted Sprint 084
  [`grammar-examples.md`](../0084-v14-language-contract-and-acceptance-fixtures/grammar-examples.md),
  [`diagnostic-matrix.md`](../0084-v14-language-contract-and-acceptance-fixtures/diagnostic-matrix.md),
  and [`requirement-test-matrix.md`](../0084-v14-language-contract-and-acceptance-fixtures/requirement-test-matrix.md)
- Sprint 085-088
  [`builder-evidence.md`](../0085-v14-runtime-is-type-checking/builder-evidence.md),
  [`builder-evidence.md`](../0086-v14-mathematical-standard-library/builder-evidence.md),
  [`builder-evidence.md`](../0087-v14-text-and-numeric-formatting/builder-evidence.md),
  and [`builder-evidence.md`](../0088-v14-editor-examples-documentation/builder-evidence.md)

## Goal

Verify the approved V0.14 behavior end to end across the core runtime,
shared editor services, VS Code Extension Development Host, desktop authoring
workbench, user documentation/help, and runnable examples. Produce a
requirement-to-evidence matrix that reports exact outcomes, failures,
unavailable checks, and residuals. Submit a closeout recommendation and
request a separate Lead Developer/product-owner V0.14 disposition.

Sprint 089 adds no product scope. Its closeout does not itself authorize
release or publication.

## In Scope

### Integrated Contract and Runtime Acceptance

- Verify every applicable requirement and stable fixture in the complete
  Sprint 084 requirement-test matrix, including all 44 canonical fixture IDs
  and the approved source/document amendments.
- Verify `is` grammar, precedence, associativity, target type resolution,
  source-order/import visibility, Boolean results, false nonmatches,
  structural records, nested lists/records, optional/null, enum membership,
  Measurement dimensions, source ranges, and no flow-sensitive narrowing.
- Verify `PI`, `E`, all 15 mathematical functions, exact signatures and
  expected values/tolerance, radians and log bases, dimensional
  Measurement rejection, normalized dimensionless Measurement input, all
  approved domains, non-finite handling, and exact diagnostics.
- Verify Measurement-aware `sum`, `mean`, `min`, `max`, `abs`, `round`,
  `sqrt`, and `pow`, including compatible/incompatible dimensions, unit
  conversions, result units, empty-list behavior, and V0.9 regressions.
- Verify `len`, `trim`, `left`, `right`, and `format`, including Unicode
  code points, Unicode 15.1 whitespace inclusion/exclusion, slice boundaries,
  the bounded numeric pattern grammar, precision/rounding, all supported
  locales, currency/percent/negative-zero behavior, Measurement display,
  and exact failure diagnostics.
- Verify the approved direct-expression fixtures:
  `MATH-NONFINITE-INPUT-01` (`sin(1 / 0)`),
  `TEXT-COUNT-NONFINITE-01` (`right("A", 1 / 0)`), and
  `FORMAT-FINITE-01` (`format(1 / 0, "0")`). Preserve finite Number-binding
  behavior and their approved diagnostics.

### Cross-Surface and Example Acceptance

- Run the full root test suite and core build. Run focused V0.14 acceptance
  first and keep detailed fixture results distinct from full-suite results.
- Verify shared editor services and both user-visible clients directly:
  - VS Code Extension Development Host checks for highlighting, completion,
    diagnostics/source ranges, formatting, and supported type-target
    navigation.
  - Desktop typecheck, web build, RPC contract, and focused UI tests for
    visible CodeMirror behavior and searchable Help.
- Verify the V0.14 specification, root README links, VS Code guide, and
  desktop Help against the accepted contract without status overclaims.
- Analyze and execute all three V0.14 examples; compare representative
  result values and Measurement units; verify formatter idempotence and
  useful diagnostics/source ranges.
- Record native/package desktop validation as a distinct action from the
  Vite workflow harness. If a supported native path is unavailable, record
  `BLOCKED/UNAVAILABLE` and its exact missing prerequisite rather than
  substituting harness evidence.
- Run the existing extension and desktop validation workflows. Record
  exact commands, environment/tool versions, counts, first attempts/retries,
  logs/screenshots/artifacts, and all failures/unavailable checks.

### Requirement Matrix and Closeout

- Complete a master-plan-to-evidence matrix covering every applicable
  Sprint 084 requirement ID (`V14-CON-*`, `V14-IS-*`, `V14-MATH-*`,
  `V14-MEAS-*`, `V14-TEXT-*`, `V14-FMT-*`, `V14-COMP-*`, and `V14-TRACE-*`).
- Where a requirement exists on multiple surfaces, record each surface
  separately. Do not infer an editor result from shared-service tests, an
  example result from a build, or an unavailable native run from a harness.
- Use only `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN` for
  verification status. A separate user/product disposition may accept a
  residual, but it does not erase the underlying failure or unavailable
  evidence.
- Compare outcomes with Sprints 085-088 and known inherited failures.
  Preserve initial failures and retries and name new/changed failures.
- Provide a Builder closeout recommendation, list residuals and owners, and
  request a separate Lead Developer/product-owner V0.14 disposition as
  `ACCEPTED/CLOSED` with named residuals or `BLOCKED/OPEN` with follow-up.

## Out of Scope

- New language or library features, contract/diagnostic changes, code fixes,
  test weakening, editor redesign, output redesign, or cleanup of unrelated
  historical failures.
- Reworking inherited Windows extension path/cleanup failures or desktop RPC
  sandbox assertions unless a regression caused directly by Sprint 089
  verification changes is demonstrated and separately authorized.
- Changing sandbox/CSP policy, path containment, output limits, Unicode
  behavior, accepted Measurement rules, or numeric formatting rules to make
  checks pass.
- Package/version changes, release engineering, release, publication, or
  platform certification.

## Constraints and Residuals

- Sprint 084 is the behavior authority; accepted Sprints 085-088 specify
  implementation evidence but are not evidence of integrated Sprint 089
  acceptance.
- Keep statuses honest and surface-specific. A test failure remains a
  `FAIL` even if a separate product decision accepts the residual; keep the
  disposition separately recorded. An unavailable host remains
  `BLOCKED/UNAVAILABLE` for that run.
- Sprint 088 recorded a raw VS Code aggregate of 17 passed/8 failed on its
  final retry (six Windows `EBUSY` cleanup failures and two drive-letter
  case comparisons). The user separately accepted Sprint 088 after local
  deployment validation; preserve both the automated result and that
  disposition when comparing Sprint 089 results.
- Sprint 088 desktop UI automation used a Vite workflow harness. The user
  separately confirmed local desktop build/deployment functionality, closing
  the Sprint 088 native-host disposition as PASS; no native CDP artifact or
  user test transcript was supplied. Distinguish this prior disposition
  from any direct Sprint 089 native test.
- Sprint 088 did not rerun the desktop RPC contract. The historical
  sandbox-occurrence mismatch remains a separate baseline and must not be
  changed to force a pass.
- Full root, extension, and desktop runs are expected in Sprint 089. Do not
  report a focused suite or build as the full integrated result.
- A Builder closeout recommendation is not the Lead Developer disposition.
  V0.14 acceptance, release, and publication authority remain separate.
