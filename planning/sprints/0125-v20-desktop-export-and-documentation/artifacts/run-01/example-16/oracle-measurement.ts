import { deepStrictEqual } from "node:assert/strict";
import { join } from "node:path";
import { loadEntryModule } from "../../../../../../src/runtime/moduleLoader.ts";
import { run } from "./generated-measurement/16_TypeScript_Transpilation.ts";

const directory = join(process.cwd(), "planning/sprints/0125-v20-desktop-export-and-documentation/artifacts/run-01/example-16");
const sourcePath = join(directory, "probe-source/16_TypeScript_Transpilation.amx");
const assetPath = join(process.cwd(), "examples/data/asset.json");
const amx = await loadEntryModule(sourcePath, { inputMappings: [`asset=${assetPath}`] });
const generated = run({ asset: amx.env.get("asset") } as Parameters<typeof run>[0]);
const amxSpeed = amx.env.get("averageSpeedResult") as { value: number; unit: { text: string } };
const generatedSpeed = generated.exports.averageSpeedResult as unknown as { value: number; unit: { text: string } };
deepStrictEqual(generated.exports.assetName, amx.env.get("assetName"));
deepStrictEqual([generatedSpeed.value, generatedSpeed.unit.text], [amxSpeed.value, amxSpeed.unit.text]);
console.log(JSON.stringify({ amxExports: { assetName: amx.env.get("assetName"), averageSpeedResult: amxSpeed }, generatedExports: generated.exports }));