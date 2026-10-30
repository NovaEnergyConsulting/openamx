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

## Decision Register

| ID | Question | Required evidence or proposed resolution | Blocks |
| --- | --- | --- | --- |
| D109-01 | Does the generated cap count every emitted primitive in the evaluated diagram, or only primitives originating in control blocks? | Product owner selected control-block-originating emissions only; authored 512-per-report rule remains separate. | RESOLVED 2026-10-30 |
| D109-02 | What numeric per-diagram cap is safe and useful? | Product owner selected 64 control-block-originating emitted primitives per evaluated diagram, based on the recorded evidence. | RESOLVED 2026-10-30 |
| D109-03 | Does the documented 1 MiB HTML bound constrain the cap, given the current 100 MiB renderer bound? | Product owner accepted that the measured candidate is below 1 MiB and does not constrain the cap. The discrepancy remains unchanged as an owned documentation/runtime residual. | ACCEPTED RESIDUAL; Lead Developer; no broad HTML policy change |
| D109-04 | What diagnostic identity/message and source anchor identify invalid controls and cap overflow? | Product owner accepted the parse-time nesting policy and semantically exact existing type/identifier diagnostics. A shared new diagnostic for `t` in controls is required, anchored at the `t` identifier; Lead Developer is the allocator. Overflow identity/message/anchor also requires Lead Developer allocation; never reuse `AMXD013`. | ACCEPTED RESIDUAL; blocks S110 feature diagnostic implementation until allocation |
| D109-05 | Can distinct loop bindings survive frame evaluation and serialization while preserving the ordered renderer interface? | Product owner accepted the prototype as feasibility evidence only. Production `evaluateDiagramFrame` integration remains a Sprint 112 runtime residual. | ACCEPTED RESIDUAL; Sprint 112 runtime owner |
| D109-06 | What test-host/resource evidence is sufficient to call a cap qualified? | Product owner accepted the one-host synthetic benchmark as sufficient for Sprint 109 disposition, with peak-memory and cross-platform qualification explicitly not claimed. | ACCEPTED RESIDUAL; Lead Developer; no platform certification |

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
  discrepancy is an accepted D109-03 residual. The product owner decided it
  does not constrain the measured candidate; neither limit changes here.

## Builder Source Review and Recommendation

Read-only review was performed at commit
`b9e26b846a1e3cb9a1bd5dde71081ed0ede12ba5` on a clean worktree. The following
are **FACT** source observations, not new product requirements:

- `DiagramDeclarationNode` stores a flat `elements` array. The diagram parser
  recognizes top-level primitive declarations and diagram properties; it
  does not parse diagram-local `for` or `if` content.
- `checkDiagram` counts authored elements across the report and raises
  `AMXD013` after 512. The module loader independently enforces the same
  report-wide authored count across imported modules. The 16-diagram
  `AMXD012` limit is separate.
- Existing `for` checking requires a list/range and restores bindings after
  the block; type mismatch uses the established `AMX3003`/`AMX3007` behavior.
  Braced `if` checking requires Boolean and uses the existing type mismatch
  diagnostic. Unknown identifiers use `AMX3001`.
- `createDiagramModel` captures one environment; `evaluateFrame` clones that
  environment, assigns `t`, and evaluates the declaration's flat ordered
  element array. The model serializer preserves model data and the shared
  captured environment. It has no production per-element environment.
- Interactive and static renderers consume ordered `DiagramFrame.elements`.
  The static path evaluates at the lower time bound. Interactive HTML is
  measured as full UTF-8 bytes against 100 MiB. The desktop preview/export
  worker also has a distinct 8,000,000-character guard.
- The V0.13 specification records a 1 MiB interactive-preview HTML bound,
  16.7 ms p95 frame-work target, 8 MiB incremental heap target, and 2,000
  whole-page DOM-node target. Only the HTML/DOM portions were directly
  sampled by this sprint's probe; no heap or low-end-host claim is made.

**DECIDED 2026-10-30 / PRODUCT OWNER:** Count only primitives emitted from
diagram control blocks toward the new cap. Counting all frame elements would
apply a generated cap to existing static diagrams and conflict with preserving
diagrams that contain no controls. Keep the 512 authored-element/report
accounting under `AMXD013` unchanged and separate.

**DECIDED 2026-10-30 / PRODUCT OWNER:** Set the generated-output cap to 64 per
evaluated diagram. This is a conservative power-of-two boundary supported by
the measured 16-diagram composition: 512 authored declarations plus 64
generated elements per diagram produced 1,536 frame elements, 1,864 whole-page
DOM nodes, and 247,256 UTF-8 HTML bytes. At 65 generated elements per diagram
the same composition reached 1,880 nodes and 248,244 bytes; at 128 per diagram
the circle and text compositions reached 2,376 DOM nodes, above the documented
2,000-node target. The 65 value also completed in measured workloads; 64 is
the accepted limit with additional headroom, not a claim that 65 fails.

**FACT / D109-03:** The selected candidate's measured composed HTML is below
1 MiB, so neither the documented 1 MiB statement nor the current 100 MiB
renderer guard constrained this candidate. The desktop worker's 8,000,000
character guard also was not approached. Do not change any of these policies
in this sprint.

**PARTIAL / D109-05:** The prototype carried three distinct iterator binding
descriptors inside a `DiagramSceneModel` declaration, serialized and
deserialized them with the production scene-model serializer, and re-evaluated
ordered frames at `t = 0`, `0.5`, and `1`. It then projected the ordered frame
elements through the existing SVG and interactive HTML renderers. The
prototype's own evaluator consumed the restored descriptors; production
`evaluateDiagramFrame` does not. This proves representation and consumer
compatibility for the measured prototype, not a production per-instance
binding implementation.

**ACCEPTED RESIDUALS:** D109-04 is accepted with the Lead Developer as
allocator. Both prohibited uses of `t` share a new diagnostic anchored at the
`t` identifier; nested `for` rejects at parse time on the inner `for`; cap
overflow receives a new diagnostic anchored at the source responsible for the
first excess output. Exact new codes/messages remain unallocated and block the
corresponding S110/S111 diagnostic implementation. Do not reuse `AMXD013`.
D109-05 remains production evaluator work owned by Sprint 112. D109-06 is
limited to one high-performance Windows host, with peak memory not measured;
the Lead Developer owns this accepted evidence residual. See
`resource-qualification.md` and `builder-evidence.md` for exact runs and raw
artifact paths.

## Acceptance Rule

This contract becomes downstream behavior authority only when the
Lead Developer/product owner separately records ACCEPTED/CLOSED and resolves
D109-01 through D109-06, or explicitly accepts named residuals that do not
block a specific downstream sprint. A Builder recommendation alone is not
approval. No implementation sprint may infer that an OPEN proposal is
approved.

## Product-Owner Disposition

On 2026-10-30, the Lead Developer/product owner recorded
`ACCEPTED/CLOSED WITH RECORDED RESIDUALS` for Sprint 109. D109-01 and D109-02
are resolved as stated above. D109-03, D109-05, and D109-06 are accepted
residuals with the listed owners. D109-04 is accepted as a residual owned by
the Lead Developer allocator; its unallocated stable identities remain a
blocking prerequisite for Sprint 110's feature diagnostic implementation.
This disposition accepts the Sprint 109 contract/resource gate with those
boundaries; it does not claim production generated controls, cross-platform
qualification, or release certification.