# Sprint 115 Acceptance Criteria

Sprint 115 is complete only when the V0.19 chart and affine contracts are
source-grounded, internally consistent, represented by stable cases,
reviewed for compatibility, and separately dispositioned. Sprint 115 adds no
product behavior and authorizes no implementation or release work.

## Entry and Authority

- Sprint 114/V0.18 closeout is verified as ACCEPTED/CLOSED WITH RECORDED
  RESIDUALS on 2026-11-01; raw residual statuses remain unchanged.
- Separate Sprint 115 execution authorization and an exact baseline/file/
  command/output plan are recorded in `builder-evidence.md`.
- Only approved planning package paths and explicitly authorized artifact
  roots are changed. No production, test, editor, generated, published spec,
  example, manifest, or release file is changed.

## Chart Contract

- `showTable <expression>` syntax, line shape, malformed/duplicate behavior,
  source ranges, all four chart kinds, and table exclusion are testable without
  assumptions.
- Static type is exactly Boolean; ordinary expression diagnostics, visibility,
  nullability, and environment behavior are preserved.
- Omitted is false; a present expression is evaluated exactly once per emitted
  chart at the `show` snapshot point and the resolved Boolean is propagated
  through one shared emission/model field.
- False means actual output omission in interactive HTML/preview, PDF, and
  DOCX, with no hidden, screen-reader-only, or alternate table output and no
  dangling table-linked accessibility reference.
- True preserves existing chart/table data, headings, rows, nulls, source
  order, plot behavior, and measurement display.

## Affine Contract

- `scale`, `offset`, dimension vector, identity, aliases, imports/exports,
  finite rules, inverse conversion, and canonical formula are defined in one
  shared representation.
- Declaration precedence and every `+`, `-`, `*`, `/`, and `^` affine result
  are testable. D115-04 and D115-05 are resolved or named as blocking open
  decisions; downstream implementation does not infer around them.
- PI/E declaration resolution is identical to runtime values and limited to
  those two identifiers. User/imported constants, forward names, calls, and
  general compile-time evaluation are rejected.
- Conversion, equality/order, subtraction, direct addition, scaling,
  multiplication/division, powers/roots, `sum`, `mean`, `min`, `max`, `abs`,
  `round`, unary minus, chart normalization, display, and external data each
  have a case and exact result/unit.
- Direct affine addition and unsupported affine composition reject rather than
  silently discarding offset. The `sum`/`mean` physical-aggregate exceptions
  are explicit and produce a first-display-unit result.
- `0 C`, `32 F`, and `273.15 K` are represented by derived metadata, with
  forward/reverse and round-trip golden cases.
- The external `{ value, unit }` shape remains unchanged and D115-08 is
  separately resolved before Sprint 118.

## Cases, Diagnostics, and Traceability

- Every `CHT-*` and `AFF-*` qualification case has expected result, owner, and
  positive/negative coverage appropriate to its phase.
- Every invalid case maps to a diagnostic policy with phase and primary source
  anchor. No unallocated or colliding stable code is invented.
- Every Sprint 115 master-plan bullet maps in `requirement-test-matrix.md` to
  cases, a decision, or an explicit compatibility/source audit.
- Stable IDs reconcile across cases, diagnostics, matrix, complete source
  envelopes, and downstream ownership. Counts, missing IDs, duplicates, and
  evidence-only IDs are recorded.
- Exact source coordinates for newly supported syntax are explicitly NOT
  VERIFIED until the owning parser/checker sprint creates and runs complete
  fixtures; preparation prose does not claim them as test evidence.

## Qualification and Compatibility

- At least the canonical temperature equations, inverse conversion, mixed-unit
  subtraction, aggregate examples, and declaration precedence are checked by
  review calculation or an approved isolated probe with exact command and raw
  output.
- Existing linear units and Number-only measurement behavior have named
  regression cases.
- Any probe limitation is recorded. No arithmetic probe is presented as proof
  of parser, checker, runtime, renderer, editor, PDF, DOCX, or release behavior.
- The package records that public measurement data shape and ordinary report
  consumers remain sufficient, or reports a required shape change as a
  blocking contract decision rather than silently changing the contract.

## Disposition Boundary

- `builder-evidence.md` contains exact commands, baseline, raw outcomes,
  failures/retries, unavailable checks, candidate decisions, residual owners,
  and a Builder recommendation.
- A separate product-owner disposition accepts/closes or blocks/opens the
  Sprint 115 contract. Builder recommendation alone is not acceptance.
- S116 and S117 do not begin until blocking chart/affine declaration decisions
  are accepted. S118 remains gated by the affine declaration result and
  external compatibility decision. S119 and S120 remain separately dependent
  on their prerequisite sprints.
- No release, publication, package/version change, deployment, installer,
  distribution, or platform certification authority follows Sprint 115.
