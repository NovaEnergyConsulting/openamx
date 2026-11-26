// ---
// title: Calculation
// ---
// 
import { amxAdd1Based as __amxAdd1Based, amxAttach as __amxAttach, amxBinary as __amxBinary, amxBuiltin as __amxBuiltin, amxChartView as __amxChartView, amxConvert as __amxConvert, amxCopyListArgument as __amxCopyListArgument, amxDiagramView as __amxDiagramView, amxFormatValue as __amxFormatValue, amxGet1Based as __amxGet1Based, amxIsType as __amxIsType, amxIterate as __amxIterate, amxPhysicalValue as __amxPhysicalValue, amxRange as __amxRange, amxRemove1Based as __amxRemove1Based, amxTableView as __amxTableView, amxUnary as __amxUnary, validateAMXValue as __amxValidateValue, AMXInputError as __AMXInputError, AMXRuntimeError as __AMXRuntimeError, type AMXBuiltinName as __AMXBuiltinName, type AMXDiagramPrimitiveElement as __AMXDiagramPrimitiveElement, type AMXInputDescriptor as __AMXInputDescriptor, type AMXMeasurement as __AMXMeasurement, type AMXMeasurementInput as __AMXMeasurementInput, type AMXRunResult as __AMXRunResult, type AMXRuntimeContext as __AMXRuntimeContext, type AMXShownView as __AMXShownView, type AMXUnitDescriptor as __AMXUnitDescriptor, type AMXValue as __AMXValue, type AMXViewData as __AMXViewData } from 'openamx/transpiler-runtime';
interface __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_Row {
  label: string;
  value: number;
}
interface __AMXExternal___amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_Row {
  label: string;
  value: number;
}
const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_State = Object.freeze({
  READY: 1,
  FAILED: 2
} as const);
type __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_State = typeof __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_State[keyof typeof __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_State];
function __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_square(__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_arg_0_value: number): number {
  const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_value = __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_arg_0_value;
  return (__amxBinary("^", __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_value as unknown as __AMXValue, 2 as unknown as __AMXValue, { file: "entry.amx", line: 14, column: 7 }) as unknown as number);
}
const __amxUnits: readonly __AMXUnitDescriptor[] = [];
const __amxRuntime: __AMXRuntimeContext = { file: "entry.amx", unitDescriptors: __amxUnits };
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
  if (__context.modules.has("fixtures/main.ts")) return __context.modules.get("fixtures/main.ts") as Readonly<Record<string, unknown>>;
  // This stays literal: {{ 1 + 1 }}
  // 
  const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_values: (number)[] = (() => { const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_loop_results_15_1: (number)[] = []; for (const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_item of __amxIterate<number>(__amxRange(1, 3, { file: "entry.amx", line: 15, column: 1 }) as __AMXValue, { file: "entry.amx", line: 15, column: 1 })) {
      __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_loop_results_15_1.push(__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_square(__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_item));
  } return __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_loop_results_15_1; })();
  const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_selected: number = ((): number => { const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_match_18_24 = 1; if (__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_match_18_24 === 1) return (__amxGet1Based(__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_values as unknown as __AMXValue[], 1, { file: "entry.amx", line: 19, column: 19 }) as unknown as number); return 0; })();
  const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_state: number = __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_State["READY"];
  const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_ready: boolean = __amxIsType(__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_state as unknown as __AMXValue, { kind: 'enum', enumName: "State", members: [1,2] });
  const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_total: number = (__amxBuiltin("sum" as __AMXBuiltinName, [__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_values as unknown as __AMXValue], __amxRuntime) as unknown as number);
  const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_totalText: string = ["Total ", __amxFormatValue(__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_total as __AMXValue, { file: "entry.amx", line: 25, column: 34 })].join('');
  const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_rows: (__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_Row)[] = [(() => { const __amxSupplied = new Map<string, unknown>([["label", "A" as unknown], ["value", __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_square(1) as unknown]]); return { label: __amxSupplied.has("label") ? __amxSupplied.get("label") : null, value: __amxSupplied.has("value") ? __amxSupplied.get("value") : null } as __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_Row; })(), (() => { const __amxSupplied = new Map<string, unknown>([["label", "B" as unknown], ["value", __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_square(2) as unknown]]); return { label: __amxSupplied.has("label") ? __amxSupplied.get("label") : null, value: __amxSupplied.has("value") ? __amxSupplied.get("value") : null } as __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_Row; })()];
  __context.views.push(__amxTableView("data", [{ field: "label", label: "Label" }, { field: "value", label: "Value" }], __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_rows.map(__row => [__amxSnapshotViewValue(__row["label"]), __amxSnapshotViewValue(__row["value"])]), "Rows", ''));
  __amxAdd1Based(__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_rows as unknown as __AMXValue[], (() => { const __amxSupplied = new Map<string, unknown>([["label", "C" as unknown], ["value", __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_square(3) as unknown]]); return { label: __amxSupplied.has("label") ? __amxSupplied.get("label") : null, value: __amxSupplied.has("value") ? __amxSupplied.get("value") : null } as __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_Row; })() as unknown as __AMXValue, 2, { ...{ file: "entry.amx", line: 40, column: 1 }, targetName: "rows" });
  __context.views.push(__amxTableView("data", [{ field: "label", label: "Label" }, { field: "value", label: "Value" }], __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_rows.map(__row => [__amxSnapshotViewValue(__row["label"]), __amxSnapshotViewValue(__row["value"])]), "Rows", ''));
  (() => {
    const __amxWidth = __amxDiagramNumber(100, __amxRuntime, 'AMXD003', 'Canvas width is invalid', { file: "entry.amx", line: 45, column: 10 }, true);
    const __amxHeight = __amxDiagramNumber(50, __amxRuntime, 'AMXD014', 'Canvas height is invalid', { file: "entry.amx", line: 46, column: 11 }, true);
    const __amxFrom = __amxDiagramNumber(0, __amxRuntime, 'AMXD004', 'Invalid time bounds', { file: "entry.amx", line: 47, column: 15 });
    const __amxTo = __amxDiagramNumber(1, __amxRuntime, 'AMXD004', 'Invalid time bounds', { file: "entry.amx", line: 47, column: 20 });
    if (__amxFrom >= __amxTo) throw new __AMXRuntimeError({ code: 'AMXD004', message: 'Invalid time bounds', file: "entry.amx", line: 47, column: 3 });
    const __amxDuration = __amxDiagramNumber(1, __amxRuntime, 'AMXD005', 'Invalid playback duration value', { file: "entry.amx", line: 47, column: 31 }, true);
    const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_t = __amxFrom;
    const __amxDiagramBuilders: Array<() => __AMXDiagramPrimitiveElement> = [];
    let __amxGeneratedDiagramElements = 0;
    for (const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_item of __amxIterate<number>(__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_values as __AMXValue, { file: "entry.amx", line: 48, column: 15 })) {
      if ((__amxBinary(">", __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_item as unknown as __AMXValue, 2 as unknown as __AMXValue, { file: "entry.amx", line: 49, column: 13 }) as unknown as boolean)) {
    if (++__amxGeneratedDiagramElements > 64) throw new __AMXRuntimeError({ code: 'AMXD6004', message: 'Number of elements in this diagram exceed the maximum (64)', file: "entry.amx", line: 50, column: 7 });
    __amxDiagramBuilders.push(() => {
      const __radius = __amxDiagramNumber(2, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "entry.amx", line: 53, column: 12 }, true);
      const __fill = undefined;
      const __cx = __amxDiagramNumber((__amxBinary("*", __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_item as unknown as __AMXValue, 10 as unknown as __AMXValue, { file: "entry.amx", line: 51, column: 18 }) as unknown as number), __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "entry.amx", line: 51, column: 13 });
      const __cy = __amxDiagramNumber(__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_t, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "entry.amx", line: 52, column: 13 });
      return { primitive: 'circle', name: "point", cx: __cx, cy: __cy, r: __radius, stroke: "#263238", lineWidth: 1 };
    });
      }
    }
    const __amxElements = __amxDiagramBuilders.map(__build => __build());
    __context.views.push(__amxDiagramView({ schema: 'structured-v2', name: "scene", title: "Scene", description: "Initial frame", canvas: { width: __amxWidth, height: __amxHeight, coordinates: 'bottom-left-y-up' }, timeline: { variable: "t", from: __amxFrom, to: __amxTo, duration: __amxDuration }, initialFrame: { time: __amxFrom, elements: __amxElements } }));
  })();
  (() => { const __snapshot = __amxChartSnapshot(__amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_rows, [{ role: "series", field: "value", label: "Load", source: {"line":36,"column":3} }], "trend", false, __amxRuntime); __context.views.push(__amxChartView({ name: "trend", chartKind: "column", title: "Trend", description: "Values", data: __snapshot.data, headings: __snapshot.headings, measurementDescriptors: __snapshot.measurementDescriptors.length ? __snapshot.measurementDescriptors : undefined, labels: undefined, showTable: (__amxBinary(">", __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_total as unknown as __AMXValue, 0 as unknown as __AMXValue, { file: "entry.amx", line: 37, column: 19 }) as unknown as boolean) })); })();
  const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_result: number = (__amxBinary("+", __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_total as unknown as __AMXValue, __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_selected as unknown as __AMXValue, { file: "entry.amx", line: 61, column: 35 }) as unknown as number);
  const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_readyExport: boolean = __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_ready;
  const __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_stateExport: number = __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_state;
  const __result: Readonly<Record<string, unknown>> = Object.freeze({ "result": __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_result, "readyExport": __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_readyExport, "stateExport": __amx_66_69_78_74_75_72_65_73_2f_6d_61_69_6e_2e_74_73_stateExport });
  __context.modules.set("fixtures/main.ts", __result);
  return __result;
}
export type AMXRunInputs = Readonly<{

}>;
type __AMXValidatedInputs = Readonly<{

}>;
export type AMXRunExports = Readonly<{
  result: number;
  readyExport: boolean;
  stateExport: number;
}>;
export function run(inputs: AMXRunInputs): __AMXRunResult<AMXRunExports> {
  const __validated = __amxValidateValue<__AMXValidatedInputs>(inputs, { kind: 'record', recordName: 'AMXRunInputs', fields: [] }, { file: "entry.amx" });
  const __context: __AMXRunContext = { modules: new Map(), views: [] };
  const __exports = __amxInitialize(__context, __validated) as AMXRunExports;
  return { exports: __exports, views: Object.freeze(__context.views) };
}
