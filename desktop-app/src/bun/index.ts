/// <reference types="bun" />
import { homedir } from "node:os";
import { join } from "node:path";
import Electrobun, { BrowserWindow, Utils, createRPC } from "electrobun/main";
import { createPingResponse, type DesktopRPCSchema } from "../shared/rpc";
import { createDesktopService } from "./desktopService";
import { chooseSaveDestination } from "./nativeSaveDialog";

const service = createDesktopService(undefined, {
	async choose({ directory, extension, root }) {
		if (extension && extension !== ".amx") {
			if (!root) throw new Error("Open a project before choosing a report destination.");
			return chooseSaveDestination(root, extension as ".html" | ".pdf" | ".docx");
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
	}
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
