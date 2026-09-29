import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { electrobunViteAliases } from "./.hutch/devkit/api/config/electrobun-vite";

export default defineConfig({
	plugins: [vue(), tailwindcss()],
	resolve: {
		alias: [
			...electrobunViteAliases(resolve(__dirname, ".hutch/devkit")),
			{
				find: /^@\/(.*)$/,
				replacement: resolve(__dirname, "src/mainview/$1"),
			},
		],
	},
	root: "src/mainview",
	build: {
		outDir: "../../dist",
		emptyOutDir: true,
	},
	server: {
		port: 5173,
		strictPort: true,
	},
});
