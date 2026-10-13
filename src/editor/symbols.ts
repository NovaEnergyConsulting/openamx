import type { EnumDeclarationNode, OpenAmxDocument, StatementNode, V02ExpressionNode } from "../ast/types";
import type { EditorModuleAnalysis, EditorModuleRecord } from "./moduleAnalysis";
import { declarationNameRange, sourceOffset, sourceTokenRange, type EditorRange } from "./sourceRanges";
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
	parent?: EditorSymbolIdentity;
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
	if (type.kind === "measurement") return "measurement";
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

function enumMemberSource(text: string, source: StatementNode["source"]): StatementNode["source"] {
	const dot = source && sourceOffset(text, source);
	if (dot === undefined || text[dot] !== ".") return undefined;
	const whitespace = text.slice(dot + 1).match(/^\s*/)?.[0].length ?? 0;
	return { line: source!.line, column: source!.column + 1 + whitespace };
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
	const enumMemberTargets = new Map<string, EditorSymbolFact>();
	for (const [file, document] of documents) {
		const moduleText = file === entryFile ? text : moduleSources.get(file);
		if (moduleText === undefined) continue;
		const statements = statementsOf(document);
		const enumDeclarations = statements.filter((statement): statement is EnumDeclarationNode => statement.type === "enumDeclaration");
		for (const declarationNode of enumDeclarations) {
			const nameCount = enumDeclarations.filter(item => item.name === declarationNode.name).length;
			const memberCounts = new Map<string, number>();
			declarationNode.members.forEach(member => memberCounts.set(member.name, (memberCounts.get(member.name) ?? 0) + 1));
			if (nameCount !== 1 || [...memberCounts.values()].some(count => count > 1)) continue;
			for (const member of declarationNode.members) {
				const range = sourceTokenRange(moduleText, member.nameSource, member.name);
				if (!range) continue;
				const parent = declaration(moduleText, file, declarationNode)?.target;
				enumMemberTargets.set(`${file}\0${declarationNode.name}\0${member.name}`, {
					...range,
					file,
					name: member.name,
					target: { file, ...range },
					parent,
					declaration: true,
					kind: "enumMember",
					detail: `enum member ${declarationNode.name}.${member.name}`
				});
			}
		}
	}

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
		const visibleEnums = new Map<string, { declaration: EnumDeclarationNode; file: string }>();
		const add = (source: StatementNode["source"], name: string, target?: EditorSymbolFact) => {
			if (!target) return;
			const range = sourceTokenRange(moduleText, source, name);
			if (range) result.push({ ...target, ...range, file, declaration: false });
		};
		const expression = (node: V02ExpressionNode, scope = visible): void => {
			if (!analysis && statements.some(statement => statement.type === "importDeclaration")) return;
			switch (node.type) {
				case "stringInterpolation": node.parts.forEach(part => { if (typeof part !== "string") expression(part, scope); }); break;
				case "identifier": add(node.source, node.name, scope.get(node.name)); break;
				case "functionCall": add(node.source, node.callee, scope.get(node.callee)); node.arguments.forEach(argument => expression(argument, scope)); break;
				case "recordConstructor": add(node.source, node.name, scope.get(node.name)); node.fields.forEach(field => expression(field.expression, scope)); break;
				case "binaryExpression": expression(node.left, scope); expression(node.right, scope); break;
				case "measurementAttachment":
				case "measurementConversion": add(node.unitSource, node.unit, scope.get(node.unit)); expression(node.value, scope); break;
				case "unaryExpression": expression(node.argument, scope); break;
				case "conditionalExpression": expression(node.test, scope); expression(node.consequent, scope); expression(node.alternate, scope); break;
				case "listLiteral": node.elements.forEach(element => expression(element, scope)); break;
				case "rangeExpression": expression(node.start, scope); expression(node.end, scope); break;
				case "matchExpression": expression(node.expression, scope); node.cases.forEach(arm => expression(arm.expression, scope)); expression(node.defaultExpression, scope); break;
				case "fieldAccess": {
					expression(node.receiver, scope);
					if (node.receiver.type === "identifier") {
						const visibleEnum = visibleEnums.get(node.receiver.name);
						const member = visibleEnum && enumMemberTargets.get(`${visibleEnum.file}\0${visibleEnum.declaration.name}\0${node.field}`);
						add(enumMemberSource(moduleText, node.source), node.field, member);
					}
					break;
				}
				case "listAccess": expression(node.receiver, scope); expression(node.index, scope); break;
				case "forExpression": expression(node.iterable, scope); node.body.forEach(statement => nestedStatement(statement, scope)); break;
				case "bracedIfExpression":
					expression(node.test, scope);
					node.consequent.forEach(statement => nestedStatement(statement, scope));
					node.alternate.forEach(statement => nestedStatement(statement, scope));
					break;
				default: break;
			}
		};
		const nestedStatement = (statement: StatementNode, scope = visible): void => {
			if (statement.type === "variableDeclaration") expression(statement.expression, scope);
			else if (statement.type === "typeDeclaration") {
				for (const parent of statement.parents ?? []) add(parent.source, parent.name, scope.get(parent.name));
				for (const field of statement.fields) if (field.defaultExpression) expression(field.defaultExpression, scope);
			} else if (statement.type === "enumDeclaration") {
				for (const member of statement.members) if (member.value) expression(member.value, scope);
			} else if (statement.type === "forStatement") {
				expression(statement.iterable, scope);
				statement.body.forEach(item => nestedStatement(item, scope));
			} else if (statement.type === "bracedIfStatement") {
				expression(statement.test, scope);
				statement.consequent.forEach(item => nestedStatement(item, scope));
				statement.alternate?.forEach(item => nestedStatement(item, scope));
			} else if ("expression" in statement && statement.expression) expression(statement.expression, scope);
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
						if (targetStatement?.type === "enumDeclaration" && declarationFile) {
							visibleEnums.set(imported.name, { declaration: targetStatement, file: declarationFile });
						}
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
				if (statement.type === "diagramDeclaration") {
					const diagram = declaration(moduleText, file, statement);
					const diagramParent = !duplicates.has(statement.name) ? diagram?.target : undefined;
					const diagramScope = new Map(visible);
					for (const property of statement.properties) expression(property.expression);
					for (const time of statement.times) {
						expression(time.from);
						expression(time.to);
						expression(time.duration);
						const range = sourceTokenRange(moduleText, time.nameSource, time.name);
						if (!range || !diagramParent) continue;
						const localTime: EditorSymbolFact = {
							...range,
							file,
							name: time.name,
							target: { file, ...range },
							parent: diagramParent,
							declaration: true,
							kind: "diagramTime",
							detail: `time ${time.name}`
						};
						result.push(localTime);
						diagramScope.set(time.name, localTime);
					}
					const elementNames = new Set<string>();
					for (const element of statement.elements) {
						const range = sourceTokenRange(moduleText, element.nameSource, element.name);
						if (range && diagramParent && !elementNames.has(element.name)) {
							elementNames.add(element.name);
							result.push({
								...range,
								file,
								name: element.name,
								target: { file, ...range },
								parent: diagramParent,
								declaration: true,
								kind: "diagramElement",
								detail: `${element.primitive} ${element.name}`
							});
						}
						for (const property of element.properties) expression(property.expression, diagramScope);
					}
				}
				if (statement.type === "typeDeclaration") {
					for (const parent of statement.parents ?? []) add(parent.source, parent.name, visible.get(parent.name));
					for (const field of statement.fields) {
						if (field.annotation.type === "namedType" && field.annotation.name) add(field.annotation.source, field.annotation.name, visible.get(field.annotation.name));
						if (field.defaultExpression) expression(field.defaultExpression);
					}
				}
				if (statement.type === "enumDeclaration") {
					const memberFacts = statement.members.map(member => enumMemberTargets.get(`${file}\0${statement.name}\0${member.name}`)).filter((fact): fact is EditorSymbolFact => !!fact);
					result.push(...memberFacts);
					visibleEnums.set(statement.name, { declaration: statement, file });
					for (const member of statement.members) if (member.value) expression(member.value);
				}
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
				if (statement.type === "forStatement") {
					expression(statement.iterable);
					statement.body.forEach(item => nestedStatement(item));
				}
				if (statement.type === "bracedIfStatement") {
					expression(statement.test);
					statement.consequent.forEach(item => nestedStatement(item));
					statement.alternate?.forEach(item => nestedStatement(item));
				}
				if (statement.type === "functionDeclaration") expression(statement.body);
				const declared = declaration(moduleText, file, statement);
				if (declared && "name" in statement && !duplicates.has(statement.name)) {
					if (statement.type === "variableDeclaration") {
						const inferred = module?.checkResult.bindingTypes.get(statement.name) ?? (file === entryFile ? analysis?.bindingTypes?.get(statement.name) : undefined);
						if (inferred) declared.detail = `binding ${statement.name}: ${typeText(inferred)}`;
					}
					if (statement.type !== "diagramDeclaration") visible.set(statement.name, declared);
					result.push(declared);
					if (statement.type === "typeDeclaration") for (const field of statement.fields) {
						const range = sourceTokenRange(moduleText, field.source, field.name);
						if (range) result.push({ ...range, file, name: field.name, target: { file, ...range }, parent: declared.target, declaration: true, kind: "field", detail: `field ${field.name}: ${field.annotation.name ?? field.annotation.type}` });
					}
				}
			}
		}
	}
	return result;
}