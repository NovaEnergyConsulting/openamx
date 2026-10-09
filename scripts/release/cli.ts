import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { access, copyFile, cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { MAX_UNCOMPRESSED_ARCHIVE_BYTES, inspectTarMembers } from "./archive";
import { spawnReleaseCommand } from "./process";
import { isStableVersion } from "../release";

export const CLI_PACKAGE_NAME = "@nova-energy/openamx";
const CLI_REPOSITORY_URL = "git+https://github.com/NovaEnergyConsulting/openamx.git";
const BUN_SHEBANG = "#!/usr/bin/env bun";
const REQUIRED_TARBALL_FILES = ["package/package.json", "package/dist/cli.js", "package/README.md", "package/LICENSE.md", "package/COMMERCIAL-LICENSE.md"];
const ALLOWED_TARBALL_FILE = /^package\/(?:package\.json|README\.md|LICENSE\.md|COMMERCIAL-LICENSE\.md|dist\/[A-Za-z0-9_./-]+\.js)$/;

interface RootManifest {
	version?: string;
	description?: string;
	dependencies?: Record<string, string>;
	engines?: Record<string, string>;
}

export interface CliPackageManifest {
	name: string;
	version: string;
	description?: string;
	type: "module";
	bin: { openamx: string };
	files: string[];
	dependencies: Record<string, string>;
	engines: { bun: string };
	license: string;
	repository: { type: "git"; url: string };
	publishConfig: { access: "public" };
}

export interface CliTarballInspection {
	name: string;
	version: string;
	files: Array<{ file: string; sizeBytes: number }>;
	sha256: string;
	sizeBytes: number;
}

export type NpmRunner = (args: string[], options: { cwd: string; interactive?: boolean }) => { status: number | null; stdout: string; stderr: string };

function sha256(contents: Uint8Array): string {
	return createHash("sha256").update(contents).digest("hex");
}

export function createCliPackageManifest(root: RootManifest): CliPackageManifest {
	if (!isStableVersion(root.version ?? "")) throw new Error("Root package version is not a stable release version.");
	return {
		name: CLI_PACKAGE_NAME,
		version: root.version!,
		description: root.description,
		type: "module",
		bin: { openamx: "./dist/cli.js" },
		files: ["dist", "COMMERCIAL-LICENSE.md"],
		dependencies: { ...(root.dependencies ?? {}) },
		engines: { bun: root.engines?.bun ?? ">=1.0.0" },
		license: "SEE LICENSE IN LICENSE.md",
		repository: { type: "git", url: CLI_REPOSITORY_URL },
		publishConfig: { access: "public" },
	};
}

export function inspectCliTarball(tarballBytes: Uint8Array, expected: { version: string }): CliTarballInspection {
	let tar: Buffer;
	try {
		tar = gunzipSync(tarballBytes, { maxOutputLength: MAX_UNCOMPRESSED_ARCHIVE_BYTES });
	} catch (cause) {
		throw new Error("CLI package tarball is not a valid gzip archive or exceeds the inspection size limit.", { cause });
	}
	const members = inspectTarMembers(tar);
	const files = [...members.keys()].sort();
	const unexpected = files.filter((file) => !ALLOWED_TARBALL_FILE.test(file) || /\.test\.js$/.test(file));
	if (unexpected.length) throw new Error(`CLI package contains undeclared files: ${unexpected.join(", ")}`);
	const missing = REQUIRED_TARBALL_FILES.filter((file) => !members.has(file));
	if (missing.length) throw new Error(`CLI package is missing required files: ${missing.join(", ")}`);
	const manifest = JSON.parse(members.get("package/package.json")!.toString("utf8")) as Partial<CliPackageManifest> & { scripts?: unknown; devDependencies?: unknown };
	if (manifest.name !== CLI_PACKAGE_NAME || manifest.version !== expected.version || manifest.bin?.openamx !== "./dist/cli.js" || manifest.type !== "module") {
		throw new Error("CLI package identity, version, type, or bin entry is invalid.");
	}
	if (manifest.scripts !== undefined || manifest.devDependencies !== undefined) throw new Error("CLI package must not declare lifecycle scripts or development dependencies.");
	const entry = members.get("package/dist/cli.js")!.toString("utf8");
	if (entry.split(/\r?\n/, 1)[0] !== BUN_SHEBANG) throw new Error(`CLI entry point must start with '${BUN_SHEBANG}'.`);
	return {
		name: manifest.name,
		version: manifest.version,
		files: files.map((file) => ({ file, sizeBytes: members.get(file)!.byteLength })),
		sha256: sha256(tarballBytes),
		sizeBytes: tarballBytes.byteLength,
	};
}

export function publishCliTarball(options: { tarballPath: string; version: string; publish: boolean; cwd: string; runNpm?: NpmRunner }): "dry-run" | "published" {
	const runNpm = options.runNpm ?? defaultNpmRunner;
	if (!options.publish) {
		const dryRun = runNpm(["publish", options.tarballPath, "--dry-run", "--access", "public"], { cwd: options.cwd, interactive: true });
		if (dryRun.status !== 0) throw new Error(`npm publish --dry-run failed with exit code ${dryRun.status ?? "unknown"}.`);
		return "dry-run";
	}
	if (runNpm(["whoami"], { cwd: options.cwd }).status !== 0) throw new Error("npm authentication is unavailable; run npm login with an account that can publish to the @nova-energy scope.");
	const existing = runNpm(["view", `${CLI_PACKAGE_NAME}@${options.version}`, "version"], { cwd: options.cwd });
	if (existing.status === 0 && existing.stdout.trim()) throw new Error(`${CLI_PACKAGE_NAME}@${options.version} is already published; npm versions are immutable.`);
	if (existing.status !== 0 && !/E404|404 Not Found/i.test(existing.stderr)) throw new Error("Could not confirm the version is unpublished on npm; check registry access and retry.");
	const result = runNpm(["publish", options.tarballPath, "--access", "public"], { cwd: options.cwd, interactive: true });
	if (result.status !== 0) throw new Error(`npm publish failed with exit code ${result.status ?? "unknown"}.`);
	return "published";
}

const defaultNpmRunner: NpmRunner = (args, options) => {
	const result = spawnReleaseCommand("npm", args, { cwd: options.cwd, encoding: "utf8", stdio: options.interactive ? "inherit" : "pipe" });
	if (result.error) throw result.error;
	return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
};

function run(command: string, args: string[], cwd: string, capture = false): string {
	const result = spawnReleaseCommand(command, args, { cwd, encoding: "utf8", stdio: capture ? "pipe" : "inherit" });
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(`${path.basename(command)} ${args[0] ?? ""} failed with exit code ${result.status ?? "unknown"}.${capture && result.stderr ? `\n${result.stderr.trim()}` : ""}`);
	return result.stdout ?? "";
}

async function smokeTestTarball(tarballPath: string, version: string, rootDirectory: string): Promise<string[]> {
	const directory = await mkdtemp(path.join(os.tmpdir(), "openamx-cli-smoke-"));
	try {
		await writeFile(path.join(directory, "package.json"), `${JSON.stringify({ name: "openamx-cli-smoke", private: true }, null, 2)}\n`);
		run(process.execPath, ["add", tarballPath], directory);
		await copyFile(path.join(rootDirectory, "examples", "hello-world.amx"), path.join(directory, "hello-world.amx"));
		// Windows shims are not shebang-driven, so run the entry point through Bun there.
		const invoke = (args: string[]) => process.platform === "win32"
			? run(process.execPath, [path.join(directory, "node_modules", ...CLI_PACKAGE_NAME.split("/"), "dist", "cli.js"), ...args], directory, true)
			: run(path.join(directory, "node_modules", ".bin", "openamx"), args, directory, true);
		const reported = /^openamx\/(\S+)/.exec(invoke(["--version"]).trim())?.[1];
		if (reported !== version) throw new Error(`Installed CLI reported version '${reported ?? ""}', expected ${version}.`);
		invoke(["run", "hello-world.amx"]);
		invoke(["render", "hello-world.amx", "--out", "hello-world.html"]);
		invoke(["export", "pdf", "hello-world.amx", "--out", "hello-world.pdf"]);
		invoke(["export", "docx", "hello-world.amx", "--out", "hello-world.docx"]);
		for (const output of ["hello-world.html", "hello-world.pdf", "hello-world.docx"]) {
			if (!(await readFile(path.join(directory, output))).byteLength) throw new Error(`Installed CLI produced an empty ${output}.`);
		}
		return ["--version", "run", "render", "export pdf", "export docx"];
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
}

async function readCleanSource(rootDirectory: string): Promise<{ sourceCommit: string; rootManifest: RootManifest; version: string }> {
	const status = execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: rootDirectory, encoding: "utf8" }).trim();
	if (status) throw new Error("Release packages require a clean committed source tree.");
	const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: rootDirectory, encoding: "utf8" }).trim();
	const rootManifest = JSON.parse(await readFile(path.join(rootDirectory, "package.json"), "utf8")) as RootManifest;
	if (!isStableVersion(rootManifest.version ?? "")) throw new Error("Root package version is not a stable release version.");
	return { sourceCommit, rootManifest, version: rootManifest.version! };
}

async function buildCliBundle(rootDirectory: string, acceptedDirectory: string, sourceCommit: string, rootManifest: RootManifest, version: string): Promise<void> {
	const stagingParent = path.join(rootDirectory, "releases", ".staging", version);
	await mkdir(stagingParent, { recursive: true });
	await mkdir(path.dirname(acceptedDirectory), { recursive: true });
	const attempt = await mkdtemp(path.join(stagingParent, "cli-"));
	const packageDirectory = path.join(attempt, "package");
	try {
		const tsc = path.join(rootDirectory, "node_modules", "typescript", "bin", "tsc");
		run(process.execPath, [tsc, "-p", path.join(rootDirectory, "tsconfig.json"), "--outDir", path.join(packageDirectory, "dist"), "--declaration", "false", "--declarationMap", "false", "--sourceMap", "false"], rootDirectory);
		for (const file of ["README.md", "LICENSE.md", "COMMERCIAL-LICENSE.md"]) await cp(path.join(rootDirectory, file), path.join(packageDirectory, file));
		await writeFile(path.join(packageDirectory, "package.json"), `${JSON.stringify(createCliPackageManifest(rootManifest), null, 2)}\n`, { flag: "wx" });
		const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", attempt], packageDirectory, true)) as Array<{ filename: string }>;
		if (packed.length !== 1 || path.basename(packed[0]!.filename) !== packed[0]!.filename) throw new Error("npm pack did not report exactly one tarball.");
		const tarballBytes = await readFile(path.join(attempt, packed[0]!.filename));
		const inspection = inspectCliTarball(tarballBytes, { version });
		const smokeChecks = await smokeTestTarball(path.join(attempt, packed[0]!.filename), version, rootDirectory);
		const artifactName = `nova-energy-openamx-${version}.tgz`;
		await mkdir(path.join(attempt, "artifacts"));
		await writeFile(path.join(attempt, "artifacts", artifactName), tarballBytes, { flag: "wx" });
		await rm(path.join(attempt, packed[0]!.filename), { force: true });
		await rm(packageDirectory, { recursive: true, force: true });
		const manifest = {
			schemaVersion: 1,
			kind: "cli-npm",
			version,
			sourceCommit,
			name: inspection.name,
			runtime: "bun",
			artifact: { file: `artifacts/${artifactName}`, sizeBytes: inspection.sizeBytes, sha256: inspection.sha256 },
		};
		const evidence = {
			schemaVersion: 1,
			buildPackageStatus: "passed",
			smokeTest: { status: "passed", runtime: `bun ${process.versions.bun}`, platform: `${process.platform}-${process.arch}`, checks: smokeChecks },
			npmPublication: "not_performed",
			npmVersion: run("npm", ["--version"], rootDirectory, true).trim(),
			package: inspection,
		};
		await writeFile(path.join(attempt, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
		await writeFile(path.join(attempt, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`, { flag: "wx" });
		await writeFile(path.join(attempt, "SHA256SUMS"), `${sha256(await readFile(path.join(attempt, "manifest.json")))}  manifest.json\n${sha256(await readFile(path.join(attempt, "evidence.json")))}  evidence.json\n${inspection.sha256}  artifacts/${artifactName}\n`, { flag: "wx" });
		await writeFile(path.join(attempt, "COMPLETE"), `${sourceCommit}\n`, { flag: "wx" });
		await rename(attempt, acceptedDirectory);
		console.log(`CLI bundle: ${path.relative(rootDirectory, acceptedDirectory)}`);
		console.log(`Artifact: ${artifactName} ${inspection.sizeBytes} bytes sha256:${inspection.sha256} (${inspection.files.length} files)`);
	} catch (error) {
		await rm(attempt, { recursive: true, force: true });
		throw error;
	}
}

async function readAcceptedTarball(acceptedDirectory: string, sourceCommit: string, version: string): Promise<string> {
	const complete = (await readFile(path.join(acceptedDirectory, "COMPLETE"), "utf8").catch(() => "")).trim();
	if (complete !== sourceCommit) throw new Error("The CLI bundle is incomplete or was built from a different commit; it cannot be published from this source.");
	const manifest = JSON.parse(await readFile(path.join(acceptedDirectory, "manifest.json"), "utf8")) as { kind?: string; version?: string; sourceCommit?: string; artifact?: { file?: string; sha256?: string } };
	if (manifest.kind !== "cli-npm" || manifest.version !== version || manifest.sourceCommit !== sourceCommit || !/^artifacts\/[A-Za-z0-9._-]+\.tgz$/.test(manifest.artifact?.file ?? "")) {
		throw new Error("The CLI bundle manifest does not match the current release source.");
	}
	const tarballPath = path.join(acceptedDirectory, manifest.artifact!.file!);
	const bytes = await readFile(tarballPath);
	if (sha256(bytes) !== manifest.artifact!.sha256) throw new Error("The CLI bundle tarball hash does not match its manifest.");
	inspectCliTarball(bytes, { version });
	return tarballPath;
}

export async function runCliRelease(rootDirectory = process.cwd(), options: { publish?: boolean } = {}): Promise<void> {
	const { sourceCommit, rootManifest, version } = await readCleanSource(rootDirectory);
	const acceptedDirectory = path.join(rootDirectory, "releases", version, "cli");
	const bundleExists = await access(acceptedDirectory).then(() => true, () => false);
	if (!bundleExists) {
		if (options.publish) throw new Error(`No CLI bundle exists for ${version}; run release:cli first and review its dry run before publishing.`);
		await buildCliBundle(rootDirectory, acceptedDirectory, sourceCommit, rootManifest, version);
	} else {
		console.log(`Reusing existing CLI bundle ${path.relative(rootDirectory, acceptedDirectory)}.`);
	}
	const tarballPath = await readAcceptedTarball(acceptedDirectory, sourceCommit, version);
	const outcome = publishCliTarball({ tarballPath, version, publish: options.publish === true, cwd: rootDirectory });
	console.log(outcome === "published"
		? `Published ${CLI_PACKAGE_NAME}@${version} to npm.`
		: `Dry run complete for ${CLI_PACKAGE_NAME}@${version}; nothing was uploaded. Re-run with --publish to upload.`);
}
