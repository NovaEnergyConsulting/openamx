export interface DocxDestination {
    path: string;
    parent: string;
}
export declare function prepareDocxDestination(destination: string | undefined, entryPath: string, inputMappings: string[] | undefined): Promise<DocxDestination>;
export declare function writeDocxAtomically(destination: DocxDestination, bytes: Uint8Array, beforeCommit?: () => void): Promise<void>;
//# sourceMappingURL=docxDestination.d.ts.map