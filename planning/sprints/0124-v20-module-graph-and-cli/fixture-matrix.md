# Sprint 124 Graph and CLI Fixture Matrix

## Status and Evidence Rules

Architect-prepared S124 fixture inventory. Fixtures are not implementation
evidence. Retain every `G124-*` ID in tests or Builder evidence. Each executed
row records exact source tree, canonical root, output tree, command, host, raw
status, and resulting path/hash manifest.

S123 is accepted with residuals. Preserve its raw retry-cap process `FAIL` and
all incomplete G123 `BLOCKED/UNAVAILABLE`/`NOT RUN` rows. A successful graph
case does not upgrade unrelated emitter cases.

## Graph Resolution Fixtures

| ID | Shape | Expected result |
| --- | --- | --- |
| G124-GRAPH-ENTRY-01 | Single entry module, no imports, nested entry path. | One module ID; source path canonical; output path mirrors entry relative to default import root and replaces `.amx` with `.ts`. |
| G124-GRAPH-NESTED-01 | Entry -> nested module -> shared leaf with imports in source order. | Each canonical module read once; dependency-first order; exact S123 module IDs and `resolvedImports`; output specifiers resolve within graph. |
| G124-GRAPH-SHARED-01 | Two importers refer to the same canonical dependency through normalized paths. | One module record and one output target; both import mappings resolve to it. |
| G124-GRAPH-ROOT-DEFAULT-01 | Entry with relative sibling imports and no `--import-root`. | Entry directory is canonical import root, matching existing loader. |
| G124-GRAPH-ROOT-EXPLICIT-01 | Entry under explicit canonical `--import-root`. | Graph accepted only when entry/dependencies remain inside that root. |
| G124-GRAPH-ESCAPE-01 | Relative import or symlink resolves outside import root. | Reject after realpath with existing `AMX5001` semantics; no output writes. |
| G124-GRAPH-SYMLINK-01 | Import path uses symlink to in-root/out-of-root source. | Canonical identity deduplicates in-root aliases; out-of-root target rejects. |
| G124-GRAPH-CYCLE-01 | Direct and multi-module import cycle. | `AMX5003` with ordered canonical/project-relative cycle context; no output writes. |
| G124-GRAPH-MISSING-01 | Missing/unreadable dependency. | `AMX5001` at importing module/path; no graph published. |
| G124-GRAPH-SYNTAX-01 | Absolute, bare, URL, backslash, wrong case/extension or missing `./`/`../`. | Existing invalid import path policy; no filesystem escape or package lookup. |
| G124-GRAPH-IMPORT-ORDER-01 | Import after executable item. | Reject under existing import-before-code `AMX5001` behavior. |
| G124-GRAPH-IMPORT-DUP-01 | Duplicate imported names or imported/local collision, including dimension/unit names. | Preserve exact `AMX5002` or `AMX3008` semantic distinction. |
| G124-GRAPH-EXPORT-01 | Import exported/private/missing names across values, functions, types, enums, dimensions and units. | Only explicit exports visible; missing/private names preserve `AMX5002`/`AMX3008`. |
| G124-GRAPH-ENTRY-INPUT-01 | Input declaration in entry and in imported module. | Entry accepted; imported input rejected as existing `AMX3005`. |
| G124-GRAPH-PARSE-01 | Valid dependency plus malformed AMX/frontmatter in later dependency. | Preserve parser diagnostic/source path; no S123 call/output graph. |
| G124-GRAPH-TYPE-01 | Graph parses but one dependency fails typecheck. | Source-local type diagnostic; no S123 call/output graph. |
| G124-GRAPH-UNREACHABLE-01 | Supplied internal graph includes a module not reachable from entry. | Resolver does not send unrelated modules; S123 graph validator remains defense-in-depth. |
| G124-GRAPH-NO-EVAL-01 | AMX source includes a function/statement that would be observable if evaluated. | Graph loading parses/checks only; no AMX runtime side effect or output occurs. |

## Path Mapping and Preflight Fixtures

| ID | Shape | Expected result |
| --- | --- | --- |
| G124-PATH-MIRROR-01 | Root `main.amx`, `lib/types.amx`, deeper `lib/units/si.amx`. | Outputs `main.ts`, `lib/types.ts`, `lib/units/si.ts` under out-dir. |
| G124-PATH-IMPORT-01 | Nested graph with `../` and `./` edges. | S123-generated relative `.ts` specifiers resolve to exact mapped graph targets. |
| G124-PATH-SOURCE-COLLIDE-01 | Source and output roots alias or output target points at source `.amx`/source tree file. | Reject before write; no source or unrelated file changed. |
| G124-PATH-TRAVERSAL-01 | Malicious or malformed output-relative `..`, absolute, empty, backslash path. | Reject graph/result or destination before filesystem write. |
| G124-PATH-CASE-01 | Distinct modules map to same path after case-fold/normalization. | Detect on every host and report both source/target paths. |
| G124-PATH-FILEDIR-01 | One graph target is a parent path of another (file vs directory conflict). | Detect during preflight; write nothing. |
| G124-PATH-EXISTING-01 | Existing target and no `--overwrite`. | Refuse all conflicts; preserve all existing bytes/hashes. |
| G124-PATH-OVERWRITE-01 | Existing graph target with explicit `--overwrite`. | Replace only graph-owned target files; preserve unrelated files. |
| G124-PATH-UNRELATED-01 | Output root contains unrelated files/directories. | Preserve them unchanged through success and all failures. |
| G124-PATH-DETERMINISM-01 | Same graph/output root mapped twice with same options. | Exact generated bytes, path manifest and import edges are identical. |

## Publication, Rollback, and CLI Fixtures

| ID | Shape | Expected result |
| --- | --- | --- |
| G124-PUBLISH-STAGE-FAIL-01 | Inject failure while staging a middle graph module. | Final targets unchanged; report stage failure; remove only known staged files. |
| G124-PUBLISH-FIRST-FAIL-01 | Inject failure on first target publish. | No success result; rollback/original preservation verified and reported per target. |
| G124-PUBLISH-AFTER-ONE-FAIL-01 | Publish one module then fail on next. | Best-effort reverse rollback; every path reports published/restored/unrecovered accurately. |
| G124-PUBLISH-ROLLBACK-FAIL-01 | Inject failure during rollback itself. | Preserve primary and rollback errors; list unrecovered path; nonzero exit; no atomicity claim. |
| G124-PUBLISH-CANCEL-01 | User cancels any separately approved confirmation/destination interaction. | No final graph change; cancellation is distinct from error and success. |
| G124-PUBLISH-CRASH-BOUNDARY-01 | Process/power loss not simulated or is safely simulated. | Raw `NOT RUN` unless directly proven; D121-18 no-crash-atomicity residual remains regardless. |
| G124-CLI-HELP-01 | `openamx transpile --help` and root help. | Syntax/options/explicit destination/overwrite policy visible; existing command help unchanged. |
| G124-CLI-SUCCESS-01 | Nested valid graph. | Exit 0; all expected files; entry path/count reported; no generated execution. |
| G124-CLI-ERROR-01 | Parse, type, import, cycle, containment, output collision and publish failure. | Nonzero exit and correct source/output diagnostics; no false success message. |
| G124-CLI-SPACES-01 | Entry, import root, and output root include spaces. | Argument/path handling works on supported host without shell interpolation. |
| G124-CLI-NOEXEC-01 | Generated graph includes observable run-time statements. | CLI transpile does not execute generated code or call AMX evaluator. |
| G124-CLI-COMPILE-01 | Successful output graph compiled by test-only TypeScript command. | Strict compile/import resolution passes; compiler is not invoked by CLI. |

## S123 Residual Carry Matrix

| S123 row | Entering status | S124 treatment |
| --- | --- | --- |
| E123-AST-01 | BLOCKED/UNAVAILABLE; full unique AST fixture reconciliation incomplete. | Preserve as incomplete emitter coverage; graph tests cannot mark it PASS. |
| E123-HELPER-01 | BLOCKED/UNAVAILABLE; full helper-family audit incomplete. | Use S122 public API only; add no private dependency and do not claim full helper audit. |
| E123-SOURCE-01 | BLOCKED/UNAVAILABLE; arbitrary non-ASCII emitter case incomplete. | Preserve; S124 path tests may cover Unicode paths but do not upgrade emitter prose case. |
| E123-PARITY-01 | BLOCKED/UNAVAILABLE; affine, complete builtin/input and some view coverage incomplete. | Preserve; S124 CLI/graph success is not AMX parity. |
| E123-REJECT-01 | BLOCKED/UNAVAILABLE; unknown-lowering direct golden incomplete. | Preserve; CLI parse/type failures are separate. |
| S123-RETRY-STOP-01 | FAIL accepted as process residual. | Preserve raw failure and owner disposition; S124 follows its own approved retry cap. |

## Traceability

Every S124 master-plan bullet maps to a graph/path/CLI/publication fixture
above. Before acceptance, reconcile fixture counts, duplicate/missing IDs,
raw status and owning row in `builder-evidence.md`. A S124 pass does not
resolve S123 residual rows.