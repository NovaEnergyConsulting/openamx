# OpenAMX Language Features

These is a repository of new feature ideas for the language syntax and features aspects of this project.
The core of the language can be found on the `src` directory.
When modifying the language, ensure the syntax highlighting tools are also updated both for the `vscode-extension` and the `desktop-app`.

## Expanding the Function Syntax

Currently the AMX language allows the declaration of functions as follows:

```amx
fn triple(value: Number): Number = value * 3
```
This syntax works properly and should be retained. However, there are a few enhancements we will make.

### Enable multi-statement function declarations using bracket syntax

In addition to the current syntax, which should continue to work as it does so far, we will extend the syntax to use bracket notation as shown in the following example:

```amx
fn multiStatementFunction(inputValue: Number): String {
    if inputValue > 0 {
        return "The number is positive"
    } else {
        return "The number is negative"
    }
}
```
As seen in the example, the function might contain multiple statements. For each logical path, the function should return a value compatible with the declared return type of the function.

Variables defined using `let` inside a function body, cease to exist after the function scope ends.
