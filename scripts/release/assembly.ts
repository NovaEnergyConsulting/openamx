import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { access, cp, lstat, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { isStableVersion } from "../release";
import { inspectVsix } from "./extension";
import { inspectTarMembers, inspectTarZstdMembers, MAX_UNCOMPRESSED_ARCHIVE_BYTES, validateArchiveMemberPath } from "./archive";

const TARGETS = ["linux-x64", "linux-arm64", "windows-x64", "windows-arm64", "macos-x64", "macos-arm64"];
const FULL_COMMIT = /^[a-f0-9]{40}$/;

type ArtifactRecord = { file: string; sizeBytes: number; sha256: string; role?: string };
type AnyRecord = Record<string, unknown>;

export interface ReleaseVerification {
	version: string;
	sourceCommit: string;
	integrity: "passed" | "failed";
	licenseReadiness: "ready" | "blocked";
	packageStatus: string;
	manualInstallLaunchStatus: string;
	desktopManualInstallLaunchStatus: string;
	targets: Array<{ target: string; status: "available" | "missing" | "unverified" | "unsupported"; supportStatus: string; manualInstallLaunchStatus: string }>;
	blockers: string[];
}

function sha256(bytes: Uint8Array): string {
	return createHash("sha256").update(bytes).digest("hex");
}

function safeRelativePath(file: string): boolean {
	return file.length > 0 && !file.startsWith("/") && !file.includes("\\")
		&& !/^[A-Za-z]:/.test(file) && !file.split("/").some((segment) => segment === "" || segment === "." || segment === "..");
}

function record(value: unknown, context: string): AnyRecord {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${context} must be a JSON object.`);
	return value as AnyRecord;
}

async function readJson(filePath: string, context: string): Promise<AnyRecord> {
	try {
		return record(JSON.parse(await readFile(filePath, "utf8")), context);
	} catch (error) {
		if (error instanceof SyntaxError) throw new Error(`${context} is malformed JSON.`);
		throw error;
	}
}

async function regularFileWithoutSymlinks(root: string, relativePath: string): Promise<string> {
	if (!safeRelativePath(relativePath)) throw new Error(`Unsafe relative path: ${relativePath}`);
	const segments = relativePath.split("/");
	let cursor = root;
	for (let index = 0; index < segments.length; index++) {
		cursor = path.join(cursor, segments[index]!);
		const info = await lstat(cursor).catch(() => null);
		if (!info) throw new Error(`Required bundle file is missing: ${relativePath}`);
		if (info.isSymbolicLink()) throw new Error(`Symlinked bundle path is not accepted: ${relativePath}`);
		if (index < segments.length - 1 && !info.isDirectory()) throw new Error(`Bundle path parent is not a directory: ${relativePath}`);
		if (index === segments.length - 1 && !info.isFile()) throw new Error(`Bundle member is not a regular file: ${relativePath}`);
	}
	return cursor;
}

async function validateBundleTree(directory: string): Promise<string[]> {
	const absolute = path.resolve(directory);
	const root = path.parse(absolute).root;
	let ancestor = root;
	for (const segment of absolute.slice(root.length).split(path.sep).filter(Boolean)) {
		ancestor = path.join(ancestor, segment);
		const ancestorInfo = await lstat(ancestor);
		if (ancestorInfo.isSymbolicLink()) throw new Error(`Bundle path traverses a symlinked directory: ${ancestor}`);
	}
	const rootInfo = await lstat(directory);
	if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) throw new Error("Bundle root must be a real directory, not a symlink.");
	const files: string[] = [];
	async function visit(relative = ""): Promise<void> {
		for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
			const child = relative ? `${relative}/${entry.name}` : entry.name;
			if (!safeRelativePath(child)) throw new Error(`Unsafe bundle member path: ${child}`);
			const info = await lstat(path.join(directory, child));
			if (info.isSymbolicLink()) throw new Error(`Symlinked bundle member is not accepted: ${child}`);
			if (info.isDirectory()) await visit(child);
			else if (!info.isFile()) throw new Error(`Bundle member is not a regular file: ${child}`);
			else files.push(child);
		}
	}
	await visit();
	return files;
}

function rejectUndeclaredBundleFiles(files: string[], artifacts: ArtifactRecord[]): void {
	const expected = new Set(["manifest.json", "evidence.json", "SHA256SUMS", "COMPLETE", ...artifacts.map((artifact) => artifact.file)]);
	const extra = files.filter((file) => !expected.has(file));
	const missing = [...expected].filter((file) => !files.includes(file));
	if (extra.length || missing.length) throw new Error(`Bundle file set is incomplete or contains undeclared files${extra.length ? `: ${extra.join(", ")}` : `; missing ${missing.join(", ")}`}.`);
}

async function validateChecksums(directory: string, manifest: AnyRecord, requiredRecords: ArtifactRecord[]): Promise<void> {
	const sumsPath = await regularFileWithoutSymlinks(directory, "SHA256SUMS");
	const lines = (await readFile(sumsPath, "utf8")).trim().split(/\r?\n/);
	const expected = new Map<string, string>();
	for (const line of lines) {
		const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
		if (!match || !safeRelativePath(match[2]!)) throw new Error("SHA256SUMS contains a malformed or unsafe entry.");
		if (expected.has(match[2]!)) throw new Error(`SHA256SUMS contains a duplicate entry: ${match[2]}`);
		expected.set(match[2]!, match[1]!);
	}
	for (const relativePath of ["manifest.json", "evidence.json", ...requiredRecords.map((item) => item.file)]) {
		const filePath = await regularFileWithoutSymlinks(directory, relativePath);
		const bytes = await readFile(filePath);
		if (expected.get(relativePath) !== sha256(bytes)) throw new Error(`Checksum missing or invalid for ${relativePath}.`);
	}
	if (expected.size !== 2 + requiredRecords.length) throw new Error("SHA256SUMS contains unlisted or missing bundle members.");
	void manifest;
}

async function validateArtifactRecords(directory: string, value: unknown): Promise<ArtifactRecord[]> {
	if (!Array.isArray(value) || value.length === 0) throw new Error("Bundle manifest must contain artifact records.");
	const seen = new Set<string>();
	const records: ArtifactRecord[] = [];
	for (const item of value) {
		const artifact = record(item, "Artifact record");
		if (typeof artifact.file !== "string" || !safeRelativePath(artifact.file)
			|| !Number.isSafeInteger(artifact.sizeBytes) || (artifact.sizeBytes as number) < 0
			|| typeof artifact.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(artifact.sha256)) {
			throw new Error("Bundle manifest contains an invalid artifact record.");
		}
		if (seen.has(artifact.file)) throw new Error(`Bundle manifest contains a duplicate artifact: ${artifact.file}`);
		seen.add(artifact.file);
		const filePath = await regularFileWithoutSymlinks(directory, artifact.file);
		const bytes = await readFile(filePath);
		if (bytes.byteLength !== artifact.sizeBytes || sha256(bytes) !== artifact.sha256) throw new Error(`Artifact size or SHA-256 mismatch: ${artifact.file}`);
		records.push(artifact as ArtifactRecord);
	}
	return records;
}

function inspectTarGzipMembers(archiveBytes: Uint8Array): void {
	let tar: Buffer;
	try {
		tar = gunzipSync(archiveBytes, { maxOutputLength: MAX_UNCOMPRESSED_ARCHIVE_BYTES });
	} catch {
		throw new Error("Installer TAR.GZ is malformed or exceeds the archive inspection size limit.");
	}
	inspectTarMembers(tar);
}

async function inspectInstallerArchive(file: string, archiveBytes: Uint8Array): Promise<void> {
	if (file.toLowerCase().endsWith(".tar.gz")) {
		inspectTarGzipMembers(archiveBytes);
		return;
	}
	if (file.toLowerCase().endsWith(".zip")) {
		let zip: JSZip;
		try { zip = await JSZip.loadAsync(archiveBytes); }
		catch { throw new Error("Installer ZIP is malformed."); }
		const entries = Object.entries(zip.files);
		if (entries.length > 100_000) throw new Error("Installer ZIP has too many members.");
		for (const [name, entry] of entries) {
			const originalName = (entry as typeof entry & { unsafeOriginalName?: string }).unsafeOriginalName ?? name;
			validateArchiveMemberPath(originalName);
			const permissions = typeof entry.unixPermissions === "number" ? entry.unixPermissions : 0;
			if ((permissions & 0o170000) === 0o120000) throw new Error(`Installer ZIP contains a symlink member: ${originalName}`);
		}
		return;
	}
	if (file.toLowerCase().endsWith(".tar.zst")) {
		inspectTarZstdMembers(archiveBytes);
	}
}

async function validateDesktopArchiveMembers(directory: string, artifacts: ArtifactRecord[]): Promise<void> {
	for (const artifact of artifacts) {
		if (artifact.role === "installer" || /\.(?:tar\.gz|tar\.zst|zip)$/i.test(artifact.file)) {
			await inspectInstallerArchive(artifact.file, await readFile(path.join(directory, artifact.file)));
		}
	}
}

function checkCompleteMarker(value: string, commit: string): void {
	if (value.trim() !== commit || !FULL_COMMIT.test(commit)) throw new Error("Bundle COMPLETE marker does not match the full source commit.");
}

async function validateDesktopBundle(directory: string): Promise<{ directory: string; version: string; commit: string; target: string; artifacts: ArtifactRecord[]; manifest: AnyRecord; evidence: AnyRecord }> {
	const files = await validateBundleTree(directory);
	const manifest = await readJson(path.join(directory, "manifest.json"), "Desktop manifest");
	const evidence = await readJson(path.join(directory, "evidence.json"), "Desktop evidence");
	if (manifest.schemaVersion !== 1 || manifest.product !== "OpenAMX Desktop" || !isStableVersion(String(manifest.version ?? ""))
		|| typeof manifest.sourceCommit !== "string" || !FULL_COMMIT.test(manifest.sourceCommit)) throw new Error("Desktop bundle manifest schema, version, product, or source provenance is invalid.");
	const targetInfo = record(manifest.target, "Desktop target");
	const target = `${String(targetInfo.os)}-${String(targetInfo.architecture)}`;
	if (!TARGETS.includes(target) || targetInfo.status !== "available") throw new Error("Desktop bundle target or target status is invalid.");
	const application = record(manifest.application, "Desktop application identity");
	if (application.name !== "OpenAMX Desktop" || application.identifier !== "dev.openamx.desktop") throw new Error("Desktop bundle application identity is invalid.");
	if (evidence.schemaVersion !== 1 || evidence.buildPackageStatus !== "passed" || typeof evidence.manualInstallLaunchStatus !== "string") throw new Error("Desktop bundle evidence is incomplete or invalid.");
	const artifacts = await validateArtifactRecords(directory, manifest.artifacts);
	rejectUndeclaredBundleFiles(files, artifacts);
	await validateDesktopArchiveMembers(directory, artifacts);
	await validateChecksums(directory, manifest, artifacts);
	const completePath = await regularFileWithoutSymlinks(directory, "COMPLETE");
	checkCompleteMarker(await readFile(completePath, "utf8"), manifest.sourceCommit);
	return { directory, version: manifest.version as string, commit: manifest.sourceCommit, target, artifacts, manifest, evidence };
}

async function validateExtensionBundle(directory: string, rootDirectory: string): Promise<{ directory: string; version: string; commit: string; artifact: ArtifactRecord; manifest: AnyRecord; evidence: AnyRecord }> {
	const files = await validateBundleTree(directory);
	const manifest = await readJson(path.join(directory, "manifest.json"), "Extension manifest");
	const evidence = await readJson(path.join(directory, "evidence.json"), "Extension evidence");
	if (manifest.schemaVersion !== 1 || manifest.kind !== "vscode-extension" || !isStableVersion(String(manifest.version ?? ""))
		|| typeof manifest.sourceCommit !== "string" || !FULL_COMMIT.test(manifest.sourceCommit)
		|| manifest.name !== "openamx-vscode" || manifest.publisher !== "EngineersTools" || manifest.main !== "./dist/extension.js"
		|| typeof manifest.platformNeutral !== "boolean") throw new Error("Extension bundle manifest schema, identity, or provenance is invalid.");
	const artifact = (await validateArtifactRecords(directory, [manifest.artifact]))[0]!;
	rejectUndeclaredBundleFiles(files, [artifact]);
	const packageInspection = await inspectVsix(await readFile(path.join(directory, artifact.file)), rootDirectory);
	if (packageInspection.version !== manifest.version || packageInspection.publisher !== manifest.publisher
		|| packageInspection.name !== manifest.name || packageInspection.main !== manifest.main
		|| packageInspection.platformNeutral !== manifest.platformNeutral
		|| packageInspection.licenseReadiness.status !== record(manifest.licenseReadiness, "Extension license readiness").status) {
		throw new Error("VSIX package contents or license readiness do not match the extension bundle manifest.");
	}
	await validateChecksums(directory, manifest, [artifact]);
	const completePath = await regularFileWithoutSymlinks(directory, "COMPLETE");
	checkCompleteMarker(await readFile(completePath, "utf8"), manifest.sourceCommit);
	if (evidence.schemaVersion !== 1 || evidence.buildPackageStatus !== "passed" || evidence.manualInstallLaunchStatus !== "not_performed") throw new Error("Extension package evidence is incomplete or invalid.");
	return { directory, version: manifest.version as string, commit: manifest.sourceCommit, artifact, manifest, evidence };
}

function currentSource(rootDirectory: string): { version: string; commit: string } {
	const status = execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: rootDirectory, encoding: "utf8" }).trim();
	if (status) throw new Error("Collection requires a clean committed source tree.");
	const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: rootDirectory, encoding: "utf8" }).trim();
	const rootManifest = JSON.parse(requireText(path.join(rootDirectory, "package.json"))) as { version?: string };
	if (!isStableVersion(rootManifest.version ?? "")) throw new Error("Root package version is not a stable release version.");
	return { version: rootManifest.version!, commit };
}

function requireText(filePath: string): string {
	return readFileSync(filePath, "utf8");
}

export async function collectRelease(rootDirectory: string, bundleDirectories: string[], options: { addition?: boolean } = {}): Promise<string> {
	if (bundleDirectories.length < 2) throw new Error("Collection requires at least one desktop bundle and one VSIX bundle.");
	const source = currentSource(rootDirectory);
	const desktopBundles: Awaited<ReturnType<typeof validateDesktopBundle>>[] = [];
	const extensionBundles: Awaited<ReturnType<typeof validateExtensionBundle>>[] = [];
	for (const directory of bundleDirectories) {
		const manifest = await readJson(path.join(directory, "manifest.json"), "Bundle manifest");
		if (manifest.kind === "vscode-extension") extensionBundles.push(await validateExtensionBundle(directory, rootDirectory));
		else desktopBundles.push(await validateDesktopBundle(directory));
	}
	if (extensionBundles.length !== 1 || desktopBundles.length === 0) throw new Error("Collection requires exactly one VSIX bundle and at least one desktop target bundle.");
	const extension = extensionBundles[0]!;
	const all = [...desktopBundles, extension];
	if (all.some((bundle) => bundle.version !== source.version || bundle.commit !== source.commit)) {
		throw new Error("Bundle version/source commit does not match the clean current release source.");
	}
	const targets = new Set<string>();
	for (const bundle of desktopBundles) {
		if (targets.has(bundle.target)) throw new Error(`Conflicting duplicate desktop target: ${bundle.target}`);
		targets.add(bundle.target);
	}
	const versionDirectory = path.join(rootDirectory, "releases", source.version);
	const baseDirectory = path.join(versionDirectory, "assembled");
	let existingTargetStatuses = new Map<string, { status: string; supportStatus: string; manualInstallLaunchStatus: string }>();
	let acceptedDirectory = baseDirectory;
	if (options.addition) {
		if (!await access(baseDirectory).then(() => true, () => false)) throw new Error("A same-version base assembly is required before collecting an addition.");
		const baseVerification = await verifyRelease(rootDirectory, baseDirectory);
		if (baseVerification.version !== source.version || baseVerification.sourceCommit !== source.commit) throw new Error("Addition source does not match the immutable base release version and full source commit.");
		const baseManifest = await readJson(path.join(baseDirectory, "manifest.json"), "Base release manifest");
		for (const item of baseVerification.targets) existingTargetStatuses.set(item.target, item);
		const additionsDirectory = path.join(versionDirectory, "additions", source.commit.slice(0, 12));
		for (const entry of await readdir(additionsDirectory, { withFileTypes: true }).catch(() => [])) {
			if (entry.isSymbolicLink() || !entry.isDirectory()) throw new Error("Existing release additions contain an unsafe path.");
			const priorPath = path.join(additionsDirectory, entry.name);
			const priorVerification = await verifyRelease(rootDirectory, priorPath);
			if (priorVerification.version !== source.version || priorVerification.sourceCommit !== source.commit) {
				throw new Error("Existing release addition does not match the immutable base version and source commit.");
			}
			for (const item of priorVerification.targets) {
				if (item.status === "available") existingTargetStatuses.set(item.target, item);
			}
		}
		for (const bundle of desktopBundles) {
			if (existingTargetStatuses.get(bundle.target)?.status === "available") throw new Error(`Conflicting duplicate desktop target already present in the base assembly: ${bundle.target}`);
		}
		const baseVsix = (baseManifest.assets as unknown[]).map((item) => record(item, "Base release asset")).find((item) => String(item.file).toLowerCase().endsWith(".vsix"));
		if (!baseVsix || baseVsix.sha256 !== extension.artifact.sha256 || baseVsix.sizeBytes !== extension.artifact.sizeBytes) {
			throw new Error("An addition must use a byte-identical VSIX from the same source revision as the base release.");
		}
		acceptedDirectory = path.join(versionDirectory, "additions", source.commit.slice(0, 12), randomUUID());
	} else if (await access(baseDirectory).then(() => true, () => false)) {
		throw new Error(`Refusing to overwrite accepted release assembly ${path.relative(rootDirectory, baseDirectory)}.`);
	}
	if (await access(acceptedDirectory).then(() => true, () => false)) throw new Error(`Refusing to overwrite accepted release assembly ${path.relative(rootDirectory, acceptedDirectory)}.`);
	const stagingParent = path.join(rootDirectory, "releases", ".staging", source.version);
	await mkdir(stagingParent, { recursive: true });
	const stage = path.join(stagingParent, `assembled-${randomUUID()}`);
	await mkdir(stage, { recursive: true });
	try {
		const assets: Array<{ file: string; sizeBytes: number; sha256: string; role: string; target?: string }> = [];
		for (const bundle of desktopBundles) {
			for (const artifact of bundle.artifacts) {
				const destination = `targets/${bundle.target}/${artifact.file}`;
				const destinationPath = path.join(stage, destination);
				await mkdir(path.dirname(destinationPath), { recursive: true });
				await cp(path.join(bundle.directory, artifact.file), destinationPath, { errorOnExist: true });
				assets.push({ ...artifact, file: destination, role: artifact.role ?? "desktop-artifact", target: bundle.target });
			}
		}
		const extensionArtifactPath = `extension/${extension.artifact.file}`;
		const extensionArtifactDestination = path.join(stage, extensionArtifactPath);
		await mkdir(path.dirname(extensionArtifactDestination), { recursive: true });
		await cp(path.join(extension.directory, extension.artifact.file), extensionArtifactDestination, { errorOnExist: true });
		assets.push({ ...extension.artifact, file: extensionArtifactPath, role: "vscode-extension" });
			const targetStatuses = TARGETS.map((target) => {
				const desktop = desktopBundles.find((bundle) => bundle.target === target);
				const existing = existingTargetStatuses.get(target);
				return {
					target,
					status: targets.has(target) ? "available" : existing?.status ?? "missing",
					supportStatus: existing?.supportStatus ?? (target === "linux-x64" ? "available" : "unverified"),
					manualInstallLaunchStatus: desktop?.evidence.manualInstallLaunchStatus ?? existing?.manualInstallLaunchStatus ?? "not_performed",
				};
			});
		const manifest = {
			schemaVersion: 1,
			product: "OpenAMX",
			version: source.version,
			sourceCommit: source.commit,
			application: { name: "OpenAMX Desktop", identifier: "dev.openamx.desktop" },
			extension: { name: extension.manifest.name, publisher: extension.manifest.publisher, platformNeutral: extension.manifest.platformNeutral, licenseReadiness: extension.manifest.licenseReadiness },
			targets: targetStatuses,
			verification: { buildPackage: "passed", desktopManualInstallLaunch: "not_performed", extensionManualInstallLaunch: "not_performed" },
			assets,
		};
		await writeFile(path.join(stage, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
		const sums = [
			`${sha256(await readFile(path.join(stage, "manifest.json")))}  manifest.json`,
			...await Promise.all(assets.map(async (asset) => `${sha256(await readFile(path.join(stage, asset.file)))}  ${asset.file}`)),
		];
		await writeFile(path.join(stage, "SHA256SUMS"), `${sums.join("\n")}\n`, { flag: "wx" });
		await writeFile(path.join(stage, "COMPLETE"), `${source.commit}\n`, { flag: "wx" });
		await mkdir(path.dirname(acceptedDirectory), { recursive: true });
		await rename(stage, acceptedDirectory);
		return acceptedDirectory;
	} catch (error) {
		await rm(stage, { recursive: true, force: true });
		throw error;
	}
}

export async function verifyRelease(rootDirectory: string, releaseDirectory: string): Promise<ReleaseVerification> {
	const files = await validateBundleTree(releaseDirectory);
	const manifest = await readJson(path.join(releaseDirectory, "manifest.json"), "Release manifest");
	if (manifest.schemaVersion !== 1 || !isStableVersion(String(manifest.version ?? "")) || typeof manifest.sourceCommit !== "string" || !FULL_COMMIT.test(manifest.sourceCommit)) {
		throw new Error("Release manifest schema, version, or source provenance is invalid.");
	}
	if (!Array.isArray(manifest.assets) || !Array.isArray(manifest.targets)) throw new Error("Release manifest is missing assets or target statuses.");
	const assets = manifest.assets.map((asset) => record(asset, "Release asset"));
	const expected = new Map<string, string>();
	for (const asset of assets) {
		if (typeof asset.file !== "string" || !safeRelativePath(asset.file) || typeof asset.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(asset.sha256)
			|| !Number.isSafeInteger(asset.sizeBytes)) throw new Error("Release manifest contains an invalid asset record.");
		const filePath = await regularFileWithoutSymlinks(releaseDirectory, asset.file);
		const bytes = await readFile(filePath);
		if (bytes.byteLength !== asset.sizeBytes || sha256(bytes) !== asset.sha256) throw new Error(`Release asset size or SHA-256 mismatch: ${asset.file}`);
		if (expected.has(asset.file)) throw new Error(`Release manifest contains duplicate asset ${asset.file}.`);
		expected.set(asset.file, asset.sha256);
	}
	const sumsLines = (await readFile(await regularFileWithoutSymlinks(releaseDirectory, "SHA256SUMS"), "utf8")).trim().split(/\r?\n/);
	expected.set("manifest.json", sha256(await readFile(await regularFileWithoutSymlinks(releaseDirectory, "manifest.json"))));
	if (sumsLines.length !== expected.size) throw new Error("Release SHA256SUMS does not exactly cover the release manifest and assets.");
	const checksumFiles = new Set<string>();
	for (const line of sumsLines) {
		const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
		if (!match || checksumFiles.has(match[2]!) || expected.get(match[2]!) !== match[1]) throw new Error("Release SHA256SUMS does not match the release manifest.");
		checksumFiles.add(match[2]!);
	}
	if (checksumFiles.size !== expected.size) throw new Error("Release SHA256SUMS omits a release asset.");
	if (files.some((file) => file !== "manifest.json" && file !== "SHA256SUMS" && file !== "COMPLETE" && !expected.has(file))) {
		throw new Error("Release assembly contains undeclared files.");
	}
	const completePath = await regularFileWithoutSymlinks(releaseDirectory, "COMPLETE");
	checkCompleteMarker(await readFile(completePath, "utf8"), manifest.sourceCommit);
	const extension = record(manifest.extension, "Release extension record");
	const license = record(extension.licenseReadiness, "License readiness");
	const blockers: string[] = [];
	if (license.status !== "ready") blockers.push(...(Array.isArray(license.blockers) ? license.blockers.filter((item): item is string => typeof item === "string") : ["Authoritative license and notice readiness is unresolved."]));
	const application = record(manifest.application, "Release application identity");
	if (application.name !== "OpenAMX Desktop" || application.identifier !== "dev.openamx.desktop"
		|| extension.name !== "openamx-vscode" || extension.publisher !== "EngineersTools") throw new Error("Release application or extension publisher identity is invalid.");
	const extensionAssets = assets.filter((asset) => asset.role === "vscode-extension" || String(asset.file).toLowerCase().endsWith(".vsix"));
	if (extensionAssets.length !== 1) throw new Error("Release assembly must contain exactly one VSIX artifact.");
	const packageInspection = await inspectVsix(await readFile(path.join(releaseDirectory, String(extensionAssets[0]!.file))), rootDirectory);
	if (packageInspection.version !== manifest.version || packageInspection.name !== extension.name
		|| packageInspection.publisher !== extension.publisher || packageInspection.main !== "./dist/extension.js"
		|| packageInspection.platformNeutral !== extension.platformNeutral) throw new Error("Assembled VSIX metadata or contents do not match the release manifest.");
	if (packageInspection.licenseReadiness.status !== license.status) blockers.push("Release license-readiness metadata does not match the inspected VSIX and current authoritative files.");
	if (packageInspection.licenseReadiness.status !== "ready") blockers.push(...packageInspection.licenseReadiness.blockers);
	const source = currentSource(rootDirectory);
	if (source.version !== manifest.version || source.commit !== manifest.sourceCommit) blockers.push("Current clean source does not match the release version and full source commit.");
	const targets = manifest.targets.map((item) => {
		const target = record(item, "Target status");
		if (!TARGETS.includes(String(target.target)) || !["available", "missing", "unverified", "unsupported"].includes(String(target.status))) throw new Error("Release manifest contains an invalid target status.");
		return {
			target: target.target as string,
			status: target.status as ReleaseVerification["targets"][number]["status"],
			supportStatus: String(target.supportStatus ?? "unverified"),
			manualInstallLaunchStatus: String(target.manualInstallLaunchStatus ?? "not_performed"),
		};
	});
	return {
		version: manifest.version as string,
		sourceCommit: manifest.sourceCommit,
		integrity: "passed",
		licenseReadiness: blockers.length ? "blocked" : "ready",
		packageStatus: String(record(manifest.verification, "Verification status").buildPackage),
		manualInstallLaunchStatus: String(record(manifest.verification, "Verification status").extensionManualInstallLaunch),
		desktopManualInstallLaunchStatus: String(record(manifest.verification, "Verification status").desktopManualInstallLaunch),
		targets,
		blockers,
	};
}
