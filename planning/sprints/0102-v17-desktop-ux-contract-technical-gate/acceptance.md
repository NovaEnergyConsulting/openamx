# Sprint 102 Acceptance Criteria

Sprint 102 is complete only when the V0.17 desktop behavior has a reviewed,
internally consistent, source-grounded contract and a documented resizer
decision that downstream implementation can follow without guessing. Sprint
102 does not implement V0.17.

## Contract Completeness

- `desktop-ux-contract.md` covers component ownership and preservation of
  current workbench behavior.
- Project open, recent restore, recovery restore, active-file selection,
  paused preview, non-AMX documents, exactly-once activation, no implicit
  runtime Run, cancellation, identity, and stale-result behavior are explicit.
- Explorer top-menu and file/folder context-menu contents are mapped by file
  kind and availability. Search, whole-project `folders/files` counts,
  create/duplicate, rename/move, delete/trash, restore/empty-trash,
  reveal/open, drag/drop targets, collisions, confirmation, dirty/conflicted
  buffers, containment, imports, external changes, and open tabs are covered.
- Any gap between current file-only move authority and required folder
  rename/move is explicitly resolved or has an owner, blocker, and downstream
  scope decision. Renderer-side filesystem mutation is prohibited.
- Command-palette mouse and keyboard behavior specifies selection after open
  and filter changes, enabled-result navigation, non-wrapping boundaries,
  disabled commands, Enter/Return, empty state, shortcut opening, and focus
  restoration.
- The bottom-only runtime override is stated without modifying V0.6 history.
  Every current runtime action/content category is listed for preservation.

## Resizable Technical Gate

- `resizable-technical-gate.md` compares the existing two-divider/three-panel
  layout, size bounds, per-project persistence, keyboard adjustment, focus
  modes, and responsive behavior with the exact installed candidate API.
- The disposition is GO, NO-GO, or OPEN with evidence, residuals, and
  downstream impact. Online documentation alone is not treated as proof of
  behavior parity.
- If GO is recommended, per-project RPC persistence remains authoritative;
  local-storage `autoSaveId` is not used as the project's sizing store.
- Keyboard and responsive requirements are tested at 1024x720 and a larger
  desktop viewport, or explicitly marked NOT RUN with the precise blocker.

## Traceability and Evidence

- `requirement-test-matrix.md` maps every confirmed requirement and contract
  case to the owning sprint and focused verification surface.
- IDs and references are consistent across the contract, matrix, acceptance,
  and evidence documents. Unresolved decisions have owners and are visible as
  blockers, not silently accepted assumptions.
- `builder-evidence.md` records exact inspected sources, dependency/API
  evidence, commands/probes and outcomes. Unrun tests/prototypes are marked
  NOT RUN; no product behavior is inferred PASS.
- The sprint folder passes a focused link/ID consistency review and
  `git diff --check`.

## Boundaries and Disposition

- No product source, tests, dependencies, generated outputs, package/version
  files, status ledgers, or historical sprint records are changed.
- A separate Lead Developer/product-owner disposition accepts or reopens the
  contract and closes required decisions.
- Sprint 103-107 remain blocked until V0.16 Sprints 100-101 are closed and
  the Sprint 102 contract is separately dispositioned. Sprint 108 remains
  integrated acceptance only.
- No release, publication, version change, or platform certification is
  authorized.