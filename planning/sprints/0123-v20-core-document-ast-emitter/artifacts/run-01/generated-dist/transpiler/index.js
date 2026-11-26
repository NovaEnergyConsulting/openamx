import { emitModule, LoweringFailure } from './emit';
import { prepareGraph, sourceDiagnostic } from './graph';
export function transpileDocument(input) {
    let graph;
    try {
        graph = prepareGraph(input.entryModuleId, input.modules);
    }
    catch (error) {
        return { ok: false, diagnostics: [sourceDiagnostic(error)] };
    }
    const generated = [];
    for (const module of graph.dependencyOrder) {
        try {
            generated.push({
                moduleId: module.input.moduleId,
                sourcePath: module.input.sourcePath,
                outputPath: module.input.outputPath,
                code: emitModule(module, module === graph.entry)
            });
        }
        catch (error) {
            const diagnostic = error instanceof LoweringFailure
                ? {
                    message: error.message,
                    file: module.input.sourcePath,
                    ...(error.line === undefined ? {} : { line: error.line }),
                    ...(error.column === undefined ? {} : { column: error.column })
                }
                : sourceDiagnostic(error, module.input.sourcePath);
            return { ok: false, diagnostics: [diagnostic] };
        }
    }
    return { ok: true, entryModuleId: input.entryModuleId, modules: generated };
}
//# sourceMappingURL=index.js.map