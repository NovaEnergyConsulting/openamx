# Sprint 101 Blueprint: V0.16 Integrated Acceptance and Closeout

## Approach

1. Obtain separate Sprint 101 execution authorization and approval of the
   exact verification, path, output, and evidence plan. Record branch,
   worktree, tool versions, and preservation hashes/inventory as approved.
2. Reconcile Sprints 095-100 dispositions and residuals. Preserve all prior
   raw outcomes. Confirm `AMXF4001` is static missing-return at the closing
   brace and `AMXF4002` is runtime defensive fallthrough; `AMX3021` remains
   specific to braced-if expressions.
3. Establish an isolated validation workspace before any build. Sprint 100
   deliberately preserved a stale repository `dist/cli.js`. Root
   `bun run build` also generates `src/renderer/diagramBrowserRuntime.ts`.
   Use a separate temporary copy/worktree with its own `dist/` and generated
   runtime file, or obtain exact approval of isolated replacement paths.
   Do not overwrite the pre-existing source worktree's generated outputs.
4. Run narrow cross-layer checks first, in dependency order:
   - parser and AST body-form/source-location tests;
   - runtime evaluator and list isolation/return propagation tests;
   - return-path/type checker tests and exact AMXF4001 points;
   - formatter idempotence and evaluation-preservation tests;
   - shared editor facts, completion, symbol, rename, and diagnostic tests;
   - module export/import and declaration-order tests for both body forms;
   - valid reference and isolated negative fixture tests.
5. Run a fresh root build in the isolated workspace, then run the full root
   suite against that generated CLI and source. Record complete counts and
   all failures, including any test that shells through `dist/cli.js`.
6. Verify offline guide resource allowlist/parity/materialization and Help
   tests. The guide bundle includes reference 15 and the approved negative
   fixture but executes only valid examples as success cases.
7. Run VS Code compile/compile-tests and actual Extension Development Host
   tests. First record the configured `bun run test` behavior (known runner
   pins 1.85.0). If it fails before tests due engine mismatch, use the
   already evidenced installed VS Code 1.143.1 executable only if explicitly
   included in the plan; report both results separately.
8. Run desktop typecheck, web build, RPC contract, focused function-body and
   Help Playwright tests. Use isolated build and a new unique Playwright
   output directory. Record the known desktop RPC sandbox-count baseline
   without changing security/test behavior.
9. Inspect whether a direct native/package workflow is approved and
   available. Keep Vite harness, package resource parity, native launch, and
   cross-platform coverage distinct. Mark unavailable routes
   `BLOCKED/UNAVAILABLE` with exact reasons.
10. Complete `integrated-evidence-matrix.md` for every requirement and
    applicable surface; preserve initial failures/retries, exact commands,
    tool versions, artifacts, and residual owners. Run final diff/path checks
    and request a separate product-owner disposition.

## Isolated Build and Preservation Plan

- Preferred: create a unique temporary validation copy of the authorized
  source snapshot, with dependencies reused through a read-only link or
  approved install strategy. Run root/desktop/extension builds there so
  generated `dist/`, diagram runtime, VS Code `dist/out`, desktop build, and
  guide staging outputs cannot overwrite the shared source tree.
- If a temporary copy is not technically feasible, obtain approval for the
  exact existing output paths and baseline hashes before any command that
  writes them. Stop if a command's output target differs from the approved
  list.
- Keep Playwright results under a new Sprint 101-specific output directory;
  do not clean/reuse `desktop-app/test-results/`.
- All example render/export outputs use a unique temporary directory. Do not
  overwrite tracked HTML snapshots, PDFs, user data, or previous sprint
  artifacts.
- Preserve each raw command output and its first failure/retry; do not report
  only the final successful retry.

## Integrated Requirement Groups

Use `integrated-evidence-matrix.md` as the authoritative status table:

| Group | Required evidence |
| --- | --- |
| `INT101-PARSE` | Both AST forms, approved statement grammar, prohibited/malformed syntax, source locations, LF/CRLF/UTF-16. |
| `INT101-RUNTIME` | Direct/nested/loop return, local scope, list arguments, repeated args, returned lists, expression compatibility, AMXF4002 guard. |
| `INT101-TYPE` | Compatible/incompatible returns, all-path rules, zero-iteration loop, unreachable checking, AMXF4001 and AMX3021 separation. |
| `INT101-MODULE` | Expression and braced exported functions, import execution, source order, no recursion/forward refs/captures. |
| `INT101-FORMAT` | Idempotence, token preservation, expression body stability, strings/braces, CRLF and document fences. |
| `INT101-EDITOR-SHARED` | Highlight/completion/navigation/rename/symbol identity/source diagnostics. |
| `INT101-EDITOR-VSCODE` | Actual TextMate tokenizer and Extension Development Host providers. |
| `INT101-EDITOR-DESKTOP` | Desktop shared analysis/CodeMirror UI and Help/editor workflow. |
| `INT101-DOCS-EXAMPLES` | V0.16 spec, positive reference, negative fixture, README/help links, index navigation. |
| `INT101-GUIDE` | Allowlist/parity, offline materialization, valid reference run; negative fixture remains negative-only. |
| `INT101-REPO-GATE` | Fresh isolated build, full root test suite, relevant desktop/extension tests, exact failures/residuals. |
| `INT101-PLATFORM` | Native/package/platform checks if approved/available; otherwise explicit blocked/unavailable status. |

## Verification Command Baseline

Use these as proposed commands; confirm exact output paths and approved
working directories before execution:

- Root focused tests: `bun test tests/parser.test.ts tests/evaluator.test.ts tests/functionBodyTypeChecking.test.ts tests/modules.test.ts tests/formatter.test.ts tests/editor.test.ts tests/examples.test.ts tests/numbered-guide.test.ts`.
- Root build/full gate in isolated validation copy: `bun run build`, then
  `bun test`.
- VS Code: `bun run compile`, `bun run compile-tests`, then the configured
  host suite and, if approved, the explicit installed VS Code executable
  route documented by Sprint 099 evidence.
- Desktop: `bun run typecheck`, `bun run build:web`, `bun run test`, focused
  `bun run test:ui -- tests/ui/v16-language-editor.pw.ts tests/ui/help-center.pw.ts --output=<new-sprint101-output>`.
- Guide resource: `bun test src/bun/guideResources.test.ts src/mainview/starterExamples.test.ts`.
- Finish with `git diff --check`, path inventory, and final preservation
  comparison in the approved validation copy/worktree.

## Notes

Sprint 101 closes integrated V0.16 acceptance only. Release, publication,
version changes, certification, and platform qualification are separate
decisions and are not inferred from a green build or accepted closeout.