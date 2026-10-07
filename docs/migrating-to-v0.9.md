# Migrating to V0.9

V0.9 has three intentional compatibility changes. Update affected source explicitly; the formatter does not repair rejected syntax, and OpenAMX does not automatically migrate projects.

## Record constructors use `=`

Record constructor fields now use `=` instead of `:`. Colons remain required for record type fields and variable, parameter, and return annotations.

```amx
type Point {
  x: Number
  y: Number
}

let point: Point = Point {
  x = 3,
  y = 4,
}
```

`Point { x: 3, y: 4 }` is invalid V0.9 syntax. Change only constructor delimiters; do not change annotation colons.

## String escapes are decoded

Strings decode the finite escape set `\"`, `\'`, `\\`, `\n`, `\r`, `\t`, and `\${`. Unknown escapes are errors. Add an extra backslash when an old source string intended a literal backslash:

```amx
let path: String = "C:\\logs"
```

Double-quoted strings support AMX `${expression}` interpolation. Single-quoted strings do not interpolate. Raw string source remains single-line.

## Invalid programs are checked

Every document is statically checked before evaluation, including programs that previously ran without annotations or explicit checking. Valid unannotated bindings still infer their types:

```amx
let count = 3
```

Invalid expressions are rejected before execution. For example, `let count = "three" + 1` reports a type error; adding annotations or disabling checking is not a migration.

For the full V0.9 behavior contract, see the [language specification](language-spec-v0.9.md). Earlier version specifications remain historical references.
