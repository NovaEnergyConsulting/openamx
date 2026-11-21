# Sprint 121 Requirement-to-Parity Matrix

## Status and Evidence Rules

Architect-prepared traceability draft. `CANDIDATE` denotes a proposed
contract; `NOT RUN` denotes no qualifying execution evidence. A successful
source audit or isolated helper probe does not establish full emitter,
CLI/desktop, or release acceptance.

Compare identical AMX source, module graph, and input values in the reference
AMX runtime and generated TypeScript. Compare explicit exports and structured
shown-view data only. Do not compare HTML, PDF, DOCX, or renderer-private
objects.

| Requirement ID | Required behavior | Fixture / contract | Comparison and evidence | Owner | Preparation status |
| --- | --- | --- | --- | --- | --- |
| V20-S121-01 | Map every currently supported AST node/type and fail closed on unknown kinds | `ast-typescript-mapping.md`; `GOLD-AST-DOC-01`, `GOLD-AST-BINDING-01`, `GOLD-AST-NAME-01`, `GOLD-AST-LITERAL-01`, `GOLD-AST-TYPE-01`, `GOLD-AST-FUNCTION-01`, `GOLD-AST-MODULE-01`, `GOLD-AST-EXPR-01`, `GOLD-AST-LIST-01`, `GOLD-AST-RECORD-01`, `GOLD-AST-UNIT-01`, `GOLD-AST-TABLE-01`, `GOLD-AST-CHART-01`, `GOLD-AST-DIAGRAM-01`, `GOLD-AST-ERROR-01` | AST discriminant inventory; strict generated-source compilation; unknown-node rejection | S121/S123 | CANDIDATE; NOT RUN |
| V20-S121-02 | Preserve non-AMX Markdown as inert comments, including fences, blank lines, literal interpolation, and the dispositioned frontmatter boundary | D121-02/13; `GOLD-COMMENT-01`, `GOLD-FRONTMATTER-01` | Compare normalized comment bodies/order; verify no interpolation evaluation and resolve frontmatter retention | S121/S123 | CANDIDATE; NOT RUN |
| V20-S121-03 | Generate typed caller-supplied input parameters and runtime validation | D121-04/10; `GOLD-INPUT-01` | Valid result parity; invalid/missing input throws before execution with no result | S121/S122/S123 | CANDIDATE; NOT RUN |
| V20-S121-04 | Return explicit entry exports and structured shown-view data | D121-04/09; `GOLD-VIEW-01` | Compare names, types, view kind/order, data and showTable selection | S121/S122/S123 | CANDIDATE; NOT RUN |
| V20-S121-05 | Preserve AMX calculation semantics using the minimal public helper surface | D121-03/05; `GOLD-MEASURE-01`, `GOLD-AST-LIST-01`, `GOLD-AST-FUNCTION-01` | Imported helper fixture compiles/runs; measurement/list/builtin parity | S121/S122/S123 | CANDIDATE; NOT RUN |
| V20-S121-06 | Settle TypeScript and module compatibility baseline | D121-06; `GOLD-MODULE-01` | Strict typecheck and execution using documented `.ts` import setup and supported tool versions | S121/S122 | CANDIDATE; NOT RUN |
| V20-S121-07 | Transpile module graph and rewrite relative imports | D121-07; `GOLD-MODULE-01`, `GOLD-AST-MODULE-01` | Expected mirrored files/import specifiers, visibility, deterministic graph | S121/S123/S124 | CANDIDATE; NOT RUN |
| V20-S121-08 | Preserve module containment/cycle rules and avoid collisions/overwrite | `module-graph-and-diagnostics.md`; `GOLD-GRAPH-ESCAPE-01`, `GOLD-GRAPH-CYCLE-01`, `GOLD-GRAPH-COLLISION-01`, `GOLD-GRAPH-OVERWRITE-01`, `GOLD-GRAPH-CANCEL-01` | Escape/cycle/collision/overwrite/cancel cases; no unexpected writes | S121/S124/S125 | CANDIDATE; NOT RUN |
| V20-S121-09 | Reject parse/type-invalid documents without partial output | D121-01/12; `GOLD-AST-ERROR-01` | Source path/coordinates and output-root before/after inventory | S121/S123/S124 | CANDIDATE; NOT RUN |
| V20-S121-10 | Produce deterministic output and source-oriented diagnostics | D121-01/11/12; all golden fixtures | Repeated hashes; exact diagnostic identity/anchor; no absolute-path noise | S121/S123/S124 | CANDIDATE; NOT RUN |
| V20-S121-11 | Prove helper boundary for imported module, measurement, input, and shown view | `GOLD-MODULE-01`, `GOLD-MEASURE-01`, `GOLD-INPUT-01`, `GOLD-VIEW-01` | Compile and execute one combined graph; compare exports/views with AMX runtime | S121/S122 | CANDIDATE; NOT RUN |
| V20-S121-12 | Preserve calculation/data parity without rendering reports | `generated-runtime-contract.md`; all view fixtures | DTO comparison only; verify no HTML/PDF/DOCX/render dependency | S121/S123 | CANDIDATE; NOT RUN |
| V20-S121-13 | Preserve the V0.20 release/version/deployment/certification boundary | Requirements and acceptance scope audit | Changed-path and command audit; no release/package action | S121 | PASS PREPARATION SCOPE; execution NOT RUN |
| V20-S121-14 | Block rather than silently omit any current construct that cannot meet the confirmed contract | `acceptance.md`; `GOLD-AST-ERROR-01`; unresolved decision register | Enumerate unsupported constructs and obtain explicit owner disposition before S121 acceptance | S121 contract gate | CANDIDATE; NOT RUN |
| V20-S121-15 | Prevent source identifiers from colliding with generated public API names | D121-14; `GOLD-AST-NAME-01` | Compile and execute documents declaring `run` and `AMXRunInputs`; preserve their AMX values without shadowing wrappers/types | S121/S123 | CANDIDATE; NOT RUN |

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