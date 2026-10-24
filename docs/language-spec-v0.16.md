# OpenAMX V0.16 Language Specification

V0.16 adds statement-bodied functions while preserving expression-bodied
functions. This specification is additive; it does not replace the
[V0.14 specification](language-spec-v0.14.md), the
[V0.13 specification](language-spec-v0.13.md), the
[V0.12 specification](language-spec-v0.12.md), the
[V0.9 specification](language-spec-v0.9.md), or earlier contracts. See the
[project README](../README.md) and the
[function-body reference](../examples/15_Function_Bodies.amx).

## 1. Compatibility and Source Rules

Existing syntax and behavior remain in effect except for the additions below.
The existing expression-body form remains valid and unchanged:

```amx
fn triple(value: Number): Number = value * 3
```

A function may instead use a brace-delimited statement body. Function
statements are separated by newlines; semicolons are not statement
separators. Existing declaration order, module dependency, and visibility
rules remain in effect. Function bodies do not add recursion, forward
references, closures, or new visibility rules.

## 2. Function Body Forms

The function declaration forms are:

```ebnf
FunctionDeclaration ::= "fn" Identifier "(" [ParameterList] ")" ":" Type
                        ( "=" Expression | FunctionBody )
FunctionBody        ::= "{" { FunctionStatement } "}"
FunctionStatement   ::= InitializedLet | Assignment | CompoundAssignment
                        | StandaloneIf | StatementFor | ReturnStatement
                        | NamedListMutation
InitializedLet      ::= "let" Identifier [":" Type] "=" Expression
Assignment          ::= Identifier "=" Expression
CompoundAssignment ::= Identifier "+=" Expression
StandaloneIf        ::= "if" Expression FunctionBlock ["else" FunctionBlock]
StatementFor        ::= "for" Identifier "in" Expression FunctionBlock
ReturnStatement     ::= "return" Expression
NamedListMutation   ::= "add" Expression "to" Identifier
                        | "remove" Expression "from" Identifier
FunctionBlock       ::= "{" { FunctionStatement } "}"
```

The `=` expression body and `{...}` statement body are alternatives. The
expression form evaluates its expression as the function result. The braced
form must return a compatible value on every reachable path.
Statements inside a function block are separated by newlines; the grammar
above names the allowed statement forms, while the constraints below apply
recursively to nested blocks.

A braced function body accepts these statement forms:

- Initialized `let` declarations.
- Assignment to an already-visible parameter or local, including `+=`.
- Standalone `if` statements with an optional `else` block.
- Statement-form `for` loops.
- `return` statements.
- Named-list `add` and `remove` mutations.

These statements may appear in the branch and loop blocks permitted by the
existing grammar. Nested statement loops, `break`, and `continue` are not
permitted. Expression-form loops are not permitted inside either function
form.

Imports, exports and re-exports, type/enum/dimension/unit/input declarations,
table/chart/diagram declarations, `show`, other document-level actions, and
nested function declarations are not permitted inside a function body.

## 3. Return Values and Control Flow

A statement `return expression` exits the statement-bodied function, including
when it occurs inside an allowed nested `if` or statement-form `for` body.
Statements after an executed return do not run. The return expression must be
compatible with the function's declared return type.

Every reachable path must return a compatible value. An `if` without `else`
has a false path that continues after the `if`; an `if/else` completes only
when both branches return or otherwise terminate. A statement loop may execute
zero times and cannot prove that a function returns. A later return can close
a path that falls through an earlier conditional or loop.

All statements are checked, including unreachable statements and explicit
returns after an unconditional return. An unreachable incompatible return or
invalid statement is still diagnosed. The checker does not add an
unreachable-code warning.

Return behavior in other expression contexts remains distinct:

- An expression-bodied function still returns the value of its expression.
- A return expression in a braced `if` expression supplies that expression's
  branch value under the existing V0.12 rules; it does not exit an enclosing
  function. The expression requires an `else` and a value on every branch.
- In an expression-form loop outside a function, `return` contributes one
  collected value per iteration; it is not a function-exit signal.

## 4. Lexical Scope and Function Visibility

Parameters are visible throughout their function body. Local declarations
become visible in source order and are not hoisted. Branch and loop bodies
have lexical scopes; declarations do not escape those blocks. A repeated
`let` in the same scope updates that binding. A declaration in a nested scope
may shadow an enclosing local or parameter, and the shadow does not escape.

Assignment and `+=` update an already-visible parameter or local. They do not
create bindings or mutate document/caller bindings. Parameters are call-local
values. A statement-loop iterator is scoped to its loop and restores a
shadowed binding after the loop.

Functions retain established module dependency and source-order visibility.
They do not capture document or caller bindings, refer to later function
declarations, or call themselves recursively.

## 5. List Argument and Result Values

Each list-typed parameter receives an independent recursive copy of its array
argument at the call boundary. Repeated arguments are copied separately, so
mutating one parameter's list does not affect another parameter or the
caller's list. Nested arrays are copied at every depth. For a nullable list
parameter, `null` remains `null`; a non-null array is copied as described.

Only arrays are copied. Non-array elements, including records and
Measurements, are opaque and are not cloned. This rule does not authorize
mutation through shared non-list elements and does not define general object
copying. Non-list parameters retain their existing value semantics.

`add` and `remove` mutate a local list or the parameter's copied list. A
mutated local list may be returned directly as the function result; there is
no additional copy-on-return rule.

## 6. Diagnostics

Diagnostics use original source locations, with 1-based lines and columns.
The function-body diagnostics are:

| Condition | Phase | Diagnostic | Primary location |
| --- | --- | --- | --- |
| Malformed function-body syntax | Parse | `AMX3006: Invalid syntax in function body` | Offending token |
| Unclosed function body | Parse | `AMX3006: Unclosed function body` | Opening function-body brace |
| Prohibited statement in a function body | Parse | `AMX3006: The '{keyword}' statement is not allowed in a function body.` | Prohibited keyword |
| Return outside a permitted function or expression-loop context | Parse | `AMX3006: Return is only valid inside a function or expression-form loop` | `return` keyword |
| Incompatible explicit return | Static check | `AMX3002: Expected {expected}, got {actual}` | Return expression |
| Missing reachable return path | Static check | `AMXF4001: Missing return value from function` | Function closing brace |
| Unknown or out-of-scope identifier | Static check | `AMX3001: Unknown identifier '{name}'` | Identifier |
| Unknown function, including a forward reference | Static check | `AMX3004: Unknown function '{name}'` | Call expression |
| Defensive function fallthrough | Runtime | `AMXF4002: Function finished without returning a valid expression` | Function closing brace |

`AMXF4001` is the static missing-return diagnostic. `AMXF4002` is only a
defensive runtime guard for an invalid body that reaches runtime fallthrough;
it does not replace static checking. `AMX3021: Every possible path in an if
expression must return a value` remains specific to braced `if` expressions.
`AMX1007` is not used for function fallthrough.

## 7. Exclusions and Examples

V0.16 function bodies do not add recursion, forward references, closures,
nested statement loops, `break`, `continue`, expression-form loops inside
functions, document or output effects, or general object-copy behavior. The
statement set above does not enable arbitrary document statements inside a
function.

The [Collections and Functions lesson](../examples/03_Collections_and_Functions.amx)
continues to demonstrate expression-bodied functions. The standalone
[Function Bodies reference](../examples/15_Function_Bodies.amx) demonstrates
both forms, nested returns, loop fallback, call-local values, list argument
isolation, and returned lists. These documents describe the V0.16 language
contract and do not claim integrated version acceptance, release, publication,
or platform certification.
