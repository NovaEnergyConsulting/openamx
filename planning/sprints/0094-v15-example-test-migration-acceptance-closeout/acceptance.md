# Sprint 094 Acceptance Criteria

Sprint 094 closes the V0.15 example/onboarding refactor only when every
applicable requirement in the master plan and accepted Sprint 090 contract
has direct, traceable evidence; legacy paths and generated files have a
clear disposition; root/desktop/package/offline checks have explicit
results; and the Lead Developer/product owner records a separate V0.15
disposition.

Sprints 090-093 are accepted prerequisites. Sprint 094 still requires
separate execution authorization and approval of a concrete file-by-file
test, migration, deletion, package, native-verification, and output plan.

## Requirement-to-Evidence Matrix

Every ID below must have `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, or `NOT RUN`
status in `builder-evidence-and-closeout.md`, with exact command/action,
input, result, evidence path, residual owner and separate disposition where
applicable. Accepted residuals retain their underlying raw status.

| ID | Acceptance requirement | Minimum evidence |
|---|---|---|
| `V15-CLOSE-GATE-01` | Sprints 090-093 prerequisites and Sprint 094 authorization are valid. | Separate dated dispositions plus approved Sprint 094 file/test/output/package/native verification plan. |
| `V15-CLOSE-INV-01` | Every current guide, support, legacy, generated, test-only and local-state file has one final disposition. | Reconciled 00-14 allowlist and corpus inventory; each retained non-guide file has purpose/owner; each removed/moved file has migration evidence. |
| `V15-CLOSE-INDEX-01` | Canonical guide numbering and index are complete. | Unique 00 index and sequential 01-14 instructional/reference filenames; all retained guide/reference documents linked with correct guided/standalone/destination roles. |
| `V15-CLOSE-LINK-01` | All current AMX narrative links and assigned documentation references resolve safely. | Automated link/path audit verifies relative supported `.amx` targets exist within guide; README, desktop/VS Code Help, authoring and current V0.12-V0.14 links resolve; historical V0.1 is explicitly classified. |
| `V15-CLOSE-ASSET-01` | All required data and library dependencies are contained and correct. | Positive and negative input mappings point to the approved `data/`, `fixtures/invalid/`, and `libraries/` files; invalid fixtures remain distinct; no host-specific local config is required. |
| `V15-CLOSE-RUN-01` | Every runnable guide/reference works under its stated input assumptions. | Execute 01-14 or documented non-runnable exception; assert representative bindings, diagnostics, and Measurement values with units; no file is silently omitted. |
| `V15-CLOSE-NEG-01` | Negative fixtures fail with documented behavior. | Exact diagnostic IDs/locations/field paths for invalid inputs/types/domains/format cases; failures do not produce success-shaped or partial named outputs. |
| `V15-CLOSE-FEAT-01` | Approved user-facing feature matrix is covered. | Trace all accepted `V15-IA-FEAT-*` rows through numbered sources, exact tests and results, including V0.14 runtime type checks, math/units, text/Unicode, formatting, diagrams and document workflows. |
| `V15-CLOSE-OUTPUT-01` | Removed HTML snapshots have reproducible temporary-output coverage. | Before hashes and authorized disposition for the four HTML files; tests render to temporary destinations and assert key structural/content outcomes after removal. |
| `V15-CLOSE-OUTPUT-02` | The user-supplied Kitchen Sink PDF and accepted Sprint 093 incident outputs are preserved. | PDF hash equals `9ADD5C76030F9D6248A8126EFA0D96F2E1FC2168A654DA1F07E2B6953E3BE778`; `desktop-app/build/dev-win-x64` is untouched from Sprint 094 start; S093 package attempts remain unchanged. |
| `V15-CLOSE-REF-01` | All live path consumers are migrated or explicitly retained. | Search/review matrix includes root/desktop docs, VS Code/authoring, specs, package scripts, release smoke, root/desktop tests and resource paths; no unexplained live legacy/generated-output reference remains. |
| `V15-CLOSE-TEST-ROOT-01` | Applicable root build and complete root test suite are run. | Exact root build and full `bun test` commands, complete counts, per-test failures/retries, tool versions and raw logs. Focused test passes do not substitute. |
| `V15-CLOSE-TEST-DESKTOP-01` | Desktop contract/type/web/UI checks are run and S093's RPC residual is dispositioned. | Desktop `bun run test`, `bun run typecheck`, `bun run build:web`, focused guide/Help/UI/navigation checks. Sandbox-count mismatch is either narrowly authorized and verified or remains raw FAIL/BLOCKED with owner and explicit disposition. |
| `V15-CLOSE-PACKAGE-01` | Built package has exact canonical guide payload. | Manifest/path/hash parity for the complete 24-file approved allowlist; no local state, legacy/test material, generated output, PDF, unrelated assets, or source-checkout dependency. |
| `V15-CLOSE-OFFLINE-01` | Packaged guide project can be created and followed offline. | From packaged resources, create a project in an empty temporary location, open the index, follow representative links, open required local support, execute mapped-data lessons, and observe no external requests. Keep package smoke distinct from manually installed/native evidence. |
| `V15-CLOSE-NATIVE-01` | Direct installed/native acceptance is attempted on available supported hosts. | Record host, package, installation/launch steps, offline workflow, outputs and logs. Unavailable OS/native routes remain `BLOCKED/UNAVAILABLE`; one host is not cross-platform certification. |
| `V15-CLOSE-DESKTOP-01` | Existing project and starter behavior remains unchanged. | Standard creation still produces/open `report.amx`; Hello/Operations Note remain input-free; guide creates the full allowlisted project, opens the index, and omits `report.amx`; failure/cancel cases preserve user data. |
| `V15-CLOSE-SECURITY-01` | Safe project and navigation boundaries remain unchanged. | No arbitrary renderer source/resource path, path traversal, symlink escape, remote dependency, weakened sandbox/CSP, broadened attachment permission, or altered safe local-link confirmation. |
| `V15-CLOSE-INCIDENT-01` | Sprint 093's accepted pre-authorization build incident remains accurately represented. | Preserve the post-incident state; do not claim recovery or baseline integrity before the accidental build; distinguish accepted process exception from successful verification. |
| `V15-CLOSE-SCOPE-01` | Sprint remains within example/onboarding acceptance scope. | No runtime/editor/renderer feature changes, release/publication/version action, unsupported platform/certification claim, or `planning/STATUS.json`/historical-record changes. |
| `V15-CLOSE-DISPOSITION-01` | Separate V0.15 closeout disposition is recorded. | Lead Developer/product-owner `ACCEPTED/CLOSED` with named exceptions or `BLOCKED/OPEN` with owners; Builder recommendation alone does not close V0.15. |

## Desktop RPC Sandbox-Count Residual

Sprint 093 recorded a blocked desktop `bun run test` because
`tests/rpc-contract-check.ts` expects two `sandbox="allow-scripts"`
attributes while current `App.vue` contains one; later checks in that script
did not run. Sprint 094 must re-run the script and preserve the initial raw
result.

Do not change the assertion, App markup, CSP, or sandbox flags solely to
obtain a green suite. Establish the intended security contract, get explicit
approval for a narrow correction if needed, and run the complete script.
Otherwise leave the raw failure visible and request separate disposition
with a named owner. An accepted residual is not a test pass.

## Generated Output and Special Preservation Rules

- Delete the four legacy HTML outputs only after their tests render to
  temporary destinations and assert meaningful content/structure.
- Keep `examples/kitchen-sink.pdf` unchanged at the stated SHA-256; no
  generation over this path, move or deletion.
- Preserve all accepted Sprint 093 package attempts and the
  `desktop-app/build/dev-win-x64` output state from Sprint 094 start. Do not
  attempt restoration of the pre-incident build state.
- `examples/.openamx/local.json` remains excluded from the guide package.
  Its source disposition must be explicit; do not remove without exact
  path authorization.
- Generated and native package results are written only to approved
  Sprint 094 output paths. Keep raw logs/screenshots and retries without
  overwriting prior sprint artifacts.

## Full Verification and Closeout

- Root build and complete root test results include actual counts and
  failures.
- Desktop unit/RPC, typecheck, web/resource build, Help/guide UI, package
  parity, project-creation and local-link checks are direct and separately
  identified.
- Package service smoke, built installer inspection, and manual installed
  native workflow are distinct evidence categories.
- Every unavailable test/platform has an exact reason and owner. No
  build/focused test/user report is used as another surface's evidence.
- Lead Developer/product owner separately records `ACCEPTED/CLOSED` with
  named residuals or `BLOCKED/OPEN` with required follow-up. Release,
  publication and version changes remain separate gates.
