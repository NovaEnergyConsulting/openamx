# Sprint 095 Draft: Control-Flow and Value Fixtures

## Status

These fixtures define the minimum executable contract coverage. The examples
are proposed AMX source envelopes for Sprint 095 review; they are not claims
that the current parser or runtime accepts braced functions. Confirm exact
syntax and source ranges before locking them. Fixture IDs are stable planning
identifiers, not test names or diagnostic codes.

## Return Flow

Each code block is the complete executable snippet for that fixture.

### `V16-FN-EXPR-01` - Expression-body compatibility

```amx
fn triple(value: Number): Number = value * 3
let result = triple(4)
```

Expected: parse and type-check as before; evaluation produces `result = 12`.
Owner: Sprint 096 parser, Sprint 097 runtime, Sprint 098 type checker.

### `V16-FN-FLOW-01` - Both branches return

```amx
fn choose(value: Number): Number {
  if value > 0 {
    return value
  } else {
    return 0
  }
}
let result = choose(3)
```

Expected: all paths return `Number`; result is `3`. The alternate call with
`0` must return `0`. Owner: Sprints 096-098.

### `V16-FN-FLOW-02` - Missing alternate branch

```amx
fn maybe(value: Number): Number {
  if value > 0 {
    return value
  }
}
```

Expected: type-check failure because the false path falls through. Record the
approved diagnostic and primary range. Owner: Sprint 098.

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

Expected: all paths return; outputs are `2` and `0`. The first conditional
does not terminate the entire function by itself. Owner: Sprints 096-098.

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

Expected: the nested return exits the function, not merely the nested block;
`result = 4`. Owner: Sprints 096-098.

### `V16-FN-FLOW-05` - Return in a possibly empty loop

```amx
fn first(values: Number[]): Number {
  for value in values {
    return value
  }
}
```

Expected: type-check failure because an empty `values` list reaches the end.
At runtime for non-empty input, a return executed by the loop must exit the
function. Owner: Sprints 096-098.

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

Expected: all paths return; results are `0` and `7`. The first loop return
exits the call rather than continuing to a later iteration. Owner:
Sprints 096-098.

### `V16-FN-FLOW-07` - Statement after return

```amx
fn result(): Number {
  let values = [1]
  return 5
  add values, 2
}
let value = result()
```

Expected: `value = 5`; the later mutation does not execute. Sprint 095 must
decide and record the static treatment of unreachable non-return statements.
Owner: Sprint 098; runtime confirmation in Sprint 097.

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

Expected: type-check failure at the incompatible return expression. Owner:
Sprint 098.

### `V16-FN-FLOW-09` - Expression-loop collection remains unchanged

```amx
let values = for item in [2, 3] {
  return item * 2
}
```

Expected: expression-loop result remains `[4, 6]`; its return nodes collect
values and do not exit an enclosing function. Owner: Sprint 097 compatibility
test; Sprint 098 static-check fixture.

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

### `V16-FN-SCOPE-02` - Block local does not escape

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

Expected: result is `1`; neither branch-local binding is visible outside its
block. Confirm legal same-name shadowing and update behavior under D-095-03.
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

Expected: `input` remains `[[1], [2]]`; `result` is `[[1, 9], [2, 9]]`. This
must fail if only the outer list is copied. Owner: Sprint 097.

### `V16-FN-LIST-02` - Repeated argument gets independent parameter copies

```amx
fn changeOne(first: Number[], second: Number[]): Number[] {
  add first, 9
  return second
}
let input = [1]
let result = changeOne(input, input)
```

Expected: `result = [1]` and `input = [1]`; mutating `first` does not change
`second` or the caller value. Owner: Sprint 097.

### `V16-FN-LIST-03` - Local list mutation and return

```amx
fn build(value: Number): Number[] {
  let values = [value]
  add values, 2
  remove values, 1
  return values
}
let result = build(1)
```

Expected: `result = [1]` under the existing one-based list-operation
contract. The one-argument remove form removes one item from the end. Confirm
exact syntax against the accepted statement grammar. Owner: Sprints 096-097.

## Negative and Boundary Fixtures

### `V16-FN-PARSE-01` - Malformed statement

```amx
fn broken(value: Number): Number {
  let = value
  return value
}
```

Expected: parse failure anchored at the malformed declaration. Owner: Sprint
096.

### `V16-FN-PARSE-02` - Unclosed function body

```amx
fn broken(value: Number): Number {
  return value
```

Expected: parse failure at the approved opening-brace or EOF location. Owner:
Sprint 096.

### `V16-FN-PARSE-03` - Prohibited declaration in function body

```amx
fn broken(value: Number): Number {
  type Local {
    amount: Number
  }
  return value
}
```

Expected: rejected as outside the function-body contract. The final fixture
must include representatives for module/document declarations and output
actions, or map this ID to a table of focused subcases. Owner: Sprints 096/098.

### `V16-FN-TYPE-01` - Missing return path

```amx
fn incomplete(value: Number): Number {
  if value > 0 {
    return value
  }
}
```

Expected: static missing-return diagnostic because the false path falls
through. Owner: Sprint 098.

### `V16-FN-TYPE-02` - Incompatible return value

```amx
fn invalid(value: Number): Number {
  if value > 0 {
    return "positive"
  } else {
    return 0
  }
}
```

Expected: static type error at the incompatible return expression. Owner:
Sprint 098.

### `V16-FN-TYPE-03` - Block local escapes its scope

```amx
fn invalid(value: Number): Number {
  if value > 0 {
    let local = value
  }
  return local
}
```

Expected: static undefined/out-of-scope diagnostic at `local`. Owner: Sprint
098.

### `V16-FN-TYPE-04` - Assignment to undeclared name

```amx
fn invalid(): Number {
  missing = 1
  return 0
}
```

Expected: static assignment-target/undefined-name diagnostic at `missing`.
Owner: Sprint 098.

### `V16-FN-TYPE-05` - Return outside function context

```amx
return 1
```

Expected: reject a return that is not in a braced function or an established
expression-form loop. Preserve `V16-FN-FLOW-09`. Owner: Sprints 096/098.

### `V16-FN-RUNTIME-01` - Defensive fallthrough guard

This case requires a focused evaluator-level test harness that deliberately
constructs or injects an invalid statement-body function after static
checking. It is not a valid AMX source fixture.

Expected: runtime failure, never a success-shaped value. Owner: Sprint 097.

Sprint 095 must turn every row into a complete source envelope, calculate
exact diagnostic ranges, assign stable diagnostic identities through
disposition, and ensure IDs/outcomes agree with both matrices.