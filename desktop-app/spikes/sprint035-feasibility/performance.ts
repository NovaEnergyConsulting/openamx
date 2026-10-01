import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEntryModule } from "../../../src/runtime/moduleLoader";
import { createDesktopService } from "../../src/bun/desktopService";

const root = mkdtempSync(join(tmpdir(), "openamx-sprint035-perf-"));
const beforeMemory = process.memoryUsage().heapUsed;
const results: Record<string, number | string> = {
	platform: process.platform,
	architecture: process.arch,
	bun: process.versions.bun ?? "unknown",
	node: process.versions.node ?? "unknown",
	cpus: require("node:os").cpus().length,
	totalMemoryBytes: require("node:os").totalmem(),
	fixtureRows: 100_000,
	projectFileCount: 100
};

try {
	for (let index = 0; index < 100; index++) {
		const directory = join(root, `group-${String(index % 10).padStart(2, "0")}`);
		mkdirSync(directory, { recursive: true });
		writeFileSync(join(directory, `module-${String(index).padStart(3, "0")}.amx`), `# Module ${index}\n\n\`\`\`amx\nexport let value: Number = ${index}\n\`\`\`\n`);
	}
	const service = createDesktopService();
	const opened = await service.request.openProject({ path: root });
	if (!opened.ok) throw new Error(opened.error.message);
	const listStart = performance.now();
	const listed = await service.request.listProjectFiles();
	results.projectListingMilliseconds = Number((performance.now() - listStart).toFixed(3));
	if (!listed.ok) throw new Error(listed.error.message);
	results.projectListedCount = listed.files.length;

	const entryPath = join(root, "report.amx");
	writeFileSync(join(root, "schema.amx"), "```amx\nexport type Record {\n  id: String\n  value: Number\n}\n```\n");
	const inputPath = join(root, "records.csv");
	writeFileSync(entryPath, "```amx\nimport { Record } from \"./schema.amx\"\ninput records: Record[]\n```\n");
	const csv = ["id,value", ...Array.from({ length: 100_000 }, (_, index) => `R${String(index).padStart(6, "0")},${index}`)].join("\n") + "\n";
	writeFileSync(inputPath, csv);
	results.csvFixtureBytes = Buffer.byteLength(csv);
	const validationStart = performance.now();
	const loaded = await loadEntryModule(entryPath, { inputMappings: [`records=${inputPath}`] });
	results.parseAndValidateMilliseconds = Number((performance.now() - validationStart).toFixed(3));
	results.materializedRows = (loaded.env.get("records") as unknown[]).length;
	results.heapDeltaBytes = process.memoryUsage().heapUsed - beforeMemory;
	console.log(JSON.stringify(results, null, 2));
} finally {
	rmSync(root, { recursive: true, force: true });
}