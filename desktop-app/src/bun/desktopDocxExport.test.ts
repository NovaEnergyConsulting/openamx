import { expect, test } from "bun:test";
import { createDesktopService } from "./desktopService";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import JSZip from "jszip";

test("desktop DOCX export uses the validated final destination for local links", async () => {
	const root = mkdtempSync(join(tmpdir(), "openamx-desktop-docx-export-"));
	const sourceDirectory = join(root, "source");
	const companionDirectory = join(sourceDirectory, "companions");
	const outputDirectory = join(root, "output");
	const entry = join(sourceDirectory, "report.amx");
	const output = join(outputDirectory, "report.docx");
	mkdirSync(companionDirectory, { recursive: true });
	mkdirSync(outputDirectory);
	writeFileSync(entry, "# Desktop report\n\n[Companion](./companions/asset%20one.txt?download=1#page)\n");
	writeFileSync(join(companionDirectory, "asset one.txt"), "portable companion");

	const service = createDesktopService(root, {
		async choose() { return output; },
		async confirmOverwrite() { return true; }
	});
	try {
		await service.request.openDocument({ path: entry });
		const selected = await service.request.pickDestination({ extension: ".docx", fileName: "report.docx" });
		if (!selected.ok || selected.cancelled || !selected.selectionId) {
			throw new Error(selected.ok ? "DOCX destination selection was cancelled." : selected.error.message);
		}
		const workbench = await service.request.getWorkbench();
		if (!workbench.ok || !workbench.state.requestIdentity) throw new Error("Active document identity is unavailable.");
		const started = await service.request.startJob({
			operation: "docx",
			identity: workbench.state.requestIdentity,
			selectionId: selected.selectionId
		});
		if (!started.ok) throw new Error(started.error.message);

		let job = started.job;
		for (let attempt = 0; job.status === "running" && attempt < 1000; attempt++) {
			await new Promise(resolve => setTimeout(resolve, 10));
			const polled = await service.request.getJob({ jobId: job.identity.jobId });
			if (!polled.ok) throw new Error(polled.error.message);
			job = polled.job;
		}
		expect(job.status).toBe("succeeded");
		const archive = await JSZip.loadAsync(await Bun.file(output).arrayBuffer());
		const documentXml = await archive.file("word/document.xml")?.async("string");
		const relationships = await archive.file("word/_rels/document.xml.rels")?.async("string");
		expect(documentXml).toContain("Desktop report");
		expect(relationships).toContain('Target="../source/companions/asset%20one.txt?download=1#page"');
		expect(relationships).not.toContain(root);
		expect(relationships).not.toContain(".tmp");
		expect(await Bun.file(join(outputDirectory, "companions", "asset one.txt")).exists()).toBe(false);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
