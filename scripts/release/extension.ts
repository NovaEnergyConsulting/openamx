import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { spawnReleaseCommand } from "./process";
import { access, cp, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";
import { isStableVersion } from "../release";

const PACKAGE_NAME = "openamx-vscode";
const PUBLISHER = "EngineersTools";
const REQUIRED_VSIX_FILES = [
	"[Content_Types].xml",
	"extension.vsixmanifest",
	"extension/amx.tmGrammar.json",
	"extension/language-configuration.json",
	"extension/package.json",
	"extension/LICENSE.md",
	"extension/readme.md",
	"extension/dist/extension.js",
];
const OPTIONAL_LEGAL_FILES = [
	"extension/LICENSE",
	"extension/LICENSE.txt",
	"extension/LICENSE.md",
	"extension/NOTICE",
	"extension/THIRD-PARTY-NOTICES",
];

export interface VsixInspection {
	name: string;
	version: string;
	publisher: string;
	main: string;
	files: Array<{ file: string; sizeBytes: number }>;
	sha256: string;
	sizeBytes: number;
	platformNeutral: boolean;
	licenseReadiness: { status: "ready" | "blocked"; blockers: string[] };
}

function sha256(contents: Uint8Array): string {
	return createHash("sha256").update(contents).digest("hex");
}

function safePackagePath(file: string): boolean {
	return !file.startsWith("/") && !file.includes("\\") && !file.split("/").some((part) => part === ".." || part === "");
}

export function inspectLicenseReadiness(
	rootDirectory: string,
	options: {
		packageLicense?: unknown;
		packagedFiles?: string[];
		licenseReferenceConfirmed?: boolean;
		noticeRequirementsConfirmed?: boolean;
	} = {},
): VsixInspection["licenseReadiness"] {
	const blockers: string[] = [];
	const authoritativeLicense = ["LICENSE", "LICENSE.txt"].some((name) => {
		try {
			return lstatSync(path.join(rootDirectory, name)).isFile();
		} catch {
			return false;
		}
	}) || (() => {
		const overviewPath = path.join(rootDirectory, "LICENSE.md");
		try {
			return lstatSync(overviewPath).isFile() && !/see the LICENSE file for the full licen[cs]e text/i.test(readFileSync(overviewPath, "utf8"));
		} catch {
			return false;
		}
	})();
	if (!authoritativeLicense) blockers.push("Authoritative full license text is missing; LICENSE.md is only an overview referring to the absent LICENSE file.");
	const hasNotices = existsSync(path.join(rootDirectory, "NOTICE")) || existsSync(path.join(rootDirectory, "THIRD-PARTY-NOTICES"));
	if (!hasNotices) {
		blockers.push("No authoritative third-party notices file was supplied or confirmed as unnecessary.");
	}
	const packagedFiles = options.packagedFiles ?? [];
	const licenseReference = typeof options.packageLicense === "string"
		? /^SEE LICENSE IN (.+)$/.exec(options.packageLicense.trim())?.[1]
		: undefined;
	if (!licenseReference || !safePackagePath(licenseReference)) {
		blockers.push("Extension package metadata does not contain a supported custom license-file reference.");
	} else if (!packagedFiles.includes(`extension/${licenseReference}`)) {
		blockers.push("The VSIX does not include the license file referenced by its package metadata.");
	}
	if (hasNotices && !packagedFiles.some((file) => /^extension\/(?:NOTICE|THIRD-PARTY-NOTICES)$/i.test(file))) {
		blockers.push("Supplied third-party notices are not included in the VSIX.");
	}
	if (options.licenseReferenceConfirmed !== true) blockers.push("The license owner has not confirmed the package reference for the AGPL/commercial dual-license arrangement.");
	if (options.noticeRequirementsConfirmed !== true) blockers.push("The license owner has not confirmed required third-party notices or that none are required.");
	return { status: blockers.length ? "blocked" : "ready", blockers };
}

export async function inspectVsix(vsixBytes: Uint8Array, rootDirectory: string): Promise<VsixInspection> {
	const zip = await JSZip.loadAsync(vsixBytes, { checkCRC32: true });
	const entries = Object.entries(zip.files).filter(([, entry]) => !entry.dir);
	for (const [file, entry] of entries) {
		const originalName = (entry as typeof entry & { unsafeOriginalName?: string }).unsafeOriginalName ?? file;
		if (!safePackagePath(originalName) || !safePackagePath(file)) throw new Error(`VSIX contains an unsafe archive path: ${originalName}`);
		const permissions = typeof entry.unixPermissions === "number" ? entry.unixPermissions : 0;
		if ((permissions & 0o170000) === 0o120000) throw new Error(`VSIX contains a symlink archive member: ${originalName}`);
	}
	const files = entries.map(([file]) => file).sort();
	const unexpected = files.filter((file) => !REQUIRED_VSIX_FILES.includes(file) && !OPTIONAL_LEGAL_FILES.includes(file));
	if (unexpected.length) throw new Error(`VSIX contains undeclared package files: ${unexpected.join(", ")}`);
	const missing = REQUIRED_VSIX_FILES.filter((file) => !zip.file(file));
	if (missing.length) throw new Error(`VSIX is missing required package files: ${missing.join(", ")}`);
	const extensionManifest = await zip.file("extension/package.json")!.async("string");
	const manifest = JSON.parse(extensionManifest) as Record<string, unknown>;
	if (manifest.name !== PACKAGE_NAME || manifest.publisher !== PUBLISHER || typeof manifest.version !== "string"
		|| !isStableVersion(manifest.version) || manifest.main !== "./dist/extension.js") {
		throw new Error("VSIX package identity, stable version, publisher, or entrypoint is invalid.");
	}
	const expectedMetadata = JSON.parse(await readFile(path.join(rootDirectory, "vscode-extension/package.json"), "utf8")) as Record<string, unknown>;
	if (manifest.version !== expectedMetadata.version || manifest.publisher !== expectedMetadata.publisher) {
		throw new Error("VSIX metadata does not match the current extension package metadata.");
	}
	const indexedFiles = await Promise.all(files.map(async (file) => ({
		file,
		sizeBytes: (await zip.file(file)!.async("uint8array")).byteLength,
	})));
	const nativePayload = entries.some(([file, entry]) => {
		const permissions = typeof entry.unixPermissions === "number" ? entry.unixPermissions : 0;
		return (permissions & 0o170000) === 0o120000 || /\.(?:node|dll|so(?:\.|$)|dylib|exe)$/i.test(file);
	});
	const licenseReadiness = inspectLicenseReadiness(rootDirectory, { packageLicense: manifest.license, packagedFiles: files });
	return {
		name: manifest.name as string,
		version: manifest.version,
		publisher: manifest.publisher as string,
		main: manifest.main as string,
		files: indexedFiles,
		sha256: sha256(vsixBytes),
		sizeBytes: vsixBytes.byteLength,
		platformNeutral: !nativePayload,
		licenseReadiness,
	};
}

function run(command: string, args: string[], cwd: string): void {
	const result = spawnReleaseCommand(command, args, { cwd, encoding: "utf8", stdio: "inherit" });
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}.`);
}

function toolVersion(command: string, cwd: string): string {
	const result = spawnReleaseCommand(command, ["--version"], { cwd, encoding: "utf8" });
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(`${command} --version failed with exit code ${result.status ?? "unknown"}.`);
	return result.stdout.trim();
}

export async function runExtensionRelease(rootDirectory = process.cwd()): Promise<VsixInspection> {
	const status = execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: rootDirectory, encoding: "utf8" }).trim();
	if (status) throw new Error("Release packages require a clean committed source tree.");
	const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: rootDirectory, encoding: "utf8" }).trim();
	const rootManifest = JSON.parse(await readFile(path.join(rootDirectory, "package.json"), "utf8")) as { version?: string };
	const extensionDirectory = path.join(rootDirectory, "vscode-extension");
	const extensionManifest = JSON.parse(await readFile(path.join(extensionDirectory, "package.json"), "utf8")) as Record<string, unknown>;
	if (!isStableVersion(rootManifest.version ?? "") || extensionManifest.version !== rootManifest.version
		|| extensionManifest.name !== PACKAGE_NAME || extensionManifest.publisher !== PUBLISHER
		|| extensionManifest.main !== "./dist/extension.js") {
		throw new Error("Root-authoritative version or required VS Code extension identity is invalid.");
	}
	const version = rootManifest.version!;
	const acceptedDirectory = path.join(rootDirectory, "releases", version, "extension");
	if (await access(acceptedDirectory).then(() => true, () => false)) throw new Error(`Refusing to overwrite accepted extension package ${path.relative(rootDirectory, acceptedDirectory)}.`);
	const stagingParent = path.join(rootDirectory, "releases", ".staging", version);
	await mkdir(stagingParent, { recursive: true });
	await mkdir(path.dirname(acceptedDirectory), { recursive: true });
	const attempt = await mkdtemp(path.join(stagingParent, "extension-"));
	const vsixPath = path.join(attempt, `openamx-vscode-${version}.vsix`);
	const packageDirectory = path.join(attempt, "package");
	try {
		run("node", ["esbuild.mjs"], extensionDirectory);
		await mkdir(packageDirectory, { recursive: true });
		for (const relativePath of ["package.json", ".vscodeignore", "README.md", "amx.tmGrammar.json", "language-configuration.json"]) {
			await cp(path.join(extensionDirectory, relativePath), path.join(packageDirectory, relativePath));
		}
		await cp(path.join(extensionDirectory, "dist/extension.js"), path.join(packageDirectory, "dist/extension.js"));
		await cp(path.join(rootDirectory, "LICENSE.md"), path.join(packageDirectory, "LICENSE.md"));
		const vsce = path.join(extensionDirectory, "node_modules", ".bin", process.platform === "win32" ? "vsce.cmd" : "vsce");
		run(vsce, ["package", "--no-dependencies", "--out", vsixPath], packageDirectory);
		const vsixBytes = await readFile(vsixPath);
		const inspection = await inspectVsix(vsixBytes, rootDirectory);
		const artifactDirectory = path.join(attempt, "artifacts");
		await mkdir(artifactDirectory, { recursive: true });
		const artifactName = `openamx-vscode-${version}.vsix`;
		await writeFile(path.join(artifactDirectory, artifactName), vsixBytes, { flag: "wx" });
		await rm(packageDirectory, { recursive: true, force: true });
		await rm(vsixPath, { force: true });
		const manifest = {
			schemaVersion: 1,
			kind: "vscode-extension",
			version,
			sourceCommit,
			publisher: inspection.publisher,
			name: inspection.name,
			main: inspection.main,
			platformNeutral: inspection.platformNeutral,
			licenseReadiness: inspection.licenseReadiness,
			artifact: { file: `artifacts/${artifactName}`, sizeBytes: inspection.sizeBytes, sha256: inspection.sha256 },
		};
		const evidence = {
			schemaVersion: 1,
			buildPackageStatus: "passed",
			manualInstallLaunchStatus: "not_performed",
			marketplacePublication: "manual_only",
			vsceVersion: toolVersion(vsce, extensionDirectory),
			package: inspection,
			checks: { version: "passed", publisher: "passed", entrypoint: "passed", grammar: "passed", languageConfiguration: "passed", archiveContents: "passed" },
		};
		await writeFile(path.join(attempt, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
		await writeFile(path.join(attempt, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`, { flag: "wx" });
		await writeFile(path.join(attempt, "SHA256SUMS"), `${sha256(await readFile(path.join(attempt, "manifest.json")))}  manifest.json\n${sha256(await readFile(path.join(attempt, "evidence.json")))}  evidence.json\n${inspection.sha256}  artifacts/${artifactName}\n`, { flag: "wx" });
		await writeFile(path.join(attempt, "COMPLETE"), `${sourceCommit}\n`, { flag: "wx" });
		await rename(attempt, acceptedDirectory);
		console.log(`VSIX bundle: ${path.relative(rootDirectory, acceptedDirectory)}`);
		console.log(`Artifact: ${artifactName} ${inspection.sizeBytes} bytes sha256:${inspection.sha256}`);
		console.log(`License readiness: ${inspection.licenseReadiness.status}${inspection.licenseReadiness.blockers.length ? ` (${inspection.licenseReadiness.blockers.join("; ")})` : ""}`);
		console.log(`Platform-neutral package contents: ${inspection.platformNeutral ? "yes" : "no"}; native platform certification is not inferred.`);
		return inspection;
	} catch (error) {
		await rm(attempt, { recursive: true, force: true });
		throw error;
	}
}