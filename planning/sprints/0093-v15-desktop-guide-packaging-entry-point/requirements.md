# Sprint 093 Requirements: Desktop Guide Packaging and Entry-Point Integration

## Document Status and Entry Gate

Architect-prepared Sprint 093 documentation. Sprint 090, Sprint 091, and
Sprint 092 are separately accepted/closed within their documented scopes.
Those dispositions satisfy the sequencing prerequisites but do not authorize
Sprint 093 execution.

Obtain separate explicit Sprint 093 execution authorization and approval of
the concrete source, test, documentation, packaged-output, and preservation
plan before implementation. The request to prepare these documents
authorizes planning only.

## Goal

Make the canonical numbered guide and its required support files available
offline through the packaged desktop application's existing Welcome/Help/
Starter Examples affordance. Selecting the guided journey must create a
self-contained project at the user's chosen empty directory, open
`00_Table_of_Contents.amx`, and preserve the existing default-project and
two compact quick-start behaviors.

Update current user-facing guidance and direct example links to reflect the
approved numbered corpus. Do not redesign the desktop UI or change AMX
behavior, safe-link behavior, or security boundaries.

## Authority and Inputs

- Scope and sequence:
  [`plan-openamxV15MasterSprintPlan.md`](../../plan-openamxV15MasterSprintPlan.md).
- Accepted guide/package and navigation decisions:
  [`lead-developer-disposition-2026-10-18.md`](../0090-v15-example-information-architecture/lead-developer-disposition-2026-10-18.md)
  and
  [`final-information-architecture-and-feature-matrix.md`](../0090-v15-example-information-architecture/final-information-architecture-and-feature-matrix.md).
- Accepted corpus inventory and direct-consumer ownership:
  [`corpus-inventory-and-reference-trace.md`](../0090-v15-example-information-architecture/corpus-inventory-and-reference-trace.md).
- Sprint 091 and Sprint 092 results and deferred owners:
  [`builder-evidence-and-closeout.md`](../0091-v15-numbered-guide-core-learning-path/builder-evidence-and-closeout.md)
  and
  [`builder-evidence-and-closeout.md`](../0092-v15-feature-references-complete-example-cleanup/builder-evidence-and-closeout.md).
- Current desktop implementation establishes the existing standard project,
  starter, trusted Bun service, Welcome/Help, resource-build, and navigation
  behavior. Reuse these patterns and preserve their existing contracts.
- Current language specifications remain behavior authority. This sprint
  updates links/guidance only; it does not rewrite feature semantics.

Any discovered mismatch between packaged files, the accepted allowlist, and
the canonical `examples/` tree is a blocker to reconcile before claiming
package completeness.

## In Scope

- Define and implement a build-time packaged guide resource derived from the
  canonical `examples/` tree and the exact approved allowlist.
- Make the guide choice discoverable through the existing Welcome-to-Help/
  Starter Examples workflow. Clearly distinguish it from Hello OpenAMX and
  Operations Note quick starts.
- Extend the trusted project-creation workflow so a guide selection
  materializes the allowlisted multi-file guide in the selected empty project
  directory, initializes normal project configuration, and opens the
  numbered index.
- Preserve normal project creation (`report.amx`) and the two existing
  compact starter flows, including their one-document source/autosave
  behavior.
- Keep filesystem work in the trusted desktop service. Use explicit,
  typed guide-selection intent; the renderer must not provide arbitrary
  source paths or resource paths.
- Verify canonical-source/package parity, required support-file closure,
  exclusions, project-root layout, visible files, index opening, and offline
  availability using focused tests and the approved desktop build/package
  workflow.
- Update root README, desktop README, VS Code README, relevant searchable
  desktop Help and authoring guidance, and other active user-facing direct
  example references assigned to Sprint 093 in the accepted inventory.
- Update only test assertions directly affected by the approved doc/help path
  changes or desktop behavior changes. Leave broad corpus-path, release
  smoke, renderer/output and integrated test migration to Sprint 094.

## Approved Guide Resource Boundary

Use the accepted 00-14 guide and dependency closure as the only guide payload:

- All approved numbered AMX documents:
  `examples/00_Table_of_Contents.amx` through
  `examples/14_Battery_Resistor_Circuit.amx`.
- Valid data:
  `examples/data/asset.json`,
  `examples/data/screenings.csv`,
  `examples/data/reviewed-at.json`, and
  `examples/data/measurement-trips.json`.
- Explicitly labeled invalid teaching fixtures:
  `examples/fixtures/invalid/asset.json` and
  `examples/fixtures/invalid/screenings.csv`.
- Local module dependencies:
  `examples/libraries/asset-management.amx`,
  `examples/libraries/screening.amx`, and
  `examples/libraries/travel-measurements.amx`.

The final build-time allowlist must be checked against the approved
transitive dependencies of every included AMX document. If a file is no
longer required, do not package it merely because it exists. If a newly
discovered dependency is required, resolve and approve the file-plan
amendment before adding it.

Exclude `examples/.openamx/local.json`, legacy compatibility examples,
test-only fixtures such as Kitchen Sink/V0.5 material, checked-in generated
HTML, the user-supplied Kitchen Sink PDF, repository tests/docs, unrelated
root `libraries/`, and any host-specific or user data. Initialize the
destination project's ordinary `.openamx/project.json` through the normal
project-creation behavior; never copy the source examples' local project
state.

The repository `examples/` tree remains the sole source of truth. The
desktop resource is generated/staged from the explicit allowlist at build
time; do not maintain a manually edited duplicate guide. The packaged
resource must be usable without the source checkout, network, external
downloads, or development-only paths.

## Project-Creation and UX Contract

- The guide is an additional guided-journey choice within the existing Help
  Starter Examples path reached from Welcome. It is visibly distinct from
  “Hello OpenAMX” and “Operations Note.”
- Preserve the existing Getting Started action and both inline quick-start
  choices. Standard “Create project” behavior is unchanged.
- Selecting the guide uses the existing project-directory picker/transition
  protections. The chosen destination must be an existing real empty
  directory; preserve rejection of nonempty and symlink destinations.
- On success, materialize the exact approved guide payload while preserving
  relative directory layout, initialize the ordinary project config, do not
  create the generic `report.amx`, set the project root, and open
  `00_Table_of_Contents.amx` as the active document/preview target.
- Keep all file writes in the trusted Bun service. The webview passes an
  explicit guide choice, not arbitrary paths. Validate bundled paths against
  the allowlist and project-root containment rules; reject missing, unsafe,
  symlinked, or escaping resources.
- Treat materialization as one project-creation operation: surface errors
  through repository-standard status/RPC error handling, do not return a
  success-shaped fallback, and do not leave a partially populated guide
  project after a failed copy/config/open step. Preserve any pre-existing
  user data and existing transition/cancellation semantics.
- Local AMX navigation inside the created project continues using the
  existing contained-document behavior. Do not broaden local attachment
  confirmation, link permissions, or external navigation.

## Documentation and Reference Scope

- Update `README.md` and `desktop-app/README.md` with the guide entry and
  offline-project workflow; distinguish the guide from compact starters.
- Update `vscode-extension/README.md` and
  `.github/skills/amx-authoring/SKILL.md` direct links to current numbered
  examples where inventory assigns the path migration to this sprint.
- Update direct links in the current V0.12, V0.13 and V0.14 language
  specifications only as needed to point to approved numbered examples;
  preserve their specification content and authority.
- Update bundled searchable Help content to make the guide discoverable and
  accurately describe its offline file/project behavior.
- Search for active direct references beyond these named surfaces and
  record every migrated/deferred path. Do not silently rewrite historical
  V0.1 snippets or release/test owners assigned to Sprint 094.

## Out of Scope

- New AMX syntax/runtime/library behavior, renderer or link capability,
  security changes, remote content, or external package/download behavior.
- UI redesign, replacement/removal of either compact starter, or changes to
  the normal `report.amx` create-project flow.
- Full corpus/reference/test migration, release smoke migration, generated
  HTML removal, complete offline/native acceptance, or V0.15 closeout; these
  remain Sprint 094 responsibilities.
- Version changes, installer publication, release engineering, platform
  certification, or updates to `planning/STATUS.json` and historical sprint
  records.

## Exit Gate

Sprint 093 is complete when the authorized build stages the canonical
allowlisted resource, desktop guide selection creates the correct offline
project and opens its index, both old quick starts and normal project
creation remain unchanged, user-facing references are current, and
focused verification plus evidence is recorded. A separate Lead
Developer/product-owner disposition is required. Sprint 093 does not itself
claim full V0.15 acceptance, broad platform support, or release readiness.
