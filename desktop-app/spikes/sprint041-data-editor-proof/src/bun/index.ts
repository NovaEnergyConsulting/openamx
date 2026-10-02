import { BrowserWindow } from "electrobun/main";

const proofWindow = new BrowserWindow({
	title: "OpenAMX Sprint 041 Data Editor Proof",
	url: "views://mainview/index.html",
	frame: {
		width: 1440,
		height: 1040
	}
});

void proofWindow;