# Sprint 121 Requirement-to-Parity Matrix

## Status and Evidence Rules

Product-owner contract decisions were recorded on 2026-11-25. `NOT RUN` denotes no qualifying execution evidence. A successful
source audit or isolated helper probe does not establish full emitter,
CLI/desktop, or release acceptance.

Compare identical AMX source, module graph, and input values in the reference
AMX runtime and generated TypeScript. Compare explicit exports and structured
view events (shown table/chart snapshots and declaration-time diagram DTOs).
Do not compare HTML, PDF, DOCX, or renderer-private
objects.

| Requirement ID | Required behavior | Fixture / contract | Comparison and evidence | Owner | Preparation status |
| --- | --- | --- | --- | --- | --- |
| V20-S121-01 | Map every currently supported AST node/type and fail closed on unknown kinds | `ast-typescript-mapping.md`; `GOLD-AST-DOC-01`, `GOLD-AST-BINDING-01`, `GOLD-AST-NAME-01`, `GOLD-AST-LITERAL-01`, `GOLD-AST-TYPE-01`, `GOLD-AST-FUNCTION-01`, `GOLD-AST-MODULE-01`, `GOLD-AST-EXPR-01`, `GOLD-AST-LIST-01`, `GOLD-AST-RECORD-01`, `GOLD-AST-UNIT-01`, `GOLD-AST-TABLE-01`, `GOLD-AST-CHART-01`, `GOLD-AST-DIAGRAM-01`, `GOLD-AST-ERROR-01` | AST discriminant inventory; strict generated-source compilation; unknown-node rejection | S121/S123 | CONTRACT ACCEPTED; NOT RUN |
| V20-S121-02 | Preserve non-AMX Markdown as inert comments, including fences, blank lines, literal interpolation, and frontmatter | D121-02/13; `GOLD-COMMENT-01`, `GOLD-FRONTMATTER-01` | Compare normalized comment bodies/order; verify no interpolation evaluation and raw-source frontmatter retention | S121/S123 | CONTRACT ACCEPTED; NOT RUN |
| V20-S121-03 | Generate typed caller-supplied input parameters and runtime validation | D121-04/10/16; `GOLD-INPUT-01`, `GOLD-INPUT-RECORD-01`, `GOLD-INPUT-ENUM-BLOCKER-01` | Probe valid/invalid caller values against public helper and AMX; focused JSON/CSV enum tests | S121/S122/S123 | PASS for helper-boundary input and D121-16 focused tests; full emitter NOT RUN |
| V20-S121-04 | Return explicit entry exports and structured view events | D121-04/09/15; `GOLD-VIEW-01`, `GOLD-AST-DIAGRAM-01`, `GOLD-DIAGRAM-VIEW-BLOCKER-01` | Probe verifies exports, shown chart and empty declaration-time diagram DTO; full DTO surface remains an emitter gate | S121/S122/S123 | CONTRACT ACCEPTED; boundary PASS; full emitter NOT RUN |
| V20-S121-05 | Preserve AMX calculation semantics using the minimal public helper surface | D121-03/05; `GOLD-MEASURE-01`, `GOLD-AST-LIST-01`, `GOLD-AST-FUNCTION-01` | Imported helper fixture compiles/runs; measurement/list/builtin parity with field-specific numeric comparison | S121/S122/S123 | CONTRACT ACCEPTED; NOT RUN |
| V20-S121-06 | Settle TypeScript and module compatibility baseline | D121-06; `GOLD-MODULE-01` | TypeScript 5.9.3 strict no-emit fixture check and Bun 1.4.5 execution with `.ts` relative import | S121/S122 | PASS |
| V20-S121-07 | Transpile module graph and rewrite relative imports | D121-07; `GOLD-MODULE-01`, `GOLD-AST-MODULE-01` | Expected mirrored files/import specifiers, visibility, deterministic graph | S121/S123/S124 | CONTRACT ACCEPTED; NOT RUN |
| V20-S121-08 | Preserve module containment/cycle rules and avoid collisions/overwrite | `module-graph-and-diagnostics.md`; `GOLD-GRAPH-ESCAPE-01`, `GOLD-GRAPH-CYCLE-01`, `GOLD-GRAPH-COLLISION-01`, `GOLD-GRAPH-OVERWRITE-01`, `GOLD-GRAPH-CANCEL-01`, `GOLD-GRAPH-PUBLISH-FAIL-01` | Escape/cycle/collision/overwrite/cancel cases; no unexpected writes; publication failure reporting | S121/S124/S125 | CONTRACT ACCEPTED; behavior NOT RUN |
| V20-S121-09 | Reject parse/type-invalid documents without partial output | D121-01/12; `GOLD-AST-ERROR-01` | Source path/coordinates and output-root before/after inventory | S121/S123/S124 | CONTRACT ACCEPTED; NOT RUN |
| V20-S121-10 | Produce deterministic output and source-oriented diagnostics | D121-01/11/12; all golden fixtures | Repeated hashes; exact diagnostic identity/anchor; no absolute-path noise | S121/S123/S124 | CONTRACT ACCEPTED; NOT RUN |
| V20-S121-11 | Prove helper boundary for imported module, measurement, input, and shown view | D121-16/17; `GOLD-MODULE-01`, `GOLD-MEASURE-01`, `GOLD-INPUT-01`, `GOLD-VIEW-01`, `GOLD-DIAGRAM-VIEW-BLOCKER-01` | Public-subpath fixture typechecks/runs; reference oracle matches exports and ordered chart/diagram views | S121/S122 | PASS; see S121-PROBE-COMPILE-RUN |
| V20-S121-12 | Preserve calculation/data parity without rendering reports | `generated-runtime-contract.md`; all view fixtures | DTO comparison only; verify no HTML/PDF/DOCX/render dependency | S121/S123 | CONTRACT ACCEPTED; NOT RUN |
| V20-S121-13 | Preserve the V0.20 release/version/deployment/certification boundary | Requirements and acceptance scope audit | Changed-path audit; no release/package/deploy/certification command run | S121 | PASS |
| V20-S121-14 | Block rather than silently omit any current construct that cannot meet the confirmed contract | `acceptance.md`; `GOLD-AST-ERROR-01`; D121-15/16/17/18 | Enumerate unsupported constructs and preserve the accepted enum prerequisite and publication residual | S121 contract gate | CONTRACT ACCEPTED; NOT RUN |
| V20-S121-15 | Prevent source identifiers from colliding with generated public API names | D121-14; `GOLD-AST-NAME-01` | Compile and execute documents declaring `run` and `AMXRunInputs`; preserve their AMX values without shadowing wrappers/types | S121/S123 | CONTRACT ACCEPTED; NOT RUN |
| V20-S121-16 | Preserve diagram result semantics and enum-input parity without inventing behavior | D121-15/16/17; `GOLD-DIAGRAM-VIEW-BLOCKER-01`, `GOLD-INPUT-ENUM-BLOCKER-01` | Distinct diagram DTO matches the AMX oracle; checker/runtime enum validation passes focused JSON/CSV tests | Product owner | PASS for accepted contract and prerequisite scope; full emitter NOT RUN |
| V20-S121-17 | Define multi-file publication-failure recovery without claiming unsupported atomicity | D121-18; `module-graph-and-diagnostics.md`; `GOLD-GRAPH-PUBLISH-FAIL-01` | Best-effort rollback and per-path reporting accepted; crash atomicity remains an explicit residual | Product owner | CONTRACT ACCEPTED; behavior NOT RUN |

## Master-Plan Bullet Reconciliation

| Sprint 121 master-plan bullet | Contract/parity coverage | Status |
| --- | --- | --- |
| Complete AST-to-TypeScript mapping for every supported node | `ast-typescript-mapping.md`; V20-S121-01/14/15 | Inventory documented; re-audit at the authorized execution baseline |
| Specify comments, API, input validation, helpers, package path, compiler, graph, diagnostics, and destination safety | `generated-runtime-contract.md`; `module-graph-and-diagnostics.md`; V20-S121-02/03/04/06/07/08/09/10/15/16/17 | Contract decisions accepted; helper boundary and enum prerequisite focused evidence recorded; graph/emitter behavior remains for later sprints |
| Build golden fixtures and parity matrix | `golden-fixtures.md`; this matrix; fixture traceability below | Fixture coverage documented; no compiled parity evidence |
| Prove imported-module, measurement, input, and shown-view helper boundary | `GOLD-MODULE-01`, `GOLD-MEASURE-01`, `GOLD-INPUT-01`, `GOLD-VIEW-01`, `GOLD-DIAGRAM-VIEW-BLOCKER-01`; V20-S121-11 | PASS in approved run-01 against the public helper and reference-only AMX oracle |
| Record any unsupported construct or semantic gap as a blocking scope decision | D121-01..18; V20-S121-14/16/17 | Contract decisions recorded; implementation residuals explicit; no inference authorized |

## Golden-Fixture Traceability

Each listed fixture has a parity row. Prerequisite fixtures document known
source/runtime gaps; no fixture is represented as passing execution evidence.

| Fixture ID | Parity row(s) | Comparison or unresolved point |
| --- | --- | --- |
| `GOLD-MODULE-01` | V20-S121-06/07/11 | PASS: export value 12 exact; public helper and relative `.ts` import resolve |
| `GOLD-MEASURE-01` | V20-S121-05/11 | PASS: value 1000, normalized Length identity, display unit `meter`, and equality exact |
| `GOLD-INPUT-01` | V20-S121-03/11 | PASS: value 12 exact; string, missing, and non-finite caller values reject; AMX invalid JSON rejected |
| `GOLD-INPUT-RECORD-01` | V20-S121-03 | `null` and default 2 exact; unknown/missing key rejection; NOT RUN |
| `GOLD-INPUT-ENUM-BLOCKER-01` | V20-S121-03/16 | PASS: checker/runtime JSON and CSV validation tests; enum-specific public/AMX oracle parity not separately run |
| `GOLD-VIEW-01` | V20-S121-04/11/12 | PASS: `[2, 4]`, order, title, and `showTable` exact |
| `GOLD-DIAGRAM-VIEW-BLOCKER-01` | V20-S121-04/16 | PASS: empty declaration-time diagram DTO and order match the AMX oracle |
| `GOLD-COMMENT-01` | V20-S121-02 | Normalized comment lines and content exact |
| `GOLD-FRONTMATTER-01` | V20-S121-02 | Accepted raw-source handoff and normalized inert comment output; NOT RUN |
| `GOLD-AST-DOC-01` | V20-S121-01/02 | Document order and shared environment exact |
| `GOLD-AST-BINDING-01` | V20-S121-01/05 | Binding and mutation results exact |
| `GOLD-AST-NAME-01` | V20-S121-01/15 | Deterministic collision-free generated names |
| `GOLD-AST-LITERAL-01` | V20-S121-01 | Scalar values exact; interpolation uses AMX formatting |
| `GOLD-AST-TYPE-01` | V20-S121-01 | Strict generated typecheck and record/enum values |
| `GOLD-AST-FUNCTION-01` | V20-S121-01/05 | Return values and evaluation order exact |
| `GOLD-AST-MODULE-01` | V20-S121-01/07/08 | Visibility, identity, and graph edges exact |
| `GOLD-AST-EXPR-01` | V20-S121-01/05 | Selected values and lazy evaluation exact |
| `GOLD-AST-LIST-01` | V20-S121-01/05 | 1-based operations, order, and errors exact |
| `GOLD-AST-RECORD-01` | V20-S121-01 | Record shape and field access exact |
| `GOLD-AST-UNIT-01` | V20-S121-01/05 | Affine C-to-F value 31.999999999999986; absolute and relative tolerances 1e-12 |
| `GOLD-AST-TABLE-01` | V20-S121-01/04/12 | Ordered columns, rows, labels, and nulls exact |
| `GOLD-AST-CHART-01` | V20-S121-01/04/12 | Series/data order and `showTable` exact |
| `GOLD-AST-DIAGRAM-01` | V20-S121-01/04/12/16 | Empty scene/frame boundary PASS; recursive diagram family fixtures remain NOT RUN |
| `GOLD-AST-ERROR-01` | V20-S121-01/09/10/14 | Diagnostic identity/anchor and no partial output |
| `GOLD-GRAPH-NEST-01` | V20-S121-07/08 | Mirrored paths and rewritten edges exact |
| `GOLD-GRAPH-ESCAPE-01` | V20-S121-08 | Containment rejection; no writes |
| `GOLD-GRAPH-CYCLE-01` | V20-S121-08 | Cycle rejection; no writes |
| `GOLD-GRAPH-COLLISION-01` | V20-S121-08 | Normalized/case-fold collision rejection; no writes |
| `GOLD-GRAPH-OVERWRITE-01` | V20-S121-08 | Default refusal and explicit overwrite behavior |
| `GOLD-GRAPH-CANCEL-01` | V20-S121-08 | Cancellation preserves destination contents |
| `GOLD-GRAPH-NOPARTIAL-01` | V20-S121-09 | Invalid dependency rejects complete graph |
| `GOLD-GRAPH-PUBLISH-FAIL-01` | V20-S121-08/17 | Best-effort rollback and per-path failure state; accepted no-crash-atomicity residual; NOT RUN |
| `GOLD-GRAPH-DETERMINISM-01` | V20-S121-10 | Generated bytes and relative paths identical |

## Comparison Policy

- Compare primitive values exactly unless a case identifies a floating-point
  calculation whose AMX and generated evaluation may differ by operation
  ordering. For those numbers, S121 must approve an explicit absolute/relative
  tolerance and record it per field; no generic loose tolerance is allowed.
- Compare measurement dimension identity, display unit name, and result shape
  exactly. Compare displayed and physical numeric values under the case's
  approved tolerance.
- Compare record keys/values, list order, explicit export names, view order,
  chart series/table row order, null positions, and diagram element order
  exactly.
- Compare errors by accepted diagnostic identity and source/input path. Do not
  compare engine stack traces or generated TypeScript line numbers as AMX
  source coordinates.
- Hash generated files and record toolchain/configuration. A hash proves
  deterministic artifact identity for that run, not semantic parity alone.

## Reconciliation Checklist

Before disposition, reconcile every master-plan S121 bullet against this
matrix, all `GOLD-*` fixture IDs, the AST mapping, and diagnostic/output
contracts. Record exact counts, duplicates, missing IDs, unowned requirements,
unresolved decisions, raw statuses, and the separate owner disposition. Any
unsupported current AST family or semantic mismatch blocks the full emitter
gate; it is not silently deferred to S123.