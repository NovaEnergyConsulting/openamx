# Sprint 013 Acceptance Criteria

Sprint 013 is complete when:

- `docs/language-spec-v0.3.md` is authoritative, documents the V0.2-only compatibility path, and states exactly when V0.3 checking activates.
- Grammar and semantics define primitive, named, nullable, list, and nested-list types; declarations; optional/default/null behavior; constructors; field access; and validated DateTime wire values.
- Static checker rules cover every V0.2 expression and statement plus V0.3 declarations, assignments, functions, modules, exports, and inputs, with deterministic source-located diagnostics and phase behavior.
- Function syntax, signatures, visibility/order, return checking, and purity restrictions are complete and testable.
- Module import/export syntax, canonical path containment, isolation, visibility/collisions, source-order DFS evaluation, and deterministic cycle reporting are fixed.
- Entry-only input declarations and repeated `--input name=path` behavior define mapping errors, CLI path resolution, JSON roots, CSV headers/conversion/nulls/empty strings, malformed data, and nested-shape limits.
- Validation defines constructor/default/input behavior, aggregate and fail-fast traversal order, diagnostic context, and prevention of evaluation/output after input errors.
- Repeated `--output name=path`, entry-export selection, JSON/CSV encodings/order, unsupported shapes, write ordering, and write-failure behavior are specified.
- The six opt-in Asset Management schemas are listed as initial structural contracts outside core defaults; the unresolved domain-standardization question is recorded and is not misrepresented as approval.
- Requirements, blueprint, acceptance, and handoff use the project sprint-artifact structure and agree with the specification; state/decisions/questions record scope and outcome.
- Only owned documentation/planning files change. Markdown diagnostics are reviewed, `git diff --check` passes, and exact `bun run build`/`bun test` results are recorded.
