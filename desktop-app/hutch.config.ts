export default {
	packageManager: "bun",
	scripts: {
		install: ["hutch", "pm", "install", "--frozen-lockfile"],
		dev: ["bun", "run", "dev"],
		typecheck: ["bun", "run", "typecheck"],
		test: ["bun", "test"],
		build: ["bun", "run", "build"],
		run: ["bun", "run", "run"],
	},
	electrobun: {
		version: "2.0.1",
	},
};
