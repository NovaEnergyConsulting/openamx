# Sprint 090 Builder Evidence and Closeout

## Builder recommendation

**BLOCKED/OPEN — the required architecture approval is not established.**

The inventory and proposed information architecture are complete as
contract evidence in this sprint folder. The proposal identifies the current
corpus, live path-sensitive consumers, numbered learning sequence, feature
coverage, offline dependency closure, link behavior, output dispositions
and future acceptance fixtures. It also records product decisions still
requiring approval. The architecture is not locked, no corpus migration is
authorized, and Sprint 091 must not start while the separate disposition is
pending.

## Authorization, state and preservation record

- Sprint 090 execution and the exact three-file evidence plan were separately
  approved by the user before inventory execution.
- Starting branch: `feat/create-V015`.
- Starting commit: `596e4081d75a9e1e0f8cc9871a592b33766d2551`.
- Starting worktree: clean. No pre-existing changes were overwritten.
- Approved new evidence files:
  - `planning/sprints/0090-v15-example-information-architecture/corpus-inventory-and-reference-trace.md`
  - `planning/sprints/0090-v15-example-information-architecture/final-information-architecture-and-feature-matrix.md`
  - `planning/sprints/0090-v15-example-information-architecture/builder-evidence-and-closeout.md`
- No other path was in the write plan. Existing examples, all generated
  outputs, test results, screenshots, logs, product files, package files,
  live docs, `planning/STATUS.json`, prior sprint evidence and historical
  records were preserved.
- The `examples/kitchen-sink.pdf` SHA-256 recorded at inventory was
  `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778`.
  It is user-supplied and immutable; it was not opened for conversion,
  regenerated, overwritten or removed.

## Separate disposition follow-up

On 2026-10-18, the user confirmed acting in the Lead Developer/product-owner
capacity. The structured disposition selected `ACCEPTED/CLOSED`, but the
accompanying approval text said: “BLOCKED/OPEN — current blocker list and
owners stand; architecture not approved.” These statements conflict. Because
the approval text explicitly withholds architecture approval, this response
does not satisfy the separate `ACCEPTED/CLOSED` exit gate. Sprint 090 remains
`BLOCKED/OPEN`; no architecture decision or exception is recorded as
approved. Obtain an unambiguous disposition before locking the contract or
starting Sprint 091.

## Evidence methods and reviewed surfaces

1. Enumerated `examples/` recursively with hidden entries enabled and
   cross-checked the 30 file paths against Git's tracked-file index and
   example-scoped worktree status. Read the source documents, local
   libraries, JSON/CSV fixtures, hidden project metadata and the four HTML
   outputs' existing test/generation contracts. Recorded the protected PDF's
   baseline hash without changing it.
2. Searched repository text for both slash styles and direct example paths.
   The broad search surfaced 145 files, with historical sprint/state/
   decision/evidence occurrences separated from active migration targets.
   Explicitly checked `.github/skills/amx-authoring/SKILL.md`, which is
   hidden from default ripgrep traversal, and separately inspected current
   root/desktop/VS Code guidance.
3. Inspected root and desktop package scripts; `tests/examples.test.ts`,
   `tests/formatter.test.ts`, `tests/reportPdf.test.ts`, the desktop chart
   security UI fixture and starter tests; release CLI smoke code/docs; the
   desktop Help, Welcome, project-creation service and Electrobun resource
   map; local-link tests and resolver; V0.12, V0.13 and V0.14 specs; the
   V0.15 master plan and Sprint 090 documents; and Sprint 089
   `builder-evidence.md`.
4. Recorded direct active path consumers and future owners in
   `corpus-inventory-and-reference-trace.md`. Historical sprint records and
   probes remain immutable and are not claimed to be migrated.

No test, build, formatter, CLI run, renderer, export, package, desktop app,
release command or network-dependent workflow was executed. No generated
outputs were produced. Therefore there is no Sprint 090 evidence of example
execution, report rendering, offline package completeness, native desktop
behavior, release or platform certification. Sprint 089 acceptance/closeout
is noted only as historical context.

## Acceptance evidence matrix

`PASS` below means the Sprint 090 **inventory/contract document evidence**
exists; it does not mean a future lesson, runtime, renderer, package or
desktop fixture ran. Future fixture execution is shown separately.

| Acceptance ID | Sprint 090 evidence and status | Future execution status / owner |
| --- | --- | --- |
| `V15-IA-INV-01` | **PASS — inventory evidence.** The forced tree census, Git cross-check and 30-row file-by-file disposition/dependency/package table are in `corpus-inventory-and-reference-trace.md`. | `NOT RUN` as a future migration regression test. Owner: Sprint 092. |
| `V15-IA-INV-02` | **PASS — trace evidence.** Active docs, tests, scripts, release, desktop resource/project creation, starter and link consumers are listed with paths, locations, migration impacts and owners. Historical matches are identified as non-migration evidence. | `NOT RUN` as a future all-reference migration gate. Owners: Sprints 093/094. |
| `V15-IA-INV-03` | **PASS — preservation evidence.** No file disposition was executed; inventory records baseline worktree and immutable PDF hash. Final workspace state is checked after writing these evidence files only. | No corpus migration authorized in Sprint 090. Owner: Builder. |
| `V15-IA-CUR-01` | **PASS — proposal evidence.** The IA proposes one `00_` index and sequential `01`-`14` documents, with guided versus standalone roles and no numbering gaps. | `NOT RUN` against migrated AMX files. Owner: Sprint 091/092. |
| `V15-IA-CUR-02` | **PASS — contract evidence.** Lesson 01 is explicitly input-free/import-free; later support dependencies are introduced after their concepts; report 12 is a destination. | `NOT RUN` for CLI/desktop execution. Owner: Sprint 091/094. |
| `V15-IA-FEAT-01` | **PASS — matrix evidence.** The matrix traces core workflows and every V0.14 family, including detailed `is`, math/Measurement, text, Unicode and formatting behaviors, to proposed destinations and fixture IDs. | `NOT RUN` for example/runtime feature verification. Owner: Sprint 092/094. |
| `V15-IA-NAV-01` | **PASS — navigation contract evidence.** The IA specifies relative `.amx` links, complete index coverage, lesson boundaries and contained-link requirements using existing behavior. | `NOT RUN` against future linked files. Owner: Sprint 091/094. |
| `V15-IA-PKG-01` | **PASS — boundary proposal.** The canonical source, allowlisted lessons/data/libraries/negative fixture closure and explicit exclusions are listed. Current absence of a desktop example resource is recorded. | `NOT RUN`; current app does not package the guide. Owner: Sprint 093. |
| `V15-IA-PKG-02` | **NOT RUN.** Offline packaged project creation, opening the index and completing the journey require future desktop implementation and native/package evidence. | `NOT RUN`; owner: Sprint 093 desktop, Sprint 094 closeout. |
| `V15-IA-PKG-03` | **PASS — preservation contract evidence.** Both current compact starters are recorded as separate, input-free quick starts and must remain distinct. | `NOT RUN` after adding the guide choice. Owner: Sprint 093/094 desktop. |
| `V15-IA-OUT-01` | **PASS — inventory/policy evidence.** All four HTML outputs have explicit proposed removal criteria and dependent tests; the PDF is recorded as user-supplied/immutable with a hash. No output was regenerated or removed. | `NOT RUN`; any change is gated on later approval and tests. Owners: product owner, Sprint 092/094. |
| `V15-IA-RUN-01` | **NOT RUN.** Current tests were inspected, not executed; future fixture contract specifies exact input mapping and binding/unit assertions. | `NOT RUN`; owner: Sprint 094 root. |
| `V15-IA-RUN-02` | **PASS — fixture contract evidence.** The invalid JSON/CSV fixtures, expected `AMX4003` field-path outcomes, aggregate/fail-fast distinction and absent output expectation are identified. | `NOT RUN`; owner: Sprint 094 root. |
| `V15-IA-RENDER-01` | **PASS — fixture contract evidence.** Temporary output destinations and structural/content assertions are required; stale checked-in HTML is not retained by default. | `NOT RUN`; owner: Sprint 094 renderer/root. |
| `V15-IA-TRACE-01` | **PASS — traceability evidence.** Master-plan scope maps through proposed filenames, support dependencies and stable fixture IDs; exceptions and owners are explicit. | Product-owner review pending; future closeout audit owned by Sprint 094. |
| `V15-IA-GATE-01` | **BLOCKED/OPEN.** A separate response was received, but its `ACCEPTED/CLOSED` selection conflicts with the accompanying text that says the architecture is not approved. No unambiguous acceptance is recorded. | Do not start Sprint 091. Owner: Lead Developer/product owner. |

### Proposal-level fixture outcomes

The exact future fixture actions, expected results, evidence methods and
owning later sprints are defined in the IA document. Their statuses are
`NOT RUN` unless a current inventory/contract status is explicitly shown
above. In particular:

- `V15-IA-INV-03` is limited to the no-migration preservation check and
  immutable PDF hash; it does not establish output rendering.
- `V15-IA-PKG-01/02/03` do not establish current package contents or native
  application behavior. The desktop source currently embeds only
  single-document starters and has no guide-resource mapping or
  multi-file project-copy path.
- `V15-IA-RUN-*` and `V15-IA-RENDER-*` are future test contracts. Source,
  test and specification inspection is not runtime/render evidence.
- `V15-IA-GATE-01` remains blocked until a separate dated decision records
  `ACCEPTED/CLOSED` with approved architecture/exceptions or
  `BLOCKED/OPEN` with remaining owners.

## Open decisions and risks

| Decision/risk | Builder recommendation | Owner / gate |
| --- | --- | --- |
| Final sequence and the precise reference roles for route measurements and battery-resistor | Approve or amend the 00-14 proposal in the IA document. | Lead Developer/product owner; before Sprint 091. |
| Kitchen Sink and V0.5 source paths, test-only fixture layout and required local-library closure | Keep regression coverage but separate test fixtures from the distributed learning guide. | Product owner and root test owner; Sprint 092/094. |
| Four generated HTML snapshots | Remove from the example corpus only after tests assert relevant content on temporary renders; do not regenerate in place. | Product owner; Sprint 092/094. |
| Tracked `.openamx/local.json` | Exclude from any package; decide later whether to remove from canonical examples or preserve as a legacy fixture. | Product owner / desktop maintainer; Sprint 092/093. |
| Offline guide project destination and default `report.amx` interaction | On a guided selection, materialize the allowlisted corpus at the empty project root and open the index without changing normal creation or quick starts. | Product owner / desktop maintainer; Sprint 093. |
| Electrobun resource staging and canonical/package parity mechanism | Use an allowlisted build-time resource derived from `examples/`, never a hand-maintained mirror; verify its exact resource path in Sprint 093. | Desktop maintainer; Sprint 093. |
| Historical V0.1 spec snippets | Preserve history unless a product/documentation owner explicitly chooses current-path rewrites. | Product owner / documentation owner; Sprint 093. |
| Product-owner disposition | Builder's recommendation remains `BLOCKED/OPEN`; do not infer acceptance from the conflicting `ACCEPTED/CLOSED` selection when the accompanying approval text expressly withholds architecture approval. | Lead Developer/product owner; Sprint 090 exit gate. |

## Closeout request

Please resolve the contradictory disposition response with an unambiguous
Lead Developer/product-owner decision in an authorized Sprint 090 evidence
record. Until acceptance is explicit and consistent with the approved
architecture/exceptions, keep Sprint 090 `BLOCKED/OPEN`, treat every
filename/layout/package choice above as a proposal, and do not start Sprint
091.
