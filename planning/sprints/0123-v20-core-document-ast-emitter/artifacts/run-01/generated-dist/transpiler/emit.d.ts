import type { PreparedModule } from './graph';
export declare class LoweringFailure extends Error {
    readonly line?: number | undefined;
    readonly column?: number | undefined;
    constructor(message: string, line?: number | undefined, column?: number | undefined);
}
export declare function emitModule(module: PreparedModule, isEntry: boolean): string;
//# sourceMappingURL=emit.d.ts.map