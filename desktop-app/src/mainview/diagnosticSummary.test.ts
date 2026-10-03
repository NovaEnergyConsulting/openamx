import { describe, expect, it } from "bun:test";
import { createDiagnosticSummary } from "./diagnosticSummary";

describe("diagnostic summary privacy", () => {
	it("exports bounded state and diagnostic codes without private values", () => {
		const result = createDiagnosticSummary({
			generatedAt: "2026-10-03T12:00:00.000Z",
			openTabs: 4,
			dirtyTabs: 2,
			diagnosticCodes: ["AMX3001", "AMX3001", "DESKTOP_JOB", "/home/user/private.csv", "input-secret"],
			events: [{ at: "2026-10-03T12:00:00.000Z", codes: ["AMX3001", "secret:/home/user/private.csv"] }]
		});
		const summary = JSON.parse(result);
		expect(summary.workbench).toEqual({ openTabs: 4, dirtyTabs: 2 });
		expect(summary.diagnosticCodeCounts).toEqual({ AMX3001: 2, DESKTOP_JOB: 1 });
		expect(summary.recentDiagnosticEvents).toEqual([{ at: "2026-10-03T12:00:00.000Z", codes: ["AMX3001"] }]);
		expect(result).not.toContain("/home/user");
		expect(result).not.toContain("private.csv");
		expect(result).not.toContain("input-secret");
		expect(result).not.toContain("message");
	});

	it("rejects arbitrary timestamp text", () => {
		const result = JSON.parse(createDiagnosticSummary({ generatedAt: "/private/project/report.amx", openTabs: Number.NaN, dirtyTabs: 0, diagnosticCodes: [], events: [] }));
		expect(result.generatedAt).toBe("");
		expect(result.workbench.openTabs).toBe(0);
		expect(JSON.stringify(result)).not.toContain("/private/project");
	});

	it("caps tab and diagnostic counts", () => {
		const result = JSON.parse(createDiagnosticSummary({ generatedAt: "now", openTabs: 10000, dirtyTabs: -1, diagnosticCodes: Array(600).fill("AMX3001"), events: Array(25).fill({ at: "invalid/path", codes: Array(200).fill("AMX3001") }) }));
		expect(result.workbench).toEqual({ openTabs: 100, dirtyTabs: 0 });
		expect(result.diagnosticCodeCounts).toEqual({ AMX3001: 500 });
		expect(result.recentDiagnosticEvents).toHaveLength(20);
		expect(result.recentDiagnosticEvents[0]).toEqual({ at: "", codes: Array(100).fill("AMX3001") });
	});
});