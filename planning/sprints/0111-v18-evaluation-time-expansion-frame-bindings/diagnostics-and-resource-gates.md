# Sprint 111 Diagnostic and Resource Gates

## Allocated Diagnostics

- `AMXD6001` is allocated by S110 for the declared diagram time variable
  appearing in a loop iterable or conditional test. Message:
  `Variable [<time-name>] is already used to control the diagrams timeline. Use a different variable name.`
  Primary source: the time identifier.
- Nested loops are rejected during parsing by `AMX3006`, message
  `No nested loops are allowed inside a diagram`, anchored at the inner
  `for`.
- `AMXD013` is reserved for the existing authored 512-elements-per-report
  limit. It must not be used for generated output.

## Overflow Diagnostic: Blocking Allocation

S110 evidence says the cap-overflow identity/message/anchor is NOT ALLOCATED.
The Lead Developer must allocate it before S111 implementation. The
allocation must answer:

- Is overflow a user-facing AMX diagnostic at diagram model creation or a
  host/resource failure? Use an AMX diagnostic only with explicit allocation.
- Exact stable code and exact message, including the accepted per-evaluated-
  diagram cap of 64 control-originating emissions.
- Exact primary source anchor: recommended at the primitive declaration
  responsible for the first (65th) control-originating emission, with any
  control-header secondary location decided explicitly.
- Exact failure timing: before the 65th primitive is appended or evaluated.
- File/test owners and whether the same identity covers loop and conditional
  emissions.

Do not infer a code from nearby unused numeric space. `AMXD6002` and
`AMXD6003` were explicitly declined in S110; `AMXD013` remains unavailable.

## Resource Gate D111-02

The selected cap bounds output cardinality only. It does not bound the number
of loop iterations or condition evaluations. The existing loop evaluator
accepts arrays and ranges; range evaluation currently materializes all values
before iteration. Test empty/false/low-emission bodies at increasing input
sizes and record wall time/allocation behavior. Establish any applicable
pre-existing data/range bound. If the evaluation remains unbounded, request a
separate product decision before claiming the V0.18 feature is resource
bounded. Do not add a new iteration cap or short-circuit semantics without
approval.

## Scope and Location Rules

- Cap state is local to one `createDiagramModel` evaluation and resets for
  each diagram model.
- Count only emitted primitives originating inside `for` or selected
  conditional blocks. A loop iteration with no primitive output consumes no
  generated element count, though it still consumes traversal work.
- A direct primitive outside all control blocks does not consume the
  generated cap, even when other controls exist in the same diagram.
- Use source locations retained by the S110 AST. Report overflow at the
  first excess instance's originating primitive location; do not synthesize
  a source-level name for that instance.
- Time-dependent property errors retain the authored property location and
  existing `AMXD008`-`AMXD011`/`AMXD009` behavior where applicable.
- S110's `AMXD6001` remains a static checking error. S111 should not add
  duplicate runtime control-time checks except defensive invariants required
  by the approved plan.

## Serialization Gate

S112 owns production serialization/deserialization of expanded membership and
per-instance environments. Before S111 removes the current fail-closed
evaluation check, the approved implementation plan must prove that
control-bearing scene models cannot silently reach a browser path that loses
bindings. Keep no-control serialization unchanged. Do not edit the generated
browser runtime in S111.