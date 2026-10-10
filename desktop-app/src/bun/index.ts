/// <reference types="bun" />
import { homedir } from "node:os";
import { join } from "node:path";
import Electrobun, { BrowserWindow, Utils, createRPC } from "electrobun/main";
import { createPingResponse, type DesktopRPCSchema } from "../shared/rpc";
import { createDesktopService } from "./desktopService";

const service = createDesktopService(undefined, {
	async choose({ directory, extension, fileName, root }) {
		if (extension && extension !== ".amx") {
			if (!root) throw new Error("Open a project before choosing a report destination.");
			if (!fileName) throw new Error("Export filename is unavailable.");
			const folders = await Utils.openFileDialog({
				startingFolder: root, allowedFileTypes: "*", canChooseDirectory: true,
				canChooseFiles: false, allowsMultipleSelection: false
			});
			return folders.length === 1 && folders[0] ? join(folders[0], fileName) : undefined;
		}
		const selected = await Utils.openFileDialog({
			startingFolder: root ?? homedir(), allowedFileTypes: extension ? extension.slice(1) : "*",
			canChooseDirectory: directory, canChooseFiles: !directory, allowsMultipleSelection: false
		});
		if (directory) console.log(`Project folder dialog returned ${selected.length} selection(s).`);
		return selected.length === 1 && selected[0] ? selected[0] : undefined;
	},
	async confirmTransition(operation) {
		const { response } = await Utils.showMessageBox({
			type: "question", title: operation === "quit" ? "Quit OpenAMX?" : "Switch projects?",
			message: "There are unsaved or conflicted tabs.",
			detail: "Save All checks disk conflicts. A failed save keeps the workbench open.",
			buttons: ["Save All", "Discard All", "Cancel"], defaultId: 2, cancelId: 2
		});
		return response === 0 ? "save-all" : response === 1 ? "discard-all" : "cancel";
	},
	async confirmOverwrite(fileName) {
		const { response } = await Utils.showMessageBox({
			type: "question", title: "Replace existing file?", message: `Replace ${fileName}?`,
			detail: "The selected file's bytes will be replaced only after export preparation succeeds.",
			buttons: ["Replace", "Cancel"], defaultId: 1, cancelId: 1
		});
		return response === 0;
	},
	async confirmPreviewNavigation(target) {
		const external = target.kind === "external";
		const destination = external ? target.href : target.path;
		const { response } = await Utils.showMessageBox({
			type: "question",
			title: external ? "Open external link?" : "Open local file?",
			message: external ? "The preview is requesting to open this web address:" : "The preview is requesting to open this local file:",
			detail: destination,
			buttons: ["Open", "Cancel"], defaultId: 1, cancelId: 1
		});
		return response === 0;
	},
	openExternal(url) { return Utils.openExternal(url); },
	openPath(path) { return Utils.openPath(path); },
	revealPath(path) { Utils.showItemInFolder(path); return true; }
}, join(homedir(), ".config", "openamx", "desktop-session.json"));

let quitApproved = false;
let quitPromptPending = false;
function confirmAndQuit() {
	if (quitPromptPending) return;
	quitPromptPending = true;
	void service.request.confirmQuit().then(result => {
		if (!result.ok) {
			void Utils.showMessageBox({ type: "error", title: "OpenAMX remains open", message: "Unable to save all tabs. Resolve conflicts or try again." });
		} else if (result.ready) {
			quitApproved = true;
			Utils.quit();
		}
	}).catch(() => undefined).finally(() => { quitPromptPending = false; });
}
Electrobun.events.on("before-quit", event => {
	if (quitApproved) return;
	event.response = { allow: false };
	confirmAndQuit();
});
Electrobun.events.on("will-close", event => {
	if (quitApproved) return;
	event.response = { allow: false };
	confirmAndQuit();
});

const rpc = createRPC<DesktopRPCSchema["bun"], DesktopRPCSchema["webview"]>({
	requestHandler: {
		...service.request,
		ping: ({ nonce }) => {
			console.log(`Typed webview-to-Bun RPC received: ${nonce}`);
			return createPingResponse(nonce, process.versions.bun ?? "unknown");
		},
	},
});

const mainWindow = new BrowserWindow({
	title: "OpenAMX",
	url: "views://mainview/index.html",
	rpc,
	frame: {
		width: 1240,
		height: 800,
	},
});

void mainWindow;

console.log(`OpenAMX desktop proof running on Bun ${process.versions.bun ?? "unknown"}`);
