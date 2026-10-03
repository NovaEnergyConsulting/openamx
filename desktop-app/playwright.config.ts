import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/ui",
	testMatch: "**/*.pw.ts",
	fullyParallel: false,
	reporter: "list",
	use: {
		baseURL: "http://127.0.0.1:4183",
		browserName: "chromium",
		headless: true
	},
	webServer: {
		command: "./node_modules/.bin/vite --config spikes/sprint042-workflow-harness/vite.config.ts --host 127.0.0.1 --port 4183 --strictPort",
		url: "http://127.0.0.1:4183/",
		reuseExistingServer: !process.env.CI,
		timeout: 30_000
	}
});
