import { type DiagramSceneModel } from '../runtime/diagramModel';
export declare const MAX_INTERACTIVE_DIAGRAM_HTML_BYTES: number;
export declare function assertDiagramHtmlSize(html: string, hasDiagrams: boolean): void;
export declare function renderDiagramFigure(model: DiagramSceneModel, id: string): string;
export declare function renderDiagramAssets(nonce: string, runtime: string): string;
//# sourceMappingURL=diagramHtml.d.ts.map