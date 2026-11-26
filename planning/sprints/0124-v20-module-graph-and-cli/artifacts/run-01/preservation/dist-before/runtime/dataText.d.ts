import type { CsvTextCell } from './csvTextSerialization';
export type { CsvTextCell } from './csvTextSerialization';
export interface DataTextParseIssue {
    message: string;
    code?: string;
    offset?: number;
    line?: number;
    duplicate?: boolean;
    dataPath?: string;
}
export interface DataTextParseResult<T> {
    value?: T;
    issue?: DataTextParseIssue;
}
export declare function parseStrictJsonText(text: string): DataTextParseResult<unknown>;
export declare function parseStrictCsvText(text: string): DataTextParseResult<CsvTextCell[][]>;
//# sourceMappingURL=dataText.d.ts.map