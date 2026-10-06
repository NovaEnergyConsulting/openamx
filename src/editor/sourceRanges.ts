import type { SourceLocation, StatementNode } from "../ast/types";

export interface EditorRange {
	from: number;
	to: number;
}

const declarationKeywords: Partial<Record<StatementNode["type"], string>> = {
	typeDeclaration: "type",
	dimensionDeclaration: "dimension",
	unitDeclaration: "unit",
	functionDeclaration: "fn",
	inputDeclaration: "input",
	variableDeclaration: "let",
	tableDeclaration: "table",
	chartDeclaration: "chart"
};

export function sourceOffset(text: string, source: SourceLocation | undefined): number | undefined {
	if (!source || !Number.isSafeInteger(source.line) || !Number.isSafeInteger(source.column)
		|| source.line < 1 || source.column < 1) return undefined;

	let lineStart = 0;
	for (let line = 1; line < source.line; line++) {
		const newline = text.indexOf("\n", lineStart);
		if (newline < 0) return undefined;
		lineStart = newline + 1;
	}

	const newline = text.indexOf("\n", lineStart);
	const lineEnd = newline < 0 ? text.length : newline;
	const contentEnd = lineEnd > lineStart && text[lineEnd - 1] === "\r" ? lineEnd - 1 : lineEnd;
	const offset = lineStart + source.column - 1;
	return offset <= contentEnd ? offset : undefined;
}

export function sourceTokenRange(text: string, source: SourceLocation | undefined, token: string): EditorRange | undefined {
	const from = sourceOffset(text, source);
	if (from === undefined || text.slice(from, from + token.length) !== token) return undefined;
	return { from, to: from + token.length };
}

export function declarationNameRange(text: string, statement: StatementNode): EditorRange | undefined {
	if (!("name" in statement) || !statement.source) return undefined;
	const keyword = declarationKeywords[statement.type];
	if (!keyword) return undefined;
	const from = sourceOffset(text, statement.source);
	if (from === undefined) return undefined;
	const lineEnd = text.indexOf("\n", from);
	const line = text.slice(from, lineEnd < 0 ? text.length : lineEnd).replace(/\r$/, "");
	const match = line.match(new RegExp(`^(?:export\\s+)?${keyword}\\s+([A-Za-z_][A-Za-z0-9_]*)\\b`));
	if (!match || match[1] !== statement.name) return undefined;
	const nameOffset = from + match[0].indexOf(match[1]);
	return sourceTokenRange(text, { line: statement.source.line, column: statement.source.column + nameOffset - from }, statement.name);
}