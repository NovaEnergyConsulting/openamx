import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
	plugins: [vue()],
	server: { fs: { allow: [resolve(__dirname, "../../../..") ] } }
});