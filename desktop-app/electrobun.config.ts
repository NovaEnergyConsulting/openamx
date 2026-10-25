import { appMetadata } from "./app-metadata";

export default {
	app: {
		...appMetadata,
	},
	build: {
		mainProcess: "bun",
		buildFolder: process.env.OPENAMX_ELECTROBUN_BUILD_FOLDER ?? "build",
		bun: {
			entrypoint: "src/bun/index.ts",
		},
		// Vite builds to dist/, we copy from there
		copy: {
			"dist/index.html": "views/mainview/index.html",
			"dist/assets": "views/mainview/assets",
			"dist/jobWorker.js": "bun/jobWorker.js",
			"dist/native-sharp": "bun/node_modules",
			"dist/pdfmake-fonts": "bun/pdfmake-fonts",
			"dist/guide": "bun/guide",
		},
		// Ignore Vite output in watch mode — HMR handles view rebuilds separately
		watchIgnore: ["dist/**", ".cottontail-tmp/**"],
		mac: {
			bundleCEF: false,
		},
		linux: {
			bundleCEF: false,
			icon: "assets/images/icon.png",
		},
		win: {
			bundleCEF: false,
			icon: "assets/images/icon.ico"
		},
	},
};
