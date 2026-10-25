# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: command-palette.pw.ts >> selection clears when the selected command becomes unavailable while open
- Location: tests\ui\command-palette.pw.ts:103:1

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator:  getByRole('dialog', { name: 'Commands' }).getByRole('option', { name: /Save active tab/ })
Expected: disabled
Received: enabled
Timeout:  5000ms

Call log:
  - Expect "toBeDisabled" getByRole('dialog', { name: 'Commands' }).getByRole('option', { name: /Save active tab/ }) with timeout 5000ms
  - waiting for getByRole('dialog', { name: 'Commands' }).getByRole('option', { name: /Save active tab/ })
    14 × locator resolved to <button type="button" role="option" tabindex="-1" title="Ctrl/Cmd+S" aria-selected="true" aria-disabled="false" class="command-selected" id="command-option-document.save">…</button>
       - unexpected value "enabled"

```

```yaml
- option "Save active tab Ctrl/Cmd+S" [selected]
```

# Test source

```ts
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
  40  | 	await expect(move).toHaveAttribute("aria-selected", "true");
  41  | 	await page.keyboard.press("ArrowDown");
  42  | 	await expect(format).toHaveAttribute("aria-selected", "true");
  43  | 	await page.keyboard.press("ArrowDown");
  44  | 	await expect(run).toHaveAttribute("aria-selected", "true");
  45  | 	await page.keyboard.press("ArrowDown");
  46  | 	await expect(run).toHaveAttribute("aria-selected", "true");
  47  | 	await page.keyboard.press("ArrowUp");
  48  | 	await expect(format).toHaveAttribute("aria-selected", "true");
  49  | 	await page.keyboard.press("ArrowUp");
  50  | 	await expect(move).toHaveAttribute("aria-selected", "true");
  51  | 	await page.keyboard.press("ArrowUp");
  52  | 	await expect(duplicate).toHaveAttribute("aria-selected", "true");
  53  | 	await page.keyboard.press("ArrowUp");
  54  | 	await expect(duplicate).toHaveAttribute("aria-selected", "true");
  55  | 
  56  | 	await page.keyboard.press("ArrowDown");
  57  | 	await page.keyboard.press("ArrowDown");
  58  | 	await page.keyboard.press("ArrowDown");
  59  | 	await expect(run).toHaveAttribute("aria-selected", "true");
  60  | 	await page.keyboard.press("Enter");
  61  | 	await expect(palette).toBeHidden();
  62  | 	await expect.poll(async () => (await jobRequests(page)).length).toBe(1);
  63  | 	await expect.poll(async () => (await jobRequests(page)).at(-1)?.operation).toBe("run");
  64  | 	await expect(opener).toBeFocused();
  65  | });
  66  | 
  67  | test("keyboard shortcut restores its invoker and palette Enter does not run global shortcuts", async ({ page }) => {
  68  | 	await openProjectFixture(page);
  69  | 	const preferences = page.getByRole("button", { name: "Preferences" });
  70  | 	await preferences.focus();
  71  | 	await page.keyboard.press("Control+Shift+P");
  72  | 	const palette = page.getByRole("dialog", { name: "Commands" });
  73  | 	const search = palette.getByRole("combobox", { name: "Search commands" });
  74  | 	await expect(search).toBeFocused();
  75  | 	await page.keyboard.press("Escape");
  76  | 	await expect(preferences).toBeFocused();
  77  | 
  78  | 	const opener = page.getByRole("button", { name: "Commands" });
  79  | 	await opener.click();
  80  | 	await page.locator(".palette-backdrop").click({ position: { x: 8, y: 8 } });
  81  | 	await expect(palette).toBeHidden();
  82  | 	await expect(opener).toBeFocused();
  83  | 
  84  | 	await opener.click();
  85  | 	await search.fill("Focus editor");
  86  | 	await expect.poll(async () => (await jobRequests(page)).length).toBe(1);
  87  | 	const jobsBeforeRunShortcut = await jobRequests(page);
  88  | 	await page.keyboard.press("Control+Enter");
  89  | 	await expect(palette).toBeHidden();
  90  | 	await expect(page.locator(".workbench")).toHaveClass(/focus-editor/);
  91  | 	await page.waitForTimeout(350);
  92  | 	await expect(await jobRequests(page)).toHaveLength(jobsBeforeRunShortcut.length);
  93  | 
  94  | 	await opener.click();
  95  | 	await search.fill("Focus editor");
  96  | 	const jobsBeforePreviewShortcut = await jobRequests(page);
  97  | 	await page.keyboard.press("Control+Shift+Enter");
  98  | 	await expect(palette).toBeHidden();
  99  | 	await page.waitForTimeout(350);
  100 | 	await expect(await jobRequests(page)).toHaveLength(jobsBeforePreviewShortcut.length);
  101 | });
  102 | 
  103 | test("selection clears when the selected command becomes unavailable while open", async ({ page }) => {
  104 | 	await openProjectFixture(page);
  105 | 	const editor = page.locator(".cm-content").first();
  106 | 	await editor.click();
  107 | 	await page.keyboard.press("End");
  108 | 	await page.keyboard.type(" ");
  109 | 
  110 | 	const opener = page.getByRole("button", { name: "Commands" });
  111 | 	await opener.click();
  112 | 	const palette = page.getByRole("dialog", { name: "Commands" });
  113 | 	const search = palette.getByRole("combobox", { name: "Search commands" });
  114 | 	await search.fill("Save active tab");
  115 | 	const save = palette.getByRole("option", { name: /Save active tab/ });
  116 | 	await expect(save).toBeEnabled();
  117 | 	await expect(save).toHaveAttribute("aria-selected", "true");
  118 | 
  119 | 	await page.keyboard.press("Control+S");
> 120 | 	await expect(save).toBeDisabled();
      |                     ^ Error: expect(locator).toBeDisabled() failed
  121 | 	await expect(save).toHaveAttribute("aria-selected", "false");
  122 | 	await expect.poll(() => search.getAttribute("aria-activedescendant")).toBeNull();
  123 | 	await page.keyboard.press("Enter");
  124 | 	await expect(palette).toBeVisible();
  125 | });
  126 | 
  127 | test("disabled and empty results stay safe, and clicking still routes Help", async ({ page }) => {
  128 | 	await page.goto("/");
  129 | 	const header = page.locator(".app-header");
  130 | 	await expect(header.getByRole("button", { name: "Help and shortcuts" })).toBeVisible();
  131 | 	await expect(header.getByRole("button", { name: "Preferences" })).toBeVisible();
  132 | 	await page.getByRole("button", { name: "Commands" }).click();
  133 | 	const palette = page.getByRole("dialog", { name: "Commands" });
  134 | 	const search = palette.getByRole("combobox", { name: "Search commands" });
  135 | 	await search.fill("New AMX file");
  136 | 	const disabled = palette.getByRole("option", { name: /New AMX file/ });
  137 | 	await expect(disabled).toBeDisabled();
  138 | 	await expect(disabled).toHaveAttribute("aria-disabled", "true");
  139 | 	await expect(disabled).toHaveAttribute("aria-selected", "false");
  140 | 	await expect(disabled).toContainText("Open a project first");
  141 | 	await page.keyboard.press("Enter");
  142 | 	await expect(palette).toBeVisible();
  143 | 	await expect(await jobRequests(page)).toHaveLength(0);
  144 | 
  145 | 	await search.fill("no command matches this");
  146 | 	await expect(palette.getByText("No matching commands.")).toBeVisible();
  147 | 	await search.fill("Help and shortcuts");
  148 | 	await palette.getByRole("option", { name: /Help and shortcuts/ }).click();
  149 | 	await expect(palette).toBeHidden();
  150 | 	await expect(page.getByRole("dialog", { name: "Help and shortcuts" })).toBeVisible();
  151 | });
```