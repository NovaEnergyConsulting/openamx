export type AMXPrimitive = string | number | boolean | null;
declare const amxMeasurementBrand: unique symbol;
declare const amxInputOutputType: unique symbol;
export type AMXValue = AMXPrimitive | AMXMeasurement | AMXValue[] | readonly AMXValue[] | Readonly<{
    [field: string]: AMXValue;
}>;
export interface AMXSourceContext {
    readonly file?: string;
    readonly line?: number;
    readonly column?: number;
    readonly inputPath?: string;
}
export interface AMXRuntimeContext extends AMXSourceContext {
    readonly unitDescriptors?: readonly AMXUnitDescriptor[];
}
export interface AMXRuntimeDiagnostic extends AMXSourceContext {
    readonly code: string;
    readonly message: string;
}
export declare class AMXRuntimeError extends Error {
    readonly diagnostic: AMXRuntimeDiagnostic;
    readonly code: string;
    readonly file?: string;
    readonly line?: number;
    readonly column?: number;
    readonly inputPath?: string;
    private readonly originalCause?;
    constructor(diagnostic: AMXRuntimeDiagnostic, cause?: unknown);
}
export type AMXViewData = AMXPrimitive | readonly AMXViewData[] | Readonly<{
    [field: string]: AMXViewData;
}>;
export interface AMXUnitFactor {
    readonly identity: string;
    readonly name: string;
    readonly exponent: number;
}
export interface AMXMeasurementUnit {
    readonly scale: number;
    readonly offset: number;
    readonly vector: Readonly<Record<string, number>>;
    readonly factors: readonly AMXUnitFactor[];
    readonly text: string;
}
export interface AMXUnitDescriptor<DimensionId extends string = string> {
    readonly identity: string;
    readonly name: string;
    readonly scale: number;
    readonly offset: number;
    readonly vector: Readonly<Record<string, number>>;
    readonly factors?: readonly AMXUnitFactor[];
    readonly [amxMeasurementBrand]?: DimensionId;
}
export interface AMXMeasurement<DimensionId extends string = string> {
    readonly __amxMeasurement: true;
    readonly value: number;
    readonly unit: AMXMeasurementUnit;
    readonly [amxMeasurementBrand]: DimensionId;
}
export interface AMXMeasurementInput<DimensionId extends string = string> {
    readonly value: number;
    readonly unit: string;
    readonly [amxMeasurementBrand]?: DimensionId;
}
export interface AMXRunResult<TExports extends object> {
    readonly exports: Readonly<TExports>;
    readonly views: readonly AMXShownView[];
}
export declare class AMXInputError extends TypeError {
    readonly inputPath: string;
    readonly expected: string;
    readonly actual: string;
    readonly code = "AMX4003";
    readonly diagnostic: AMXRuntimeDiagnostic;
    constructor(inputPath: string, expected: string, actual: string, sourceContext?: AMXSourceContext);
}
export interface AMXInputFieldDescriptor {
    readonly name: string;
    readonly descriptor: AMXInputDescriptor;
    readonly optional?: boolean;
    readonly defaultValue?: () => unknown;
}
export type AMXInputDescriptor<T = AMXValue> = (Readonly<{
    kind: 'number';
}> | Readonly<{
    kind: 'string';
}> | Readonly<{
    kind: 'boolean';
}> | Readonly<{
    kind: 'dateTime';
}> | Readonly<{
    kind: 'enum';
    enumName: string;
    members: readonly (string | number)[];
}> | Readonly<{
    kind: 'measurement';
    dimensionName: string;
    dimensionVector: Readonly<Record<string, number>>;
    units: Readonly<Record<string, AMXUnitDescriptor>>;
}> | Readonly<{
    kind: 'nullable';
    value: AMXInputDescriptor;
}> | Readonly<{
    kind: 'list';
    element: AMXInputDescriptor;
}> | Readonly<{
    kind: 'record';
    recordName: string;
    fields: readonly AMXInputFieldDescriptor[];
}>) & Readonly<{
    [amxInputOutputType]?: T;
}>;
export interface AMXListMutationContext extends AMXSourceContext {
    readonly targetName?: string;
    readonly mutable?: boolean;
}
export type AMXBinaryOperator = '+' | '-' | '*' | '/' | '%' | '^' | '==' | '!=' | '>' | '>=' | '<' | '<=' | 'and' | 'or';
export type AMXUnaryOperator = '-' | 'not';
export type AMXBuiltinName = 'sum' | 'min' | 'max' | 'mean' | 'round' | 'abs' | 'sqrt' | 'pow' | 'len' | 'trim' | 'left' | 'right' | 'format' | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan' | 'sinh' | 'cosh' | 'tanh' | 'asinh' | 'acosh' | 'atanh' | 'ln' | 'log' | 'exp';
export declare function amxBinary(operator: AMXBinaryOperator, left: AMXValue, right: AMXValue, context?: AMXSourceContext): AMXValue;
export declare function amxUnary(operator: AMXUnaryOperator, value: AMXValue, context?: AMXSourceContext): AMXValue;
export declare function amxFormatValue(value: AMXValue, context?: AMXSourceContext): string;
export declare function amxBuiltin(name: AMXBuiltinName, args: readonly AMXValue[], context?: AMXRuntimeContext): AMXValue;
export declare function amxIsType(value: AMXValue, descriptor: AMXInputDescriptor): boolean;
export declare function validateAMXValue<T>(value: unknown, descriptor: AMXInputDescriptor<T>, context: AMXSourceContext): T;
export declare function amxGet1Based<T extends AMXValue>(list: readonly T[], index: number, context?: AMXSourceContext): T;
export declare function amxRange(start: number, end: number, context?: AMXSourceContext): number[];
export declare function amxAdd1Based<T extends AMXValue>(list: T[], value: T, position?: number, context?: AMXListMutationContext): void;
export declare function amxRemove1Based<T extends AMXValue>(list: T[], count: number, position?: number, context?: AMXListMutationContext): void;
export declare function amxIterate<T extends AMXValue>(value: AMXValue, context?: AMXSourceContext): T[];
export declare function amxCopyListArgument<T>(value: T): T;
export declare function requireAMXNumber(value: unknown, inputPath: string): number;
export declare function requireAMXString(value: unknown, inputPath: string): string;
export declare function requireAMXBoolean(value: unknown, inputPath: string): boolean;
export declare function requireAMXEnum(value: unknown, enumName: string, members: readonly (string | number)[], inputPath: string): string | number;
export declare function requireAMXMeasurement(value: unknown, dimensionName: string, dimensionVector: Readonly<Record<string, number>>, units: Readonly<Record<string, AMXUnitDescriptor>>, inputPath: string): AMXMeasurement;
export declare function requireAMXList(value: unknown, inputPath: string): readonly unknown[];
export declare function requireAMXRecord(value: unknown, inputPath: string, allowedFields: readonly string[]): Readonly<Record<string, unknown>>;
export declare function amxAttach(value: number, unit: AMXUnitDescriptor): AMXMeasurement;
export declare function amxConvert(value: AMXMeasurement, target: AMXUnitDescriptor): AMXMeasurement;
export declare function amxPhysicalValue(value: AMXMeasurement): number;
export declare function amxEqual(left: AMXMeasurement, right: AMXMeasurement): boolean;
export interface AMXTableColumn {
    readonly field: string;
    readonly label: string;
}
export interface AMXTableView {
    readonly kind: 'table';
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly columns: readonly AMXTableColumn[];
    readonly rows: readonly (readonly AMXViewData[])[];
}
export interface AMXChartMeasurementDescriptor {
    readonly role: 'series' | 'x' | 'y';
    readonly field?: string;
    readonly label: string;
    readonly unit: Readonly<{
        text: string;
        scale: number;
        vector: Readonly<Record<string, number>>;
        factors: readonly AMXUnitFactor[];
    }>;
}
export interface AMXChartView {
    readonly kind: 'chart';
    readonly name: string;
    readonly chartKind: 'bar' | 'column' | 'line' | 'scatter';
    readonly title: string;
    readonly description: string;
    readonly data: readonly AMXViewData[];
    readonly labels?: readonly string[];
    readonly headings?: readonly string[];
    readonly measurementDescriptors?: readonly AMXChartMeasurementDescriptor[];
    readonly showTable: boolean;
}
export type AMXDiagramElement = AMXDiagramPrimitiveElement | AMXLegacyDiagramElement;
export type AMXDiagramPrimitiveElement = Readonly<{
    primitive: 'line';
    name: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke: string;
    lineWidth: number;
    arrow: 'none' | 'start' | 'end' | 'both';
}> | Readonly<{
    primitive: 'rectangle';
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    stroke: string;
    fill?: string;
    lineWidth: number;
}> | Readonly<{
    primitive: 'circle';
    name: string;
    cx: number;
    cy: number;
    r: number;
    stroke: string;
    fill?: string;
    lineWidth: number;
}> | Readonly<{
    primitive: 'text';
    name: string;
    x: number;
    y: number;
    value: string;
    fill: string;
}>;
export interface AMXLegacyDiagramElement {
    readonly type: string;
    readonly name: string;
    readonly properties: Readonly<Record<string, AMXViewData>>;
}
export interface AMXDiagramView {
    readonly kind: 'diagram';
    readonly schema?: 'legacy-v1';
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly canvas: Readonly<{
        width: number;
        height: number;
        coordinates: 'bottom-left-y-up';
    }>;
    readonly timeline: Readonly<{
        variable: string;
        from: number;
        to: number;
        duration: number;
    }>;
    readonly initialFrame: Readonly<{
        time: number;
        elements: readonly AMXLegacyDiagramElement[];
    }>;
}
export interface AMXLegacyDiagramView extends AMXDiagramView {
    readonly schema: 'legacy-v1';
}
export interface AMXStructuredDiagramView {
    readonly kind: 'diagram';
    readonly schema: 'structured-v2';
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly canvas: Readonly<{
        width: number;
        height: number;
        coordinates: 'bottom-left-y-up';
    }>;
    readonly timeline: Readonly<{
        variable: string;
        from: number;
        to: number;
        duration: number;
    }>;
    readonly initialFrame: Readonly<{
        time: number;
        elements: readonly AMXDiagramPrimitiveElement[];
    }>;
}
export type AMXShownView = AMXTableView | AMXChartView | AMXDiagramView | AMXStructuredDiagramView;
export declare function amxTableView(name: string, columns: readonly AMXTableColumn[], rows: readonly (readonly AMXViewData[])[], title?: string, description?: string): AMXTableView;
export declare function amxChartView(view: Omit<AMXChartView, 'kind'>): AMXChartView;
export declare function amxDiagramView(view: Omit<AMXDiagramView, 'kind' | 'schema'>): AMXLegacyDiagramView;
export declare function amxDiagramView(view: Omit<AMXStructuredDiagramView, 'kind'>): AMXStructuredDiagramView;
export {};
//# sourceMappingURL=transpilerRuntime.d.ts.map