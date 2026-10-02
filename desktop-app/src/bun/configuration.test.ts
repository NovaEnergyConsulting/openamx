import { afterEach, describe, expect, it } from "bun:test";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readConfigurationRevision, updateConfiguration } from "./configuration";

let root: string | undefined;

afterEach(() => {
	if (root) rmSync(root, { recursive: true, force: true });
	root = undefined;
});

function createConfigRoot() {
	root = mkdtempSync(join(tmpdir(), "openamx-configuration-"));
	mkdirSync(join(root, ".openamx"), { mode: 0o700 });
	return root;
}

describe("trusted configuration writes", () => {
	it("merges recognized project fields and atomically preserves existing report settings", () => {
		const directory = createConfigRoot();
		const file = join(directory, ".openamx", "project.json");
		writeFileSync(file, JSON.stringify({ version: 1, inputs: { rows: "data/rows.csv" }, report: { organization: "North" } }));
		const revision = readConfigurationRevision(directory, "project");
		updateConfiguration(directory, "project", revision, config => {
			(config.inputs as Record<string, string>).amounts = "data/amounts.json";
		});
		const saved = JSON.parse(readFileSync(file, "utf8"));
		expect(saved.inputs).toEqual({ rows: "data/rows.csv", amounts: "data/amounts.json" });
		expect(saved.report).toEqual({ organization: "North" });
	});

	it("rejects stale, malformed, unknown, and insecure local configuration without changing bytes", () => {
		const directory = createConfigRoot();
		const file = join(directory, ".openamx", "project.json");
		const original = JSON.stringify({ version: 1, inputs: {} });
		writeFileSync(file, original);
		const revision = readConfigurationRevision(directory, "project");
		writeFileSync(file, JSON.stringify({ version: 1, inputs: {}, report: { author: "Changed elsewhere" } }));
		expect(() => updateConfiguration(directory, "project", revision, () => {})).toThrow(/changed outside/);
		const changed = readFileSync(file, "utf8");
		writeFileSync(file, "{ invalid");
		expect(() => readConfigurationRevision(directory, "project")).not.toThrow();
		writeFileSync(file, JSON.stringify({ version: 1, inputs: {}, unexpected: true }));
		const invalidRevision = readConfigurationRevision(directory, "project");
		expect(() => updateConfiguration(directory, "project", invalidRevision, () => {})).toThrow(/invalid/);
		expect(readFileSync(file, "utf8")).not.toBe(changed);
		const local = join(directory, ".openamx", "local.json");
		writeFileSync(local, JSON.stringify({ version: 1, inputs: {} }), { mode: 0o644 });
		if (process.platform !== "win32") {
			chmodSync(local, 0o644);
			const localRevision = readConfigurationRevision(directory, "local");
			expect(() => updateConfiguration(directory, "local", localRevision, () => {})).toThrow(/permissions/);
		}
	});

	it("creates private local mappings with owner-only permissions", async () => {
		const directory = createConfigRoot();
		const revision = readConfigurationRevision(directory, "local");
		updateConfiguration(directory, "local", revision, config => {
			(config.inputs as Record<string, string>).amounts = "/tmp/amounts.json";
		});
		const file = join(directory, ".openamx", "local.json");
		expect(JSON.parse(readFileSync(file, "utf8")).inputs.amounts).toBe("/tmp/amounts.json");
		if (process.platform !== "win32") expect((await import("node:fs")).statSync(file).mode & 0o777).toBe(0o600);
	});
});