import { describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createDesktopService } from "./desktopService";
import {
	DESKTOP_GUIDE_FILES, DESKTOP_GUIDE_STAGE_RELATIVE_PATH, materializeDesktopGuide,
	resolveDesktopGuideResourceDirectory, stageDesktopGuideResources, verifyDesktopGuideParity
} from "./guideResources";

const canonicalExamples = resolve(import.meta.dir, "../../../examples");
const packagedGuideRoot = process.env.OPENAMX_PACKAGED_GUIDE_RESOURCE_ROOT;

function runGuideCli(projectRoot: string, ...arguments_: string[]) {
	return Bun.spawnSync(
		[process.execPath, "run", resolve(import.meta.dir, "../../../src/cli.ts"), ...arguments_],
		{ cwd: projectRoot }
	);
}

describe("desktop guide resources", () => {
	it("stages only the approved canonical closure with path and byte parity", () => {
		const temporaryRoot = mkdtempSync(join(tmpdir(), "openamx-guide-stage-"));
		const destination = join(temporaryRoot, "guide");
		try {
			const manifest = stageDesktopGuideResources(canonicalExamples, destination);
			expect(manifest.map(entry => entry.path)).toEqual([...DESKTOP_GUIDE_FILES]);
			expect(verifyDesktopGuideParity(canonicalExamples, destination)).toEqual(manifest);
			expect(readdirSync(destination).sort()).toEqual([
				"00_Table_of_Contents.amx",
				"01_First_Computable_Document.amx",
				"02_Expressions_and_Decisions.amx",
				"03_Collections_and_Functions.amx",
				"04_Typed_Records_Enums_and_Modules.amx",
				"05_Measurements_and_Units.amx",
				"06_Mapped_Data_and_Validation.amx",
				"07_Tables_Charts_and_Named_Outputs.amx",
				"08_Formula_Driven_Diagrams.amx",
				"09_Runtime_Type_Checks.amx",
				"10_Mathematics_and_Measurement_Operations.amx",
				"11_Text_and_Numeric_Formatting.amx",
				"12_Complete_Asset_Screening_Report.amx",
				"13_Route_Measurement_Report.amx",
				"14_Battery_Resistor_Circuit.amx",
				"data",
				"fixtures",
				"libraries",
			].sort());
			writeFileSync(join(destination, "unexpected.txt"), "not allowed");
			expect(() => verifyDesktopGuideParity(canonicalExamples, destination)).toThrow("file set");
		} finally {
			rmSync(temporaryRoot, { recursive: true, force: true });
		}
	});

	it("resolves only the fixed packaged or development guide resource location", () => {
		const temporaryRoot = mkdtempSync(join(tmpdir(), "openamx-guide-resolver-"));
		try {
			const developmentRuntime = join(temporaryRoot, "desktop-app", "src", "bun");
			const developmentResources = join(temporaryRoot, "desktop-app", ...DESKTOP_GUIDE_STAGE_RELATIVE_PATH.split("/"));
			mkdirSync(developmentRuntime, { recursive: true });
			mkdirSync(developmentResources, { recursive: true });
			expect(resolveDesktopGuideResourceDirectory(developmentRuntime)).toBe(developmentResources);

			const packagedRuntime = join(temporaryRoot, "bundle", "Resources", "app", "bun");
			const packagedResources = join(packagedRuntime, "guide");
			mkdirSync(packagedResources, { recursive: true });
			expect(resolveDesktopGuideResourceDirectory(packagedRuntime)).toBe(packagedResources);
		} finally {
			rmSync(temporaryRoot, { recursive: true, force: true });
		}
	});

	if (packagedGuideRoot) {
		it("matches the built package resource byte-for-byte with the canonical allowlist", () => {
			const manifest = verifyDesktopGuideParity(canonicalExamples, packagedGuideRoot);
			expect(resolveDesktopGuideResourceDirectory(dirname(packagedGuideRoot))).toBe(packagedGuideRoot);
			expect(manifest.map(entry => entry.path)).toEqual([...DESKTOP_GUIDE_FILES]);
		});
	}

	it("materializes offline guide files and project config without a default report", () => {
		const temporaryRoot = mkdtempSync(join(tmpdir(), "openamx-guide-project-"));
		const resources = join(temporaryRoot, "resources");
		const project = join(temporaryRoot, "project");
		mkdirSync(project);
		try {
			stageDesktopGuideResources(canonicalExamples, resources);
			const result = materializeDesktopGuide(resources, project);
			expect(result.indexPath).toBe(join(project, "00_Table_of_Contents.amx"));
			expect(result.indexText).toBe(readFileSync(join(resources, "00_Table_of_Contents.amx"), "utf8"));
			expect(existsSync(join(project, "report.amx"))).toBe(false);
			expect(readFileSync(join(project, ".openamx", "project.json"), "utf8")).toBe('{"version":1,"inputs":{}}\n');
			for (const path of DESKTOP_GUIDE_FILES) {
				expect(readFileSync(join(project, ...path.split("/")))).toEqual(readFileSync(join(resources, ...path.split("/"))));
			}
		} finally {
			rmSync(temporaryRoot, { recursive: true, force: true });
		}
	});

	it("leaves the selected folder untouched if a required resource is missing", () => {
		const temporaryRoot = mkdtempSync(join(tmpdir(), "openamx-guide-failure-"));
		const resources = join(temporaryRoot, "resources");
		const project = join(temporaryRoot, "project");
		mkdirSync(project);
		try {
			stageDesktopGuideResources(canonicalExamples, resources);
			unlinkSync(join(resources, "libraries", "travel-measurements.amx"));
			expect(() => materializeDesktopGuide(resources, project)).toThrow();
			expect(readdirSync(project)).toEqual([]);
		} finally {
			rmSync(temporaryRoot, { recursive: true, force: true });
		}
	});

	it("creates and opens the complete offline guide through the trusted project service", async () => {
		const temporaryRoot = mkdtempSync(join(tmpdir(), "openamx-guide-rpc-"));
		const resources = join(temporaryRoot, "resources");
		const project = join(temporaryRoot, "project");
		mkdirSync(project);
		try {
			stageDesktopGuideResources(canonicalExamples, resources);
			const packageResources = packagedGuideRoot ?? resources;
			if (packagedGuideRoot) verifyDesktopGuideParity(canonicalExamples, packagedGuideRoot);
			const service = createDesktopService(undefined, undefined, undefined, undefined, packageResources);
			const result = await service.request.createProject({ path: project, intent: "guide" });
			expect(result.ok).toBe(true);
			if (!result.ok) throw new Error(result.error.message);
			const index = join(project, "00_Table_of_Contents.amx");
			expect(result.document.path).toBe(index);
			expect(result.state.active).toBe(index);
			expect(result.document.text).toBe(readFileSync(index, "utf8"));
			expect(readFileSync(join(project, ".openamx", "project.json"), "utf8")).toBe('{"version":1,"inputs":{}}\n');
			expect(existsSync(join(project, "report.amx"))).toBe(false);
			for (const path of DESKTOP_GUIDE_FILES) {
				expect(readFileSync(join(project, ...path.split("/")))).toEqual(readFileSync(join(packageResources, ...path.split("/"))));
			}

			const renderedIndexPath = join(temporaryRoot, "guide-index.html");
			const renderedIndex = runGuideCli(project, "render", "00_Table_of_Contents.amx", "--out", renderedIndexPath);
			if (renderedIndex.exitCode !== 0) throw new Error(new TextDecoder().decode(renderedIndex.stderr));
			expect(renderedIndex.exitCode).toBe(0);
			const indexHtml = readFileSync(renderedIndexPath, "utf8");
			expect(indexHtml).toContain("01 - First Computable Document");
			expect(indexHtml).toContain("14 - Battery-Resistor Circuit");

			const inputs = [
				"--input", "asset=data/asset.json",
				"--input", "screenings=data/screenings.csv",
				"--input", "reviewedAt=data/reviewed-at.json",
			];
			for (const document of [
				"06_Mapped_Data_and_Validation.amx",
				"07_Tables_Charts_and_Named_Outputs.amx",
				"12_Complete_Asset_Screening_Report.amx",
			]) {
				const result = runGuideCli(project, "run", document, ...inputs);
				if (result.exitCode !== 0) throw new Error(`${document}: ${new TextDecoder().decode(result.stderr)}`);
				expect(result.exitCode).toBe(0);
			}
			const routeReport = runGuideCli(project, "run", "13_Route_Measurement_Report.amx", "--input", "trips=data/measurement-trips.json");
			if (routeReport.exitCode !== 0) throw new Error(`13_Route_Measurement_Report.amx: ${new TextDecoder().decode(routeReport.stderr)}`);
			expect(routeReport.exitCode).toBe(0);
		} finally {
			rmSync(temporaryRoot, { recursive: true, force: true });
		}
	});

	it("keeps ordinary project creation on the standard report path", async () => {
		const temporaryRoot = mkdtempSync(join(tmpdir(), "openamx-standard-project-"));
		const project = join(temporaryRoot, "project");
		mkdirSync(project);
		try {
			const service = createDesktopService();
			const result = await service.request.createProject({ path: project });
			expect(result.ok).toBe(true);
			if (!result.ok) throw new Error(result.error.message);
			expect(result.document.path).toBe(join(project, "report.amx"));
			expect(result.state.active).toBe(join(project, "report.amx"));
			expect(readFileSync(join(project, ".openamx", "project.json"), "utf8")).toBe('{"version":1,"inputs":{}}\n');
			expect(readFileSync(join(project, "report.amx"), "utf8")).toContain('export let title: String = "New Report"');
			expect(existsSync(join(project, "00_Table_of_Contents.amx"))).toBe(false);
		} finally {
			rmSync(temporaryRoot, { recursive: true, force: true });
		}
	});

	it("rejects nonempty, symlink, and incomplete guide destinations without partial contents", async () => {
		const temporaryRoot = mkdtempSync(join(tmpdir(), "openamx-guide-reject-"));
		const resources = join(temporaryRoot, "resources");
		const incompleteResources = join(temporaryRoot, "incomplete-resources");
		try {
			stageDesktopGuideResources(canonicalExamples, resources);
			stageDesktopGuideResources(canonicalExamples, incompleteResources);
			unlinkSync(join(incompleteResources, "libraries", "travel-measurements.amx"));
			const service = createDesktopService(undefined, undefined, undefined, undefined, resources);

			const nonemptyProject = join(temporaryRoot, "nonempty");
			mkdirSync(nonemptyProject);
			writeFileSync(join(nonemptyProject, "existing.txt"), "preserve");
			const nonempty = await service.request.createProject({ path: nonemptyProject, intent: "guide" });
			expect(nonempty.ok).toBe(false);
			expect(readFileSync(join(nonemptyProject, "existing.txt"), "utf8")).toBe("preserve");
			expect(existsSync(join(nonemptyProject, ".openamx", "project.json"))).toBe(false);

			const symlinkTarget = join(temporaryRoot, "symlink-target");
			mkdirSync(symlinkTarget);
			const symlinkProject = join(temporaryRoot, "symlink-project");
			symlinkSync(symlinkTarget, symlinkProject, process.platform === "win32" ? "junction" : "dir");
			const symlink = await service.request.createProject({ path: symlinkProject, intent: "guide" });
			expect(symlink.ok).toBe(false);
			expect(readdirSync(symlinkTarget)).toEqual([]);

			const incompleteProject = join(temporaryRoot, "incomplete-project");
			mkdirSync(incompleteProject);
			const incompleteService = createDesktopService(undefined, undefined, undefined, undefined, incompleteResources);
			const incomplete = await incompleteService.request.createProject({ path: incompleteProject, intent: "guide" });
			expect(incomplete.ok).toBe(false);
			if (incomplete.ok) throw new Error("Incomplete guide resources unexpectedly created a project.");
			expect(incomplete.error.message).toContain("Required guide resource is missing");
			expect(readdirSync(incompleteProject)).toEqual([]);
		} finally {
			rmSync(temporaryRoot, { recursive: true, force: true });
		}
	});

	it("preserves guide-selection transition and picker cancellation", async () => {
		const temporaryRoot = mkdtempSync(join(tmpdir(), "openamx-guide-cancel-"));
		const resources = join(temporaryRoot, "resources");
		const oldProject = join(temporaryRoot, "old-project");
		const targetProject = join(temporaryRoot, "target-project");
		mkdirSync(oldProject);
		mkdirSync(targetProject);
		try {
			stageDesktopGuideResources(canonicalExamples, resources);
			const service = createDesktopService(undefined, {
				async choose() { return targetProject; },
				async confirmTransition() { return "cancel"; }
			}, undefined, undefined, resources);
			const initial = await service.request.createProject({ path: oldProject });
			expect(initial.ok).toBe(true);
			const dirty = await service.request.updateBuffer({ text: "# Unsaved work\n" });
			expect(dirty.ok).toBe(true);
			expect(dirty.ok && dirty.document.dirty).toBe(true);

			const cancelled = await service.request.pickCreateProject({ intent: "guide" });
			expect(cancelled).toEqual({ ok: true, cancelled: true });
			expect(readdirSync(targetProject)).toEqual([]);
			const context = await service.request.getProjectContext();
			expect(context.ok && context.root).toBe(oldProject);

			const pickerCancelled = createDesktopService(undefined, {
				async choose() { return undefined; }
			}, undefined, undefined, resources);
			expect(await pickerCancelled.request.pickCreateProject({ intent: "guide" })).toEqual({ ok: true, cancelled: true });
		} finally {
			rmSync(temporaryRoot, { recursive: true, force: true });
		}
	});
});
