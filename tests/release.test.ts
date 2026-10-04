import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { execFileSync, spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { inspectRelease, isStableVersion, manifestPaths, mapNativeTarget, prepareVersion } from "../scripts/release";
import { binaryArchitecture, finalizeTargetBundle, findInstaller, installerFormat, runDesktopRelease, sanitizeBuildWarning, unsupportedInstallerArchiveMembers, verifyBuiltApp, verifyUpdateMetadata } from "../scripts/release/desktop";
import { appMetadata } from "../desktop-app/app-metadata";
import { localInstallInvocation } from "../vscode-extension/install-local.mjs";
import JSZip from "jszip";
import { inspectVsix, inspectLicenseReadiness } from "../scripts/release/extension";
import { collectRelease, verifyRelease } from "../scripts/release/assembly";
import type { ReleaseVerification } from "../scripts/release/assembly";
import { createGitHubReleaseClient, publishRelease, type GitHubReleaseClient } from "../scripts/release/publish";
import { spawnReleaseCommand } from "../scripts/release/process";

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
		const result = spawnSync(process.execPath, ["run", scriptPath, "prepare", "1.2.3"], { cwd: directory, encoding: "utf8" });
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
	test("release commands preserve native arguments and exit codes", async () => {
		const directory = await fixture();
		const args = ["path with spaces", "path & (parentheses)", 'embedded "quotes"'];
		const result = spawnReleaseCommand(process.execPath, ["-e", "console.log(JSON.stringify(process.argv.slice(1))); process.exit(7)", ...args], { cwd: directory, encoding: "utf8" });
		expect(result.error).toBeUndefined();
		expect(result.status).toBe(7);
		expect(JSON.parse(result.stdout)).toEqual(args);
	});

	test.skipIf(process.platform !== "win32")("release commands preserve Windows shim arguments and exit codes", async () => {
		const directory = await fixture("release command & (spaces) ");
		const executable = path.join(directory, "tool.cmd");
		await writeFile(executable, "@echo off\r\necho %1\r\necho %2\r\nexit /b 7\r\n");
		const args = [path.join(directory, "output file.vsix"), ""];
		const result = spawnReleaseCommand(executable, args, { cwd: directory, encoding: "utf8" });
		expect(result.error).toBeUndefined();
		expect(result.status).toBe(7);
		expect(result.stdout.trim().split(/\r?\n/)).toEqual(args.map((argument) => `"${argument}"`));
	});

	test("runs native prerequisite executables from paths containing spaces", async () => {
		const directory = await fixture("release executable path with spaces ");
		const executable = path.join(directory, process.platform === "win32" ? "tool.exe" : "tool");
		await cp(process.execPath, executable);
		const result = await inspectRelease(directory, { findExecutable: () => executable });
		expect(result.prerequisites.map((tool) => tool.status)).toEqual(["available", "available", "available", "available"]);
		expect(result.prerequisites.every((tool) => tool.version === Bun.version)).toBe(true);
	});

	test.skipIf(process.platform !== "win32")("runs Windows prerequisite batch shims from paths containing spaces", async () => {
		const directory = await fixture("release shim path with spaces ");
		for (const extension of ["cmd", "bat"]) {
			const executable = path.join(directory, `tool.${extension}`);
			await writeFile(executable, "@echo off\r\nif not \"%~1\"==\"--version\" exit /b 2\r\necho test-version\r\n");
			const result = await inspectRelease(directory, { findExecutable: () => executable });
			expect(result.prerequisites.map((tool) => tool.status)).toEqual(["available", "available", "available", "available"]);
			expect(result.prerequisites.every((tool) => tool.version === "test-version")).toBe(true);
		}
	});

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

	test("derives Electrobun app version from desktop package metadata", async () => {
		const desktopManifest = JSON.parse(await readFile(path.resolve(import.meta.dir, "../desktop-app/package.json"), "utf8")) as { version: string };
		expect(appMetadata).toEqual({ name: "OpenAMX Desktop", identifier: "dev.openamx.desktop", version: desktopManifest.version });
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

	test.each(["linux", "win"] as const)("inspects %s package identity, version, runtime, worker, and web resources", async (nativeOs) => {
		const directory = path.join(await fixture(), `stable-${nativeOs}-x64`);
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
		if (nativeOs === "win") {
			const sharpLibrary = path.join(application, "bun/node_modules/@img/sharp-win32-x64/lib");
			await mkdir(sharpLibrary, { recursive: true });
			await writeFile(path.join(sharpLibrary, "sharp-win32-x64-0.35.5.node"), "native binding");
			await writeFile(path.join(sharpLibrary, "libvips-42.dll"), "libvips");
			await writeFile(path.join(sharpLibrary, "libvips-cpp-8.18.7.dll"), "libvips C++");
		} else {
			await addSharpRuntime(resources);
		}
		const expected = {
			name: "OpenAMX Desktop",
			identifier: "dev.openamx.desktop",
			version: "0.6.0",
			architecture: "x64",
			nativeOs,
			electrobunVersion: "2.0.1",
		};
		await expect(verifyBuiltApp(directory, expected)).rejects.toThrow("Roboto-Regular.ttf");
		const pdfFontsDirectory = path.join(application, "bun/pdfmake-fonts");
		await mkdir(pdfFontsDirectory, { recursive: true });
		for (const font of ["Roboto-Regular.ttf", "Roboto-Medium.ttf", "Roboto-Italic.ttf", "Roboto-MediumItalic.ttf"]) {
			await writeFile(path.join(pdfFontsDirectory, font), "pdf font fixture");
		}
		const runtime = path.join(directory, `OpenAMXDesktop/bin/bun${nativeOs === "win" ? ".exe" : ""}`);
		await mkdir(path.dirname(runtime), { recursive: true });
		const runtimeHeader = nativeOs === "win" ? Buffer.alloc(70) : x64ElfRuntime();
		if (nativeOs === "win") {
			runtimeHeader.set([0x4d, 0x5a], 0);
			runtimeHeader[0x3c] = 64;
			runtimeHeader.set([0x64, 0x86], 68);
		}
		await writeFile(runtime, runtimeHeader);
		const supportFiles = nativeOs === "win"
			? ["NativeWrapper.dll", "ElectrobunCore.dll", "asar.dll", "launcher.exe", "zig-zstd.exe", "bspatch.exe"]
			: ["libNativeWrapper.so", "libElectrobunCore.so", "libasar.so", "launcher", "zig-zstd", "bspatch"];
		for (const binary of supportFiles) await writeFile(path.join(directory, "OpenAMXDesktop/bin", binary), "runtime support");
		await expect(verifyBuiltApp(directory, expected)).resolves.toEqual({ hash: "abc", runtimeVersions: { bun: "1.4.0" } });
		if (nativeOs === "win") {
			const sharpLibrary = path.join(application, "bun/node_modules/@img/sharp-win32-x64/lib");
			await rm(path.join(sharpLibrary, "libvips-42.dll"));
			await rm(path.join(sharpLibrary, "libvips-cpp-8.18.7.dll"));
			await writeFile(path.join(sharpLibrary, "unrelated.dll"), "not libvips");
			await expect(verifyBuiltApp(directory, expected)).rejects.toThrow("native sharp runtime for win32-x64");
		}
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
		const fontsDirectory = path.join(app, "bun/pdfmake-fonts");
		await mkdir(fontsDirectory, { recursive: true });
		for (const font of ["Roboto-Regular.ttf", "Roboto-Medium.ttf", "Roboto-Italic.ttf", "Roboto-MediumItalic.ttf"]) {
			await writeFile(path.join(fontsDirectory, font), "font fixture");
		}
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

describe("VS Code extension release packaging", () => {
	test("inspects package identity, runtime assets, archive hash, and platform-neutral contents", async () => {
		const directory = await fixture();
		await writeFile(path.join(directory, "vscode-extension/package.json"), JSON.stringify({
			name: "openamx-vscode", version: "0.6.0", publisher: "EngineersTools", main: "./dist/extension.js",
		}));
		const zip = new JSZip();
		for (const file of ["[Content_Types].xml", "extension.vsixmanifest", "extension/LICENSE.md", "extension/amx.tmGrammar.json", "extension/language-configuration.json", "extension/readme.md", "extension/dist/extension.js"]) zip.file(file, "fixture");
		zip.file("extension/package.json", JSON.stringify({ name: "openamx-vscode", version: "0.6.0", publisher: "EngineersTools", main: "./dist/extension.js" }));
		const bytes = await zip.generateAsync({ type: "uint8array" });
		const inspection = await inspectVsix(bytes, directory);
		expect(inspection).toMatchObject({
			version: "0.6.0", publisher: "EngineersTools", main: "./dist/extension.js",
			platformNeutral: true, licenseReadiness: { status: "blocked" },
		});
		expect(inspection.files.map(({ file }) => file)).toContain("extension/amx.tmGrammar.json");
		expect(inspection.sha256).toHaveLength(64);
	});

	test("rejects unsafe archive paths and missing required runtime assets", async () => {
		const directory = await fixture();
		const zip = new JSZip();
		zip.file("abcdef", "unsafe");
		const bytes = Buffer.from(await zip.generateAsync({ type: "uint8array" }));
		const originalName = Buffer.from("abcdef");
		const traversalName = Buffer.from("../abc");
		let offset = 0;
		while ((offset = bytes.indexOf(originalName, offset)) >= 0) {
			traversalName.copy(bytes, offset);
			offset += traversalName.length;
		}
		await expect(inspectVsix(bytes, directory)).rejects.toThrow("unsafe archive path");
	});

	test("does not treat the supplied license overview as authoritative full terms", async () => {
		const directory = await fixture();
		await writeFile(path.join(directory, "LICENSE.md"), "See the absent LICENSE file for full terms.");
		expect(inspectLicenseReadiness(directory)).toMatchObject({ status: "blocked" });
	});

	test("requires owner confirmation of license reference and notice requirements", async () => {
		const directory = await fixture();
		await writeFile(path.join(directory, "LICENSE.md"), "Fixture AGPL terms; not production legal text.");
		await writeFile(path.join(directory, "NOTICE"), "Fixture notices; not production notice text.");
		const packageEvidence = { packageLicense: "SEE LICENSE IN LICENSE.md", packagedFiles: ["extension/LICENSE.md", "extension/NOTICE"] };
		expect(inspectLicenseReadiness(directory, packageEvidence)).toMatchObject({ status: "blocked" });
		expect(inspectLicenseReadiness(directory, { ...packageEvidence, licenseReferenceConfirmed: true, noticeRequirementsConfirmed: true })).toMatchObject({ status: "ready" });
	});
});

describe("release collection and verification", () => {
	const bundleHash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
	function tarGzip(members: Array<{ name: string; type?: string; data?: string; linkName?: string }>): Buffer {
		const records: Buffer[] = [];
		for (const member of members) {
			const body = Buffer.from(member.data ?? "");
			const header = Buffer.alloc(512);
			header.write(member.name, 0, 100, "utf8");
			header.write("0000644\0", 100, 8, "ascii");
			header.write("0000000\0", 108, 8, "ascii");
			header.write("0000000\0", 116, 8, "ascii");
			header.write(`${body.byteLength.toString(8).padStart(11, "0")}\0`, 124, 12, "ascii");
			header.write("00000000000\0", 136, 12, "ascii");
			header.fill(0x20, 148, 156);
			header[156] = (member.type ?? "0").charCodeAt(0);
			if (member.linkName) header.write(member.linkName, 157, 100, "utf8");
			header.write("ustar\0", 257, 6, "ascii");
			header.write("00", 263, 2, "ascii");
			let checksum = 0;
			for (const byte of header) checksum += byte;
			header.write(`${checksum.toString(8).padStart(6, "0")}\0 `, 148, 8, "ascii");
			records.push(header);
			if (body.length) {
				records.push(body);
				const padding = (512 - body.length % 512) % 512;
				if (padding) records.push(Buffer.alloc(padding));
			}
		}
		records.push(Buffer.alloc(1024));
		return gzipSync(Buffer.concat(records));
	}
	async function committedReleaseFixture(version = "0.6.0") {
		const directory = await fixture();
		await writeFile(path.join(directory, "LICENSE.md"), "Fixture license text; not production terms.");
		const extensionManifestPath = path.join(directory, "vscode-extension/package.json");
		const extensionManifest = JSON.parse(await readFile(extensionManifestPath, "utf8"));
		extensionManifest.publisher = "EngineersTools";
		extensionManifest.main = "./dist/extension.js";
		extensionManifest.license = "SEE LICENSE IN LICENSE.md";
		await writeFile(extensionManifestPath, JSON.stringify(extensionManifest, null, 2));
		await prepareVersion(directory, version);
		await writeFile(path.join(directory, ".gitignore"), "/releases/\n");
		execFileSync("git", ["init", "-q"], { cwd: directory });
		execFileSync("git", ["config", "user.email", "release-test@example.invalid"], { cwd: directory });
		execFileSync("git", ["config", "user.name", "Release Test"], { cwd: directory });
		execFileSync("git", ["add", "-A"], { cwd: directory });
		execFileSync("git", ["commit", "-qm", "fixture"], { cwd: directory });
		const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: directory, encoding: "utf8" }).trim();
		const bundleRoot = await mkdtemp(path.join(os.tmpdir(), "openamx-transfer-fixtures-"));
		temporaryDirectories.push(bundleRoot);
		return { directory, sourceCommit, bundleRoot };
	}
	async function writeBundle(directory: string, kind: "desktop" | "extension", sourceCommit: string, target = "linux-x64", installerArchive = tarGzip([{ name: "installer", data: "desktop payload" }]), version = "0.6.0") {
		const artifactsDirectory = path.join(directory, "artifacts");
		await mkdir(artifactsDirectory, { recursive: true });
		const artifactFile = kind === "desktop" ? `artifacts/OpenAMX-${target}.tar.gz` : `artifacts/openamx-vscode-${version}.vsix`;
		let artifactBytes = installerArchive;
		if (kind === "extension") {
			const zip = new JSZip();
			for (const file of ["[Content_Types].xml", "extension.vsixmanifest", "extension/LICENSE.md", "extension/amx.tmGrammar.json", "extension/language-configuration.json", "extension/readme.md", "extension/dist/extension.js"]) zip.file(file, "fixture");
			zip.file("extension/package.json", JSON.stringify({ name: "openamx-vscode", version, publisher: "EngineersTools", main: "./dist/extension.js", license: "SEE LICENSE IN LICENSE.md" }));
			artifactBytes = Buffer.from(await zip.generateAsync({ type: "uint8array" }));
		}
		await writeFile(path.join(directory, artifactFile), artifactBytes);
		const artifact = { file: artifactFile, sizeBytes: artifactBytes.byteLength, sha256: bundleHash(artifactBytes), role: kind === "desktop" ? "installer" : undefined };
		const manifest = kind === "desktop" ? {
			schemaVersion: 1, product: "OpenAMX Desktop", version, sourceCommit,
			target: { os: target.split("-")[0], architecture: target.split("-")[1], status: "available" },
			application: { name: "OpenAMX Desktop", identifier: "dev.openamx.desktop" }, installerFormat: "tar.gz", artifacts: [artifact],
		} : {
			schemaVersion: 1, kind: "vscode-extension", version, sourceCommit,
			name: "openamx-vscode", publisher: "EngineersTools", main: "./dist/extension.js", platformNeutral: true,
			licenseReadiness: { status: "blocked", blockers: ["fixture license blocker"] }, artifact,
		};
		const evidence = { schemaVersion: 1, buildPackageStatus: "passed", manualInstallLaunchStatus: "not_performed" };
		await writeFile(path.join(directory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
		await writeFile(path.join(directory, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
		const sums = ["manifest.json", "evidence.json", artifactFile].map((file) => `${bundleHash(requireBuffer(path.join(directory, file)))}  ${file}`);
		await writeFile(path.join(directory, "SHA256SUMS"), `${sums.join("\n")}\n`);
		await writeFile(path.join(directory, "COMPLETE"), `${sourceCommit}\n`);
		return directory;
	}

	test("collects matching bundles immutably and verifies without rewriting evidence", async () => {
		const { directory, sourceCommit, bundleRoot } = await committedReleaseFixture();
		const desktop = await writeBundle(path.join(bundleRoot, "linux-x64"), "desktop", sourceCommit);
		const extension = await writeBundle(path.join(bundleRoot, "extension"), "extension", sourceCommit);
		const collected = await collectRelease(directory, [desktop, extension]);
		const manifestBefore = await readFile(path.join(collected, "manifest.json"), "utf8");
		const result = await verifyRelease(directory, collected);
		expect(result).toMatchObject({ version: "0.6.0", sourceCommit, integrity: "passed", licenseReadiness: "blocked" });
		expect(result.targets.find(({ target }) => target === "linux-x64")?.status).toBe("available");
		expect(result.targets.find(({ target }) => target === "windows-x64")?.status).toBe("missing");
		expect(await readFile(path.join(collected, "manifest.json"), "utf8")).toBe(manifestBefore);
		expect((await readFile(path.join(collected, "targets/linux-x64/artifacts/OpenAMX-linux-x64.tar.gz"))).subarray(0, 2)).toEqual(Buffer.from([0x1f, 0x8b]));
		await expect(publishRelease({ rootDirectory: directory, releaseDirectory: collected, allowPartial: true })).rejects.toThrow("Publication blocked by license/notices readiness");
		await expect(collectRelease(directory, [desktop, extension])).rejects.toThrow("Refusing to overwrite accepted");
	});

	test("isolates two fixture versions and refuses identical or conflicting same-version reruns without mutation", async () => {
		async function snapshot(directory: string, relative = ""): Promise<Array<[string, string]>> {
			const entries = await readdir(path.join(directory, relative), { withFileTypes: true });
			const files: Array<[string, string]> = [];
			for (const entry of entries) {
				const child = relative ? `${relative}/${entry.name}` : entry.name;
				if (entry.isDirectory()) files.push(...await snapshot(directory, child));
				else files.push([child, bundleHash(await readFile(path.join(directory, child)))]);
			}
			return files.sort(([left], [right]) => left.localeCompare(right));
		}

		const versionResults: Array<{ version: string; commit: string }> = [];
		for (const version of ["0.6.1", "0.6.2"]) {
			const { directory, sourceCommit, bundleRoot } = await committedReleaseFixture(version);
			const sourceManifestPaths = manifestPaths(directory);
			const sourceBefore = await Promise.all(sourceManifestPaths.map((filePath) => readFile(filePath)));
			const desktop = await writeBundle(path.join(bundleRoot, "linux-x64"), "desktop", sourceCommit, "linux-x64", undefined, version);
			const extension = await writeBundle(path.join(bundleRoot, "extension"), "extension", sourceCommit, "linux-x64", undefined, version);
			const accepted = await collectRelease(directory, [desktop, extension]);
			const acceptedBefore = await snapshot(accepted);

			await expect(collectRelease(directory, [desktop, extension])).rejects.toThrow("Refusing to overwrite accepted");

			const conflict = await writeBundle(
				path.join(bundleRoot, "conflicting-linux-x64"),
				"desktop",
				sourceCommit,
				"linux-x64",
				tarGzip([{ name: "installer", data: `conflicting ${version} bytes` }]),
				version,
			);
			await expect(collectRelease(directory, [conflict, extension])).rejects.toThrow("Refusing to overwrite accepted");
			expect(await snapshot(accepted)).toEqual(acceptedBefore);
			expect(await Promise.all(sourceManifestPaths.map((filePath) => readFile(filePath)))).toEqual(sourceBefore);
			expect(JSON.parse(await readFile(path.join(accepted, "manifest.json"), "utf8")).version).toBe(version);
			versionResults.push({ version, commit: sourceCommit });
		}

		expect(versionResults.map(({ version }) => version)).toEqual(["0.6.1", "0.6.2"]);
		expect(versionResults[0]?.commit).not.toBe(versionResults[1]?.commit);
	});

	test("rejects mixed source commits and preserves an existing assembly", async () => {
		const { directory, sourceCommit, bundleRoot } = await committedReleaseFixture();
		const desktop = await writeBundle(path.join(bundleRoot, "linux-x64"), "desktop", sourceCommit);
		const otherCommit = "a".repeat(40);
		const extension = await writeBundle(path.join(bundleRoot, "extension"), "extension", otherCommit);
		const accepted = path.join(directory, "releases/0.6.0/assembled");
		await mkdir(accepted, { recursive: true });
		await writeFile(path.join(accepted, "preserve.txt"), "accepted bytes");
		await expect(collectRelease(directory, [desktop, extension])).rejects.toThrow("does not match the clean current release source");
		expect(await readFile(path.join(accepted, "preserve.txt"), "utf8")).toBe("accepted bytes");
	});

	test("rejects stale-version and incomplete transferred bundles before creating an assembly", async () => {
		const { directory, sourceCommit, bundleRoot } = await committedReleaseFixture();
		const staleVersion = await writeBundle(path.join(bundleRoot, "stale-version"), "desktop", sourceCommit, "linux-x64", undefined, "0.6.1");
		const extension = await writeBundle(path.join(bundleRoot, "extension"), "extension", sourceCommit);
		await expect(collectRelease(directory, [staleVersion, extension])).rejects.toThrow("does not match the clean current release source");

		const incomplete = await writeBundle(path.join(bundleRoot, "incomplete"), "desktop", sourceCommit);
		await rm(path.join(incomplete, "evidence.json"));
		await expect(collectRelease(directory, [incomplete, extension])).rejects.toThrow("ENOENT");
		expect(await readdir(path.join(directory, "releases")).catch(() => [])).toEqual([]);
	});

	test("collects same-revision additions without changing the base assembly", async () => {
		const { directory, sourceCommit, bundleRoot } = await committedReleaseFixture();
		const desktopBase = await writeBundle(path.join(bundleRoot, "linux-x64"), "desktop", sourceCommit);
		const extension = await writeBundle(path.join(bundleRoot, "extension"), "extension", sourceCommit);
		const baseDirectory = await collectRelease(directory, [desktopBase, extension]);
		const baseManifest = await readFile(path.join(baseDirectory, "manifest.json"), "utf8");
		const windowsBundle = await writeBundle(path.join(bundleRoot, "windows-x64"), "desktop", sourceCommit, "windows-x64");
		const addition = await collectRelease(directory, [windowsBundle, extension], { addition: true });
		const additionManifest = JSON.parse(await readFile(path.join(addition, "manifest.json"), "utf8"));
		const verifiedAddition = await verifyRelease(directory, addition);
		expect(addition.split(path.sep)).toContain("additions");
		expect(additionManifest.sourceCommit).toBe(sourceCommit);
		expect(verifiedAddition.targets.find(({ target }) => target === "linux-x64")?.status).toBe("available");
		expect(verifiedAddition.targets.find(({ target }) => target === "windows-x64")?.status).toBe("available");
		expect(await readFile(path.join(baseDirectory, "manifest.json"), "utf8")).toBe(baseManifest);
		await expect(collectRelease(directory, [windowsBundle, extension], { addition: true })).rejects.toThrow("already present in the base assembly");
	});

	test("rejects corrupted assets, symlink members, and duplicate target bundles", async () => {
		const { directory, sourceCommit, bundleRoot } = await committedReleaseFixture();
		const desktop = await writeBundle(path.join(bundleRoot, "linux-x64"), "desktop", sourceCommit);
		const extension = await writeBundle(path.join(bundleRoot, "extension"), "extension", sourceCommit);
		await writeFile(path.join(desktop, "artifacts/OpenAMX-linux-x64.tar.gz"), "corrupt");
		await expect(collectRelease(directory, [desktop, extension])).rejects.toThrow("size or SHA-256 mismatch");
		const duplicate = await writeBundle(path.join(bundleRoot, "linux-x64-copy"), "desktop", sourceCommit);
		await expect(collectRelease(directory, [duplicate, extension, await writeBundle(path.join(bundleRoot, "linux-x64-again"), "desktop", sourceCommit)])).rejects.toThrow("Conflicting duplicate desktop target");
		await symlink(path.join(extension, "artifacts/openamx-vscode-0.6.0.vsix"), path.join(extension, "unlisted-link"));
		await expect(collectRelease(directory, [duplicate, extension])).rejects.toThrow("Symlinked bundle member");
		const symlinkParent = path.join(bundleRoot, "parent-alias");
		await symlink(bundleRoot, symlinkParent);
		await expect(collectRelease(directory, [path.join(symlinkParent, "linux-x64-copy"), extension])).rejects.toThrow("symlinked directory");
	});

	test("rejects traversal and symlink entries hidden inside installer archives", async () => {
		const { directory, sourceCommit, bundleRoot } = await committedReleaseFixture();
		const extension = await writeBundle(path.join(bundleRoot, "extension"), "extension", sourceCommit);
		const traversal = await writeBundle(path.join(bundleRoot, "traversal"), "desktop", sourceCommit, "linux-arm64", tarGzip([{ name: "../escape", data: "bad" }]));
		await expect(collectRelease(directory, [traversal, extension])).rejects.toThrow("unsafe member path");
		const symlinkArchive = await writeBundle(path.join(bundleRoot, "archive-symlink"), "desktop", sourceCommit, "linux-arm64", tarGzip([{ name: "escape", type: "2", linkName: "../../outside" }]));
		await expect(collectRelease(directory, [symlinkArchive, extension])).rejects.toThrow("link or unsupported member type");
	});
});

function requireBuffer(filePath: string): Buffer {
	return readFileSync(filePath);
}

import { readFileSync } from "node:fs";
import { symlink } from "node:fs/promises";

describe("explicit GitHub release publication", () => {
	type Release = { id: number; tag_name: string; target_commitish: string; draft: boolean; upload_url: string; assets_url: string };
	type Asset = { name: string; size: number; url: string; bytes: Uint8Array };
	async function publishFixture() {
		const directory = await fixture();
		await writeFile(path.join(directory, "LICENSE.md"), "Test fixture only; not license terms.");
		await writeFile(path.join(directory, "NOTICE"), "Test fixture only; not third-party notices.");
		const extensionPackagePath = path.join(directory, "vscode-extension/package.json");
		const extensionPackage = JSON.parse(await readFile(extensionPackagePath, "utf8"));
		extensionPackage.version = "0.6.0";
		extensionPackage.publisher = "EngineersTools";
		extensionPackage.main = "./dist/extension.js";
		extensionPackage.license = "SEE LICENSE IN LICENSE.md";
		await writeFile(extensionPackagePath, JSON.stringify(extensionPackage, null, 2));
		await writeFile(path.join(directory, ".gitignore"), "/releases/\n");
		execFileSync("git", ["init", "-q"], { cwd: directory });
		execFileSync("git", ["config", "user.email", "release-test@example.invalid"], { cwd: directory });
		execFileSync("git", ["config", "user.name", "Release Test"], { cwd: directory });
		execFileSync("git", ["add", "-A"], { cwd: directory });
		execFileSync("git", ["commit", "-qm", "fixture"], { cwd: directory });
		const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: directory, encoding: "utf8" }).trim();
		const releaseDirectory = path.join(directory, "releases/0.6.0/assembled");
		const assets = [] as Array<{ file: string; sizeBytes: number; sha256: string; role: string }>;
		for (const [file, role] of [
			["targets/linux-x64/artifacts/OpenAMX-Desktop-0.6.0-linux-x64.tar.gz", "installer"],
			["extension/artifacts/openamx-vscode-0.6.0.vsix", "vscode-extension"],
		]) {
			let bytes = Buffer.from(`asset bytes ${path.basename(file)}`);
			if (role === "vscode-extension") {
				const zip = new JSZip();
				for (const item of ["[Content_Types].xml", "extension.vsixmanifest", "extension/amx.tmGrammar.json", "extension/language-configuration.json", "extension/readme.md", "extension/dist/extension.js", "extension/LICENSE.md", "extension/NOTICE"]) zip.file(item, "test fixture only");
				zip.file("extension/package.json", JSON.stringify({ name: "openamx-vscode", version: "0.6.0", publisher: "EngineersTools", main: "./dist/extension.js", license: "SEE LICENSE IN LICENSE.md" }));
				bytes = Buffer.from(await zip.generateAsync({ type: "uint8array" }));
			}
			await mkdir(path.dirname(path.join(releaseDirectory, file)), { recursive: true });
			await writeFile(path.join(releaseDirectory, file), bytes);
			assets.push({ file, sizeBytes: bytes.byteLength, sha256: bundleHashForTest(bytes), role });
		}
		const targets = ["linux-x64", "linux-arm64", "windows-x64", "windows-arm64", "macos-x64", "macos-arm64"].map((target) => ({
			target,
			status: target === "linux-x64" ? "available" : "missing",
			supportStatus: target === "linux-x64" ? "available" : "unverified",
		}));
		const manifest = {
			schemaVersion: 1, product: "OpenAMX", version: "0.6.0", sourceCommit,
			application: { name: "OpenAMX Desktop", identifier: "dev.openamx.desktop" },
			extension: { name: "openamx-vscode", publisher: "EngineersTools", platformNeutral: true, licenseReadiness: { status: "ready", blockers: [] } },
			targets, verification: { buildPackage: "passed", extensionManualInstallLaunch: "not_performed" }, assets,
		};
		await writeFile(path.join(releaseDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
		const manifestHash = bundleHashForTest(await readFile(path.join(releaseDirectory, "manifest.json")));
		await writeFile(path.join(releaseDirectory, "SHA256SUMS"), `${manifestHash}  manifest.json\n${assets.map((asset) => `${asset.sha256}  ${asset.file}`).join("\n")}\n`);
		await writeFile(path.join(releaseDirectory, "COMPLETE"), `${sourceCommit}\n`);
		return { directory, releaseDirectory, sourceCommit, assets };
	}
	async function mockedReadyVerification(state: { sourceCommit: string }): Promise<ReleaseVerification> {
		const manifest = JSON.parse(await readFile(path.join(state.directory, "releases/0.6.0/assembled/manifest.json"), "utf8"));
		return {
			version: "0.6.0", sourceCommit: state.sourceCommit, integrity: "passed", licenseReadiness: "ready",
			packageStatus: "passed", manualInstallLaunchStatus: "not_performed", desktopManualInstallLaunchStatus: "not_performed",
			targets: manifest.targets.map((target: ReleaseVerification["targets"][number]) => ({ ...target, manualInstallLaunchStatus: "not_performed" })),
			blockers: [],
		};
	}
	function bundleHashForTest(bytes: Uint8Array): string {
		return createHash("sha256").update(bytes).digest("hex");
	}
	function mockClient(sourceCommit: string, options: { tagCommit?: string | null; existingRelease?: Release | null; failUploadAt?: number; conflictingAsset?: string } = {}) {
		let release = options.existingRelease ?? null;
		let resolvedTag = options.tagCommit ?? null;
		const remote = new Map<string, Asset>();
		const calls: string[] = [];
		let uploadCount = 0;
		if (options.conflictingAsset) remote.set(options.conflictingAsset, { name: options.conflictingAsset, size: 5, url: `mock://${options.conflictingAsset}`, bytes: Buffer.from("other") });
		const client: GitHubReleaseClient = {
			getTagCommit: async (_repository, tag) => { calls.push(`tag:${tag}`); return resolvedTag; },
			commitExists: async (_repository, commit) => commit === sourceCommit,
			getReleaseByTag: async (_repository, tag) => { calls.push(`release:${tag}`); return release; },
			createDraft: async (_repository, input) => {
				calls.push("create-draft");
				resolvedTag = input.targetCommit;
				release = { id: 1, tag_name: input.tagName, target_commitish: input.targetCommit, draft: true, upload_url: "mock://upload", assets_url: "mock://assets" };
				return release;
			},
			listAssets: async () => [...remote.values()],
			downloadAsset: async (_repository, asset) => remote.get(asset.name)!.bytes,
			uploadAsset: async (_repository, _release, name, bytes) => {
				uploadCount++;
				if (options.failUploadAt === uploadCount) throw new Error("interrupted upload");
				if (remote.has(name)) throw new Error(`duplicate remote ${name}`);
				remote.set(name, { name, size: bytes.byteLength, url: `mock://${name}`, bytes: Buffer.from(bytes) });
			},
		};
		return { client, calls, remote };
	}
	const existingDraft = (sourceCommit: string): Release => ({ id: 1, tag_name: "v0.6.0", target_commitish: sourceCommit, draft: true, upload_url: "mock://upload", assets_url: "mock://assets" });

	test("requires partial acknowledgement before remote mutation and creates a draft", async () => {
		const state = await publishFixture();
		const mock = mockClient(state.sourceCommit);
		await expect(publishRelease({ rootDirectory: state.directory, releaseDirectory: state.releaseDirectory, client: mock.client, verify: () => mockedReadyVerification(state) })).rejects.toThrow("--allow-partial");
		expect(mock.calls).toEqual([]);
		const result = await publishRelease({ rootDirectory: state.directory, releaseDirectory: state.releaseDirectory, allowPartial: true, client: mock.client, verify: () => mockedReadyVerification(state) });
		expect(result).toMatchObject({ repository: "NovaEnergyConsulting/openamx", tag: "v0.6.0", draft: true });
		expect(result.uploaded).toHaveLength(2);
		expect(result.partialTargets).toContain("windows-x64:missing");
		expect(mock.calls).toContain("create-draft");
	});

	test("rejects mismatched tags, non-draft releases, and conflicting assets", async () => {
		const state = await publishFixture();
		const mismatch = mockClient(state.sourceCommit, { tagCommit: "a".repeat(40) });
		await expect(publishRelease({ rootDirectory: state.directory, releaseDirectory: state.releaseDirectory, allowPartial: true, client: mismatch.client, verify: () => mockedReadyVerification(state) })).rejects.toThrow("tags are never moved");
		const conflict = mockClient(state.sourceCommit, { tagCommit: state.sourceCommit, existingRelease: existingDraft(state.sourceCommit), conflictingAsset: "OpenAMX-Desktop-0.6.0-linux-x64.tar.gz" });
		await expect(publishRelease({ rootDirectory: state.directory, releaseDirectory: state.releaseDirectory, allowPartial: true, client: conflict.client, verify: () => mockedReadyVerification(state) })).rejects.toThrow("Remote asset conflict");
		const published = mockClient(state.sourceCommit, { tagCommit: state.sourceCommit, existingRelease: { ...existingDraft(state.sourceCommit), draft: false } });
		await expect(publishRelease({ rootDirectory: state.directory, releaseDirectory: state.releaseDirectory, allowPartial: true, client: published.client, verify: () => mockedReadyVerification(state) })).rejects.toThrow("not an unpublished draft");
	});

	test("confirms identical retries and adds later same-revision assets without replacement", async () => {
		const state = await publishFixture();
		const first = mockClient(state.sourceCommit);
		const published = await publishRelease({ rootDirectory: state.directory, releaseDirectory: state.releaseDirectory, allowPartial: true, client: first.client, verify: () => mockedReadyVerification(state) });
		expect(published.uploaded).toHaveLength(2);
		const retry = mockClient(state.sourceCommit, { tagCommit: state.sourceCommit, existingRelease: existingDraft(state.sourceCommit) });
		for (const [name, asset] of first.remote) retry.remote.set(name, asset);
		const retried = await publishRelease({ rootDirectory: state.directory, releaseDirectory: state.releaseDirectory, allowPartial: true, client: retry.client, verify: () => mockedReadyVerification(state) });
		expect(retried.confirmed).toHaveLength(2);
		const extraName = "OpenAMX-Desktop-0.6.0-windows-x64.zip";
		const extraFile = `targets/windows-x64/artifacts/${extraName}`;
		const extraBytes = Buffer.from("later same revision target");
		await mkdir(path.dirname(path.join(state.releaseDirectory, extraFile)), { recursive: true });
		await writeFile(path.join(state.releaseDirectory, extraFile), extraBytes);
		const manifestPath = path.join(state.releaseDirectory, "manifest.json");
		const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
		manifest.assets.push({ file: extraFile, sizeBytes: extraBytes.byteLength, sha256: bundleHashForTest(extraBytes), role: "installer", target: "windows-x64" });
		manifest.targets.find((target: { target: string }) => target.target === "windows-x64").status = "available";
		await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
		await writeFile(path.join(state.releaseDirectory, "SHA256SUMS"), `${bundleHashForTest(await readFile(manifestPath))}  manifest.json\n${manifest.assets.map((asset: { file: string; sha256: string }) => `${asset.sha256}  ${asset.file}`).join("\n")}\n`);
		const addMock = mockClient(state.sourceCommit, { tagCommit: state.sourceCommit, existingRelease: existingDraft(state.sourceCommit) });
		for (const [name, asset] of first.remote) addMock.remote.set(name, asset);
		const added = await publishRelease({ rootDirectory: state.directory, releaseDirectory: state.releaseDirectory, allowPartial: true, client: addMock.client, verify: () => mockedReadyVerification(state) });
		expect(added.confirmed).toHaveLength(2);
		expect(added.uploaded).toContain(extraName);
	});

	test("keeps interrupted uploads retryable and redacts authentication failures", async () => {
		const state = await publishFixture();
		const interrupted = mockClient(state.sourceCommit, { failUploadAt: 2 });
		await expect(publishRelease({ rootDirectory: state.directory, releaseDirectory: state.releaseDirectory, allowPartial: true, client: interrupted.client, verify: () => mockedReadyVerification(state) })).rejects.toThrow("interrupted upload");
		expect(interrupted.calls).toContain("create-draft");
		const secret = "never-print-this-token";
		const authClient = await createGitHubReleaseClient({ token: secret, fetchImplementation: async () => new Response("secret-bearing body", { status: 401 }) });
		await expect(authClient.getTagCommit("NovaEnergyConsulting/openamx", "v0.6.0")).rejects.toThrow("authentication or authorization failed");
		await expect(authClient.getTagCommit("NovaEnergyConsulting/openamx", "v0.6.0")).rejects.not.toThrow(secret);
	});

	test("fails before network setup when GitHub credentials are absent", async () => {
		const directory = await fixture("release no-credentials fixture ");
		const publishModule = new URL("../scripts/release/publish.ts", import.meta.url).href;
		const script = `import { createGitHubReleaseClient } from ${JSON.stringify(publishModule)}; await createGitHubReleaseClient();`;
		const result = spawnSync(process.execPath, ["-e", script], {
			encoding: "utf8",
			env: { ...process.env, PATH: directory, GH_TOKEN: "", GITHUB_TOKEN: "" },
		});
		expect(result.status).toBe(1);
		expect(result.stderr).toContain("GitHub authentication is unavailable");
	});
});