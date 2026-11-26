import path from "node:path";
import fs from "node:fs";
import { AmxError } from "../diagnostics/errors";
import { parseDocumentText } from "../parser/parseDocument";
import { checkDocument } from "../typechecker/checkDocument";
const MAX_EDITOR_MODULES = 101;
function statementsOf(document) {
    return document.nodes.flatMap(node => node.type === "executableCodeBlock" ? node.statements : []);
}
function canonicalFile(file) {
    const absolute = path.resolve(file);
    try {
        return fs.realpathSync(absolute);
    }
    catch {
        return path.isAbsolute(file) ? file : absolute;
    }
}
function moduleIssue(code, message, file, source) {
    throw new AmxError({ code, message, file, line: source?.line, column: source?.column });
}
function locatedError(error, file) {
    if (error instanceof AmxError) {
        error.file ??= file;
        return error;
    }
    const message = error instanceof Error ? error.message : String(error);
    const location = message.match(/\bat (\d+):(\d+)/);
    return new AmxError({ code: "AMX3001", message, file, line: location ? Number(location[1]) : undefined, column: location ? Number(location[2]) : undefined });
}
function isWithinOrEqual(root, candidate) {
    const relative = path.relative(root, candidate);
    return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}
function isWithinDirectory(root, candidate) {
    return root !== candidate && isWithinOrEqual(root, candidate);
}
function validateImportPath(importNode, file, importRoot, rootDescription) {
    const importPath = importNode.path;
    if (!(importPath.startsWith("./") || importPath.startsWith("../"))
        || importPath.includes("\\") || !importPath.endsWith(".amx") || path.isAbsolute(importPath)) {
        moduleIssue("AMX5001", `Invalid local module path '${importPath}'`, file, importNode.pathSource);
    }
    const target = path.resolve(path.dirname(file), importPath);
    if (!isWithinDirectory(importRoot, target)) {
        moduleIssue("AMX5001", `Module '${importPath}' resolves outside the ${rootDescription}`, file, importNode.pathSource);
    }
    return target;
}
/** Parse and statically check a bounded reachable module graph without evaluating AMX or loading data. */
export function analyzeEditorModules(text, entryFile, resolveModule, importRoot) {
    let entryDocument;
    try {
        entryDocument = parseDocumentText(text);
    }
    catch (error) {
        throw locatedError(error, entryFile);
    }
    const entryImports = statementsOf(entryDocument).filter((statement) => statement.type === "importDeclaration");
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
        moduleIssue("AMX5001", "Local imports are unavailable to this editor analysis", entryFile, entryImports[0].pathSource);
    }
    const entryPath = entryFile ? canonicalFile(entryFile) : "";
    const moduleRoot = importRoot ? canonicalFile(importRoot) : entryPath ? path.dirname(entryPath) : "";
    const rootDescription = importRoot ? "import root directory tree" : "entry directory tree";
    if (!isWithinOrEqual(moduleRoot, entryPath)) {
        moduleIssue("AMX5001", `Entry module '${entryFile}' resolves outside the ${rootDescription}`, entryFile, entryImports[0].pathSource);
    }
    const records = new Map();
    const visiting = [];
    const baseUnits = new Map();
    const visit = (file, document, viaImport) => {
        file = canonicalFile(file);
        const existing = records.get(file);
        if (existing)
            return existing;
        const cycleIndex = visiting.indexOf(file);
        if (cycleIndex >= 0) {
            const cycle = [...visiting.slice(cycleIndex), file].map(item => path.relative(moduleRoot, item) || path.basename(item)).join(" -> ");
            moduleIssue("AMX5003", `Import cycle detected: ${cycle}`, viaImport?.file ?? file, viaImport?.source);
        }
        if (records.size + visiting.length >= MAX_EDITOR_MODULES) {
            moduleIssue("AMX5001", `Editor module graph exceeds the ${MAX_EDITOR_MODULES}-module analysis limit`, viaImport?.file ?? file, viaImport?.source);
        }
        visiting.push(file);
        const statements = statementsOf(document);
        if (file !== entryPath) {
            const input = statements.find((statement) => statement.type === "inputDeclaration");
            if (input)
                moduleIssue("AMX3005", "Inputs may only be declared in the entry module", file, input.source);
        }
        const imports = statements.filter((statement) => statement.type === "importDeclaration");
        const localNames = new Set(statements.flatMap(statement => statement.type === "typeDeclaration" || statement.type === "enumDeclaration" || statement.type === "functionDeclaration"
            || statement.type === "variableDeclaration" || statement.type === "inputDeclaration"
            || statement.type === "tableDeclaration" || statement.type === "chartDeclaration"
            || statement.type === "dimensionDeclaration" || statement.type === "unitDeclaration" ? [statement.name] : []));
        const localDimensionUnitNames = new Set(statements.flatMap(statement => statement.type === "dimensionDeclaration" || statement.type === "unitDeclaration" ? [statement.name] : []));
        const importedTypes = new Map();
        const importedEnums = new Map();
        const importedFunctions = new Map();
        const importedBindings = new Map();
        const importedDimensions = new Map();
        const importedUnits = new Map();
        const importedNames = new Set();
        const importedDimensionUnitNames = new Set();
        const importTargets = new Map();
        for (const importNode of imports) {
            const targetPath = validateImportPath(importNode, file, moduleRoot, rootDescription);
            let resolved;
            try {
                resolved = resolveModule(file, targetPath, importNode);
            }
            catch (error) {
                if (error instanceof AmxError)
                    throw error;
                moduleIssue("AMX5001", `Module '${importNode.path}' could not be found`, file, importNode.pathSource);
            }
            if (!isWithinDirectory(moduleRoot, canonicalFile(resolved.file))) {
                moduleIssue("AMX5001", `Module '${importNode.path}' resolves outside the ${rootDescription}`, file, importNode.pathSource);
            }
            let dependencyDocument;
            try {
                dependencyDocument = parseDocumentText(resolved.text);
            }
            catch (error) {
                const nested = locatedError(error, resolved.file);
                if (nested.code === "AMX3006") {
                    nested.file ??= resolved.file;
                    throw nested;
                }
                moduleIssue("AMX5001", `Failed to parse module '${importNode.path}': ${nested.message}`, file, importNode.pathSource);
            }
            const dependencyPath = canonicalFile(resolved.file);
            const dependency = visit(dependencyPath, dependencyDocument, { file, source: importNode.pathSource });
            for (const importedName of importNode.names) {
                const isDimensionOrUnit = dependency.checkResult.exportedDimensions.has(importedName.name)
                    || dependency.checkResult.exportedUnits.has(importedName.name);
                if (importedNames.has(importedName.name)) {
                    if (isDimensionOrUnit || importedDimensionUnitNames.has(importedName.name))
                        moduleIssue("AMX3008", `Duplicate import of dimension/unit '${importedName.name}'`, file, importedName.source);
                    moduleIssue("AMX5002", `Duplicate import of '${importedName.name}'`, file, importedName.source);
                }
                importedNames.add(importedName.name);
                if (localNames.has(importedName.name)) {
                    if (isDimensionOrUnit || localDimensionUnitNames.has(importedName.name))
                        moduleIssue("AMX3008", `Imported dimension/unit '${importedName.name}' collides with a local declaration`, file, importedName.source);
                    moduleIssue("AMX5002", `Imported name '${importedName.name}' collides with a local declaration`, file, importedName.source);
                }
                if (dependency.checkResult.exportedTypes.has(importedName.name))
                    importedTypes.set(importedName.name, dependency.checkResult.exportedTypes.get(importedName.name));
                else if (dependency.checkResult.exportedEnums.has(importedName.name))
                    importedEnums.set(importedName.name, dependency.checkResult.exportedEnums.get(importedName.name));
                else if (dependency.checkResult.exportedFunctions.has(importedName.name))
                    importedFunctions.set(importedName.name, dependency.checkResult.exportedFunctions.get(importedName.name));
                else if (dependency.checkResult.exportedBindings.has(importedName.name))
                    importedBindings.set(importedName.name, dependency.checkResult.exportedBindings.get(importedName.name));
                else if (dependency.checkResult.exportedDimensions.has(importedName.name)) {
                    importedDimensions.set(importedName.name, dependency.checkResult.exportedDimensions.get(importedName.name));
                    importedDimensionUnitNames.add(importedName.name);
                }
                else if (dependency.checkResult.exportedUnits.has(importedName.name)) {
                    importedUnits.set(importedName.name, dependency.checkResult.exportedUnits.get(importedName.name));
                    importedDimensionUnitNames.add(importedName.name);
                }
                else
                    moduleIssue("AMX5002", `Module '${importNode.path}' does not export '${importedName.name}'`, file, importedName.source);
                importTargets.set(importedName.name, dependencyPath);
            }
        }
        let checkResult;
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
        catch (error) {
            visiting.pop();
            throw locatedError(error, file);
        }
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
//# sourceMappingURL=moduleAnalysis.js.map