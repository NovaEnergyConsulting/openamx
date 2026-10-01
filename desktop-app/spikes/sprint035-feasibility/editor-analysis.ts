import { StatementNode } from "../../../src/ast/types";
import { AmxError } from "../../../src/diagnostics/errors";
import { parseDocumentText } from "../../../src/parser/parseDocument";
import { checkDocument, checkingActivated } from "../../../src/typechecker/checkDocument";

export interface EditorSymbolFact {
	identity: string;
	name: string;
	kind: StatementNode["type"];
	from: number;
	to: number;
}

export interface EditorDiagnosticFact {
	code: string;
	message: string;
	line?: number;
	column?: number;
}

export interface EditorAnalysisProof {
	symbols: EditorSymbolFact[];
	completions: string[];
	diagnostic?: EditorDiagnosticFact;
}

const declarationKinds = new Set<StatementNode["type"]>([
	"typeDeclaration", "functionDeclaration", "inputDeclaration", "variableDeclaration", "tableDeclaration", "chartDeclaration"
]);

function declarationFact(text: string, statement: StatementNode, documentUri: string): EditorSymbolFact | undefined {
	if (!("name" in statement) || !statement.source || !declarationKinds.has(statement.type)) return undefined;
	const lines = text.split(/\r?\n/);
	const line = lines[statement.source.line - 1];
	if (line === undefined) return undefined;
	const lineStart = text.split(/\r?\n/).slice(0, statement.source.line - 1).reduce((offset, prior) => offset + prior.length + (text.includes("\r\n") ? 2 : 1), 0);
	const nameOffset = line.indexOf(statement.name, statement.source.column - 1);
	if (nameOffset < 0) return undefined;
	const before = line[nameOffset - 1] ?? "";
	const after = line[nameOffset + statement.name.length] ?? "";
	if (/[A-Za-z0-9_]/.test(before) || /[A-Za-z0-9_]/.test(after)) return undefined;
	const from = lineStart + nameOffset;
	const to = from + statement.name.length;
	return { identity: `${documentUri}#${from}:${to}`, name: statement.name, kind: statement.type, from, to };
}

function sourceOffset(text: string, line: number, column: number): number | undefined {
	const starts = [0];
	for (let index = 0; index < text.length; index++) if (text[index] === "\n") starts.push(index + 1);
	const start = starts[line - 1];
	if (start === undefined) return undefined;
	return start + column - 1;
}

export function analyzeEditorBuffer(text: string, cursorOffset: number, documentUri = "buffer://active"): EditorAnalysisProof {
	try {
		const document = parseDocumentText(text);
		const statements = document.nodes.flatMap(node => node.type === "executableCodeBlock" ? node.statements : []);
		const symbols = statements.map(statement => declarationFact(text, statement, documentUri)).filter((fact): fact is EditorSymbolFact => !!fact);
		if (checkingActivated(document)) checkDocument(document, documentUri);
		const visible = symbols.filter(symbol => symbol.to <= cursorOffset).map(symbol => symbol.name);
		return { symbols, completions: [...new Set([...visible, "let", "if", "match", "for", "show"])].sort() };
	} catch (error) {
		if (error instanceof AmxError) return {
			symbols: [],
			completions: [],
			diagnostic: { code: error.code, message: error.message, line: error.line, column: error.column }
		};
		return { symbols: [], completions: [], diagnostic: { code: "AMX1000", message: error instanceof Error ? error.message : String(error) } };
	}
}

export function offsetForSource(text: string, line: number, column: number): number | undefined {
	return sourceOffset(text, line, column);
}