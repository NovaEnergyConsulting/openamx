import { Buffer } from "buffer";
import type { CsvTextCell, DataTextParseIssue } from "../../../../src/runtime/dataText";

Object.assign(globalThis, { Buffer });

interface ParseRequest {
	id: number;
	format: "json" | "csv";
	text: string;
}

interface ParseResponse {
	id: number;
	issue?: DataTextParseIssue;
	jsonValue?: unknown;
	csvHeaders?: CsvTextCell[];
	csvRowsJson?: string;
	rowCount?: number;
}

self.onmessage = async (event: MessageEvent<ParseRequest>) => {
	const request = event.data;
	const { parseStrictCsvText, parseStrictJsonText } = await import("../../../../src/runtime/dataText");
	if (request.format === "csv") {
		const parsed = parseStrictCsvText(request.text);
		if (parsed.issue) { self.postMessage({ id: request.id, issue: parsed.issue } satisfies ParseResponse); return; }
		const rows = parsed.value ?? [];
		if (rows.length - 1 > 100_000) {
			self.postMessage({ id: request.id, issue: { code: "DESKTOP_DATA_LIMIT", message: "This CSV exceeds 100,000 data rows. Keep it in raw mode; no records were truncated." }, rowCount: rows.length - 1 } satisfies ParseResponse);
			return;
		}
		const headers = rows[0] ?? [];
		if (rows.slice(1).some(row => row.length !== headers.length)) {
			self.postMessage({ id: request.id, issue: { code: "DESKTOP_DATA_SHAPE", message: "CSV rows with different widths stay in raw mode to preserve every cell." } } satisfies ParseResponse);
			return;
		}
		const csvRowsJson = JSON.stringify(rows.slice(1).map((row, index) => {
			const record: Record<string, unknown> = { __editorRowId: index, __quoted: row.map(cell => cell.quoted) };
			row.forEach((cell, column) => { record[`field${column}`] = cell.value; });
			return record;
		}));
		self.postMessage({ id: request.id, csvHeaders: headers, csvRowsJson, rowCount: rows.length - 1 } satisfies ParseResponse);
		return;
	}
	const parsed = parseStrictJsonText(request.text);
	if (parsed.issue) { self.postMessage({ id: request.id, issue: parsed.issue } satisfies ParseResponse); return; }
	if (Array.isArray(parsed.value) && parsed.value.length > 100_000) {
		self.postMessage({ id: request.id, issue: { code: "DESKTOP_DATA_LIMIT", message: "This JSON array exceeds 100,000 records. Keep it in raw mode; no records were truncated." }, rowCount: parsed.value.length } satisfies ParseResponse);
		return;
	}
	self.postMessage({ id: request.id, jsonValue: parsed.value } satisfies ParseResponse);
};