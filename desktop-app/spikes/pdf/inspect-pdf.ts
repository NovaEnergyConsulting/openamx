import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const filePath = resolve(process.argv[2] ?? "artifacts/chrome-proof.pdf");
const bytes = new Uint8Array(await readFile(filePath));
const byteLength = bytes.byteLength;
const pdf = await getDocument({ data: bytes, useSystemFonts: true, disableFontFace: true }).promise;
const text: string[] = [];

for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
	const page = await pdf.getPage(pageNumber);
	const content = await page.getTextContent();
	text.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
}

if (pdf.numPages < 2) throw new Error(`Expected multiple report pages; got ${pdf.numPages}`);
if (!text[0].includes("Quarterly Asset Reliability Report") || !text[0].includes("Risk register")) {
	throw new Error("PDF is missing representative report headings");
}
if (!text.some((page, index) => index > 0 && page.includes("Appendix: review notes"))) {
	throw new Error("PDF is missing its page-break section");
}
const tableRows = text.join(" ").match(/(?:P|C|T)-\d{3}/g)?.length ?? 0;
if (tableRows !== 24) throw new Error(`Expected 24 table rows; found ${tableRows}`);

console.log(JSON.stringify({ filePath, bytes: byteLength, pages: pdf.numPages, tableRows, searchableText: true }, null, 2));