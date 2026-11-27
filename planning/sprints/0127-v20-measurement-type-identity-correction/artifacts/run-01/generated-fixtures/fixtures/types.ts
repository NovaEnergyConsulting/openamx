import { __amxInitialize as __amxInit_75_6e_69_74_73_2e_74_73 } from "./units.ts";
import { amxAdd1Based as __amxAdd1Based, amxAttach as __amxAttach, amxBinary as __amxBinary, amxBuiltin as __amxBuiltin, amxChartView as __amxChartView, amxConvert as __amxConvert, amxCopyListArgument as __amxCopyListArgument, amxDiagramView as __amxDiagramView, amxFormatValue as __amxFormatValue, amxGet1Based as __amxGet1Based, amxIsType as __amxIsType, amxIterate as __amxIterate, amxPhysicalValue as __amxPhysicalValue, amxRange as __amxRange, amxRemove1Based as __amxRemove1Based, amxTableView as __amxTableView, amxUnary as __amxUnary, validateAMXValue as __amxValidateValue, AMXInputError as __AMXInputError, AMXRuntimeError as __AMXRuntimeError, type AMXBuiltinName as __AMXBuiltinName, type AMXDiagramPrimitiveElement as __AMXDiagramPrimitiveElement, type AMXInputDescriptor as __AMXInputDescriptor, type AMXMeasurement as __AMXMeasurement, type AMXMeasurementInput as __AMXMeasurementInput, type AMXRunResult as __AMXRunResult, type AMXRuntimeContext as __AMXRuntimeContext, type AMXShownView as __AMXShownView, type AMXUnitDescriptor as __AMXUnitDescriptor, type AMXValue as __AMXValue, type AMXViewData as __AMXViewData } from 'openamx/transpiler-runtime';
export const __amx_74_79_70_65_73_2e_74_73_Status = Object.freeze({
  READY: "ready",
  FAILED: "failed"
} as const);
export type __amx_74_79_70_65_73_2e_74_73_Status = typeof __amx_74_79_70_65_73_2e_74_73_Status[keyof typeof __amx_74_79_70_65_73_2e_74_73_Status];
export const __amx_74_79_70_65_73_2e_74_73_Priority = Object.freeze({
  LOW: 1,
  HIGH: 2
} as const);
export type __amx_74_79_70_65_73_2e_74_73_Priority = typeof __amx_74_79_70_65_73_2e_74_73_Priority[keyof typeof __amx_74_79_70_65_73_2e_74_73_Priority];
export interface __amx_74_79_70_65_73_2e_74_73_BaseRow {
  label: string;
}
export interface __AMXExternal___amx_74_79_70_65_73_2e_74_73_BaseRow {
  label: string;
}
export interface __amx_74_79_70_65_73_2e_74_73_Row extends __amx_74_79_70_65_73_2e_74_73_BaseRow {
  label: string;
  value: __AMXMeasurement<"[\"units.ts\",\"Length\"]">;
  rating: number;
  measuredAt: string;
  note: string | null;
}
export interface __AMXExternal___amx_74_79_70_65_73_2e_74_73_Row {
  label: string;
  value: __AMXMeasurementInput<"[\"units.ts\",\"Length\"]">;
  rating?: number;
  measuredAt: string;
  note?: string | null;
}
export interface __amx_74_79_70_65_73_2e_74_73_Payload {
  distance: __AMXMeasurement<"[\"units.ts\",\"Length\"]">;
  status: __amx_74_79_70_65_73_2e_74_73_Status;
  priority: __amx_74_79_70_65_73_2e_74_73_Priority;
  observedAt: string;
  locations: (__amx_74_79_70_65_73_2e_74_73_Row)[];
  labels: (string | null)[];
}
export interface __AMXExternal___amx_74_79_70_65_73_2e_74_73_Payload {
  distance: __AMXMeasurementInput<"[\"units.ts\",\"Length\"]">;
  status: __amx_74_79_70_65_73_2e_74_73_Status;
  priority: __amx_74_79_70_65_73_2e_74_73_Priority;
  observedAt: string;
  locations: (__AMXExternal___amx_74_79_70_65_73_2e_74_73_Row)[];
  labels: (string | null)[];
}
const __amxUnits: readonly __AMXUnitDescriptor[] = [{ identity: "[\"units.ts\",\"meter\"]", name: "meter", scale: 1, offset: 0, vector: {"[\"units.ts\",\"Length\"]":1} }, { identity: "[\"units.ts\",\"centimeter\"]", name: "centimeter", scale: 0.01, offset: 0, vector: {"[\"units.ts\",\"Length\"]":1} }];
const __amxRuntime: __AMXRuntimeContext = { file: "project/types.amx", unitDescriptors: __amxUnits };
function __amxDiagramNumber(value: number, context: __AMXRuntimeContext, code: string, message: string, source: Readonly<{ file?: string; line?: number; column?: number }>, positive = false): number { if (!Number.isFinite(value) || positive && value <= 0) throw new __AMXRuntimeError({ code, message, file: source.file ?? context.file, line: source.line ?? context.line, column: source.column ?? context.column }); return value; }
function __amxIsMeasurement(value: unknown): value is __AMXMeasurement { return typeof value === 'object' && value !== null && !Array.isArray(value) && '__amxMeasurement' in value && (value as { __amxMeasurement?: unknown }).__amxMeasurement === true; }
function __amxSnapshotViewValue(value: unknown): __AMXViewData { if (value === null || typeof value === 'string' || typeof value === 'boolean') return value; if (typeof value === 'number') return value; if (Array.isArray(value)) return value.map(__amxSnapshotViewValue); if (__amxIsMeasurement(value)) return String(value.value) + ' ' + value.unit.text; if (typeof value === 'object') { const copy: Record<string, __AMXViewData> = {}; for (const [field, item] of Object.entries(value)) copy[field] = __amxSnapshotViewValue(item); return copy; } return null; }
interface __AMXChartColumn { readonly role: 'series' | 'x' | 'y'; readonly field?: string; readonly label: string; readonly source?: Readonly<{ line?: number; column?: number }> }
function __amxSameMeasurementDimension(left: __AMXMeasurement, right: __AMXMeasurement): boolean { const a = Object.entries(left.unit.vector); return a.length === Object.keys(right.unit.vector).length && a.every(([identity, exponent]) => right.unit.vector[identity] === exponent); }
function __amxChartFailure(name: string, message: string, context: __AMXRuntimeContext, source?: __AMXChartColumn['source']): never { throw new __AMXRuntimeError({ code: 'AMX3007', message, file: context.file, line: source?.line ?? context.line, column: source?.column ?? context.column }); }
function __amxChartValue(value: unknown, target: __AMXMeasurement | undefined, name: string, column: __AMXChartColumn | undefined, context: __AMXRuntimeContext): __AMXViewData { if (value === null || value === undefined) return null; if (!target) return __amxSnapshotViewValue(value); if (!__amxIsMeasurement(value) || !__amxSameMeasurementDimension(value, target)) return __amxChartFailure(name, 'Chart ' + name + ' contains an incompatible measurement value', context, column?.source); const converted = (__amxPhysicalValue(value) - target.unit.offset) / target.unit.scale; if (!Number.isFinite(converted)) return __amxChartFailure(name, 'Chart ' + name + ' measurement cannot be normalized to its first display unit', context, column?.source); return converted; }
function __amxChartSnapshot(data: readonly unknown[], columns: readonly __AMXChartColumn[], name: string, scatter: boolean, context: __AMXRuntimeContext): { readonly data: readonly __AMXViewData[]; readonly headings: readonly string[]; readonly measurementDescriptors: readonly Readonly<{ role: 'series' | 'x' | 'y'; field?: string; label: string; unit: Readonly<{ text: string; scale: number; vector: Readonly<Record<string, number>>; factors: readonly Readonly<{ identity: string; name: string; exponent: number }>[] }> }>[] } { const chosen = columns.map(column => { const values = data.map(item => item !== null && typeof item === 'object' && !Array.isArray(item) && !__amxIsMeasurement(item) ? (item as Record<string, unknown>)[column.field ?? ''] : column.field === undefined ? item : undefined); const first = values.find(value => value !== null && value !== undefined); const target = __amxIsMeasurement(first) ? first : undefined; for (const value of values) { if (value === null || value === undefined) continue; if (target ? !__amxIsMeasurement(value) || !__amxSameMeasurementDimension(value, target) : __amxIsMeasurement(value)) __amxChartFailure(name, 'Chart ' + name + ' contains incompatible measurement dimensions', context, column.source); } return target; }); const headings = scatter ? (['x', 'y'] as const).map((axis, index) => chosen[index] ? axis + ' (' + chosen[index]!.unit.text + ')' : axis).concat('group') : ['label', ...columns.filter(column => column.role === 'series').map((column, index) => { const target = chosen[index]; return target ? column.label + ' (' + target.unit.text + ')' : column.label; })]; const measurementDescriptors = columns.flatMap((column, index) => { const target = chosen[index]; if (!target) return []; return [{ role: column.role, ...(column.field === undefined ? {} : { field: column.field }), label: column.label, unit: { text: target.unit.text, scale: target.unit.scale, vector: target.unit.vector, factors: target.unit.factors } }]; }); const normalized = data.map((item): __AMXViewData => { if (item !== null && typeof item === 'object' && !Array.isArray(item) && !__amxIsMeasurement(item)) { const values: Record<string, __AMXViewData> = {}; for (const [field, value] of Object.entries(item)) { const index = columns.findIndex(column => column.field === field); values[field] = index < 0 ? __amxSnapshotViewValue(value) : __amxChartValue(value, chosen[index], name, columns[index], context); } return values; } return __amxChartValue(item, chosen[0], name, columns[0], context); }); return { data: normalized, headings, measurementDescriptors }; }
interface __AMXRunContext { readonly modules: Map<string, unknown>; readonly views: __AMXShownView[] }
export function __amxInitialize(__context: __AMXRunContext, __inputs: __AMXValidatedInputs = {} as __AMXValidatedInputs): Readonly<Record<string, unknown>> {
  if (__context.modules.has("types.ts")) return __context.modules.get("types.ts") as Readonly<Record<string, unknown>>;
  const __amxDependency_75_6e_69_74_73_2e_74_73 = __amxInit_75_6e_69_74_73_2e_74_73(__context);
  (() => {
    const __amxWidth = __amxDiagramNumber(20, __amxRuntime, 'AMXD003', 'Canvas width is invalid', { file: "project/types.amx", line: 32, column: 10 }, true);
    const __amxHeight = __amxDiagramNumber(10, __amxRuntime, 'AMXD014', 'Canvas height is invalid', { file: "project/types.amx", line: 33, column: 11 }, true);
    const __amxFrom = __amxDiagramNumber(0, __amxRuntime, 'AMXD004', 'Invalid time bounds', { file: "project/types.amx", line: 34, column: 15 });
    const __amxTo = __amxDiagramNumber(1, __amxRuntime, 'AMXD004', 'Invalid time bounds', { file: "project/types.amx", line: 34, column: 20 });
    if (__amxFrom >= __amxTo) throw new __AMXRuntimeError({ code: 'AMXD004', message: 'Invalid time bounds', file: "project/types.amx", line: 34, column: 3 });
    const __amxDuration = __amxDiagramNumber(1, __amxRuntime, 'AMXD005', 'Invalid playback duration value', { file: "project/types.amx", line: 34, column: 31 }, true);
    const __amx_74_79_70_65_73_2e_74_73_t = __amxFrom;
    const __amxDiagramBuilders: Array<() => __AMXDiagramPrimitiveElement> = [];
    let __amxGeneratedDiagramElements = 0;
    __amxDiagramBuilders.push(() => ({ primitive: 'line', name: "axis", x1: __amxDiagramNumber(0, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 36, column: 9 }), y1: __amxDiagramNumber(0, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 37, column: 9 }), x2: __amxDiagramNumber(10, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 38, column: 9 }), y2: __amxDiagramNumber(10, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 39, column: 9 }), stroke: "#263238", lineWidth: 1, arrow: "end" }));
    __amxDiagramBuilders.push(() => {
      const __width = __amxDiagramNumber(4, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 47, column: 12 }, true);
      const __height = __amxDiagramNumber(2, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 48, column: 13 }, true);
      const __fill = "#ffffff";
      const __x = __amxDiagramNumber(1, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 45, column: 8 });
      const __y = __amxDiagramNumber(1, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 46, column: 8 });
      return { primitive: 'rectangle', name: "plate", x: __x, y: __y, width: __width, height: __height, stroke: "#263238", fill: "#ffffff", lineWidth: 1 };
    });
    __amxDiagramBuilders.push(() => {
      const __radius = __amxDiagramNumber(1, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 56, column: 8 }, true);
      const __fill = undefined;
      const __cx = __amxDiagramNumber(5, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 54, column: 9 });
      const __cy = __amxDiagramNumber(5, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 55, column: 9 });
      return { primitive: 'circle', name: "hub", cx: __cx, cy: __cy, r: __radius, stroke: "#263238", lineWidth: 1 };
    });
    __amxDiagramBuilders.push(() => ({ primitive: 'text', name: "caption", value: "Dependency", x: __amxDiagramNumber(2, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 61, column: 8 }), y: __amxDiagramNumber(2, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "project/types.amx", line: 62, column: 8 }), fill: "#263238" }));
    const __amxElements = __amxDiagramBuilders.map(__build => __build());
    __context.views.push(__amxDiagramView({ schema: 'structured-v2', name: "importedScene", title: "Imported", description: "Dependency frame", canvas: { width: __amxWidth, height: __amxHeight, coordinates: 'bottom-left-y-up' }, timeline: { variable: "t", from: __amxFrom, to: __amxTo, duration: __amxDuration }, initialFrame: { time: __amxFrom, elements: __amxElements } }));
  })();
  const __result: Readonly<Record<string, unknown>> = Object.freeze({  });
  __context.modules.set("types.ts", __result);
  return __result;
}
type __AMXValidatedInputs = Readonly<Record<string, never>>;
