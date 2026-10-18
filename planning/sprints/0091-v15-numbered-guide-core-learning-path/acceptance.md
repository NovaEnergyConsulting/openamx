# Sprint 091 Acceptance Criteria

Sprint 091 is complete when the numbered index and lessons 01-07 provide a
coherent, testable first segment of the approved V0.15 learning guide, all
changed paths are safe, focused verification is recorded, and a separate
Lead Developer/product-owner disposition is received.

The Sprint 090 architecture approval and Sprint 091 execution authorization
are mandatory entry gates. If either is missing or ambiguous, Sprint 091
implementation remains `BLOCKED/OPEN`; preparation of this document is not
evidence that either gate passed.

## Requirement-to-Evidence Matrix

The Builder records each row as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`, with
the exact file, test/action, result and evidence path. A build or prose review
alone does not satisfy an executable-example criterion.

| ID | Acceptance requirement | Minimum evidence |
|---|---|---|
| `V15-GUIDE-GATE-01` | Sprint 090 architecture and Sprint 091 execution are separately authorized. | Dated, unambiguous Sprint 090 disposition and approved Sprint 091 file/evidence plan. Otherwise no implementation starts. |
| `V15-GUIDE-INDEX-01` | `00_Table_of_Contents.amx` is the current core-guide entry point. | Index explains the guided route, lists lessons 01-07 in order with objectives/support assumptions, and links only to existing files. Later material is identified without dead links. |
| `V15-GUIDE-ORDER-01` | Each current guided lesson follows the approved two-digit sequence and filename. | Files 01-07 have unique approved numeric prefixes/titles and appear in the same order in the index. The sprint does not claim that later corpus files have already been renumbered. |
| `V15-GUIDE-LESSON-01` | Lesson 01 is a minimal, input-free first runnable document. | It demonstrates Markdown, an exact `amx` fence, a binding and inline interpolation; declares no file/module prerequisites; documented CLI/test execution succeeds. |
| `V15-GUIDE-LESSON-02` | Lesson 02 introduces expressions and decisions after the first document. | Values, operators, precedence, mutation and conditional behavior are explained with asserted representative results and no external dependencies. |
| `V15-GUIDE-LESSON-03` | Lesson 03 introduces collection/function concepts progressively. | Collections, transformations/loops, matching and functions are explained with asserted results; no external input is required. |
| `V15-GUIDE-LESSON-04` | Lesson 04 introduces typed records/enums and local modules accurately. | Type rules, optional/default/null behavior, inheritance/override, enum values and imports are consistent with specifications; every required module exists and is named. |
| `V15-GUIDE-LESSON-05` | Lesson 05 teaches Measurement and unit foundations without hiding dimensions. | Expected results assert value and unit; conversions and compatibility are explained without new semantic claims or required external mappings. |
| `V15-GUIDE-LESSON-06` | Lesson 06 declares valid input mapping and intentional negative cases. | Exact input names, paths, types and assumptions; valid input succeeds; invalid-only fixtures are clearly labeled and expected diagnostics are asserted. |
| `V15-GUIDE-LESSON-07` | Lesson 07 presents supported tables/charts/named output using prior concepts. | Required inputs are documented; table/chart content and named output values/shapes/destinations are asserted; no unsupported export claim. |
| `V15-GUIDE-NAV-01` | Navigation works within the files delivered by Sprint 091. | Index and cross-links are supported relative `.amx` paths, resolve within `examples/`, and preserve the safe local-link confirmation behavior. Lessons 02-06 link previous/index/next; 01 and 07 use the approved boundary rules. |
| `V15-GUIDE-DESKTOP-01` | Lesson instructions are desktop-first and distinguish the guide from quick starts. | Each lesson explains opening/running/previewing in the desktop app; prose does not claim that Sprint 091 implements desktop guide packaging or replaces Hello/Operations Note starters. |
| `V15-GUIDE-SUPPORT-01` | Every companion file required by 04-07 is present and accounted for. | Dependency table or tests show each import/input path resolves; valid data and invalid fixtures are separated; no unlisted external dependency. |
| `V15-GUIDE-TEST-01` | Focused tests exercise the lessons and directly changed paths. | Exact targeted test commands and results; directly coupled references/tests are updated or their legacy source remains until approved migration. No known sprint-caused dangling path. |
| `V15-GUIDE-OUTPUT-01` | Verification preserves generated/user-supplied artifacts. | Test outputs use temporary destinations; worktree check records any changes; `examples/kitchen-sink.pdf` hash/content remains unchanged. |
| `V15-GUIDE-SCOPE-01` | Later-sprint work remains separated. | No feature references 08-11, complete report 12, standalone references 13-14, desktop packaging, broad docs/reference migration, or unrelated cleanup is claimed complete. |
| `V15-GUIDE-CLOSEOUT-01` | Evidence and separate closeout disposition are complete. | Builder evidence lists residual owners and recommendation; separate Lead Developer/product-owner `ACCEPTED/CLOSED` or `BLOCKED/OPEN` is recorded. |

## Learning-Path Quality

- The progression assumes no prior AMX knowledge and does not overload the
  first lesson with records, inputs, modules, charts, or advanced syntax.
- Lessons use consistent language for opening, running and previewing in the
  desktop app; CLI commands are supplemental where included.
- Every example result shown in prose matches the actual evaluated output.
  Diagnostics are described as failures and do not appear in successful
  walkthroughs.
- Each lesson states what a reader should know first and what to read next.
  Navigation targets are real files in this sprint's tree, not future
  placeholders.
- Data and module paths are explicit. A fresh project or test run does not
  depend on host-specific absolute paths or hidden local configuration.
- Domain examples are explicitly illustrative; no example presents
  illustrative scores as calibrated risk, engineering standards or
  investment advice.

## Change Scope and Verification

- No language/runtime/editor/renderer behavior changes are included.
- Only approved guide files, directly required supporting files, focused
  tests, and Sprint 091 evidence are changed.
- Any required update to an unrelated reference or future desktop/package
  surface is recorded for its owning sprint, not silently included.
- Tests and CLI executions are run only after separate authorization and
  against the paths/inputs recorded in the file plan. Generated artifacts
  are not written into tracked output paths.
- No release, publication, package distribution, desktop platform
  certification, or full corpus acceptance is inferred from Sprint 091
  completion.

## Closeout

The Builder submits a recommendation and unresolved risks. A separate Lead
Developer/product owner records `ACCEPTED/CLOSED` with named exceptions or
`BLOCKED/OPEN` with follow-up owners. If the separate disposition is pending,
Sprint 091 remains open and Sprint 092 does not start.
