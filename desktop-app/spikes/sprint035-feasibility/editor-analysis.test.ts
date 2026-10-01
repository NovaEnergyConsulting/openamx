import { expect, test } from "bun:test";
import { analyzeEditorBuffer } from "./editor-analysis";

test("shared parser facts produce stable UTF-16 declaration ranges and source-order completions", () => {
	const text = "# \u{1F680} report\r\n\r\n```amx\r\nlet base: Number = 2\r\nlet total: Number = base + 1\r\n```\r\n";
	const cursor = text.indexOf("let total");
	const result = analyzeEditorBuffer(text, cursor, "file:///project/report.amx");
	const base = result.symbols.find(symbol => symbol.name === "base");
	const total = result.symbols.find(symbol => symbol.name === "total");

	expect(result.diagnostic).toBeUndefined();
	expect(base).toBeDefined();
	expect(total).toBeDefined();
	expect(text.slice(base!.from, base!.to)).toBe("base");
	expect(text.slice(total!.from, total!.to)).toBe("total");
	expect(base!.identity).toBe(`file:///project/report.amx#${base!.from}:${base!.to}`);
	expect(result.completions).toContain("base");
	expect(result.completions).not.toContain("total");
});

test("shared checker diagnostics retain core codes and original source coordinates", () => {
	const text = "# Report\n\n```amx\nlet amount: Number = \"wrong\"\n```\n";
	const result = analyzeEditorBuffer(text, text.length);

	expect(result.diagnostic?.code).toBe("AMX3002");
	expect(result.diagnostic?.line).toBe(4);
	expect(result.diagnostic?.column).toBe(22);
	expect(result.symbols).toEqual([]);
});