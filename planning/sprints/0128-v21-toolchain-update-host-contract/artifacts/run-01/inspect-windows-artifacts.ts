import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import JSZip from "jszip";
import { findInstaller, verifyBuiltApp, verifyUpdateMetadata } from "../../../../../scripts/release/desktop";

const metadata = JSON.parse(await readFile("artifacts/stable-win-x64-update.json", "utf8")) as {
	version: string;
	hash: string;
};
const update = await verifyUpdateMetadata("artifacts", "win", "x64", metadata.version, metadata.hash);
const application = await verifyBuiltApp("build/stable-win-x64", {
	name: "OpenAMX Desktop",
	identifier: "dev.openamx.desktop",
	version: metadata.version,
	architecture: "x64",
	nativeOs: "win",
	electrobunVersion: "2.0.7",
});
const installer = await findInstaller("artifacts", "win", "x64");
const zip = await JSZip.loadAsync(await readFile(installer.path));
const installerMembers = Object.entries(zip.files).filter(([, entry]) => !entry.dir).map(([name]) => name);
if (!installerMembers.some((name) => /setup\.exe$/i.test(name)) || !installerMembers.some((name) => name.endsWith(".tar.zst"))) {
	throw new Error("Windows installer ZIP is missing its setup executable or update payload.");
}
const names = await readdir("artifacts");
const patchFiles = names.filter((name) => name.endsWith(".patch"));
if (patchFiles.length) throw new Error(`Patch artifacts exist despite the full-bundle-only policy: ${patchFiles.join(", ")}`);
const inventory = await Promise.all(names.map(async (file) => {
	const bytes = await readFile(`artifacts/${file}`);
	return { file, sizeBytes: bytes.byteLength, sha256: createHash("sha256").update(bytes).digest("hex") };
}));
console.log(JSON.stringify({ update, application, installer: { file: installer.path.split(/[\\/]/).pop(), format: installer.format, members: installerMembers }, inventory, patchFiles }, null, 2));
