# Sprint 090 Acceptance Criteria

Sprint 090 is complete when the example-corpus inventory, information
architecture, and acceptance contract are complete, traceable to the
approved V0.15 master plan, and separately reviewed/accepted by the Lead
Developer/product owner. This is a contract-only sprint. Passing its
documentation checks does not validate example execution, rendering, desktop
packaging, or product behavior and does not authorize Sprint 091.

## Requirement-to-Evidence Matrix

Every row must have an evidence location and status in the Sprint 090
Builder record. `PASS`, `FAIL`, `BLOCKED`, and `NOT RUN` are not
interchangeable; every blocked or not-run item has a reason and owner.

| ID | Acceptance requirement | Minimum evidence |
|---|---|---|
| `V15-IA-INV-01` | Every file under the current `examples/` tree is inventoried, including hidden files, inputs, modules, outputs, and fixtures. | Exact current path, file role/type, provenance where known, dependencies/consumers, proposed disposition, rationale, and package need. |
| `V15-IA-INV-02` | Direct references and path-sensitive consumers are traced beyond the examples directory. | Search/review surfaces and method, referring file/location, referenced path or directory, impact of a rename/move, and future owner sprint/test. |
| `V15-IA-INV-03` | No file disposition is executed as part of Sprint 090. | Before/after file-state evidence for approved scope; no corpus or product paths changed. |
| `V15-IA-CUR-01` | The final proposal has one primary `00_` AMX index and an ordered, desktop-first path. | Named filenames/titles, sequence, role, objective, prerequisites, input assumptions, and navigation destination for each retained instructional/reference document. |
| `V15-IA-CUR-02` | The opening lesson is small, input-free, immediately runnable, and needs no external module; later lessons expose their dependencies. | Explicit lesson contract and dependency/input table; complete report explicitly marked destination, not prerequisite. |
| `V15-IA-CUR-03` | The naming rule covers all retained instructional/reference `.amx` files. | Unique sequential two-digit prefixes, informative titles, no unexplained gap or unnumbered retained instructional file; support files excluded from lesson numbering. |
| `V15-IA-FEAT-01` | All required feature families map to concrete lessons/references. | Requirement-to-feature-to-file matrix covers master-plan workflows and every user-facing V0.14 family; combined lessons have rationale and each row has a future verification ID. |
| `V15-IA-NAV-01` | The index and guide navigation contract is complete and uses existing supported behavior. | Relative AMX link rules; index-to-every-retained-guide/reference coverage; per-lesson index/previous/next rules including boundaries; link containment and safe confirmation requirements. |
| `V15-IA-PKG-01` | The offline desktop package boundary is explicit and self-contained. | Canonical-source statement; complete required lesson/data/library dependency closure; explicit exclusions; destination layout; no remote dependency; package parity/check owner. |
| `V15-IA-PKG-02` | The guided journey is discoverable while quick starters remain clear. | Required desktop entry-point behavior through existing Welcome/Starter Examples; distinct labels/roles for the guide versus Hello and Operations Note quick starts; no UI redesign. |
| `V15-IA-OUT-01` | Every generated/current output has an explicit disposition and provenance status. | Per-file decision; retained outputs satisfy purpose, reproducibility, and content-test criteria. `examples/kitchen-sink.pdf` is marked user-supplied/immutable and is neither overwritten nor removed. |
| `V15-IA-RUN-01` | Runnable and intentionally invalid examples have unambiguous future acceptance. | Each example has input mappings, expected bindings/units or exact expected diagnostics; invalid-only cases are clearly labeled and excluded from beginner steps unless intentionally required. |
| `V15-IA-RENDER-01` | Representative rendered/report output requirements are proportionate and testable. | Structural/user-visible assertions and normalization policy for any retained output; test surface and owning sprint; no unsupported rendering or accessibility claim. |
| `V15-IA-TRACE-01` | The final contract has no uncovered or silently decided requirement. | Traceability from every applicable master-plan requirement through inventory/proposed file/acceptance ID; unresolved decisions, owner, and disposition are explicit. |
| `V15-IA-GATE-01` | Review and authorization boundaries are honored. | Separate Lead Developer/product-owner disposition is recorded. If pending or blocked, Sprint 090 remains open and Sprint 091 is not started. |

## Contract Coverage

- The feature matrix covers Markdown and AMX document structure; bindings,
  expressions, conditionals, collections, and functions; typed records,
  enums, inheritance, and local modules; Measurements/units; mapped JSON/CSV
  inputs and validation; named outputs; tables, charts, diagrams, and report
  workflows; and all user-facing V0.14 feature families.
- The V0.14 family is not reduced to a version label: runtime type
  predicates, math functions/constants and domains, Measurement-aware
  standard-library operations, text behavior, and numeric formatting each
  have explicit coverage and expected observable behavior tied to the
  authoritative specification.
- Any master-plan family lacking a useful instructional demonstration is
  called out for decision; it is not omitted or represented as already
  verified.
- Every retained example and support/output file has one disposition and a
  reason. Duplicate demonstrations, unrelated standalone examples, and
  unreferenced generated files are explicitly resolved.
- The chosen scenario is supported by the actual corpus and does not
  introduce new AMX features, unsupported claims, or mandatory external
  services.

## Sprint Boundaries and Evidence

- No source, tests, live references, example files, package configuration,
  user-facing documentation, version/status ledger, or historical sprint
  record is changed under the Sprint 090 plan.
- No generated output is written, cleaned, or replaced; the protected
  user-supplied `examples/kitchen-sink.pdf` remains untouched.
- Search and inspection evidence states what was checked and its limitations.
  A partial `rg` search is not reported as complete if resource copying,
  package configuration, or directory-level consumers were not inspected.
- Documentation links, headings, matrix identifiers, and filenames are
  internally consistent. The reviewed contract does not claim execution,
  render, desktop-package, or native UAT results.
- Any proposed deviation from the V0.15 master plan, any unresolved
  package/navigation capability, and any proposed output deletion is
  presented for explicit product-owner decision before approval.

## Required Closeout Disposition

The Builder submits a recommendation and a list of residual decisions. The
Lead Developer/product owner separately records either:

- `ACCEPTED/CLOSED` with the approved architecture and any named exceptions
  and owners; or
- `BLOCKED/OPEN` with required decisions/evidence and owners.

An accepted Sprint 090 contract is the prerequisite for Sprint 091. It does
not itself authorize file moves, implementation, release, or publication.
