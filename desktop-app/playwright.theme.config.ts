import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/ui",
	testMatch: "**/theme.pw.ts",
	reporter: "list",
	use: { browserName: "chromium", headless: true }
});
