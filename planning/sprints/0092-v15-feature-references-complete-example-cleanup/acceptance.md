# Sprint 092 Acceptance Criteria

Sprint 092 is complete when the accepted 00-14 information architecture is
implemented in the canonical example corpus, V0.14 feature references and
the complete report meet their contracts, corpus changes are traceable and
safe, and a separate Lead Developer/product-owner disposition is recorded.

Sprint 090 and 091 are accepted/closed prerequisites. Sprint 092 itself
requires separate explicit execution authorization and an approved
file/test/output plan before implementation.

## Requirement-to-Evidence Matrix

Record each row as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`. Cite exact
commands/actions, fixtures, results, evidence paths, and residual owners.
`PASS` for one example is not evidence for another feature family or surface.

| ID | Acceptance requirement | Minimum evidence |
|---|---|---|
| `V15-REF-GATE-01` | Sprint 090/091 prerequisites and Sprint 092 execution authorization are valid. | Accepted closeout records and an approved Sprint 092 file/test/output plan. |
| `V15-REF-INDEX-01` | The complete index represents all retained numbered instruction/reference files 00-14. | Index lists 01-12 in the guided sequence and 13/14 in a separate standalone-reference section; all links resolve. |
| `V15-REF-NAV-01` | The final guide navigation is connected and contained. | Link 07→08; 08-11 have index/previous/next; 11 leads to destination 12; 12 links back to index/focused lessons; 13/14 link to index/relevant lessons without prerequisite semantics; no dead/absolute/remote/escaping link. |
| `V15-REF-08` | Formula-driven diagram reference meets the accepted V0.13 meaning and constraints. | Lesson 08 runs/renders and preserves geometry/time/control behavior and accepted crank-slider caveats; no unsubstantiated physical, solver, trigonometric, or accessibility claim. |
| `V15-REF-09` | Runtime type predicates cover approved V0.14 semantics. | Expected true/false results for visible targets, recursive records, optional/null, lists including empty lists, enum primitive membership and Measurement dimension vectors; valid false is distinct from invalid target diagnostic; no static narrowing claim. |
| `V15-REF-10` | Math and Measurement-aware operations are faithful to the specification. | Expected values and units for constants/functions and representative operations; domains, radians/log base, finite behavior, conversions, result units, empty-list behavior, and exact applicable diagnostics are traceable to fixtures. |
| `V15-REF-11` | Text and numeric formatting cover the bounded V0.14 contract. | Exact assertions for text/list length, code points/combining marks, whitespace, left/right count boundaries, format grammar/locale/grouping/currency/percent/rounding/negative zero, Measurement display, and required errors. |
| `V15-REF-12` | Complete report is a coherent destination built from previously introduced concepts. | `12_Complete_Asset_Screening_Report.amx` runs with declared dependencies, integrates appropriate analysis and presentation, includes focused-reference back-links, and preserves the illustrative/non-calibrated scenario caveats. |
| `V15-REF-13` | Standalone route Measurement report is retained as an independent reference. | Mapped input and module closure are explicit; expected Measurement values/units, report content and named output are asserted; it is not a guided prerequisite. |
| `V15-REF-14` | Standalone battery-resistor reference preserves its accepted meaning. | Expected diagram/circuit values and constant-current caveat are asserted/present; it is indexed and linked as standalone, not prerequisite. |
| `V15-REF-FEAT-01` | Every remaining accepted Sprint 090 feature-matrix row is covered. | `V15-IA-FEAT-11` through `V15-IA-FEAT-19` map to concrete source/tests/fixtures; combined coverage has the approved rationale. |
| `V15-REF-SUPPORT-01` | Support files and invalid fixtures are canonical, explicit and contained. | Guide inputs use approved `data/`, `libraries/`, and `fixtures/invalid/` layout; every transitive dependency resolves; valid/invalid data are separated; no host-specific `.openamx/local.json` is treated as portable guide input. |
| `V15-REF-CLEANUP-01` | Corpus cleanup follows the accepted inventory and does not remove needed behavior/evidence. | Every changed/retained instructional AMX has a numbered/indexed destination. Test-only/compatibility AMX files are explicitly identified and excluded from the guide; every retired file has a disposition and consumer migration evidence. |
| `V15-REF-CONSUMER-01` | No Sprint 092 path change leaves a known broken direct consumer. | Focused tests/direct consumers are updated within approved scope, or old path is retained as a clearly classified compatibility fixture with an owner and removal condition. Broad remaining migration is assigned to S093/S094. |
| `V15-REF-OUTPUT-01` | Existing rendered outputs and user artifact are preserved per accepted policy. | Four checked-in HTML snapshots are not removed until Sprint 094 migrates assertions to temporary destinations; no output overwrites those paths. `examples/kitchen-sink.pdf` remains byte-identical. |
| `V15-REF-TEST-01` | New content and changed paths have focused executable evidence. | Exact test/CLI/render commands and complete results; positive bindings/units, negative diagnostics, named outputs and representative HTML structures checked using temporary output paths. |
| `V15-REF-SCOPE-01` | Later sprint responsibilities remain distinct. | No desktop resource/package integration, Welcome/Starter Examples implementation, broad README/Help/VS Code/authoring/release migration, full acceptance closeout, or release claim is reported as complete. |
| `V15-REF-CLOSEOUT-01` | Sprint 092 evidence and separate disposition are recorded. | Builder recommendation, evidence, unresolved decisions/owners, and distinct Lead Developer/product-owner `ACCEPTED/CLOSED` or `BLOCKED/OPEN` record. |

## V0.14 and Document-Workflow Coverage

- The runtime `is` lesson distinguishes valid nonmatches from invalid
  targets, covers approved recursive and structural cases, and does not
  imply static type narrowing or nominal enum identity.
- Mathematical examples and fixtures distinguish invalid domains/inputs from
  non-finite results and preserve Measurement normalization/dimension rules.
- Measurement-aware library functions retain established semantics; they
  are not mislabeled as newly added V0.14 functions.
- Text and formatting assertions use the exact Unicode, locale, rounding,
  grammar and error expectations in the V0.14 specification.
- Tables, charts, named outputs and supported export/report workflows remain
  consistent with current product behavior. No report format is claimed
  beyond what existing contracts support.
- Focused examples may demonstrate representative valid results; required
  edge cases remain covered by the appropriate tests/fixtures, not hidden
  behind an overlarge instructional document.

## Corpus and Preservation Conditions

- No retained instructional/reference AMX is unnumbered or absent from the
  index. Any non-guide legacy/test AMX is clearly classified, has an owner,
  and is outside the desktop guide allowlist.
- Every path change is assessed against its direct tests, scripts, release
  smoke path, and documentation owners from the accepted inventory. No
  compatibility copy is treated as canonical teaching content.
- The kitchen-sink HTML/PDF artifact policies are distinct: checked-in HTML
  snapshots remain until Sprint 094 migrates checks; the user-supplied PDF
  remains immutable.
- Invalid inputs are labeled and asserted as failures; user-facing lessons
  do not present them as successful input examples.
- No feature implementation, security/link behavior change, desktop
  packaging, external dependency, release, publication, or platform
  certification is included.

## Closeout

Builder evidence and recommendation are not product-owner acceptance. The
Lead Developer/product owner separately records `ACCEPTED/CLOSED` with
named exceptions or `BLOCKED/OPEN` with follow-up owners. If the disposition
is pending, do not start Sprint 093.
