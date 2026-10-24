# Sprint 100 Acceptance Criteria

Sprint 100 is complete when the approved V0.16 contract is discoverable and
accurately documented, valid examples run with the implemented syntax, and
the negative missing-return fixture is tested separately as a failure.

## Specification

- `docs/language-spec-v0.16.md` is additive to prior specifications and
  identifies V0.16's exact syntax and compatibility boundaries.
- It specifies both function forms, legal/prohibited statements, newline
  separation, return propagation, all-path completeness, unreachable
  checking, loop fallthrough, lexical scope, visibility, and list value
  semantics precisely enough to match Sprint 095.
- It distinguishes function statement returns from expression-loop
  collection and braced-if-expression value returns.
- It documents exact diagnostics and anchors: `AMX3006` for parse rejection,
  `AMX3002` for incompatible return values, `AMXF4001` at a missing-return
  closing brace, `AMXF4002` as the defensive runtime guard, and `AMX3021`
  exclusively for braced-if expressions.
- It states exclusions without expanding scope: no recursion, forward
  references, closures, nested statement loops, `break`, `continue`,
  expression-form loops inside functions, document/output effects, or
  general object copying.
- It explains array-only recursive parameter copying, independent copies for
  repeated arguments, opaque non-array elements, local mutation, and direct
  returned-list results without claiming a generic object-clone guarantee.
- It links the V0.16 reference/example and earlier versioned specs; it makes
  no unsupported release, platform, certification, or integrated-closeout
  claim.

## Valid and Negative Examples

- `examples/15_Function_Bodies.amx` is a valid, input-free, import-free,
  standalone reference with desktop instructions, expected values, and
  navigation. It demonstrates both function forms, nested returns, loop
  return/fallback, local scope/parameter rebinding, list mutation, nested
  array copy, repeated-argument independence, and returned lists.
- `examples/03_Collections_and_Functions.amx` retains its existing expression
  function example and documented values; any new material is a brief
  cross-link, not a replacement or semantic change.
- One separate invalid-only fixture under `examples/fixtures/invalid/`
  demonstrates reachable fallthrough. A focused test expects
  `AMXF4001: Missing return value from function` at its closing brace. It is
  never counted as a successful lesson or mixed into successful run batches.
- Runnable positive output is asserted through the accepted parser/checker/
  evaluator or CLI test path. Outputs are asserted exactly enough to verify
  argument isolation, return value, and expression compatibility.

## Discoverability and Offline Guide

- The 00 index lists reference 15 in a distinct reference section; it is not
  inserted into the guided prerequisites or used to renumber 00-14.
- README and desktop searchable Help link the V0.16 spec/reference and index
  useful terms/diagnostics. Update the extension README if its language
  feature links are version-specific.
- The desktop guide allowlist includes the new reference and invalid fixture
  only if approved as guide resources; guide staging/materialization/parity
  tests assert exact canonical file closure and paths.
- Existing lessons 01-12 and references 13/14 remain present, runnable, and
  navigable. Root README/spec tests, numbered-guide tests, desktop resource
  tests, and applicable Help tests pass.

## Boundaries and Evidence

- No language/runtime/editor implementation, broad corpus cleanup, package
  version/release, publication, or integrated V0.16 closeout is included.
- Generated CLI/render outputs use temporary destinations and do not
  overwrite existing snapshots or user artifacts.
- `builder-evidence.md` contains exact approved paths, commands, test
  outcomes, expected/actual outputs, platform limitations, residual owners,
  and a separate disposition request. Sprints 095-099 evidence is unchanged.
- A separate Sprint 100 disposition is recorded. Sprint 101 remains required
  for integrated acceptance; release/publication stay independently gated.