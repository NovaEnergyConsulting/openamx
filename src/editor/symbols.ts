import type { OpenAmxDocument, StatementNode, V02ExpressionNode } from "../ast/types";
import type { EditorModuleAnalysis, EditorModuleRecord } from "./moduleAnalysis";
import { declarationNameRange, sourceTokenRange, type EditorRange } from "./sourceRanges";
import type { CheckedType } from "../typechecker/checkDocument";

export interface EditorSymbolIdentity {
	file: string;
	from: number;
	to: number;
}

export interface EditorSymbolFact extends EditorRange {
	file: string;
	name: string;
	target: EditorSymbolIdentity;
	declaration: boolean;
	kind: string;
	detail: string;
	origin?: string;
}

function statementsOf(document: OpenAmxDocument): StatementNode[] {
	return document.nodes.flatMap(node => node.type === "executableCodeBlock" ? node.statements : []);
}

function typeText(type: CheckedType): string {
	if (type.kind === "named") return type.name;
	if (type.kind === "null") return "null";
	return `${typeText(type.element)}${type.kind === "list" ? "[]" : "?"}`;
}

function declaration(text: string, file: string, statement: StatementNode): EditorSymbolFact | undefined {
	if (!("name" in statement)) return undefined;
	const range = declarationNameRange(text, statement);
	if (!range) return undefined;
	const kind = statement.type === "variableDeclaration" ? "binding" : statement.type.replace("Declaration", "");
	const detail = statement.type === "functionDeclaration"
		? `fn ${statement.name}(${statement.parameters.map(param => `${param.name}: ${param.annotation.name ?? param.annotation.type}`).join(", ")}): ${statement.returnType.name ?? statement.returnType.type}`
		: statement.type === "variableDeclaration" || statement.type === "inputDeclaration"
			? `${kind} ${statement.name}${statement.annotation ? `: ${statement.annotation.name ?? statement.annotation.type}` : ""}`
			: `${kind} ${statement.name}`;
	return { ...range, file, name: statement.name, target: { file, ...range }, declaration: true, kind, detail };
}

function moduleRecord(analysis: EditorModuleAnalysis | undefined, file: string): EditorModuleRecord | undefined {
	return analysis?.modules?.get(file);
}

/** Build identity-bearing symbol occurrences; uncertain parser spans and duplicate declarations have no target. */
export function editorSymbolFacts(
	text: string,
	entryFile: string,
	entryDocument: OpenAmxDocument,
	analysis?: EditorModuleAnalysis,
	moduleSources: ReadonlyMap<string, string> = new Map()
): EditorSymbolFact[] {
	const documents = new Map<string, OpenAmxDocument>();
	if (analysis?.modules) for (const [file, module] of analysis.modules) documents.set(file, module.document);
	documents.set(entryFile, entryDocument);
	const result: EditorSymbolFact[] = [];

	for (const [file, document] of documents) {
		const moduleText = file === entryFile ? text : moduleSources.get(file);
		if (moduleText === undefined) continue;
		const module = moduleRecord(analysis, file);
		const statements = statementsOf(document);
		const declarations = statements.filter(statement => "name" in statement && declarationNameRange(moduleText, statement));
		const duplicates = new Set(declarations.filter((candidate, index) => declarations.some((other, otherIndex) =>
			otherIndex !== index && "name" in other && "name" in candidate && other.name === candidate.name
		)).map(statement => "name" in statement ? statement.name : ""));
		const visible = new Map<string, EditorSymbolFact>();
		const add = (source: StatementNode["source"], name: string, target?: EditorSymbolFact) => {
			if (!target) return;
			const range = sourceTokenRange(moduleText, source, name);
			if (range) result.push({ ...target, ...range, file, declaration: false });
		};
		const expression = (node: V02ExpressionNode): void => {
			if (!analysis && statements.some(statement => statement.type === "importDeclaration")) return;
			switch (node.type) {
				case "stringInterpolation": node.parts.forEach(part => { if (typeof part !== "string") expression(part); }); break;
				case "identifier": add(node.source, node.name, visible.get(node.name)); break;
				case "functionCall": add(node.source, node.callee, visible.get(node.callee)); node.arguments.forEach(expression); break;
				case "recordConstructor": add(node.source, node.name, visible.get(node.name)); node.fields.forEach(field => expression(field.expression)); break;
				case "binaryExpression": expression(node.left); expression(node.right); break;
				case "unaryExpression": expression(node.argument); break;
				case "conditionalExpression": expression(node.test); expression(node.consequent); expression(node.alternate); break;
				case "listLiteral": node.elements.forEach(expression); break;
				case "rangeExpression": expression(node.start); expression(node.end); break;
				case "matchExpression": expression(node.expression); node.cases.forEach(arm => expression(arm.expression)); expression(node.defaultExpression); break;
				case "fieldAccess": expression(node.receiver); break;
				case "listAccess": expression(node.receiver); expression(node.index); break;
				case "forExpression": expression(node.iterable); break;
				default: break;
			}
		};

		for (const statement of statements) {
			if (statement.type === "importDeclaration") {
				for (const imported of statement.names) {
					const targetFile = module?.importTargets.get(imported.name);
					const targetModule = targetFile ? moduleRecord(analysis, targetFile) : undefined;
					let targetStatement = targetModule && statementsOf(targetModule.document).find(candidate =>
						"name" in candidate && candidate.name === imported.name && "exported" in candidate && candidate.exported
					);
					let declarationFile = targetFile;
					const targetMetadata = targetModule?.checkResult.exportedDimensions.get(imported.name)
						?? targetModule?.checkResult.exportedUnits.get(imported.name);
					if (!targetStatement && targetMetadata) {
						const originFile = targetMetadata.moduleIdentity;
						declarationFile = originFile;
						const originModule = moduleRecord(analysis, originFile);
						targetStatement = originModule && statementsOf(originModule.document).find(candidate =>
							(candidate.type === "dimensionDeclaration" || candidate.type === "unitDeclaration")
							&& candidate.name === targetMetadata.declarationName
						);
					}
					const targetText = declarationFile === entryFile ? text : declarationFile ? moduleSources.get(declarationFile) : undefined;
					const importedTarget = targetStatement && targetText !== undefined ? declaration(targetText, declarationFile!, targetStatement) : undefined;
					if (importedTarget) {
						const importedOccurrence = { ...importedTarget, origin: declarationFile };
						visible.set(imported.name, importedOccurrence);
						add(imported.source, imported.name, importedOccurrence);
					}
				}
			} else {
				if (statement.type === "exportNamesDeclaration") {
					for (const item of statement.names) add(item.source, item.name, visible.get(item.name));
				}
				if (statement.type === "dimensionDeclaration" && statement.expression) expression(statement.expression);
				if (statement.type === "unitDeclaration") {
					if (statement.dimension) add(statement.dimensionSource, statement.dimension, visible.get(statement.dimension));
					if (statement.expression) expression(statement.expression);
				}
				if (statement.type === "variableDeclaration") expression(statement.expression);
				if (statement.type === "variableDeclaration" || statement.type === "inputDeclaration") {
					const annotation = statement.annotation;
					if (annotation?.type === "namedType" && annotation.name) add(annotation.source, annotation.name, visible.get(annotation.name));
				}
				if (statement.type === "showStatement") add(statement.nameSource, statement.name, visible.get(statement.name));
				if (statement.type === "tableDeclaration" || statement.type === "chartDeclaration") add(statement.bindingSource, statement.binding, visible.get(statement.binding));
				if (statement.type === "assignmentStatement" || statement.type === "compoundAssignmentStatement") {
					add(statement.source, statement.name, visible.get(statement.name));
					expression(statement.expression);
				}
				if (statement.type === "addStatement") {
					add(statement.targetSource, statement.name, visible.get(statement.name));
					expression(statement.value);
					if (statement.index) expression(statement.index);
				}
				if (statement.type === "removeStatement") {
					add(statement.targetSource, statement.name, visible.get(statement.name));
					expression(statement.count);
					if (statement.index) expression(statement.index);
				}
				if (statement.type === "forStatement") expression(statement.iterable);
				const declared = declaration(moduleText, file, statement);
				if (declared && "name" in statement && !duplicates.has(statement.name)) {
					if (statement.type === "variableDeclaration") {
						const inferred = module?.checkResult.bindingTypes.get(statement.name) ?? (file === entryFile ? analysis?.bindingTypes?.get(statement.name) : undefined);
						if (inferred) declared.detail = `binding ${statement.name}: ${typeText(inferred)}`;
					}
					visible.set(statement.name, declared);
					result.push(declared);
					if (statement.type === "typeDeclaration") for (const field of statement.fields) {
						const range = sourceTokenRange(moduleText, field.source, field.name);
						if (range) result.push({ ...range, file, name: field.name, target: { file, ...range }, declaration: true, kind: "field", detail: `field ${field.name}: ${field.annotation.name ?? field.annotation.type}` });
					}
				}
			}
		}
	}
	return result;
}