# Sprint 082 Blueprint: Editor, Examples, and Documentation Integration

## Approach

1. Confirm explicit Sprint 082 execution authorization and approval of the
   concrete file-by-file plan. Record current worktree state and read the
   approved V0.13 contract, Sprint 079-081 implementation evidence, and
   current editor/spec/example/help patterns.
2. Build a requirement-to-surface matrix from the V0.13 master plan and
   Sprint 078 fixtures. Identify shared editor service owners and separately
   map VS Code, desktop editor, specification/help, and example/render
   evidence. Do not infer one host's pass from shared facts or another host.
3. Extend existing shared editor services for diagram syntax:
   - highlighting/token facts, including nested blocks and incomplete forms;
   - canonical formatting delegated to the existing formatter;
   - static analysis diagnostics and exact source ranges;
   - completion for diagram declarations, supported element/property names,
     arrow values, and local time where existing completion architecture
     supports it;
   - outline/symbols/navigation and related supported language analysis;
   - incomplete-block resilience and regression protection for existing
     AMX syntax.
   Keep parser/type-checker/runtime semantics unchanged.
4. Wire supported shared facts into VS Code TextMate/Language Providers and
   desktop CodeMirror/workbench clients. Test each actual host surface:
   token scopes, formatting, diagnostic marks/ranges, completion, symbols,
   and navigation. Reuse existing host test workflows and UI harnesses.
5. Write `docs/language-spec-v0.13.md` from the approved V0.13 contract.
   Explain the syntax and examples; requirements, errors and source locations;
   time-dependent geometry/labels; pure existing AMX expressions/functions;
   static styling; controls and endpoint behavior; static PDF/DOCX frames;
   safe/offline behavior; accessibility limits; resource bounds; and explicit
   exclusions. Link the specification from README and existing relevant
   desktop/VS Code Help surfaces. Do not state V0.13 is released or fully
   platform/accessibility certified.
6. Add two concise runnable `.amx` examples: crank-slider and
   battery-resistor current-direction indicator. Preserve the exact approved
   interpretations: crank motion uses existing `abs`/`if`/`sqrt` and
   equations, with no `sin`/`cos`; battery current may remain 0.6 A while its
   direction arrow moves. Include explanatory narrative and accessible
   descriptions.
7. Validate both examples using the existing CLI analysis/run/render/export
   mechanisms and test suites. Produce HTML and exercise playback/scrubbing;
   export PDF and DOCX and inspect lower-bound frames, figure order,
   aspect ratio, DOCX PNG alt text, and searchable title/description. Test
   desktop preview in the available host path. Preserve and cite Sprint 080/081
   residuals instead of treating previous evidence as current host acceptance.
8. Add focused documentation/example/editor tests. Validate formatter
   idempotence, LF/CRLF ranges, incomplete blocks, AMXD diagnostic identities,
   and host-visible editor behavior. Run focused root tests/build, VS Code
   Development Host tests, desktop typecheck/build and focused UI tests.
   Record pre-existing Windows failures such as the desktop RPC sandbox
   occurrence mismatch separately without relaxing security or changing
   unrelated assertions.
9. Create `builder-evidence.md` with a master-plan-to-evidence matrix, exact
   commands, host surfaces, outputs/artifacts, screenshots, test counts,
   retries, residual owners, and unavailable checks. Update planning ledgers.
   Do not claim integrated V0.13 closeout; Sprint 083 owns that gate.

## Candidate Files to Update

The approved execution plan must list exact paths before any edits. Likely
surfaces include:

- Shared editor services: `src/editor/highlighting.ts`,
  `src/editor/completion.ts`, `src/editor/symbols.ts`, and only the related
  existing analysis/navigation/refactoring modules required by the contract
- VS Code: `vscode-extension/amx.tmGrammar.json`, existing providers/host
  tests, and extension documentation/help surfaces
- Desktop editor/preview authoring UI and its existing CodeMirror/Playwright
  test surfaces; do not change the already implemented playback renderer
  unless a directly demonstrated editor integration defect requires an
  approved amendment
- `docs/language-spec-v0.13.md`
- `README.md` and the existing desktop searchable Help data/source as needed
- `examples/v0.13-crank-slider.amx` and
  `examples/v0.13-battery-resistor.amx`
- Existing root documentation/example/editor tests, VS Code host tests, and
  desktop editor/help UI tests
- Sprint 082 `builder-evidence.md` (create during execution)
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`

Do not modify AST/parser/runtime/model/rendering semantics, PDF/DOCX adapters,
dependency manifests, package versions, release files, or unrelated docs/tests
without a separately approved file-plan amendment.

## Verification

From the repository root, run focused parser/evaluator/formatter/editor,
diagram, renderer/preparation/PDF/DOCX, example, and documentation suites
relevant to modified files, followed by `bun run build`.

From `vscode-extension`, run its existing Development Host test command and
record full counts and any Windows-only/inherited failures. From
`desktop-app`, run `bun run typecheck`, `bun run build:web`, relevant RPC
checks, and focused Playwright editor/Help tests. If UI test startup requires
the established Windows Vite workaround, verify HTTP readiness and record the
exact invocation.

For both examples, record exact CLI commands and inspect the resulting
standalone HTML, PDF, and DOCX. Check visible content and lower-bound static
frames; do not accept serialization success alone.

## Notes

Sprint 082 owns the last feature-integration surfaces before Sprint 083. It
should leave a traceable, usable authoring/documentation experience while
keeping product behavior unchanged. Existing open platform/accessibility and
full-suite residuals must remain explicit for the integrated closeout.
