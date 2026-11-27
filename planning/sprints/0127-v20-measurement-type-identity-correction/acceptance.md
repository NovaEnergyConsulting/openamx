# Sprint 127 Acceptance Criteria

Sprint 127 is complete only when the generated Measurement type identity is
consistent with AMX vector compatibility for the approved imported graph,
strictly compiled generated TypeScript matches the AMX oracle for the accepted
source forms, and all required evidence and preservation checks are recorded.
S127 does not close the full V0.20 matrix or authorize release.

## Entry and Scope

- S126 remains `BLOCKED/OPEN`; its raw Measurement `TS2345` and all S121-S126
  residuals are unchanged.
- Baseline is commit `08fbfa3592bc815e1a6617d3c003a468bd8da9a0` on
  `feat/create-V0.20.0`, subject to separate exact execution authorization.
- Changes are limited to `src/transpiler/emit.ts`, optional internal wiring in
  `src/transpiler/index.ts`, `tests/transpiler.test.ts`, and the S127 evidence
  root. No helper, typechecker, public API, package, CLI, desktop, docs, or
  example changes are authorized by this package.

## Behavior

- A Measurement vector class receives one deterministic generated TypeScript
  identity across every module in a prepared graph.
- Generated function parameter/return types, imported module bindings,
  measurement attachments/conversions, and result annotations agree on that
  identity when AMX considers their vectors compatible.
- Canonical identities are independent of absolute checkout root, locale,
  traversal order, and filesystem enumeration.
- Equal-vector declarations follow the accepted checker rule and use the same
  canonical generated brand. Distinct vectors remain distinct.
- Runtime values, units, display text, physical values, evaluation order,
  diagnostics, and public helper declarations do not change.

## Regression and Parity

- The retained `averageSpeed` graph compiles under TypeScript 5.9.3, ES2022,
  ESNext, strict mode, bundler resolution, and `.ts` import support.
- The generated oracle executes separately from CLI transpilation and compares
  generated and AMX results for the same source graph and input. At minimum,
  compare `averageSpeedResult` value `45`, display unit
  `kilometer_per_hour`, and the declared exported values.
- Adjacent fixtures cover an imported unit whose dimension name is not
  directly imported, a derived dimension, and an equal-vector unit/dimension
  alias case selected in the test implementation.
- The new regression fails before the correction and passes afterward. The
  original S125 TS2339/TS2322 and S126 TS2345 logs remain unchanged.
- Passing these cases does not close all G123 Measurement, helper, AST,
  input, view, or error rows.

## Required Verification

- Run the approved ten-file focused root selection, root no-emit typecheck,
  isolated/preserved root build, strict generated graph compile, generated
  oracle, and `git diff --check`.
- Generated code compilation and generated execution are separate evidence
  rows. A CLI transpile pass alone is not compile/run parity.
- Preserve pre/post `dist` and renderer manifests. Desktop outputs and all
  S121-S126 artifacts remain untouched.
- Full root aggregate, desktop RPC/full suite/typecheck/UI, native WebView,
  and cross-platform checks remain `NOT RUN` unless separately authorized.

## Residual and Disposition Rules

- Raw statuses are `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
  Preserve each first failure and retry; no cap is set, but stop on a confirmed
  semantic defect or any need to exceed this scope.
- S125/S126 raw Measurement failures remain historical `FAIL`s. A later S127
  `PASS` is a new run, not a rewrite of either failure.
- S127 Builder recommendation and separate Product Owner disposition are
  recorded independently. V0.20 cannot be accepted as complete until this
  Measurement compile/parity gate passes and the remaining integrated
  acceptance/residuals receive separate disposition.
- No release, package/version, publication, deployment, distribution,
  installer, Marketplace/registry, native certification, or cross-platform
  certification authority follows S127.