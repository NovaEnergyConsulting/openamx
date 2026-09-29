import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pdfmake from "pdfmake";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../node_modules/pdfmake");
const fontRoot = resolve(packageRoot, "fonts/Roboto");
const artifact = resolve(dirname(fileURLToPath(import.meta.url)), "../../artifacts/pdfmake-proof.pdf");

pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy((filePath) => filePath.startsWith(fontRoot));
pdfmake.setFonts({
	Roboto: {
		normal: resolve(fontRoot, "Roboto-Regular.ttf"),
		bold: resolve(fontRoot, "Roboto-Medium.ttf"),
		italics: resolve(fontRoot, "Roboto-Italic.ttf"),
		bolditalics: resolve(fontRoot, "Roboto-MediumItalic.ttf"),
	},
});

const rows = Array.from({ length: 24 }, (_, index) => {
	const systems = ["Pump", "Compressor", "Transformer"];
	const failureModes = ["Bearing wear", "Seal leakage", "Thermal stress", "Control drift"];
	return [
		`${systems[index % systems.length]}-${101 + index}`,
		failureModes[index % failureModes.length],
		String(9 + ((index * 7) % 28)),
		["Trend condition", "Schedule inspection", "Review maintenance", "Verify protection"][index % 4],
	];
});

const definition = {
	info: { title: "Quarterly Asset Reliability Report", author: "OpenAMX PDF Spike" },
	pageSize: "A4",
	pageMargins: [52, 58, 52, 54],
	defaultStyle: { font: "Roboto", fontSize: 9, color: "#1d2925" },
	styles: {
		title: { fontSize: 23, bold: true, color: "#174e37", margin: [0, 0, 0, 8] },
		heading: { fontSize: 15, bold: true, color: "#174e37", margin: [0, 18, 0, 7] },
		caption: { fontSize: 8, color: "#66736c", margin: [0, 4, 0, 8] },
	},
	content: [
		{ text: "Quarterly Asset Reliability Report", style: "title" },
		{ text: "Reporting period: Q3 2026. The static chart and register below are representative report content." },
		{ text: "Failure-mode exposure", style: "heading" },
		{
			svg: '<svg width="600" height="240" viewBox="0 0 600 240"><rect width="600" height="240" fill="#f3f6f3"/><line x1="55" y1="190" x2="565" y2="190" stroke="#58675d"/><rect x="100" y="90" width="70" height="100" fill="#287451"/><rect x="235" y="45" width="70" height="145" fill="#b8cc6d"/><rect x="370" y="115" width="70" height="75" fill="#db9451"/><text x="100" y="220" font-size="13">Pump A</text><text x="235" y="220" font-size="13">Compressor B</text><text x="370" y="220" font-size="13">Transformer C</text></svg>',
			width: 470,
			alignment: "center",
		},
		{ text: "Risk register", style: "heading" },
		{
			table: {
				headerRows: 1,
				keepWithHeaderRows: 1,
				widths: [82, 112, 42, "*"],
				body: [
					["Asset", "Failure mode", "Score", "Action"].map((text) => ({ text, bold: true, fillColor: "#e7eee8" })),
					...rows,
				],
			},
			layout: "lightHorizontalLines",
			fontSize: 8,
		},
		{ text: "Appendix: review notes", style: "heading", pageBreak: "before" },
		{ text: "Static exports retain content and order but do not retain interactive controls.", style: "caption" },
	],
};

await mkdir(dirname(artifact), { recursive: true });
await pdfmake.createPdf(definition).write(artifact);

const bytes = new Uint8Array(await readFile(artifact));
const byteLength = bytes.byteLength;
const pdf = await getDocument({ data: bytes, useSystemFonts: true, disableFontFace: true }).promise;
const pageText: string[] = [];
for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
	const page = await pdf.getPage(pageNumber);
	const content = await page.getTextContent();
	pageText.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
}

if (pdf.numPages < 2) throw new Error(`Expected page breaks; got ${pdf.numPages} page(s)`);
if (!pageText[0].includes("Quarterly Asset Reliability Report") || !pageText[0].includes("Bearing wear")) {
	throw new Error("First-page report heading or table content was not preserved");
}
if (!pageText.some((text, index) => index > 0 && text.includes("Appendix: review notes"))) {
	throw new Error("Forced page-break section was not present in the PDF");
}
const tableRows = pageText.join(" ").match(/(?:Pump|Compressor|Transformer)-\d{3}/g)?.length ?? 0;
if (tableRows !== rows.length) throw new Error(`Expected ${rows.length} table rows; found ${tableRows}`);

console.log(JSON.stringify({ artifact, bytes: byteLength, pages: pdf.numPages, tableRows, extractedAppendix: true }, null, 2));