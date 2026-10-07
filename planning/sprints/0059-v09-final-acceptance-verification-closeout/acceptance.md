# Sprint 059 Acceptance Criteria

Sprint 059 is complete when:

- The actual VS Code TextMate grammar is executed by a TextMate-compatible tokenizer. Tests assert expected scopes for representative V0.9 tokens and verify that narrative/inert fences do not receive executable AMX scopes. Grammar structure inspection alone is insufficient.
- Tokenization coverage includes `dimension`/`unit`, measurement attachment/conversion, 1-based indexing and mutation statements, `=` record constructors, escaped/interpolated strings, and malformed/incomplete drafts without changing the approved parser/checker contract.
- If a tokenizer test dependency is required, it is test-only, minimal, justified in evidence, and absent from production/runtime dependency paths.
- The Hutch wrapper is given one bounded reproducible attempt. Its preparation, typecheck, and web-build outcomes are individually recorded. If it stalls, the process is stopped cleanly and wrapper checks remain unpassed; direct Vue/Vite/worker/resource steps are run and reported only as those direct checks.
- Root build and full root tests pass, with exact totals/skips and command results recorded.
- VS Code compile, test compilation, and available-host suite pass; actual TextMate tokenization result is reported separately.
- Desktop RPC/workflow contract and focused Help UI tests pass. Desktop typecheck and build pass through wrappers, or wrapper failures remain explicit while all feasible direct equivalents are verified and scoped accurately.
- Representative V0.9 CLI execution/render/output checks pass and assert the example's measurement input/output shape and meaningful HTML report values, table, and chart.
- The integrated evidence is reconciled with Sprint 058's capability matrix and approved V0.9 contract. No unexplained regression or contradictory client result remains. Any remaining verification limitation is described with concrete evidence and is submitted for Lead Developer disposition.
- Historical Sprint 053/054/057 Windows residuals remain separately identified as unpassed. No Linux check reclassifies them, and no native/platform certification is claimed.
- Builder evidence and planning state/decision/question records list exact changed files, commands, host/tool versions, results, residuals, and the request for a separate final V0.9 disposition.
- The Builder does not self-accept final V0.9. A separate Lead Developer decision explicitly states whether V0.9 is accepted, accepted with residuals, or remains pending.

## Required Regression Set

1. Real TextMate token scopes for V0.9 syntax, interpolation/string boundaries, incomplete drafts, exact executable fences, inert fences, and narrative.
2. Root build and full test suite with counts and skips recorded.
3. VS Code compile/test/host results separate from tokenizer output.
4. Desktop RPC, Help UI, Hutch wrapper, and direct fallback check results recorded as distinct outcomes.
5. Representative V0.9 example CLI run/render and exact measurement JSON/report presentation assertions.
6. Sprint 053/054/057 historical Windows residuals preserved without false pass claims.
7. Final Lead Developer V0.9 disposition recorded separately from Builder sprint completion.

Sprint closeout does not imply release readiness, native cross-platform certification, or publication.