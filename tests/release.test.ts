import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { inspectRelease, isStableVersion, manifestPaths, mapNativeTarget, prepareVersion } from "../scripts/release";
import { binaryArchitecture, finalizeTargetBundle, findInstaller, installerFormat, runDesktopRelease, sanitizeBuildWarning, unsupportedInstallerArchiveMembers, verifyBuiltApp, verifyUpdateMetadata } from "../scripts/release/desktop";
import { appMetadata } from "../desktop-app/app-metadata";
import { localInstallInvocation } from "../vscode-extension/install-local.mjs";

const temporaryDirectories: string[] = [];

async function fixture(rootName = "openamx release fixture ") {
	const directory = await mkdtemp(path.join(os.tmpdir(), rootName));
	temporaryDirectories.push(directory);
	for (const [relativePath, name, version] of [
		["package.json", "openamx", "0.6.0"],
		["desktop-app/package.json", "openamx-desktop", "0.5.0"],
		["vscode-extension/package.json", "openamx-vscode", "0.4.0"],
	] as const) {
		const fullPath = path.join(directory, relativePath);
		await mkdir(path.dirname(fullPath), { recursive: true });
		await writeFile(fullPath, `${JSON.stringify({ name, version, private: true }, null, 2)}\n`);
	}
	return directory;
}

afterEach(async () => {
	await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("release version preparation", () => {
	test("accepts only explicit stable semantic versions", () => {
		for (const version of ["1.2.3", "0.0.1", "12.34.56"]) expect(isStableVersion(version)).toBe(true);
		for (const version of ["", "1", "1.2", "01.2.3", "1.2.3-rc.1", "1.2.3+build.4", "v1.2.3", "1.2.3\n"]) expect(isStableVersion(version)).toBe(false);
	});

	test("rejects invalid version before any source write", async () => {
		const directory = await fixture();
		await expect(prepareVersion(directory, "1.2.3-rc.1")).rejects.toThrow("stable semantic version");
		expect(await Promise.all(manifestPaths(directory).map((filePath) => readFile(filePath, "utf8")))).toEqual([
			'{\n  "name": "openamx",\n  "version": "0.6.0",\n  "private": true\n}\n',
			'{\n  "name": "openamx-desktop",\n  "version": "0.5.0",\n  "private": true\n}\n',
			'{\n  "name": "openamx-vscode",\n  "version": "0.4.0",\n  "private": true\n}\n',
		]);
	});

	test("rejects invalid source manifests before staging any write", async () => {
		const directory = await fixture();
		const rootManifest = path.join(directory, "package.json");
		const original = await readFile(rootManifest, "utf8");
		await writeFile(path.join(directory, "desktop-app/package.json"), "{ invalid json");
		await expect(prepareVersion(directory, "1.2.3")).rejects.toThrow("not valid JSON");
		expect(await readFile(rootManifest, "utf8")).toBe(original);
	});

	test("synchronizes the three manifests, then is idempotent", async () => {
		const directory = await fixture();
		expect(await prepareVersion(directory, "1.2.3")).toEqual({ changed: true, version: "1.2.3" });
		expect((await Promise.all(manifestPaths(directory).map((filePath) => readFile(filePath, "utf8")))).map((text) => JSON.parse(text).version)).toEqual(["1.2.3", "1.2.3", "1.2.3"]);
		expect(await prepareVersion(directory, "1.2.3")).toEqual({ changed: false, version: "1.2.3" });
	});

	test("public prepare command synchronizes manifests from a fixture path with spaces", async () => {
		const directory = await fixture("release command fixture with spaces ");
		const scriptPath = path.resolve(import.meta.dir, "../scripts/release.ts");
		const result = spawnSync("bun", ["run", scriptPath, "prepare", "1.2.3"], { cwd: directory, encoding: "utf8" });
		expect(result.status).toBe(0);
		expect(result.stdout).toContain("Prepared version 1.2.3");
		expect((await Promise.all(manifestPaths(directory).map((filePath) => readFile(filePath, "utf8")))).map((text) => JSON.parse(text).version)).toEqual(["1.2.3", "1.2.3", "1.2.3"]);
	});

	test("rolls back all manifests after a coordinated rename failure", async () => {
		const directory = await fixture();
		const paths = manifestPaths(directory);
		const originals = await Promise.all(paths.map((filePath) => readFile(filePath, "utf8")));
		let injected = false;
		const operations = {
			readFile,
			writeFile,
			rm,
			rename: async (oldPath: string, newPath: string) => {
				if (!injected && newPath === paths[1] && oldPath.endsWith(".tmp")) {
					injected = true;
					throw new Error("injected write failure");
				}
				return rename(oldPath, newPath);
			},
		};
		await expect(prepareVersion(directory, "1.2.3", operations)).rejects.toThrow("injected write failure");
		expect(await Promise.all(paths.map((filePath) => readFile(filePath, "utf8")))).toEqual(originals);
	});
});

describe("release preflight", () => {
	test("maps all requested targets to native platform names", () => {
		const expected = [
			["linux", "x64", "linux"], ["linux", "arm64", "linux"],
			["win32", "x64", "win"], ["win32", "arm64", "win"],
			["darwin", "x64", "mac"], ["darwin", "arm64", "mac"],
		] as const;
		for (const [platform, architecture, nativeOs] of expected) {
			expect(mapNativeTarget(platform, architecture)?.nativeOs).toBe(nativeOs);
			expect(mapNativeTarget(platform, architecture)?.nativeArchitecture).toBe(architecture);
		}
	});

	test("derives Electrobun app version from desktop package metadata", () => {
		expect(appMetadata).toEqual({ name: "OpenAMX Desktop", identifier: "dev.openamx.desktop", version: "0.6.0" });
	});

	test("keeps unavailable host tools separate from unsupported host matrices", async () => {
		const directory = await fixture();
		const result = await inspectRelease(directory, {
			platform: "freebsd",
			architecture: "x64",
			findExecutable: () => null,
		});
		expect(result.host.status).toBe("unsupported");
		expect(result.targets.every((target) => target.status === "unverified")).toBe(true);
		expect(result.prerequisites.map((tool) => tool.status)).toEqual(["unavailable", "unavailable", "unavailable", "unavailable"]);
		expect(result.prerequisites[0].action).toContain("Install bun");
	});

	test("reports inconsistent versions and invokes probes with paths containing spaces", async () => {
		const directory = await fixture("release path with spaces ");
		const invocations: Array<{ executable: string; args: string[] }> = [];
		const result = await inspectRelease(directory, {
			platform: "linux",
			architecture: "x64",
			findExecutable: (name) => `/tools with spaces/${name}`,
			probe: (executable) => {
				invocations.push({ executable, args: ["--version"] });
				return { status: 0, stdout: "test-version\n", stderr: "" };
			},
		});
		expect(result.versions.status).toBe("inconsistent");
		expect(result.host.status).toBe("available");
		expect(result.targets.find((target) => target.os === "linux" && target.architecture === "x64")?.status).toBe("unverified");
		expect(invocations).toEqual(["bun", "hutch", "node", "vsce"].map((name) => ({ executable: `/tools with spaces/${name}`, args: ["--version"] })));
	});

	test("preflight leaves all source manifests unchanged", async () => {
		const directory = await fixture();
		const paths = manifestPaths(directory);
		const originals = await Promise.all(paths.map((filePath) => readFile(filePath, "utf8")));
		await inspectRelease(directory, {
			platform: "linux",
			architecture: "x64",
			findExecutable: () => null,
		});
		expect(await Promise.all(paths.map((filePath) => readFile(filePath, "utf8")))).toEqual(originals);
	});

	test("reports only the evidence-backed Linux x64 installer route available", async () => {
		const directory = await fixture();
		const probeOptions = {
			findExecutable: (name: string) => `/tools/${name}`,
			probe: () => ({ status: 0, stdout: "test-version", stderr: "" }),
		};
		const linux = await inspectRelease(directory, { ...probeOptions, platform: "linux", architecture: "x64" });
		const windows = await inspectRelease(directory, { ...probeOptions, platform: "win32", architecture: "x64" });
		expect(linux.packaging.status).toBe("available");
		expect(linux.packaging.reason).toContain("native Linux x64 .tar.gz Setup installer");
		expect(windows.packaging.status).toBe("unverified");
	});

	test("uses Windows path joining semantics", () => {
		expect(manifestPaths("C:\\workspace with spaces\\openamx", path.win32)).toEqual([
			"C:\\workspace with spaces\\openamx\\package.json",
			"C:\\workspace with spaces\\openamx\\desktop-app\\package.json",
			"C:\\workspace with spaces\\openamx\\vscode-extension\\package.json",
		]);
	});

	test("quotes the versioned VSIX path for Windows command-line installation", () => {
		expect(localInstallInvocation({ name: "openamx-vscode", version: "1.2.3" }, "C:\\work space\\extension", "win32")).toEqual({
			command: "cmd.exe",
			args: ["/d", "/s", "/c", '"code --install-extension "C:\\work space\\extension\\openamx-vscode-1.2.3.vsix" --force"'],
		});
		expect(localInstallInvocation({ name: "openamx-vscode", version: "1.2.3" }, "/work space/extension", "linux")).toEqual({
			command: "code",
			args: ["--install-extension", "/work space/extension/openamx-vscode-1.2.3.vsix", "--force"],
		});
	});
});

describe("desktop release packaging", () => {
	const x64ElfRuntime = () => {
		const header = Buffer.alloc(20);
		header.set([0x7f, 0x45, 0x4c, 0x46], 0);
		header[18] = 62;
		return header;
	};
	const addSharpRuntime = async (resourcesDirectory: string) => {
		const sharpDirectory = path.join(resourcesDirectory, "app/bun/node_modules/@img");
		const nativeBinding = path.join(sharpDirectory, "sharp-linux-x64/lib/sharp-linux-x64-0.35.5.node");
		const libvips = path.join(sharpDirectory, "sharp-libvips-linux-x64/lib/libvips-cpp.so.8.18.7");
		await mkdir(path.dirname(nativeBinding), { recursive: true });
		await mkdir(path.dirname(libvips), { recursive: true });
		await writeFile(nativeBinding, "native binding");
		await writeFile(libvips, "libvips");
	};

	test("selects the native installer format documented by Electrobun", () => {
		expect(installerFormat("linux")).toEqual({ extension: ".tar.gz", format: "tar.gz" });
		expect(installerFormat("win")).toEqual({ extension: ".zip", format: "zip" });
		expect(installerFormat("mac")).toEqual({ extension: ".dmg", format: "dmg" });
	});

	test("redacts Unix and Windows user paths from distributable build warnings", () => {
		expect(sanitizeBuildWarning("warning in /home/alice/private/build.ts")).toBe("warning in <path>");
		expect(sanitizeBuildWarning("warning in C:\\Users\\Alice Smith\\source.ts details")).toBe("warning in <path>");
	});

	test("rejects app payload member paths that require unsupported GNU long-name records", () => {
		expect(unsupportedInstallerArchiveMembers(["OpenAMXDesktop/Resources/app/bun/jobWorker.js"])).toEqual([]);
		expect(unsupportedInstallerArchiveMembers(["OpenAMXDesktop/Resources/app/bun/node_modules/@img/sharp-libvips-linux-x64/lib/glib-2.0/include/glibconfig.h"])).toHaveLength(1);
	});

	test("detects x64 and arm64 from ELF, PE, and Mach-O headers", () => {
		const elf = (machine: number) => {
			const header = Buffer.alloc(20);
			header.set([0x7f, 0x45, 0x4c, 0x46], 0);
			header[18] = machine & 0xff;
			header[19] = machine >> 8;
			return header;
		};
		const pe = (machine: number) => {
			const header = Buffer.alloc(70);
			header.set([0x4d, 0x5a], 0);
			header[0x3c] = 64;
			header.set([machine & 0xff, machine >> 8], 68);
			return header;
		};
		const macho = (cpuType: number) => {
			const header = Buffer.alloc(8);
			header.set([0xcf, 0xfa, 0xed, 0xfe], 0);
			for (let index = 0; index < 4; index++) header[4 + index] = (cpuType >>> (index * 8)) & 0xff;
			return header;
		};
		expect(binaryArchitecture(elf(62))).toBe("x64");
		expect(binaryArchitecture(elf(183))).toBe("arm64");
		expect(binaryArchitecture(pe(0x8664))).toBe("x64");
		expect(binaryArchitecture(pe(0xaa64))).toBe("arm64");
		expect(binaryArchitecture(macho(0x01000007))).toBe("x64");
		expect(binaryArchitecture(macho(0x0100000c))).toBe("arm64");
	});

	test("inspects package identity, version, runtime, worker, and web resources", async () => {
		const directory = path.join(await fixture(), "stable-linux-x64");
		const resources = path.join(directory, "OpenAMXDesktop/Resources");
		const application = path.join(resources, "app");
		for (const relativePath of [
			"bun/jobWorker.js",
			"views/mainview/index.html",
			"views/mainview/assets/index.js",
		]) {
			const filePath = path.join(application, relativePath);
			await mkdir(path.dirname(filePath), { recursive: true });
			await writeFile(filePath, "test resource");
		}
		const metadata = [
			["metadata.json", { name: "OpenAMX Desktop", identifier: "dev.openamx.desktop", hash: "abc" }],
			["version.json", { version: "0.6.0", hash: "abc", displayName: "OpenAMX Desktop" }],
			["build.json", { mainProcess: "bun", electrobunVersion: "2.0.1", runtimeVersions: { bun: "1.4.0" } }],
		] as const;
		for (const [fileName, content] of metadata) await writeFile(path.join(resources, fileName), JSON.stringify(content));
		await addSharpRuntime(resources);
		const runtime = path.join(directory, "OpenAMXDesktop/bin/bun");
		await mkdir(path.dirname(runtime), { recursive: true });
		await writeFile(runtime, x64ElfRuntime());
		for (const library of ["libNativeWrapper.so", "libElectrobunCore.so"]) await writeFile(path.join(directory, "OpenAMXDesktop/bin", library), "native library");
		for (const binary of ["launcher", "libasar.so", "zig-zstd", "bspatch"]) await writeFile(path.join(directory, "OpenAMXDesktop/bin", binary), "runtime support");
		await expect(verifyBuiltApp(directory, {
			name: "OpenAMX Desktop",
			identifier: "dev.openamx.desktop",
			version: "0.6.0",
			architecture: "x64",
			nativeOs: "linux",
			electrobunVersion: "2.0.1",
		})).resolves.toEqual({ hash: "abc", runtimeVersions: { bun: "1.4.0" } });
	});

	test("rejects missing worker resources and mismatched embedded versions", async () => {
		const directory = path.join(await fixture(), "stable-linux-x64");
		const resources = path.join(directory, "OpenAMXDesktop/Resources");
		await mkdir(resources, { recursive: true });
		for (const [fileName, content] of [
			["metadata.json", { name: "OpenAMX Desktop", identifier: "dev.openamx.desktop", hash: "abc" }],
			["version.json", { version: "0.5.0", displayName: "OpenAMX Desktop" }],
			["build.json", { mainProcess: "bun", electrobunVersion: "2.0.1", runtimeVersions: { bun: "1.4.0" } }],
		] as const) await writeFile(path.join(resources, fileName), JSON.stringify(content));
		await addSharpRuntime(resources);
		const app = path.join(resources, "app");
		await mkdir(path.join(app, "views/mainview/assets"), { recursive: true });
		await writeFile(path.join(app, "views/mainview/index.html"), "<html>");
		await writeFile(path.join(app, "views/mainview/assets/index.js"), "asset");
		const runtime = path.join(directory, "OpenAMXDesktop/bin/bun");
		await mkdir(path.dirname(runtime), { recursive: true });
		await writeFile(runtime, x64ElfRuntime());
		for (const library of ["libNativeWrapper.so", "libElectrobunCore.so"]) await writeFile(path.join(directory, "OpenAMXDesktop/bin", library), "native library");
		for (const binary of ["launcher", "libasar.so", "zig-zstd", "bspatch"]) await writeFile(path.join(directory, "OpenAMXDesktop/bin", binary), "runtime support");
		const expected = { name: "OpenAMX Desktop", identifier: "dev.openamx.desktop", version: "0.6.0", architecture: "x64", nativeOs: "linux" as const, electrobunVersion: "2.0.1" };
		await expect(verifyBuiltApp(directory, expected)).rejects.toThrow("jobWorker.js");
		await mkdir(path.join(app, "bun"), { recursive: true });
		await writeFile(path.join(app, "bun/jobWorker.js"), "worker");
		await expect(verifyBuiltApp(directory, expected)).rejects.toThrow("unexpected version");
	});

	test("rejects dirty release source before reading package inputs", async () => {
		const directory = await fixture();
		execFileSync("git", ["init", "-q"], { cwd: directory });
		await writeFile(path.join(directory, "uncommitted.txt"), "not committed");
		await expect(runDesktopRelease(directory)).rejects.toThrow("clean committed source tree");
	});

	test("rejects inconsistent versions on a clean committed source tree", async () => {
		const directory = await fixture();
		execFileSync("git", ["init", "-q"], { cwd: directory });
		execFileSync("git", ["config", "user.email", "release-test@example.invalid"], { cwd: directory });
		execFileSync("git", ["config", "user.name", "Release Test"], { cwd: directory });
		execFileSync("git", ["add", "-A"], { cwd: directory });
		execFileSync("git", ["commit", "-qm", "fixture"], { cwd: directory });
		await expect(runDesktopRelease(directory)).rejects.toThrow("versions or desktop application identity are inconsistent");
		expect(await readdir(path.join(directory, "releases")).catch(() => [])).toEqual([]);
	});

	test("verifies Hutch sidecar target, version, payload hash, and safe app archive", async () => {
		const directory = await fixture();
		const archiveName = "stable-linux-x64-payload.tar.zst";
		const artifactDirectory = path.join(directory, "artifacts");
		await mkdir(artifactDirectory, { recursive: true });
		await writeFile(path.join(artifactDirectory, archiveName), "payload");
		await writeFile(path.join(artifactDirectory, "stable-linux-x64-update.json"), JSON.stringify({
			version: "0.6.0", platform: "linux", arch: "x64", hash: "abc123", artifact: { file: archiveName },
		}));
		await expect(verifyUpdateMetadata(artifactDirectory, "linux", "x64", "0.6.0", "abc123")).resolves.toEqual({
			fileName: "stable-linux-x64-update.json", appArchive: archiveName,
		});
		await expect(verifyUpdateMetadata(artifactDirectory, "linux", "x64", "0.6.0", "wrong-hash")).rejects.toThrow("does not match");
	});

	test("rejects legacy spike installers instead of treating them as current artifacts", async () => {
		const directory = await fixture();
		const artifactDirectory = path.join(directory, "artifacts");
		await mkdir(artifactDirectory, { recursive: true });
		await writeFile(path.join(artifactDirectory, "win-x64-OpenAMXDesktop-Spike-Setup.zip"), "stale spike");
		await expect(findInstaller(artifactDirectory, "win", "x64")).rejects.toThrow("legacy spike/proof");
	});

	test("writes a checksummed complete bundle and refuses an accepted destination conflict", async () => {
		const directory = await fixture();
		const bundle = path.join(directory, "staging/bundle");
		const accepted = path.join(directory, "releases/0.6.0/linux-x64");
		const artifacts = path.join(bundle, "artifacts");
		await mkdir(artifacts, { recursive: true });
		await writeFile(path.join(artifacts, "installer.tar.gz"), "installer bytes");
		await finalizeTargetBundle(bundle, accepted, "deadbeef", { version: "0.6.0" }, { build: "passed" }, [{ file: "artifacts/installer.tar.gz" }]);
		const checksumLines = (await readFile(path.join(accepted, "SHA256SUMS"), "utf8")).trim().split("\n");
		expect(await readFile(path.join(accepted, "COMPLETE"), "utf8")).toBe("deadbeef\n");
		expect(checksumLines).toHaveLength(3);
		for (const line of checksumLines) {
			const [expectedHash, file] = line.split(/\s+/, 2);
			const actualHash = createHash("sha256").update(await readFile(path.join(accepted, file!))).digest("hex");
			expect(actualHash).toBe(expectedHash);
		}
		await expect(finalizeTargetBundle(bundle, accepted, "deadbeef", {}, {}, [])).rejects.toThrow();
	});
});