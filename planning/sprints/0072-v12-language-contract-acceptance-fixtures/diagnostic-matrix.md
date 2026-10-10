# Sprint 072 Diagnostic Matrix

This matrix describes expected diagnostics for the future V0.12 contract. It does not claim they exist or have been verified.

## Location and identity conventions

- `Lx:Cy` is a 1-based source location in the named original document. Columns count UTF-16 code units. Front matter and the inner `amx` fence count toward line numbers; the outer Markdown fence does not.
- The listed token width is in UTF-16 code units and identifies the intended primary span as `[Lx:Cy, Lx:Cy+width)`. Existing `AmxDiagnostic` carries a line/column point rather than a span; use the point convention when the established API cannot express an end position. A secondary location is listed only when identifying a conflicting declaration is useful.
- Existing code/message pairs are pinned only where the repository already defines that category. `Unallocated` means the semantic expectation is confirmed but the feature sprint must obtain an approved catalog identity/message before implementing it. Do not substitute a guessed code or message.
- Every fixture source is in [grammar-examples.md](./grammar-examples.md); invalid module fixtures identify the responsible source file.

## Record inheritance — Sprint 073

| Fixture | Expected diagnostic category and identity | Primary source location | Secondary location / notes |
|---|---|---|---|
| RI-I01 | Inherited-property collision requiring child `override`; **Unallocated** | `L9:C3`, `id` (width 2) | `L6:C3`, first `id`; both parent declarations conflict. |
| RI-I02 | Child redeclaration requires `override`; **Unallocated** | `L9:C3`, `id` (width 2) | `L6:C3`, inherited `id`. |
| RI-I03 | `override` has no matching inherited property; **Unallocated** | `L9:C12`, `tag` (width 3) | No inherited `tag`. |
| RI-I04 | Unknown parent type; **AMX3001**, established `Unknown type 'Missing'` category | `L5:C20`, `Missing` (width 7) | Parent reference in declaring document. |
| RI-I05 | Forward parent reference under source-order visibility; **AMX3001**, established unknown-type category | `L5:C20`, `Identifier` (width 10) | Later declaration is at `L8:C6`. |
| RI-I06 | Non-record parent; **AMX3001**, established unknown-type category for non-type name | `L6:C20`, `count` (width 5) | `count` is a value binding, not a type. |
| RI-I07 | Inheritance cycle; **Unallocated** | `L8:C21`, `First` (width 5) | Cycle closes to the declaration at `L5:C6`. |
| RI-I08 | Child-to-parent assignment rejected; **AMX3002**, established incompatible-type category | `L12:C30`, `asset` (width 5) | Expected type `Identifier`; actual type `Asset`. |
| RI-I09 | Missing required inherited construction field; **AMX3002**, established missing-required-field category | `L11:C20`, constructor `Asset` (width 5) | Missing effective field is `id`, declared at `L6:C3`. |
| RI-I10 | Import of non-exported parent; **AMX5002**, established missing-export category | `entry.amx L6:C10`, imported `Identifier` (width 10) | Non-exported declaration is `library.amx L6:C13`. |

RI-I01 and RI-I02 use `id` width 2; all spans use half-open end columns. Source locations for RI-I10 are local to the named module, not the combined fixture.

## Enumerations — Sprint 074

| Fixture | Expected diagnostic category and identity | Primary source location | Secondary location / notes |
|---|---|---|---|
| EN-I01 | Empty enum rejected per approved Sprint 072 clarification; **Unallocated** | `L6:C1`, closing `}` (width 1) | Empty body. |
| EN-I02 | Duplicate member name; **Unallocated** | `L7:C3`, second `ACTIVE` (width 6) | First declaration at `L6:C3`. |
| EN-I03 | Duplicate member value; **Unallocated** | `L7:C10`, second `20` (width 2) | First value at `L6:C12`. |
| EN-I04 | Mixed explicit primitive types; **Unallocated** | `L7:C12`, numeric literal `2` (width 1) | First member establishes `String` values at `L6:C10`. |
| EN-I05 | Explicit enum contains a member without a literal value; **Unallocated** | `L6:C3`, `LOW` (width 3) | The enum is partially explicit. |
| EN-I06 | Enum member value is an expression, not a literal; **Unallocated** | `L7:C10`, `1 + 1` (width 5) | Expression-valued members are excluded. |
| EN-I07 | Missing enum member name; **AMX3006**, established syntax-error category | `L6:C3`, `=` (width 1) | Malformed member syntax; no empty identifier is defined. |
| EN-I08 | Forward enum reference under source-order visibility; **AMX3001**, established unknown-identifier category | `L5:C22`, `Status` (width 6) | Later declaration begins at `L6:C6`. |
| EN-I09 | Import of non-exported enum; **AMX5002**, established missing-export category | `entry.amx L6:C10`, imported `Status` (width 6) | Non-exported declaration is `library.amx L6:C6`. |

## Braced `if` — Sprint 075

| Fixture | Expected diagnostic category and identity | Primary source location | Secondary location / notes |
|---|---|---|---|
| IF-I01 | Expression-form `if` is missing required `else`; **AMX3006**, established syntax-error category | `L5:C24`, `if` (width 2) | The expression has no false-condition value path. |
| IF-I02 | A possible expression path has no explicit value return; **Unallocated** | `L9:C1`, closing `}` (width 1) | Non-returning `else` branch starts at `L7:C8`. |
| IF-I03 | Branch-local binding used outside its block; **AMX3001**, established unknown-identifier category | `L8:C21`, `local` (width 5) | Declaration is scoped to `L5`–`L7`. |
| IF-I04 | Condition is not Boolean; **AMX3002**, established incompatible-type category | `L5:C4`, numeric literal `1` (width 1) | Expected `Boolean`, actual `Number`. |
| IF-I05 | Conditional branch values have incompatible types; **AMX3002**, established message `Conditional branches have incompatible types` | `L5:C16`, `if` (width 2) | `Number` and `String` return expressions are at `L6:C10` and `L8:C10`. |

## Deferred diagnostic catalog work

The master plan confirms the rejection rules but does not allocate identities for inheritance-specific collisions/override/cycle diagnostics, enum validation diagnostics, or the missing-return-path diagnostic. Those rows remain semantically specified but catalog-unallocated; Sprints 073, 074, and 075 must obtain Lead Developer approval for their identities/messages before production diagnostics or exact-code assertions are added. This is diagnostic catalog work, not an unresolved language-semantic choice. Existing identities above must not be broadened to cover unrelated new categories without approval.
