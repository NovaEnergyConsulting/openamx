# Sprint 115 Diagnostic and Failure Matrix

## Status

This matrix reuses existing diagnostic families only when the condition is
semantically exact. Candidate messages are contract text for Sprints 116-118,
not allocated identities and not proof that the current runtime emits them.

## Chart Diagnostics

| Case ID | Invalid condition | Phase | Primary anchor | Diagnostic policy |
| --- | --- | --- | --- | --- |
| CHT-PARSE-01 | `showTable` missing expression or with colon/malformed tail | Parse | First offending token after keyword; option token if no tail exists | Reuse existing parse-error family `AMX3006`, candidate `Invalid chart option` context; exact feature wording owned by S116 |
| CHT-TYPE-01 | Resolved expression is not exactly Boolean | Static check | Full expression or first type-bearing expression source according to existing `requireType` | Reuse `AMX3002`, expected `Boolean`/actual type message |
| CHT-DUP-01 | Duplicate `showTable` | Static check | Second `showTable` option source | Reuse `AMX3005`, candidate `Repeated 'showTable' option` |
| CHT-TABLE-01 | `showTable` in table block | Static check | Option source | Reuse `AMX3003`, `Option is not valid for a table` |
| CHT-NAME-01 | Unknown/not-yet-visible expression identifier | Static check | Identifier source | Preserve ordinary `AMX3001` unknown-identifier diagnostic |
| CHT-OUTPUT-OMISSION-01 | A renderer emits table content despite false/resolved false | Acceptance test failure | Render/output artifact; no user-language code | Record failing output evidence; not a runtime language diagnostic |

## Affine Declaration Diagnostics

| Case ID | Invalid condition | Phase | Primary anchor | Diagnostic policy |
| --- | --- | --- | --- | --- |
| AFF-USER-CONST-01 / AFF-IMPORTED-CONST-01 / AFF-FORWARD-01 | Name is not a visible unit and is not PI/E | Declaration check | Identifier source | Reuse `AMX3008`, candidate `Unknown or not-yet-declared unit '<name>'` |
| AFF-CALL-01 | Call or other unsupported non-declaration expression | Declaration check | Unsupported node/operator | Reuse `AMX3008`, candidate `Unit expressions may use only ...`; exact allowed-form wording must match accepted grammar |
| AFF-TWO-UNIT-ADD-01 | Both operands of declaration `+`/`-` have dimensions | Declaration check | `+`/`-` operator | Candidate `AMX3008: Unit declaration addition and subtraction require one affine unit term and one dimensionless scalar` |
| AFF-REVERSE-SUB-01 | Scalar is left operand of affine subtraction | Declaration check | `-` operator | Candidate `AMX3008: Unit declaration subtraction requires the unit term on the left` |
| AFF-SCALE-ZERO-01 / AFF-SCALE-NEG-01 / AFF-SCALE-INF-01 | Effective scale not finite positive | Declaration check | Operator/operand producing invalid scale | Reuse `AMX3008`, exact `Unit scale must be finite and greater than zero` |
| AFF-OFFSET-INF-01 | Effective offset non-finite | Declaration check | Operator/operand producing invalid offset | Candidate `AMX3008: Unit offset must be finite` |
| AFF-COMPOUND-01 | Nonzero affine offset combined by `*`, `/`, or power other than 1 | Declaration check | Operator source | Candidate `AMX3008: Affine units may not be multiplied, divided, or raised to non-identity powers in declarations` |
| AFF-DIM-01 | Incompatible dimension composition | Declaration check | Combining operator | Reuse dimension/unit `AMX3008` mismatch family; exact source-local message required in S117 |
| AFF-CYCLE-01 | Cyclic unit/import graph | Declaration/module check | Name/import declaration opening the cycle | Preserve existing module/declaration cycle policy; exact code is owned by current import-check path, no new code claimed |

## Runtime and Data Diagnostics

| Case ID | Invalid condition | Phase | Primary anchor | Diagnostic policy |
| --- | --- | --- | --- | --- |
| AFF-INCOMPAT-01 | Incompatible dimensions in conversion, comparison, arithmetic, or aggregate | Static/runtime check | Relevant operator or aggregate call/argument | Reuse `AMX3007` existing dimensional mismatch family |
| AFF-ADD-01 | Direct addition where either measurement is affine | Static check where known | `+` operator | Reuse `AMX3007`, candidate `Direct addition of affine measurements is not supported` |
| AFF-MUL-01 / AFF-DIV-01 | Unsupported affine multiplication/division | Static check where dimension is known | `*` or `/` operator | Reuse `AMX3007`, candidate `Affine measurement multiplication and division are not supported` |
| AFF-POW-01 / AFF-SQRT-01 | Unsupported affine power/root | Static check | `^`, `pow`, or `sqrt` call source | Reuse `AMX3007`, candidate operation-specific affine rejection |
| AFF-FINITE-01 | Literal/static affine physical or arithmetic result is non-finite | Static check | Producing expression/operator or source argument | Reuse `AMX3010` static measurement finite-result behavior |
| AFF-FINITE-01 | Runtime affine physical/displayed result is non-finite | Runtime | Producing operator/call/source argument | Reuse `AMX1009` dynamic measurement-domain behavior |
| AFF-FINITE-01 | Chart measurement cannot normalize finitely | Runtime/check integration | Selected field/source or declaration context | Reuse the existing `AMX3007` chart-normalization diagnostic family rather than changing phase into a runtime-domain code |
| AFF-EXTERNAL-COMPOUND-01 | External compound expression uses an affine factor | Input parsing/validation | Input unit text/data path and declaration source | Reuse `AMX4004` unknown/invalid unit error family; exact message must explain affine compound prohibition |
| AFF-EXTERNAL-SHAPE-01 | External shape is not exactly `{ value, unit }` | Input validation | Input object/data path | Preserve `AMX4005`, `Measurement input must contain exactly the value and unit fields` |
| AFF-CHART-FAIL-01 | Chart measurement cannot normalize to the first selected unit | Runtime/check integration | Selected field option plus declaration source | Preserve `AMX3007` chart normalization family and report declaration/field context |

## Diagnostic Rules

- Existing ordinary expression/type/operator diagnostics take precedence over
  feature-specific affine wording when the same condition is diagnosed before
  affine metadata matters.
- Do not allocate a fresh code merely to distinguish linear from affine for a
  condition already represented exactly by `AMX3007`, `AMX3008`, or `AMX3010`.
- New exact codes are unnecessary in this candidate package. Static finite
  checks remain `AMX3010`, dynamic measurement-domain failures remain `AMX1009`,
  and chart normalization remains `AMX3007`. If implementation discovers an
  existing code collision or a condition not expressible by one of these
  phase-specific families, the Lead Developer records a named allocation in
  `planning/decisions.md` before the affected sprint proceeds.
- Every negative fixture must assert phase, code, exact accepted message,
  primary source range, and applicable declaration/field secondary ranges.
- A current parser rejection of not-yet-implemented syntax is not evidence for
  a final V0.19 diagnostic. Source ranges must be re-recorded after the S116 or
  S117 production parser/checker exists.

## Blocking Decision Check

D115-09 is blocking only for exact final message wording and any implementation
discovered to need a new identity. The default candidate policy requires no
new code: `AMX3006` parsing, `AMX3001` names, `AMX3002` Boolean/type,
`AMX3003` option shape, `AMX3005` duplicate, `AMX3007` dimensional operation,
`AMX3008` declaration, `AMX3010` static finite result, `AMX1009` dynamic
measurement-domain result, and `AMX4004`/`AMX4005` external input.
