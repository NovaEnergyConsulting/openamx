# Sprint 131 Builder Evidence

## Status

Builder implementation and scoped verification are complete. Builder
recommendation: **ACCEPT WITH RECORDED RESIDUALS**. Product Owner disposition
is separate and remains pending.

## Authorization and Baseline

- Product Owner authorization confirmed 2026-11-28 for the exact envelope:
  baseline `72ea5fa0824c412a05f1d7a4f817bd8c916823f4` on
  `feat/create-V0.21.0`; detached validation worktree
  `C:\Users\gamez\Programming\openamx-s131-validation-72ea5fa`;
  allowlist `docs/releasing.md`, conditional focused coverage in
  `tests/release.test.ts`, and S131 evidence; commands
  `bun test tests/release.test.ts`, `bun run release:check`, and
  `git diff --check` from the validation root; evidence under this sprint's
  `artifacts/run-01/`; preserve the named release and prior-sprint paths,
  perform no cleanup, preserve first failures/retries, and stop on the stated
  scope/publication boundaries.
- A separate authorization was obtained after the first focused test attempt
  failed because the detached worktree had no installed dependencies. It
  permitted only `bun install --frozen-lockfile` in the validation root; its
  `node_modules` remains there and was not cleaned.
- The primary checkout was clean at the authorized baseline before work.
  The validation worktree is retained. The initial worktree-creation logging
  wrapper failed on an invalid `Tee-Object` parameter before the worktree
  existed; the path was confirmed absent, then the command succeeded on retry.
  Both outcomes are in [worktree-create.log](artifacts/run-01/worktree-create.log).
- Final changed source paths are `docs/releasing.md` and
  `tests/release.test.ts`; no release implementation files or configuration
  were changed. Evidence and raw outputs are under `artifacts/run-01/`.

## Documentation and Test Changes

- Updated `docs/releasing.md` with the accepted stable host and GitHub
  latest-release semantics; required manifest/full-payload/checksum/Setup
  artifacts and filename patterns; checksum fields; explicit
  `release.generatePatch: false` full-bundle-only policy; byte/name retention
  through target bundles, assembly, and flat publisher assets; V0.20 installer
  bootstrap; consent and quit-safe apply behavior; and human-only review and
  publication.
- Clarified that the historical V0.8 Linux x64 release-bundle evidence is
  distinct from S128's Windows x64 native updater-artifact inspection, which
  did not exercise collected/assembled release bundles.
- Existing focused tests already covered stable metadata/checksum validation
  and byte/name retention through assembly. The duplicate-basename test only
  asserted that no assets were uploaded; its mock did not record every client
  method. The focused test helper now records commit, asset-list, download,
  and upload calls, and the duplicate-name case asserts there were no client
  calls. No release implementation change was needed.

## Toolchain and Host

- Host: Windows x64.
- Bun: `1.4.5`.
- `release:check` reported Hutch `0.28.2`, Node `v24.13.1`, npm `11.8.0`, and
  vsce `3.9.1` available. The accepted project pins remain Hutch `0.30.0` and
  Electrobun `2.0.7` per S128; this preflight did not build or validate those
  pins and is not packaging evidence.

## Raw Results

| Check | Command / CWD | Raw status | Evidence |
| --- | --- | --- | --- |
| Worktree creation, first wrapper attempt | `git -c core.longpaths=true worktree add --detach ...` / primary root | FAIL before worktree creation: `Tee-Object` parameter binding error | [worktree-create.log](artifacts/run-01/worktree-create.log) |
| Worktree creation retry | Same Git command / primary root | PASS; detached at authorized baseline | [worktree-create.log](artifacts/run-01/worktree-create.log) |
| Protected-path baseline | SHA-256 inventory / primary root | PASS; 4,042 files, 2,187,374,220 bytes | [preservation-before.csv](artifacts/run-01/preservation-before.csv), [preservation-before.log](artifacts/run-01/preservation-before.log) |
| Focused release tests, attempt 1 | `bun test tests/release.test.ts` / validation root | FAIL before test discovery: `0 pass, 1 fail, 1 error`; missing `jszip` | [release-test-attempt-01.log](artifacts/run-01/release-test-attempt-01.log) |
| Frozen dependency install | `bun install --frozen-lockfile` / validation root | PASS; 80 packages installed; no manifest or lockfile change | [dependency-install.log](artifacts/run-01/dependency-install.log) |
| Focused release tests, attempt 2 | `bun test tests/release.test.ts` / validation root | PASS; 65 tests, 0 failures, 256 expectations | [release-test-attempt-02.log](artifacts/run-01/release-test-attempt-02.log) |
| Release preflight | `bun run release:check` / validation root | PASS, exit 0; Windows x64 host available, native packaging unverified; other target rows unverified | [release-check.log](artifacts/run-01/release-check.log) |
| Final whitespace check | `git diff --check` / validation root, after syncing the evidence file | PASS, exit 0 | [diff-check-final.log](artifacts/run-01/diff-check-final.log) |
| Final protected-path comparison | SHA-256 inventory / primary root | PASS; 4,042 files; only the two authorized source paths changed | [preservation-after.csv](artifacts/run-01/preservation-after.csv), [preservation-comparison.log](artifacts/run-01/preservation-comparison.log) |
| Final worktree status | `git status --short` / primary and validation roots | Only the authorized docs/test changes plus S131 evidence; validation dependencies retained | [final-worktree-status.log](artifacts/run-01/final-worktree-status.log) |

The initial test failure and retry are both preserved. The install used the
frozen lockfile and populated only validation-worktree dependencies. The
passing test suite exercised local fixtures and injected GitHub clients; no
GitHub API, public updater URL, or publication was invoked. Bun's test output
included Git LF/CRLF warnings from fixture worktrees; the suite still passed.
PowerShell surfaced Bun stderr as `NativeCommandError` text for some commands;
the raw logs also record their process exit codes.

## Contract Verification

| Contract | Result | Evidence |
| --- | --- | --- |
| Stable update metadata, full payload, checksum sidecar | PASS in focused local fixture tests, including mismatched/missing metadata and checksums | [release-test-attempt-02.log](artifacts/run-01/release-test-attempt-02.log) |
| Assembly retains update asset names and bytes | PASS in focused local fixture test | [release-test-attempt-02.log](artifacts/run-01/release-test-attempt-02.log) |
| Duplicate flat publisher basename is rejected before client calls | PASS; zero injected-client calls asserted | [release-test-attempt-02.log](artifacts/run-01/release-test-attempt-02.log) |
| No-patch/full-bundle policy | S128 accepted configuration and Windows x64 artifact evidence; S131 did not build | [S128 compatibility note](../0128-v21-toolchain-update-host-contract/compatibility-note.md) |
| V0.20 bridge and consent behavior | Documented from accepted S130 contract; not installed-app evidence | [S130 acceptance](../0130-v21-update-prompt-and-quit-safe-apply/acceptance.md) |
| Native artifact evidence | Windows x64 only; no S131 native build or platform certification | [S128 Builder evidence](../0128-v21-toolchain-update-host-contract/builder-evidence.md) |

## Preservation and Scope Audit

The before/after SHA-256 manifests cover `docs/releasing.md`,
`tests/release.test.ts`, all files under `scripts/release/` and `releases/`,
and all files in Sprint 121 through Sprint 130 directories. The inventory
remained at 4,042 files. The only differing paths were the authorized
`docs/releasing.md` and `tests/release.test.ts`; `scripts/release/`,
`releases/` (including ignored accepted bundles), and S121-S130 evidence had
no differences.

- Before manifest SHA-256:
  `8D04885DEC58E46DC13531FF7E5B7F9041D7EFB1AA92E026FDD01A0936208D11`
- After manifest SHA-256:
  `F40587DE8E3BE3737256358C37CCDB092EDAB0AD4264ECE548B0B45A793D0269`
- Final source SHA-256 values were recorded during validation-worktree sync
  in [validation-worktree-sync.log](artifacts/run-01/validation-worktree-sync.log).

No accepted bundle or release output was created, overwritten, or deleted.
No release build, collection, publisher command, GitHub operation, public host
request, or cleanup was performed. The authorized validation worktree and
installed dependencies remain in place.

## Residuals and Disposition

- Installed-app update behavior, live-host behavior, public GitHub asset
  availability, and native platforms other than Windows x64 remain
  unverified. S132 owns installed-app and integrated acceptance.
- `release:check` is a preflight only. Its global Hutch `0.28.2` availability
  does not replace S128's accepted project pin or native Windows x64 artifact
  evidence.
- Builder recommendation: **ACCEPT WITH RECORDED RESIDUALS** for the
  authorized S131 scope.
- Product Owner disposition: **ACCEPTED/CLOSED WITH RECORDED RESIDUALS on
  2026-11-28.**
- No release, publication, deployment, distribution, or platform
  certification authority follows S131.
