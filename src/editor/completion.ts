import type {
	DocumentNode,
	BracedIfExpressionNode,
	BracedIfStatementNode,
	EnumDeclarationNode,
	ForExpressionNode,
	ForStatementNode,
	MatchExpressionNode,
	OpenAmxDocument,
	RangeExpressionNode,
	StatementNode,
	TypeDeclarationNode,
	V02ExpressionNode
} from "../ast/types";
import { parseDocumentText } from "../parser/parseDocument";
import { parseFrontMatter } from "../parser/parseFrontMatter";
import type { EditorModuleAnalysis } from "./moduleAnalysis";
import { isExecutableBlockOffset } from "./highlighting";
import { sourceOffset } from "./sourceRanges";
import { findStringLiteralEnd } from "../parser/stringScanner";

export type EditorCompletionKind = "keyword" | "function" | "class" | "variable" | "reference" | "field";
export interface EditorCompletionFact { label: string; kind: EditorCompletionKind; }
export interface PreparedEditorCompletion { text: string; document: OpenAmxDocument; }

const v02Keywords = ["let", "for", "in", "to", "return", "match", "case", "default", "if", "then", "else", "and", "or", "not", "true", "false"];
const v03Keywords = ["null", "type", "fn", "import", "from", "input", "export"];
const v04Keywords = ["table", "chart", "show", "title", "description", "column", "category", "x", "y", "group", "labels", "series", "as"];
const v09ListKeywords = ["add", "remove", "at"];
const v09UnitKeywords = ["dimension", "unit"];
const v12Keywords = ["enum", "extends", "override"];
const standardFunctions = ["sum", "min", "max", "mean", "round", "abs", "sqrt", "pow"];
const primitiveTypes = ["Number", "String", "Boolean", "DateTime"];

function cursorInsideOpenAmxFence(text: string, cursorOffset: number): boolean {
	const frontMatter = parseFrontMatter(text);
	if (frontMatter.error) return false;
	const bodyOffset = text.length - frontMatter.body.length;
	if (cursorOffset < bodyOffset) return false;
	const relativeCursor = cursorOffset - bodyOffset;
	const cursorLine = text.slice(bodyOffset, bodyOffset + relativeCursor).split(/\r?\n/).length - 1;
	const lines = frontMatter.body.split(/\r?\n/);
	let open: { marker: string; executable: boolean } | undefined;
	for (let index = 0; index < cursorLine; index++) {
		const line = lines[index] ?? "";
		if (!open) {
			const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
			if (match) open = { marker: match[1], executable: match[1][0] === "`" && match[2].trim() === "amx" };
		} else {
			const closing = line.match(/^ {0,3}(`+|~+)(\s*)$/);
			if (closing && closing[1][0] === open.marker[0] && closing[1].length >= open.marker.length) open = undefined;
		}
	}
	const currentLine = lines[cursorLine] ?? "";
	const currentCloser = currentLine.match(/^ {0,3}(`+|~+)(\s*)$/);
	return !!open?.executable && !(currentCloser && currentCloser[1][0] === open.marker[0]
		&& currentCloser[1].length >= open.marker.length);
}

/** Parse the complete buffer when possible, otherwise retain only proven prior statements inside an exact AMX fence. */
export function prepareEditorCompletion(text: string, cursorOffset: number): PreparedEditorCompletion | undefined {
	try {
		const document = parseDocumentText(text);
		if (!isExecutableBlockOffset(text, document, cursorOffset)) return undefined;
		return { text, document };
	} catch {
		if (!cursorInsideOpenAmxFence(text, cursorOffset)) return undefined;
		const frontMatter = parseFrontMatter(text);
		if (frontMatter.error) return undefined;
		const lineStart = text.lastIndexOf("\n", Math.max(0, cursorOffset - 1)) + 1;
		const bodyOffset = text.length - frontMatter.body.length;
		const cursorLine = text.slice(bodyOffset, bodyOffset + Math.max(0, cursorOffset - bodyOffset)).split(/\r?\n/).length - 1;
		const lines = frontMatter.body.split(/\r?\n/);
		let open: { marker: string; executable: boolean } | undefined;
		for (let index = 0; index < cursorLine; index++) {
			const match = (lines[index] ?? "").match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
			if (!open && match) open = { marker: match[1], executable: match[1][0] === "`" && match[2].trim() === "amx" };
			else if (open) {
				const closing = (lines[index] ?? "").match(/^ {0,3}(`+|~+)(\s*)$/);
				if (closing && closing[1][0] === open.marker[0] && closing[1].length >= open.marker.length) open = undefined;
			}
		}
		if (!open?.executable) return undefined;
		const closer = `${open.marker}\n`;
		const candidates = [
			`${text.slice(0, cursorOffset)}${text.slice(0, cursorOffset).endsWith("\n") ? "" : "\n"}${closer}${text.slice(cursorOffset)}`,
			`${text.slice(0, lineStart)}${text.slice(0, lineStart).endsWith("\n") ? "" : "\n"}${closer}`
		];
		for (const candidate of candidates) {
			try { return { text: candidate, document: parseDocumentText(candidate) }; }
			catch { /* Keep only parser-proven complete statements. */ }
		}
		return undefined;
	}
}

interface VisibleSymbols {
	variables: Set<string>;
	functions: Set<string>;
	types: Set<string>;
	enums: Map<string, EnumDeclarationNode>;
	views: Set<string>;
	recordTypes: Map<string, TypeDeclarationNode>;
}

function statementsOf(document: OpenAmxDocument): StatementNode[] {
	return document.nodes.flatMap(node => node.type === "executableCodeBlock" ? node.statements : []);
}

function statementEndOffset(text: string, statement: StatementNode): number {
	const start = sourceOffset(text, statement.source);
	if (start === undefined) return Number.MAX_SAFE_INTEGER;
	let depth = 0;
	for (let offset = start; offset < text.length; offset++) {
		const character = text[offset];
		if (character === '"' || character === "'") {
			const end = findStringLiteralEnd(text, offset);
			if (end === undefined) break;
			offset = end;
			continue;
		}
		if (character === "{") depth++;
		else if (character === "}") depth--;
		else if (character === "\n" && depth <= 0) return offset;
	}
	return text.length;
}

function loopBounds(text: string, loop: ForStatementNode | ForExpressionNode): { open: number; close: number } | undefined {
	const start = sourceOffset(text, loop.source);
	if (start === undefined) return undefined;
	const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
	const lineEnd = text.indexOf("\n", start);
	const line = text.slice(lineStart, lineEnd < 0 ? text.length : lineEnd);
	const opening = line.lastIndexOf("{");
	if (opening < 0 || line.slice(opening).trim() !== "{") return undefined;
	const open = lineStart + opening;
	let depth = 0;
	for (let offset = open; offset < text.length; offset++) {
		const character = text[offset];
		if (character === '"' || character === "'") {
			const end = findStringLiteralEnd(text, offset);
			if (end === undefined) return undefined;
			offset = end;
		} else if (character === "{") depth++;
		else if (character === "}" && --depth === 0) return { open, close: offset };
	}
	return undefined;
}

function ifBranchBounds(text: string, node: BracedIfExpressionNode | BracedIfStatementNode, alternate: boolean): { open: number; close: number } | undefined {
	const start = sourceOffset(text, node.source);
	if (start === undefined) return undefined;
	const findOpen = (from: number): number | undefined => {
		let brackets = 0;
		for (let offset = from; offset < text.length; offset++) {
			const character = text[offset];
			if (character === '"' || character === "'") {
				const end = findStringLiteralEnd(text, offset);
				if (end === undefined) return undefined;
				offset = end;
			} else if (character === "(" || character === "[") brackets++;
			else if (character === ")" || character === "]") brackets--;
			else if (character === "{" && brackets === 0) return offset;
		}
		return undefined;
	};
	const findClose = (open: number): number | undefined => {
		let depth = 0;
		for (let offset = open; offset < text.length; offset++) {
			const character = text[offset];
			if (character === '"' || character === "'") {
				const end = findStringLiteralEnd(text, offset);
				if (end === undefined) return undefined;
				offset = end;
			} else if (character === "{") depth++;
			else if (character === "}" && --depth === 0) return offset;
		}
		return undefined;
	};
	const firstOpen = findOpen(start + 2);
	if (firstOpen === undefined) return undefined;
	const firstClose = findClose(firstOpen);
	if (firstClose === undefined) return undefined;
	if (!alternate) return { open: firstOpen, close: firstClose };
	let cursor = firstClose + 1;
	while (/\s/.test(text[cursor] ?? "")) cursor++;
	if (!text.startsWith("else", cursor)) return undefined;
	const secondOpen = findOpen(cursor + 4);
	if (secondOpen === undefined) return undefined;
	const secondClose = findClose(secondOpen);
	return secondClose === undefined ? undefined : { open: secondOpen, close: secondClose };
}

function insideIfBranch(text: string, node: BracedIfExpressionNode | BracedIfStatementNode, cursorOffset: number, alternate: boolean): boolean {
	const bounds = ifBranchBounds(text, node, alternate);
	return !!bounds && cursorOffset > bounds.open && cursorOffset < bounds.close;
}

function visibleSymbols(text: string, parsed: OpenAmxDocument, cursorOffset: number, analysis?: EditorModuleAnalysis): VisibleSymbols {
	const variables = new Set<string>();
	const functions = new Set<string>();
	const types = new Set(primitiveTypes);
	const enums = new Map<string, EnumDeclarationNode>();
	const views = new Set<string>();
	const recordTypes = new Map<string, TypeDeclarationNode>();
	const localTypeDeclarations = new Map<string, TypeDeclarationNode>();
	const localBindingTypes = new Map<string, string>();
	const activeIterators = new Set<string>();

	const collectStatements = (statements: StatementNode[]) => {
		for (const statement of statements) {
			const start = sourceOffset(text, statement.source);
			if (start === undefined || start >= cursorOffset) continue;
			if (statement.type === "variableDeclaration") {
				if (statementEndOffset(text, statement) <= cursorOffset) {
					variables.add(statement.name);
					const inferred = statement.annotation?.type === "namedType" ? statement.annotation.name
						: statement.expression.type === "recordConstructor" ? statement.expression.name : undefined;
					if (inferred) localBindingTypes.set(statement.name, inferred);
				}
				collectExpression(statement.expression);
			} else if (statement.type === "inputDeclaration") {
				if (statementEndOffset(text, statement) <= cursorOffset) {
					variables.add(statement.name);
					if (statement.annotation.type === "namedType" && statement.annotation.name) localBindingTypes.set(statement.name, statement.annotation.name);
				}
			} else if (statement.type === "typeDeclaration") {
				if (statementEndOffset(text, statement) <= cursorOffset) {
					types.add(statement.name);
					localTypeDeclarations.set(statement.name, statement);
				}
			} else if (statement.type === "enumDeclaration") {
				if (statementEndOffset(text, statement) <= cursorOffset) {
					types.add(statement.name);
					enums.set(statement.name, statement);
				}
			} else if (statement.type === "functionDeclaration") {
				if (statementEndOffset(text, statement) <= cursorOffset) functions.add(statement.name);
			} else if (statement.type === "tableDeclaration" || statement.type === "chartDeclaration") {
				if (statementEndOffset(text, statement) <= cursorOffset) views.add(statement.name);
			} else if (statement.type === "importDeclaration") {
				if (statementEndOffset(text, statement) <= cursorOffset) {
					for (const item of statement.names) {
						if (analysis?.importedTypes.has(item.name)) types.add(item.name);
						if (analysis?.importedEnums.has(item.name)) {
							types.add(item.name);
							enums.set(item.name, analysis.importedEnums.get(item.name)!);
						}
						if (analysis?.importedFunctions.has(item.name)) functions.add(item.name);
						if (analysis?.importedBindings.has(item.name)) {
							variables.add(item.name);
							const type = analysis.importedBindings.get(item.name);
							if (type?.kind === "named") localBindingTypes.set(item.name, type.name);
						}
					}
				}
			} else if (statement.type === "forStatement") collectLoop(statement);
			else if (statement.type === "bracedIfStatement") {
				collectExpression(statement.test);
				if (insideIfBranch(text, statement, cursorOffset, false)) collectStatements(statement.consequent);
				if (statement.alternate && insideIfBranch(text, statement, cursorOffset, true)) collectStatements(statement.alternate);
			}
			else if (statement.type === "assignmentStatement" || statement.type === "compoundAssignmentStatement") collectExpression(statement.expression);
			else if ("expression" in statement && statement.expression) collectExpression(statement.expression);
		}
	};

	const collectLoop = (loop: ForStatementNode | ForExpressionNode) => {
		const bounds = loopBounds(text, loop);
		if (bounds && cursorOffset > bounds.open && cursorOffset <= bounds.close) activeIterators.add(loop.variable);
		collectExpression(loop.iterable);
		collectStatements(loop.body);
	};

	const collectExpression = (expression: V02ExpressionNode) => {
		switch (expression.type) {
			case "forExpression": collectLoop(expression); break;
			case "stringInterpolation": expression.parts.forEach(part => { if (typeof part !== "string") collectExpression(part); }); break;
			case "binaryExpression": collectExpression(expression.left); collectExpression(expression.right); break;
			case "measurementAttachment":
			case "measurementConversion": collectExpression(expression.value); break;
			case "unaryExpression": collectExpression(expression.argument); break;
			case "conditionalExpression": collectExpression(expression.test); collectExpression(expression.consequent); collectExpression(expression.alternate); break;
			case "bracedIfExpression":
				collectExpression(expression.test);
				if (insideIfBranch(text, expression, cursorOffset, false)) collectStatements(expression.consequent);
				if (insideIfBranch(text, expression, cursorOffset, true)) collectStatements(expression.alternate);
				break;
			case "matchExpression": collectMatch(expression); break;
			case "rangeExpression": collectRange(expression); break;
			case "functionCall": expression.arguments.forEach(collectExpression); break;
			case "listLiteral": expression.elements.forEach(collectExpression); break;
			case "listAccess": collectExpression(expression.receiver); collectExpression(expression.index); break;
			default: break;
		}
	};

	const collectMatch = (expression: MatchExpressionNode) => {
		collectExpression(expression.expression);
		expression.cases.forEach(arm => collectExpression(arm.expression));
		collectExpression(expression.defaultExpression);
	};
	const collectRange = (expression: RangeExpressionNode) => { collectExpression(expression.start); collectExpression(expression.end); };

	for (const node of parsed.nodes) {
		if (node.type === "executableCodeBlock" && node.source && (sourceOffset(text, node.source) ?? Number.MAX_SAFE_INTEGER) < cursorOffset) {
			collectStatements(node.statements);
		}
	}
	for (const iterator of activeIterators) variables.add(iterator);
	for (const [name, typeName] of localBindingTypes) {
		const declaration = localTypeDeclarations.get(typeName) ?? analysis?.importedTypes.get(typeName);
		if (declaration) recordTypes.set(name, declaration);
	}
	if (analysis) for (const [name, declaration] of analysis.importedTypes) if (types.has(name)) localTypeDeclarations.set(name, declaration);
	return { variables, functions, types, enums, views, recordTypes };
}

/** Return only candidates proven visible before the cursor in the parsed source order. */
export function editorCompletionFacts(
	text: string,
	cursorOffset: number,
	parsed: OpenAmxDocument,
	analysis?: EditorModuleAnalysis,
	contextText: string = text
): EditorCompletionFact[] {
	const cursor = Math.max(0, Math.min(cursorOffset, text.length));
	const visible = visibleSymbols(text, parsed, cursor, analysis);
	const contextCursor = Math.max(0, Math.min(cursorOffset, contextText.length));
	const lineStart = contextText.lastIndexOf("\n", Math.max(0, contextCursor - 1)) + 1;
	const prefix = contextText.slice(lineStart, contextCursor);
	const fieldReceiver = prefix.match(/\b([A-Za-z][A-Za-z0-9_]*)\.\w*$/)?.[1];
	const fields = fieldReceiver
		? visible.enums.get(fieldReceiver)?.members.map(member => member.name)
			?? visible.recordTypes.get(fieldReceiver)?.fields.map(field => field.name) ?? []
		: [];
	const facts: EditorCompletionFact[] = [
		...[...v02Keywords, ...v03Keywords, ...v04Keywords, ...v09ListKeywords, ...v09UnitKeywords, ...v12Keywords].map(label => ({ label, kind: "keyword" as const })),
		...standardFunctions.map(label => ({ label, kind: "function" as const })),
		...[...visible.functions].map(label => ({ label, kind: "function" as const })),
		...[...visible.types].map(label => ({ label, kind: "class" as const })),
		...[...visible.variables].map(label => ({ label, kind: "variable" as const })),
		...[...visible.views].map(label => ({ label, kind: "reference" as const })),
		...fields.map(label => ({ label, kind: "field" as const }))
	];
	return facts;
}

export function executableBlockContentStart(text: string, node: Extract<DocumentNode, { type: "executableCodeBlock" }>): number | undefined {
	if (!node.source) return undefined;
	const offset = sourceOffset(text, node.source);
	if (offset === undefined) return undefined;
	const lineStart = text.lastIndexOf("\n", Math.max(0, offset - 1)) + 1;
	return text.indexOf("\n", lineStart) + 1;
}