import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { appMetadata } from "../desktop-app/app-metadata";

const PACKAGE_FILES = ["package.json", "desktop-app/package.json", "vscode-extension/package.json"];
const EXPECTED_PACKAGE_NAMES = ["openamx", "openamx-desktop", "openamx-vscode"];
const STABLE_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const TARGET_OS = ["linux", "windows", "macos"] as const;
const TARGET_ARCH = ["x64", "arm64"] as const;

type ProjectOs = (typeof TARGET_OS)[number];
type ProjectArch = (typeof TARGET_ARCH)[number];
type NativeOs = "linux" | "win" | "mac";

interface PackageManifest {
	name: string;
	version: string;
	[key: string]: unknown;
}

interface FileChange {
	filePath: string;
	original: string;
	updated: string;
}

export interface FileOperations {
	readFile(filePath: string, encoding: "utf8"): Promise<string>;
	writeFile(filePath: string, contents: string, options: { flag: "wx" }): Promise<void>;
	rename(oldPath: string, newPath: string): Promise<void>;
	rm(filePath: string, options: { force: true }): Promise<void>;
}

const fileOperations: FileOperations = { readFile, writeFile, rename, rm };

export function isStableVersion(version: string): boolean {
	return STABLE_VERSION.test(version);
}

export function mapNativeTarget(os: string, architecture: string): {
	os: ProjectOs;
	architecture: ProjectArch;
	nativeOs: NativeOs;
	nativeArchitecture: ProjectArch;
} | null {
	const osMap: Record<string, ProjectOs> = { linux: "linux", win32: "windows", darwin: "macos" };
	const nativeOsMap: Record<ProjectOs, NativeOs> = { linux: "linux", windows: "win", macos: "mac" };
	const projectOs = osMap[os];
	if (!projectOs || !TARGET_ARCH.includes(architecture as ProjectArch)) return null;
	return {
		os: projectOs,
		architecture: architecture as ProjectArch,
		nativeOs: nativeOsMap[projectOs],
		nativeArchitecture: architecture as ProjectArch,
	};
}

export function manifestPaths(rootDirectory: string, pathApi: typeof path = path): string[] {
	return PACKAGE_FILES.map((relativePath) => pathApi.join(rootDirectory, relativePath));
}

function formatManifest(manifest: PackageManifest, source: string): string {
	const indent = source.match(/^(\t+| +)(?=\S)/m)?.[1] ?? "  ";
	const newline = source.includes("\r\n") ? "\r\n" : "\n";
	const formatted = JSON.stringify(manifest, null, indent).replace(/\n/g, newline);
	return `${formatted}${source.endsWith("\n") ? newline : ""}`;
}

async function loadManifests(rootDirectory: string) {
	const paths = manifestPaths(rootDirectory);
	const sources = await Promise.all(paths.map((filePath) => readFile(filePath, "utf8")));
	const manifests = sources.map((source, index) => {
		let parsed: PackageManifest;
		try {
			parsed = JSON.parse(source) as PackageManifest;
		} catch {
			throw new Error(`${PACKAGE_FILES[index]} is not valid JSON.`);
		}
		if (parsed.name !== EXPECTED_PACKAGE_NAMES[index] || !isStableVersion(parsed.version ?? "")) {
			throw new Error(`${PACKAGE_FILES[index]} must have its expected package name and a stable semantic version.`);
		}
		return parsed;
	});
	return { paths, sources, manifests };
}

export async function prepareVersion(
	rootDirectory: string,
	version: string,
	operations: FileOperations = fileOperations,
): Promise<{ changed: boolean; version: string }> {
	if (!isStableVersion(version)) throw new Error("Version must be an explicit stable semantic version (for example, 1.2.3). Prerelease and build metadata are not accepted.");
	const { paths, sources, manifests } = await loadManifests(rootDirectory);
	const changes = paths.flatMap((filePath, index) => {
		const manifest = manifests[index];
		if (manifest.version === version) return [];
		const updated = formatManifest({ ...manifest, version }, sources[index]);
		if ((JSON.parse(updated) as PackageManifest).version !== version) {
			throw new Error(`${PACKAGE_FILES[index]} could not be updated safely.`);
		}
		return [{ filePath, original: sources[index], updated }];
	});
	if (!changes.length) return { changed: false, version };
	await commitChanges(changes, operations);
	return { changed: true, version };
}

async function commitChanges(changes: FileChange[], operations: FileOperations): Promise<void> {
	const token = `${process.pid}.${randomUUID()}`;
	const staged = changes.map((change) => ({
		...change,
		temporaryPath: `${change.filePath}.${token}.tmp`,
		backupPath: `${change.filePath}.${token}.bak`,
		backedUp: false,
		installed: false,
	}));
	try {
		for (const item of staged) await operations.writeFile(item.temporaryPath, item.updated, { flag: "wx" });
		for (const item of staged) {
			if ((await operations.readFile(item.filePath, "utf8")) !== item.original) {
				throw new Error(`${path.basename(item.filePath)} changed during preparation; no version changes were committed.`);
			}
			await operations.rename(item.filePath, item.backupPath);
			item.backedUp = true;
			await operations.rename(item.temporaryPath, item.filePath);
			item.installed = true;
		}
	} catch (error) {
		const rollbackErrors: unknown[] = [];
		for (const item of [...staged].reverse()) {
			try {
				if (item.installed) await operations.rm(item.filePath, { force: true });
				if (item.backedUp) await operations.rename(item.backupPath, item.filePath);
			} catch (rollbackError) {
				rollbackErrors.push(rollbackError);
			}
		}
		for (const item of staged) await operations.rm(item.temporaryPath, { force: true }).catch(() => undefined);
		if (rollbackErrors.length) throw new AggregateError([error, ...rollbackErrors], "Version preparation failed and rollback was incomplete; preserve backup files for recovery.");
		throw error;
	}
	for (const item of staged) await operations.rm(item.backupPath, { force: true }).catch(() => undefined);
}

export interface ToolProbe {
	name: string;
	path: string | null;
	version: string | null;
	status: "available" | "unavailable";
	action?: string;
}

export interface ReleaseCheckResult {
	versions: { status: "consistent" | "inconsistent"; values: string[] };
	identity: { status: "valid" | "invalid"; name: string; identifier: string };
	host: { status: "available" | "unsupported"; target: ReturnType<typeof mapNativeTarget>; reason?: string };
	packaging: { status: "available" | "unverified"; reason: string };
	prerequisites: ToolProbe[];
	targets: Array<{ os: ProjectOs; architecture: ProjectArch; status: "available" | "unverified" | "unsupported"; nativeOs: NativeOs; nativeArchitecture: ProjectArch }>;
}

export async function inspectRelease(
	rootDirectory: string,
	options: {
		platform?: string;
		architecture?: string;
		findExecutable?: (command: string) => string | null;
		probe?: (executable: string) => { status: number | null; stdout: string; stderr: string };
	} = {},
): Promise<ReleaseCheckResult> {
	const platform = options.platform ?? process.platform;
	const architecture = options.architecture ?? process.arch;
	const hostTarget = mapNativeTarget(platform, architecture);
	const { manifests } = await loadManifests(rootDirectory);
	const findExecutable = options.findExecutable ?? ((command) => Bun.which(command) ?? null);
	const runProbe = options.probe ?? ((executable) => {
		const result = spawnSync(executable, ["--version"], { encoding: "utf8", shell: process.platform === "win32" });
		return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
	});
	const prerequisites: ToolProbe[] = [];
	for (const name of ["bun", "hutch", "node", "vsce"]) {
		const localVsce = path.join(rootDirectory, "vscode-extension", "node_modules", ".bin", process.platform === "win32" ? "vsce.cmd" : "vsce");
		const executable = name === "vsce" && existsSync(localVsce) ? localVsce : findExecutable(name);
		if (!executable) {
			prerequisites.push({ name, path: null, version: null, status: "unavailable", action: `Install ${name} and ensure it is on PATH.` });
			continue;
		}
		const result = runProbe(executable);
		const version = (result.stdout || result.stderr).trim().split(/\r?\n/)[0] || null;
		prerequisites.push({
			name,
			path: executable,
			version,
			status: result.status === 0 ? "available" : "unavailable",
			...(result.status === 0 ? {} : { action: `Repair ${name} so it is on PATH and runnable.` }),
		});
	}
	const versions = [...new Set(manifests.map((manifest) => manifest.version))];
	const identityValid = appMetadata.name === "OpenAMX Desktop" && appMetadata.identifier === "dev.openamx.desktop";
	const toolsReady = prerequisites.every((tool) => tool.status === "available");
	const targetRows = TARGET_OS.flatMap((os) => TARGET_ARCH.map((targetArchitecture) => {
		const target = mapNativeTarget(os === "windows" ? "win32" : os === "macos" ? "darwin" : "linux", targetArchitecture);
		const current = hostTarget?.os === os && hostTarget.architecture === targetArchitecture;
		return {
			os,
			architecture: targetArchitecture,
			status: current && toolsReady && versions.length === 1 && identityValid ? "available" as const : "unverified" as const,
			nativeOs: target!.nativeOs,
			nativeArchitecture: target!.nativeArchitecture,
		};
	}));
	const linuxX64PackagingVerified = hostTarget?.os === "linux" && hostTarget.architecture === "x64";
	return {
		versions: { status: versions.length === 1 ? "consistent" : "inconsistent", values: versions },
		identity: {
			status: identityValid ? "valid" : "invalid",
			name: appMetadata.name,
			identifier: appMetadata.identifier,
		},
		host: hostTarget ? { status: "available", target: hostTarget } : { status: "unsupported", target: null, reason: `Host ${platform}/${architecture} is outside the declared Linux/Windows/macOS x64/arm64 matrix.` },
		packaging: {
			status: linuxX64PackagingVerified ? "available" : "unverified",
			reason: linuxX64PackagingVerified
				? "Hutch 0.27.1/Electrobun 2.0.1 produced a native Linux x64 .tar.gz Setup installer in Sprint 048; this does not pass the clean-source gate or native preview acceptance."
				: "Native packaging has not been exercised on this host; Windows .zip and macOS .dmg routes require native-host evidence.",
		},
		prerequisites,
		targets: targetRows,
	};
}

function printCheck(result: ReleaseCheckResult): void {
	console.log(`Versions: ${result.versions.status} (${result.versions.values.join(", ")})`);
	console.log(`Application identity: ${result.identity.status} (${result.identity.name}; ${result.identity.identifier})`);
	console.log(`Current host: ${result.host.status}${result.host.target ? ` (${result.host.target.os}/${result.host.target.architecture}; Electrobun ${result.host.target.nativeOs}/${result.host.target.nativeArchitecture})` : ` (${result.host.reason})`}`);
	console.log(`Native packaging: ${result.packaging.status} (${result.packaging.reason})`);
	for (const tool of result.prerequisites) console.log(`Prerequisite ${tool.name}: ${tool.status}${tool.version ? ` (${tool.version})` : ""}${tool.action ? `; ${tool.action}` : ""}`);
	for (const target of result.targets) console.log(`Target ${target.os}/${target.architecture} (Electrobun ${target.nativeOs}/${target.nativeArchitecture}): ${target.status}`);
}

async function main(args: string[]): Promise<void> {
	const [command, ...parameters] = args;
	if (command === "prepare" && parameters.length === 1) {
		const result = await prepareVersion(process.cwd(), parameters[0]);
		console.log(result.changed ? `Prepared version ${result.version}. Review the manifest changes before committing.` : `Version ${result.version} is already synchronized; no files changed.`);
		return;
	}
	if (command === "check" && parameters.length === 0) {
		const result = await inspectRelease(process.cwd());
		printCheck(result);
		if (result.host.status !== "available" || result.versions.status !== "consistent" || result.identity.status !== "valid" || result.prerequisites.some((tool) => tool.status !== "available")) process.exitCode = 1;
		return;
	}
	if (command === "desktop" && parameters.length === 0) {
		const { runDesktopRelease } = await import("./release/desktop");
		await runDesktopRelease(process.cwd());
		return;
	}
	if (command === "extension" && parameters.length === 0) {
		const { runExtensionRelease } = await import("./release/extension");
		await runExtensionRelease(process.cwd());
		return;
	}
	if (command === "collect") {
		const addition = parameters.includes("--addition");
		const bundles = parameters.filter((parameter) => parameter !== "--addition");
		if (bundles.length < 2) throw new Error("Collection requires at least one desktop bundle and one VSIX bundle.");
		const { collectRelease } = await import("./release/assembly");
		const destination = await collectRelease(process.cwd(), bundles.map((bundle) => path.resolve(process.cwd(), bundle)), { addition });
		console.log(`Release assembled: ${path.relative(process.cwd(), destination)}`);
		return;
	}
	if (command === "verify" && parameters.length <= 1) {
		const version = parameters[0] ?? (JSON.parse(await readFile(path.join(process.cwd(), "package.json"), "utf8")) as { version: string }).version;
		if (!isStableVersion(version)) throw new Error("Verification version must be a stable MAJOR.MINOR.PATCH version.");
		const { verifyRelease } = await import("./release/assembly");
		const result = await verifyRelease(process.cwd(), path.join(process.cwd(), "releases", version, "assembled"));
		console.log(`Release ${result.version} at ${result.sourceCommit}: integrity ${result.integrity}; build/package ${result.packageStatus}; desktop manual install/launch ${result.desktopManualInstallLaunchStatus}; extension manual install/launch ${result.manualInstallLaunchStatus}; license/notices ${result.licenseReadiness}.`);
		for (const target of result.targets) console.log(`Target ${target.target}: artifact ${target.status}; platform support ${target.supportStatus}; manual install/launch ${target.manualInstallLaunchStatus}`);
		for (const blocker of result.blockers) console.error(`Blocked: ${blocker}`);
		if (result.licenseReadiness !== "ready" || result.blockers.length || result.integrity !== "passed") process.exitCode = 1;
		return;
	}
	if (command === "publish") {
		let version: string | undefined;
		let repository: string | undefined;
		let assemblyPath: string | undefined;
		let allowPartial = false;
		for (const parameter of parameters) {
			if (parameter === "--allow-partial") allowPartial = true;
			else if (parameter.startsWith("--version=")) version = parameter.slice("--version=".length);
			else if (parameter.startsWith("--repo=")) repository = parameter.slice("--repo=".length);
			else if (parameter.startsWith("--assembly=")) assemblyPath = parameter.slice("--assembly=".length);
			else throw new Error(`Unknown release:publish option: ${parameter}`);
		}
		version ??= (JSON.parse(await readFile(path.join(process.cwd(), "package.json"), "utf8")) as { version: string }).version;
		if (!isStableVersion(version)) throw new Error("Publication version must be a stable MAJOR.MINOR.PATCH version.");
		const { publishRelease } = await import("./release/publish");
		const result = await publishRelease({
			rootDirectory: process.cwd(),
			releaseDirectory: assemblyPath ? path.resolve(process.cwd(), assemblyPath) : path.join(process.cwd(), "releases", version, "assembled"),
			repository,
			allowPartial,
		});
		console.log(`Draft release ${result.tag} in ${result.repository}: uploaded ${result.uploaded.length}, confirmed identical ${result.confirmed.length}.`);
		if (result.partialTargets.length) console.log(`Partial targets acknowledged: ${result.partialTargets.join(", ")}`);
		return;
	}
	console.error("Usage: bun run scripts/release.ts prepare <version> | check | desktop | extension | collect [--addition] <bundle> <bundle...> | verify [version] | publish [--version=<version>] [--assembly=<path>] [--repo=OWNER/REPO] [--allow-partial]");
	process.exitCode = 2;
}

if (import.meta.main) {
	try {
		await main(Bun.argv.slice(2));
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 1;
	}
}