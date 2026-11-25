# Sprint 121 Acceptance Criteria

Sprint 121 is complete only when the V0.20 generation contract is complete,
source-grounded, exhaustively mapped to the current AST, represented by
reproducible golden/parity cases, and separately dispositioned. Sprint 121
adds no product behavior and authorizes no release or package action.

## Entry and Authority

- Sprint 120's product-owner disposition is verified as
  `ACCEPTED/CLOSED WITH RECORDED RESIDUALS` on 2026-11-21.
- The raw Sprint 120 full VS Code aggregate remains 21 pass/8 fail; V0.19
  host-specific evidence passes independently. Native/platform evidence stays
  `BLOCKED/UNAVAILABLE`; no residual is upgraded or deleted.
- The lifecycle ledgers identify S121 as current and record the verified S120
  closeout. Any execution still requires approval of its exact baseline,
  worktree, files, commands, source, output roots, and preservation plan.
- The V0.20 master plan includes the 2026-11-25 product-owner clarifications.
  D121-01 through D121-18 contract decisions are separate from raw Builder
  evidence and the final Sprint 121 owner disposition.

## AST and Semantics Coverage

- Every current variant of `DocumentNode`, `StatementNode`,
  `V02ExpressionNode`, `ExpressionNode`, `TypeReferenceNode`, visualization
  options, and recursive diagram content appears exactly once in
  `ast-typescript-mapping.md` or is explicitly shared by a documented alias.
  The source-baseline counts are 3 document, 20 statement, 14 expression,
  21 V02 expression, 3 type-reference, 2 function-body, 6 visualization
  option, and 3 recursive diagram-content members.
- Every mapping row specifies emitted TypeScript/helper behavior, checked
  type/context needed, and a stable golden fixture ID or a blocking question.
- Lists preserve 1-based AMX indexing, mutation, insertion/removal, and
  evaluation order. Measurements preserve canonical conversion, arithmetic,
  comparisons, display units, and accepted aggregate/builtin behavior.
- Imports/exports preserve visibility, source ordering, entry-only inputs,
  module identities, cycle/containment checks, and explicit export semantics.
- Tables, charts, and recursive diagrams produce renderer-independent data.
  `result.views` combines table/chart `show` snapshots with declaration-time
  diagram emissions as distinct, ordered DTOs; this does not add `show` support
  for diagrams.
- D121-16 checker type resolution and enum-value JSON/CSV validation are
  implemented in the current worktree and pass focused input/module tests.
  The helper probe records parity separately; no emitter behavior is claimed.
- Unknown or newly added AST node kinds fail closed. No unsupported construct
  is silently omitted, approximated, or emitted as `any` without explicit
  contract disposition.

## Generated Source and Public API

- Every narrative line, including blank lines, non-AMX fences, and literal
  interpolation text, is encoded as inert TypeScript comments under the
  accepted newline/escaping rule.
- Accepted D121-13 carries raw source per module and emits frontmatter lines as
  inert comments using the same normalized line encoding; parsed metadata is
  not presented as a source-fidelity representation.
- Generated source compiles under the accepted TypeScript, ESM, target, and
  module-resolution baseline. Imported output modules resolve from the public
  helper subpath without private engine imports.
- Generated declarations cover all supported primitives, nullability,
  lists, records/inheritance, enums, functions, dimensions/units, inputs, and
  view data with useful types and no unbounded `any` escape hatch.
- `DateTime` maps to its current string representation with RFC 3339 runtime
  validation; generated input validation rejects unknown keys and preserves
  current nested-record default, optional, and nullable behavior.
- AMX source names are deterministically mangled into collision-checked
  internal identifiers; stable public `run` and `AMXRun*` names cannot shadow
  user declarations, and original AMX names remain visible in result keys and
  module bindings.
- The generated entry exports typed `AMXRunInputs`, `AMXRunExports`, `AMXRunResult`,
  and synchronous `run(inputs)`. Caller values are runtime-validated; no
  prompts, filesystem reads, or implicit environment inputs occur.
- `result.exports` contains explicitly exported entry-module values only.
  `result.views` preserves shown table/chart snapshots and declaration-time
  diagram DTOs under distinct kinds and source/evaluation order; generated
  code does not render HTML, PDF, or DOCX.
- The helper package subpath is stable, narrow, documented, versioned, and
  compatible with current package entry points. The existing absence of a
  root `exports` map is addressed without accidental deep-import breakage.
- The S121 helper/API contract checkpoint is accepted. The authorized helper
  slice and enum prerequisite are implemented in this worktree; full S122
  completion remains separately gated. The approved S121 probe used the real
  public helper, with no private imports in generated fixture code. The product
  owner ACCEPTED/CLOSED S121 WITH RECORDED RESIDUALS on 2026-11-25 for the
  S121 contract and approved helper-boundary feasibility scope only.

## Modules, Errors, and Destinations

- Output paths are deterministic and preserve the source graph under the
  accepted import root; relative imports are rewritten as contracted.
- Existing containment and cycle rules apply to the entire graph. Destination
  collisions, including platform-relevant case/normalization collisions, are
  found before writes.
- Existing files are never silently overwritten. Confirmation/explicit
  overwrite and cancellation behavior is defined for CLI and desktop use; a
  rejected/cancelled graph write leaves no partial success-shaped output.
- D121-18 is accepted as best-effort rollback with per-path reporting and an
  explicit no-crash-atomicity residual. S124/S125 must test actual rollback;
  S121 claims no publication implementation pass.
- Parse/type errors retain source path and range and block emission. Emitter
  and destination diagnostics have an allocated identity or are clearly
  marked pending allocation; no invented stable code is claimed.

## Golden Cases and Feasibility

- Golden fixtures cover every AST family and both valid/invalid paths where
  applicable; generated output is deterministic and contains no partial output
  for invalid documents.
- The mandatory helper-boundary cases cover one imported module, one
  measurement, one caller-supplied input with invalid-input rejection, and one
  shown structured view. The separately approved run-01 probe exercised these
  against the public helper; string inspection alone is insufficient.
- Generated `run(inputs).exports` and `run(inputs).views` are compared with
  the AMX runtime for identical sources and inputs. Exact comparisons and
  floating tolerances are declared per field; first mismatch is source/case
  identified.
- All parity IDs map to acceptance fixtures, source envelope, expected values,
  commands, raw results, and downstream owner. Missing/duplicate IDs are
  recorded and resolved.
- `D121-13` is dispositioned; S123 has an unambiguous source-text input for
  every required comment, including any frontmatter in scope.
- D121-01 through D121-18 have explicit product-owner contract decisions.
  The product owner ACCEPTED/CLOSED S121 WITH RECORDED RESIDUALS on 2026-11-25
  for the S121 contract and approved helper-boundary feasibility scope only.
  Final S121 feasibility closeout remains separately gated on S122 helper
  completion and evidence review.
- Probe evidence is isolated and does not change tracked product sources,
  tests, package manifests, generated output, or previous sprint artifacts.

## Evidence and Disposition

- `builder-evidence.md` records exact baseline, source observations, commands,
  tool versions, fixture/output hashes where applicable, raw status, failures,
  retries, limitations, residual owners, and a Builder recommendation.
- Raw statuses are only `PASS`, `FAIL`, `BLOCKED/UNAVAILABLE`, and `NOT RUN`.
  Source audit/probe evidence is not reported as full emitter acceptance.
- A separate product-owner disposition accepts/closes or blocks/opens the
  S121 contract. Builder recommendation alone is not acceptance.
- S122 may begin only after the accepted S121 helper/API checkpoint and its
  own exact implementation authorization. S121 was ACCEPTED/CLOSED WITH
  RECORDED RESIDUALS on 2026-11-25; S123 remains blocked until S122 helper
  acceptance and separately authorized S121 final feasibility closeout.
- No release, publication, package/version, deployment, distribution,
  installer, or platform certification authority follows S121.