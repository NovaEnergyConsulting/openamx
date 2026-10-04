import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const desktopDirectory = path.resolve(import.meta.dir, "..");
const sourceDirectory = path.resolve(desktopDirectory, "../node_modules/pdfmake/fonts/Roboto");
const destinationDirectory = path.join(desktopDirectory, "dist/pdfmake-fonts");
const fonts = ["Roboto-Regular.ttf", "Roboto-Medium.ttf", "Roboto-Italic.ttf", "Roboto-MediumItalic.ttf"];

for (const font of fonts) {
	if (!existsSync(path.join(sourceDirectory, font))) throw new Error(`Required pdfmake font is missing: ${font}`);
}

await rm(destinationDirectory, { recursive: true, force: true });
await mkdir(destinationDirectory, { recursive: true });
for (const font of fonts) await cp(path.join(sourceDirectory, font), path.join(destinationDirectory, font));

console.log(`Copied ${fonts.length} pdfmake Roboto fonts into desktop resources.`);