# Sprint 084 Builder Evidence: Contract and Fixture Gate

## Status

**EXECUTED; SPRINT 084 CONTRACT ACCEPTED BY USER ON 2026-10-15.**

- Starting worktree: clean, branch `feat/create-v0.14` (`git status
  --short --branch`, 2026-10-15).
- Execution authorization: APPROVED by user, 2026-10-15.
- Exact file-by-file artifact/evidence plan: APPROVED by user, 2026-10-15.
- Product decisions and final contract disposition: ACCEPTED by user on
  2026-10-15; recorded in the grammar/diagnostic artifacts and planning
  ledger.
- Narrow `MATH-NONFINITE-INPUT-01` source amendment: APPROVED by user on
  2026-10-16; preserve finite Number bindings and evaluate `sin(1 / 0)`
  directly so the math function receives the non-finite input.
- Diagnostic allocation: user allocated `AMXSL001`–`AMXSL006` with exact
  messages on 2026-10-15. Read-only search found no occurrences in source,
  tests, editor apps, docs, or examples before these planning records.
- Contract disposition: **ACCEPTED** by user, 2026-10-15.
- Sprint 085 readiness: **READY FOR SEPARATE EXECUTION AUTHORIZATION**.
- Implementation, release, publication, version change, and platform
  certification: NOT RUN / NOT AUTHORIZED.

## Evidence Log

| ID | Contract area | Exact action / artifact | Result | Evidence location | Decision / residual owner |
| --- | --- | --- | --- | --- | --- |
| E-01 | `is` grammar, precedence, and target resolution | Read the master plan, V0.12/V0.13 contracts, current Pratt precedence, type-reference parser, and type resolver; recorded and obtained approval for grammar, precedence, associativity, chains, and Number/Measurement distinction. | PASS for decision record; V0.14 parser/runtime verification NOT RUN | `grammar-examples.md`; `src/parser/parseExpression.ts`; `src/parser/parseStatements.ts:693-704`; `src/typechecker/checkDocument.ts:468` | Separate Lead Developer/product-owner final disposition; Sprint 085 implementation |
| E-02 | `is` runtime behavior and diagnostics | Mapped structural, optional/null, nested list/record, enum overlap, Measurement dimension, mismatch, import, and no-narrowing fixtures; recorded approved outcomes and exact existing diagnostic reuse. | PASS for contract source/ID mapping; V0.14 runtime/type-checker verification NOT RUN | `grammar-examples.md`; `diagnostic-matrix.md`; `requirement-test-matrix.md` | Separate final disposition; Sprint 085 owner |
| E-03 | Math signatures, domains, finite behavior, constants | Read master scope, existing signatures/Measurement paths; recorded all 15 expected values, IEEE-754 constants, approved domains, tolerance, tangent behavior, and new diagnostics. | PASS for approved decision/fixture records; V0.14 runtime tests NOT RUN | `grammar-examples.md`; `src/typechecker/checkDocument.ts`; `src/runtime/standardLibrary.ts`; `src/runtime/evaluateExpression.ts` | Separate final disposition; Sprint 086 owner |
| E-04 | Measurement-aware standard-library contract | Read V0.9 Measurement contract and existing focused tests; added explicit aggregate/result-unit/empty-list fixture and regression cases for all existing numeric functions. | PASS for contract and fixture mapping; runtime results NOT RUN in Sprint 084 | `docs/language-spec-v0.9.md` §6; `tests/measurements.test.ts`; `grammar-examples.md` | Sprint 086 owner; preserve V0.9 contract |
| E-05 | Text/Unicode/whitespace/count contract | Recorded Unicode 15.1 `White_Space`, code-point operations, count defaults/boundaries, and `AMXSL003` exact diagnostic. | PASS for product decision/fixture record; V0.14 implementation tests NOT RUN | `grammar-examples.md`; `diagnostic-matrix.md` | Sprint 087 owner |
| E-06 | Numeric formatter syntax, locale, and outputs | Recorded approved bounded grammar, exact locale allowlist/separators, rounding/ties, currency/negative/negative-zero outputs, Measurement patterns/suffix, and diagnostic allocations. | PASS for product decision/fixture record; formatter implementation tests NOT RUN | `grammar-examples.md`; `diagnostic-matrix.md` | Sprint 087 owner |
| E-07 | Diagnostic identity/message/source-range cross-check | Verified established `AMX3001/2/4/6/7`, `AMX1009`, `AMX2004/5`, `AMX3010`; recorded user allocations `AMXSL001`–`AMXSL006`; source search found no collisions; 38 candidate spans checked, including UTF-16 and CRLF variants. Focused tests passed: editor `shared editor ranges preserve UTF-16 offsets across CRLF and non-BMP text`; parser `reports equivalent multiline constructor source locations for LF and CRLF`. | PASS for catalog/range/mapping checks; V0.14 diagnostics not implemented or run | `diagnostic-matrix.md`; one-off range audit; `tests/editor.test.ts`; `tests/parser.test.ts` | Sprint 085-087 implementation owners |
| E-08 | Requirement-to-test traceability | Cross-checked all fixture IDs against complete source envelopes and all source IDs against the requirement matrix. | PASS: 44 source envelopes, 44 matrix IDs, 0 missing, 0 untraced | `requirement-test-matrix.md`; `grammar-examples.md`; one-off ID audit | Sprint 085-089 owners |
| E-09 | Planning artifact integrity | Confirmed no production files, user-facing specifications, examples outside the planning pack, tests, manifests, or release files were edited; ran `git diff --check`. | PASS for approved file scope and whitespace check | `git status --short --branch`; `git diff --check`; user-approved plan | Builder |
| E-10 | Runtime/build/test verification | No V0.14 runtime/build/test suite run; proposed constructs are not claimed implemented. | NOT RUN, intentionally | Sprint 084 acceptance and V0.14 master plan | Downstream authorized implementation sprints |

### Read-only source findings

- `parseExpression.ts` currently assigns comparison operators precedence 2,
  Measurement conversion `in` 2.5, arithmetic 3-5, `and` 1, and `or` 0;
  `^` is right-associative. This is a preservation baseline, not a decision
  about the new `is` operator.
- `parseTypeReference` accepts an ASCII simple name and repeated `[]`/`?`
  suffixes. `checkDocument.ts` resolves primitive/type/dimension names in its
  existing environment and emits `AMX3001` with `Unknown type '<name>'`.
- Existing diagnostic factories establish `AMX3006` as syntax,
  `AMX3002` as general type mismatch, `AMX3004` as arity/unknown function,
  and `AMX3007` as Measurement mismatch. Runtime Measurement-domain
  diagnostics use `AMX1009`; Measurement static domain checks use `AMX3010`.
  The existing Number `sqrt` negative-domain runtime diagnostic is
  `AMX2005`, `sqrt of negative value`.
- The V0.9 contract/test evidence specifies aggregate first-unit behavior,
  selected original units for `min`/`max`, `abs`/`round` unit preservation,
  and Measurement `sqrt`/`pow` dimension rules. These are compatibility
  requirements; current implementation behavior alone was not treated as
  product approval.
- The `AMX3001`/`AMX3002`/`AMX3004`/`AMX3006`/`AMX3007` identities above
  are reused only for their established categories. The user allocated
  `AMXSL001`–`AMXSL006` for the new math, text-count, and formatter failures;
  a read-only source/test/docs/editor search found no prior use. `AMX1009`,
  `AMX3010`, and `AMX2005` were not repurposed.
- Read-only type-checker inspection confirms `unit ratio = meter / meter`
  can produce an empty dimension vector while direct unit attachment retains
  Measurement type. The user approved this fixture form.
- Existing `sourceTokenRange`/`sourceOffset` logic and focused tests were
  inspected; the helper uses JavaScript UTF-16 offsets and strips CR in
  CRLF lines. The two selected editor/parser location tests passed.

## Product Decisions and Residuals

### Product decisions recorded 2026-10-15

- `is` reuses the current simple-name plus `[]`/`?` type-reference grammar;
  precedence is the existing comparison tier; same-tier chains are
  left-associative then ordinarily type-checked; Number does not match an
  empty-vector Measurement.
- Math domains are as tabulated in `grammar-examples.md`; `tan` uses IEEE-754
  evaluation without an epsilon pole check; expected-value tolerance is
  `max(1e-12, abs(expected) * 1e-12)`.
- A source-level dimensionless Measurement uses `unit ratio = meter / meter`
  and `2 ratio`.
- Text slicing defaults to one, accepts zero/oversized counts as empty/full
  text, and rejects negative, fractional, non-finite, or wrong-type counts.
  `trim` uses Unicode 15.1 `White_Space`.
- `format` grammar, `en-US`/`de-DE`/`fr-FR` locales, exact separators,
  half-away-from-zero decimal ties, negative sign/negative-zero behavior,
  literal currency prefixes, Measurement pattern application, and one-space
  unit suffix were approved.
- Existing `round` behavior is preserved exactly: default digits 0,
  fractional digits truncated toward zero, `Math.round` ties, Measurement
  unit preserved.
- Exact new diagnostic allocations are recorded in `diagnostic-matrix.md`.

### Approved non-finite-input fixture amendment (2026-10-16)

The user approved preserving the existing finite-Number-binding invariant
after Sprint 086 implementation testing showed that the prior source
(`let infinite = 1 / 0` followed by `sin(infinite)`) raises `AMX4003` while
creating the binding, before the math call can report the accepted
`AMXSL001`. The fixture now evaluates `let result = sin(1 / 0)` directly.
Its ID, expected diagnostic code/message, math domains, and all unrelated
contract decisions remain unchanged. Its exact primary range is line 5,
columns 14–24. Sprint 086's test/evidence plan was amended and approved
before these Sprint 084 records were edited.

### Approved Sprint 087 non-finite argument fixture amendments (2026-10-16)

The user approved preserving the existing finite-Number-binding behavior
while making the accepted text/format diagnostics directly testable.
`TEXT-COUNT-NONFINITE-01` now calls `right("A", 1 / 0)` directly and retains
`AMXSL003`, `Invalid text slice count`, at line 5, columns 25-30.
`FORMAT-FINITE-01` now calls `format(1 / 0, "0")` directly and retains
`AMXSL006`, `Input is non-finite`, at line 5, columns 21-26. The fixture IDs,
diagnostic identities/messages, runtime Number-binding behavior, and all
other contract semantics remain unchanged. Sprint 087 preparation recorded
these decisions before the corresponding source-range updates.

### Remaining gate

- The separate Lead Developer/product-owner **contract disposition was
  ACCEPTED by user on 2026-10-15**. This closes the Sprint 084 contract gate
  only; it is not an implementation, release, or publication authorization.
- A non-finite internal Measurement cannot be constructed from valid AMX
  source under the V0.9 finite-value invariant. The `AMXSL006` guard for that
  malformed internal value is a Sprint 087 runtime-harness residual if the
  implementation can exercise it without weakening the source contract.
- V0.14 implementation/runtime tests are NOT RUN by design and belong to
  Sprints 085–089. Sprint 085 is READY FOR SEPARATE EXECUTION AUTHORIZATION;
  it is not authorized to start by this disposition. No release, publication,
  package/version change, or platform certification is authorized.

## Builder Recommendation

**ACCEPTED BY USER FOR SPRINT 084 CONTRACT DISPOSITION.** Confirmed
master-plan scope is preserved;
the user-approved contract details, fixture sources, exact diagnostic
identities/messages, and traceability are recorded. The 38 candidate
diagnostic ranges and 44 fixture-to-matrix IDs passed scoped consistency
checks, the allocated diagnostic identifiers had no source collisions, and
two focused existing location tests passed. V0.14 implementation/runtime
tests were intentionally NOT RUN.

The separate contract disposition is recorded; Sprint 085 still requires its
own execution authorization. This acceptance does not authorize implementation,
release, publication, package/version change, or platform certification.
