# OpenAMX Desktop App Features

These is a repository of new feature ideas for the language syntax and features aspects of this project.
The core of the language can be found on the `src` directory.
When modifying the language, ensure the syntax highlighting tools are also updated both for the `vscode-extension` and the `desktop-app`.
When modifying the `desktop-app`, you might still require to modify files under `src` or `vscode-extension` if the change will affect the core.

## Main Application Window Refactoring

The current main window ('desktop-app/src/mainview') is primarily implemented in the `App.vue` component. This component has grown to a considerable size and is becoming difficult to maintain.

We need to refactor the `App.vue` component and turn it into the core shell of the application whilst the various elements and panels of the application are broken into smaller subcomponents.

To acomplish this, we will leverage functionality from the [shadcn-vue](https://shadcn-vue.com/docs) library where it provides an advantage. Leveraging built-in functionality should be enable the reduction of the custom interactivity funcionality currently implemented by the main view.

The layout, sections, visual style and functionality of the application will remain as it is now. This is mostly a refactor to better organise the components for future maintainability and improve functionality where appropriate.

Also, maintain the layout and current functionality of each of the current panels.

If you have any doubts about whether any particular element of this refactoring should or should not be implemented or need guidance on the choices to be made, ask me rather than making assumptions.

## Firs Load Behaviour

When a project is opened and a file is shown on the editor panel, the preview on the right panel and the code colouring on the editor panel are not triggered until the "Refresh preview" button is clicked and something is typed on the editor panel respectively.

Modify this behaviour in a way that all these action are run once after the project is first loaded.

Other behaviour is working correctly, for example when a new file is selected and shown, all this actions take place and the colour is correctly coloured on the editor and the Preview is run and shown on the right panel.

## File Manager Panel

Taking the opportunity during the refactoring mentioned above, the functionality of the file manager panel on the left will be improved to provide a more feature complete and user friendly experience, like drag and drop, file renaming, right-click menu, etc. By enabling file drag-and-drop functionality, the need for the "Move/rename" button becomes redundant and can be eliminated.

Maintain the "Search files" box at the top of the files list, this is a very useful feature.

The at the top can be collapsed into a more elegant button menu at the top.

Maintain the file count indicator that shows at the top-right corner of this panel.

## Commands Button

The current "Commands" button on the top-right corner of the main window should be maintained, as well as the help and settings buttons as they are.

The current functionality of the command window that opens when the "Commands" button is clicked or the 'Ctrl+Shift+P' combination is pressed on the keyboard should be maintained. The search and filtering of available commands as search terms are typed in the "Find a command" box should also be maintained.

In addition to this current functionality, the up/down arrow keys should enable the user to navigate the available commands shown on this dialog and clearly indicate the currently selected command by highlighting it. Also, in addition to triggering the command by clicking on it with the mouse, the user will also be able to trigger the command by pressing the "Return" or "Enter" key on the highlighted command.

## Panel Resizing

Instead of the custom resizing bars currently in use for the left, center and right panels of the main window, the [Resizable](https://shadcn-vue.com/docs/components/resizable) component of shadcb-vue can be leveraged.

## Runtime Panel

The runtime panel on the bottom should also retain its current functionality. The "Bottom" and "Right" buttons did not work as expected and they can be removed. Also, the need to relocate this panel can be deprecated and code related to this action can be removed and/or cleaned up.

Other functionality enabled by the "Run active document" and "Show/Hide Details" should be maintained.