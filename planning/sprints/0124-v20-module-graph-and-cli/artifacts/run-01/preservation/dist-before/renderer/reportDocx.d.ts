import { Document } from 'docx';
import type { PreparedReport } from './reportPreparation';
export interface PreparedDocxReport {
    document: Document;
}
export interface DocxExportContext {
    sourceDocumentPath: string;
    destinationPath: string;
}
export declare function prepareDocxReport(report: PreparedReport, context?: DocxExportContext): Promise<PreparedDocxReport>;
export declare function serializeDocxReport(report: PreparedDocxReport): Promise<Uint8Array>;
//# sourceMappingURL=reportDocx.d.ts.map