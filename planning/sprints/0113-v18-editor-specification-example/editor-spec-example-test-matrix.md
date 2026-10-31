# Sprint 113 Editor, Specification, and Example Test Matrix

S113 depends on S112. Its product-owner disposition is pending as of
2026-10-31; the cases below are preparation requirements, not executed or
authorized checks.

| S113 ID | Surface | Fixture/action | Required assertion | Candidate evidence |
| --- | --- | --- | --- | --- |
| SH113-FACTS-01 | Shared editor facts | Direct and nested loop/conditional content from `GEN-MIX-01` | Controls receive keyword facts; every nested primitive keyword/name, property, and expression fact maps to its original source span | `tests/editor.test.ts` |
| SH113-FACTS-02 | Shared editor facts | Repeated primitive source node emitted by one loop | One source declaration is highlighted at its authored range; do not create per-generated-instance facts | `tests/editor.test.ts` |
| SH113-BOUNDARY-01 | Markdown/editor facts | Matching-looking source in narrative and non-AMX fences | No nested diagram facts leak into inert prose or other languages | `tests/editor.test.ts` |
| SH113-COMPAT-01 | Shared editor facts | Existing direct-only V0.13 diagram | Existing diagram/time/primitive/property facts remain unchanged | `tests/editor.test.ts` |
| TM113-TOKENS-01 | VS Code TextMate grammar | Actual nested diagram `for`, `in`, `if`, `else` lines | Existing keyword scopes apply to controls inside diagram blocks | `vscode-extension/src/test/providers.host.ts` |
| TM113-ELEMENT-01 | VS Code TextMate grammar | Primitive declaration inside a loop and conditional | Primitive keyword and source name get diagram-element scopes | Host test using actual grammar |
| TM113-BOUNDARY-01 | VS Code TextMate grammar | Similar tokens in narrative/non-AMX fences | Existing Markdown boundaries remain correct | Host test using actual grammar |
| TM113-EDIT-01 | VS Code Extension Development Host | Open complete nested V0.18 fixture | Diagnostics are empty for valid syntax; format/navigation behavior in scope remains stable | Host provider test |
| UI113-DESKTOP-01 | Desktop CodeMirror | Paste/open nested diagram fixture | `.amx-token-keyword` shows controls; `.amx-token-declaration` shows nested primitive names; no diagnostic marks appear | `desktop-app/tests/ui/v16-language-editor.pw.ts` or approved new focused test |
| UI113-FORMAT-01 | Desktop editor | Format the nested fixture twice | Canonical output is stable and nested blocks remain intact | UI harness; shared formatter test |
| SPEC113-CONTRACT-01 | V0.18 spec | Cross-check normative additions | Syntax, ordering, timing, `t`, cap, diagnostics, compatibility, and export claims match accepted evidence | Manual traceability |
| README113-LINK-01 | Root README | Follow V0.18 diagram/spec/example links | Both links resolve; navigation is additive and existing links remain | Link/file audit |
| EX113-RUN-01 | Example 08 | Execute example through checker/runtime/HTML render | Example is runnable; generated count is below 64; no control uses `t` | Focused root/CLI run |
| EX113-FRAME-01 | Example 08 | Inspect one model at lower/interior/upper time | Generated membership/order remains stable; `t`-driven primitive properties change | Diagram/browser example check |
| EX113-STATIC-01 | Example 08 | Export PDF and DOCX | Both contain the generated lower-bound elements in the documented order | Existing export tests or approved direct export |
| EX113-IDENTITY-01 | Example 08 | Repeated generated primitive declarations | Documentation and tests do not promise unique source names or public addressing per generated instance | Spec/example review |

## Verification Boundaries

- VS Code TextMate tokenization must be measured with the actual grammar in
  the Extension Development Host. Grammar edits are conditional on failures.
- Shared parser-proven facts and rendered CodeMirror spans are separate
  surfaces; a passing unit test does not prove desktop presentation.
- Desktop Vite harness evidence is not native Electrobun/WebView evidence.
  Carry S112's intermittent preview bridge result as a residual until its
  owner disposition is recorded.
- The example's direct evaluation, standalone playback, PDF, and DOCX are
  distinct checks. A generated HTML figure string alone does not prove frame
  evaluation or export output.
- Record all failures/retries and unavailable host checks. Do not turn the
  S112 raw preview/browser status into PASS based on the later disposition.