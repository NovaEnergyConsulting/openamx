import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
	root: resolve(__dirname),
	plugins: [vue(), tailwindcss()],
	resolve: {
		alias: [{ find: /^@\/(.*)$/, replacement: resolve(__dirname, "../../src/mainview/$1") }]
	},
	worker: { format: "es" },
	server: { fs: { allow: [resolve(__dirname, "../../.."), resolve(__dirname, "../../../../src")] } }
});