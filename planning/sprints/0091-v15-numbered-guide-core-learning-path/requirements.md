# Sprint 091 Requirements: Numbered Guide, Index, and Core Learning Path

## Document Status and Entry Gate

Architect-prepared Sprint 091 documentation. These documents define the
proposed implementation scope; they do not authorize implementation.

The Sprint 090 Builder closeout
[`builder-evidence-and-closeout.md`](../0090-v15-example-information-architecture/builder-evidence-and-closeout.md)
records Sprint 090 as `BLOCKED/OPEN`: a structured `ACCEPTED/CLOSED`
selection conflicted with accompanying text withholding architecture
approval. Before any Sprint 091 example or test changes, the Lead
Developer/product owner must record an unambiguous separate Sprint 090
disposition and explicitly approve the applicable Sprint 090 architecture
decisions. Then obtain separate explicit Sprint 091 execution authorization
and approval of its concrete file/evidence plan.

The user's request to prepare these documents authorizes planning only; it
does not resolve the Sprint 090 disposition or authorize Sprint 091
implementation. Until both gates are satisfied, this sprint remains a draft
and no example, test, output, or product file may be changed.

## Goal

Create the first usable, numbered portion of the V0.15 desktop-first AMX
learning guide: a linked `00` table of contents and a progressive
input-light core route covering first document authoring through mapped data,
validation, and basic report outputs.

The approved Sprint 090 information architecture is the naming and
curriculum authority. This sprint implements only the index and the core
guide sequence through lesson 07. It does not complete the feature-reference
corpus, full report, package integration, or repository-wide reference/test
migration assigned to later sprints.

## Authority and Inputs

- Scope and sequence:
  [`plan-openamxV15MasterSprintPlan.md`](../../plan-openamxV15MasterSprintPlan.md).
- Proposed curriculum, filenames, support paths, link rules, and acceptance
  fixture owners:
  [`final-information-architecture-and-feature-matrix.md`](../0090-v15-example-information-architecture/final-information-architecture-and-feature-matrix.md).
- Existing file roles and path consumers:
  [`corpus-inventory-and-reference-trace.md`](../0090-v15-example-information-architecture/corpus-inventory-and-reference-trace.md).
- Current syntax and behavior authorities are the applicable language
  specifications. Examples illustrate established behavior and must not
  establish new semantics.
- Sprint 090's inventory and proposal are evidence and recommendations until
  their required separate approval is recorded.

If an approved Sprint 090 decision differs from the proposed filenames or
boundaries below, stop and reconcile this sprint's file plan before editing.
Do not silently implement an unapproved alternative.

## In Scope

- Create or rework the following guided documents using the approved content
  and naming decisions:
  - `examples/00_Table_of_Contents.amx`
  - `examples/01_First_Computable_Document.amx`
  - `examples/02_Expressions_and_Decisions.amx`
  - `examples/03_Collections_and_Functions.amx`
  - `examples/04_Typed_Records_Enums_and_Modules.amx`
  - `examples/05_Measurements_and_Units.amx`
  - `examples/06_Mapped_Data_and_Validation.amx`
  - `examples/07_Tables_Charts_and_Named_Outputs.amx`
- Provide each lesson with a concise learning objective, explicit
  prerequisites, desktop-first open/run/preview instructions, accurate input
  or module requirements, and navigation appropriate to this staged route.
- Keep lessons 01-03 immediately runnable without external inputs or modules.
  Introduce a local module only after explaining imports; introduce mapped
  inputs only after the basic authoring and data concepts are established.
- Organize only the companion support files required by lessons 04-07 under
  the support paths approved in Sprint 090. Keep valid inputs separate from
  invalid-only fixtures and identify invalid files clearly.
- Add or update focused checks directly required to verify the new index,
  lessons, links, and examples. Update directly coupled tests when a path
  changed in this sprint would otherwise make those tests stale or failing.
  Do not defer a known broken test/reference created by this sprint.
- Retain the existing safe local AMX-link behavior and the distinction
  between the guide and the compact desktop Hello and Operations Note
  starters.

## Out of Scope

- Creating the later feature-reference documents 08-11, the complete report
  12, or standalone references 13-14. Those are assigned to Sprint 092.
- Full example-corpus cleanup, migration of the remaining legacy examples,
  broad relocation of unrelated support files, generated HTML cleanup, or
  changes to the user-supplied `examples/kitchen-sink.pdf`.
- Desktop Welcome/Starter Examples integration, resource staging, project
  creation/copy behavior, packaging, or UI redesign. Those are Sprint 093.
- Repository-wide migration of all example-path references, full corpus
  regression migration, release smoke migration, package/renderer/native
  acceptance, or integrated closeout. Those are owned by Sprints 093-094.
- Changes to language/runtime/editor/renderer behavior, external link
  behavior, security boundaries, dependencies, release, or publication.
- Changes to `planning/STATUS.json` or historical sprint records.

## Content Contract

| File | Required teaching outcome | Content and prerequisites |
|---|---|---|
| `00_Table_of_Contents.amx` | Introduce the route, explain its order, and distinguish guided lessons from later references. | Link only to documents that exist in this sprint's committed tree. Provide clear objectives and support/input expectations. Identify later advanced material as future content in prose if needed; do not add links to files not yet present. |
| `01_First_Computable_Document.amx` | Open, read, run, and preview a minimal document. | Markdown narrative, one exact case-sensitive `amx` fence, a binding, and inline interpolation; input-free and import-free. Explain how to find/open this file from a desktop-created project. |
| `02_Expressions_and_Decisions.amx` | Explain values, operators, expressions, mutation, and conditional results. | Show expected values visibly; build on lesson 01 without external files. Preserve documented conditional-expression, conditional-statement, and scope distinctions. |
| `03_Collections_and_Functions.amx` | Use collections and reusable calculations to organize a small analysis. | Lists/ranges, collection transformations, loops, matching and functions in a comprehensible progression; no external inputs. Do not imply undocumented function-return or flow-narrowing behavior. |
| `04_Typed_Records_Enums_and_Modules.amx` | Model structured data and introduce reuse through a local module. | Required/optional/default fields, nullability, DateTime where appropriate, inheritance/override, enum values, imports/exports, and visible module dependency. |
| `05_Measurements_and_Units.amx` | Represent and communicate physical quantities with units. | Construct/convert Measurements and explain dimensions, compatibility, and displayed units; assert value and unit together. No external input required. |
| `06_Mapped_Data_and_Validation.amx` | Map and validate external JSON/CSV data. | Name exact logical input mappings and companion paths. Clearly separate valid input from deliberately invalid cases and document expected outcomes without teaching invalid data as a runnable success path. |
| `07_Tables_Charts_and_Named_Outputs.amx` | Present a small analysis and explain supported report/output workflow. | Build on the mapped-data lesson; show a table/chart and named output behavior with explicit inputs and output paths. Do not introduce V0.14-only features or claim unsupported export behavior. |

## Navigation Contract for This Sprint

- `00` links to each implemented lesson 01-07 in learning order using
  supported relative `.amx` links.
- Each lesson links back to the index. Lessons 02-07 link to their previous
  implemented lesson. Lessons 01-06 link to the next implemented lesson.
- Since the later numbered feature references are not created in Sprint 091,
  lesson 07 is the current route boundary: it links to the index, identifies
  that advanced references and the complete report follow in a later sprint,
  and contains no link to a missing `08` file.
- Every linked target exists and is inside the guide tree. Preserve the
  existing desktop preview behavior for contained AMX links and existing
  confirmation behavior for local non-AMX links. Add no link capabilities.
- When Sprint 092 adds later chapters, it owns extending the index and
  connecting 07 to the approved continuation.

## Test and Preservation Contract

- Test the index, link resolution/containment, order and learning navigation,
  required-file availability, and lesson content according to the approved
  Sprint 090 fixture contract.
- Execute each newly authored/reworked runnable lesson with its stated
  inputs and assert representative expected values; assert Measurement
  values together with units.
- Exercise explicitly invalid inputs only through the documented negative
  checks and assert expected diagnostics. Never let an invalid fixture be
  mistaken for a successful lesson input.
- Run focused example tests covering files changed by this sprint and the
  smallest applicable root verification gate. Record exact commands,
  outcomes, and pre-existing unrelated failures.
- Do not overwrite checked-in generated outputs as a side effect of testing.
  Use temporary destinations for any output generated during verification.
  Preserve the user-supplied Kitchen Sink PDF and unrelated user/worktree
  artifacts.
- Any moved or renamed source path must have a safe transition: directly
  coupled tests are updated in-scope or the source remains until a separately
  authorized migration. Do not leave known broken tests or dangling links.

## Exit Gate

Sprint 091 is complete when all in-scope lessons and tests meet
[`acceptance.md`](./acceptance.md), no new path/link/test failure remains
unexplained, and the Builder submits evidence and residuals for separate
review. Sprint 091 completion does not authorize Sprint 092, package
integration, release, or publication.
