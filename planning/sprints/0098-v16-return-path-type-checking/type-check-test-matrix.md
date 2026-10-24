# Sprint 098 Type-Check Test Matrix

## Status and Authority

This matrix maps accepted Sprint 095 fixtures to type-checker evidence.
Sprint 096 and 097 are accepted; Sprint 098 implementation remains pending
separate execution authorization. Fixture source and diagnostic expectations
in Sprint 095 remain authoritative.

Recommended test home: `tests/functionBodyTypeChecking.test.ts`, subject to
the approved file plan. Parse complete source with `parseDocumentText` and
call `checkDocument`; assert `AmxError` code, exact message, and source point.

## Return-Path Cases

| Case ID | Contract fixture(s) | Expected checker result | Required assertion |
| --- | --- | --- | --- |
| `TC098-FLOW-01` | `V16-FN-FLOW-01` | Both if/else paths return; valid. | No diagnostic; function declaration checked. |
| `TC098-FLOW-02` | `V16-FN-FLOW-02` / alias `V16-FN-TYPE-01` | Missing else means false-path fallthrough. | `AMXF4001`, `Missing return value from function`, closing brace at line 5 column 1. |
| `TC098-FLOW-03` | `V16-FN-FLOW-03` | Later return completes conditional fallthrough. | Valid; both call declarations typecheck. |
| `TC098-FLOW-04` | `V16-FN-FLOW-04` | Nested branches all return. | Valid; nested flow summary composes. |
| `TC098-FLOW-05` | `V16-FN-FLOW-05` | Return in possibly empty loop is insufficient. | `AMXF4001` at closing brace. |
| `TC098-FLOW-06` | `V16-FN-FLOW-06` | Loop may be empty but later fallback returns. | Valid; loop itself contributes fallthrough. |
| `TC098-FLOW-07` | `V16-FN-FLOW-07` | Unreachable valid mutation is still checked. | Valid; no unreachable warning. |
| `TC098-FLOW-08` | `V16-FN-FLOW-08` / alias `V16-FN-TYPE-02` | Explicit return type incompatible. | `AMX3002: Expected Number, got String`, line 3 column 12. |
| `TC098-FLOW-09` | `V16-FN-FLOW-10` | Unreachable explicit return remains type-checked. | `AMX3002` at second return's string expression; no missing-return diagnostic. |
| `TC098-FLOW-10` | `V16-FN-FLOW-11` | Braced-if expression's local returns satisfy expression, not function flow. | Valid; later outer function return completes function. |
| `TC098-FLOW-11` | `V16-FN-FLOW-12` | Unknown assignment after return is still checked. | `AMX3001: Unknown identifier 'missing'`, line 3 column 3. |
| `TC098-FLOW-12` | New minimal single-statement function | Direct return completes function. | Valid; also test each declared return type family where applicable. |
| `TC098-FLOW-13` | Nested partial-if fixture below | Inner `if` without else leaves a path open; later return closes it. | Valid; exercise nested partial branch composition. |
| `TC098-FLOW-14` | Same nested fixture without its final `return 2` | The `a && !b` path reaches closing brace. | `AMXF4001` at closing brace. |
| `TC098-FLOW-15` | Empty statement body `fn empty(): Number {}` if accepted by Sprint 096 parser | Empty sequence falls through. | `AMXF4001` at closing brace; if empty bodies are parser-invalid, record as parser-owned and omit this checker assertion. |

## Return-Type Cases

| Case ID | Source shape | Expected result |
| --- | --- | --- |
| `TC098-TYPE-01` | `Number` return from `Number` function | Valid. |
| `TC098-TYPE-02` | Wrong scalar return type | `AMX3002` at return expression. |
| `TC098-TYPE-03` | `null` return for nullable result | Valid; incompatible non-nullable `null` rejected by standard assignability. |
| `TC098-TYPE-04` | List return compatible/incompatible element type | Existing recursive assignability rules apply at explicit return. |
| `TC098-TYPE-05` | Measurement return with compatible/incompatible dimensions | Compatible dimensions pass; incompatible measurement types fail with existing `AMX3007` wording from `requireType`. |
| `TC098-TYPE-06` | Multiple returns of different compatible/incompatible types | Check each against the declared return type, not merely a merged branch type. |

## Scope and Compatibility Cases

| Case ID | Contract fixture(s) | Expected checker result | Required assertion |
| --- | --- | --- | --- |
| `TC098-SCOPE-01` | `V16-FN-SCOPE-02` | Same-name locals in sibling branch scopes are legal and do not escape. | No duplicate leak; branches isolated. |
| `TC098-SCOPE-02` | `V16-FN-SCOPE-03` | Assignment/`+=` target resolves to outer local. | Valid; type rules enforced. |
| `TC098-SCOPE-03` | `V16-FN-SCOPE-04` | Loop iterator shadows/restores parameter type. | Valid; later parameter use retains original type. |
| `TC098-SCOPE-04` | `V16-FN-SCOPE-05` | Same-scope repeated `let` updates existing type. | Valid when reassignment is compatible; mismatch fails. |
| `TC098-SCOPE-05` | `V16-FN-SCOPE-06` plus the cross-type shadow fixture below | Nested local may shadow parameter with a different type and does not escape. | Inner use is `String`; post-block use/return is outer `Boolean`. |
| `TC098-SCOPE-06` | `V16-FN-TYPE-03/04` | Out-of-scope reference/unknown assignment target remains an error. | `AMX3001` at identifier/target. |
| `TC098-COMPAT-01` | `V16-FN-COMPAT-01` through `05` | Source order, exports/imports, no captures, no forward refs/recursion unchanged. | Existing AMX3001/AMX3004 identities and locations preserved. |
| `TC098-CONTEXT-01` | `V16-FN-FLOW-09` | Expression-loop collection behavior is unchanged. | Existing list-of-results type inferred. |
| `TC098-CONTEXT-02` | `V16-FN-FLOW-11` | Braced-if expression return remains expression-local. | `AMX3021` remains expression-only; no `AMXF4001` false positive when later function return exists. |
| `TC098-RUNTIME-01` | Sprint 097 runtime evidence | Runtime fallthrough guard remains defensive. | Existing `AMXF4002` test unchanged; static `AMXF4001` rejects invalid source before runtime. |

## Additional Exact Fixtures

### `TC098-FLOW-13/14` - Nested partial branch

Valid form:

```amx
fn nested(a: Boolean, b: Boolean): Number {
  if a {
    if b {
      return 1
    }
  } else {
    return 0
  }
  return 2
}
```

For `TC098-FLOW-14`, remove only the final `return 2`. The `a == true,
b == false` path then reaches the function close and must receive `AMXF4001`.

### `TC098-SCOPE-05` - Cross-type nested shadow

```amx
fn shadow(value: Boolean): Number {
  if true {
    let value: String = "inner"
    let observed: String = value
  }
  return if value then 1 else 0
}
```

The nested binding is `String`; after its block closes, `value` resolves to
the `Boolean` parameter. The function's return is `Number`.

## Test Assertions and Source Rules

- Assert exact diagnostic code, exact user-facing message, and 1-based
  line/column from the full AMX fixture source. For the accepted raw snippets,
  preserve documented lines/columns; when fenced documents are used, include
  fence offsets in expected document locations.
- For every negative function-flow case, assert there is exactly the
  intended primary diagnostic and it points to the closing brace or return
  expression as approved; do not accept a nearby parser/checker error.
- Ensure an invalid return does not mask a separate unreachable invalid
  statement when the checker is designed to report only the first error;
  separately verify each reachable checker path. Do not claim aggregate
  diagnostics unless the existing checker contract supports them.
- Test LF/CRLF equivalence for at least one missing-return location and one
  incompatible-return location.
- Keep `AMX3021` braced-if-expression tests, `AMXF4002` runtime tests, and
  expression-body tests as independent regression guards.