# OpenAMX Language Features

These is a repository of new feature ideas for the language syntax and features aspects of this project.
The core of the language can be found on the `src` directory.
When modifying the language, ensure the syntax highlighting tools are also updated both for the `vscode-extension` and the `desktop-app`.

## Type checking at runtime

AMX should have a keyword and construct that allows performing structural typechecking at run time. The keyword would be `is` and would be a structural comparison between two types. If the left type is structurally equal or contained by the properties of the type on the right, then the expression should return true.

The following is how this syntax would work:
```amx
type Asset {
    id: String
    name: String
}

type PowerTransformer extends Asset {
    rating: String
    hasCooling: Boolean
}

let transformerInstance = PowerTransformer {
    id = '12345'
    name = 'An instance of a Power Transformer'
    rating = '10 MVA'
    hasCooling = true
}

let outcome = if transformerInstance is Asset then 'it is an Asset' else 'is not an Asset'
```

This outcome: {{ outcome }} would evauate to 'it is an Asset'.

# Expand Standard Library

Add the following to the Standard Library:

- Trigonometric Functions: sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, asinh, acosh, atanh
- Logarithmic and Exponential Functions: ln, log, exp
- Common Mathematical Constants: PI, E
- Common Text Formatting Functions: len, trim, right, left, format

Also, all functions that currently accept a Number or list of Numbers should be able to accept a Measurement or list of Measurements and perform the function over the Measurements as long as all the Measurements entered into the function are compatible in terms of Dimensions and Units