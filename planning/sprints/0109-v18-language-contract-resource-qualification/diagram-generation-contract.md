# Sprint 109 Candidate Contract: V0.18 Diagram Content Generation

## Status and Labels

This is a candidate contract for review, not an accepted specification.
Labels are used as follows:

- **CONFIRMED**: explicitly stated in the V0.18 master plan.
- **FACT**: current source/documentation behavior observed during preparation;
  it does not override confirmed scope.
- **PROPOSAL**: a testable interpretation recommended for disposition.
- **OPEN**: requires evidence or an explicit product-owner decision.

## Confirmed Contract

- **CONFIRMED - Syntax:** Diagram bodies may contain primitive declarations,
  `for item in iterable { ... }` blocks, and braced `if`/`else` blocks.
  Existing AMX iterable and conditional semantics are reused.
- **CONFIRMED - Evaluation timing:** Each iterable and branch condition is
  evaluated once when a diagram model is created. The resulting primitive
  membership and order remain fixed for that model across animation frames.
- **CONFIRMED - Animation:** Primitive property expressions continue to be
  evaluated for each requested frame. The diagram time variable `t` is
  prohibited in loop iterables and conditional controls, but remains
  available in supported primitive property expressions.
- **CONFIRMED - Ordering:** Output preserves source order across direct
  primitives, loop iterations, and selected conditional branches.
- **CONFIRMED - Nesting:** Conditionals may appear in loops and loops may
  appear in conditional branches. A `for` may not be nested within another
  `for`, including through an intervening conditional.
- **CONFIRMED - Identity:** Generated instances have internal identities only;
  there are no new source-level names, references, or APIs for addressing
  generated instances.
- **CONFIRMED - Limits:** A separate cap applies per evaluated diagram. The
  existing authored-element/report limit and its accounting remain separate.
- **CONFIRMED - Compatibility:** Diagrams without control blocks retain
  existing interactive timeline and static HTML/PDF/DOCX behavior.

## Proposed Operational Rules

The following proposals make the confirmed requirements implementable. They
need explicit review and disposition; they are not yet normative.

1. A selected branch is traversed at its source position; an unselected
   branch contributes no elements. Loop iterations follow the existing
   iterable's established traversal order.
2. Each loop iteration receives the current iterator value in a scoped
   binding. The binding is captured for every emitted primitive and is
   restored after the block, including when a same-named outer binding
   existed. A loop-local binding does not escape its block.
3. A conditional condition follows existing AMX Boolean checking and runtime
   behavior. An iterable follows existing AMX iterable type and evaluation
   rules; no diagram-specific iterable coercion is added.
4. Generated primitives retain their originating source locations for
   property diagnostics. Internal instance identities are deterministic
   within one model and preserve emission order, but are not exposed as AMX
   names or a cross-evaluation identity guarantee.
5. Expansion overflow is detected while emitting, before unbounded
   allocation. The diagnostic identifies the control/primitive responsible
   for the first element beyond the selected limit.
6. The model stores the expanded ordered content plus enough per-instance
   evaluation context to evaluate properties at any requested frame. It
   does not reevaluate branch selection or iterable membership per frame.

## Open Product and Technical Decisions

| ID | Question | Required evidence or proposed resolution | Blocks |
| --- | --- | --- | --- |
| D109-01 | Does the generated cap count every emitted primitive in the evaluated diagram, or only primitives originating in control blocks? | Compare both accounting models against authored-limit composition, likely author expectations, and workload results. Keep the authored 512-per-report rule separate in either case. | Cap selection; Sprints 110-114 |
| D109-02 | What numeric per-diagram cap is safe and useful? | Recommend an exact integer from recorded construction, frame, serialization, HTML, and static-output results with stated headroom and limitations. | Sprints 110-114 |
| D109-03 | Does the documented 1 MiB HTML bound constrain the cap, given the current 100 MiB renderer bound? | Verify both sources and measure compressed/uncompressed model and full HTML size. Decide whether this is only an existing documentation/runtime discrepancy or a cap constraint. Do not alter the broad HTML policy here. | Cap rationale |
| D109-04 | What diagnostic identity/message and source anchor identify invalid controls and cap overflow? | Audit current diagnostic registrations and location conventions; propose exact messages/anchors and request explicit stable-code allocation where needed. | Sprints 110-114 |
| D109-05 | Can distinct loop bindings survive frame evaluation and serialization while preserving the ordered renderer interface? | Complete the round-trip prototype and report representation options, complexity, and any incompatibility. Mark NO-GO if a material contract change is required. | Sprints 110-112 |
| D109-06 | What test-host/resource evidence is sufficient to call a cap qualified? | Record the agreed benchmark host, repetitions, timing/memory collection, safety margin, and explicit unavailable checks. | Cap disposition |

## Existing Behavior to Preserve

- **FACT:** Diagram frame output is an ordered array of typed primitives.
- **FACT:** The current frame path evaluates a declaration's flat element
  sequence against a cloned environment after setting the requested timeline
  variable.
- **FACT:** The current scene-model serialization includes both model data
  and captured evaluation context. The prototype must verify whether the
  proposed per-instance context fits this boundary cleanly.
- **FACT:** Authored diagram elements are currently limited to 512 per
  report with `AMXD013`. Do not reuse this diagnostic or silently change its
  count.
- **FACT:** Interactive HTML currently has a 100 MiB byte limit; the V0.13
  specification documents a 1 MiB interactive-preview constraint. This
  discrepancy remains unresolved until D109-03 is dispositioned.

## Acceptance Rule

This contract becomes downstream behavior authority only when the
Lead Developer/product owner separately records ACCEPTED/CLOSED and resolves
D109-01 through D109-06, or explicitly accepts named residuals that do not
block a specific downstream sprint. A Builder recommendation alone is not
approval. No implementation sprint may infer that an OPEN proposal is
approved.