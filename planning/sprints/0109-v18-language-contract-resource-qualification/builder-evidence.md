# Sprint 109 Builder Evidence: V0.18 Language Contract and Resource Qualification

## Status

authorization and approval of the exact review/prototype/benchmark plan.
Sprint 109 Builder execution was separately approved in conversation on
2026-10-30 for the read-only review at the approved commit, the exact probe
path, commands, output roots, and resource guards recorded below. This is
evidence only; the product owner has not accepted the contract or resource
gate.

**Builder recommendation:** BLOCKED / OPEN for Sprint 109 acceptance and
Sprint 110 entry. Recommend 64 control-block-originating emitted primitives
per evaluated diagram, pending explicit D109-01/D109-02 disposition. D109-04
diagnostic allocation remains open; D109-05 is only partially demonstrated;
D109-06 is one-host evidence with peak memory not measured.
**Separate product-owner disposition:** PENDING.

## Authorization and Baseline

- Authorization date/approver: 2026-10-30, explicit user approval in this
	conversation.
- Approved file and output plan: source review only at first gate; then
	`artifacts/qualification-probe.ts`, with raw data/logs under this sprint's
	`artifacts/raw/` and `artifacts/logs/`. Documentation edits were restricted
	to this Sprint 109 package. No source, tests, generated runtime, editor,
	examples, published specs, release, or global planning files changed.
- Repository commit/worktree and preservation inventory: `b9e26b846a1e3cb9a1bd5dde71081ed0ede12ba5`,
	branch `feat/create-v0.18`. Worktree was clean before execution. No prior
	artifact was overwritten; initial and corrected attempts are retained under
	distinct names.
- Host OS/architecture, CPU/memory, runtime/tool versions: Windows 11 build
	10.0.26300 x64; Intel Core Ultra 9 285H, 16 logical CPUs, 64 GiB RAM;
	PowerShell 5.1; Bun 1.4.4; Node 26.3.0; Chromium 156.0.8078.4.
- Existing generated/shared artifacts inventoried and hashes where relevant:
	no shared/generated artifacts were changed. No hash comparison was needed
	because the only writes were to the approved sprint package/artifact root.
- Sprint 108 closeout disposition rechecked: product owner ACCEPTED/CLOSED
	WITH RECORDED RESIDUALS on 2026-10-25 within the amended V0.17 file-only
	scope. Raw Hutch build and full desktop UI statuses remain
	BLOCKED/UNAVAILABLE; they were not converted to PASS or reopened.

## Contract and Traceability Evidence

- Source files/specifications reviewed and exact observed facts: V0.12/V0.13/
	V0.16 specifications, relevant examples, diagram AST/parser/checker,
	runtime model/evaluator/serializer, HTML/static renderers, output guards,
	diagnostic registration, and focused tests. Current diagram AST/parser is
	flat; `checkDiagram` and module loading retain the 512 authored
	elements/report `AMXD013` rule and 16-diagram `AMXD012` rule. The scene
	model captures one environment and frame evaluation maps the ordered flat
	element list. Current interactive renderer bound is 100 MiB UTF-8 bytes;
	desktop worker has an additional 8,000,000-character guard; V0.13 states
	1 MiB. Full source facts and links are in
	`diagram-generation-contract.md`.
- Confirmed requirements/proposals/open decisions reconciled: confirmed
	master-plan rules are separated from source facts and Builder proposals in
	`diagram-generation-contract.md`. `AMXD013` accounting is not repurposed.
- Complete fixture IDs and count: 27 distinct qualification-case IDs; two
	proposed complete AMX envelopes are documented in
	`qualification-cases.md`. They are not accepted by the current parser and
	their exact diagnostic spans remain unverified.
- Diagnostic identities/messages/anchors verified or pending allocation:
	existing `AMX3003`/`AMX3007` loop type behavior, `AMX3002` Boolean mismatch,
	`AMX3001` unknown identifier, and generic `AMX3006` syntax behavior were
	source-audited. Twelve distinct diagnostic/technical-probe IDs reconcile;
	feature-specific nested-loop, prohibited-`t`, and cap-overflow identities
	remain unallocated. No code was guessed or reused for cap overflow.
- Requirement-matrix audit result, including missing/duplicate IDs: 27
	qualification IDs, 12 diagnostic/technical IDs, no duplicates, and no
	unrepresented diagnostic ID. Every case family maps to a requirement row or
	is explicitly evidence-only. Product-feature tests remain NOT RUN.
- D109-01 through D109-06 outcomes and decision owners: D109-01 recommend
	control-block-only accounting; D109-02 recommend 64 per diagram; D109-03
	candidate is below 1 MiB and broad output policy is unchanged; D109-04
	requires explicit diagnostic allocator/product-owner disposition; D109-05
	prototype passes for serialized representation and ordered consumer but
	production evaluator integration is not proved; D109-06 evidence covers
	one high-performance Windows host, with peak memory and low-end/cross-host
	qualification unavailable. Product-owner disposition is pending for all.

## Prototype Evidence

- Exact prototype paths/commands and retention/removal disposition:
	`bun run planning/sprints/0109-v18-language-contract-resource-qualification/artifacts/qualification-probe.ts --prototype`.
	Final raw record: `artifacts/raw/prototype-retry-02.json`; first schema-only
	record preserved as `artifacts/raw/prototype.json`. Probe source remains at
	`artifacts/qualification-probe.ts`; it is approved evidence code, not
	product implementation.
- Multiple iterator bindings and `t` frame values: PASS in the prototype for
	iterator values 2, 5, and 9 at `t = 0`, `0.5`, and `1`; `cx` remained 20,
	50, and 90 while `cy` changed from 0 to 2 to 4.
- Ordered membership before and after serialization round-trip: PASS in the
	prototype. Three descriptors were stored in a `DiagramSceneModel` payload,
	serialized/deserialized with the production serializer, recovered, and
	re-evaluated by the prototype evaluator with identical ordered frames.
- Property/source-location parity: property values and source line 12 were
	preserved in the prototype payload; no full parser-generated diagnostic
	span parity was claimed.
- Ordered renderer contract result: PASS for projection into the existing
	ordered `DiagramFrame.elements` form, static SVG order, and interactive HTML
	figure. Production `evaluateDiagramFrame` does not consume prototype
	bindings; this is a partial feasibility result, not a feature-level GO.
- Failure/retry/unavailable checks and residuals: initial prototype used a
	plain JSON schema round-trip and is preserved separately. The final
	prototype uses the production scene-model serializer. Production frame
	evaluation after round-trip remains unimplemented and NOT RUN.

## Resource Evidence

Attach raw logs and machine-readable measurements under the approved
`artifacts/` directory. Summarize the required workload results here.

| Workload | Emitted count/accounting | Model/expand median/p95 | Frame median/p95 | Round-trip time/bytes | HTML/static sizes | Result/limitation |
| --- | --- | --- | --- | --- | --- | --- |
| B0 Static baseline | 8-element existing example; all benchmark stages PASS | In-process frame medians 0.41-0.55 ms | 63,083 JSON / 3,732 gzip bytes | 59,497 HTML bytes | PDF 15,963 bytes; DOCX 17,227 bytes | `benchmark-retry-05.json` |
| B1 Minimal primitives | 64 circles; construction median 0.77 ms | Frame median 0.038-0.046 ms | 253,429 JSON / 6,033 gzip bytes | 62,262 HTML bytes | SVG 5,469 bytes | `benchmark-retry-05.json` |
| B2 Dynamic properties | 64 circles; construction median 0.82 ms | Frame median 0.045-0.048 ms | 312,799 JSON / 7,799 gzip bytes | 64,318 HTML bytes | SVG 5,469 bytes | `benchmark-retry-05.json` |
| B3 Text-heavy | 64 x 128-character text values; construction median 1.02 ms | Frame median 0.037-0.041 ms | 205,927 JSON / 5,674 gzip bytes | 61,858 HTML bytes | SVG 13,980 bytes | `benchmark-retry-05.json` |
| B4 Mixed controls | 64 total output; modeled permitted nesting; construction median 2.26 ms | Frame median 0.115-0.147 ms | 323,935 JSON / 5,793 gzip bytes | 61,898 HTML bytes | SVG 5,529 bytes | Synthetic control-tree only; `benchmark-retry-05.json` |
| B5 Serialization | 64 dynamic circles; round-trip PASS | Serialization median 0.87 ms; deserialization median 0.76 ms | 312,799 JSON / 7,799 gzip bytes | 64,318 HTML bytes | SVG 5,469 bytes | `benchmark-retry-05.json` |
| B6 Static output | 64 text values; static paths PASS | Frame median 0.055-0.058 ms | 187,495 JSON / 5,683 gzip bytes | 61,766 HTML bytes | PDF 16,167 bytes / 13.59 ms; DOCX 14,539 bytes / 63.41 ms | `benchmark-retry-05.json` |
| B7 Report composition | 16 diagrams; 512 authored + 64 generated/diagram: 1,536 frame elements | Frame medians 1.53-1.76 ms | 7,714,079 JSON / 131,896 gzip bytes | 247,256 HTML bytes; 1,864 DOM nodes | PDF 122,505 bytes / 72.58 ms; DOCX 11,766 bytes / 239.46 ms | `benchmark-retry-05.json`, `browser-retry-09.json` |

- Proposed counting rule: count primitives originating in diagram control
	blocks only. Counting every emitted primitive would cap static no-control
	diagrams and undermine the confirmed compatibility requirement.
- Proposed numeric cap: 64 per evaluated diagram, pending owner decision.
- Exact cap/cap+1 results: B4-GEN measured 512 direct + 64 generated (576
	total) and 512 direct + 65 generated (577 total); both synthetic workloads
	completed. B7 measured 512 authored declarations across 16 diagrams plus
	64 generated per diagram (1,536 total) and the 65-per-diagram composition
	(1,552 total). The existing product implementation did not reject cap+1;
	overflow behavior is NOT RUN.
- Headroom rationale and limiting case: 64 is half of the 128-per-diagram
	comparison at which the 16-diagram circle/text browser pages reached 2,376
	DOM nodes, above the documented 2,000 target. The measured 65 cap+1 cases
	also fit the tested limits; 64 is a conservative power-of-two recommendation
	with numeric headroom, not a claim that 65 fails.
- 512 authored-elements and 16-diagram composition analysis: 512 authored
	declarations remain independent of generated count. The 16-diagram
	512-authored + 64-generated-per-diagram browser page had 1,864 DOM nodes and
	247,256 HTML bytes; the 65 case had 1,880 nodes and 248,244 bytes. No
	report-wide generated cap is recommended.
- 1 MiB versus 100 MiB HTML discrepancy and disposition: confirmed spec says
	1 MiB; renderer enforces 100 MiB UTF-8; desktop worker separately checks
	8,000,000 characters. Candidate page was 247,256 bytes, so it did not
	constrain the candidate. No policy was changed; broader discrepancy remains
	for separate owner disposition.
- Checks not run/unavailable and why: product parser/checker/runtime feature
	tests, actual generated control expansion, product overflow diagnostic,
	full production-model per-instance evaluation, peak memory, low-end host,
	other OS, and certification. The new syntax and cap do not exist at the
	reviewed commit; no product tests were authorized or run.

## Commands, Retries, and Raw Outcomes

All three probe commands were run from the repository root at the approved
commit:

```powershell
bun run planning/sprints/0109-v18-language-contract-resource-qualification/artifacts/qualification-probe.ts --prototype
bun run planning/sprints/0109-v18-language-contract-resource-qualification/artifacts/qualification-probe.ts --benchmark
bun run planning/sprints/0109-v18-language-contract-resource-qualification/artifacts/qualification-probe.ts --browser
```

- Prototype: initial schema-only output is preserved as
	`artifacts/raw/prototype.json`. The final production serializer/deserializer
	round-trip run passed and is preserved as
	`artifacts/raw/prototype-retry-02.json` and
	`artifacts/logs/prototype-retry-02.log`.
- Benchmark: the first 39-point run (`benchmark.json`/`.csv`) used a synthetic
	B0 and flattened B4; it is retained but not used for recommendations. The
	corrected 39-point run is `benchmark-retry-02.*`. Intermediate boundary
	runs are `benchmark-retry-03.*` and `benchmark-retry-04.*`. The final
	62-point run, including B7 authored/generated composition and PDF/DOCX, is
	`benchmark-retry-05.json`/`.csv`; its per-workload log is
	`artifacts/logs/benchmark-retry-05.log`. All final workload rows completed.
- One intermediate benchmark command failed before executing workloads due
	to a malformed artifact-script edit: Bun reported `Expected ";" but found
	"?"` and `Unexpected :` at the `boundaryCase` type declaration. No
	measurement was produced by that attempt. The artifact script was repaired;
	subsequent 47-, 49-, and 62-point benchmark runs completed and are retained.
- Browser: early cold-start and client-latency runs remain in `browser.json`
	and `browser-retry-02.json` through `browser-retry-06.json`; they are not
	used as frame-work proof. `browser-retry-07-failure.json` records a failed
	16-diagram assertion caused by checking before sequential diagram
	initialization completed. The probe was corrected to await every figure;
	`browser-retry-08.json` passed circle/text compositions and
	`browser-retry-09.json` passed the final circle/text and 512-authored plus
	64/65-generated compositions. The associated `browser-retry-*.log` files
	retain full or summarized output as named.
- Browser automation package and Chromium were available at the approved
	existing desktop dependency path. No browser check was reported unavailable.
- No product test command, root test suite, build, editor test, release check,
	or cross-platform run was performed.

## Scope and Disposition

- Changed paths and approved output inventory: only files inside
	`planning/sprints/0109-v18-language-contract-resource-qualification/` and
	its new `artifacts/` root. Final raw benchmark is `benchmark-retry-05.json`
	and `.csv`; final browser evidence is `browser-retry-09.json`; final
	prototype is `prototype-retry-02.json`. Earlier attempts and failures remain
	in sibling raw/log files.
- Preservation and `git diff --check` result: all writes stayed in the
	approved package/artifact root; no prior outputs were overwritten. Per-file
	`git diff --check` passed for qualification, diagnostic, and matrix edits;
	final package-wide check is recorded after the remaining evidence edits.
- Builder recommendation and named residual owners: BLOCKED/OPEN for sprint
	acceptance. Product owner must disposition D109-01/-02 and the candidate 64
	cap; diagnostic allocator/product owner must allocate new identities for
	prohibited control `t` and overflow; language/runtime owner must decide
	whether the limited prototype is sufficient or require a production-path
	prototype; performance owner must disposition one-host/no-peak-memory
	evidence sufficiency.
- Separate product-owner disposition/date: PENDING; no acceptance is inferred.
- Explicit downstream Sprint 110 gate state: BLOCKED until Sprint 109 is
	separately ACCEPTED/CLOSED, cap accounting/value are resolved, and required
	diagnostic/contract decisions are dispositioned.
- Release/publication/version/platform certification authority: NOT GRANTED.