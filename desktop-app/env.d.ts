/// <reference types="vite/client" />

declare module "*.vue" {
	import type { DefineComponent } from "vue";
	const component: DefineComponent<object, object, unknown>;
	export default component;
}

declare module "pdfmake" {
	interface PdfDocument {
		getBuffer(): Promise<Uint8Array>;
	}
	const pdfmake: {
		setUrlAccessPolicy(policy: (url: string) => boolean): void;
		setLocalAccessPolicy(policy: (filePath: string) => boolean): void;
		setFonts(fonts: Record<string, Record<string, string>>): void;
		createPdf(definition: Record<string, unknown>): PdfDocument;
	};
	export default pdfmake;
}
