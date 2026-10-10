import path from "node:path";
import fs from "node:fs";
import type { EnumDeclarationNode, FunctionDeclarationNode, ImportDeclarationNode, OpenAmxDocument, StatementNode, TypeDeclarationNode } from "../ast/types";
import { AmxError } from "../diagnostics/errors";
import { parseDocumentText } from "../parser/parseDocument";
import { type CheckedType, checkDocument, type ModuleCheckResult } from "../typechecker/checkDocument";
import type { DimensionMetadata, UnitMetadata } from "../typechecker/dimensionTypes";

const MAX_EDITOR_MODULES = 101;

export interface EditorIssue {
	file?: string;
	line?: number;
	column?: number;
	code?: string;
	message: string;
}

export interface EditorModuleRecord {
	file: string;
	document: OpenAmxDocument;
	checkResult: ModuleCheckResult;
	importedTypes: Map<string, TypeDeclarationNode>;
	importedEnums: Map<string, EnumDeclarationNode>;
	importedFunctions: Map<string, FunctionDeclarationNode>;
	importedBindings: Map<string, CheckedType>;
	importedDimensions: Map<string, DimensionMetadata>;
	importedUnits: Map<string, UnitMetadata>;
	importTargets: Map<string, string>;
}

export interface EditorModuleAnalysis {
	document: OpenAmxDocument;
	importedTypes: Map<string, TypeDeclarationNode>;
	importedEnums: Map<string, EnumDeclarationNode>;
	importedFunctions: Map<string, FunctionDeclarationNode>;
	importedBindings: Map<string, CheckedType>;
	importedDimensions: Map<string, DimensionMetadata>;
	importedUnits: Map<string, UnitMetadata>;
	bindingTypes?: Map<string, CheckedType>;
	modules?: Map<string, EditorModuleRecord>;
}

export interface ResolvedEditorModule {
	file: string;
	text: string;
}

export type EditorModuleResolver = (
	fromFile: string,
	targetPath: string,
	importNode: ImportDeclarationNode
) => ResolvedEditorModule;

function statementsOf(document: OpenAmxDocument): StatementNode[] {
	return document.nodes.flatMap(node => node.type === "executableCodeBlock" ? node.statements : []);
}

function canonicalFile(file: string): string {
	const absolute = path.resolve(file);
	try { return fs.realpathSync(absolute); }
	catch { return path.isAbsolute(file) ? file : absolute; }
}

function moduleIssue(code: string, message: string, file: string, source?: { line: number; column: number }): never {
	throw new AmxError({ code, message, file, line: source?.line, column: source?.column });
}

function locatedError(error: unknown, file?: string): AmxError {
	if (error instanceof AmxError) {
		error.file ??= file;
		return error;
	}
	const message = error instanceof Error ? error.message : String(error);
	const location = message.match(/\bat (\d+):(\d+)/);
	return new AmxError({ code: "AMX3001", message, file, line: location ? Number(location[1]) : undefined, column: location ? Number(location[2]) : undefined });
}

function validateImportPath(importNode: ImportDeclarationNode, file: string, entryRoot: string): string {
	const importPath = importNode.path;
	if (!(importPath.startsWith("./") || importPath.startsWith("../"))
		|| importPath.includes("\\") || !importPath.endsWith(".amx") || path.isAbsolute(importPath)) {
		moduleIssue("AMX5001", `Invalid local module path '${importPath}'`, file, importNode.pathSource);
	}
	const target = path.resolve(path.dirname(file), importPath);
	const relativeToRoot = path.relative(entryRoot, target);
	if (relativeToRoot === ".." || relativeToRoot.startsWith(`..${path.sep}`) || path.isAbsolute(relativeToRoot)) {
		moduleIssue("AMX5001", `Module '${importPath}' resolves outside the entry directory tree`, file, importNode.pathSource);
	}
	return target;
}

/** Parse and statically check a bounded reachable module graph without evaluating AMX or loading data. */
export function analyzeEditorModules(text: string, entryFile?: string, resolveModule?: EditorModuleResolver): EditorModuleAnalysis {
	let entryDocument: OpenAmxDocument;
	try { entryDocument = parseDocumentText(text); }
	catch (error) { throw locatedError(error, entryFile); }

	const entryImports = statementsOf(entryDocument).filter(
		(statement): statement is ImportDeclarationNode => statement.type === "importDeclaration"
	);
	if (!entryImports.length) {
		const file = entryFile ? canonicalFile(entryFile) : undefined;
		const checkResult = checkDocument(entryDocument, file, { moduleIdentity: file });
		return {
			document: entryDocument,
			importedTypes: new Map(),
			importedEnums: new Map(),
			importedFunctions: new Map(),
			importedBindings: new Map(),
			importedDimensions: new Map(),
			importedUnits: new Map(),
			...checkResult
		};
	}
	if (entryImports.length && (!entryFile || !path.isAbsolute(entryFile))) {
		moduleIssue("AMX5001", "Local imports require a saved file in the workspace", entryFile ?? "", entryImports[0].pathSource);
	}
	if (entryImports.length && !resolveModule) {
		moduleIssue("AMX5001", "Local imports are unavailable to this editor analysis", entryFile!, entryImports[0].pathSource);
	}

	const entryPath = entryFile ? canonicalFile(entryFile) : "";
	const entryRoot = entryPath ? path.dirname(entryPath) : "";
	const records = new Map<string, EditorModuleRecord>();
	const visiting: string[] = [];

	const baseUnits = new Map<string, UnitMetadata>();
	const visit = (file: string, document: OpenAmxDocument, viaImport?: { file: string; source?: ImportDeclarationNode["pathSource"] }): EditorModuleRecord => {
		file = canonicalFile(file);
		const existing = records.get(file);
		if (existing) return existing;
		const cycleIndex = visiting.indexOf(file);
		if (cycleIndex >= 0) {
			const cycle = [...visiting.slice(cycleIndex), file].map(item => path.relative(entryRoot, item) || path.basename(item)).join(" -> ");
			moduleIssue("AMX5003", `Import cycle detected: ${cycle}`, viaImport?.file ?? file, viaImport?.source);
		}
		if (records.size + visiting.length >= MAX_EDITOR_MODULES) {
			moduleIssue("AMX5001", `Editor module graph exceeds the ${MAX_EDITOR_MODULES}-module analysis limit`, viaImport?.file ?? file, viaImport?.source);
		}
		visiting.push(file);

		const statements = statementsOf(document);
		if (file !== entryPath) {
			const input = statements.find((statement): statement is Extract<StatementNode, { type: "inputDeclaration" }> => statement.type === "inputDeclaration");
			if (input) moduleIssue("AMX3005", "Inputs may only be declared in the entry module", file, input.source);
		}
		const imports = statements.filter((statement): statement is ImportDeclarationNode => statement.type === "importDeclaration");
		const localNames = new Set(statements.flatMap(statement =>
			statement.type === "typeDeclaration" || statement.type === "enumDeclaration" || statement.type === "functionDeclaration"
				|| statement.type === "variableDeclaration" || statement.type === "inputDeclaration"
				|| statement.type === "tableDeclaration" || statement.type === "chartDeclaration"
				|| statement.type === "dimensionDeclaration" || statement.type === "unitDeclaration" ? [statement.name] : []
		));
		const localDimensionUnitNames = new Set(statements.flatMap(statement =>
			statement.type === "dimensionDeclaration" || statement.type === "unitDeclaration" ? [statement.name] : []
		));
		const importedTypes = new Map<string, TypeDeclarationNode>();
		const importedEnums = new Map<string, EnumDeclarationNode>();
		const importedFunctions = new Map<string, FunctionDeclarationNode>();
		const importedBindings = new Map<string, CheckedType>();
		const importedDimensions = new Map<string, DimensionMetadata>();
		const importedUnits = new Map<string, UnitMetadata>();
		const importedNames = new Set<string>();
		const importedDimensionUnitNames = new Set<string>();
		const importTargets = new Map<string, string>();

		for (const importNode of imports) {
			const targetPath = validateImportPath(importNode, file, entryRoot);
			let resolved: ResolvedEditorModule;
			try { resolved = resolveModule!(file, targetPath, importNode); }
			catch (error) {
				if (error instanceof AmxError) throw error;
				moduleIssue("AMX5001", `Module '${importNode.path}' could not be found`, file, importNode.pathSource);
			}
			const relativeToRoot = path.relative(entryRoot, resolved!.file);
			if (relativeToRoot === ".." || relativeToRoot.startsWith(`..${path.sep}`) || path.isAbsolute(relativeToRoot)) {
				moduleIssue("AMX5001", `Module '${importNode.path}' resolves outside the entry directory tree`, file, importNode.pathSource);
			}
			let dependencyDocument: OpenAmxDocument;
			try { dependencyDocument = parseDocumentText(resolved!.text); }
			catch (error) {
				const nested = locatedError(error, resolved!.file);
				if (nested.code === "AMX3006") {
					nested.file ??= resolved!.file;
					throw nested;
				}
				moduleIssue("AMX5001", `Failed to parse module '${importNode.path}': ${nested.message}`, file, importNode.pathSource);
			}
			const dependencyPath = canonicalFile(resolved!.file);
			const dependency = visit(dependencyPath, dependencyDocument!, { file, source: importNode.pathSource });
			for (const importedName of importNode.names) {
				const isDimensionOrUnit = dependency.checkResult.exportedDimensions.has(importedName.name)
					|| dependency.checkResult.exportedUnits.has(importedName.name);
				if (importedNames.has(importedName.name)) {
					if (isDimensionOrUnit || importedDimensionUnitNames.has(importedName.name)) moduleIssue("AMX3008", `Duplicate import of dimension/unit '${importedName.name}'`, file, importedName.source);
					moduleIssue("AMX5002", `Duplicate import of '${importedName.name}'`, file, importedName.source);
				}
				importedNames.add(importedName.name);
				if (localNames.has(importedName.name)) {
					if (isDimensionOrUnit || localDimensionUnitNames.has(importedName.name)) moduleIssue("AMX3008", `Imported dimension/unit '${importedName.name}' collides with a local declaration`, file, importedName.source);
					moduleIssue("AMX5002", `Imported name '${importedName.name}' collides with a local declaration`, file, importedName.source);
				}
				if (dependency.checkResult.exportedTypes.has(importedName.name)) importedTypes.set(importedName.name, dependency.checkResult.exportedTypes.get(importedName.name)!);
				else if (dependency.checkResult.exportedEnums.has(importedName.name)) importedEnums.set(importedName.name, dependency.checkResult.exportedEnums.get(importedName.name)!);
				else if (dependency.checkResult.exportedFunctions.has(importedName.name)) importedFunctions.set(importedName.name, dependency.checkResult.exportedFunctions.get(importedName.name)!);
				else if (dependency.checkResult.exportedBindings.has(importedName.name)) importedBindings.set(importedName.name, dependency.checkResult.exportedBindings.get(importedName.name)!);
				else if (dependency.checkResult.exportedDimensions.has(importedName.name)) {
					importedDimensions.set(importedName.name, dependency.checkResult.exportedDimensions.get(importedName.name)!);
					importedDimensionUnitNames.add(importedName.name);
				} else if (dependency.checkResult.exportedUnits.has(importedName.name)) {
					importedUnits.set(importedName.name, dependency.checkResult.exportedUnits.get(importedName.name)!);
					importedDimensionUnitNames.add(importedName.name);
				}
				else moduleIssue("AMX5002", `Module '${importNode.path}' does not export '${importedName.name}'`, file, importedName.source);
				importTargets.set(importedName.name, dependencyPath);
			}
		}

		let checkResult: ModuleCheckResult;
		try {
			checkResult = checkDocument(document, file, {
				types: importedTypes,
				enums: importedEnums,
				functions: importedFunctions,
				bindings: importedBindings,
				dimensions: importedDimensions,
				units: importedUnits,
				baseUnits,
				moduleIdentity: file
			});
		}
		catch (error) { visiting.pop(); throw locatedError(error, file); }
		visiting.pop();
		const record = { file, document, checkResult, importedTypes, importedEnums, importedFunctions, importedBindings, importedDimensions, importedUnits, importTargets };
		records.set(file, record);
		return record;
	};

	const result = visit(entryPath, entryDocument);
	return {
		document: result.document,
		importedTypes: result.importedTypes,
		importedEnums: result.importedEnums,
		importedFunctions: result.importedFunctions,
		importedBindings: result.importedBindings,
		importedDimensions: result.importedDimensions,
		importedUnits: result.importedUnits,
		bindingTypes: result.checkResult.bindingTypes,
		modules: records
	};
}