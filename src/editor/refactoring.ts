import type { OpenAmxDocument, StatementNode } from "../ast/types";
import { sourceTokenRange, type EditorRange } from "./sourceRanges";
import type { EditorSymbolFact, EditorSymbolIdentity } from "./symbols";

export interface EditorDiagnosticFact extends EditorRange {
	code: string;
	message: string;
}

export interface EditorCodeActionFact extends EditorRange {
	title: string;
	expected: string;
	replacement: string;
	code: string;
}

export interface EditorRenameFact {
	target: EditorSymbolIdentity;
	name: string;
	edits: Array<{ file: string } & EditorRange>;
}

const reservedNames = new Set([
	"let", "for", "in", "to", "return", "match", "case", "default", "if", "then", "else", "and", "or", "not", "dimension", "unit",
	"true", "false", "null", "type", "fn", "import", "from", "input", "export", "table", "chart", "show",
	"title", "description", "column", "category", "x", "y", "group", "labels", "series", "as",
	"Number", "String", "Boolean", "DateTime"
]);

export function isSafeRenameIdentifier(name: string): boolean {
	return /^[A-Za-z][A-Za-z0-9_]*$/.test(name) && !reservedNames.has(name);
}

function statementsOf(document: OpenAmxDocument): StatementNode[] {
	return document.nodes.flatMap(node => node.type === "executableCodeBlock" ? node.statements : []);
}

export function editorCodeActionFacts(
	text: string,
	document: OpenAmxDocument,
	diagnostics: readonly EditorDiagnosticFact[]
): EditorCodeActionFact[] {
	const visibleViews: string[] = [];
	const actions: EditorCodeActionFact[] = [];
	for (const statement of statementsOf(document)) {
		if (statement.type === "tableDeclaration" || statement.type === "chartDeclaration") visibleViews.push(statement.name);
		if (statement.type !== "showStatement" || visibleViews.length !== 1 || !statement.nameSource) continue;
		const range = sourceTokenRange(text, statement.nameSource, statement.name);
		if (!range) continue;
		const diagnostic = diagnostics.find(item => item.code === "AMX3001"
			&& item.message === `Unknown or not-yet-declared visualization '${statement.name}'`
			&& item.from <= range.from && item.to > range.from);
		if (!diagnostic) continue;
		const replacement = visibleViews[0]!;
		if (replacement !== statement.name) actions.push({ ...range, title: `Use visible view '${replacement}'`, expected: statement.name, replacement, code: diagnostic.code });
	}
	return actions;
}

export function editorRenameFact(
	facts: readonly EditorSymbolFact[],
	file: string,
	offset: number
): EditorRenameFact | undefined {
	const selected = facts.find(fact => fact.file === file && fact.from <= offset && offset < fact.to);
	if (!selected) return undefined;
	const identity = selected.target;
	const edits = facts.filter(fact => fact.target.file === identity.file && fact.target.from === identity.from && fact.target.to === identity.to)
		.map(fact => ({ file: fact.file, from: fact.from, to: fact.to }));
	if (!edits.some(edit => edit.file === identity.file && edit.from === identity.from && edit.to === identity.to)) return undefined;
	return { target: identity, name: selected.name, edits };
}