# Sprint 082 Handoff Prompt

You are the Builder for OpenAMX Sprint 082: Editor, Examples, and
Documentation Integration.

## Read First

- `.agents/main.md` and the current worktree status; preserve existing user
  changes and artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV13MasterSprintPlan.md`.
- All Sprint 082 artifacts: `requirements.md`, `blueprint.md`,
  `acceptance.md`, and this handoff.
- Sprint 078 approved `grammar-examples.md`, `diagnostic-matrix.md`, and
  `requirement-test-matrix.md`.
- Sprint 079 `builder-evidence.md`; core diagram AST/parser/typechecker/
  runtime/model/formatter and editor services.
- Sprint 080 and Sprint 081 `builder-evidence.md`, including their tested
  artifacts and explicitly recorded residuals.
- Current V0.12 language specification/examples, README, desktop searchable
  Help, VS Code TextMate grammar/providers/tests, and desktop editor/help UI
  tests.

## Authority and Entry Gate

- Sprint 078's approved grammar, diagnostic identities/messages, source
  locations, examples, representation and constraints remain authoritative.
- Sprint 079-081 are reported implemented in their owned scope with
  residuals. Their evidence is an input, not a Lead Developer milestone
  acceptance or proof of untested surfaces.
- Before changing production or test files, obtain explicit Sprint 082
  execution authorization and approval of the concrete file-by-file plan.
- Sprint 082 preparation does not authorize execution, Sprint 083, release,
  or publication.

## Task Contract

- Extend existing shared editor services and wire supported behavior through
  both VS Code and the desktop CodeMirror authoring experience.
- Directly test each editor host for syntax highlighting, canonical
  formatting, diagnostics/source ranges, completion, symbols/outline and
  navigation. Add focused host/UI coverage using existing test frameworks
  when coverage is absent.
- Publish `docs/language-spec-v0.13.md`, link it from README, and update
  relevant searchable desktop/editor help. Document only approved behavior
  and accurately state known accessibility/platform limits.
- Add runnable crank-slider and battery-resistor examples. Validate both by
  analysis and through standalone HTML, PDF, DOCX and available desktop
  preview paths; inspect visible artifacts and static lower-bound frames.
- Preserve Sprint 079-081 semantics, diagnostics, preview security, export
  behavior, and residual records. No unrelated remediation or contract
  redesign.
- Create `builder-evidence.md` with a requirement-to-host/output matrix,
  exact commands and counts, screenshots/artifacts, retries, and
  FAIL/BLOCKED/UNAVAILABLE/NOT RUN residuals.

## Mandatory Boundaries

- Do not invent language features, diagnostic codes/messages, standard
  functions, coercions, or changes to source-range semantics.
- Do not weaken tests, modify the desktop iframe sandbox, silently accept
  incomplete syntax, or change interactive/static renderer behavior.
- Preserve PDF's documented accessibility limitation: visible searchable
  title/description and SVG metadata do not establish tagged PDF/PDF/UA or
  screen-reader support.
- Report VS Code/desktop suite failures and platform limitations directly.
  An RPC/shared-service result does not establish the corresponding visible
  editor behavior.
- No release, version bump, publication, platform certification, or V0.13
  end-to-end closeout is in scope.

## Completion

Meet every criterion in `acceptance.md`. Update planning ledgers and create
`builder-evidence.md` with exact status and residual owners. Do not declare
V0.13 accepted or released; Sprint 083 owns the integrated acceptance and
closeout decision.
