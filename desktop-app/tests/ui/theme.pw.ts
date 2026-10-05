import { expect, test, type Page } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const assets = resolve(import.meta.dirname, "..", "..", "dist", "assets");
const stylesheet = readdirSync(assets).find(name => /^index-.*\.css$/.test(name));
if (!stylesheet) throw new Error("Build the desktop webview with bun run build:web before running theme tests.");
const css = readFileSync(resolve(assets, stylesheet), "utf8");
const codeScope = css.match(/\.code-editor\[(data-v-[\w]+)\]/)?.[1];
if (!codeScope) throw new Error("Built code editor styles were not found.");

async function mountThemeSurfaces(page: Page, theme: string) {
	await page.setContent(`
		<main>
			<section class="welcome"><h1>OpenAMX</h1><p class="welcome-copy">Local authoring workbench</p>
				<div class="welcome-actions"><button>Open project</button><button class="quiet-button">Help</button></div>
			</section>
			<section class="workbench">
				<aside class="explorer"><input placeholder="Search"><button class="file selected">report.amx</button></aside>
				<div class="editor-pane"><div class="tabs"><div class="tab"><button aria-current="page">report.amx</button></div></div>
					<div class="code-editor" ${codeScope}><div class="cm-editor"><div class="cm-gutters">1</div><div class="cm-content">
						<span class="amx-token-keyword">let</span><span class="amx-token-declaration">value</span>
						<span class="amx-token-reference">value</span><span class="amx-token-field">field</span>
						<span class="amx-token-type">number</span><span class="amx-token-literal">1</span>
					</div></div></div>
				</div>
				<div class="runtime-drawer"><p class="runtime-status">Idle</p><button class="diagnostic-link">Diagnostic</button>
					<span class="state state-success">success</span><span class="state state-warning">warning</span><span class="state state-failure">failure</span>
				</div>
			</section>
			<section class="preferences-dialog"><label class="settings-field">Appearance<input value="Follow system"></label></section>
			<div class="data-grid-shell"><div class="table-probe">CSV cell</div></div>
			<div class="json-tree-shell jse-theme-dark"><div class="json-key-probe">JSON key</div><div class="json-menu-probe">Menu</div></div>
		</main>`);
	await page.addStyleTag({ content: css });
	await page.addStyleTag({ content: `
		.table-probe { background: var(--vxe-ui-layout-background-color); color: var(--vxe-ui-font-color); }
		.json-key-probe { background: var(--jse-background-color); color: var(--jse-key-color); }
		.json-menu-probe { background: var(--jse-theme-color); color: var(--jse-menu-color); }
		.state-warning { color: var(--shell-warning); }
		main { height: auto; overflow: visible; }
		.welcome { margin: 0 auto 24px; }
		.workbench { min-height: 300px; flex: none; }
		.workbench .editor-pane { grid-column: 3 / -1; }
		.data-grid-shell, .json-tree-shell { min-height: 0; flex: none; margin-top: 12px; }
	` });
	await page.evaluate(selected => { document.documentElement.dataset.theme = selected; }, theme);
}

async function checkThemeContrast(page: Page, appearance: string) {
	const results = await page.evaluate(() => {
		const luminance = (color: string) => {
			const channels = color.match(/[\d.]+/g);
			if (!channels || !color.startsWith("rgb")) throw new Error(`Unsupported computed colour: ${color}`);
			const [r = 0, g = 0, b = 0] = channels.slice(0, 3).map(Number).map(value => {
				const channel = value / 255;
				return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
			});
			return .2126 * r + .7152 * g + .0722 * b;
		};
		const contrast = (foreground: string, background: string) => {
			const a = luminance(foreground), b = luminance(background);
			return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
		};
		const style = (selector: string) => {
			const element = document.querySelector(selector);
			if (!element) throw new Error(`Missing theme surface: ${selector}`);
			return getComputedStyle(element);
		};
		const textPairs = [
			[".welcome h1", ".welcome"], [".welcome-copy", ".welcome"], [".welcome-actions button", ".welcome-actions button"],
			[".tab button", ".tab button"], [".file.selected", ".file.selected"], [".explorer input", ".explorer input"],
			[".cm-content", ".cm-editor"], [".cm-gutters", ".cm-gutters"], [".runtime-status", ".runtime-drawer"],
			[".diagnostic-link", ".runtime-drawer"], [".state-success", ".runtime-drawer"],
			[".state-warning", ".runtime-drawer"], [".state-failure", ".runtime-drawer"],
			[".settings-field", ".preferences-dialog"], [".table-probe", ".table-probe"],
			[".json-key-probe", ".json-key-probe"], [".json-menu-probe", ".json-menu-probe"],
			...["keyword", "declaration", "reference", "field", "type", "literal"].flatMap(kind =>
				[".cm-editor", ".runtime-drawer", ".file.selected"].map(surface => [`.amx-token-${kind}`, surface]))
		];
		return {
			text: textPairs.map(([foreground, background]) => ({
				selector: foreground!, ratio: contrast(style(foreground!).color, style(background!).backgroundColor)
			})),
			boundaries: [".explorer input", ".preferences-dialog"].map(selector => ({
				selector, ratio: contrast(style(selector).borderTopColor, style(selector).backgroundColor)
			})),
			focus: contrast(style(".explorer input").outlineColor, style(".explorer").backgroundColor),
			palette: {
				background: style("main").backgroundColor,
				surface: style(".cm-editor").backgroundColor,
				raised: style(".runtime-drawer").backgroundColor,
				selection: style(".file.selected").backgroundColor,
				accent: style(".welcome-actions button").backgroundColor,
				link: style(".diagnostic-link").color,
				jsonKey: style(".json-key-probe").color,
				success: style(".state-success").color,
				warning: style(".state-warning").color,
				danger: style(".state-failure").color,
				body: style("body").backgroundColor,
				editorTheme: style(".json-tree-shell").getPropertyValue("--jse-theme").trim()
			}
		};
	});
	for (const value of results.text) expect(value.ratio, `${appearance} text ${value.selector}`).toBeGreaterThanOrEqual(4.5);
	for (const value of results.boundaries) expect(value.ratio, `${appearance} boundary ${value.selector}`).toBeGreaterThanOrEqual(3);
	expect(results.focus, `${appearance} focus`).toBeGreaterThanOrEqual(3);
	return results.palette;
}

for (const theme of ["light", "dark", "system"] as const) {
	for (const system of ["light", "dark"] as const) {
		test(`${theme} appearance with ${system} system uses accessible branded colours`, async ({ page }, testInfo) => {
			await page.emulateMedia({ colorScheme: system });
			await mountThemeSurfaces(page, theme);
			await page.locator(".explorer input").focus();
			const palette = await checkThemeContrast(page, `${theme}/${system}`);
			const dark = theme === "dark" || (theme === "system" && system === "dark");
			expect(palette).toEqual({
				background: dark ? "rgb(15, 16, 20)" : "rgb(243, 240, 252)",
				surface: dark ? "rgb(25, 26, 32)" : "rgb(253, 252, 255)",
				raised: dark ? "rgb(35, 36, 45)" : "rgb(233, 227, 248)",
				selection: dark ? "rgb(48, 49, 63)" : "rgb(226, 217, 248)",
				accent: dark ? "rgb(167, 139, 250)" : "rgb(76, 59, 152)",
				link: dark ? "rgb(103, 232, 249)" : "rgb(9, 101, 121)",
				jsonKey: dark ? "rgb(103, 232, 249)" : "rgb(9, 101, 121)",
				success: dark ? "rgb(168, 223, 189)" : "rgb(23, 92, 56)",
				warning: dark ? "rgb(243, 201, 105)" : "rgb(120, 81, 16)",
				danger: dark ? "rgb(255, 180, 169)" : "rgb(152, 47, 42)",
				body: dark ? "rgb(15, 16, 20)" : "rgb(243, 240, 252)",
				editorTheme: dark ? "dark" : "light"
			});
			await page.screenshot({ path: testInfo.outputPath(`theme-${theme}-${system}.png`), fullPage: true });
			if (theme === "system") {
				await page.emulateMedia({ colorScheme: system === "dark" ? "light" : "dark" });
				const updated = await checkThemeContrast(page, "system changed");
				expect(updated.accent).toBe(dark ? "rgb(76, 59, 152)" : "rgb(167, 139, 250)");
				expect(updated.background).toBe(dark ? "rgb(243, 240, 252)" : "rgb(15, 16, 20)");
			}
		});
	}
}
