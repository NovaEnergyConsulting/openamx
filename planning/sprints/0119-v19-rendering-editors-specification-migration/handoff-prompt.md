# Sprint 119 Handoff Prompt

You are the Builder for OpenAMX Sprint 119: V0.19 Rendering, Editors,
Specification, and Migration.

## Read First

- Project instructions, current worktree, user changes, V0.19 master plan, and
  every document in this Sprint 119 package.
- Accepted Sprint 116 model/evaluation and Sprint 118 runtime/SI/external-data
  builder evidence and dispositions. No S119 behavior may reopen or redefine
  those accepted contracts.
- Only the HTML/PDF/DOCX renderers, shared chart model, browser bootstrap,
  VS Code grammar/tests, shared editor facts, desktop Vite UI tests, V0.19 docs,
  Examples 05/07, and their focused tests needed for the approved plan.

## Authority and Entry Gate

- This package is planning, not execution authorization. Obtain separate exact
  authorization for baseline, preservation, production/test/docs/example/SI
  path boundaries, extension host, desktop Vite UI, commands, generated output,
  artifacts, and evidence before the first edit.
- Sprint 116 and Sprint 118 are accepted but do not authorize S119 rendering,
  editor, docs, examples, Sprint 120, release, or publication.
- Any path outside the exact plan, renderer-generated artifact, or new host test
  requires a recorded file-level amendment before edits.

## Task Contract

- Consume `model.showTable` in HTML/preview, PDF, and every DOCX chart/fallback
  path. False omits chart-associated tables and output-facing table
  accessibility/payload references; true preserves current table behavior.
- For false HTML, remove table-specific browser JSON; use only a minimal
  ID-to-label map where plot tooltips/axis labels need it. Update browser
  bootstrap to operate without `model.table`.
- Update false chart accessibility/ARIA/alt text and all DOCX notices. Do not
  claim an absent table contains omitted/unplottable data.
- Add VS Code `showTable` option token scope and verify affine `+/-/*//^`, PI/E,
  and numeric/executable boundaries using the actual TextMate host. Preserve
  grammar only when gaps are proven.
- Add parser-proven desktop highlights for `showTable` and affine unit operator
  tokens; add shared and Vite CodeMirror UI tests with exact ranges/diagnostics/
  idempotent formatting. Do not add a second editor parser.
- Add `docs/language-spec-v0.19.md`, update README navigation/migration, and
  keep all historical specs unchanged.
- Update Example 05 with runnable affine temperature/PI/E/conversion/subtraction/
  aggregate examples and inert rejected examples. Update Example 07 with
  omitted/false/true/expression visibility while preserving named outputs and
  lesson inputs.
- Add focused HTML/PDF/DOCX/editor/formatter/docs/example/navigation tests for
  every S119 matrix row.

## Mandatory Boundaries

- Do not hide tables with CSS, offscreen markup, screen-reader-only duplication,
  hidden JSON rows, or alternate table output. False means actual omission.
- Do not reparses/evaluate `showTable` in output code. The shared Boolean is the
  only authority.
- Do not reopen S116/S118 syntax, runtime operation, affine declaration, SI
  unit, external shape, or diagnostic rules unless an exact evidenced defect
  amendment is separately approved.
- Do not expose public offset/scale/physical data or alter `{ value, unit }`.
- Do not edit historical specs, package/version, release, publication,
  deployment, installer, distribution, certification, or Sprint 120 files.
- Do not hand-edit generated runtime output. Use its source generator/approved
  build command and review hashes/diffs.

## Verification

Use only approved commands. Candidates include:

```text
bun test <exact focused renderer/PDF/DOCX/chart/editor/formatter/example/guide selection>
bunx tsc --noEmit
bun run build
configured VS Code extension host test command
configured desktop typecheck and Vite UI test command
git diff --check
git status --short
```

Inspect actual artifacts: HTML markup/JSON/ARIA, PDF prepared structures/text,
DOCX package XML/chart parts/tables/alt text, TextMate token scopes, CodeMirror
spans, Example 05 values, Example 07 exports and all four table states, spec
links, and migration text. Record raw counts, artifact paths/hashes, retries,
unavailable checks, and host-harness/native distinctions.

## Completion

Meet `acceptance.md`, reconcile the S115 CHT output/migration cases and all S119
IDs, and populate `builder-evidence.md` with reproducible evidence. Submit a
separate Builder recommendation for product-owner ACCEPTED/CLOSED or BLOCKED/
OPEN disposition. Only that disposition closes S119; Sprint 120 remains
independently gated.
