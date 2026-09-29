/// <reference types="bun" />
import { BrowserWindow, createRPC } from "electrobun/main";
import { createPingResponse, type DesktopRPCSchema } from "../shared/rpc";

const rpc = createRPC<DesktopRPCSchema["bun"], DesktopRPCSchema["webview"]>({
	requestHandler: {
		ping: ({ nonce }) => {
			console.log(`Typed webview-to-Bun RPC received: ${nonce}`);
			return createPingResponse(nonce, process.versions.bun ?? "unknown");
		},
	},
});

new BrowserWindow({
	title: "OpenAMX Desktop Spike",
	url: "views://mainview/index.html",
	rpc,
	frame: {
		width: 720,
		height: 520,
	},
});

console.log(`OpenAMX desktop proof running on Bun ${process.versions.bun ?? "unknown"}`);
