# Sprint 106 Acceptance Test Matrix

These cases are Sprint 106 implementation evidence targets. They do not claim
that current code passes the new keyboard or Trash behavior.

| ID | Scenario | Required assertions | Surface |
| --- | --- | --- | --- |
| `S106-CMD-01` | Open with Commands button | Dialog opens; search is focused; first enabled result is visibly and accessibly selected. | Playwright |
| `S106-CMD-02` | Open with Ctrl+Shift+P / Cmd+Shift+P | Same dialog and selection behavior; Escape returns focus to the keyboard invoker. | Playwright |
| `S106-CMD-03` | Change filter | Selection resets to first enabled filtered result; stale selection is cleared; no-results message remains. | Playwright |
| `S106-CMD-04` | Navigate up/down | Disabled results are skipped; selection stops at both boundaries and does not wrap. | Playwright |
| `S106-CMD-05` | Selected-state rendering | Selected row is visually distinct and has the accessible selected state; disabled reasons remain readable. | Playwright/DOM assertions |
| `S106-CMD-06` | Enter/Return execution | Selected command runs once through same path as click, palette dismisses, and command outcome matches click behavior. | Playwright + harness snapshot |
| `S106-CMD-07` | Disabled/no-enabled commands | Disabled commands are not selectable/clickable/runnable; Enter is a no-op when no enabled selection exists. | Playwright |
| `S106-CMD-08` | Dynamic availability | If current selected ID becomes disabled or filtered out, select first enabled current result or clear; never execute a stale command. | Playwright with existing project/document state changes |
| `S106-CMD-09` | Global shortcut collision | Enter/Return in palette does not also trigger global Run/Preview; Up/Down does not scroll unrelated page content. | Playwright + harness job log |
| `S106-CMD-10` | Escape/backdrop dismissal | Escape and outside-click close the palette and restore focus to the original opener, including shortcut open. | Playwright |
| `S106-CMD-11` | Mouse execution parity | Click runs the same command once and preserves Help/Preferences controls and existing command result behavior. | Playwright + harness snapshot |
| `S106-CMD-12` | Global shortcut collision | Enter in the palette does not also trigger global Run/Preview; Up/Down does not scroll unrelated page content. | Playwright + harness job log |
| `S106-TRASH-01` | Failed Restore | Alert and Trash list are visible together; failed item remains present; dialog stays open. | Existing explorer UI test with harness rejection |
| `S106-TRASH-02` | Continue after a failed Restore | Restore another item without closing/reopening; successful item disappears from Trash and returns to explorer while failed item remains. | Existing explorer UI test |
| `S106-TRASH-03` | Retry failed item | Error lifecycle is deterministic; stored item remains retryable; success removes it from list. | Playwright + harness toggle response |
| `S106-TRASH-04` | Failed Empty Trash/list refresh | Show alert without hiding current items; no list loss on failure/cancel. | Playwright + harness failure path if available |

## Test Placement

- Add `desktop-app/tests/ui/command-palette.pw.ts` for keyboard, selection,
  disabled states, click parity, focus, and shortcut collision.
- Extend only the Trash restore test in
  `desktop-app/tests/ui/project-explorer-workflows.pw.ts` to assert
  simultaneous alert/list visibility and restore of another item in the same
  dialog. Add only the smallest harness control needed for deterministic
  retries/failure if it is not already available.
- Keep all instrumentation test-only. No RPC/service changes are expected.
- Use new Sprint 106 Playwright output directories; do not overwrite S105
  evidence outputs or shared `desktop-app/test-results/`.