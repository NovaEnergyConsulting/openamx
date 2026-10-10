# Sprint 072 Grammar Examples

These are acceptance fixtures for planned V0.12 behavior, not evidence that the behavior is implemented. The V0.12 master plan controls semantics; the existing language-feature idea supplies the example spellings for `extends`, `override`, enums, and braced `if`.

## Fixture format and expectations

- Each `text` block is the complete source document for the named fixture. The YAML front matter and inner `amx` fence are part of the source and are included in all diagnostic coordinates. The outer Markdown fence is presentation only.
- Source positions are 1-based. Columns count UTF-16 code units. The examples use ASCII source so the displayed columns are also straightforward character counts.
- `Expected valid` and `Expected invalid` describe the future contract only. No result below is claimed as implemented or verified.
- `AMX3006` is used only for malformed syntax; existing catalog identities are named only where their established category applies. New semantic diagnostic identities and exact messages remain unallocated and are not guessed; see [diagnostic-matrix.md](./diagnostic-matrix.md).
- Formatting examples specify the current formatter contract: preserve token/text order and punctuation, normalize indentation to two spaces per block and end with a newline; parse-format-parse must preserve the source meaning and formatting must be idempotent.

## Record inheritance

### RI-V01 — One parent and transitive inherited fields

Expected valid. `Pump` receives `id` through `Asset`; the constructor supplies the complete effective required-field set.

````text
---
fixture: RI-V01
---
```amx
type Identifier {
  id: String
}
type Asset extends Identifier {
  tag: String
}
type Pump extends Asset {
  duty: Number
}
let pump: Pump = Pump { id = "P-1", tag = "feed", duty = 4 }
```
````

### RI-V02 — Multiple parents and same-type inherited collision

Expected valid. The duplicate inherited `id` requires a child `override`, even though both parent declarations have the same type.

````text
---
fixture: RI-V02
---
```amx
type Identifier {
  id: String
}
type Named {
  id: String
  name: String
}
type Asset extends Identifier, Named {
  override id: String
}
let asset: Asset = Asset { id = "A-1", name = "Pump" }
```
````

### RI-V03 — Override replaces the complete field contract

Expected valid. `override` replaces the inherited type, optionality, and default; `Asset` therefore requires the supplied `id`.

````text
---
fixture: RI-V03
---
```amx
type Identifier {
  id?: String = "unset"
}
type Asset extends Identifier {
  override id: Number
  tag?: String = "general"
}
let asset: Asset = Asset { id = 42 }
```
````

### RI-V04 — Imported and exported parent

Expected valid. The parent is exported and imported before the child declaration; the importing file uses the child’s complete effective fields.

`library.amx`:

````text
---
fixture: RI-V04
file: library.amx
---
```amx
export type Identifier {
  id: String
}
```
````

`entry.amx`:

````text
---
fixture: RI-V04
file: entry.amx
---
```amx
import { Identifier } from "./library.amx"
type Asset extends Identifier {
  duty: Number
}
let asset: Asset = Asset { id = "A-1", duty = 2 }
```
````

### RI-I01 — Collision between inherited fields without override

Expected invalid. A child must explicitly resolve duplicate inherited names, including identical field types.

````text
---
fixture: RI-I01
---
```amx
type Left {
  id: String
}
type Right {
  id: String
}
type Asset extends Left, Right {
}
```
````

### RI-I02 — Child redeclaration without override

Expected invalid. A child declaration of an inherited field requires `override`.

````text
---
fixture: RI-I02
---
```amx
type Identifier {
  id: String
}
type Asset extends Identifier {
  id: Number
}
```
````

### RI-I03 — Override without an inherited field

Expected invalid. `override` is valid only when at least one parent supplies the field.

````text
---
fixture: RI-I03
---
```amx
type Identifier {
  id: String
}
type Asset extends Identifier {
  override tag: String
}
```
````

### RI-I04 — Unknown parent

Expected invalid. The parent name is unresolved in this module.

````text
---
fixture: RI-I04
---
```amx
type Asset extends Missing {
  id: String
}
```
````

### RI-I05 — Forward parent

Expected invalid under existing source-order visibility.

````text
---
fixture: RI-I05
---
```amx
type Asset extends Identifier {
  tag: String
}
type Identifier {
  id: String
}
```
````

### RI-I06 — Non-record parent

Expected invalid. `count` is a value binding, not a record type.

````text
---
fixture: RI-I06
---
```amx
let count: Number = 1
type Asset extends count {
  id: String
}
```
````

### RI-I07 — Inheritance cycle

Expected invalid. Parent resolution must reject a cycle.

````text
---
fixture: RI-I07
---
```amx
type First extends Second {
  first: String
}
type Second extends First {
  second: String
}
```
````

### RI-I08 — Child is not assignable to parent

Expected invalid. Inheritance reuses properties; it does not create record subtyping.

````text
---
fixture: RI-I08
---
```amx
type Identifier {
  id: String
}
type Asset extends Identifier {
  tag: String
}
let asset: Asset = Asset { id = "A-1", tag = "pump" }
let identifier: Identifier = asset
```
````

### RI-I09 — Missing required inherited field on construction

Expected invalid under existing required-field validation.

````text
---
fixture: RI-I09
---
```amx
type Identifier {
  id: String
}
type Asset extends Identifier {
  duty: Number
}
let asset: Asset = Asset { duty = 2 }
```
````

### RI-I10 — Private parent is not imported

Expected invalid. The importing document cannot name a parent type that the library did not export.

`library.amx`:

````text
---
fixture: RI-I10
file: library.amx
---
```amx
type Identifier {
  id: String
}
```
````

`entry.amx`:

````text
---
fixture: RI-I10
file: entry.amx
---
```amx
import { Identifier } from "./library.amx"
type Asset extends Identifier {
  tag: String
}
```
````

## Enumerations

### EN-V01 — Implicit numeric values

Expected valid. Values are `1`, `2`, and `3` in declaration order.

````text
---
fixture: EN-V01
---
```amx
enum Status = {
  DRAFT,
  ACTIVE,
  CLOSED
}
let first: Number = Status.DRAFT
let second: Number = Status.ACTIVE
let third: Number = Status.CLOSED
```
````

### EN-V02 — Explicit homogeneous numeric values

Expected valid. Values are unique numeric literals; access yields `Number`.

````text
---
fixture: EN-V02
---
```amx
enum Priority = {
  LOW = 10,
  NORMAL = 20,
  HIGH = 30
}
let priority: Number = Priority.HIGH
```
````

### EN-V03 — Explicit homogeneous string values

Expected valid. Access yields the underlying `String`, not a distinct enum type.

````text
---
fixture: EN-V03
---
```amx
enum State = {
  OPEN = "open",
  CLOSED = "closed"
}
let state: String = State.OPEN
```
````

### EN-V04 — Imported and exported enum

Expected valid. The exported enum is imported before member access.

`library.amx`:

````text
---
fixture: EN-V04
file: library.amx
---
```amx
export enum Status = {
  DRAFT,
  ACTIVE
}
```
````

`entry.amx`:

````text
---
fixture: EN-V04
file: entry.amx
---
```amx
import { Status } from "./library.amx"
let active: Number = Status.ACTIVE
```
````

### EN-I01 — Empty enum

Expected invalid by the Lead Developer’s Sprint 072 clarification: enums must have at least one member.

````text
---
fixture: EN-I01
---
```amx
enum Empty = {
}
```
````

### EN-I02 — Duplicate member name

Expected invalid. Member names must be unique within an enum.

````text
---
fixture: EN-I02
---
```amx
enum Status = {
  ACTIVE = 1,
  ACTIVE = 2
}
```
````

### EN-I03 — Duplicate member value

Expected invalid. Distinct numeric members must have unique values.

````text
---
fixture: EN-I03
---
```amx
enum Priority = {
  NORMAL = 20,
  HIGH = 20
}
```
````

### EN-I04 — Mixed explicit primitive types

Expected invalid. An explicit enum is all `Number` literals or all `String` literals.

````text
---
fixture: EN-I04
---
```amx
enum State = {
  OPEN = "open",
  CLOSED = 2
}
```
````

### EN-I05 — Partial explicit assignment

Expected invalid. If any member is explicit, every member must have a literal value.

````text
---
fixture: EN-I05
---
```amx
enum Priority = {
  LOW,
  HIGH = 10
}
```
````

### EN-I06 — Expression-valued member

Expected invalid. Enum values are literals, not expressions.

````text
---
fixture: EN-I06
---
```amx
enum Priority = {
  LOW = 1,
  HIGH = 1 + 1
}
```
````

### EN-I07 — Missing member name

Expected invalid as malformed enum syntax; no empty member identifier is introduced.

````text
---
fixture: EN-I07
---
```amx
enum Status = {
  = 1
}
```
````

### EN-I08 — Forward enum reference

Expected invalid under existing source-order visibility.

````text
---
fixture: EN-I08
---
```amx
let active: Number = Status.ACTIVE
enum Status = {
  ACTIVE
}
```
````

### EN-I09 — Private enum is not imported

Expected invalid. Only exported names are visible across modules.

`library.amx`:

````text
---
fixture: EN-I09
file: library.amx
---
```amx
enum Status = {
  ACTIVE
}
```
````

`entry.amx`:

````text
---
fixture: EN-I09
file: entry.amx
---
```amx
import { Status } from "./library.amx"
let active: Number = Status.ACTIVE
```
````

## Braced `if` expressions and statements

### IF-V01 — Legacy single-line conditional expression

Expected valid and retained unchanged. The existing conditional expression continues to select one value.

````text
---
fixture: IF-V01
---
```amx
let selected: String = if true then "yes" else "no"
```
````

### IF-V02 — Braced expression with an explicit value return on each path

Expected valid. The returns supply the expression value and remain local to the expression.

````text
---
fixture: IF-V02
---
```amx
let selected: Number = if true {
  let answer = 42
  return answer
} else {
  return 0
}
let after: Number = 1
```
````

### IF-V03 — Standalone statement without `else`

Expected valid. A statement-form `if` may omit `else`; declarations remain branch-local and assignment to an outer binding persists.

````text
---
fixture: IF-V03
---
```amx
let count: Number = 0
if true {
  let local: Number = 2
  count = count + local
}
let after: Number = count
```
````

### IF-V06 — Standalone statement with `else`

Expected valid. The statement form also accepts an `else` block; only the selected branch updates the existing outer binding.

````text
---
fixture: IF-V06
---
```amx
let selected: Number = 0
if true {
  selected = 1
} else {
  selected = 2
}
```
````

### IF-V04 — Nested braced expressions

Expected valid. Each possible nested expression path explicitly returns a value; the outer expression also has an `else`.

````text
---
fixture: IF-V04
---
```amx
let selected: Number = if true {
  let nested: Number = if false {
    return 1
  } else {
    return 2
  }
  return nested
} else {
  return 3
}
```
````

### IF-V05 — Selected branch only

Expected valid. The result is `7`; the unselected `sqrt(-1)` branch must not be evaluated, because that existing operation raises a runtime-domain error.

````text
---
fixture: IF-V05
---
```amx
let selected: Number = if true {
  return 7
} else {
  return sqrt(-1)
}
```
````

### IF-I01 — Expression form requires `else`

Expected invalid. The expression cannot produce a value when the condition is false.

````text
---
fixture: IF-I01
---
```amx
let selected: Number = if true {
  return 1
}
```
````

### IF-I02 — A possible expression path does not return

Expected invalid. The `else` block has a path that ends without an explicit value return.

````text
---
fixture: IF-I02
---
```amx
let selected: Number = if true {
  return 1
} else {
  let fallback: Number = 2
}
```
````

### IF-I03 — Branch-local declaration escapes its block

Expected invalid. `local` is unavailable after the `if` block.

````text
---
fixture: IF-I03
---
```amx
if true {
  let local: Number = 2
}
let after: Number = local
```
````

### IF-I04 — Condition is not Boolean

Expected invalid. Conditions remain Boolean-checked.

````text
---
fixture: IF-I04
---
```amx
if 1 {
  let selected: Number = 1
}
```
````

### IF-I05 — Expression branch values have incompatible types

Expected invalid under existing conditional-expression type compatibility.

````text
---
fixture: IF-I05
---
```amx
let selected = if true {
  return 1
} else {
  return "one"
}
```
````
