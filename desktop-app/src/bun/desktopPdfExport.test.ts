import { expect, test } from "bun:test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDesktopService } from "./desktopService";

test("desktop PDF export materializes local links from the validated final destination", async () => {
	const root = mkdtempSync(join(tmpdir(), "openamx-desktop-pdf-export-"));
	const sourceDirectory = join(root, "source");
	const companionDirectory = join(sourceDirectory, "companions");
	const outputDirectory = join(root, "output");
	const entry = join(sourceDirectory, "report.amx");
	const output = join(outputDirectory, "report.pdf");
	let allowOverwrite = true;
	mkdirSync(companionDirectory, { recursive: true });
	mkdirSync(outputDirectory);
	writeFileSync(entry, "# Desktop report\n\n[Companion](./companions/asset%20one.txt)\n");
	writeFileSync(join(companionDirectory, "asset one.txt"), "portable companion");

	const service = createDesktopService(root, {
		async choose() { return output; },
		async confirmOverwrite() { return allowOverwrite; }
	});
	try {
		await service.request.openDocument({ path: entry });
		const selected = await service.request.pickDestination({ extension: ".pdf", fileName: "report.pdf" });
		if (!selected.ok || selected.cancelled || !selected.selectionId) {
			throw new Error(selected.ok ? "PDF destination selection was cancelled." : selected.error.message);
		}
		const workbench = await service.request.getWorkbench();
		if (!workbench.ok || !workbench.state.requestIdentity) throw new Error("Active document identity is unavailable.");
		const started = await service.request.startJob({
			operation: "pdf",
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
		const pdf = await getDocument({
			data: new Uint8Array(await Bun.file(output).arrayBuffer()),
			useSystemFonts: true,
			disableFontFace: true
		}).promise;
		const annotations: { url?: string; unsafeUrl?: string }[] = [];
		for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
			annotations.push(...await (await pdf.getPage(pageNumber)).getAnnotations());
		}
		const urls = annotations
			.flatMap(annotation => [annotation.url, annotation.unsafeUrl])
			.filter((url): url is string => typeof url === "string");
		expect(urls).toContain("../source/companions/asset%20one.txt");
		expect(urls.every(url => !url.includes(root) && !url.startsWith("file:") && !url.includes(".tmp"))).toBe(true);
		allowOverwrite = false;
		const rejectedOverwrite = await service.request.pickDestination({ extension: ".pdf", fileName: "report.pdf" });
		expect(rejectedOverwrite).toMatchObject({ ok: true, cancelled: true });
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
