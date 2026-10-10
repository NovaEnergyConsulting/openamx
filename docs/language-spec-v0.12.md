# OpenAMX V0.12 Language Specification

V0.12 adds record inheritance, enumerations, and braced `if` expressions and
statements to the existing OpenAMX language. It does not replace the earlier
language contract or introduce record subtyping, nominal enum values, or new
loop/function-return behavior. See the [project README](../README.md) for the
project overview and [the V0.12 master plan](../planning/plan-openamxV12MasterSprintPlan.md)
for the confirmed feature scope and delivery sequence. The [V0.9 specification](language-spec-v0.9.md)
remains the contract for its additive language features and compatibility
changes; earlier specification documents record historical language versions.

## 1. Compatibility and Source Rules

All V0.9 behavior remains in effect unless this specification explicitly adds
to it. In particular, V0.12 preserves exact, case-sensitive executable
`amx` fences, Markdown and other fences as inert text, the V0.9 record
constructor delimiter (`=`), source-ordered declarations, and existing
module import/export rules.

Declarations and references are visible only after their declaration or
explicit import. Imports expose only exported declarations. New parent types,
enum declarations, and enum references do not bypass these source-order and
visibility rules.

Diagnostic locations refer to the original document, including front matter
and executable-fence delimiters. Lines and columns are 1-based, with columns
counted as UTF-16 code units. An editor must map those locations to the
original LF or CRLF source; narrative and inert fences are not AMX code.

## 2. Record Inheritance

Record declarations may extend one or more earlier record types:

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
  status: Number
}

let asset: Asset = Asset { id = "A-1", name = "Pump", status = 1 }
```

Inheritance reuses properties; it does **not** make a child assignable to a
parent. Each parent must be a visible record declaration. Unknown, forward,
non-record, and cyclic parents are rejected.

The effective fields of a record are composed recursively. Visit parents in
their declared order and each parent's effective fields in their established
order. The first occurrence of a field fixes its position. A valid child
override replaces that field in place, and child-only fields append in the
child's declaration order. This same order is used wherever the effective
record fields are observed.

Every collision between inherited fields requires an explicit child
`override`, including a collision where both fields have the same type. A
child redeclaration of an inherited field also requires `override`; using
`override` without an inherited field is invalid. An override is the complete
replacement field contract: the child's type, optionality, and default replace
the parent's corresponding properties rather than merging with them.

Constructors and existing record validation use the full effective field set.
Required, optional, and default behavior otherwise remains unchanged. A child
record remains a distinct type and cannot be assigned where its parent type is
required.

## 3. Enumerations

An enum declares named members:

```amx
enum Status = {
  DRAFT,
  ACTIVE,
  CLOSED
}

let current: Number = Status.ACTIVE
```

An enum must contain at least one member. If no member has an explicit value,
members receive numeric values starting at `1` in declaration order. Thus
`Status.DRAFT` is `1`, `Status.ACTIVE` is `2`, and `Status.CLOSED` is `3`.
Member names must be unique.

If any member has an explicit value, every member must have a literal value.
All values in that enum must be unique literals of one primitive type: either
all `Number` or all `String`. Mixed types, duplicate values, partially
explicit declarations, and expression-valued members are rejected. For
example:

```amx
enum Review = {
  OPEN = "open",
  CLOSED = "closed"
}
```

Accessing a member evaluates to its underlying primitive `Number` or `String`.
Enums do not create a nominal type, aliases, flags, or implicit coercions.
Declarations and member references follow the source-order and module
visibility rules in Section 1.

## 4. Conditional Expressions and Statements

The legacy conditional expression remains valid and unchanged:

```amx
let description: String = if true then "ready" else "waiting"
```

V0.12 also supports braced forms. A braced `if` used as an expression requires
an `else`, and every possible path in both value-producing branches must end
with an explicit `return expression`:

```amx
let description: String = if score >= 5 {
  return "high"
} else {
  return "normal"
}
```

The branch returns provide the value of this conditional expression only.
They do not return from an enclosing function, loop, or document. The existing
conditional-expression type compatibility rules apply to the returned values.

A standalone braced `if` is a control-flow statement. Its `else` block is
optional:

```amx
if score >= 5 {
  score += 1
} else {
  score += 2
}
```

Conditions must be Boolean. Only the selected branch is evaluated. A `let`
binding declared inside a branch is local to that block and cannot be used
outside it or in a sibling branch. Assignments to bindings that existed
before the branch remain visible after it. Existing statement-context and
loop restrictions remain unchanged.

## 5. Diagnostics

The following V0.12 diagnostics are allocated to the new semantic checks.
Names in braces in AMX3011-AMX3013 are replaced with the actual declaration
names. Primary locations follow the offending token or closing brace
specified by the diagnostic contract.

| Code | Message |
| --- | --- |
| AMX3011 | `Parent {parentX} and Parent {parentY} have the same property: '{property_name}'` |
| AMX3012 | `This type declared '{property name}' which is also declared by "{parent type}", use the override keyword to declare this property.` |
| AMX3013 | `No inherited type includes "{property name}", override is not necessary` |
| AMX3014 | `The inherited type causes a circular dependency` |
| AMX3015 | `Enums need at least one value` |
| AMX3016 | `Enum members names have to be unique` |
| AMX3017 | `All enum members must have unique values` |
| AMX3018 | `Enum members should all have the same value types, all Number or String` |
| AMX3019 | `All members should have explicitly assigned values` |
| AMX3020 | `Only constant values can be assigned to enum members` |
| AMX3021 | `Every possible path in an if expression must return a value` |

Other invalid cases retain their established diagnostics: for example,
unknown/forward identifiers, incompatible types, malformed syntax, module
visibility failures, and the existing missing-`else` error. Their identities,
messages, and source locations are not reallocated by V0.12.

## 6. Explicit Exclusions

V0.12 does not add record subtyping, methods or traits, enum aliases or flags,
mixed-type or partially implicit enums, expression-valued enum members,
general scope redesign, new loop semantics, or function-return behavior.
These additions do not imply a migration guide or any release, publication,
or platform-certification claim.

## 7. Runnable Examples

- [Record inheritance and enums](../examples/v0.12-records-and-enums.amx)
- [Braced `if` expressions and statements](../examples/v0.12-braced-if.amx)

The [Sprint 072 grammar examples](../planning/sprints/0072-v12-language-contract-acceptance-fixtures/grammar-examples.md)
and its diagnostic matrix provide the fixture-level syntax and source-location
contract used to verify these examples and the editor integrations.
