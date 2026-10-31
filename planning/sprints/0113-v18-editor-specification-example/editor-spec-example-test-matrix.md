# Sprint 113 Editor, Specification, and Example Test Matrix

S112 received a separate product-owner disposition of ACCEPT WITH RECORDED
RESIDUALS on 2026-10-31. S113 execution was explicitly authorized the same
day. Results below distinguish passing product evidence from the desktop
Vite-harness residual and other pre-existing failures.

S113 received a separate product-owner disposition of ACCEPT WITH RECORDED
RESIDUALS on 2026-10-31. This does not close V0.18 or authorize Sprint 114,
release, publication, version changes, or platform certification.

| S113 ID | Surface | Fixture/action | Required assertion | Result and evidence |
| --- | --- | --- | --- | --- |
| SH113-FACTS-01 | Shared editor facts | Nested loop/conditional content | Controls, primitive declarations, properties, and expressions map to authored spans | PASS: `tests/editor.test.ts`; exact-span assertions for `for`, `in`, `if`, `else`, nested primitives, `t`, and properties |
| SH113-FACTS-02 | Shared editor facts | Repeated primitive source node | One authored declaration fact; no generated-instance facts | PASS: one `tracePoint` declaration span |
| SH113-BOUNDARY-01 | Markdown/editor facts | Matching-looking prose and JavaScript fence | No facts leak from inert content | PASS: narrative and non-AMX assertions |
| SH113-COMPAT-01 | Shared editor facts | Direct-only V0.13 diagram | Existing direct syntax facts remain unchanged | PASS: existing V0.13 editor case |
| TM113-TOKENS-01 | VS Code TextMate grammar | Actual nested control tokens | Existing keyword scopes cover nested `for`, `in`, `if`, `else` | PASS: actual TextMate tokenizer in VS Code 1.143.1 host |
| TM113-ELEMENT-01 | VS Code TextMate grammar | Nested primitive declarations | Primitive keyword and declaration name receive diagram scopes | PASS: nested `circle`, `rectangle`, and `text` scopes asserted |
| TM113-BOUNDARY-01 | VS Code TextMate grammar | Narrative and ordinary code fence | Markdown/non-AMX boundaries remain inert | PASS: actual grammar assertions |
| TM113-EDIT-01 | VS Code Extension Development Host | Valid nested V0.18 source | No diagnostics; format output is idempotent | PASS: new host test |
| UI113-DESKTOP-01 | Desktop CodeMirror | Nested diagram fixture | Keyword/declaration spans render without diagnostics | PASS: Vite harness after approved active-buffer mock fix; output `artifacts/playwright-output/s113-v18-editor-06/`. Not native-host evidence. |
| UI113-FORMAT-01 | Desktop editor | Format nested fixture twice | Stable CodeMirror output | PASS: same desktop UI run; shared formatter and VS Code host formatting also pass. |
| SPEC113-CONTRACT-01 | V0.18 spec | Cross-check normative additions | Syntax, timing, order, `t`, limits, diagnostics, identity, and export contract match accepted sources | PASS: manual traceability; D111-02 remains explicit; S112 residuals retained |
| README113-LINK-01 | Root README | V0.18 navigation | Additive spec and example links present | PASS: focused example test asserts spec link; links are additive |
| EX113-RUN-01 | Example 08 | Checker/runtime/HTML | Runnable; three emissions below 64; no control uses `t` | PASS: focused root test, CLI run, and standalone HTML render |
| EX113-FRAME-01 | Example 08 | Lower/interior/upper frames and browser scrub/play | Fixed membership/order; time-dependent properties change | PASS: runtime assertions and standalone browser test; Play/Pause advances time |
| EX113-STATIC-01 | Example 08 | PDF/DOCX lower-bound exports | Three generated circles appear in source order | PASS: PDF SVG coordinates/order and DOCX PNG pixels asserted; CLI artifacts generated |
| EX113-IDENTITY-01 | Example 08 | Repeated `tracePoint` declaration | No unique per-instance source names or public addressing | PASS: specification and lesson explicitly describe one repeated authored label and internal identities only |

## Verification Boundaries

- VS Code TextMate tokenization must be measured with the actual grammar in
  the Extension Development Host. Grammar edits are conditional on failures.
- Shared parser-proven facts and rendered CodeMirror spans are separate
  surfaces; shared fact tests do not prove desktop presentation.
- The desktop Vite harness initially returned stale initial highlight facts;
   the approved S113 mock amendment corrected active-buffer lookup and the
   focused editor UI cases now pass. This remains Vite-harness evidence, not
   native Electrobun/WebView evidence. No native check was run. S112's separate
   intermittent preview-bridge residual remains recorded despite its ACCEPT
   WITH RECORDED RESIDUALS disposition.
- The workspace `get_errors` tool reported `Invalid diagram property` at the
  Example 08 loop even though focused CLI/parser execution and the VS Code
  Extension Development Host accepted the source. This analyzer disagreement
  remains unresolved and was not addressed outside the approved source paths.
- The example's direct evaluation, standalone playback, PDF, and DOCX are
  distinct checks. A generated HTML figure string alone does not prove frame
  evaluation or export output.
- Record all failures/retries and unavailable host checks. Do not turn the
  S112 raw preview/browser status into PASS based on the later disposition.