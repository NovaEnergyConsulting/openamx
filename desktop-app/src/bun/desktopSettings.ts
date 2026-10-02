import { parseDocument as parseYamlDocument } from "yaml";

export type ReportSettingsValues = Partial<Record<
	"organization" | "logo" | "logoAlt" | "accent" | "author" | "status" | "classification" | "footer" | "sourceVisible",
	string | boolean | null
>>;

function lineEnd(text: string, start: number): { end: number; next: number; value: string } {
	const newline = text.indexOf("\n", start);
	if (newline < 0) return { end: text.length, next: text.length, value: text.slice(start) };
	const end = newline > start && text[newline - 1] === "\r" ? newline - 1 : newline;
	return { end, next: newline + 1, value: text.slice(start, end) };
}

function frontMatterRange(text: string): { start: number; close: number; closeEnd: number; eol: string } | undefined {
	const first = lineEnd(text, 0);
	if (first.value.trim() !== "---" || first.next === first.end) return undefined;
	const eol = text.slice(first.end, first.next);
	let cursor = first.next;
	while (cursor <= text.length) {
		const line = lineEnd(text, cursor);
		if (line.value.trim() === "---") return { start: first.next, close: cursor, closeEnd: line.next, eol };
		if (line.next === cursor || line.next === text.length) break;
		cursor = line.next;
	}
	throw new Error("Current document has malformed YAML frontmatter.");
}

export function updateReportFrontmatter(text: string, changes: ReportSettingsValues): string {
	const range = frontMatterRange(text);
	const yamlText = range ? text.slice(range.start, range.close) : "";
	const document = parseYamlDocument(yamlText, { keepSourceTokens: true });
	if (document.errors.length) throw new Error("Current document has invalid YAML frontmatter.");
	const source = document.toJS() as unknown;
	if (source !== undefined && source !== null && (typeof source !== "object" || Array.isArray(source))) {
		throw new Error("YAML frontmatter must be a mapping.");
	}
	for (const [key, value] of Object.entries(changes)) {
		if (value === undefined || value === null) document.deleteIn(["report", key]);
		else document.setIn(["report", key], value);
	}
	const report = document.get("report", true) as { items?: unknown[] } | undefined;
	if (report && Array.isArray(report.items) && report.items.length === 0) document.delete("report");
	const eol = range ? range.eol : text.includes("\r\n") ? "\r\n" : "\n";
	const serialized = document.toString({ lineWidth: 0 }).replace(/\r?\n/g, eol);
	if (range) return `${text.slice(0, range.start)}${serialized}${text.slice(range.close)}`;
	const yamlWithLineEndings = serialized.replace(/\r?\n/g, eol);
	return `---${eol}${yamlWithLineEndings}---${eol}${text}`;
}