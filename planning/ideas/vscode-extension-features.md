# VSCode Extension Features

These is a repository of new feature ideas for the VSCode extension component of this project.

The extension can be found on the `vscode-extension` directory.

## Idea: Preview panel/screen

- Similar to markdown files, the vscode extension would enable the user to see a side-to-side view of the *.amx file being edited.
- This panel could use the existing infrastructure that renders/exports HTML files and use it to evaluate and render the "preview" panel for an `amx` file.
- The panel displays a fully evaluated and rendered version of the `amx` file. It should display the same view that the user would get by running the `render` command of the CLI.

## Idea: Hover behaviour improvements

- The bindings created with the `let` keyword are currently labelled with the word "binding". For example, a variable created with `let x = 10` would display `binding x: Number` when hovering over the `x`. Instead of this, display `variable x:Number` which is a more user friendly terminology.
- When the variable being hovered over is a user-defined type using the keyword `type`, also display the types of the members of that type. For example if the type is: `type MyRecord { stringProp: String}` and a variable is defined as `let recordOne:MyRecord = {stringProp: "MyString"}`. The hover should show `variable recordOne:MyRecord { stringProp: String }`.
- Enable hovering on a binding or a varilable anywhere in an `amx` file not just at the definition statement with `let`. This would include other parts within `amx` fenced code blocks, but also where this is interpolated in text using the double bracket notation {{}}.

## Idea: AMX Notebook

- Similar to Jupyter notebooks, an AMX notebook would present a notebook-like interface.
- The cells of this notebook would be:
    - Code: the user can enter and evaluate `amx` code/computations. On evaluation, the state of the cell would be printed underneath it using the infrastructure already being used by the cli `run` command.
    - Text: the user can enter text in the `amx` markdown-like syntax. This cell would also render an evaluated output in the form of HTML
    - Chart: these cells would render the output of a chart
    - Table: the user can view and manipulate tabular/CSV data
    - JSON: the user can view and manipulate JSON data
- The format in which the notebook saves data is a standard, text-based `amx` file. In other words, an `amx` file could be viewed as a text only version or displayed as an interactive notebook
