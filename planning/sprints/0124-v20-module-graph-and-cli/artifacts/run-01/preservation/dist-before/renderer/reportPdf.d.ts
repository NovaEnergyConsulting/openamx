import { type ChartViewModel } from './chartModel';
import type { PreparedReport } from './reportPreparation';
export interface PreparedPdfReport {
    definition: Record<string, unknown>;
}
export interface PdfExportContext {
    sourceDocumentPath: string;
    destinationPath: string;
}
type ChartRenderer = (model: ChartViewModel) => string;
export declare function preparePdfReport(report: PreparedReport, renderChartOrContext?: ChartRenderer | PdfExportContext, context?: PdfExportContext): PreparedPdfReport;
export declare function serializePdfReport(report: PreparedPdfReport): Promise<Uint8Array>;
export {};
//# sourceMappingURL=reportPdf.d.ts.map