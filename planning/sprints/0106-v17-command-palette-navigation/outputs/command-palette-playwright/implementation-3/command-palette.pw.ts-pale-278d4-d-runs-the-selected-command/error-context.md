# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: command-palette.pw.ts >> palette filters, navigates enabled commands, and runs the selected command
- Location: tests\ui\command-palette.pw.ts:16:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByRole('dialog', { name: 'Commands' }).getByRole('option', { name: /Format active tab/ })
Expected: "true"
Received: "false"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" getByRole('dialog', { name: 'Commands' }).getByRole('option', { name: /Format active tab/ }) with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Commands' }).getByRole('option', { name: /Format active tab/ })
    14 × locator resolved to <button class="" type="button" role="option" tabindex="-1" aria-disabled="false" aria-selected="false" id="command-option-document.format">…</button>
       - unexpected value "false"

```

```yaml
- option "Format active tab"
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
  21  | 	const search = palette.getByRole("combobox", { name: "Search commands" });
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
  32  | 	const format = palette.getByRole("option", { name: /Format active tab/ });
  33  | 	const run = palette.getByRole("option", { name: /Run active document/ });
  34  | 	await expect(duplicate).toHaveAttribute("aria-selected", "true");
  35  | 	await expect(save).toBeDisabled();
  36  | 	await expect(save).toHaveAttribute("aria-selected", "false");
  37  | 	await expect(save).toContainText("No unsaved active tab");
  38  | 
  39  | 	await page.keyboard.press("ArrowDown");
> 40  | 	await expect(format).toHaveAttribute("aria-selected", "true");
      |                       ^ Error: expect(locator).toHaveAttribute(expected) failed
  41  | 	await page.keyboard.press("ArrowDown");
  42  | 	await expect(run).toHaveAttribute("aria-selected", "true");
  43  | 	await page.keyboard.press("ArrowDown");
  44  | 	await expect(run).toHaveAttribute("aria-selected", "true");
  45  | 	await page.keyboard.press("ArrowUp");
  46  | 	await expect(format).toHaveAttribute("aria-selected", "true");
  47  | 	await page.keyboard.press("ArrowUp");
  48  | 	await expect(move).toHaveAttribute("aria-selected", "true");
  49  | 	await page.keyboard.press("ArrowUp");
  50  | 	await expect(duplicate).toHaveAttribute("aria-selected", "true");
  51  | 	await page.keyboard.press("ArrowUp");
  52  | 	await expect(duplicate).toHaveAttribute("aria-selected", "true");
  53  | 
  54  | 	await page.keyboard.press("ArrowDown");
  55  | 	await page.keyboard.press("ArrowDown");
  56  | 	await page.keyboard.press("ArrowDown");
  57  | 	await expect(run).toHaveAttribute("aria-selected", "true");
  58  | 	await page.keyboard.press("Enter");
  59  | 	await expect(palette).toBeHidden();
  60  | 	await expect.poll(async () => (await jobRequests(page)).length).toBe(1);
  61  | 	await expect.poll(async () => (await jobRequests(page)).at(-1)?.operation).toBe("run");
  62  | 	await expect(opener).toBeFocused();
  63  | });
  64  | 
  65  | test("keyboard shortcut restores its invoker and palette Enter does not run global shortcuts", async ({ page }) => {
  66  | 	await openProjectFixture(page);
  67  | 	const preferences = page.getByRole("button", { name: "Preferences" });
  68  | 	await preferences.focus();
  69  | 	await page.keyboard.press("Control+Shift+P");
  70  | 	const palette = page.getByRole("dialog", { name: "Commands" });
  71  | 	const search = palette.getByRole("combobox", { name: "Search commands" });
  72  | 	await expect(search).toBeFocused();
  73  | 	await page.keyboard.press("Escape");
  74  | 	await expect(preferences).toBeFocused();
  75  | 
  76  | 	const opener = page.getByRole("button", { name: "Commands" });
  77  | 	await opener.click();
  78  | 	await search.fill("Focus editor");
  79  | 	const jobsBeforeRunShortcut = await jobRequests(page);
  80  | 	await page.keyboard.press("Control+Enter");
  81  | 	await expect(palette).toBeHidden();
  82  | 	await expect(page.locator(".workbench")).toHaveClass(/focus-editor/);
  83  | 	await page.waitForTimeout(350);
  84  | 	await expect(await jobRequests(page)).toHaveLength(jobsBeforeRunShortcut.length);
  85  | 
  86  | 	await opener.click();
  87  | 	await search.fill("Focus editor");
  88  | 	const jobsBeforePreviewShortcut = await jobRequests(page);
  89  | 	await page.keyboard.press("Control+Shift+Enter");
  90  | 	await expect(palette).toBeHidden();
  91  | 	await page.waitForTimeout(350);
  92  | 	await expect(await jobRequests(page)).toHaveLength(jobsBeforePreviewShortcut.length);
  93  | });
  94  | 
  95  | test("disabled and empty results stay safe, and clicking still routes Help", async ({ page }) => {
  96  | 	await page.goto("/");
  97  | 	const header = page.locator(".app-header");
  98  | 	await expect(header.getByRole("button", { name: "Help and shortcuts" })).toBeVisible();
  99  | 	await expect(header.getByRole("button", { name: "Preferences" })).toBeVisible();
  100 | 	await page.getByRole("button", { name: "Commands" }).click();
  101 | 	const palette = page.getByRole("dialog", { name: "Commands" });
  102 | 	const search = palette.getByRole("combobox", { name: "Search commands" });
  103 | 	await search.fill("New AMX file");
  104 | 	const disabled = palette.getByRole("option", { name: /New AMX file/ });
  105 | 	await expect(disabled).toBeDisabled();
  106 | 	await expect(disabled).toHaveAttribute("aria-disabled", "true");
  107 | 	await expect(disabled).toHaveAttribute("aria-selected", "false");
  108 | 	await expect(disabled).toContainText("Open a project first");
  109 | 	await page.keyboard.press("Enter");
  110 | 	await expect(palette).toBeVisible();
  111 | 	await expect(await jobRequests(page)).toHaveLength(0);
  112 | 
  113 | 	await search.fill("no command matches this");
  114 | 	await expect(palette.getByText("No matching commands.")).toBeVisible();
  115 | 	await search.fill("Help and shortcuts");
  116 | 	await palette.getByRole("option", { name: /Help and shortcuts/ }).click();
  117 | 	await expect(palette).toBeHidden();
  118 | 	await expect(page.getByRole("dialog", { name: "Help and shortcuts" })).toBeVisible();
  119 | });
```