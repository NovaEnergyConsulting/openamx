# Sprint 125 V0.20 Specification, README, and Example Contract

## Status and Authority

Architect-prepared documentation contract. S125 adds an additive V0.20 spec
and user-facing example/navigation. Do not revise historical specifications
or document S123 incomplete coverage as complete.

## `docs/language-spec-v0.20.md`

Add the document as an additive specification that links prior accepted
language contracts and records the V0.20 TypeScript calculation/data boundary.
It should include:

- Purpose/scope: AMX document-to-TypeScript transpilation through the core,
  CLI and desktop surfaces; generated TypeScript is not a report renderer.
- Source preservation: each Markdown/frontmatter line becomes a safe
  normalized TypeScript `//` comment; AMX fences lower in source order;
  non-AMX fences and literal `{{ expression }}` remain inert.
- API: typed caller-supplied `AMXRunInputs`, explicit `AMXRunExports`,
  synchronous `run(inputs)`, and `AMXRunResult` with `exports` and `views`.
- Values/helpers: dependency on `openamx/transpiler-runtime`, supported
  TypeScript/module baseline and `.ts` relative import caveat; no package-root
  `.` export is implied. Document list/measurement/builtin/input semantics
  only to the accepted S121/S122 contract.
- Views: `show` emits table/chart snapshots; diagram declarations contribute
  declaration-time structured-v2 diagram DTOs under a distinct discriminant;
  this does not add AMX `show` support for diagrams.
- Graph: relative imported `.amx` modules map to relative `.ts` modules under
  the selected output root; CLI uses explicit `--out-dir`, existing targets
  require overwrite approval, and desktop uses graph destination/confirmation.
- Failure/safety: parse/type/lowering failures return source diagnostics and
  no generated graph; CLI does not execute output. Multi-file publication
  rollback is best-effort and not crash-atomic under D121-18.
- Exclusions: HTML/PDF/DOCX rendering from generated TypeScript, source maps,
  narrative interpolation evaluation, new AMX syntax, release/package version
  or platform certification.
- Residuals: state D122-15 no-parity for enum defaults the current source
  cannot express. Do not claim all AST/helper/parity coverage based on the S123
  accepted-with-residuals disposition; point to release notes/evidence where
  appropriate without changing language rules.

The spec is a published product contract, so exact prose/examples must be
cross-checked against accepted S121-S124 decisions and actual CLI/helper APIs.
Do not treat this planning outline as language authority until S125 review.

## README Navigation

- Add one V0.20 link alongside existing additive language specifications in
  the current examples/documentation section.
- Add the focused transpilation example to the examples list and mention the
  desktop/CLI workflow in existing tool descriptions only as needed.
- Preserve V0.9/V0.12/V0.13/V0.14/V0.16/V0.18/V0.19 links and all historical
  wording. No broad README restructure.

## Focused Example

Candidate standalone source: `examples/16_TypeScript_Transpilation.amx`.
Reuse `examples/libraries/asset-management.amx` for one imported exported
record type; do not add another support module unless a distinct imported value
is needed to exercise runtime graph output.

Use the imported `Asset` type from
`examples/libraries/asset-management.amx`; the generated TypeScript fixture
supplies the caller-owned input. Candidate AMX core:

```amx
import { Asset } from "./libraries/asset-management.amx"
input asset: Asset

type ExposurePoint {
  label: String
  score: Number
}

let points: ExposurePoint[] = [
  ExposurePoint { label = "Base", score = asset.criticality },
  ExposurePoint { label = "Escalated", score = asset.criticality * 2 }
]
let scores: Number[] = [asset.criticality, asset.criticality * 2]
export let assetName: String = asset.name

table exposureTable = table(points) {
  title: "Exposure points"
  column label as "Scenario"
  column score as "Score"
}

chart exposureChart = bar(scores) {
  title: "Exposure score"
  series "Score"
}

diagram assetLabel {
  title: "Asset label"
  width: 240
  height: 80
  time t from 0 to 1 duration 1
  text name {
    x: 12
    y: 40
    value: asset.name
    fill: "#203040"
  }
}

show exposureTable
show exposureChart
```

The document also contains prose before/after fences and a literal
`{{ asset.name }}` narrative interpolation. Generated comments preserve it
literally; `run(inputs)` does not evaluate it. The diagram appears in
`result.views` at declaration time, not through `show`. Keep invalid code only
in inert non-AMX fences.

Expected runnable flow for repository development:

```text
bun run src/cli.ts transpile examples/16_TypeScript_Transpilation.amx --out-dir <scratch-directory>
```

The separate generated-code test supplies `asset` to `run(inputs)`, compiles
with the documented `.ts` import settings and compares exports/views to AMX
where an equivalent accepted AMX source form exists. Do not make the example
depend on D122-15 enum-valued record defaults.

## Desktop Guide and Help

- Update `desktop-app/README.md` to identify the TypeScript graph export action,
  output-directory selection, helper runtime dependency, and calculation/data
  parity boundary. Keep native/cross-platform claims limited to direct
  evidence.
- If desktop bundled Help is updated, add one concise searchable topic using
  existing `help-content.json` structure and tests; do not use Help to imply
  full V0.20 integrated acceptance or release readiness.
- No changes to VS Code guide/extension docs unless separately authorized.