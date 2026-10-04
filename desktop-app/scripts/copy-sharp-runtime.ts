import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const desktopDirectory = path.resolve(import.meta.dir, "..");
const rootNodeModules = path.resolve(desktopDirectory, "../node_modules");
const sharpManifestPath = path.join(rootNodeModules, "sharp/package.json");
if (!existsSync(sharpManifestPath)) throw new Error("Install root dependencies before building desktop resources.");

const packageManifest = await Bun.file(sharpManifestPath).json() as {
	optionalDependencies?: Record<string, string>;
};
const architecture = process.arch;
const platform = process.platform === "darwin" ? "darwin" : process.platform === "win32" ? "win32" : "linux";
const runtimeReport = process.report?.getReport() as { header?: { glibcVersionRuntime?: string } } | undefined;
const libc = platform === "linux" && !runtimeReport?.header?.glibcVersionRuntime ? "musl" : "";
const target = `${platform}${libc}-${architecture}`;
const packages = [`@img/sharp-${target}`, `@img/sharp-libvips-${target}`];
const nativeRuntimeDirectory = path.join(desktopDirectory, "dist/native-sharp");

await rm(nativeRuntimeDirectory, { recursive: true, force: true });
for (const packageName of packages) {
	if (!packageManifest.optionalDependencies?.[packageName]) throw new Error(`sharp does not declare native runtime ${packageName}.`);
	const packageDirectory = path.join(rootNodeModules, packageName);
	if (!existsSync(packageDirectory)) throw new Error(`The host-specific sharp runtime ${packageName} is not installed.`);
	const destination = path.join(nativeRuntimeDirectory, packageName);
	await mkdir(path.dirname(destination), { recursive: true });
	await cp(packageDirectory, destination, { recursive: true, errorOnExist: true, force: false });
	if (packageName.startsWith("@img/sharp-libvips-")) {
		await rm(path.join(destination, "lib/glib-2.0"), { recursive: true, force: true });
	}
}

console.log(`Copied host-native sharp runtime for ${target}.`);