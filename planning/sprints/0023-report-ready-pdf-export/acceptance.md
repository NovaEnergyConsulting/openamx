# Sprint 023 Acceptance Criteria

Sprint 023 is complete when:

- A shared typed PDF/report boundary consumes the evaluated document and Sprint 022 view data without a second AMX evaluation or input/module read, and is callable independently of the CLI for later desktop integration.
- `openamx export pdf <input> --out <path>` works with V0.3 input mappings and validation modes, requires explicit lowercase `.pdf`, preserves existing `run`/`render`/JSON/CSV behavior, and reports actionable failures.
- A representative PDF contains searchable headings, narrative, visible formatted AMX source, table content, static chart graphics plus textual chart data, page numbers, and report-order placement. It proves a multi-page table, repeated headers where supported, readable wrapping, A4 portrait/18 mm defaults, and an explicit page break.
- PDF output is local/offline and deterministic for the selected engine's guaranteed properties. No remote assets, browser runtime, telemetry, or network-dependent report content is required. Exact HTML/PDF pixel parity, PDF/A, and tagged accessibility are not claimed.
- Tables include all rows in original order, declaration-order columns, repeated headers where supported, and no interactive filter/sort/page state. Charts preserve title/description, series/category/point order, static data, null/empty states, and inspectable textual values.
- Font redistribution terms are verified for every embedded font, or the bundled proof fonts are replaced with approved redistributable fonts. The exact font source, license, package versions, and runtime versions are recorded.
- Destination validation rejects missing/non-lowercase extensions, missing parents, destination symlinks, entry/module/input conflicts, duplicate/conflicting paths, and invalid selections with `AMX6001` before writes.
- The adapter prepares and serializes the complete PDF before writing. It writes through a same-directory temporary file and atomic rename, removes temporary files on failure, preserves an existing destination on analysis/layout/serialization/pre-rename failure, and reports `AMX6002` for engine/serialization/filesystem failures.
- Invalid parsing/linking/checking, input validation, evaluation, report preparation, and PDF layout failures produce no new/replaced PDF. Tests cover permission/write failures where the environment permits.
- Focused PDF/report/CLI tests and existing root output/regression tests pass; `bun run build`, `bun test`, and `git diff --check` pass. Record exact counts, PDF inspection evidence, warnings, limitations, and unavailable platform checks.
- No desktop UI/workflow, PDF platform acceptance, DOCX export, HTML interaction redesign, VS Code provider change, or Marketplace publication is included. Sprint 024 receives a reusable offline adapter and documented RPC integration boundary.
