# Sprint 078 Handoff Prompt

You are the Builder for OpenAMX Sprint 078: V0.13 Diagram Contract and
Feasibility Gate.

## Read First

- `.agents/main.md` and the current worktree status; preserve existing user
  changes and artifacts.
- `planning/state.md`, `planning/decisions.md`, and `planning/questions.md`.
- `planning/plan-openamxV13MasterSprintPlan.md`.
- All Sprint 078 artifacts: `requirements.md`, `blueprint.md`,
  `acceptance.md`, and this handoff.
- Existing language, renderer, desktop-preview, and test conventions only as
  needed to prepare the contract and isolated feasibility probes.

## Authority and Entry Gate

- The V0.13 master plan is the confirmed product-scope authority. Sprint 078
  makes the diagram contract implementation-ready and tests feasibility; it
  does not redesign scope.
- Before changing any file, obtain explicit Sprint 078 execution authorization
  and approval of a concrete file-by-file plan. The plan must identify all
  contract artifacts, ledgers, and any isolated probe files/artifacts.
- Production implementation remains out of scope even after Sprint 078
  authorization. Sprint 079 depends on an adequate contract and a separate
  readiness/disposition decision.

## Task Contract

- Produce `grammar-examples.md`, `diagnostic-matrix.md`,
  `requirement-test-matrix.md`, and `feasibility-report.md` as specified by
  the acceptance criteria.
- Freeze exact declaration, property, local-time, validation, source-location,
  and formatter expectations, or mark affected requirements BLOCKED and
  request a specific decision. Do not leave silent assumptions.
- Exercise a minimal crank-slider and battery-resistor case through standalone
  HTML, the actual desktop live preview, PDF, and DOCX. Use the same typed,
  destination-neutral model and inspect visible/artifact output.
- Prove or disprove safe offline arbitrary-time evaluation with existing AMX
  expression/function semantics. Do not compile authored expressions to
  executable source, use `eval`/`new Function`, execute report-authored
  JavaScript, rely on remote assets, or weaken preview isolation.
- Measure rendering time, output size, and preview-resource use from
  representative probes; recommend concrete bounds with evidence and
  caveats.
- Record all failures, retries, unverified paths, residuals, and required
  product decisions. Request separate Lead Developer disposition of the
  GO/NO-GO/BLOCKED recommendation.

## Mandatory Boundaries

- Do not change production parser, AST, type checker, runtime, formatter,
  editor, renderer, or desktop-preview behavior.
- Do not add standard-library functions or other language semantics merely to
  make the required examples pass. If an example cannot be expressed using
  confirmed AMX capabilities, stop and request a product decision.
- Do not invent diagnostic identities/messages. Record an unallocated
  identity until approved.
- Invalid input or frame evaluation must be recorded as an explicit failure,
  not as a blank, stale, omitted, or placeholder diagram.
- Keep test and probe artifacts within the approved sprint file plan. Do not
  claim that isolated probes implement or validate a production feature.
- No release, publication, version bump, or platform-certification claim is
  in scope.

## Completion

Meet every criterion in `acceptance.md`. Update the three planning ledgers
with the exact preparation/evidence status, pending decisions, and Builder
recommendation. Do not report Sprint 079 as ready unless the evidence supports
the conclusion and the Lead Developer records the required disposition.
