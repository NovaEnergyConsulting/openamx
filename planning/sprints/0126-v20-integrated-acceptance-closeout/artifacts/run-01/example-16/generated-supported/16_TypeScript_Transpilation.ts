// ---
// title: TypeScript Graph Transpilation
// ---
import { __amxInitialize as __amxInit_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73, type __amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_Asset as __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_Asset, type __AMXExternal___amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_Asset as __AMXExternal___amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_Asset, type __amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_FailureMode as __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_FailureMode, type __AMXExternal___amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_FailureMode as __AMXExternal___amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_FailureMode } from "./libraries/asset-management.ts";
import { amxAdd1Based as __amxAdd1Based, amxAttach as __amxAttach, amxBinary as __amxBinary, amxBuiltin as __amxBuiltin, amxChartView as __amxChartView, amxConvert as __amxConvert, amxCopyListArgument as __amxCopyListArgument, amxDiagramView as __amxDiagramView, amxFormatValue as __amxFormatValue, amxGet1Based as __amxGet1Based, amxIsType as __amxIsType, amxIterate as __amxIterate, amxPhysicalValue as __amxPhysicalValue, amxRange as __amxRange, amxRemove1Based as __amxRemove1Based, amxTableView as __amxTableView, amxUnary as __amxUnary, validateAMXValue as __amxValidateValue, AMXInputError as __AMXInputError, AMXRuntimeError as __AMXRuntimeError, type AMXBuiltinName as __AMXBuiltinName, type AMXDiagramPrimitiveElement as __AMXDiagramPrimitiveElement, type AMXInputDescriptor as __AMXInputDescriptor, type AMXMeasurement as __AMXMeasurement, type AMXMeasurementInput as __AMXMeasurementInput, type AMXRunResult as __AMXRunResult, type AMXRuntimeContext as __AMXRuntimeContext, type AMXShownView as __AMXShownView, type AMXUnitDescriptor as __AMXUnitDescriptor, type AMXValue as __AMXValue, type AMXViewData as __AMXViewData } from 'openamx/transpiler-runtime';
interface __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_ExposurePoint {
  label: string;
  score: number;
}
interface __AMXExternal___amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_ExposurePoint {
  label: string;
  score: number;
}
const __amxUnits: readonly __AMXUnitDescriptor[] = [];
const __amxRuntime: __AMXRuntimeContext = { file: "16_TypeScript_Transpilation.amx", unitDescriptors: __amxUnits };
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
  if (__context.modules.has("16_TypeScript_Transpilation.ts")) return __context.modules.get("16_TypeScript_Transpilation.ts") as Readonly<Record<string, unknown>>;
  const __amxDependency_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73 = __amxInit_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73(__context);
  const __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_asset = __inputs["asset"];
  // 
  // # TypeScript Graph Transpilation
  // 
  // This standalone example shows a computable document exported as a TypeScript
  // module graph. The sentence `{{ asset.name }}` remains literal narrative in the
  // generated source; transpilation does not evaluate Markdown interpolation.
  // 
  // ```typescript
  // const note = "This fence is narrative, not executable AMX.";
  // ```
  // 
  // ## Calculation and views
  // 
  // 
  const __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_points: (__amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_ExposurePoint)[] = [(() => { const __amxSupplied = new Map<string, unknown>([["label", "Base" as unknown], ["score", __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_asset["criticality"] as unknown]]); return { label: __amxSupplied.has("label") ? __amxSupplied.get("label") : null, score: __amxSupplied.has("score") ? __amxSupplied.get("score") : null } as __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_ExposurePoint; })(), (() => { const __amxSupplied = new Map<string, unknown>([["label", "Escalated" as unknown], ["score", (__amxBinary("*", __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_asset["criticality"] as unknown as __AMXValue, 2 as unknown as __AMXValue, { file: "16_TypeScript_Transpilation.amx", line: 29, column: 66 }) as unknown as number) as unknown]]); return { label: __amxSupplied.has("label") ? __amxSupplied.get("label") : null, score: __amxSupplied.has("score") ? __amxSupplied.get("score") : null } as __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_ExposurePoint; })()];
  const __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_scores: (number)[] = [__amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_asset["criticality"], (__amxBinary("*", __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_asset["criticality"] as unknown as __AMXValue, 2 as unknown as __AMXValue, { file: "16_TypeScript_Transpilation.amx", line: 31, column: 62 }) as unknown as number)];
  const __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_assetName: string = __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_asset["name"];
  __context.views.push(__amxTableView("exposureTable", [{ field: "label", label: "Scenario" }, { field: "score", label: "Score" }], __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_points.map(__row => [__amxSnapshotViewValue(__row["label"]), __amxSnapshotViewValue(__row["score"])]), "Exposure points", ''));
  (() => { const __showTable = false; const __labels = undefined; const __snapshot = __amxChartSnapshot(__amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_scores, [{ role: "series", label: "Score", source: {"line":43,"column":3} }], "exposureChart", false, __amxRuntime); __context.views.push(__amxChartView({ name: "exposureChart", chartKind: "bar", title: "Exposure score", description: "Base and escalated asset criticality", data: __snapshot.data, headings: __snapshot.headings, measurementDescriptors: __snapshot.measurementDescriptors.length ? __snapshot.measurementDescriptors : undefined, labels: __labels, showTable: __showTable })); })();
  (() => {
    const __amxWidth = __amxDiagramNumber(240, __amxRuntime, 'AMXD003', 'Canvas width is invalid', { file: "16_TypeScript_Transpilation.amx", line: 52, column: 10 }, true);
    const __amxHeight = __amxDiagramNumber(80, __amxRuntime, 'AMXD014', 'Canvas height is invalid', { file: "16_TypeScript_Transpilation.amx", line: 53, column: 11 }, true);
    const __amxFrom = __amxDiagramNumber(0, __amxRuntime, 'AMXD004', 'Invalid time bounds', { file: "16_TypeScript_Transpilation.amx", line: 54, column: 15 });
    const __amxTo = __amxDiagramNumber(1, __amxRuntime, 'AMXD004', 'Invalid time bounds', { file: "16_TypeScript_Transpilation.amx", line: 54, column: 20 });
    if (__amxFrom >= __amxTo) throw new __AMXRuntimeError({ code: 'AMXD004', message: 'Invalid time bounds', file: "16_TypeScript_Transpilation.amx", line: 54, column: 3 });
    const __amxDuration = __amxDiagramNumber(1, __amxRuntime, 'AMXD005', 'Invalid playback duration value', { file: "16_TypeScript_Transpilation.amx", line: 54, column: 31 }, true);
    const __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_t = __amxFrom;
    const __amxDiagramBuilders: Array<() => __AMXDiagramPrimitiveElement> = [];
    let __amxGeneratedDiagramElements = 0;
    __amxDiagramBuilders.push(() => ({ primitive: 'text', name: "name", value: __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_asset["name"], x: __amxDiagramNumber(12, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "16_TypeScript_Transpilation.amx", line: 56, column: 8 }), y: __amxDiagramNumber(40, __amxRuntime, 'AMXD008', 'Invalid primitive geometry', { file: "16_TypeScript_Transpilation.amx", line: 57, column: 8 }), fill: "#203040" }));
    const __amxElements = __amxDiagramBuilders.map(__build => __build());
    __context.views.push(__amxDiagramView({ schema: 'structured-v2', name: "assetLabel", title: "Asset label", description: "The active asset name at declaration time", canvas: { width: __amxWidth, height: __amxHeight, coordinates: 'bottom-left-y-up' }, timeline: { variable: "t", from: __amxFrom, to: __amxTo, duration: __amxDuration }, initialFrame: { time: __amxFrom, elements: __amxElements } }));
  })();
  // 
  // With `examples/data/asset.json`, the explicit export is `North Pump 01`. The
  // table and chart are snapshots from their `show`
  // statements. The structured-v2 diagram DTO is included at declaration time;
  // AMX does not use `show` for diagrams.
  // 
  // ## Transpile the graph
  // 
  // From the repository root, the following command writes outside the source
  // tree:
  // 
  // ```sh
  // bun run src/cli.ts transpile examples/16_TypeScript_Transpilation.amx --out-dir ./typescript-output
  // ```
  // 
  // The output contains the entry module and its imported asset-management module.
  // Compile the generated ESM with TypeScript 5.9.3 or compatible settings and the
  // `openamx/transpiler-runtime` helper subpath. This is calculation/data output,
  // not HTML, PDF, or DOCX rendering.
  // 
  // ## Navigation
  // 
  // [Asset management module](./libraries/asset-management.amx) | [V0.20 specification](../docs/language-spec-v0.20.md)
  const __result: Readonly<Record<string, unknown>> = Object.freeze({ "assetName": __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_assetName });
  __context.modules.set("16_TypeScript_Transpilation.ts", __result);
  return __result;
}
export type AMXRunInputs = Readonly<{
  asset: __AMXExternal___amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_Asset;
}>;
type __AMXValidatedInputs = Readonly<{
  asset: __amx_31_36_5f_54_79_70_65_53_63_72_69_70_74_5f_54_72_61_6e_73_70_69_6c_61_74_69_6f_6e_2e_74_73_Asset;
}>;
export type AMXRunExports = Readonly<{
  assetName: string;
}>;
export function run(inputs: AMXRunInputs): __AMXRunResult<AMXRunExports> {
  const __validated = __amxValidateValue<__AMXValidatedInputs>(inputs, { kind: 'record', recordName: 'AMXRunInputs', fields: [{ name: "asset", descriptor: { kind: 'record', recordName: "Asset", fields: [{ name: "id", descriptor: { kind: 'string' } }, { name: "name", descriptor: { kind: 'string' } }, { name: "assetClass", descriptor: { kind: 'string' } }, { name: "criticality", descriptor: { kind: 'number' } }, { name: "failureModes", descriptor: { kind: 'list', element: { kind: 'record', recordName: "FailureMode", fields: [{ name: "id", descriptor: { kind: 'string' } }, { name: "name", descriptor: { kind: 'string' } }, { name: "description", descriptor: { kind: 'nullable', value: { kind: 'string' } }, optional: true, defaultValue: () => null }, { name: "severity", descriptor: { kind: 'number' } }, { name: "occurrence", descriptor: { kind: 'number' } }, { name: "detectability", descriptor: { kind: 'nullable', value: { kind: 'number' } }, optional: true, defaultValue: () => null }] } }, defaultValue: () => [] }] } }] }, { file: "16_TypeScript_Transpilation.amx" });
  const __context: __AMXRunContext = { modules: new Map(), views: [] };
  const __exports = __amxInitialize(__context, __validated) as AMXRunExports;
  return { exports: __exports, views: Object.freeze(__context.views) };
}
