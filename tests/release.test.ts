import { afterEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { inspectRelease, isStableVersion, manifestPaths, mapNativeTarget, prepareVersion } from "../scripts/release";
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