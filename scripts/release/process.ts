import { spawnSync, type SpawnSyncOptionsWithStringEncoding, type SpawnSyncReturns } from "node:child_process";

export function spawnReleaseCommand(
	command: string,
	args: string[],
	options: SpawnSyncOptionsWithStringEncoding = { encoding: "utf8" },
): SpawnSyncReturns<string> {
	const executable = Bun.which(command, { cwd: options.cwd?.toString() }) ?? command;
	if (process.platform === "win32" && /\.(?:cmd|bat)$/i.test(executable)) {
		const commandLine = `"${[executable, ...args].map((argument) => `"${argument}"`).join(" ")}"`;
		return spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", commandLine], {
			...options,
			shell: false,
			windowsHide: true,
			windowsVerbatimArguments: true,
		});
	}
	return spawnSync(executable, args, { ...options, shell: false, windowsHide: true });
}