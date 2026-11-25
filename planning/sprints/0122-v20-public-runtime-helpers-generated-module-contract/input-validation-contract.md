# Sprint 122 Runtime Input Validation Contract

## Status

Architect-prepared proposal. Preserve D121-10 and D121-16. The exact public
descriptor and helper signatures are to be dispositioned before implementation;
the validation rules below follow the accepted S121 contract and current
`runtime/inputData.ts` behavior.

## Direct `run(inputs)` Validation

- `run(inputs)` accepts one caller-supplied object. It does not read files,
  prompt, inspect environment, or apply CLI input mappings.
- The top level must be a non-null, non-array object with exactly the declared
  entry input keys. Missing and unknown keys reject before any AMX statement
  executes.
- Errors carry `inputPath`, expected type, actual type, and the accepted
  `AMX4003` code. Nested paths use escaped JSON Pointer segments (`~0`, `~1`)
  or another single accepted stable format; record that exact format in the
  public type docs and fixture assertions.
- Validation is recursive and returns a normalized, detached runtime value.
  It does not return the original object for mutation by generated code.

## Candidate Public Type Descriptor

The generated entry may emit a compact schema consumed by a generic helper.
Candidate discriminants:

| Descriptor | Required data and validation |
| --- | --- |
| `number` | Finite JavaScript Number only. |
| `string` | String only. |
| `boolean` | Boolean only. |
| `dateTime` | String accepted by current RFC 3339 validation; preserve the exact text. |
| `enum` | Enum name and readonly resolved primitive member values; accept only exact string/number members. |
| `measurement` | Dimension name/vector and only visible compatible unit descriptors; input is exact `{ value, unit }`, finite value, finite physical result. |
| `nullable` | Nested descriptor; `null` accepted only when declared nullable. |
| `list` | Element descriptor; preserve order and recursively validate every element. |
| `record` | Record name and declaration-ordered field descriptors, including required/optional/default policy. Reject unknown keys. |

Candidate generic helper:

```ts
validateAMXValue<T>(value: unknown, descriptor: AMXInputDescriptor<T>, context: AMXSourceContext): T
```

Keep the existing low-level `requireAMX*` functions as compatibility helpers;
the generated schema helper must compose or reuse them rather than create a
second set of primitive rules.

## Field Presence, Defaults, and Enums

- An explicitly present `null` is different from an absent key.
- Missing field with a declared default evaluates its generated default
  factory in declaration order. The factory uses the current checked AMX
  default expression result; it is not evaluated from source text by the
  helper.
- Missing optional field without a default materializes as `null`, per the
  accepted S121 input contract. Missing required fields fail. The fixture
  asserts this even when the field's declared type is nullable.
- Unknown record keys reject at their nested input path. Do not silently drop
  caller data.
- Enum descriptors contain resolved primitive values, not unresolved source
  expressions. Both numeric and string enum values are supported; reject a
  value with a different primitive type or a nonmember value.
- Enums validate recursively in nested lists and records, including nullable
  fields and defaults. S121 focused file-input tests do not alone prove direct
  generated helper parity.

## Measurement Inputs

- Preserve the exact external shape `{ value, unit }`; reject missing/extra
  fields, arrays, raw numbers, unknown units, incompatible dimensions,
  nonfinite values, nonpositive/nonfinite unit scale, nonfinite offset, and
  nonfinite physical results.
- The helper resolves unit text only against the generated entry's explicit
  visible unit table. It does not inspect the filesystem or global SI registry.
- Normalize to the internal measurement representation while retaining the
  caller's selected display unit. Do not serialize scale/offset or canonical
  physical values into input/output JSON.
- Dimension identity is authoritative; matching display names alone is not
  sufficient.

## File-Backed JSON/CSV Boundary

- The existing AMX JSON/CSV validator remains its own public product-runtime
  path. S122 verifies the D121-16 enum changes across imported enum types,
  nested record/list fields, defaults, nullable fields, CSV and JSON, invalid
  values, and AMX4003 diagnostics.
- Direct generated `run(inputs)` schema validation is tested separately using
  the public helper subpath. A file-backed validator pass is not used as a
  substitute for generated direct-input validation, or vice versa.
- Any discrepancy in accepted defaults, optional fields, enum member values,
  or measurement shape becomes a blocking compatibility decision; do not
  silently maintain two behaviors.

## Required Negative Cases

- Null/array top-level input, missing key, unknown key, wrong primitive,
  nonfinite Number, malformed DateTime.
- Unknown/wrong-type enum member; numeric enum supplied as string and string
  enum supplied as number.
- Invalid nested enum in a record/list, absent defaulted field, nullable null,
  absent required nullable field, and unknown nested field.
- Measurement with a third key, missing key, raw number, unknown unit, wrong
  dimension, infinite value, nonfinite physical result, or invalid descriptor.
- Every failure asserts the exact error class, code, input path, expected/actual
  fields, and that no evaluation result or view snapshot was produced.