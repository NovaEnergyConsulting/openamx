# Sprint 117 Handoff Prompt

You are the Builder for OpenAMX Sprint 117: V0.19 Affine Declarations and Unit
Metadata.

## Read First

- Project instructions, current worktree status, and all user changes. Preserve
  existing artifacts, generated outputs, test results, and prior sprint evidence.
- `planning/plan-openamxV19MasterSprintPlan.md` and every Sprint 117 document in
  this package.
- Accepted Sprint 115 affine model/qualification/diagnostic evidence,
  especially D115-04, D115-05, D115-07, D115-08, and D115-09.
- Accepted Sprint 116 builder evidence to confirm the chart stream closed with no
  S117 overlap and no residual affecting this implementation.
- Only the unit metadata, declaration resolver, relevant module/editor registry,
  and focused tests needed for the exact approved implementation.

## Authority and Entry Gate

- This package is planning, not execution authorization. Obtain separate
  explicit Sprint 117 authorization and approval of the exact baseline,
  preservation plan, production/test paths, command plan, evidence/output
  roots, and amendment process before the first source/test edit.
- Sprint 115 contract acceptance does not execute S117; Sprint 116 closure does
  not authorize runtime affine work or S118/SI implementation.
- Keep edits within the approved S117 paths. A required change to runtime
  measurement conversion, external unit parsing, SI library, parser language,
  editor UI, renderer, specification/example, package, or release requires a
  separate exact scope amendment before editing.

## Task Contract

- Add required finite `offset` to `UnitMetadata`; set 0 for base/current linear
  units and preserve it through local/export/import/re-export/editor maps.
- Resolve declaration expressions through separate dimensionless scalar and
  affine unit branches. Do not validate negative/zero offset scalars as though
  they were intermediate unit scales.
- Resolve only built-in PI/E as declaration-time scalars; reject user/imported
  constants, forward references, calls, and arbitrary expression evaluation.
- Implement accepted affine offset `+/-`, positive scalar scaling/division,
  offset-zero compound behavior, identity power 1, finite-offset/positive-scale
  validation, aliases, and complete registry metadata.
- Reject two-unit addition/subtraction, scalar-left subtraction, nonzero-offset
  unit multiplication/division/non-identity powers, scalar-only declarations,
  zero/negative/non-finite scale, non-finite offsets/scalars, and unsupported
  AST forms using accepted existing diagnostic families.
- Preserve existing scale-only units, dimension vectors, module identities,
  base-unit uniqueness, SI inventory, import visibility, cycle behavior, and
  ordinary runtime PI/E resolution.
- Add focused checker/registry/parser-adjacent/import/re-export/editor/diagnostic
  tests for every S117 matrix row and exact source ranges.

## Mandatory Boundaries

- Do not add offset to runtime `MeasurementUnit` or `unitFromMetadata`.
- Do not implement runtime attachment/conversion/equality/arithmetic/aggregate,
  chart normalization, external unit parsing, scalar/table display, or affine
  report behavior; all remain S118.
- Do not edit `libraries/si.amx` or add Celsius/Fahrenheit exports. Registry
  fixtures may declare private test-only versions without publishing them.
- Do not alter chart/showTable behavior, renderers, editor UI/provider grammar,
  V0.19 specification, examples, migration docs, package/version, release,
  publication, deployment, installer, distribution, or certification.
- Do not add a general constant folder/evaluator, use imported ordinary values
  as declaration constants, or silently ignore unsupported AST nodes.
- Do not invent a stable diagnostic code. A new identity or an unrepresentable
  condition stops for Lead Developer allocation and exact scope amendment.

## Verification

Use only approved focused commands. Candidates:

```text
bun test tests/dimensions.test.ts tests/parser.test.ts tests/editor.test.ts tests/modules.test.ts
bunx tsc --noEmit
git diff --check
git status --short
```

Verify exact registry scale/offset/vector/identity, all accepted AFF cases,
linear and SI regressions, aliases/imports/re-exports/editor parity, diagnostic
codes/messages/source ranges, and no runtime/SI scope drift. Record exact raw
outcomes, test/assertion counts, failures/retries, skipped/unavailable checks,
and changed paths. Use complete AMX fixtures; do not infer diagnostics from
planning examples.

## Completion

Meet `acceptance.md`, reconcile all 22 S115 declaration AFF cases and all S117
internal IDs in `affine-declaration-test-matrix.md`, and populate
`builder-evidence.md` with reproducible evidence. Submit a separate Builder
recommendation for a distinct product-owner ACCEPTED/CLOSED or BLOCKED/OPEN
disposition. Only that disposition can close the S117 declaration gate; Sprint
118 remains separately authorized for runtime/SI work.
