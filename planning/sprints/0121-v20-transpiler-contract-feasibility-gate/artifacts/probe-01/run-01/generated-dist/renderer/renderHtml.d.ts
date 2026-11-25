import { OpenAmxDocument } from '../ast/types';
import { Environment } from '../runtime/environment';
import type { PreparedReport } from './reportPreparation';
export interface ReportIdentityOptions {
    report?: Record<string, unknown>;
    projectRoot?: string;
}
export interface ResolvedReportIdentity {
    organization?: string;
    logo?: string;
    logoAlt?: string;
    accent?: string;
    author?: string;
    status?: string;
    classification?: string;
    footer?: string;
    sourceVisible: boolean;
}
export type PreviewNavigationTarget = {
    readonly kind: 'external';
    readonly href: string;
} | {
    readonly kind: 'local';
    readonly path: string;
} | {
    readonly kind: 'amx';
    readonly path: string;
};
export interface StandaloneHtmlOptions {
    readonly mode?: 'standalone';
    readonly sourceDocumentPath?: string;
    readonly projectRoot?: string;
    readonly outputPath?: string;
}
export interface PreviewHtmlOptions {
    readonly mode: 'preview';
}
export interface RenderedPreviewHtml {
    readonly html: string;
    readonly previewToken: string;
    readonly targets: Readonly<Record<string, PreviewNavigationTarget>>;
}
/**
 * Render an OpenAmxDocument to a complete standalone HTML5 document.
 *
 * - Executes all executable blocks once before rendering any document nodes.
 * - Resolves narrative expressions against the final shared environment.
 * - Post-substitution narrative is rendered with marked (headings, paragraphs, bullets).
 * - Executable blocks are rendered as escaped, formatted source at their source position.
 * - Frontmatter metadata.title (if string) is used for <title>; otherwise "OpenAMX Document".
 * - Output is deterministic for the supported Markdown subset.
 * - Errors inside {{ }} (e.g. AMX1004) are surfaced with the same AmxError semantics.
 */
export declare function renderHtml(doc: OpenAmxDocument, file?: string, env?: Environment, options?: ReportIdentityOptions): string;
export declare function renderPreparedHtml(report: PreparedReport, options?: StandaloneHtmlOptions): string;
export declare function renderPreparedHtml(report: PreparedReport, options: PreviewHtmlOptions): RenderedPreviewHtml;
//# sourceMappingURL=renderHtml.d.ts.map