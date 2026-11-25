export interface CsvTextCell {
    value: string;
    quoted: boolean;
}
export declare function serializeCsvText(rows: readonly (readonly CsvTextCell[])[]): string;
//# sourceMappingURL=csvTextSerialization.d.ts.map