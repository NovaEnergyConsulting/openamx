/// <reference types="bun" />
import { BrowserWindow, createRPC } from "electrobun/main";
import { createPingResponse, type DesktopRPCSchema } from "../shared/rpc";
import { createDesktopService } from "./desktopService";

const service = createDesktopService();

const rpc = createRPC<DesktopRPCSchema["bun"], DesktopRPCSchema["webview"]>({
	requestHandler: {
		...service.request,
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
		width: 1240,
		height: 800,
	},
});

console.log(`OpenAMX desktop proof running on Bun ${process.versions.bun ?? "unknown"}`);
