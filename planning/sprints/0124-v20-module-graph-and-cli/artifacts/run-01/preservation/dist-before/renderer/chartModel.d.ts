import type { EChartsOption } from 'echarts';
import type { ChartDeclarationNode } from '../ast/types';
import type { ChartMeasurementDescriptor, ChartViewEmission, ViewDataValue } from '../runtime/environment';
import type { ResolvedReportIdentity } from './reportPreparation';
declare const NO_DATA_LABEL = "No data";
export interface ChartTableRow {
    readonly id: string;
    readonly values: readonly ViewDataValue[];
}
export interface ChartTableModel {
    readonly id: string;
    readonly caption: string;
    readonly headings: readonly string[];
    readonly rows: readonly ChartTableRow[];
}
export interface ChartAxisModel {
    readonly id: string;
    readonly role: 'x' | 'y';
    readonly name?: string;
    readonly unit?: ChartMeasurementDescriptor['unit'];
}
export interface ChartSeriesModel {
    readonly id: string;
    readonly name: string;
    readonly color: string;
    readonly axisId?: string;
    readonly unit?: ChartMeasurementDescriptor['unit'];
}
export interface ChartAccessibilityModel {
    readonly role: 'img';
    readonly title: string;
    readonly description: string;
    readonly summary: string;
    readonly tableId: string;
}
export interface ChartTooltipModel {
    readonly trigger: 'axis' | 'item';
    readonly includesCategoryOrCoordinates: true;
    readonly includesSeriesOrGroup: true;
    readonly includesDisplayUnits: true;
    readonly dateTimePresentation?: 'UTC ISO 8601';
}
export interface ChartViewModel {
    readonly kind: ChartDeclarationNode['kind'];
    readonly title: string;
    readonly description: string;
    readonly showTable: boolean;
    readonly dimensions: Readonly<{
        width: 720;
        height: 360;
    }>;
    readonly option: EChartsOption;
    readonly table: ChartTableModel;
    readonly series: readonly ChartSeriesModel[];
    readonly axes: readonly ChartAxisModel[];
    readonly tooltip: ChartTooltipModel;
    readonly plottedPointCount: number;
    readonly accessibility: ChartAccessibilityModel;
    readonly emptyState?: Readonly<{
        label: typeof NO_DATA_LABEL;
    }>;
    readonly dateTimePresentation?: 'UTC ISO 8601';
}
export declare function createChartViewModel(emission: ChartViewEmission, identity: Pick<ResolvedReportIdentity, 'accent'>): ChartViewModel;
export {};
//# sourceMappingURL=chartModel.d.ts.map