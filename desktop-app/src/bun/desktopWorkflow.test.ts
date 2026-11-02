import { describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveDesktopInputs } from "./desktopWorkflow";

describe("desktop input resolution", () => {
	it("does not pass unrelated project defaults to the active document", () => {
		const root = mkdtempSync(join(tmpdir(), "openamx-workflow-inputs-"));
		const stateDirectory = join(root, ".openamx");
		const dataDirectory = join(root, "data");
		mkdirSync(stateDirectory);
		mkdirSync(dataDirectory);
		writeFileSync(join(dataDirectory, "rows.csv"), "value\n1\n");
		writeFileSync(join(dataDirectory, "other.csv"), "value\n2\n");
		writeFileSync(join(stateDirectory, "project.json"), JSON.stringify({
			version: 1,
			inputs: { rows: "data/rows.csv", other: "data/other.csv" }
		}));

		try {
			const resolved = resolveDesktopInputs(root, "```amx\ninput rows: Number[]\n```\n");

			expect(resolved.mappings).toEqual([`rows=${join(dataDirectory, "rows.csv")}`]);
			expect(resolved.configuration.inputs).toHaveLength(1);
			expect(resolved.configuration.inputs[0]).toMatchObject({ name: "rows", source: "project", status: "unvalidated" });
			expect(resolved.configuration.diagnostics).toEqual([]);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});