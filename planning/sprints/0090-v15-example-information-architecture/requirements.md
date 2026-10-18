# Sprint 090 Requirements: V0.15 Example Information Architecture and Acceptance Contract

## Document Status

Architect-prepared Sprint 090 documentation. The curriculum and file-layout
recommendations in `blueprint.md` are proposals for Sprint 090 review, not
authorization to rename, move, remove, rewrite, package, or execute example
files. The contract becomes the authority for Sprints 091-094 only after the
Lead Developer/product owner explicitly reviews and approves the final
Sprint 090 decisions.

Preparing these documents does not authorize Sprint 090 execution, source or
test changes, example-corpus changes, release, or publication. Obtain
separate explicit Sprint 090 execution authorization and approval of its
concrete file/evidence plan before performing the inventory or changing any
files beyond the approved plan.

## Goal

Before moving the example corpus, establish an evidence-based and
review-approved V0.15 example architecture: a desktop-first learning
sequence, consistent numbered filenames, clear support-file organization,
complete feature-to-example traceability, supported offline navigation and
desktop packaging boundaries, explicit generated-output dispositions, and
testable acceptance fixtures.

Sprint 090 defines and documents the contract. It does not implement the
guide, modify the examples, or change product behavior.

## Authority and Inputs

- Scope and sequencing authority:
  [`plan-openamxV15MasterSprintPlan.md`](../../plan-openamxV15MasterSprintPlan.md).
- V0.14 behavior authority:
  [`language-spec-v0.14.md`](../../../docs/language-spec-v0.14.md).
- Current corpus and its use in tests, desktop starters, packaging, README,
  VS Code guidance, Help, and authoring guidance are evidence to inventory;
  they are not a mandate to preserve every current filename or output.
- Sprint 089 is accepted/closed with residuals. Its disposition does not
  change the V0.15 master-plan scope or authorize V0.15 implementation.

If an inventory finding conflicts with a confirmed master-plan decision,
record the conflict and request a product decision. Do not silently broaden
the V0.15 scope or alter language/runtime behavior.

## In Scope

- Enumerate every current file in `examples/`, including instructional AMX
  documents, standalone references, input data, local modules, hidden project
  metadata, valid and invalid fixtures, generated HTML/PDF outputs, and other
  assets. Record its role, consumers/references, proposed disposition, and
  whether it is needed in the offline guide.
- Trace direct references to current example paths through repository
  documentation, source, tests, scripts, manifests, desktop resources,
  extension/help content, and authoring guidance. Record the search surface
  and findings so later path changes have an auditable migration list.
- Define and review the final curriculum order, numeric naming convention,
  guide versus standalone-reference distinction, learning goals and
  prerequisites, shared scenario, supporting-file layout, and a complete
  feature-to-example matrix.
- Lock the index and lesson navigation contract, required desktop discovery
  and offline-availability behavior, canonical-source/package boundary, and
  criteria for retaining generated outputs.
- Define stable acceptance-fixture IDs, exact expected evidence, negative
  fixture handling, and traceability from each master-plan requirement to
  future tests.
- Record open choices and their explicit dispositions. Do not mark an
  unresolved decision as approved.

## Out of Scope

- Renaming, moving, rewriting, creating, or deleting any example, fixture,
  input, library, generated output, or product file.
- Updating tests, source, desktop UI, package/resource configuration, README,
  extension guidance, Help, authoring skills, or any other live reference.
- Implementing or changing AMX syntax, standard-library behavior, editor or
  renderer capabilities, local-link behavior, security boundaries, or
  external dependency behavior.
- Generating or overwriting HTML, PDF, DOCX, or other outputs.
- Release engineering, version publication, platform certification, and
  updates to `planning/STATUS.json` or historical sprint records.

## Required Contract Outcomes

1. The complete current corpus and live-reference inventory is recorded;
   each item has a proposed keep, move, merge, archive, or remove disposition
   and a named rationale. No disposition is executed in Sprint 090.
2. Every instructional/reference `.amx` document planned for retention has a
   unique sequential numeric prefix, informative title, role (guided lesson
   or standalone reference), learning objective, prerequisites, support-file
   dependencies, and index/navigation destination.
3. The ordered learning path is desktop-first and progressive. Its first
   runnable lesson is input-free and requires no external module. Later
   inputs and imports are introduced only after their use is explained.
   The complete report is a destination, not a prerequisite for earlier
   lessons.
4. The feature matrix explicitly covers all user-facing V0.14 feature
   families and the language/document workflows already confirmed by the
   V0.15 master plan. Every feature has a focused example or an explicit
   rationale for being taught in a combined example.
5. The numbered AMX table of contents and lesson navigation use supported
   relative `.amx` links, resolve within the guide, expose the learning order,
   and preserve the existing safe local-link confirmation behavior. No new
   link or renderer capability is proposed.
6. The desktop guide has one canonical repository source and a specified,
   self-contained offline package boundary containing the index and the
   transitive closure of required lesson, data, and library files. Existing
   compact Hello and Operations Note starters remain distinguishable from
   the guided journey unless an explicitly approved decision changes them.
7. Every generated output has an explicit disposition. Retention requires a
   documented user-facing purpose, a reproducible generation procedure, and
   a test of its relevant content. The user-supplied
   `examples/kitchen-sink.pdf` is inventoried and treated as immutable unless
   separately authorized.
8. Stable acceptance fixtures cover inventory completeness, feature
   coverage, ordering, relative navigation, support-file containment,
   desktop package completeness/offline use, runnable and intentionally
   invalid examples, representative rendered output, and generated-output
   disposition.
9. Product decisions, exceptions, risks, and residual unknowns are explicit.
   Sprint 091 cannot start until the required architecture and fixtures have
   been separately approved.

## Required Sprint 090 Documents

- `requirements.md`, `blueprint.md`, `acceptance.md`, and
  `handoff-prompt.md` in this sprint folder.
- A completed corpus/reference inventory and final information-architecture
  and feature matrix in this sprint folder, or in the explicitly approved
  location named by the Sprint 090 file plan. These are authored and verified
  only during authorized Sprint 090 execution.
- A Builder evidence record that identifies the inventory/search methods,
  examined paths, proposal changes, unresolved decisions, and acceptance
  status. Evidence must not claim runtime or package validation that Sprint
  090 does not perform.

## Exit Gate

Sprint 090 is complete only when its acceptance criteria pass, every required
architecture decision is either approved or explicitly left as a blocker
with an owner, and the Lead Developer/product owner separately accepts the
contract. Builder recommendation alone does not authorize Sprints 091-094.
No product change, corpus migration, release, or publication is authorized by
this sprint.
