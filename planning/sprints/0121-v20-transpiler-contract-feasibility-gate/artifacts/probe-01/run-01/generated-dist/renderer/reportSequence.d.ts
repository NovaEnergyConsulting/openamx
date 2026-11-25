import type { PreparedReportItem, PreparedDiagramEmission, PreparedReport } from './reportPreparation';
export type OrderedReportEntry = {
    readonly type: 'item';
    readonly item: PreparedReportItem;
} | {
    readonly type: 'diagram';
    readonly diagram: PreparedDiagramEmission;
};
export declare function orderedReportSequence(report: PreparedReport): readonly OrderedReportEntry[];
//# sourceMappingURL=reportSequence.d.ts.map