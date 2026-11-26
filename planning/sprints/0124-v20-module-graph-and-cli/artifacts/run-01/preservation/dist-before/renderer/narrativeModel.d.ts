export type NarrativeInline = {
    readonly type: 'text';
    readonly text: string;
} | {
    readonly type: 'lineBreak';
} | {
    readonly type: 'strong' | 'emphasis' | 'delete';
    readonly children: readonly NarrativeInline[];
} | {
    readonly type: 'inlineCode';
    readonly text: string;
} | {
    readonly type: 'link';
    readonly link: NarrativeLink;
    readonly children: readonly NarrativeInline[];
} | {
    readonly type: 'image';
    readonly image: NarrativeImage;
    readonly title?: string;
};
export type NarrativeBlock = {
    readonly type: 'heading';
    readonly depth: number;
    readonly id: string;
    readonly children: readonly NarrativeInline[];
} | {
    readonly type: 'paragraph';
    readonly children: readonly NarrativeInline[];
} | {
    readonly type: 'code';
    readonly language?: string;
    readonly text: string;
} | {
    readonly type: 'list';
    readonly ordered: boolean;
    readonly start?: number;
    readonly items: readonly NarrativeListItem[];
} | {
    readonly type: 'blockquote';
    readonly blocks: readonly NarrativeBlock[];
} | {
    readonly type: 'table';
    readonly align: readonly (string | null)[];
    readonly header: readonly (readonly NarrativeInline[])[];
    readonly rows: readonly (readonly (readonly NarrativeInline[])[])[];
} | {
    readonly type: 'horizontalRule';
} | {
    readonly type: 'pageBreak';
};
export interface NarrativeListItem {
    readonly checked?: boolean;
    readonly blocks: readonly NarrativeBlock[];
}
export type NarrativeLink = {
    readonly type: 'external';
    readonly href: string;
    readonly title?: string;
} | {
    readonly type: 'internal';
    readonly targetId: string;
    readonly title?: string;
} | {
    readonly type: 'local';
    readonly path: string;
    readonly sourceBase: 'document-directory';
    readonly title?: string;
    readonly query?: string;
    readonly fragment?: string;
} | {
    readonly type: 'amx';
    readonly path: string;
    readonly title?: string;
};
export interface NarrativeImage {
    readonly format: 'png' | 'jpeg';
    readonly dataUri: string;
    readonly width: number;
    readonly height: number;
    readonly inputBytes: number;
    readonly outputBytes: number;
    readonly alt: string;
}
export interface NarrativeImageWidth {
    readonly value: number;
    readonly unit: 'px' | '%';
}
export interface PreparedNarrative {
    readonly text: string;
    readonly blocks: readonly NarrativeBlock[];
    readonly diagnostics: readonly NarrativeDiagnostic[];
}
export interface NarrativeDiagnostic {
    readonly type: 'rejectedLink';
    readonly reason: 'invalid-external-target' | 'invalid-internal-fragment' | 'invalid-local-target' | 'unsupported-scheme';
}
export interface NarrativeSource {
    readonly content: string;
    readonly line?: number;
}
export interface NarrativePreparationOptions {
    readonly file?: string;
    readonly projectRoot?: string;
    readonly interpolate: (expression: string, line?: number) => string;
}
export declare function prepareNarratives(sources: readonly NarrativeSource[], options: NarrativePreparationOptions): Promise<readonly PreparedNarrative[]>;
export declare function fitNarrativeImage(image: Pick<NarrativeImage, 'width' | 'height'>, bounds: {
    readonly maxWidth: number;
    readonly maxHeight: number;
}, width?: NarrativeImageWidth): {
    readonly width: number;
    readonly height: number;
};
export declare function parseNarrativeImageWidth(value: string): NarrativeImageWidth | undefined;
//# sourceMappingURL=narrativeModel.d.ts.map