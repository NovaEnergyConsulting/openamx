# Sprint 123 Blueprint: V0.20 Core Document and AST Emitter

## Closeout/Replan Approach

1. Preserve the committed implementation baseline and all `run-01` evidence.
   Do not rewrite raw failures or generated artifacts.
2. Obtain a separate Product Owner disposition for `S123-RETRY-STOP-01` and
   approval of the closeout-only verification plan before running commands.
3. Reconcile every current AST discriminant and `G123-*` row to an actual test,
   parity result, or explicit `BLOCKED/UNAVAILABLE` status. Keep incomplete
   rows visible; do not infer acceptance from the broad parity fixture.
4. Audit generated imports against the committed S122 public declarations and
   verify that only `openamx/transpiler-runtime` is imported by generated code.
5. Run the exact approved closeout suite, root typecheck, strict generated
   compile, oracle, build and preservation check. Store new run output under a
   fresh `artifacts/run-02/`; preserve `run-01/` unchanged.
6. If a closeout check fails, follow only the newly approved retry cap and
   stop immediately at the cap. Any additional implementation scope or file
   path requires a separate disposition.
7. Complete Builder evidence and submit a recommendation for separate Product
   Owner disposition. S124/S125 remain separately gated.

## Decision Register

The Product Owner approved D123-01 through D123-13 on 2026-11-26. The
dispositions below are authoritative alongside the confirmed V0.20 and
accepted S121/S122 decisions.

| ID | Topic | Approved disposition | Scope owner |
| --- | --- | --- | --- |
| D123-01 | Emitter API input | Accepted pure API consumes an entry and complete pre-resolved in-memory source graph `{ entryModuleId, modules }`, where each module carries original source, identity, output-relative path, and resolved import mapping. It returns the complete generated module graph or diagnostics. No AST/checker internal type leaks through the public signature. | S123 |
| D123-02 | Module boundary | Accepted: parse/check/emit the supplied graph in dependency-first order; validate graph identity, mappings, cycles and reachability in memory only. S124 owns filesystem discovery/containment/publication/CLI. | S123/S124 |
| D123-03 | Public API exposure | Export the typed transpile function/types through `src/index.ts` only. Do not add a package-root `.` export, alter `package.json` exports, or change the version. | S123 |
| D123-04 | Source representation | Accepted: carry original source per module; preserve raw frontmatter/comments without reconstructing from metadata or AST text. | S123 |
| D123-05 | Checked type context | Accepted: derive internal semantic context from `checkDocument`; expose no checker/AST internals in generated imports or public signature. | S123 |
| D123-06 | Operator lowering | Accepted: use S122 helpers when native semantics differ; preserve eager left-to-right logical operand evaluation. | S123 |
| D123-07 | Views | Accepted: S122 DTO constructors; table/chart snapshots at `show`; structured-v2 diagrams at declaration time, not AMX-showable. | S123 |
| D123-08 | Identifier mangling | Accepted: deterministic injective mangling; collision-check generated names; preserve original AMX export keys. | S123 |
| D123-09 | Invalid enum defaults | Accepted: preserve D122-15 no-parity for enum-valued defaults current AMX cannot express. | S123 |
| D123-10 | Diagnostic shape | Accepted: preserve parser/checker diagnostic identities and source fields; allocate no new codes. | S123 |
| D123-11 | No partial module code | Accepted: return no modules on parse/type/lowering failure; no graph-publication atomicity claim. D121-18 remains with S124/S125. | S123/S124/S125 |
| D123-12 | Generated code reproducibility | Accepted: deterministic LF output/imports/names/property order; no absolute roots, time, locale, or random IDs. | S123 |
| D123-13 | Per-run module lifecycle | Accepted: dependency-first initializers run once per invocation in shared per-run context; repeated `run(inputs)` calls use fresh mutable state. | S123 |

## Source-Grounded Constraints

- `src/index.ts` is currently a placeholder; root package export map does not
  contain an explicit `.` entry. S123 must distinguish the source-level API
  from a published package-root import.
- `checkDocument` returns `ModuleCheckResult` for a single document and accepts
   a `ModuleCheckContext`. The filesystem module loader resolves graph symbols
   and returns evaluated `LoadedEntryModule`; its graph records are private.
   Define a narrow in-memory graph/checker adapter instead of coupling the
   emitter to private `moduleLoader.ts` records.
- `OpenAmxDocument` contains parsed metadata and nodes; raw frontmatter is
  absent. Accepted D121-13 requires original source text to reach the emitter.
- `AMXShownView` now includes table/chart, source-compatible legacy diagram,
  and structured-v2 diagram types. S123 generated diagrams use structured-v2;
  existing legacy helper overload remains intact.
- S122 exposes `AMXRunResult<TExports>`, `AMXInputDescriptor<T>`,
  `validateAMXValue`, `amxBinary`, `amxUnary`, `amxBuiltin`, `amxFormatValue`,
  `amxIsType`, `amxGet1Based`, `amxRange`, `amxAdd1Based`, `amxRemove1Based`,
  `amxIterate`, `amxCopyListArgument`, measurement operations, and view
  constructors. Generated imports must use this subpath only.
- S121 final feasibility closeout was accepted by the Product Owner on
   2026-11-25; D123-01 through D123-13 were approved on 2026-11-26. S123
   implementation is committed. Closeout remains paused for the retry/stop
   breach disposition and renewed verification authorization.

## Required Sprint Artifacts

- `requirements.md`, `blueprint.md`, `acceptance.md`.
- `ast-lowering-contract.md` and `core-api-contract.md`.
- `golden-fixtures.md` and `parity-matrix.md`.
- `verification-plan.md`, `builder-evidence.md`, `handoff-prompt.md`.

## Boundaries

- S123 owns parsing/checking and code emission for a complete pre-resolved
   in-memory module graph; S124 owns recursive filesystem graph discovery,
   containment/path mirroring, publication, CLI and destination safety.
- S123 emits no HTML/PDF/DOCX and does not execute generated code during
  transpilation.
- D121-18 rollback residual and S122 accepted process/no-parity residuals stay
  unchanged. No release, package-version, deployment, platform, or registry
  claims follow.