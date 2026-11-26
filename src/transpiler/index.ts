import type { TranspileDiagnostic, TranspileGraphInput, TranspileResult, TranspiledModule } from './types';
import { emitModule, LoweringFailure } from './emit';
import { prepareGraph, sourceDiagnostic } from './graph';

export type {
  TranspileDiagnostic,
  TranspileGraphInput,
  TranspileResolvedImport,
  TranspileSourceModule,
  TranspileResult,
  TranspiledModule
} from './types';

export function transpileDocument(input: TranspileGraphInput): TranspileResult {
  let graph;
  try {
    graph = prepareGraph(input.entryModuleId, input.modules);
  } catch (error) {
    return { ok: false, diagnostics: [sourceDiagnostic(error)] };
  }

  const generated: TranspiledModule[] = [];
  for (const module of graph.dependencyOrder) {
    try {
      generated.push({
        moduleId: module.input.moduleId,
        sourcePath: module.input.sourcePath,
        outputPath: module.input.outputPath,
        code: emitModule(module, module === graph.entry)
      });
    } catch (error) {
      const diagnostic: TranspileDiagnostic = error instanceof LoweringFailure
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