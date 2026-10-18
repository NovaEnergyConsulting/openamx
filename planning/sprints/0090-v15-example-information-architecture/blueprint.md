# Sprint 090 Blueprint: Example Information Architecture and Acceptance Contract

## Approach

1. Before execution, obtain separate explicit Sprint 090 authorization and
   approval of a concrete file/evidence plan. Record the starting branch,
   worktree state, and preservation plan. Keep all work confined to the
   approved Sprint 090 planning/evidence paths.
2. Read the V0.15 master plan, V0.14 specification, prior V0.14 example
   contracts/evidence, current corpus, and project instructions. The master
   plan is scope authority; current filenames and generated outputs are
   evidence, not a target design.
3. Inventory the complete `examples/` tree, including hidden/project files.
   For each item record its current path, type, purpose, runnable/negative/
   support/output role, dependencies, input mapping, direct consumers,
   proposed disposition, package need, and rationale. Distinguish an output
   generated from source from a user-supplied or otherwise authoritative
   artifact.
4. Trace paths and behavior consumers repository-wide. At minimum examine
   root documentation and package scripts; root tests; desktop starter
   definitions/tests, resource and project-creation paths, Help, and README;
   VS Code README/help/authoring skill; release/build scripts; and any
   source or tests discovered by following references. Record exact
   source-to-target references and test assertions that will need migration.
   Search direct paths as well as scripts/configuration that copy or package
   directories; do not treat a text search as proof that the inventory is
   complete.
5. Compare the proposed curriculum against every user-facing feature and
   workflow in the approved V0.14 contract and V0.15 master plan. Use the
   sequence below as the review baseline; adjust only with a documented
   reason and explicit contract approval.
6. Settle the scenario thread, numbered filenames, support-file layout,
   standalone references, invalid-fixture policy, index/lesson link rules,
   offline desktop package boundary, quick-starter relationship, and output
   retention decisions. Where code inspection shows a proposed path or
   interaction is unsupported, record a blocker and request a decision; do
   not invent product capabilities.
7. Define stable acceptance-fixture IDs with explicit input, action/check,
   expected outcome, and future owner sprint/test surface. Separate
   information-architecture assertions from later execution, renderer, and
   desktop-package verification.
8. Reconcile every master-plan requirement to at least one proposed lesson,
   reference, input/library support item, and acceptance fixture. Record
   uncovered features, redundant examples, path risks, and unresolved
   questions rather than silently omitting them.
9. Present the final inventory and proposed contract for review. Record the
   separate Lead Developer/product-owner disposition. Do not start Sprint
   091 until the final curriculum, naming, navigation/package, output
   retention, and acceptance contracts are approved.

## Curriculum Proposal for Review

The table is an architectural baseline, not permission to create or rename
these files. Final filenames and contents must be reconciled to the complete
inventory and explicitly approved during Sprint 090.

| Order | Proposed AMX filename | Role and learning outcome | Key coverage / dependencies |
|---|---|---|---|
| 00 | `00_Table_of_Contents.amx` | Primary index; explains the guided path and links to every retained lesson/reference. | Relative `.amx` links; no remote content. |
| 01 | `01_First_Computable_Document.amx` | Open, read, run, and preview a minimal document in the desktop app. | Markdown structure, AMX code fence, binding, inline value; input-free. |
| 02 | `02_Expressions_and_Decisions.amx` | Build and explain calculations and conditional results. | Values, operators, expressions, conditionals, narrative interpretation; no external inputs. |
| 03 | `03_Collections_and_Document_Structure.amx` | Organize repeated values and present a readable analysis. | Lists/collections, functions and relevant core control flow, document sections/tables; no external inputs. |
| 04 | `04_Typed_Records_and_Modules.amx` | Model a domain object and reuse a local module. | Records, enums, inheritance, imports/local modules; introduces explicit module dependencies. |
| 05 | `05_Measurements_and_Units.amx` | Express, compare, convert, and report measured quantities. | Measurement values, units, conversions, dimensional meaning; any inputs stated explicitly. |
| 06 | `06_Mapped_Data_and_Validation.amx` | Map external data and explain valid and invalid input outcomes. | JSON/CSV mapping, typed data, validation/diagnostics, named outputs where appropriate; grouped companion data and clearly isolated invalid fixtures. |
| 07 | `07_Tables_Charts_and_Report_Outputs.amx` | Turn analysis into a report and distinguish source from rendered/exported output. | Tables, charts, named outputs, supported report/export workflow; retain outputs only under the output policy. |
| 08 | `08_Formula_Driven_Diagrams.amx` | Explain an interactive formula-driven diagram and its data. | V0.13 diagram behavior; detailed scientific cases may remain separately numbered references. |
| 09 | `09_Runtime_Type_Checks.amx` | Demonstrate runtime `is` predicates and their documented matching behavior. | V0.14 runtime type checks; focused positive and negative cases. |
| 10 | `10_Mathematics_and_Measurement_Operations.amx` | Use mathematical functions and existing library operations with correct dimensions. | V0.14 math functions/constants, domains and finite behavior, Measurement-aware operations and units. |
| 11 | `11_Text_and_Number_Formatting.amx` | Prepare readable text and numeric values without changing their underlying meaning. | V0.14 text functions, Unicode/count behavior, numeric formatting, locale and Measurement display. |
| 12 | `12_Complete_Asset_Risk_Report.amx` | Reach a complete report that combines the earlier concepts coherently. | Shared asset-risk scenario, appropriate typed/mapped inputs, measurements, analysis, presentation, and links back to focused lessons; not a prerequisite. |
| 13+ | Sequentially numbered standalone references, only where retained. | Focused demonstrations useful outside the guided sequence. | Candidate topics include battery-resistor and crank-slider diagrams; include only after inventory confirms a distinct learning/reference purpose. |

Prefer a light asset-condition/risk scenario because the current corpus already
contains related asset-management examples and companion material. Sprint 090
must verify that this scenario can be taught truthfully and coherently; it
must not add domain claims or runtime features. Keep a focused example
independent where combining it would make the lesson harder to understand.
The final report is the destination and must link back to its focused
references.

All retained instructional/reference `.amx` documents receive a contiguous,
two-digit numeric prefix and an informative title. Reserve `00` for the
index. The approved information architecture must name every retained file;
no unnumbered instructional file or unexplained numbering gap is allowed.
Data and module files are grouped by role and do not receive lesson numbers.

## Proposed Feature-to-Example Matrix

The final matrix must include every row below, identify concrete final
filenames and acceptance IDs, and add any coverage required by the corpus
inventory. Combined coverage needs a brief rationale.

| Feature/workflow family | Proposed destination | Required evidence in the final matrix |
|---|---|---|
| Markdown narrative, executable fences, bindings, inline interpolation, first-run workflow | 01 | Input-free, runnable from the first lesson; clear open/run/preview steps. |
| Values, expressions, operators, conditional logic | 02 | Correct expected values and narrative purpose. |
| Lists/collections, functions, document sections/tables and core document workflow | 03 | Focused examples with expected values; prerequisites stated. |
| Records, enums, inheritance, imports/local modules | 04 | Required module paths and type declarations identified; no hidden dependency. |
| Measurement values, units, conversions | 05 | Expected values and units, not values alone. |
| JSON/CSV inputs, typed mapping/validation, positive and negative input cases | 06 | Input mapping, exact fixture path, expected successful values or diagnostic. |
| Named outputs, tables, charts, supported report/export workflow | 07 | Source/output distinction and any intentionally retained artifact test. |
| Formula-driven diagrams and V0.13 user-facing behavior | 08 and numbered focused references if needed | Expected diagram identity/values and reference links. |
| V0.14 `is` runtime type predicates | 09 | Accepted type families and representative true/false/error distinctions. |
| V0.14 mathematics and Measurement-aware standard-library operations | 10 | Function/constant and Measurement behavior tied to approved specification. |
| V0.14 text functions, Unicode behavior, and number formatting | 11 | Exact observable expectations linked to approved specification. |
| Integrated, coherent report and back-links to focused learning | 12 | All selected prior concepts appear meaningfully; no new semantics. |

## File and Package Architecture to Lock

- Keep the repository's `examples/` tree as the single canonical source for
  guide AMX documents and required support files.
- Proposed support grouping: `examples/data/` for valid companion inputs,
  `examples/libraries/` for local modules, and
  `examples/fixtures/invalid/` for negative-only inputs/fixtures. Use only
  directories justified by the inventory; record any alternative layout and
  its rationale before approval.
- Keep output artifacts out of the beginner path and package by default.
  Any retained output must meet the criteria below.
- The desktop-created project must contain the index and the transitive
  dependency closure of the approved guide, under a stable relative layout
  that keeps its links and required input/library paths usable offline.
  Package from the canonical repository tree; do not maintain an
  independently edited duplicate.
- Exclude tests, invalid-only fixtures, unrelated libraries, repository
  metadata, and generated outputs from the packaged guide unless a documented
  user-facing lesson requires one. A required negative lesson fixture is
  explicitly named and intentionally included only if it is needed offline.
- Add a discoverable guided-journey choice through existing desktop
  Welcome/Starter Examples affordances. Preserve the two existing compact
  Hello and Operations Note starters as clearly labeled quick-start choices.
  Sprint 090 specifies this behavior; it does not implement or redesign the
  UI.
- Index and lesson navigation use supported relative AMX links. The index
  links to the guided sequence and all standalone references; each lesson
  links to the index, previous and next item where applicable, and any
  related standalone reference. The first/last boundary is explicit. Follow
  existing safe local-link confirmation; do not auto-open remote paths or
  widen link permissions.

## Generated-Output Policy

For each existing HTML/PDF/DOCX or other generated artifact, inventory the
provenance and classify it as `RETAIN`, `REGENERATE`, `REPLACE`, `REMOVE`,
`ARCHIVE`, or `USER-SUPPLIED / IMMUTABLE` (or an approved equivalent). A
retained generated output must have all of:

1. A named user-facing learning or comparison purpose not served better by
   generating it on demand.
2. A canonical source and exact reproducible generation command/workflow.
3. A focused automated assertion for relevant structure/content, with
   volatile fields normalized only where established tests already do so.
4. A documented owner/path and verification responsibility in the inventory.

Absence of these conditions means do not propose retention as a generated
golden file. Do not overwrite or remove `examples/kitchen-sink.pdf`; record
its user-supplied provenance and immutability separately. Sprint 090 performs
no output generation or cleanup.

## Future Acceptance-Fixture Design

Create stable fixture IDs in the `V15-IA-*` namespace. Each final row must
state the requirement, exact input/document/path, setup/action, expected
result, evidence location, and owning implementation/verification sprint.
Cover at minimum:

- `V15-IA-INV-*`: complete file census, disposition, dependency and
  reference-trace completeness.
- `V15-IA-CUR-*`: sequential numbering, role, learning goals, progression,
  prerequisites, and all-feature mapping.
- `V15-IA-NAV-*`: index coverage, valid relative links, previous/index/next
  behavior, and link containment.
- `V15-IA-PKG-*`: canonical-source parity, full required dependency closure,
  exclusions, offline availability, and starter distinction.
- `V15-IA-RUN-*`: documented runnable input assumptions and expected
  values/units; intentionally invalid cases and expected diagnostics.
- `V15-IA-OUT-*`: generated-output provenance, retention rationale,
  reproducibility, and focused assertion; immutable artifact handling.
- `V15-IA-RENDER-*`: selected structural/report/diagram expectations and
  supported local-link workflow.

Do not report future runtime, renderer, or native desktop acceptance as
Sprint 090 test results. These IDs define later verification obligations.

## Files to Update

The concrete Sprint 090 file plan must be approved before execution. The
expected scope is limited to this sprint folder's planning and evidence
documents. Do not update `planning/STATUS.json`, historical sprint records,
source, tests, examples, package configuration, or user-facing guidance.
Any exception requires an explicit, separate approval before the affected
file is changed.

## Verification

Sprint 090 is a documentation/contract gate, not a product-test sprint.
Verify the inventory against the actual tree and traced consumers, check all
relative links in the planning contract, reconcile every matrix row to the
master plan and V0.14 specification, and record the exact inspection/search
method. Run documentation-format/link checks available in the repository and
`git diff --check` for the approved changes. Do not run commands that
regenerate example outputs or alter the package, and do not imply product
acceptance from a planning-document review.
