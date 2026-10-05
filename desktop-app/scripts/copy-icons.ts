import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const desktopDirectory = path.resolve(import.meta.dir, "..");
const sourceDirectory = path.resolve(desktopDirectory, "assets/images");
const destinationDirectory = path.join(desktopDirectory, "dist/assets");
const files = ["icon.ico", "icon.png"];

for (const icon of files) {
    if (!existsSync(path.join(sourceDirectory, icon))) throw new Error(`Required icon file is missing: ${icon}`);
}

await rm(destinationDirectory, { recursive: true, force: true });
await mkdir(destinationDirectory, { recursive: true });
for (const icon of files) await cp(path.join(sourceDirectory, icon), path.join(destinationDirectory, icon));

console.log(`Copied ${files.length} icons into desktop resources.`);