import { DiagramDeclarationNode, SourceLocation } from '../ast/types';
import { Environment } from './environment';
interface FrameElementLocation {
    readonly name: string;
    readonly source?: SourceLocation;
}
export type DiagramFrameElement = (FrameElementLocation & Readonly<{
    primitive: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke: string;
    lineWidth: number;
    arrow: 'none' | 'start' | 'end' | 'both';
}>) | (FrameElementLocation & Readonly<{
    primitive: 'rectangle';
    x: number;
    y: number;
    width: number;
    height: number;
    stroke: string;
    fill?: string;
    lineWidth: number;
}>) | (FrameElementLocation & Readonly<{
    primitive: 'circle';
    cx: number;
    cy: number;
    r: number;
    stroke: string;
    fill?: string;
    lineWidth: number;
}>) | (FrameElementLocation & Readonly<{
    primitive: 'text';
    x: number;
    y: number;
    value: string;
    fill: string;
}>);
export interface DiagramFrame {
    readonly time: number;
    readonly elements: readonly DiagramFrameElement[];
}
export interface DiagramSceneModel {
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
    readonly declaration: DiagramDeclarationNode;
    readonly initialFrame: DiagramFrame;
    readonly source?: SourceLocation;
    readonly file?: string;
    readonly documentNodeIndex: number;
    readonly statementIndex: number;
}
export declare function serializeDiagramSceneModel(model: DiagramSceneModel): string;
export declare function deserializeDiagramSceneModel(serialized: string): DiagramSceneModel;
export declare function createDiagramModel(sourceDeclaration: DiagramDeclarationNode, sourceEnvironment: Environment, file: string | undefined, documentNodeIndex: number, statementIndex: number): DiagramSceneModel;
export declare function evaluateDiagramFrame(model: DiagramSceneModel, time: number, file?: string | undefined): DiagramFrame;
export {};
//# sourceMappingURL=diagramModel.d.ts.map