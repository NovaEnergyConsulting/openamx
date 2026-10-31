# Sprint 111 Builder Evidence: V0.18 Evaluation-Time Expansion and Frame Bindings

## Status

Sprint 111 implementation and scoped verification are complete under the
separately approved file/command/output plan.

**Builder recommendation:** ACCEPT for approved S111 scope, with the accepted
D111-02 work-bound residual and no bounded-evaluation claim.
**Separate product-owner disposition:** ACCEPTED/CLOSED WITH RECORDED
RESIDUALS on 2026-10-31.

## Entry Decisions and Authorization

- S109/S110 dispositions rechecked: S109 ACCEPTED/CLOSED WITH RECORDED
	RESIDUALS on 2026-10-30; S110 ACCEPTED/CLOSED on 2026-10-31.
- Overflow diagnostic identity/message/phase/source anchor allocation:
	`AMXD6004`, exact message `Number of elements in this diagram exceed the
	maximum (64)`, diagram model creation before the 65th primitive is appended
	or evaluated, anchored at the authored primitive declaration responsible
	for that emission.
- D111-01 iterator/timeline-name collision disposition: reject at the
	iterator identifier using the existing `AMXD6001` message.
- D111-02 work-bound evidence or separate product decision: accepted as a
	potentially unbounded-work residual. Do not add a new limit or claim
	bounded evaluation.
- D111-03 serialization/browser staging strategy: reject control-bearing
	models in `serializeDiagramSceneModel` until S112 preserves per-instance
	bindings; in-process evaluation is allowed and static diagrams remain
	unchanged.
- S111 authorization/date, approved commit, exact file/command plan: user
	approval on 2026-10-31 at baseline `2852c05be8ea0476c889500b66dc5d01cdd74218`.
	Approved production candidates: `src/runtime/evaluateExpression.ts`,
	`src/runtime/diagramModel.ts`, `src/typechecker/checkDocument.ts`, and
	`src/diagnostics/errors.ts`; focused tests: `tests/diagram.test.ts`;
	acceptance/matrix amendments: `acceptance.md` and `runtime-test-matrix.md`;
	lifecycle records: `planning/decisions.md`, `planning/state.md`,
	`planning/STATUS.json`, and `planning/ARCHITECT_BRIEFING.md`; evidence:
	this file, `artifacts/iteration-work-probe.ts`, and
	`artifacts/raw/iteration-work.json`.
- Host/runtime versions and preservation inventory: Windows 10.0.26300 x64,
	16 logical CPUs, 64 GiB RAM; Bun 1.4.4; Node v26.3.0. Starting worktree
	was clean on `feat/create-v0.18`. No prior S111 artifacts existed.

## Implementation Evidence

- Approved changed source paths: `src/runtime/diagramModel.ts`,
	`src/runtime/evaluateExpression.ts`, `src/typechecker/checkDocument.ts`,
	and `src/diagnostics/errors.ts`. Focused test: `tests/diagram.test.ts`.
- Model-creation traversal and source-order evidence: recursive content is
	visited depth-first; loops preserve iterable order; only selected branches
	are visited. The tests cover direct siblings, both permitted mixed nesting
	directions, and empty/unselected content.
- Condition/iterable evaluation timing: expansion occurs once in
	`createDiagramModel`; frame evaluation uses the retained instance list.
	Recreated models may differ, while one model keeps membership stable.
- Captured binding representation and multiple-frame results: private
	per-model expanded-instance descriptors carry a unique ordinal, source
	primitive, and cloned iterator bindings. Frame evaluation temporarily
	applies each instance binding alongside the requested timeline value.
- Binding restoration and document-environment non-mutation: existing
	`withLoopBinding` semantics restore shadowed values; focused tests verify
	the outer `item` binding remains unchanged.
- Cap exact 64 result: exactly 64 control-originating emissions succeed,
	including with direct top-level primitives present.
- Cap+1 rejection code/message/phase/source location: the 65th emission fails
	during model creation before append/evaluation with `AMXD6004`, exact
	allocated message, and the authored primitive declaration location.
- Control-only versus direct-element count, per-model reset: direct top-level
	primitives do not consume the cap; two diagrams each emit 64 successfully.
- Existing authored 512/513 `AMXD013` compatibility: 512 authored
	declarations remain accepted and 513 remain rejected. The corrected valid
	mixed boundary is 511 direct plus one loop-authored primitive emitted 64
	times, for 575 frame elements.
- No-control diagram regression: existing scene-model round trips, static
	frames, and diagram HTML tests pass unchanged.
- Serialization fail-closed/staging result: serialization and deserialization
	reject control-bearing models; in-process evaluation works. S112 browser
	playback and export parity are not claimed.
- High-iteration empty/low-output timing/allocation observations: see the
	measurements below. D111-02 is an accepted residual; no work bound is added
	or claimed.

## Verification and Scope

- `bun run planning/sprints/0111-v18-evaluation-time-expansion-frame-bindings/artifacts/iteration-work-probe.ts` — PASS; Bun 1.4.4, five measured repetitions per case after one warm-up. Raw results are in `artifacts/raw/iteration-work.json`.
- Empty-body loop medians: 10,000 iterations 0.424 ms; 100,000 1.951 ms; 1,000,000 15.471 ms.
- False-branch loop medians: 10,000 iterations 0.572 ms; 100,000 2.701 ms; 1,000,000 19.638 ms. A 3.414 ms maximum occurred in the 10,000-iteration case; raw samples are retained.
- Scope limitation: these are existing general-purpose `for` statements, not diagram expansion. Heap/RSS are before/after samples, not peak-memory measurements. This single-host result does not establish a work bound or qualify production diagram expansion.
- `bunx tsc --noEmit` — PASS; no generated outputs were written.
- `git diff --check` — PASS.
- `bun test tests/diagram.test.ts tests/evaluator.test.ts tests/diagramHtml.test.ts` — PASS, 131 tests, 0 failures, 687 expectations.
- `bunx tsc --noEmit` — PASS.
- `git diff --check` — PASS.
- Failures/retries: the first implementation run had one obsolete fail-closed assertion (18 pass/1 fail). The next run exposed two test-fixture defects (untyped empty list and missing closing fence; 20 pass/2 fail). Both were corrected; the final focused selection passed. No product behavior failure remains.
- Runtime case ID audit: all 17 IDs in `runtime-test-matrix.md` map to focused assertions or the named D111-02 resource evidence; no missing or duplicate IDs.
- Changed-path inventory: `src/runtime/diagramModel.ts`, `src/runtime/evaluateExpression.ts`, `src/typechecker/checkDocument.ts`, `src/diagnostics/errors.ts`, `tests/diagram.test.ts`, `planning/decisions.md`, `planning/state.md`, `planning/STATUS.json`, `planning/ARCHITECT_BRIEFING.md`, this evidence file, `acceptance.md`, `runtime-test-matrix.md`, `artifacts/iteration-work-probe.ts`, and `artifacts/raw/iteration-work.json`.
- Preservation: no generated browser artifact or existing test output was changed. The probe created only its approved new script and raw JSON output.
- S112 browser/serialization/static export work: NOT IN SCOPE / NOT RUN.
- Release, publication, package/version, certification: NOT AUTHORIZED.
- Builder recommendation and rationale: ACCEPT for the approved in-process
	expansion scope; D111-02 remains an explicitly accepted resource residual.
- Separate product-owner disposition/date: ACCEPTED/CLOSED WITH RECORDED
	RESIDUALS, 2026-10-31.
- Sprint 112 gate state: NOT AUTHORIZED; separate approval remains required.