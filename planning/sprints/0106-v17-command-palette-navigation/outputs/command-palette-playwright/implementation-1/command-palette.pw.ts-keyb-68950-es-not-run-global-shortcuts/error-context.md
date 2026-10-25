# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: command-palette.pw.ts >> keyboard shortcut restores its invoker and palette Enter does not run global shortcuts
- Location: tests\ui\command-palette.pw.ts:61:1

# Error details

```
Error: expect(locator).toBeFocused() failed

Locator: getByRole('dialog', { name: 'Commands' }).getByRole('textbox', { name: 'Search commands' })
Expected: focused
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeFocused" getByRole('dialog', { name: 'Commands' }).getByRole('textbox', { name: 'Search commands' }) with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Commands' }).getByRole('textbox', { name: 'Search commands' })

```

```yaml
- button "Fail next preview"
- main:
  - text: OpenAMX - V0.16.1 /sprint042-browser-fixture
  - button "Help and shortcuts"
  - button "Preferences"
  - button "Commands"
  - complementary "Project explorer":
    - text: PROJECT 2/4
    - button "Project actions"
    - textbox "Search project files":
      - /placeholder: Search files
    - paragraph: Root Folder
    - button "report.amx amx"
    - button "data.csv csv"
    - button "libraries, folder actions": libraries
    - button "asset-management.amx amx"
    - button "reports, folder actions": reports
    - button "preview.html html-output"
  - separator "Resize explorer"
  - region "Document editor":
    - navigation "Open tabs":
      - button "report.amx"
      - button "Close report.amx": x
    - strong: /sprint042-browser-fixture/report.amx
    - button "Find"
    - button "Format"
    - button "Save" [disabled]
    - button "Show outline"
    - textbox "OpenAMX source"
  - separator "Resize contextual pane"
  - region "Active document context":
    - tablist "Context view":
      - tab "Preview" [selected]
      - tab "Inputs"
    - text: success
    - button "Pause live preview"
    - button "Refresh preview"
    - button "Export active document": Export
    - button "Report settings"
    - iframe
  - region "Runtime drawer":
    - strong: RUNTIME
    - text: idle
    - button "Run active document"
    - button "Details"
    - button "Bottom" [pressed]
    - button "Right"
    - status: Preview reflects the current buffer.
  - dialog "Commands":
    - combobox "Search commands" [expanded]
    - listbox "Commands":
      - option "Help and shortcuts" [selected]
      - option "Release notes"
      - option "Download diagnostic summary"
      - option "Preferences"
      - option "Open project Ctrl/Cmd+O"
      - option "Create project"
      - option "New AMX file"
      - option "New CSS file"
      - option "New folder"
      - option "Duplicate active file"
      - option "Move or rename active file"
      - option "Open file Ctrl/Cmd+Shift+O"
      - option "Next tab Open another tab first" [disabled]
      - option "Previous tab Open another tab first" [disabled]
      - option "Save active tab No unsaved active tab" [disabled]
      - option "Format active tab"
      - option "Run active document Ctrl/Cmd+Enter"
      - option "Refresh preview Ctrl/Cmd+Shift+Enter"
      - option "Pause live preview"
      - option "Report Settings"
      - option "Search project Ctrl/Cmd+Shift+F"
      - option "Focus editor"
      - option "Focus preview"
      - option "Export…"
      - option "Clear recent projects History is empty" [disabled]
    - button "Close"
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
> 68  | 	await expect(search).toBeFocused();
      |                       ^ Error: expect(locator).toBeFocused() failed
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
  97  | 	await search.fill("New AMX file");
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