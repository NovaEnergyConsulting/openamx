import type { OpenAmxDocument, StatementNode, TypeReferenceNode, V02ExpressionNode } from "../ast/types";
import { declarationNameRange, sourceOffset, sourceTokenRange, type EditorRange } from "./sourceRanges";

export interface EditorHighlightFact extends EditorRange {
	kind: "keyword" | "declaration" | "reference" | "field" | "type" | "literal";
}

function statementsOf(document: OpenAmxDocument): StatementNode[] {
	return document.nodes.flatMap(node => node.type === "executableCodeBlock" ? node.statements : []);
}

/** Return parser-proven tokens only; narrative and ordinary fences never enter the AST statement walk. */
export function editorHighlightFacts(text: string, document: OpenAmxDocument): EditorHighlightFact[] {
	const facts: EditorHighlightFact[] = [];
	const add = (source: StatementNode["source"], token: string, kind: EditorHighlightFact["kind"]) => {
		const range = sourceTokenRange(text, source, token);
		if (range) facts.push({ ...range, kind });
	};
	const expression = (node: V02ExpressionNode): void => {
		switch (node.type) {
			case "numberLiteral": {
				const from = sourceOffset(text, node.source);
				const raw = from === undefined ? undefined : text.slice(from).match(/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/)?.[0];
				if (raw) add(node.source, raw, "literal");
				break;
			}
			case "stringLiteral": {
				const from = sourceOffset(text, node.source);
				if (from !== undefined) {
					const quote = text[from];
					if (quote === '"' || quote === "'") {
						let escaped = false;
					for (let end = from + 1; end < text.length; end++) {
						if (escaped) escaped = false;
						else if (text[end] === "\\") escaped = true;
						else if (text[end] === quote) { facts.push({ from, to: end + 1, kind: "literal" }); break; }
					}
				}
				}
				break;
			}
			case "booleanLiteral": add(node.source, String(node.value), "keyword"); break;
			case "nullLiteral": add(node.source, "null", "keyword"); break;
			case "identifier": add(node.source, node.name, "reference"); break;
			case "functionCall": add(node.source, node.callee, "reference"); node.arguments.forEach(expression); break;
			case "recordConstructor": add(node.source, node.name, "reference"); node.fields.forEach(field => expression(field.expression)); break;
			case "fieldAccess": {
				expression(node.receiver);
				const dot = sourceOffset(text, node.source);
				if (dot !== undefined && text[dot] === ".") {
					const fieldStart = text.slice(dot + 1).match(/^\s*/)?.[0].length ?? 0;
					const fieldSource = node.source && { line: node.source.line, column: node.source.column + 1 + fieldStart };
					add(fieldSource, node.field, "field");
				}
				break;
			}
			case "binaryExpression": expression(node.left); expression(node.right); break;
			case "unaryExpression": expression(node.argument); break;
			case "conditionalExpression": expression(node.test); expression(node.consequent); expression(node.alternate); break;
			case "forExpression": expression(node.iterable); node.body.forEach(statement); break;
			case "matchExpression":
				add(node.source, "match", "keyword");
				expression(node.expression);
				node.cases.forEach(item => { add(item.source, "case", "keyword"); expression(item.expression); });
				add(node.defaultSource, "default", "keyword");
				expression(node.defaultExpression);
				break;
			case "rangeExpression": expression(node.start); expression(node.end); break;
			case "listLiteral": node.elements.forEach(expression); break;
			default: break;
		}
	};
	const typeReference = (node: TypeReferenceNode | undefined): void => {
		if (!node) return;
		if (node.type === "namedType" && node.name) add(node.source, node.name, "type");
		if (node.element) typeReference(node.element);
	};
	const statement = (node: StatementNode): void => {
		const keyword: Partial<Record<StatementNode["type"], string>> = {
			variableDeclaration: "let", typeDeclaration: "type", functionDeclaration: "fn",
			inputDeclaration: "input", importDeclaration: "import", tableDeclaration: "table",
			chartDeclaration: "chart", showStatement: "show", forStatement: "for",
			assignmentStatement: "", compoundAssignmentStatement: ""
		};
		const word = keyword[node.type];
		if (word) add(node.source, word, "keyword");
		const start = sourceOffset(text, node.source);
		if (start !== undefined) {
			const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
			const prefix = text.slice(lineStart, start);
			if (/\bexport\s+$/.test(prefix)) {
				const exportStart = lineStart + prefix.lastIndexOf("export");
				const exportSource = node.source && { line: node.source.line, column: exportStart - lineStart + 1 };
				add(exportSource, "export", "keyword");
			}
		}
		if ("name" in node) {
			const range = declarationNameRange(text, node);
			if (range) facts.push({ ...range, kind: "declaration" });
		}
		if (node.type === "importDeclaration") for (const item of node.names) add(item.source, item.name, "reference");
		if (node.type === "inputDeclaration") typeReference(node.annotation);
		if (node.type === "typeDeclaration") for (const field of node.fields) { add(field.source, field.name, "field"); typeReference(field.annotation); }
		if (node.type === "variableDeclaration") { typeReference(node.annotation); expression(node.expression); }
		else if (node.type === "functionDeclaration") { node.parameters.forEach(param => typeReference(param.annotation)); typeReference(node.returnType); expression(node.body); }
		else if (node.type === "tableDeclaration" || node.type === "chartDeclaration") add(node.bindingSource, node.binding, "reference");
		else if (node.type === "showStatement") add(node.nameSource, node.name, "reference");
		else if (node.type === "assignmentStatement" || node.type === "compoundAssignmentStatement") expression(node.expression);
		else if (node.type === "forStatement") { expression(node.iterable); node.body.forEach(statement); }
		else if ("expression" in node) expression(node.expression);
	};
	for (const node of document.nodes) if (node.type === "executableCodeBlock") node.statements.forEach(statement);
	const unique = new Map<string, EditorHighlightFact>();
	for (const fact of facts) unique.set(`${fact.from}:${fact.to}:${fact.kind}`, fact);
	return [...unique.values()].sort((left, right) => left.from - right.from || left.to - right.to);
}

export function isExecutableBlockOffset(text: string, document: OpenAmxDocument, offset: number): boolean {
	return document.nodes.some(node => {
		if (node.type !== "executableCodeBlock" || !node.source) return false;
		const source = sourceOffset(text, node.source);
		if (source === undefined) return false;
		const lineStart = text.lastIndexOf("\n", Math.max(0, source - 1)) + 1;
		const openingLineEnd = text.indexOf("\n", lineStart);
		if (openingLineEnd < 0) return false;
		const contentStart = openingLineEnd + 1;
		return offset >= contentStart && offset <= contentStart + node.content.length;
	});
}