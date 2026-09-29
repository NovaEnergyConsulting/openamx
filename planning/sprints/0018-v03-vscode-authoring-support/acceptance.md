# 018 Acceptance Criteria

Sprint 018 is complete when:

- `.amx` provider formatting supports V0.3 type fields, functions, imports/exports, inputs, and nested record/other braced expressions in executable fences; formatted source is parser-valid and idempotent, and Markdown/front matter/ordinary fences remain byte-identical.
- V0.2 formatting, keyword/function/in-scope variable completion, parser diagnostics, CRLF handling, and diagnostic clearing continue to pass host tests.
- V0.3 completion offers relevant keyword/type/value/function/input names and record fields where determinable, with active parameter/iterator scope. Later, private, narrative-only, and out-of-scope names do not appear.
- An entry document with resolvable local imports completes only explicit exported symbols and uses them for static checking. Missing/unresolvable imports, collisions, and cycles do not cause fabricated completions or module evaluation.
- The extension publishes source-located V0.3 parser and static AMX3 diagnostics (and actionable local import/link AMX5 diagnostics where supported) with correct 1-based UTF-16 to VS Code mapping; diagnostics update or clear after fixes and on close.
- The active unsaved buffer is analyzed without writing it to disk. Editor checks do not execute AMX or read CSV/JSON input files; no runtime data-validation diagnostics are advertised.
- Extension Development Host tests exercise the above on real and unsaved documents, including imported types/functions/values and at least one invalid V0.3 type use, while V0.2-only documents retain parser-only provider behavior.
- Root `bun run build` and `bun test` pass; extension `bun run compile` and `bun run test` pass in an Extension Development Host.
- A local VSIX is packaged, installed through the documented VS Code CLI, and its installed providers are checked in the host where supported. Record exact results, environment limitations, package artifact, and the unresolved license/publication status.
- No LSP, CLI data feature, domain feature, Marketplace upload, or Sprint 019 release documentation/examples are included.
