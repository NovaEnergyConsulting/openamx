import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function localInstallInvocation(packageJson, extensionDirectory, platform) {
	const pathApi = platform === "win32" ? path.win32 : path.posix;
	const vsixPath = pathApi.resolve(extensionDirectory, `${packageJson.name}-${packageJson.version}.vsix`);
	if (platform === "win32") {
		return { command: "cmd.exe", args: ["/d", "/s", "/c", `"code --install-extension "${vsixPath}" --force"`] };
	}
	return { command: "code", args: ["--install-extension", vsixPath, "--force"] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const packageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"));
	const invocation = localInstallInvocation(packageJson, fileURLToPath(new URL(".", import.meta.url)), process.platform);
	const result = spawnSync(invocation.command, invocation.args, { stdio: "inherit", shell: false });
	if (result.error) {
		console.error(`Could not start VS Code CLI: ${result.error.message}`);
		process.exitCode = 1;
	} else if (result.status !== 0) {
		process.exitCode = result.status ?? 1;
	}
}