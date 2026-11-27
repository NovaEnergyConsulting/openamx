import type { TranspileDiagnostic, TranspileGraphInput, TranspileResult, TranspiledModule } from './types';
import { emitModule, LoweringFailure, measurementVectorKey } from './emit';
import { prepareGraph, sourceDiagnostic, type PreparedModule } from './graph';
import type { DimensionMetadata } from '../typechecker/dimensionTypes';

function canonicalMeasurementDimensionIds(modules: readonly PreparedModule[]): ReadonlyMap<string, string> {
  const representatives = new Map<string, DimensionMetadata>();
  for (const module of modules) {
    for (const dimension of module.check.dimensions.values()) {
      const key = measurementVectorKey(dimension.vector);
      const current = representatives.get(key);
      if (!current || dimension.moduleIdentity < current.moduleIdentity
        || dimension.moduleIdentity === current.moduleIdentity && dimension.declarationName < current.declarationName) {
        representatives.set(key, dimension);
      }
    }
  }
  return new Map([...representatives].map(([key, dimension]) => [
    key,
    JSON.stringify([dimension.moduleIdentity, dimension.declarationName])
  ]));
}

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

  const measurementDimensionIds = canonicalMeasurementDimensionIds(graph.dependencyOrder);
  const generated: TranspiledModule[] = [];
  for (const module of graph.dependencyOrder) {
    try {
      generated.push({
        moduleId: module.input.moduleId,
        sourcePath: module.input.sourcePath,
        outputPath: module.input.outputPath,
        code: emitModule(module, module === graph.entry, measurementDimensionIds)
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