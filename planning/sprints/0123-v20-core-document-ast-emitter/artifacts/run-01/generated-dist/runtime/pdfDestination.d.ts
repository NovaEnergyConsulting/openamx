export interface PdfDestination {
    path: string;
    parent: string;
}
export declare function preparePdfDestination(destination: string | undefined, entryPath: string, inputMappings: string[] | undefined): Promise<PdfDestination>;
export declare function writePdfAtomically(destination: PdfDestination, bytes: Uint8Array, beforeCommit?: () => void): Promise<void>;
//# sourceMappingURL=pdfDestination.d.ts.map