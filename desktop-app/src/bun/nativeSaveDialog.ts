import { join } from "node:path";

type Extension = ".html" | ".pdf" | ".docx";
type DialogResult = { stdout: string; stderr: string; exitCode: number };
type DialogRunner = (command: string, args: string[], env: NodeJS.ProcessEnv) => Promise<DialogResult>;

export function saveDialogCommand(platform: NodeJS.Platform, root: string, extension: Extension) {
	const filename = `report${extension}`;
	if (platform === "linux") return {
		command: "zenity",
		args: ["--file-selection", "--save", "--confirm-overwrite", `--filename=${join(root, filename)}`, `--file-filter=*${extension}`],
		env: process.env
	};
	if (platform === "darwin") return {
		command: "osascript",
		args: ["-e", `on run argv
set targetFolder to (POSIX file (item 1 of argv)) as alias
set suggestedName to item 2 of argv
set chosenFile to choose file name default name suggestedName default location targetFolder
return POSIX path of chosenFile
end run`, root, filename],
		env: process.env
	};
	if (platform === "win32") return {
		command: "powershell.exe",
		args: ["-NoProfile", "-NonInteractive", "-Sta", "-Command", `Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.SaveFileDialog
$dialog.InitialDirectory = $env:OPENAMX_SAVE_ROOT
$dialog.FileName = $env:OPENAMX_SAVE_NAME
$dialog.Filter = 'OpenAMX report (*' + $env:OPENAMX_SAVE_EXT + ')|*' + $env:OPENAMX_SAVE_EXT
$dialog.OverwritePrompt = $true
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::Out.Write($dialog.FileName) }`],
		env: { ...process.env, OPENAMX_SAVE_ROOT: root, OPENAMX_SAVE_NAME: filename, OPENAMX_SAVE_EXT: extension }
	};
	throw new Error(`No native save dialog is supported on ${platform}.`);
}

async function runDialog(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<DialogResult> {
	const child = Bun.spawn([command, ...args], { env, stdout: "pipe", stderr: "pipe" });
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited
	]);
	return { stdout, stderr, exitCode };
}

export async function chooseSaveDestination(root: string, extension: Extension, platform = process.platform, runner: DialogRunner = runDialog): Promise<string | undefined> {
	const { command, args, env } = saveDialogCommand(platform, root, extension);
	const { stdout, stderr, exitCode } = await runner(command, args, env);
	if (exitCode !== 0) {
		if (exitCode === 1 && (platform === "linux" || (platform === "darwin" && stderr.includes("(-128)")))) return undefined;
		throw new Error("Native save dialog failed or is unavailable on this host.");
	}
	const path = stdout.replace(/\r?\n$/, "");
	if (!path) return undefined;
	if (path.includes("\n") || path.includes("\r") || path.includes("\0")) throw new Error("Native save dialog returned an invalid path.");
	return path;
}