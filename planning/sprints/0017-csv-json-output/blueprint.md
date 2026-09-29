# Sprint 017 Blueprint: CSV/JSON Output

## Approach

- Extend the loader result with the entry module's explicit exported binding names and declared checked types. Keep selection out of AMX evaluation and do not expose private/imported bindings as outputs.
- Add one output-mapping parser and serialization module. It validates mapping syntax/destinations, receives typed values, produces all UTF-8 byte payloads in memory, then commits writes in required order.
- Use typed record declarations for JSON field ordering and CSV eligibility/header ordering. Never serialize arbitrary objects as CSV based only on their keys.
- Reuse the established record/null/DateTime representation and CSV library escaping behavior where it can produce the precise RFC 4180 output required by the contract; add narrow formatting code only if necessary for deterministic LF and empty-cell semantics.
- Keep CLI output reporting separate from `run` context JSON. Error reporting must render AMX6 diagnostics through the existing diagnostic mechanism.

## Files to Update

- `src/cli.ts`
- `src/runtime/moduleLoader.ts`, `src/runtime/environment.ts`, and focused output serialization support
- `src/diagnostics/errors.ts`
- `tests/` focused output/CLI tests and narrowly required existing test files
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`

## Notes

- JSON serialization rejects non-finite numbers and values lacking a declared serializable type.
- CSV serializes only `RecordType[]`; an empty list remains valid because the declared record type supplies the header.
- JSON object ordering follows declared record field order recursively. JSON writes two-space indentation plus exactly one LF.
- Output mapping validation occurs before evaluation; serialization occurs after evaluation but before any writes.
