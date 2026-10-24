# Sprint 100 Requirements: V0.16 Language Specification and Examples

## Document Status and Entry Gate

Architect-prepared Sprint 100 documentation. Sprints 095-099 have accepted
dispositions, with recorded non-blocking tooling/platform residuals in Sprint
099. The accepted Sprint 095 function contract and completed Sprints 096-099
are the behavior authority and implementation baseline.

This package authorizes planning only. Obtain separate explicit Sprint 100
execution authorization and approval of the concrete documentation/example/
help/test/resource file plan before editing user-facing or test files.

## Goal

Publish the additive V0.16 language specification and a small runnable
example path that teaches both existing expression-bodied functions and new
braced statement-bodied functions. Explain return paths, local scope, list
argument copies, and returned lists exactly as accepted, while preserving the
existing numbered course and clearly separating negative fixtures from valid
lessons.

Sprint 100 is language-specification, examples, discoverability, and focused
acceptance work. It does not add runtime/editor behavior, change the V0.16
contract, or perform integrated version closeout/release.

## Authority and Inputs

- Scope and sequence:
  [`plan-openamxV16MasterSprintPlan.md`](../../plan-openamxV16MasterSprintPlan.md),
  Sprint 100.
- Normative behavior:
  [accepted Sprint 095 function-body contract](../0095-v16-function-body-contract-technical-gate/function-body-contract.md),
  [fixtures](../0095-v16-function-body-contract-technical-gate/control-flow-fixtures.md),
  and [diagnostic matrix](../0095-v16-function-body-contract-technical-gate/diagnostic-matrix.md).
- Implementation evidence: accepted Sprint 096 parser,
  [Sprint 097 runtime evidence](../0097-v16-function-runtime-list-value-semantics/builder-evidence.md),
  [Sprint 098 checker evidence](../0098-v16-return-path-type-checking/builder-evidence.md),
  and [Sprint 099 editor evidence](../0099-v16-formatter-editor-integration/builder-evidence.md).
- Current authoring/reference conventions: V0.14 specification,
  `examples/00_Table_of_Contents.amx` through `examples/14_*.amx`,
  `README.md`, `vscode-extension/README.md`, desktop Help content, example
  tests, and desktop guide resource allowlist/parity tests.

## Proposed Content Plan

- Add `docs/language-spec-v0.16.md` as an additive specification. Preserve
  the V0.14 and earlier versioned contracts; identify exact syntax, legal
  body statements, expression-body compatibility, all-path returns,
  function-return propagation, lexical scope, list-copy boundaries,
  declaration visibility, diagnostics, and explicit exclusions.
- Keep `examples/03_Collections_and_Functions.amx`'s existing expression-
  body material and expected results unchanged. Add only a short cross-link
  to the new function-body reference where appropriate.
- Add `examples/15_Function_Bodies.amx` as a standalone, input-free,
  import-free reference indexed alongside (not inserted into) the existing
  guided lessons and references 13/14. It demonstrates both function forms,
  complete returns, nested statement returns, loop return/fallback, lexical
  locals, list argument isolation, repeated arguments, and returned lists.
- Add one clearly negative complete AMX source fixture in
  `examples/fixtures/invalid/` for a reachable missing-return path. It must
  be marked as a deliberate failure, never linked or described as a runnable
  success example, and assert `AMXF4001` at the closing brace.
- Extend the 00 index with a distinct V0.16 function-body reference entry;
  preserve the existing 01-12 guided path and standalone roles for 13/14.
- Update root README and the desktop searchable Help topic with the V0.16
  feature/spec/reference links. Update `vscode-extension/README.md` if its
  current feature overview/spec references would otherwise be stale.
- Update focused docs/example/navigation tests and the desktop guide resource
  allowlist, manifest/parity tests, and Help UI expectations so reference 15
  and the negative fixture are available in offline guide projects.

The proposed filename `15_Function_Bodies.amx` and reference role are an
Architect recommendation for Sprint 100 review. Do not renumber, replace, or
reclassify existing 00-14 material without explicit approval.

## In Scope

- Normative, additive V0.16 language specification and links to earlier
  language authorities.
- Runnable V0.16 function-body reference and discoverability in the index,
  root README, desktop Help, and applicable extension README.
- A deliberately invalid missing-return fixture and focused expected
  diagnostic assertion, kept separate from runnable lesson execution.
- Focused tests for expression-body compatibility, statement-body results,
  return/scope/list semantics, spec/help links, guide index/navigation, and
  packaged-resource closure.
- Exact outcomes, limitations, and residuals recorded in `builder-evidence.md`.

## Out of Scope

- Parser, runtime, type checker, formatter, editor, VS Code grammar/provider,
  or desktop editor implementation changes. Those are accepted by Sprints
  096-099.
- Changes to existing examples' semantics/results or unrelated example
  cleanup, renames, broad curriculum changes, or changes to the desktop
  starter UI.
- Language/runtime features not in the accepted Sprint 095 contract,
  including recursion, forward references, closures, nested statement loops,
  `break`, or `continue`.
- Release engineering, version changes, publication, integrated V0.16
  acceptance/closeout, platform certification, or updates to
  `planning/STATUS.json` and historical sprint records.

## Constraints and Gates

- The accepted Sprint 095 contract is normative. Do not infer semantics from
  examples or current implementation where the contract is explicit.
- Preserve `fn name(...): Type = expression` exactly as supported. Clearly
  distinguish expression-loop return collection and braced-if-expression
  value returns from function statement returns.
- State that every reachable function path returns a compatible value;
  loops may execute zero times; later returns can close fallthrough paths;
  unreachable statements and explicit returns are still statically checked.
- Document the exact approved diagnostics: `AMX3006` parse errors,
  `AMX3002` incompatible returns, `AMXF4001` missing return at closing brace,
  and `AMXF4002` as the defensive runtime fallthrough guard. Keep
  `AMX3021` specific to braced-if expressions.
- List mutation/copy claims precisely: each list parameter receives its own
  recursive array copy, repeated args are independent, nested arrays copy at
  every depth, non-array elements are opaque/uncloned, and a returned local
  list is passed through directly.
- Keep invalid fixtures out of valid example runs and ordinary success
  support mappings. Assert the failure explicitly and describe its phase.
- Offline desktop guide content must stay in the explicit allowlist and pass
  canonical/package parity checks; update the manifest/tests when adding
  files. Do not claim packaged/native/platform behavior beyond direct tests.
- Use temporary output paths for any CLI/render/export verification. Preserve
  generated outputs and all user data.