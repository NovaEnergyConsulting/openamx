# Sprint 088 Acceptance Criteria

Sprint 088 is complete when the accepted V0.14 features are supported by
shared authoring services and both editor clients, accurately documented,
and demonstrated by runnable examples with direct evidence for each surface.
Sprint 088 does not itself complete integrated V0.14 acceptance or authorize
release or publication.

## Shared Editor Services and Client Parity

- Shared editor services recognize the `is` operator/type target, `PI`, `E`,
  all approved math functions, and all approved text/format functions
  wherever those constructs affect existing language services.
- Relevant existing highlighting/tokenization, completion, static
  diagnostics, source ranges, type/hover facts, formatting, symbols,
  navigation, and references work without adding unrelated editor features.
- `is` is presented as an operator with an AMX type-reference target. Math
  functions/constants and text/format functions are discoverable according
  to existing built-in conventions. Valid nonmatches remain runtime `false`
  results and are not incorrectly reported as static incompatibilities.
- Diagnostics preserve approved code/message behavior and original-document
  coordinates, including LF/CRLF and UTF-16 offsets where applicable.
  Incomplete V0.14 source remains editable and does not hide unrelated
  diagnostics.
- Shared-service tests, VS Code Extension Development Host tests, and
  desktop CodeMirror/workbench UI tests each provide separate evidence.
  Success in one does not substitute for another.
- Actual VS Code host tests cover relevant highlighting, completion,
  diagnostics/ranges, formatting, and supported navigation/type information.
- Actual desktop UI tests cover relevant highlighting, visible diagnostics,
  completion, formatting, and searchable V0.14 Help.
- Preserve existing editor behavior outside the approved additions.
  Record any inherited VS Code Windows path/cleanup failure or desktop RPC
  sandbox-occurrence mismatch against its baseline; do not weaken tests,
  containment, or security behavior.

## Specification, Help, and Examples

- `docs/language-spec-v0.14.md` accurately describes the additive V0.14
  contract, including:
  - `is` syntax, precedence, target resolution, runtime matching, enum and
    Measurement behavior, diagnostics, and lack of flow narrowing.
  - All math functions/constants, radians/log bases, domains and errors,
    dimensionless Measurement normalization, and existing Measurement-aware
    standard-library compatibility.
  - Text function signatures, Unicode code-point behavior, exact Unicode
    15.1 trim set and exclusions, slice count defaults/boundaries/errors.
  - Exact numeric pattern grammar, supported locale set/separators, grouping,
    percent, literal currency prefixes, rounding, negative zero, Measurement
    display formatting, and invalid-pattern/locale/non-finite diagnostics.
  - Explicit exclusions and accurate implementation, acceptance, release,
    publication, and platform-qualification status.
- The root README links the V0.14 specification and new examples without
  claiming unapproved release or integrated acceptance. The VS Code guide
  links to the specification/examples following its existing documentation
  pattern.
- Desktop Help includes a unique `language-v0.14` topic with searchable
  terms and accurate summaries; tests confirm the topic is discoverable and
  its content matches the accepted contract.
- Runnable examples collectively demonstrate runtime type checks,
  mathematical functions/Measurement behavior, and text/numeric formatting.
  Each example analyzes and executes successfully, has deterministic
  representative expected bindings, and requires no external inputs.
- Example tests verify relevant format behavior and formatter idempotence.
  Invalid example/diagnostic coverage uses approved fixture source and exact
  source ranges; no example invents syntax or diagnostic behavior.

## Verification, Residuals, and Boundaries

- Focused root editor/example/documentation tests and core build pass, or
  every failure is recorded with its first attempt, retry, environment,
  baseline comparison, owner, and follow-up.
- VS Code Development Host and desktop typecheck/web build/focused UI tests
  are run and recorded separately. Do not claim surface acceptance from a
  build, shared-service test, or harness when direct host evidence is
  required.
- `builder-evidence.md` includes a surface-by-surface matrix, exact
  commands/results/counts, versions, logs/screenshots/artifacts, residuals,
  and all BLOCKED/UNAVAILABLE or NOT RUN checks.
- The full root/extension/desktop integrated acceptance and V0.14 closeout
  remain assigned to Sprint 089. Sprint 088 does not infer or preempt them.
- No runtime semantics, diagnostics, language-library behavior, unrelated
  editor feature, package/version, release, publication, or platform
  certification changes occur.
- A separate Lead Developer/product-owner records Sprint 088 disposition.
  Builder recommendation alone does not authorize Sprint 089.
