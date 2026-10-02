export default {
	app: {
		name: "OpenAMX Sprint 041 Data Editor Proof",
		identifier: "dev.openamx.sprint041-data-editor-proof",
		version: "0.1.0"
	},
	build: {
		mainProcess: "bun",
		bun: {
			entrypoint: "src/bun/index.ts"
		},
		copy: {
			"dist/index.html": "views/mainview/index.html",
			"dist/assets": "views/mainview/assets"
		},
		watchIgnore: ["dist/**"],
		mac: { bundleCEF: false },
		linux: { bundleCEF: false },
		win: { bundleCEF: false }
	}
};