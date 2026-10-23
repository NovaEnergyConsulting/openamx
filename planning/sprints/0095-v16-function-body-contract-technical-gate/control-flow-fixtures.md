# Sprint 095 Control-Flow and Value Fixtures

## Status

These stable planning fixtures describe proposed implementation tests; they
are not evidence that the current parser or runtime accepts braced functions.
All AMX snippets are complete source envelopes, with 1-based line/column
coordinates measured inside each snippet and excluding Markdown fences. The
product owner accepted the contract on 2026-10-23.

`V16-FN-TYPE-01` aliases `V16-FN-FLOW-02`; `V16-FN-TYPE-02` aliases
`V16-FN-FLOW-08`. The aliases are traceability IDs, not additional tests.
`V16-FN-RUNTIME-01` is an evaluator-harness case, and `V16-FN-LIST-04` is a
contract boundary, not executable AMX.

## Return Flow

### `V16-FN-EXPR-01` - Expression-body compatibility

```amx
fn triple(value: Number): Number = value * 3
let result = triple(4)
```

Expected: parses, checks, and evaluates as before; `result = 12`. Owner:
Sprints 096-098.

### `V16-FN-FLOW-01` - Both branches return

```amx
fn choose(value: Number): Number {
  if value > 0 {
    return value
  } else {
    return 0
  }
}
let positive = choose(3)
let other = choose(0)
```

Expected: all paths return `Number`; results are `3` and `0`. Owner:
Sprints 096-098.

### `V16-FN-FLOW-02` - Missing alternate branch

```amx
fn maybe(value: Number): Number {
  if value > 0 {
    return value
  }
}
```

Expected: `AMXF4001: Missing return value from function` at the function
closing brace, line 5, column 1. `AMX3021` remains specific to braced-if
expressions. Owner: Sprint 098.

### `V16-FN-FLOW-03` - Partial return closed by later return

```amx
fn choose(value: Number): Number {
  if value > 0 {
    return value
  }
  return 0
}
let positive = choose(2)
let other = choose(0)
```

Expected: all paths return; results are `2` and `0`. Owner: Sprints 096-098.

### `V16-FN-FLOW-04` - Return from a nested conditional

```amx
fn select(value: Number): Number {
  if value > 0 {
    if value > 10 {
      return 10
    } else {
      return value
    }
  } else {
    return 0
  }
}
let result = select(4)
```

Expected: the nested statement return exits the function; `result = 4`.
Owner: Sprints 096-098.

### `V16-FN-FLOW-05` - Return in a possibly empty loop

```amx
fn first(values: Number[]): Number {
  for value in values {
    return value
  }
}
```

Expected: `AMXF4001` at the closing brace because an empty input falls
through. For nonempty input, an executed loop return exits the function.
Owner: Sprints 096-098.

### `V16-FN-FLOW-06` - Loop followed by fallback return

```amx
fn firstOrDefault(values: Number[]): Number {
  for value in values {
    return value
  }
  return 0
}
let emptyResult = firstOrDefault([])
let nonemptyResult = firstOrDefault([7, 8])
```

Expected: results are `0` and `7`; the loop return exits on the first
iteration. Owner: Sprints 096-098.

### `V16-FN-FLOW-07` - Valid statement after return

```amx
fn result(): Number {
  let values = [1]
  return 5
  add 2 to values
}
let value = result()
```

Expected: `value = 5`; the mutation is statically checked but does not execute
at runtime. Owner: Sprints 097-098.

### `V16-FN-FLOW-08` - Incompatible explicit return

```amx
fn invalid(value: Number): Number {
  if value > 0 {
    return "positive"
  } else {
    return 0
  }
}
```

Expected: `AMX3002: Expected Number, got String` at the string expression,
line 3, column 12. Owner: Sprint 098.

### `V16-FN-FLOW-09` - Expression-loop collection remains unchanged

```amx
let values = for item in [2, 3] {
  return item * 2
}
```

Expected: the result remains `[4, 6]`; the return contributes one value per
iteration and is not a function-exit signal. Expression-form loops remain
prohibited inside functions under D-095-15. Owner: Sprints 097-098.

### `V16-FN-FLOW-10` - Unreachable explicit return is still type-checked

```amx
fn result(): Number {
  return 5
  return "unreachable"
}
```

Expected: static type failure at the second return expression because every
explicit return is checked, including unreachable returns. Runtime returns
`5`. Owner: Sprints 097-098.

### `V16-FN-FLOW-11` - Braced-if expression returns remain local

```amx
fn choose(value: Number): Number {
  let selected: Number = if value > 0 {
    return 1
  } else {
    return 0
  }
  return selected + 10
}
let result = choose(1)
```

Expected: `result = 11`; the branch returns supply the braced-if expression
value under V0.12 rules, then execution continues to the function return. This
differs from a return statement in a statement-form `if` body, which exits the
function. Owner: Sprints 096-098.

### `V16-FN-FLOW-12` - Invalid unreachable non-return is still checked

```amx
fn result(): Number {
  return 5
  missing = 1
}
```

Expected: `AMX3001: Unknown identifier 'missing'` at the assignment target,
line 3, column 3, even though runtime never reaches it. Owner: Sprint 098.

## Scope and List Values

### `V16-FN-SCOPE-01` - Parameter rebinding is call-local

```amx
fn localValue(value: Number): Number {
  value = value + 1
  return value
}
let original = 4
let result = localValue(original)
```

Expected: `result = 5`; `original = 4`. Owner: Sprint 097.

### `V16-FN-SCOPE-02` - Branch locals do not escape

```amx
fn scoped(value: Number): Number {
  if value > 0 {
    let local = 8
  } else {
    let local = 9
  }
  return value
}
let result = scoped(1)
```

Expected: `result = 1`; neither branch-local binding is visible outside its
block. Same-name declarations in sibling branch scopes are legal. Owner:
Sprints 096-098.

### `V16-FN-SCOPE-03` - Assignment and compound assignment update outer local

```amx
fn change(value: Number): Number {
  let result = value
  if true {
    result = 2
    result += 1
  }
  return result
}
let result = change(1)
```

Expected: `result = 3`; both assignment forms update the existing enclosing
local. Owner: Sprints 096-098.

### `V16-FN-SCOPE-04` - Loop iterator is scoped and restored

```amx
fn preserve(value: Number): Number {
  for value in [7] {
    let observed = value
  }
  return value
}
let result = preserve(2)
```

Expected: `result = 2`; the loop iterator shadows and restores the parameter.
Owner: Sprints 096-098.

### `V16-FN-SCOPE-05` - Repeated let updates in the same scope

```amx
fn repeated(value: Number): Number {
  let result = value
  let result = result + 1
  return result
}
let result = repeated(4)
```

Expected: `result = 5`; same-scope repeated `let` updates the current local.
Owner: Sprints 096-098.

### `V16-FN-SCOPE-06` - Nested local shadows a parameter

```amx
fn shadow(value: Number): Number {
  if true {
    let value = 7
    let observed = value
  }
  return value
}
let result = shadow(2)
```

Expected: `result = 2`; the inner binding shadows only inside the branch.
Owner: Sprints 096-098.

### `V16-FN-LIST-01` - Nested list argument isolation

```amx
fn change(values: Number[][]): Number[][] {
  for row in values {
    add row, 9
  }
  return values
}
let input = [[1], [2]]
let result = change(input)
```

Expected: caller `input` remains `[[1], [2]]`; `result` is `[[1, 9], [2, 9]]`.
This falsifies an outer-list-only copy. Owner: Sprint 097.

### `V16-FN-LIST-02` - Repeated argument gets independent parameter copies

```amx
fn changeOne(first: Number[], second: Number[]): Number[] {
  add first, 9
  return second
}
let input = [1]
let result = changeOne(input, input)
```

Expected: `result = [1]` and `input = [1]`; mutating `first` cannot affect
`second` or the caller. Owner: Sprint 097.

### `V16-FN-LIST-03` - Local list mutation and return

```amx
fn build(value: Number): Number[] {
  let values = [value]
  add values, 2
  remove 1 from values
  return values
}
let result = build(1)
```

Expected: `result = [1]` under the existing remove-from-end behavior. The
returned local list is the call result without another copy. Owner:
Sprints 096-097.

### `V16-FN-LIST-04` - Non-list aggregate elements are opaque

Approved boundary under D-095-11: recursively copy array values only. Do not
traverse record fields or clone record/measurement elements, and do not infer
mutation through shared non-list values. This is a contract boundary, not an
executable object-copy fixture. Sprint 097 owns implementation and tests.

## Negative and Boundary Fixtures

### `V16-FN-PARSE-01` - Malformed statement

```amx
fn broken(value: Number): Number {
  let = value
  return value
}
```

Expected: `AMX3006: Invalid syntax in function body` at the offending `=`
token, line 2, column 7. Owner: Sprint 096.

### `V16-FN-PARSE-02` - Unclosed function body

```amx
fn broken(value: Number): Number {
  return value
```

Expected: `AMX3006: Unclosed function body` at the opening `{`, line 1,
column 34. Owner: Sprint 096.

### `V16-FN-PARSE-03` - Prohibited declaration in function body

The following subcases each wrap the listed statement in a function body and
end with `return 0`. Every prohibited statement is a parse error with
`AMX3006: The '{keyword}' statement is not allowed in a function body.`

#### `V16-FN-PARSE-03a` - Import declaration

```amx
fn broken(): Number {
  import { value } from "./library.amx"
  return 0
}
```

#### `V16-FN-PARSE-03b` - Export declaration

```amx
fn broken(): Number {
  export let value: Number = 1
  return 0
}
```

#### `V16-FN-PARSE-03c` - Type declaration

```amx
fn broken(): Number {
  type Local {
    amount: Number
  }
  return 0
}
```

#### `V16-FN-PARSE-03d` - Enum declaration

```amx
fn broken(): Number {
  enum Local = {
    Amount
  }
  return 0
}
```

#### `V16-FN-PARSE-03e` - Dimension declaration

```amx
fn broken(): Number {
  dimension length
  return 0
}
```

#### `V16-FN-PARSE-03f` - Unit declaration

```amx
fn broken(): Number {
  unit meter: Length
  return 0
}
```

#### `V16-FN-PARSE-03g` - Input declaration

```amx
fn broken(): Number {
  input amount: Number
  return 0
}
```

#### `V16-FN-PARSE-03h` - Table declaration

```amx
type Row {
  id: String
}
let rows: Row[] = []
fn broken(): Number {
  table report = table(rows) {
    title: "Rows"
    column id as "ID"
  }
  return 0
}
```

#### `V16-FN-PARSE-03i` - Chart declaration

```amx
let values: Number[] = []
fn broken(): Number {
  chart report = bar(values) {
    title: "Rows"
    series "Value"
  }
  return 0
}
```

#### `V16-FN-PARSE-03j` - Diagram declaration

```amx
fn broken(): Number {
  diagram report {
    title: "Report"
    width: 100
    height: 100
  }
  return 0
}
```

#### `V16-FN-PARSE-03k` - Output action

```amx
type Row {
  id: String
}
let rows: Row[] = []
table report = table(rows) {
  title: "Rows"
  column id as "ID"
}
fn broken(): Number {
  show report
  return 0
}
```

#### `V16-FN-PARSE-03l` - Re-export declaration

```amx
fn broken(): Number {
  export { value }
  return 0
}
```

### `V16-FN-TYPE-01` - Missing return path

Alias of `V16-FN-FLOW-02`; do not execute as a second test.

### `V16-FN-TYPE-02` - Incompatible return value

Alias of `V16-FN-FLOW-08`; do not execute as a second test.

### `V16-FN-TYPE-03` - Block local escapes its scope

```amx
fn invalid(value: Number): Number {
  if value > 0 {
    let local = value
  }
  return local
}
```

Expected: `AMX3001: Unknown identifier 'local'` at line 5, column 10. Owner:
Sprint 098.

### `V16-FN-TYPE-04` - Assignment to undeclared name

```amx
fn invalid(): Number {
  missing = 1
  return 0
}
```

Expected: `AMX3001: Unknown identifier 'missing'` at line 2, column 3.
Owner: Sprint 098.

### `V16-FN-TYPE-05` - Return outside function context

```amx
return 1
```

Expected: `AMX3006: Return is only valid inside a function or expression-form
loop` at line 1, column 1. Owner: Sprint 096.

### `V16-FN-RUNTIME-01` - Defensive fallthrough guard

This is an evaluator-level harness case that deliberately constructs or
injects an invalid statement-body function after static checking. It is not
valid AMX source. Expected: runtime failure, never a success-shaped value.
The exact diagnostic identity/message is a Sprint 097 residual.

## Visibility and Declaration-Order Compatibility

### `V16-FN-COMPAT-01` - Earlier function remains visible

```amx
fn double(value: Number): Number = value * 2
fn result(): Number {
  return double(3)
}
let value = result()
```

Expected: `value = 6`; braced bodies retain established source-order
visibility. Owner: Sprints 096-098.

### `V16-FN-COMPAT-02` - Forward function reference remains invalid

```amx
fn first(): Number = later()
fn later(): Number = 2
```

Expected: `AMX3004: Unknown function 'later'` at the call in the first
declaration. Owner: Sprint 098.

### `V16-FN-COMPAT-03` - Recursion remains unsupported

```amx
fn repeat(value: Number): Number {
  return repeat(value)
}
```

Expected: `AMX3004: Unknown function 'repeat'` at the recursive call. Owner:
Sprint 098.

### `V16-FN-COMPAT-04` - Functions do not capture document bindings

```amx
let outside = 4
fn capture(): Number {
  return outside
}
```

Expected: `AMX3001: Unknown identifier 'outside'`; functions do not capture
document bindings. Owner: Sprint 098.

### `V16-FN-COMPAT-05` - Exported braced function remains importable

`library.amx`:

```amx
export fn double(value: Number): Number {
  return value * 2
}
```

`entry.amx`:

```amx
import { double } from "./library.amx"
let result = double(4)
```

Expected: `result = 8`; the braced body does not change module
export/import visibility. Owner: Sprints 096-098 and module integration in
101.
