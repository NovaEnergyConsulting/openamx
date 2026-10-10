# OpenAMX Language Features

These is a repository of new feature ideas for the language syntax and features aspects of this project.
The core of the language can be found on the `src` directory.
When modifying the language, ensure the syntax highlighting tools are also updated both for the `vscode-extension` and the `desktop-app`.

## Records

Records can optionally extend other records using the `extends` keyword.

When a record extends another, all it simply means is that the record "inherits" all the properties from the extended type. Also, a type can extend multiple "parent" types by separating them with a comma after the `extends` keyword.

If there are duplications, a syntax error should be raise letting the user know that two properties are duplicated from the extended type. This error can be avoided if the type that inherits the parent declared the same property using the `override` keyword.

The following is valid syntax to declare inherited types.
```amx
type Identifier {
    id: String
}

type Namer {
    name: String
}

type Asset extends Identifier,Namer {
    description: String
    quantity: Number
}

type Overrider extends Identifier,Namer {
    override id: Number
    additionalProperty: Boolean
}

let myOverriderInstance = Overrider {
    id = 10,
    name = "Some Instance",
    additionalProperty = true
}
```

## Enumerations

AMX should enable the creation of enumerations using the keyword `enum`.

The syntax to declare enums should be as follows:
```amx
enum EnumWithoutValues = {
    VALUE_ONE,
    VALUE_TWO,
    VALUE_THREE
}

enum EnumWithStringValues = {
    VALUE_ONE = "ONE",
    VALUE_TWO = "TWO",
    VALUE_THREE = "THREE"
}

enum EnumWithNumberValues = {
    VALUE_ONE = 1,
    VALUE_TWO = 2,
    VALUE_THREE = 2
}
```

When the enum values are used, they can be called like the members of a record, using the dot (".") syntax.

Enums that are declared wihtout an assigned String or Number values, the enumeration should default to numeric values starting at 1.

```amx
let this_variable_equals_1 = EnumWithoutValues.VALUE_ONE
let this_variable_also_equals_1 = EnumWithNumberValues.VALUE_ONE
let this_variable_equals_the_string_ONE = EnumWithStringValues.VALUE_ONE
```

## IF Clauses

Currently, the `if` clauses only act as expressions that have to be assigned to a variable.

We need to enable also using them to control program flow as stand-alone statements, similar to for.

The syntax should also be extended to use curly brackets to surround statement blocks.

The following are valid examples of how this syntax can be used.

As an expression on a single line
```amx
let myValue = if condition == true then "value is true" else "value is false"
```

As an expression with curly braces, multi-line statements and return statement
```amx
let myValue = if condition == true {
    let whenTrue = 5
    return whenTrue
} else {
    let whenFalse = 10
    return whenFalse
}
```

As a flow control statement
```amx
let myVariableOutsideTheIf = 0

let myCondition = false

if myCondition == true {
    myVariableOutsideTheIf = 1
} else {
    myVariableOutsideTheIf = 2
}
```