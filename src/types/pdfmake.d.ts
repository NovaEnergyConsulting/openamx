declare module 'pdfmake' {
  interface PdfDocument {
    getBuffer(): Promise<Buffer>;
  }

  interface PdfMake {
    setUrlAccessPolicy(policy: (url: string) => boolean): void;
    setLocalAccessPolicy(policy: (filePath: string) => boolean): void;
    setFonts(fonts: Record<string, Record<string, string>>): void;
    createPdf(definition: unknown): PdfDocument;
  }

  const pdfmake: PdfMake;
  export default pdfmake;
}