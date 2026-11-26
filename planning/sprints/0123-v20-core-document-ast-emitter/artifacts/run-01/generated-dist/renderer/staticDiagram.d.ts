import { type DiagramSceneModel } from '../runtime/diagramModel';
export interface StaticDiagramSvg {
    readonly svg: string;
    readonly width: number;
    readonly height: number;
}
export interface StaticDiagramPng {
    readonly bytes: Uint8Array;
    readonly width: number;
    readonly height: number;
}
export declare function renderStaticDiagramSvg(model: DiagramSceneModel): StaticDiagramSvg;
export declare function rasterizeStaticDiagramSvg(svg: string): Promise<StaticDiagramPng>;
//# sourceMappingURL=staticDiagram.d.ts.map