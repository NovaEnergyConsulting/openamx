import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, open, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectRelease, isStableVersion, mapNativeTarget } from "../release";

const APPLICATION_NAME = "OpenAMX Desktop";
const APPLICATION_IDENTIFIER = "dev.openamx.desktop";
const ROOT_DIRECTORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

type NativeOs = "linux" | "win" | "mac";

export function installerFormat(nativeOs: NativeOs): { extension: string; format: string } {
	switch (nativeOs) {
		case "linux": return { extension: ".tar.gz", format: "tar.gz" };
		case "win": return { extension: ".zip", format: "zip" };
		case "mac": return { extension: ".dmg", format: "dmg" };
	}
}

function run(command: string, args: string[], cwd: string): string {
	const result = spawnSync(command, args, { cwd, encoding: "utf8", windowsHide: true });
	if (result.error) throw result.error;
	if (result.status !== 0) {
		const details = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
		throw new Error(`${command} ${args.join(" ")} failed${details ? `:\n${details}` : "."}`);
	}
	return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function git(rootDirectory: string, args: string[]): string {
	return execFileSync("git", args, { cwd: rootDirectory, encoding: "utf8" }).trim();
}

function sha256(contents: Uint8Array): string {
	return createHash("sha256").update(contents).digest("hex");
}

export function sanitizeBuildWarning(line: string): string {
	return line
		.replace(/\/(?:home|tmp|mnt)\/[^\s:]*/g, "<path>")
		.replace(/[A-Za-z]:\\[^\r\n]*/g, "<path>");
}

export function unsupportedInstallerArchiveMembers(paths: string[]): string[] {
	return paths.filter((entry) => entry.length > 100);
}

async function listFiles(directory: string, relative = ""): Promise<string[]> {
	const files: string[] = [];
	for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
		const child = path.posix.join(relative, entry.name);
		if (entry.isDirectory()) files.push(...await listFiles(directory, child));
		else if (entry.isFile()) files.push(child);
	}
	return files;
}

export function binaryArchitecture(header: Uint8Array): "x64" | "arm64" | "unknown" {
	if (header[0] === 0x7f && header[1] === 0x45 && header[2] === 0x4c && header[3] === 0x46 && header.length >= 20) {
		const machine = header[18] | (header[19]! << 8);
		return machine === 62 ? "x64" : machine === 183 ? "arm64" : "unknown";
	}
	if (header[0] === 0x4d && header[1] === 0x5a && header.length >= 64) {
		const offset = header[0x3c]! | (header[0x3d]! << 8) | (header[0x3e]! << 16) | (header[0x3f]! << 24);
		if (offset < 0 || offset + 6 > header.length) return "unknown";
		const machine = header[offset + 4]! | (header[offset + 5]! << 8);
		return machine === 0x8664 ? "x64" : machine === 0xaa64 ? "arm64" : "unknown";
	}
	if (header.length >= 8) {
		const bigEndian = header[0] === 0xfe && header[1] === 0xed && header[2] === 0xfa;
		const littleEndian = header[0] === 0xcf && header[1] === 0xfa && header[2] === 0xed;
		if (bigEndian || littleEndian) {
			const cpu = bigEndian
				? (header[4]! * 0x1000000 + header[5]! * 0x10000 + header[6]! * 0x100 + header[7]!)
				: (header[7]! * 0x1000000 + header[6]! * 0x10000 + header[5]! * 0x100 + header[4]!);
			return cpu === 0x01000007 ? "x64" : cpu === 0x0100000c ? "arm64" : "unknown";
		}
	}
	return "unknown";
}

async function readHeader(filePath: string): Promise<Uint8Array> {
	const handle = await open(filePath, "r");
	try {
		const header = Buffer.alloc(4096);
		const { bytesRead } = await handle.read(header, 0, header.length, 0);
		return header.subarray(0, bytesRead);
	} finally {
		await handle.close();
	}
}

export async function verifyBuiltApp(buildDirectory: string, expected: { name: string; identifier: string; version: string; architecture: string; nativeOs: NativeOs; electrobunVersion: string }): Promise<{ hash: string; runtimeVersions: Record<string, string> }> {
	const files = await listFiles(buildDirectory);
	const metadataPath = files.find((file) => file.endsWith("/Resources/metadata.json"));
	const payloadPath = files.find((file) => file.endsWith(".tar.zst"));
	if (!metadataPath) throw new Error("Packaged app is missing Electrobun metadata.");
	const metadata = JSON.parse(await readFile(path.join(buildDirectory, metadataPath), "utf8")) as Record<string, unknown>;
	if (metadata.name !== expected.name || metadata.identifier !== expected.identifier) {
		throw new Error("Packaged app metadata does not match the expected product identity and version.");
	}
	if (!path.basename(buildDirectory).endsWith(`-${expected.architecture}`)) {
		throw new Error(`Built app directory does not identify architecture ${expected.architecture}.`);
	}
	const resources = ["Resources/app/bun/jobWorker.js", "Resources/app/views/mainview/index.html"];
	const sharpTarget = `${expected.nativeOs === "mac" ? "darwin" : expected.nativeOs === "win" ? "win32" : "linux"}-${expected.architecture}`;
	const sharpResourcePaths = (paths: string[]) => {
		const binding = paths.some((file) => file.includes(`/node_modules/@img/sharp-${sharpTarget}/`) && file.endsWith(".node"));
		const libvips = paths.some((file) => file.includes(`/node_modules/@img/sharp-libvips-${sharpTarget}/lib/`) && /\.(?:so(?:\..+)?|dylib|dll)$/i.test(file));
		return binding && libvips;
	};
	const versionPath = files.find((file) => file.endsWith("/Resources/version.json"));
	const buildPath = files.find((file) => file.endsWith("/Resources/build.json"));
	let version: Record<string, unknown>;
	let build: Record<string, unknown>;
	if (versionPath && buildPath) {
		for (const resource of resources) {
			if (!files.some((file) => file.endsWith(resource))) throw new Error(`Packaged app is missing ${resource}.`);
		}
		if (!sharpResourcePaths(files)) throw new Error(`Packaged app is missing the native sharp runtime for ${sharpTarget}.`);
		if (!files.some((file) => file.includes("/Resources/app/views/mainview/assets/"))) throw new Error("Packaged app is missing built web assets.");
		if (!files.some((file) => /\/bin\/bun(?:\.exe)?$/i.test(file))) throw new Error("Packaged app is missing its Bun runtime executable.");
		if (!files.some((file) => /(?:lib)?NativeWrapper\.(?:so|dylib|dll)$/i.test(file))
			|| !files.some((file) => /(?:lib)?ElectrobunCore\.(?:so|dylib|dll)$/i.test(file))
			|| !files.some((file) => /(?:lib)?asar\.(?:so|dylib|dll)$/i.test(file))) {
			throw new Error("Packaged app is missing native Electrobun runtime libraries.");
		}
		for (const name of ["launcher", "zig-zstd", "bspatch"]) {
			if (!files.some((file) => file.endsWith(`/bin/${name}`) || file.endsWith(`/bin/${name}.exe`))) throw new Error(`Packaged app is missing ${name}.`);
		}
		const runtimePath = files.find((file) => /\/bin\/bun(?:\.exe)?$/i.test(file));
		if (!runtimePath || binaryArchitecture(await readHeader(path.join(buildDirectory, runtimePath))) !== expected.architecture) {
			throw new Error(`Packaged Bun runtime does not match requested architecture ${expected.architecture}.`);
		}
		version = JSON.parse(await readFile(path.join(buildDirectory, versionPath), "utf8")) as Record<string, unknown>;
		build = JSON.parse(await readFile(path.join(buildDirectory, buildPath), "utf8")) as Record<string, unknown>;
	} else if (payloadPath) {
		if (process.platform !== "linux") throw new Error("Compressed Electrobun resource inspection is currently verified only on Linux; do not mark this target available without native validation.");
		const payload = path.join(buildDirectory, payloadPath);
		const listing = spawnSync("tar", ["--zstd", "-tf", payload], { encoding: "utf8" });
		if (listing.status !== 0) throw new Error("Unable to inspect the packaged zstd payload with tar --zstd.");
		const longMembers = unsupportedInstallerArchiveMembers(listing.stdout.split(/\r?\n/).filter(Boolean));
		if (longMembers.length) throw new Error(`Compressed app payload requires GNU/PAX long-name records unsupported by the native installer: ${longMembers[0]}`);
		for (const resource of [...resources, "OpenAMXDesktop/bin/bun", "OpenAMXDesktop/bin/launcher", "OpenAMXDesktop/bin/libasar.so", "OpenAMXDesktop/bin/libNativeWrapper.so", "OpenAMXDesktop/bin/libElectrobunCore.so", "OpenAMXDesktop/bin/zig-zstd", "OpenAMXDesktop/bin/bspatch"]) {
			if (!listing.stdout.includes(resource)) throw new Error(`Compressed app payload is missing ${resource}.`);
		}
		if (!sharpResourcePaths(listing.stdout.split(/\r?\n/))) throw new Error(`Compressed app payload is missing the native sharp runtime for ${sharpTarget}.`);
		if (!listing.stdout.includes("Resources/app/views/mainview/assets/")) throw new Error("Compressed app payload is missing built web assets.");
		const runtimeInspectionDirectory = await mkdtemp(path.join(os.tmpdir(), "openamx-runtime-inspection-"));
		try {
			run("tar", ["--zstd", "-xf", payload, "-C", runtimeInspectionDirectory, "OpenAMXDesktop/bin/bun"], buildDirectory);
			const architecture = binaryArchitecture(await readHeader(path.join(runtimeInspectionDirectory, "OpenAMXDesktop/bin/bun")));
			if (architecture !== expected.architecture) throw new Error(`Packaged Bun runtime does not match requested architecture ${expected.architecture}.`);
		} finally {
			await rm(runtimeInspectionDirectory, { recursive: true, force: true });
		}
		const readArchiveJson = (entry: string) => {
			const result = spawnSync("tar", ["--zstd", "-xOf", payload, entry], { encoding: "utf8" });
			if (result.status !== 0) throw new Error(`Unable to read ${entry} from the compressed application payload.`);
			return JSON.parse(result.stdout) as Record<string, unknown>;
		};
		version = readArchiveJson("OpenAMXDesktop/Resources/version.json");
		build = readArchiveJson("OpenAMXDesktop/Resources/build.json");
	} else {
		throw new Error("Packaged app is missing version/build metadata and a compressed payload.");
	}
	if (version.version !== expected.version) throw new Error("Packaged app contains an unexpected version.");
	if (build.mainProcess !== "bun" || build.electrobunVersion !== expected.electrobunVersion) {
		throw new Error("Packaged app does not contain the expected Bun main process and pinned Electrobun version.");
	}
	if (typeof version.hash !== "string" || metadata.hash !== version.hash) throw new Error("Packaged app wrapper and payload hashes do not match.");
	if (version.displayName !== expected.name) throw new Error("Packaged app version metadata has an unexpected display name.");
	const runtimeVersions = build.runtimeVersions as Record<string, string> | undefined;
	if (!runtimeVersions || typeof runtimeVersions.bun !== "string") throw new Error("Packaged app does not record its embedded Bun runtime version.");
	return { hash: version.hash, runtimeVersions };
}

export async function findInstaller(artifactDirectory: string, nativeOs: NativeOs, nativeArchitecture: string): Promise<{ path: string; extension: string; format: string }> {
	const format = installerFormat(nativeOs);
	const platformSlug = nativeOs === "mac" ? "macos" : nativeOs;
	const prefix = `${platformSlug}-${nativeArchitecture}-`;
	const candidates = (await readdir(artifactDirectory, { withFileTypes: true }))
		.filter((entry) => entry.isFile() && entry.name.startsWith(prefix) && entry.name.endsWith(format.extension)
			&& (nativeOs === "mac" || entry.name.includes("-Setup")))
		.map((entry) => entry.name);
	if (candidates.length !== 1) throw new Error(`Expected exactly one stable ${nativeOs}/${nativeArchitecture} installer; found ${candidates.length}.`);
	const installer = candidates[0];
	if (!installer || installer.toLowerCase().includes("spike") || installer.toLowerCase().includes("proof")) {
		throw new Error("Refusing a legacy spike/proof artifact as a release installer.");
	}
	const installerPath = path.join(artifactDirectory, installer);
	if (nativeOs === "linux") {
		const listing = spawnSync("tar", ["-tzf", installerPath], { encoding: "utf8" });
		if (listing.status !== 0 || !listing.stdout.includes("installer") || !listing.stdout.includes("README.txt")) {
			throw new Error("Linux installer archive is missing its installer executable or README.");
		}
	}
	return { path: installerPath, ...format };
}

export async function verifyUpdateMetadata(artifactDirectory: string, nativeOs: NativeOs, nativeArchitecture: string, version: string, appHash: string): Promise<{ fileName: string; appArchive: string }> {
	const platformSlug = nativeOs === "mac" ? "macos" : nativeOs;
	const fileName = `stable-${platformSlug}-${nativeArchitecture}-update.json`;
	const metadata = JSON.parse(await readFile(path.join(artifactDirectory, fileName), "utf8")) as Record<string, unknown>;
	if (metadata.version !== version || metadata.platform !== platformSlug || metadata.arch !== nativeArchitecture || metadata.hash !== appHash) {
		throw new Error("Electrobun update metadata does not match the requested version, operating system, architecture, or app payload.");
	}
	const appArchive = (metadata.artifact as { file?: unknown } | undefined)?.file;
	if (typeof appArchive !== "string" || path.basename(appArchive) !== appArchive || !appArchive.endsWith(".tar.zst")) {
		throw new Error("Electrobun update metadata names an unsafe or missing app archive.");
	}
	if (!(await stat(path.join(artifactDirectory, appArchive)).then(() => true, () => false))) throw new Error("Electrobun update metadata references an absent app archive.");
	return { fileName, appArchive };
}

export async function finalizeTargetBundle(
	bundleDirectory: string,
	acceptedBundle: string,
	commit: string,
	manifest: unknown,
	evidence: unknown,
	artifactRecords: Array<{ file: string }>,
): Promise<void> {
	if (await stat(acceptedBundle).then(() => true, () => false)) throw new Error("Refusing to overwrite an accepted target bundle.");
	if (!artifactRecords.length) throw new Error("Cannot finalize a target bundle without artifacts.");
	await mkdir(path.dirname(acceptedBundle), { recursive: true });
	await writeFile(path.join(bundleDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
	await writeFile(path.join(bundleDirectory, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`, { flag: "wx" });
	const checksummedFiles = ["manifest.json", "evidence.json", ...artifactRecords.map((artifact) => artifact.file)];
	const checksumLines = await Promise.all(checksummedFiles.map(async (file) => `${sha256(await readFile(path.join(bundleDirectory, file)))}  ${file}`));
	await writeFile(path.join(bundleDirectory, "SHA256SUMS"), `${checksumLines.join("\n")}\n`, { flag: "wx" });
	await writeFile(path.join(bundleDirectory, "COMPLETE"), `${commit}\n`, { flag: "wx" });
	await rename(bundleDirectory, acceptedBundle);
}

function getHostEvidence(): Record<string, string> {
	const evidence: Record<string, string> = {
		platform: process.platform,
		architecture: process.arch,
		osRelease: os.release(),
		machine: os.machine(),
		bun: process.versions.bun ?? "unavailable",
	};
	if (process.platform === "linux") {
		try {
			const release = execFileSync("cat", ["/etc/os-release"], { encoding: "utf8" });
			const fields = new Map(release.split(/\r?\n/).map((line) => {
				const separator = line.indexOf("=");
				return separator < 0 ? ["", ""] : [line.slice(0, separator), line.slice(separator + 1).replace(/^"|"$/g, "")];
			}));
			evidence.distribution = fields.get("PRETTY_NAME") ?? "unknown";
			evidence.distributionId = fields.get("ID") ?? "unknown";
			evidence.distributionVersion = fields.get("VERSION_ID") ?? "unknown";
		} catch {
			evidence.distribution = "unknown";
		}
	}
	return evidence;
}

export async function runDesktopRelease(rootDirectory = ROOT_DIRECTORY): Promise<void> {
	const status = git(rootDirectory, ["status", "--porcelain", "--untracked-files=all"]);
	if (status) throw new Error("Release builds require a clean committed source tree. Commit or remove source changes, then retry.");
	const commit = git(rootDirectory, ["rev-parse", "HEAD"]);
	const preflight = await inspectRelease(rootDirectory);
	const packageManifest = JSON.parse(await readFile(path.join(rootDirectory, "package.json"), "utf8")) as { version: string };
	if (!isStableVersion(packageManifest.version)) throw new Error("Root package version must be a stable MAJOR.MINOR.PATCH release.");
	if (preflight.versions.status !== "consistent" || preflight.identity.status !== "valid") throw new Error("Release versions or desktop application identity are inconsistent.");
	if (!preflight.host.target || preflight.host.status !== "available") throw new Error(preflight.host.reason ?? "Current host is outside the supported native target matrix.");
	const target = preflight.host.target;
	const requiredTools = preflight.prerequisites.filter((tool) => ["bun", "hutch", "node"].includes(tool.name));
	const missingTool = requiredTools.find((tool) => tool.status !== "available");
	if (missingTool) throw new Error(`Required desktop packaging tool ${missingTool.name} is unavailable. ${missingTool.action ?? ""}`);
	const hutchConfig = await readFile(path.join(rootDirectory, "desktop-app/hutch.config.ts"), "utf8");
	const electrobunVersion = hutchConfig.match(/version:\s*"([^"]+)"/)?.[1];
	if (!electrobunVersion) throw new Error("Could not determine the exact Electrobun pin from desktop-app/hutch.config.ts.");
	const targetName = `${target.os}-${target.architecture}`;
	const releaseRoot = path.join(rootDirectory, "releases", packageManifest.version);
	const acceptedBundle = path.join(releaseRoot, targetName);
	const stagingParent = path.join(rootDirectory, "releases", ".staging", packageManifest.version, targetName);
	await mkdir(releaseRoot, { recursive: true });
	await mkdir(stagingParent, { recursive: true });
	const attemptDirectory = await mkdtemp(path.join(stagingParent, `${commit.slice(0, 12)}-`));
	const lockPath = path.join(releaseRoot, `.${targetName}.lock`);
	let lockHandle;
	try { lockHandle = await open(lockPath, "wx"); }
	catch {
		await rm(attemptDirectory, { recursive: true, force: true });
		throw new Error(`Another release build holds ${path.basename(lockPath)} or an incomplete lock must be reviewed.`);
	}
	const sourceDirectory = path.join(attemptDirectory, "source");
	let worktreeAdded = false;
	let buildLog = "";
	try {
		if (await stat(acceptedBundle).then(() => true, () => false)) throw new Error(`Refusing to overwrite existing target bundle ${targetName} for version ${packageManifest.version}.`);
		run("git", ["worktree", "add", "--detach", sourceDirectory, commit], rootDirectory);
		worktreeAdded = true;
		const desktopDirectory = path.join(sourceDirectory, "desktop-app");
		buildLog += run("bun", ["install", "--frozen-lockfile"], sourceDirectory);
		buildLog += run("bun", ["install", "--frozen-lockfile"], desktopDirectory);
		buildLog += run("bun", ["run", "build:web"], desktopDirectory);
		buildLog += run("hutch", ["electrobun", "build", "--env=stable"], desktopDirectory);
		const platformSlug = target.nativeOs === "mac" ? "macos" : target.nativeOs;
		const buildRoot = path.join(desktopDirectory, "build", `stable-${platformSlug}-${target.nativeArchitecture}`);
		const artifactRoot = path.join(desktopDirectory, "artifacts");
		const installer = await findInstaller(artifactRoot, target.nativeOs, target.nativeArchitecture);
		const appInspection = await verifyBuiltApp(buildRoot, { name: APPLICATION_NAME, identifier: APPLICATION_IDENTIFIER, version: packageManifest.version, architecture: target.architecture, nativeOs: target.nativeOs, electrobunVersion });
		const updateMetadata = await verifyUpdateMetadata(artifactRoot, target.nativeOs, target.nativeArchitecture, packageManifest.version, appInspection.hash);
		if (git(sourceDirectory, ["status", "--porcelain", "--untracked-files=all"])) {
			throw new Error("Release build modified tracked or non-ignored source files in the clean worktree.");
		}
		const bundleDirectory = path.join(attemptDirectory, "bundle");
		const bundleArtifacts = path.join(bundleDirectory, "artifacts");
		await mkdir(bundleArtifacts, { recursive: true });
		const artifactName = `OpenAMX-Desktop-${packageManifest.version}-${target.os}-${target.architecture}${installer.extension}`;
		await cp(installer.path, path.join(bundleArtifacts, artifactName));
		const sidecars = (await readdir(artifactRoot, { withFileTypes: true })).filter((entry) => entry.isFile() && entry.name.startsWith(`stable-${platformSlug}-${target.nativeArchitecture}-`) && entry.name !== path.basename(installer.path));
		if (!sidecars.some((entry) => entry.name === updateMetadata.fileName) || !sidecars.some((entry) => entry.name === updateMetadata.appArchive)) {
			throw new Error("Fresh app archive or update metadata was not included in the target bundle.");
		}
		for (const sidecar of sidecars) await cp(path.join(artifactRoot, sidecar.name), path.join(bundleArtifacts, sidecar.name));
		const artifactRecords = await Promise.all((await readdir(bundleArtifacts, { withFileTypes: true })).filter((entry) => entry.isFile()).map(async (entry) => {
			const contents = await readFile(path.join(bundleArtifacts, entry.name));
			return { file: `artifacts/${entry.name}`, sizeBytes: contents.byteLength, sha256: sha256(contents), role: entry.name === artifactName ? "installer" : "electrobun-sidecar" };
		}));
		const warnings = buildLog.split(/\r?\n/).filter((line) => /\bwarn(?:ing)?\b/i.test(line)).map(sanitizeBuildWarning).slice(0, 50);
		const evidence = {
			schemaVersion: 1,
			buildPackageStatus: "passed",
			manualInstallLaunchStatus: "not_performed",
			commands: ["bun install --frozen-lockfile", "bun run build:web", "hutch electrobun build --env=stable"],
			host: getHostEvidence(),
			tools: {
				bun: process.versions.bun ?? "unknown",
				hutch: run("hutch", ["--version"], desktopDirectory).trim(),
				electrobun: electrobunVersion,
				node: run("node", ["--version"], desktopDirectory).trim(),
			},
			packagedRuntime: appInspection.runtimeVersions,
			checks: { cleanCommittedSource: "passed", versionsAndIdentity: "passed", nativeTargetAndPrerequisites: "passed", installerInspection: "passed", resourceInspection: "passed" },
			warnings,
			manualInstallLaunch: { status: "not_performed", reason: "No manual native install/launch result is inferred from packaging checks." },
		};
		const manifest = {
			schemaVersion: 1,
			product: APPLICATION_NAME,
			version: packageManifest.version,
			sourceCommit: commit,
			target: { os: target.os, architecture: target.architecture, status: "available" },
			installerFormat: installer.format,
			application: { name: APPLICATION_NAME, identifier: APPLICATION_IDENTIFIER },
			artifacts: artifactRecords,
			buildTools: evidence.tools,
			host: evidence.host,
			verification: { buildPackage: "passed", manualInstallLaunch: "not_performed" },
		};
		await finalizeTargetBundle(bundleDirectory, acceptedBundle, commit, manifest, evidence, artifactRecords);
		console.log(`Desktop target bundle created: ${path.relative(rootDirectory, acceptedBundle)}`);
		for (const artifact of artifactRecords) console.log(`${artifact.file} ${artifact.sizeBytes} bytes sha256:${artifact.sha256}`);
	} catch (error) {
		await writeFile(path.join(attemptDirectory, "failure.txt"), `${error instanceof Error ? error.message : String(error)}\n`).catch(() => undefined);
		throw error;
	} finally {
		let worktreeRemoved = !worktreeAdded;
		if (worktreeAdded) {
			try {
				run("git", ["worktree", "remove", "--force", sourceDirectory], rootDirectory);
				worktreeRemoved = true;
			}
			catch { /* Preserve the incomplete attempt for manual recovery. */ }
		}
		if (worktreeRemoved) await rm(sourceDirectory, { recursive: true, force: true }).catch(() => undefined);
		if (await stat(path.join(attemptDirectory, "bundle")).then(() => true, () => false)) await rm(path.join(attemptDirectory, "bundle"), { recursive: true, force: true });
		if (await stat(path.join(attemptDirectory, "failure.txt")).then(() => true, () => false)) {
			console.error(`Incomplete desktop build retained at ${path.relative(rootDirectory, attemptDirectory)}; it is not a collectable target bundle.`);
		} else {
			await rm(attemptDirectory, { recursive: true, force: true });
		}
		await lockHandle.close();
		await rm(lockPath, { force: true });
	}
}