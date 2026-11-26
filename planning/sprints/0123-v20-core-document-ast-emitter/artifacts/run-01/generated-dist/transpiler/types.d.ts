export interface TranspileResolvedImport {
    readonly importPath: string;
    readonly moduleId: string;
}
export interface TranspileSourceModule {
    readonly moduleId: string;
    readonly sourcePath: string;
    readonly outputPath: string;
    readonly sourceText: string;
    readonly resolvedImports: readonly TranspileResolvedImport[];
}
export interface TranspileGraphInput {
    readonly entryModuleId: string;
    readonly modules: readonly TranspileSourceModule[];
}
export interface TranspiledModule {
    readonly moduleId: string;
    readonly sourcePath: string;
    readonly outputPath: string;
    readonly code: string;
}
export interface TranspileDiagnostic {
    readonly code?: string;
    readonly message: string;
    readonly file?: string;
    readonly line?: number;
    readonly column?: number;
}
export type TranspileResult = Readonly<{
    ok: true;
    entryModuleId: string;
    modules: readonly TranspiledModule[];
}> | Readonly<{
    ok: false;
    diagnostics: readonly TranspileDiagnostic[];
}>;
//# sourceMappingURL=types.d.ts.map