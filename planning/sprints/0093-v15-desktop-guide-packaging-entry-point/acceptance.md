# Sprint 093 Acceptance Criteria

Sprint 093 is complete when the desktop package contains the approved
canonical guide closure, the existing Welcome/Help/Starter Examples flow
creates and opens the guide project offline, the two compact starters and
normal project creation remain unchanged, assigned documentation references
are current, and a separate Lead Developer/product-owner disposition is
recorded.

Sprints 090-092 are accepted prerequisites. Sprint 093 still requires
separate execution authorization and approval of its concrete
source/test/documentation/package-output plan.

## Requirement-to-Evidence Matrix

Record every row as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`, with exact
commands/actions, package/resource paths, test results, evidence artifacts
and owners. A web build alone does not establish package completeness or
offline project creation.

| ID | Acceptance requirement | Minimum evidence |
|---|---|---|
| `V15-DESK-GATE-01` | Prior sprint prerequisites and Sprint 093 execution plan are approved. | Sprint 090-092 closeout references plus separate dated Sprint 093 execution/file/output-plan approval. |
| `V15-DESK-RESOURCE-01` | The canonical guide is staged from one source using an explicit allowlist. | Staging code/config and manifest identify canonical root, exact paths, resource root and deterministic path mapping; no manually maintained duplicate. |
| `V15-DESK-RESOURCE-02` | Packaged resource contains all approved guide and dependency files and excludes non-guide data. | Path-set and byte/hash parity for all 00-14 AMX files, approved data, invalid teaching fixtures, and required local libraries; confirm exclusion of local project state, legacy/test files, generated outputs, PDF, tests and unrelated libraries. |
| `V15-DESK-RESOURCE-03` | Resource lookup works in development and packaged app without checkout-relative assumptions. | Trusted service resolves bundled resource from the defined application resource root; built package inspection and a package-resource smoke exercise succeed without network/source repository. |
| `V15-DESK-ENTRY-01` | The guide is discoverable through the existing desktop affordance. | Help Starter Examples includes a clearly labeled guided journey reachable from Welcome; searchable/offline Help accurately explains it; no remote request or UI redesign. |
| `V15-DESK-ENTRY-02` | Existing compact starters and Getting Started action remain unchanged in role and behavior. | Existing two starter IDs/titles/content and Getting Started action remain; tests confirm each still creates an ordinary project and stays input-free. |
| `V15-DESK-PROJECT-01` | The guide action creates the intended multi-file project. | In a fresh empty real directory, approved payload appears under preserved relative paths, normal `.openamx/project.json` is initialized, no generic `report.amx` is created, and the active/open document is `00_Table_of_Contents.amx`. |
| `V15-DESK-PROJECT-02` | Standard create-project behavior is unchanged. | Existing create request still creates config and `report.amx`, opens the report, and retains ordinary transitions/autosave behavior. |
| `V15-DESK-FAIL-01` | Unsafe or failed materialization is rejected safely. | Nonempty/symlink destinations remain rejected; missing/invalid package resource reports an explicit error; no partial guide/config is left after failure; existing user files are unchanged. |
| `V15-DESK-SECURITY-01` | Filesystem/resource access stays trusted and bounded. | Renderer passes typed selection intent only; service uses fixed resource allowlist, validates containment/type/symlink policy, and does not accept arbitrary source paths; safe local-link behavior is unchanged. |
| `V15-DESK-OFFLINE-01` | A created guide project works offline. | Guide, all input/module/negative fixtures and relative AMX links are available locally; project opens and index renders without source checkout, remote service, or downloaded dependency. |
| `V15-DESK-DOC-01` | Assigned user-facing guidance explains the guide and its role. | Root README, desktop README, VS Code README, Help and authoring guidance accurately distinguish guided journey from two compact starters and link to current numbered examples. |
| `V15-DESK-REF-01` | Current direct example links assigned to Sprint 093 resolve. | Applicable V0.12/V0.13/V0.14 spec links and other approved active references use current numbered destinations; historical V0.1 snippets remain historical unless separately approved. |
| `V15-DESK-TEST-01` | Focused desktop/package/documentation checks pass or have explicit disposition. | Bun RPC/project tests, Help/Welcome UI assertions, typecheck, resource/web build, packaged-resource parity/smoke and directly coupled link assertions with exact counts/log paths. |
| `V15-DESK-SCOPE-01` | Later owners and preservation boundaries are respected. | No broad S094 migration, full platform certification, version/release/publication change, tracked output overwrite, or Kitchen Sink PDF change; deferred paths have owners. |
| `V15-DESK-CLOSEOUT-01` | Sprint evidence and separate disposition are complete. | Builder evidence and residuals plus separate Lead Developer/product-owner `ACCEPTED/CLOSED` or `BLOCKED/OPEN` record. |

## UX and Compatibility Conditions

- The guide is one distinct multi-file option, not a third single-string
  inline starter and not a replacement for Hello OpenAMX or Operations Note.
- Normal project creation still opens `report.amx`. Existing starter source
  content, default project config, autosave, transition and cancellation
  semantics remain intact.
- Guide selection starts from the same validated empty-project-folder
  workflow. No pre-existing user file is overwritten.
- The index is the active document after guide creation, and the explorer
  exposes the contained files. Links and data paths work within that created
  project.
- Missing resource, copy, config, or open failure is surfaced explicitly;
  no empty/default project is presented as a successful guide creation.
- No new remote loading, arbitrary file reads, hidden paths, expanded
  attachment permissions, or local-link behavior changes are introduced.

## Documentation and Platform Claims

- Current documentation describes actual desktop behavior and does not
  imply release, offline-native, accessibility, or cross-platform
  certification beyond directly verified evidence.
- Package-resource inspection is distinguished from manual installation and
  native app acceptance. If a target host or native route is unavailable,
  mark it `BLOCKED/UNAVAILABLE` with the exact limitation; Sprint 094 retains
  integrated/offline acceptance ownership.
- User-facing path changes have focused link assertions updated. Unmigrated
  test/release consumers remain explicitly assigned to Sprint 094.

## Closeout

Builder recommendation is submitted separately from acceptance. The Lead
Developer/product owner records `ACCEPTED/CLOSED` with named residuals or
`BLOCKED/OPEN` with owners. Pending disposition means Sprint 093 remains
open; Sprint 094 must not treat unverified package behavior as accepted.
