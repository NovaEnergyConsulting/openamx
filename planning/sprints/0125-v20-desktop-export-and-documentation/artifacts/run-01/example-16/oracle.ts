import { deepStrictEqual } from "node:assert/strict";
import { join } from "node:path";
import { loadEntryModule } from "../../../../../../src/runtime/moduleLoader.ts";
import { run } from "./generated-supported/16_TypeScript_Transpilation.ts";

const repositoryRoot = process.cwd();
const examplePath = join(repositoryRoot, "examples/16_TypeScript_Transpilation.amx");
const assetPath = join(repositoryRoot, "examples/data/asset.json");
const amx = await loadEntryModule(examplePath, { inputMappings: [`asset=${assetPath}`] });
const generated = run({ asset: amx.env.get("asset") } as Parameters<typeof run>[0]);
const amxTable = amx.viewEmissions.find(view => view.kind === "table");
const amxChart = amx.viewEmissions.find(view => view.kind === "chart");
const generatedTable = generated.views.find(view => view.kind === "table");
const generatedChart = generated.views.find(view => view.kind === "chart");
const amxDiagram = amx.diagramEmissions[0]?.model;
const generatedDiagram = generated.views.find(view => view.kind === "diagram");
if (!amxTable || amxTable.kind !== "table" || !amxChart || amxChart.kind !== "chart"
	|| !generatedTable || generatedTable.kind !== "table" || !generatedChart || generatedChart.kind !== "chart"
	|| !amxDiagram || !generatedDiagram || generatedDiagram.kind !== "diagram") {
	throw new Error("Example 16 did not produce its expected table, chart, and diagram views.");
}
deepStrictEqual(generated.exports.assetName, amx.env.get("assetName"));
deepStrictEqual(generatedTable.rows, amxTable.data.map(row => {
	const values = row as Record<string, unknown>;
	return [values.label ?? null, values.score ?? null];
}));
deepStrictEqual(generatedChart.data, amxChart.data);
deepStrictEqual(generated.views.map(view => ({ kind: view.kind, name: view.name })), [
	...amx.viewEmissions.map(view => ({ kind: view.kind, name: view.name })),
	...amx.diagramEmissions.map(({ model }) => ({ kind: "diagram", name: model.name }))
]);
const diagramElements = amxDiagram.initialFrame.elements.map(({ source: _source, ...element }) => element);
deepStrictEqual(generatedDiagram, {
	kind: "diagram",
	schema: "structured-v2",
	name: amxDiagram.name,
	title: amxDiagram.title,
	description: amxDiagram.description,
	canvas: amxDiagram.canvas,
	timeline: amxDiagram.timeline,
	initialFrame: { time: amxDiagram.initialFrame.time, elements: diagramElements }
});

const oracleResult = {
	amxExports: { assetName: amx.env.get("assetName") },
	generatedExports: generated.exports,
	amxViews: amx.viewEmissions.map(view => ({ kind: view.kind, name: view.name, data: view.data })),
	amxDiagrams: amx.diagramEmissions.map(({ model }) => ({ name: model.name, title: model.title, elements: model.initialFrame.elements })),
	generatedViews: generated.views
};
const artifactPath = join(repositoryRoot, "planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/example-16/oracle-result.json");
await Bun.write(artifactPath, JSON.stringify(oracleResult, null, 2));
console.log(JSON.stringify(oracleResult, null, 2));