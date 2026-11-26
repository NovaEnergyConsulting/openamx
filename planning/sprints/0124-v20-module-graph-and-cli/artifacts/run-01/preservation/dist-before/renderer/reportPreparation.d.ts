import type { OpenAmxDocument } from '../ast/types';
import type { Environment, ViewEmission } from '../runtime/environment';
import { type NarrativeBlock, type NarrativeDiagnostic, type NarrativeImageWidth } from './narrativeModel';
import type { DiagramSceneModel } from '../runtime/diagramModel';
export interface PreparedLogo {
    readonly bytes: Uint8Array;
    readonly alt: string;
    readonly dataUri: string;
}
export interface ResolvedReportIdentity {
    readonly organization?: string;
    readonly logo?: PreparedLogo;
    readonly stylesheetCss?: string;
    readonly accent: string;
    readonly author?: string;
    readonly status?: string;
    readonly classification?: string;
    readonly footer?: string;
    readonly imageWidth?: NarrativeImageWidth;
    readonly sourceVisible: boolean;
}
export type PreparedReportItem = {
    readonly type: 'narrative';
    readonly text: string;
    readonly markdown: readonly NarrativeBlock[];
    readonly diagnostics: readonly NarrativeDiagnostic[];
} | {
    readonly type: 'source';
    readonly text: string;
} | {
    readonly type: 'view';
    readonly emission: ViewEmission;
};
export interface PreparedDiagramEmission {
    readonly model: DiagramSceneModel;
    readonly beforeItemIndex: number;
    readonly order: number;
}
export interface PreparedReport {
    readonly title: string;
    readonly identity: ResolvedReportIdentity;
    readonly items: readonly PreparedReportItem[];
    readonly diagrams?: readonly PreparedDiagramEmission[];
}
export interface ReportPreparationOptions {
    readonly file?: string;
    readonly projectRoot?: string;
    readonly includeStylesheet?: boolean;
    readonly stylesheetOverlay?: ReadonlyMap<string, string>;
}
export declare function prepareReport(doc: OpenAmxDocument, env: Environment, options?: ReportPreparationOptions): Promise<PreparedReport>;
export declare function validateReportSettings(report: Record<string, unknown>, projectRoot?: string, file?: string): Promise<void>;
export declare function readReportStylesheet(path: string, projectRoot?: string, file?: string, overlay?: ReadonlyMap<string, string>): string;
export declare function effectiveReportAccent(accent: string): string;
//# sourceMappingURL=reportPreparation.d.ts.map