# OpenAMX Workbench Desktop App Features

These is a repository of new feature ideas for the desktop app component of this project.

The extension can be found on the `desktop-app` directory.

## Main Application Window

- The code editor grows to accomodate larger `amx` documents. This causes the entire application window to grow out of screen and then having to scroll. This behaviour needs to be changed. All of these: the file explorer, the code editor and the preview area should have their independent vertical scrolling bars. The main window should remain at a fixed size.

## Preview Panel

- The preview panel should automatically refresh its view as changes are made to the `amx` file. Whilst it is correct behaviour to also update it if the user clicks the "Refresh preview" button, the panel should also keep updating as the `amx` file changes.
- It is acceptable to introduce some delay or debouncing behaviour so the preview panel doesn't keep recomputing and refreshing with every single character typed on the code editor area.
- The purpose of the "pause live preview" button is precisely to stop this behaviour if the user wants to not constantly update the preview panel.

## Code Editor

- The code editor should include an option to wrap the text entered into it
- Also, at the moment, while typing in the code editor, when the TAB key is pressed, the behaviour is dominated by the main app ui and the component focus changes. When typing in the code editor the behaviour of pressing the tab key should be to actually add tab characters to the text in the *.amx file.

## Runtime Drawer

- When the app is in dark mode, some of the text being displayed against the dark background of this area is too dark to be legible. Chose a better contrast colour to display text in this area under dark mode

## Help Center Dialog

- Currently the topics and their content are stored in the component itself as an array of HelpTopics. As the application grows and better help documentation is created, this won't be sustainable. The content of the help topics should be separated into a JSON file that the component can then read to display the help.
- The modal window that is overlayed on the main window when help is being displayed adapts its size to the content inside it. This includes when searching terms, the window keeps dynamically resizing depending on the number of topics being displayed. The behaviour of this window should be to have a fixed size in proportion to the current size of the main window, say 80% of the size of the main window, and the content inside should scroll if it cannot fully fit in the help modal window.