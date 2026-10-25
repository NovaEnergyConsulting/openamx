# Sprint 106 Command-Palette Contract

## Status and Authority

This document operationalizes the accepted V0.17 command-palette requirements
and the narrowly assigned Sprint 105 Trash restore-error residual. It does
not authorize implementation by itself.

## Palette Cases

| ID | Trigger/state | Required behavior |
| --- | --- | --- |
| `S106-CMD-01` | Commands button | Keep the button and open the searchable Commands dialog; focus the search field. |
| `S106-CMD-02` | Ctrl+Shift+P / Cmd+Shift+P | Open the same dialog and use the same initial selection/focus behavior as the button. |
| `S106-CMD-03` | Palette opened or query changed | Select the first enabled command in the current filtered results. If no enabled result exists, clear selection. |
| `S106-CMD-04` | Up/Down | Move through enabled filtered commands only. Stop at the first/last enabled command; do not wrap. Disabled commands are skipped. |
| `S106-CMD-05` | Selection visible | Clearly highlight the selected command and expose its selected state to assistive technology. Selection follows stable command IDs, not stale row indexes. |
| `S106-CMD-06` | Enter/Return | Run the selected enabled command through the same execution helper used by clicking the row. Dismiss the palette and preserve existing focus/command behavior. |
| `S106-CMD-07` | Disabled command | Preserve the existing disabled reason. Disabled commands are not selected and cannot run by click or keyboard. |
| `S106-CMD-08` | No matching or no enabled results | Keep the current empty-result message for no matches. When matches exist but all are disabled, show the disabled reasons without a selection; Enter/Return is a no-op. |
| `S106-CMD-09` | Commands/availability changes while open | Keep the selected command only if the same ID remains filtered and enabled. Otherwise select the first enabled current result or clear selection. |
| `S106-CMD-10` | Escape or backdrop dismissal | Close the dialog and restore focus to the exact opener, including when opened by the keyboard shortcut. |
| `S106-CMD-11` | Click command | Preserve current click-to-run behavior and route through the shared command runner. Help and Preferences buttons remain unchanged. |
| `S106-CMD-12` | Palette handles a key | Prevent that key from also invoking a global shell shortcut. Enter while the palette is open must not accidentally run the active document or preview independently of the selected command. |

The query continues matching command labels according to the existing filter
policy. This sprint does not add fuzzy ranking, categories, recent commands,
new shortcuts, or command-registry changes.

## Trash Restore Residual

Sprint 105's amended acceptance records that a failed Restore sets `trashError`
while the template hides `trashItems` through a mutually exclusive `v-if`.
The item remains in service Trash and appears again after reopening the
dialog. Sprint 106 owns this presentation correction only.

| ID | Trigger/state | Required behavior |
| --- | --- | --- |
| `S106-TRASH-01` | Restore fails | Keep the current Trash dialog open; show the error in a visible `role="alert"` region and keep the unchanged Trash item list visible simultaneously. |
| `S106-TRASH-02` | Failed Restore leaves other items in Trash | Preserve every item in the current list. Other Restore actions remain available once the failed request settles; they do not require closing/reopening the dialog. |
| `S106-TRASH-03` | Retry after failure | Starting another Restore clears or supersedes the prior error according to one consistent rule; success removes only the restored item, refreshes the listing, and leaves other items visible. |
| `S106-TRASH-04` | Empty Trash or list refresh fails | Show the error without hiding the current item list. Cancellation and failure preserve the stored items. |

Do not change Trash RPC semantics, folder trash scope, confirmation policy,
file operations, or recovery behavior.