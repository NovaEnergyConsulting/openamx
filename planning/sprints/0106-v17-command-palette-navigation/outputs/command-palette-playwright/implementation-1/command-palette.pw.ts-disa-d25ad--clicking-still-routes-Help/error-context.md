# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: command-palette.pw.ts >> disabled and empty results stay safe, and clicking still routes Help
- Location: tests\ui\command-palette.pw.ts:89:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('dialog', { name: 'Commands' }).getByRole('textbox', { name: 'Search commands' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Fail next preview" [ref=e4] [cursor=pointer]
  - main [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: OpenAMX - V0.16.1
      - generic [ref=e8]: Welcome
      - button "Help and shortcuts" [ref=e9] [cursor=pointer]
      - button "Preferences" [ref=e13] [cursor=pointer]
      - button "Commands" [ref=e17] [cursor=pointer]
    - region "Welcome to OpenAMX" [ref=e18]:
      - paragraph [ref=e19]: OPENAMX WORKBENCH
      - heading "Open or create a project" [level=1] [ref=e20]
      - paragraph [ref=e21]: Create a project in an empty folder, open an existing project or choose a recent project from the list below.
      - generic [ref=e22]:
        - button "Open project" [ref=e23] [cursor=pointer]
        - button "Create project" [ref=e24] [cursor=pointer]
      - status [ref=e25]: Open a project and an .amx file to begin.
      - region "Recent projects" [ref=e26]:
        - generic [ref=e27]: RECENT PROJECTS
        - paragraph [ref=e29]: No validated recent projects.
      - generic [ref=e30]: "Recovery: no snapshots to restore"
      - generic [ref=e32]:
        - button "Help and shortcuts" [ref=e33] [cursor=pointer]
        - button "Release notes" [ref=e34] [cursor=pointer]
    - dialog "Commands" [ref=e36]:
      - combobox "Search commands" [expanded] [active] [ref=e37]
      - listbox "Commands" [ref=e38]:
        - option "Help and shortcuts" [selected] [ref=e39] [cursor=pointer]
        - option "Release notes" [ref=e40] [cursor=pointer]
        - option "Download diagnostic summary" [ref=e41] [cursor=pointer]
        - option "Preferences" [ref=e42] [cursor=pointer]
        - option "Open project Ctrl/Cmd+O" [ref=e43] [cursor=pointer]:
          - text: Open project
          - generic [ref=e44]: Ctrl/Cmd+O
        - option "Create project" [ref=e45] [cursor=pointer]
        - option "New AMX file Open a project first" [disabled] [ref=e46]:
          - text: New AMX file
          - generic [ref=e47]: Open a project first
        - option "New CSS file Open a project first" [disabled] [ref=e48]:
          - text: New CSS file
          - generic [ref=e49]: Open a project first
        - option "New folder Open a project first" [disabled] [ref=e50]:
          - text: New folder
          - generic [ref=e51]: Open a project first
        - option "Duplicate active file Open an editable project file first" [disabled] [ref=e52]:
          - text: Duplicate active file
          - generic [ref=e53]: Open an editable project file first
        - option "Move or rename active file Open an editable project file first" [disabled] [ref=e54]:
          - text: Move or rename active file
          - generic [ref=e55]: Open an editable project file first
        - option "Open file Open a project first" [disabled] [ref=e56]:
          - text: Open file
          - generic [ref=e57]: Open a project first
        - option "Next tab Open another tab first" [disabled] [ref=e58]:
          - text: Next tab
          - generic [ref=e59]: Open another tab first
        - option "Previous tab Open another tab first" [disabled] [ref=e60]:
          - text: Previous tab
          - generic [ref=e61]: Open another tab first
        - option "Save active tab No unsaved active tab" [disabled] [ref=e62]:
          - text: Save active tab
          - generic [ref=e63]: No unsaved active tab
        - option "Format active tab Open an AMX document first" [disabled] [ref=e64]:
          - text: Format active tab
          - generic [ref=e65]: Open an AMX document first
        - option "Run active document Open an AMX document first" [disabled] [ref=e66]:
          - text: Run active document
          - generic [ref=e67]: Open an AMX document first
        - option "Refresh preview Open an AMX document first" [disabled] [ref=e68]:
          - text: Refresh preview
          - generic [ref=e69]: Open an AMX document first
        - option "Pause live preview Open an AMX document first" [disabled] [ref=e70]:
          - text: Pause live preview
          - generic [ref=e71]: Open an AMX document first
        - option "Report Settings Open an AMX document first" [disabled] [ref=e72]:
          - text: Report Settings
          - generic [ref=e73]: Open an AMX document first
        - option "Search project Open a project first" [disabled] [ref=e74]:
          - text: Search project
          - generic [ref=e75]: Open a project first
        - option "Focus editor Open a document first" [disabled] [ref=e76]:
          - text: Focus editor
          - generic [ref=e77]: Open a document first
        - option "Focus preview Open an AMX document first" [disabled] [ref=e78]:
          - text: Focus preview
          - generic [ref=e79]: Open an AMX document first
        - option "Export… Open an AMX document first" [disabled] [ref=e80]:
          - text: Export…
          - generic [ref=e81]: Open an AMX document first
        - option "Clear recent projects History is empty" [disabled] [ref=e82]:
          - text: Clear recent projects
          - generic [ref=e83]: History is empty
      - button "Close" [ref=e84] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | 
  3   | type PaletteHarnessWindow = Window & {
  4   | 	__openamxHarnessSnapshot: () => { jobRequests: Array<{ operation: string }> };
  5   | };
  6   | 
  7   | async function openProjectFixture(page: Page) {
  8   | 	await page.goto("/?scenario=project-explorer-workflows");
  9   | 	await page.getByRole("button", { name: "Open project" }).click();
  10  | }
  11  | 
  12  | async function jobRequests(page: Page) {
  13  | 	return page.evaluate(() => (window as PaletteHarnessWindow).__openamxHarnessSnapshot().jobRequests);
  14  | }
  15  | 
  16  | test("palette filters, navigates enabled commands, and runs the selected command", async ({ page }) => {
  17  | 	await openProjectFixture(page);
  18  | 	const opener = page.getByRole("button", { name: "Commands" });
  19  | 	await opener.click();
  20  | 	const palette = page.getByRole("dialog", { name: "Commands" });
  21  | 	const search = palette.getByRole("textbox", { name: "Search commands" });
  22  | 	await expect(search).toBeFocused();
  23  | 	const firstCommand = palette.getByRole("option").first();
  24  | 	await expect(firstCommand).toHaveAttribute("aria-selected", "true");
  25  | 	await expect(firstCommand).toHaveClass(/command-selected/);
  26  | 	await expect(firstCommand).toContainText("Help and shortcuts");
  27  | 
  28  | 	await search.fill("active");
  29  | 	const duplicate = palette.getByRole("option", { name: /Duplicate active file/ });
  30  | 	const move = palette.getByRole("option", { name: /Move or rename active file/ });
  31  | 	const save = palette.getByRole("option", { name: /Save active tab/ });
  32  | 	const run = palette.getByRole("option", { name: /Run active document/ });
  33  | 	await expect(duplicate).toHaveAttribute("aria-selected", "true");
  34  | 	await expect(save).toBeDisabled();
  35  | 	await expect(save).toHaveAttribute("aria-selected", "false");
  36  | 	await expect(save).toContainText("No unsaved active tab");
  37  | 
  38  | 	await page.keyboard.press("ArrowDown");
  39  | 	await expect(move).toHaveAttribute("aria-selected", "true");
  40  | 	await page.keyboard.press("ArrowDown");
  41  | 	await expect(run).toHaveAttribute("aria-selected", "true");
  42  | 	await page.keyboard.press("ArrowDown");
  43  | 	await expect(run).toHaveAttribute("aria-selected", "true");
  44  | 	await page.keyboard.press("ArrowUp");
  45  | 	await expect(move).toHaveAttribute("aria-selected", "true");
  46  | 	await page.keyboard.press("ArrowUp");
  47  | 	await expect(duplicate).toHaveAttribute("aria-selected", "true");
  48  | 	await page.keyboard.press("ArrowUp");
  49  | 	await expect(duplicate).toHaveAttribute("aria-selected", "true");
  50  | 
  51  | 	await page.keyboard.press("ArrowDown");
  52  | 	await page.keyboard.press("ArrowDown");
  53  | 	await expect(run).toHaveAttribute("aria-selected", "true");
  54  | 	await page.keyboard.press("Enter");
  55  | 	await expect(palette).toBeHidden();
  56  | 	await expect.poll(async () => (await jobRequests(page)).length).toBe(1);
  57  | 	await expect.poll(async () => (await jobRequests(page)).at(-1)?.operation).toBe("run");
  58  | 	await expect(opener).toBeFocused();
  59  | });
  60  | 
  61  | test("keyboard shortcut restores its invoker and palette Enter does not run global shortcuts", async ({ page }) => {
  62  | 	await openProjectFixture(page);
  63  | 	const preferences = page.getByRole("button", { name: "Preferences" });
  64  | 	await preferences.focus();
  65  | 	await page.keyboard.press("Control+Shift+P");
  66  | 	const palette = page.getByRole("dialog", { name: "Commands" });
  67  | 	const search = palette.getByRole("textbox", { name: "Search commands" });
  68  | 	await expect(search).toBeFocused();
  69  | 	await page.keyboard.press("Escape");
  70  | 	await expect(preferences).toBeFocused();
  71  | 
  72  | 	const opener = page.getByRole("button", { name: "Commands" });
  73  | 	await opener.click();
  74  | 	await search.fill("Focus editor");
  75  | 	await page.keyboard.press("Control+Enter");
  76  | 	await expect(palette).toBeHidden();
  77  | 	await expect(page.locator(".workbench")).toHaveClass(/focus-editor/);
  78  | 	await page.waitForTimeout(350);
  79  | 	await expect(await jobRequests(page)).toHaveLength(0);
  80  | 
  81  | 	await opener.click();
  82  | 	await search.fill("Focus editor");
  83  | 	await page.keyboard.press("Control+Shift+Enter");
  84  | 	await expect(palette).toBeHidden();
  85  | 	await page.waitForTimeout(350);
  86  | 	await expect(await jobRequests(page)).toHaveLength(0);
  87  | });
  88  | 
  89  | test("disabled and empty results stay safe, and clicking still routes Help", async ({ page }) => {
  90  | 	await page.goto("/");
  91  | 	const header = page.locator(".app-header");
  92  | 	await expect(header.getByRole("button", { name: "Help and shortcuts" })).toBeVisible();
  93  | 	await expect(header.getByRole("button", { name: "Preferences" })).toBeVisible();
  94  | 	await page.getByRole("button", { name: "Commands" }).click();
  95  | 	const palette = page.getByRole("dialog", { name: "Commands" });
  96  | 	const search = palette.getByRole("textbox", { name: "Search commands" });
> 97  | 	await search.fill("New AMX file");
      |               ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  98  | 	const disabled = palette.getByRole("option", { name: /New AMX file/ });
  99  | 	await expect(disabled).toBeDisabled();
  100 | 	await expect(disabled).toHaveAttribute("aria-disabled", "true");
  101 | 	await expect(disabled).toHaveAttribute("aria-selected", "false");
  102 | 	await expect(disabled).toContainText("Open a project first");
  103 | 	await page.keyboard.press("Enter");
  104 | 	await expect(palette).toBeVisible();
  105 | 	await expect(await jobRequests(page)).toHaveLength(0);
  106 | 
  107 | 	await search.fill("no command matches this");
  108 | 	await expect(palette.getByText("No matching commands.")).toBeVisible();
  109 | 	await search.fill("Help and shortcuts");
  110 | 	await palette.getByRole("option", { name: /Help and shortcuts/ }).click();
  111 | 	await expect(palette).toBeHidden();
  112 | 	await expect(page.getByRole("dialog", { name: "Help and shortcuts" })).toBeVisible();
  113 | });
```