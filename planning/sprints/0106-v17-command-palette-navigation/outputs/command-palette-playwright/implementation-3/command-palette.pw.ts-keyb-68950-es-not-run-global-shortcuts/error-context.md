# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: command-palette.pw.ts >> keyboard shortcut restores its invoker and palette Enter does not run global shortcuts
- Location: tests\ui\command-palette.pw.ts:65:1

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  [{"identity": {"canonicalActiveUri": "file:///sprint042-browser-fixture/report.amx", "documentRevision": 0, "inputSettingsRevision": 1, "projectGeneration": 0}, "operation": "preview"}]
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Fail next preview" [ref=e4] [cursor=pointer]
  - main [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]: OpenAMX - V0.16.1
      - generic [ref=e8]: /sprint042-browser-fixture
      - button "Help and shortcuts" [ref=e9] [cursor=pointer]
      - button "Preferences" [ref=e13] [cursor=pointer]
      - button "Commands" [ref=e17] [cursor=pointer]
    - generic [ref=e18]:
      - separator "Resize explorer"
      - region "Document editor" [ref=e19]:
        - navigation "Open tabs" [ref=e20]:
          - generic [ref=e21]:
            - button "report.amx" [ref=e22] [cursor=pointer]
            - button "Close report.amx" [ref=e23] [cursor=pointer]: x
        - generic [ref=e24]:
          - strong [ref=e25]: /sprint042-browser-fixture/report.amx
          - generic [ref=e26]:
            - button "Find" [ref=e27] [cursor=pointer]
            - button "Format" [disabled] [ref=e28]
            - button "Save" [disabled] [ref=e29]
        - button "Show outline" [ref=e30] [cursor=pointer]
        - generic "OpenAMX source editor" [ref=e32]:
          - generic [ref=e34]:
            - generic [aria-hidden] [ref=e35]:
              - generic [ref=e36]:
                - generic [ref=e37]: "1"
                - generic [ref=e38]: "2"
                - generic [ref=e39]: "3"
                - generic [ref=e40]: "4"
                - generic [ref=e41]: "5"
                - generic [ref=e42]: "6"
              - generic [ref=e43]:
                - generic [ref=e44]: ⌄
                - generic [ref=e45]: ⌄
            - textbox "OpenAMX source" [active] [ref=e46]:
              - generic [ref=e47]: "# Sprint 042 report"
              - generic [ref=e49]: "```amx"
              - generic [ref=e50]: "export let result: Number = 3"
              - generic [ref=e51]: "```"
      - separator "Resize contextual pane"
      - region "Runtime drawer" [ref=e53]:
        - generic [ref=e54]:
          - strong [ref=e55]: RUNTIME
          - generic [ref=e56]: running
          - button "Run active document" [ref=e57] [cursor=pointer]
          - button "Cancel current job" [ref=e60] [cursor=pointer]: Cancel
          - button "Details" [ref=e61] [cursor=pointer]
          - button "Bottom" [pressed] [ref=e62] [cursor=pointer]
          - button "Right" [ref=e63] [cursor=pointer]
        - status [ref=e64]: Restored active file. 4 .amx file(s) in project.
        - progressbar "Current operation is running" [ref=e65]
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
  40  | 	await expect(format).toHaveAttribute("aria-selected", "true");
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
> 84  | 	await expect(await jobRequests(page)).toHaveLength(jobsBeforeRunShortcut.length);
      |                                        ^ Error: expect(received).toHaveLength(expected)
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