# Sprint 112 Serialized Diagram Model Contract

## Status

This is the proposed S112 wire/runtime contract, based on the accepted S111
model. Concrete envelope version and binding-value decisions require review
under D112-01 and D112-03 before implementation.

## Required Serialized Information

A control-bearing model must round-trip enough information to reproduce its
already-expanded model, not to rerun the source controls. The serialized
payload must preserve:

- Existing scene metadata, timeline bounds/duration, declaration and source
  locations, initial frame, file/report positions, and captured AMX context.
- The ordered expanded-instance list. Each instance has an internal unique
  model-local identity, a reference/representation of the originating
  primitive node and its source locations, and its captured loop bindings.
- For a repeated loop body primitive, one serialized instance per emitted
  occurrence with distinct binding values and ordered identity.
- Control-originating versus direct-origin status if needed for diagnostics,
  inspection, or S111 invariants; no generated source-level name/reference.

The instance list is authoritative after deserialization. Do not reevaluate
conditions or iterables; current host inputs may differ from the inputs used
when the model was created.

## Envelope and Compatibility

The current serialized envelope is version 1 with `model` and `context`.
S111 rejects control-bearing models because expanded descriptors live in a
model-keyed `WeakMap` and are not serialized.

**Recommended policy for disposition:** introduce a new envelope version for
payloads that carry expanded instance data; continue deserializing version 1
no-control models using their declaration content; reject version 1
control-bearing models as incomplete; reject unknown versions with a
deterministic error. The writer may emit the new version for all models or
only control-bearing models, as decided in D112-01. In either case, verify
old static version 1 round trips.

Do not silently expand controls while reading an old payload. The model's
original evaluation environment and input binding state may no longer be
available or may not match the serialized scene.

## Instance Encoding Options

Choose one representation and validate it fully:

1. **Primitive-node descriptor:** serialize the originating
   `DiagramElementNode` with identity and bindings. This is straightforward
   and preserves its full source node, but duplicates AST data for repeated
   instances and increases payload size.
2. **Validated source locator:** serialize a stable path/index into the
   declaration's recursive content plus identity and bindings; resolve it
   against the deserialized declaration. This avoids repeating primitive
   properties, but locator semantics must be stable, validated, and able to
   distinguish repeated emissions from one source node.

Either encoding must preserve original primitive source locations and
instance emission order. Internal identity is unique within one model only;
no cross-model stability or public lookup API is introduced.

## Binding Values and Validation

- Serialize every loop variable name and its actual captured value. Do not
  serialize the mutable expansion environment as a substitute for each
  instance's lexical binding.
- Use the established tagged value serializer where its value semantics are
  verified. Cover supported scalar, list, enum, record, and measurement
  values as applicable to iterable element types. Verify that deserialized
  values retain the structure and arithmetic/type behavior required by
  property evaluation.
- Reject malformed descriptors, duplicate/invalid identities if prohibited
  by the chosen contract, invalid binding records, unresolved source
  locators, unsupported values, cyclic values, and malformed envelopes
  deterministically. Do not silently drop instances or bindings.
- Preserve declaration registries and environment binding types already
  needed by current static diagram round trips.
- Treat serialized HTML payloads as data. Do not evaluate code from payload
  fields or relax offline/CSP behavior.

## Frame-Parity Invariant

For a model `M`, let `frames(M, T)` denote ordered frames evaluated at the
same requested times `T`. After serialize/deserialize, the semantic frame
elements must match in membership, order, primitive values, source locations,
and frame-dependent properties:

$$
\operatorname{frames}(M, T) =
\operatorname{frames}(\operatorname{deserialize}(\operatorname{serialize}(M)), T)
$$

Compare semantic frame fields, not object identity. Separately assert
per-instance iterator values are distinct and no control expression is
reevaluated during round-trip or frame evaluation.