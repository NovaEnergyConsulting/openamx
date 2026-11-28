# S132 Local Package Inventory

Host: Windows x64. Bun CLI: 1.4.5 (`a7733435c`). Hutch project pin: 0.30.0. Electrobun: 2.0.7. All artifacts were generated in detached validation worktrees; no release output was assembled or published.

## V0.20 Pre-Updater Bootstrap Artifact

Worktree baseline: `c05f608f86c2366358e9533a126464dc11fff416`. Package version: `0.20.0`. App identity: `OpenAMX Desktop` / `dev.openamx.desktop`. Stable Windows x64 manifest: schema 1, channel `stable`, platform `win`, arch `x64`, app hash `291u650op27nh`, payload `stable-win-x64-OpenAMXDesktop.tar.zst`. Source inspection confirms the updater call path is absent. Installer was built but not installed.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `stable-win-x64-update.json` | 205 | `6ca5dbebb87f406a14b7f495ddfd73f8b6eaa4c698b7dcdb4e5c2ad8126127d4` |
| `stable-win-x64-OpenAMXDesktop.tar.zst` | 57,347,824 | `4f1866a06ae2245e6d1d4ac3daa5976be5525b3d346624d8fc0f387b4fdbfed6` |
| `stable-win-x64-checksum.json` | 123 | `57d7819e328ddac43ecdb02f5e7c15677a08041da720f615f00e61afe304c8d3` |
| `win-x64-OpenAMXDesktop-Setup.zip` | 58,232,213 | `831cd970f3a97d9644646e106f44f98b8c2570a866fe1f2effee08ac854c1d8b` |

Checksum fields: `hash=291u650op27nh`, `tarSha256=f8958310792356605d7e40f714e4eaba7088675e212790c7ad9be832034192c1`, `tarSize=160518144`.

## V0.21 Production-Config Audit Package

Worktree baseline: `f2bddb1205b2e9213c8fe56ec75112e13e0e1355`. Temporary synchronized package version: `0.21.0`. Production `release.baseUrl` remains the stable GitHub URL. Manifest: schema 1, channel `stable`, platform `win`, arch `x64`, app hash `3aq2z4odyzfjf`. Artifact inspection passed. Archive scan found the GitHub stable URL in `OpenAMXDesktop/Resources/version.json` and `OpenAMXDesktop/Resources/app/bun/index.js`, and no loopback URL. Patch generation was disabled; no patch files emitted.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `stable-win-x64-update.json` | 205 | `782aeeefa6bec1b47cc1b878c2194336e17242c903952f63625bfd5b575bf7b5` |
| `stable-win-x64-OpenAMXDesktop.tar.zst` | 57,348,648 | `2b0f423b05d80253fba68b90be3f09b6911e56ea5c31491e67ca1be59c247e81` |
| `stable-win-x64-checksum.json` | 123 | `7c7d1477235e59f0c2fd559a2c4f9bc1b108fda777d6d36bab42278b821f3d5c` |
| `win-x64-OpenAMXDesktop-Setup.zip` | 58,232,131 | `daf3f01ecabe9c5dcce26067152d23f7ef85e46d96ade65f02110394fd701a5c` |

Checksum fields: `hash=3aq2z4odyzfjf`, `tarSha256=392daa1e0035527bf7a0b877669146ff7cdc883bf7214042c00ceb96fc9b3113`, `tarSize=160532480`.

## V0.21 Loopback Test Package

Worktree baseline: `f2bddb1205b2e9213c8fe56ec75112e13e0e1355`. Temporary synchronized package version: `0.21.0`. Test-only host is hardcoded to `http://127.0.0.1:4184` in this detached worktree only. Archive scan found the loopback URL in `version.json` and the Bun entrypoint and no production GitHub URL. Patch generation was disabled; no patch files emitted.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `stable-win-x64-update.json` | 205 | `708a5e11bc8876d5f70e9bfc6dc47762ef26cb79a74423edc41c6e720fa3af79` |
| `stable-win-x64-OpenAMXDesktop.tar.zst` | 57,348,639 | `e662cfbe06568245cf98fc26c44b90c8f2abfaa10e235a294d8ec8eeb2c57827` |
| `stable-win-x64-checksum.json` | 123 | `665a0e6ce74a49fd8b51d5f7e62bcc79a4a011590aa5f626f0b8ad777d17c8e9` |
| `win-x64-OpenAMXDesktop-Setup.zip` | 58,231,886 | `7a558ae410c8a27e276da8f68e00b25954ebe5557f11d687527eecbbe470f238` |

Checksum fields: `hash=1ni4deqshd9h8`, `tarSha256=7aad99a3c606732ab3a1609f4ceb21e223dea9e241074d8603f8d41f110e241a`, `tarSize=160532480`.

## V0.21.1 Loopback Update Target

Worktree baseline: `f2bddb1205b2e9213c8fe56ec75112e13e0e1355`. Temporary synchronized package version: `0.21.1`. Test-only host is `http://127.0.0.1:4184`; the archive contains no production GitHub URL. Patch generation was disabled; no patch files emitted.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `stable-win-x64-update.json` | 205 | `b99a7c5aeea6231ccde0771ef34d2099712f8e053eb6857513bb4bc5ccf7f757` |
| `stable-win-x64-OpenAMXDesktop.tar.zst` | 57,348,502 | `d6ad5957db77793369a52d7fb1b8031b600f97c59b321928a7924b12be9b7599` |
| `stable-win-x64-checksum.json` | 123 | `913206b7edb0c57d98d3715c7787e3a9cd8879ab5b08520d6df483d4554e9a99` |
| `win-x64-OpenAMXDesktop-Setup.zip` | 58,231,743 | `b36746a3625d74c8202d885e97df356df6cfdaa91f72de272493952e4bf3d22f` |

Checksum fields: `hash=1q9exidgvkkgv`, `tarSha256=f1b33a142b3b4aaaf64da014fe287b958d30e27db1bce79d7ddeed4ee0b2cbff`, `tarSize=160532480`.

## Local Host Smoke Log

The host served exact basenames only, bound to `127.0.0.1`, and recorded five GET requests total: V0.21.1 manifest/checksum, V0.21.0 manifest/checksum, and one final V0.21.1 manifest runtime smoke after the host's type-only refactor. All returned 200 from client `127.0.0.1`. No `.tar.zst` request occurred; these were fixture smoke checks, not packaged-app behavior or consent evidence. The server was stopped after the scenarios.

`requests.jsonl` size: 764 bytes. SHA-256: `e7ec0bffcd5fe543f72f543b710facd5cbd4764e8bf4e77e51c9a20102e91d3d`.

## Boundaries

The Setup installers and updater packages were not installed or launched. No `release:desktop`, `release:collect`, `release:verify`, or `release:publish` command was run. No local release assembly was produced. Windows x64 is the only S132 package host; all other OS/architecture targets remain `NOT RUN`.
