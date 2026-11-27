import { amxAdd1Based as __amxAdd1Based, amxAttach as __amxAttach, amxBinary as __amxBinary, amxBuiltin as __amxBuiltin, amxChartView as __amxChartView, amxConvert as __amxConvert, amxCopyListArgument as __amxCopyListArgument, amxDiagramView as __amxDiagramView, amxFormatValue as __amxFormatValue, amxGet1Based as __amxGet1Based, amxIsType as __amxIsType, amxIterate as __amxIterate, amxPhysicalValue as __amxPhysicalValue, amxRange as __amxRange, amxRemove1Based as __amxRemove1Based, amxTableView as __amxTableView, amxUnary as __amxUnary, validateAMXValue as __amxValidateValue, AMXInputError as __AMXInputError, AMXRuntimeError as __AMXRuntimeError, type AMXBuiltinName as __AMXBuiltinName, type AMXDiagramPrimitiveElement as __AMXDiagramPrimitiveElement, type AMXInputDescriptor as __AMXInputDescriptor, type AMXMeasurement as __AMXMeasurement, type AMXMeasurementInput as __AMXMeasurementInput, type AMXRunResult as __AMXRunResult, type AMXRuntimeContext as __AMXRuntimeContext, type AMXShownView as __AMXShownView, type AMXUnitDescriptor as __AMXUnitDescriptor, type AMXValue as __AMXValue, type AMXViewData as __AMXViewData } from 'openamx/transpiler-runtime';
export interface __amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_FailureMode {
  id: string;
  name: string;
  description: string | null;
  severity: number;
  occurrence: number;
  detectability: number | null;
}
export interface __AMXExternal___amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_FailureMode {
  id: string;
  name: string;
  description?: string | null;
  severity: number;
  occurrence: number;
  detectability?: number | null;
}
export interface __amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_Risk {
  id: string;
  failureMode: __amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_FailureMode;
  likelihood: number;
  consequence: number;
  score: number | null;
}
export interface __AMXExternal___amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_Risk {
  id: string;
  failureMode: __AMXExternal___amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_FailureMode;
  likelihood: number;
  consequence: number;
  score?: number | null;
}
export interface __amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_Strategy {
  id: string;
  name: string;
  description: string | null;
  targetRiskIds: (string)[];
}
export interface __AMXExternal___amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_Strategy {
  id: string;
  name: string;
  description?: string | null;
  targetRiskIds?: (string)[];
}
export interface __amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_Asset {
  id: string;
  name: string;
  assetClass: string;
  criticality: number;
  failureModes: (__amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_FailureMode)[];
}
export interface __AMXExternal___amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_Asset {
  id: string;
  name: string;
  assetClass: string;
  criticality: number;
  failureModes?: (__AMXExternal___amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_FailureMode)[];
}
export interface __amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_MaintenanceTask {
  id: string;
  assetId: string;
  strategyId: string | null;
  title: string;
  intervalDays: number;
  estimatedCost: number | null;
}
export interface __AMXExternal___amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_MaintenanceTask {
  id: string;
  assetId: string;
  strategyId?: string | null;
  title: string;
  intervalDays: number;
  estimatedCost?: number | null;
}
export interface __amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_LifecycleCost {
  assetId: string;
  acquisitionCost: number;
  operatingCost: number;
  maintenanceCost: number;
  disposalCost: number | null;
}
export interface __AMXExternal___amx_6c_69_62_72_61_72_69_65_73_2f_61_73_73_65_74_2d_6d_61_6e_61_67_65_6d_65_6e_74_2e_74_73_LifecycleCost {
  assetId: string;
  acquisitionCost: number;
  operatingCost: number;
  maintenanceCost: number;
  disposalCost?: number | null;
}
const __amxUnits: readonly __AMXUnitDescriptor[] = [];
const __amxRuntime: __AMXRuntimeContext = { file: "libraries/asset-management.amx", unitDescriptors: __amxUnits };
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
  if (__context.modules.has("libraries/asset-management.ts")) return __context.modules.get("libraries/asset-management.ts") as Readonly<Record<string, unknown>>;
  const __result: Readonly<Record<string, unknown>> = Object.freeze({  });
  __context.modules.set("libraries/asset-management.ts", __result);
  return __result;
}
type __AMXValidatedInputs = Readonly<Record<string, never>>;
