# Sprint 121 Builder Evidence: V0.20 Transpiler Contract and Feasibility Gate

## Status

Sprint 121 contract checkpoint and helper-boundary feasibility work were
separately approved on 2026-11-25. The raw run results below distinguish the
focused helper prerequisite from the full emitter, CLI/desktop, and release
scope, none of which is claimed as accepted here.

**Builder recommendation:** `ACCEPT/CLOSED WITH RECORDED RESIDUALS` for the
S121 contract and approved helper-boundary feasibility scope only.

**Separate product-owner disposition:** `ACCEPTED/CLOSED WITH RECORDED
RESIDUALS` by the product owner on 2026-11-25. This closes only the S121
contract and approved helper-boundary feasibility scope.

S122 helper completion and S123 emitter work remain independently gated.

## Entry and Baseline

| Evidence item | Required record | Raw status |
| --- | --- | --- |
| Sprint 120 owner disposition | Verified from S120 `builder-evidence.md`: `ACCEPTED/CLOSED WITH RECORDED RESIDUALS`, dated 2026-11-21. | PASS |
| Sprint 120 residual preservation | S120 raw VS Code aggregate remains 21 pass/8 fail; V0.19-specific rows pass; native/platform remains `BLOCKED/UNAVAILABLE`. No S120 evidence edited. | PASS |
| Lifecycle ledger reconciliation | Product owner authorized minimal reconciliation on 2026-11-25; `state.md`, `decisions.md`, `STATUS.json`, and `ARCHITECT_BRIEFING.md` identify the accepted S120 closeout and S121 checkpoint. Historical S120 text retained. | PASS |
| Baseline/worktree | Starting branch `feat/create-V0.20.0`, commit `ce12e40e54f9320a41ee28a5c55e2656a27e0420`, clean worktree. Windows PowerShell; Bun 1.4.5; TypeScript 5.9.3. | PASS |
| S121 execution authorization | Product owner approved exact S122 helper/enum file scope, probe-only reference oracle, commands, S121 artifact root, `dist` preservation/restore, retry policy, and S121 evidence files on 2026-11-25. | PASS |
| Existing `dist` preservation | 196 files / 1,661,955 bytes moved to `artifacts/probe-01/baseline/dist`; restored after build with all 196 file hashes matching. Generated dist retained under `run-01/generated-dist`. | PASS |
| Generated browser runtime | SHA-256 before/after build unchanged: `582919dc1148dda3b803c2901bbb676501d3af38091719349c80fbbfb43c6116`. | PASS |
| S121 artifact manifest | `artifacts/probe-01/artifact-manifest.csv`; SHA-256 `6465A02520FAFDAFB548C1476F0EC7203AB56EAA7B4EBB2D3C9F45346AA75AE6`. | PASS |

## Exact Command Ledger

All commands ran from `C:\Users\gamez\Programming\openamx` unless noted.
First outputs and corrective results are retained under
`artifacts/probe-01/`; no transient retry was needed.

| Run ID | Exact command | Result | Output record |
| --- | --- | --- | --- |
| S121-TOOLS-BUN | `bun --version` | PASS; Bun 1.4.5 | `baseline/bun-version.txt` |
| S121-TOOLS-TS | `bunx tsc --version` | PASS; TypeScript 5.9.3 | `baseline/typescript-version.txt` |
| S121-BUILD-01 | `bun run build` | PASS; exit 0. PowerShell surfaced the Bun build-banner stderr as `NativeCommandError`; generated runtime hash unchanged. | `run-01/build.log`, `run-01/generated-runtime-hash.json` |
| S121-TYPE-01 | `bunx tsc --noEmit` | PASS; exit 0, no diagnostics. | `run-01/typecheck.log` |
| S121-FOCUSED-01 | `bun test tests/inputData.test.ts tests/modules.test.ts tests/measurements.test.ts tests/measurementData.test.ts` | PASS; 88 tests, 0 failures, 514 expectations. | `run-01/focused-tests.log` |
| S121-PROBE-TYPE-01 | `bunx tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --allowImportingTsExtensions --types bun planning/sprints/0121-v20-transpiler-contract-feasibility-gate/artifacts/probe-01/run-01/fixtures/main.ts planning/sprints/0121-v20-transpiler-contract-feasibility-gate/artifacts/probe-01/run-01/fixtures/oracle.ts` | Initial attempt FAIL with four oracle typing diagnostics; corrected oracle then PASS with no diagnostics. | `run-01/probe-typecheck.log`, `run-01/probe-typecheck.after-fix.log` |
| S121-PROBE-ORACLE-01 | `bun run planning/sprints/0121-v20-transpiler-contract-feasibility-gate/artifacts/probe-01/run-01/fixtures/oracle.ts` | PASS; exit 0; generated/reference normalized exports and ordered views match exactly; all invalid inputs rejected. | `run-01/probe-oracle.log`, `run-01/probe-oracle-status.json` |

The root `dist/` tree was moved to `baseline/dist` before build, then restored.
All 196 files matched the original SHA-256 manifest. The generated build is
retained at `run-01/generated-dist`.

## Source Audit

| Evidence ID | Audit | Exact command/read and outcome | Raw status |
| --- | --- | --- | --- |
| E121-AST-01 | Reconcile every AST discriminant with `ast-typescript-mapping.md`. | Read `src/ast/types.ts` and compared each leaf with the mapping. Counts: DocumentNode 3, StatementNode 20, ExpressionNode 14, V02ExpressionNode 21, TypeReferenceNode 3, FunctionBodyNode 2, VisualizationOptionNode 6, DiagramContentNode 3. No missing/duplicate row found. | PASS |
| E121-CHECK-01 | Verify checked types, export visibility, diagnostics, and module identities used by emission. | Read `src/typechecker/checkDocument.ts`, `src/diagnostics/errors.ts`; found baseline enum annotation gap (`resolve` rejected enums; `resolveIsTarget` handled type tests only). Product owner amended D121-16; checker now accepts resolved enum names as named types. Focused imported enum input test passes. | PASS |
| E121-RUNTIME-01 | Verify list, measurement, builtin, input, view, and diagram runtime semantics cited by the map. | Read `src/runtime/measurement.ts`, `inputData.ts`, `evaluateExpression.ts`, `environment.ts`, `diagramModel.ts`, and `standardLibrary.ts`; `show` emits table/chart snapshots, diagrams emit separately at declaration time. Focused input/module/measurement suites pass 88/0, 514 assertions. | PASS |
| E121-PACKAGE-01 | Verify current package exports, ESM/compiler/module-resolution behavior. | Baseline package was ESM with `bin.openamx`, no exports map; root tsconfig ES2022/ESNext/bundler/strict; root lockfile TypeScript 5.9.3. Bun 1.4.5. Added only the approved helper subpath plus wildcard fallback; CLI bin unchanged. | PASS |
| E121-MODULE-01 | Verify import root, containment, cycle, canonical path, and output collision assumptions. | Read `src/runtime/moduleLoader.ts`: canonical realpaths, entry-directory default root, relative `.amx` paths, root containment, cycle checks, source-order traversal. Existing module/import tests pass in the focused suite. Multi-file publication/rollback remains unimplemented and assigned to S124/S125. | PASS |

## Isolated Feasibility Probe

The separately approved helper-boundary probe used the reference-only
`loadEntryModule` oracle. Generated TypeScript imported only
`openamx/transpiler-runtime`; no renderer internals or emitter implementation
were used.

| Run ID | Required case | Exact source/command/tool version | Raw output/artifact/hash | Raw status |
| --- | --- | --- | --- | --- |
| S121-PROBE-MODULE | `GOLD-MODULE-01` helper import; relative `.ts` import resolves. | `helpers.ts` / `main.ts`; strict TypeScript command above; Bun 1.4.5. | `doubled=12`; public subpath import resolves; oracle output and hash manifest. | PASS |
| S121-PROBE-MEASURE | `GOLD-MEASURE-01` length attach/convert/equality. | `main.amx`, `main.ts`; value/unit/vector normalized by `Length`. | `inMeters=1000 meter`; vector `Length:1`; `sameDistance=true` exactly. | PASS |
| S121-PROBE-INPUT | `GOLD-INPUT-01`; valid amount 6 plus invalid string, missing, and positive infinity. | `amount.json`, `invalid-amount.json`, `oracle.ts`; helper error path `amount`. | Valid output 12; all three caller cases rejected; AMX invalid file rejected with AMX4003 before evaluation. | PASS |
| S121-PROBE-VIEW | `GOLD-VIEW-01` and accepted `GOLD-DIAGRAM-VIEW-BLOCKER-01`. | `main.amx`, `main.ts`, `oracle.ts`; AMX `viewEmissions` and `diagramEmissions` merged by source position. | Chart `[2,4]`, title/description, `showTable=true`; ordered empty `diagram` DTO; exact structural match. | PASS |
| S121-PROBE-COMPILE-RUN | Public helper fixture typechecks and runs under accepted baseline. | TypeScript 5.9.3, Bun 1.4.5; command ledger above. | Strict no-emit compile PASS; oracle run PASS; output preserved in `run-01`. | PASS |

## Contract Reconciliation

| Evidence ID | Required reconciliation | Result / missing items | Raw status |
| --- | --- | --- | --- |
| E121-REQ-01 | Every V20 master-plan S121 bullet maps to a contract, fixture, decision, and owner. | All five Sprint 121 bullets are mapped in `parity-matrix.md`; helper-first dependency and no-release boundary are explicit. | PASS |
| E121-AST-02 | Every current AST variant has one lowering rule and at least one fixture or explicit blocking decision. | Source counts and alias handling are recorded in `ast-typescript-mapping.md`; each family maps to a GOLD fixture or explicit owner decision. No emitter execution is claimed. | PASS |
| E121-ID-01 | `D121-*`, `GOLD-*`, parity rows, diagnostics, and downstream owners have no missing/duplicate IDs. | Reconciled S121 decision register and 33 golden fixture IDs to parity rows; no duplicate IDs found. New D121-16 enum type-resolution amendment is recorded in the blueprint. | PASS |
| E121-PARITY-01 | Exact-vs-floating comparison rules and tolerances are approved per fixture. | Exact values and structural fields are recorded; affine C-to-F fixture uses absolute and relative tolerances `1e-12`. Probe cases compare exact expected values. | PASS |
| E121-SCOPE-01 | Changed-path and artifact audit proves no unauthorized product/release changes. | Approved source/test paths: `package.json`, `src/runtime/inputData.ts`, `src/runtime/moduleLoader.ts`, `src/typechecker/checkDocument.ts`, `src/transpilerRuntime.ts`, `tests/inputData.test.ts`, `tests/modules.test.ts`. S121 docs changed: `blueprint.md`, `requirements.md`, `acceptance.md`, `golden-fixtures.md`, `parity-matrix.md`, `builder-evidence.md`; probe outputs only under `artifacts/probe-01/`. Original `dist` restored hash-identically; diagram runtime hash stable; no S120 or release paths changed. | PASS |

## Failures, Limitations, and Residuals

Record first failures and every retry separately. Keep raw status distinct from
Builder interpretation and owner disposition.

| ID | Raw status | Evidence | Owner / impact | Disposition |
| --- | --- | --- | --- | --- |
| S121-ENUM-INPUT-FIRST-FAIL | FAIL | Initial focused attempt found enum declarations were not propagated into nested JSON conversion; preserved at `artifacts/probe-01/run-01/iterations/enum-converter-first-failure.log`. Corrected map propagation; final focused suite passes 88/0. | Builder / runtime | Resolved in approved scope; first raw failure retained |
| S121-ENUM-CHECKER-FIRST-FAIL | FAIL | Initial imported-enum test failed with AMX3001 because baseline `checkDocument.resolve` rejected enum type references; preserved at `artifacts/probe-01/run-01/iterations/imported-enum-typecheck-first-failure.log`. Product owner amended D121-16; checker fix and final focused suite pass. | Product owner / checker owner | Resolved under approved D121-16 amendment; first raw failure retained |
| S121-PROBE-TYPECHECK-FIRST-FAIL | FAIL | Initial probe TypeScript check found four oracle narrowing/frame-shape errors; preserved at `artifacts/probe-01/run-01/probe-typecheck.log`. Corrected only oracle mapping; after-fix check passed. | Builder | Resolved; initial raw failure retained |
| S121-ARTIFACT-MANIFEST-FIRST-FAIL | FAIL | First manifest attempt enumerated its destination while `Export-Csv` wrote it, causing a read lock; preserved as `artifacts/probe-01/artifact-manifest.attempt-01.csv`. Rebuilt from a pre-enumerated file list; final manifest hash is recorded above. | Builder | Resolved; first artifact retained |
| RES-S121-PUBLISH-01 | NOT RUN | D121-18 accepts best-effort rollback with per-path reporting and explicitly no multi-file crash-atomicity guarantee. Failure-injection test remains assigned to S124/S125. | S124/S125 | Carry forward as accepted residual |

## Recommendation and Disposition

- **Builder recommendation:** `ACCEPT/CLOSED WITH RECORDED RESIDUALS` for the
  S121 contract and approved helper-boundary feasibility scope. The public
  helper probe matched exports and ordered chart/diagram data; enum checker and
  JSON/CSV validation tests pass. Cite unrun emitter/graph/UI work as outside
  this S121 gate, not as passing evidence.
- **Product-owner disposition:** PENDING; record separately with date and
  exact accepted scope. A Builder recommendation does not close Sprint 121.
- **S122 readiness:** The authorized helper slice and public subpath are
  implemented and proven for the four-case boundary only; full helper API
  semantics, list/builtin coverage, and a separate S122 acceptance remain
  pending.
- **S123 readiness:** PENDING on S121 acceptance and S122 helper acceptance.
- **Limitations:** One Windows/Bun host only. No full emitter, CLI/desktop,
  rendered report, native/platform, release, or multi-file publication-failure
  acceptance is claimed. The D121-18 rollback residual remains open for later
  implementation tests.
- **Release/package/platform authority:** NONE. Record `NONE`; no release,
  publication, package/version, deployment, distribution, or certification
  command is in S121 scope.