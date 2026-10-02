import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function desktopWorkerUrl(mainModuleUrl: string, fileExists = existsSync): string {
	const typescriptWorker = new URL("./jobWorker.ts", mainModuleUrl);
	if (fileExists(fileURLToPath(typescriptWorker))) return typescriptWorker.href;
	return new URL("./jobWorker.js", mainModuleUrl).href;
}