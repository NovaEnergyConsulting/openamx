import { describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import packageMetadata from "../../package.json";

describe("desktop app metadata bundle", () => {
	it("embeds package metadata without a runtime sibling manifest", async () => {
		const outputDirectory = mkdtempSync(join(tmpdir(), "openamx-app-metadata-"));
		const entrypoint = fileURLToPath(new URL("../../app-metadata.ts", import.meta.url));

		try {
			const build = await Bun.build({
				entrypoints: [entrypoint],
				outdir: outputDirectory,
				target: "bun",
				format: "esm",
			});
			expect(build.success).toBe(true);

			const bundledMetadata = await import(pathToFileURL(join(outputDirectory, "app-metadata.js")).href);
			expect(bundledMetadata.appMetadata).toEqual({
				name: "OpenAMX Desktop",
				identifier: "dev.openamx.desktop",
				version: packageMetadata.version,
			});
		} finally {
			rmSync(outputDirectory, { recursive: true, force: true });
		}
	});
});