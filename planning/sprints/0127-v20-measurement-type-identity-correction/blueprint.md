# Sprint 127 Blueprint: V0.20 Measurement Type Identity Correction

## Approach

1. Reproduce the retained three-module graph without changing S125/S126
   artifacts. Confirm the AMX reference result and the exact generated
   TypeScript mismatch.
2. Derive a canonical identity map from every prepared module’s
   `DimensionMetadata`. Normalize each vector into an order-independent key.
   For each vector class, choose one deterministic representative using
   stable output-relative module identity and declaration name.
3. Use that graph-wide mapping in every `ModuleEmitter`. Do not let a module
   fall back to a synthetic vector brand when a declared dimension for that
   vector exists elsewhere in the graph.
4. Preserve a deterministic vector fallback for vectors with no declared
   dimension metadata. Do not depend on absolute source roots or traversal
   order.
5. Add focused regression cases for the retained imported `Speed` function
   and adjacent dimension/alias boundaries. Strictly compile generated output
   and execute a separately authored oracle against the AMX runtime.
6. Preserve every first failure and retry. Stop on any mismatch in AMX
   semantics, a need to change the accepted helper/checker contract, or a new
   product defect outside this scope.

## Identity Mapping Rule

The checker represents a Measurement `CheckedType` by its vector and tests
compatibility with `sameVector`. The emitted brand must therefore be stable
for a vector-equivalence class, not tied to which module happens to emit a
particular expression.

Candidate internal key:

```text
vectorKey = sorted vector entries serialized deterministically
canonicalId = JSON.stringify([representative.moduleIdentity, representative.declarationName])
```

`representative` is selected deterministically from the fully prepared graph.
`moduleIdentity` is the output-relative module identity established by the
graph preparation path. Equal-vector aliases use the same selected identity
because that is consistent with current checker semantics. No public helper
or `CheckedType` shape change is part of this plan.

## Planned File Allowlist

- `src/transpiler/emit.ts`: consume the graph-wide canonical identity mapping
  for generated Measurement types.
- `src/transpiler/index.ts`: optional internal wiring to construct/pass the
  map from `PreparedGraph`; no public signature change.
- `tests/transpiler.test.ts`: retained repro and generated compile/AMX oracle
  regression, with fixtures routed only to the S127 artifact root.
- `planning/sprints/0127-v20-measurement-type-identity-correction/`: sprint
  evidence and artifacts only.

Any additional source, test, helper, checker, package, desktop, documentation,
or example path requires separate approval before editing.

## Risks and Questions

- Multiple dimension declarations may have an identical vector. The selected
  deterministic representative must be used by every module and must not
  contradict the checker’s vector-equality behavior.
- Imported units may be visible without importing their dimension name. The
  identity map must be graph-wide, not limited to `module.check.dimensions`.
- The helper brand is compile-time only; generated runtime values and
  measurement conversion/display behavior must remain byte-for-byte/API
  compatible except for generated TypeScript annotations.
- If a graph has no declared dimension matching a vector, preserve a stable
  fallback and add a focused test rather than inventing a declaration.

## Non-Goals

- Do not attempt to close all G123 Measurement rows or the full V0.20 matrix.
- Do not change S125 Example 16 or the S125/S126 Measurement artifacts.
- Do not make a release-readiness, native-platform, or full feature-coverage
  claim from the focused corrective test set.