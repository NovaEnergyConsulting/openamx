import { deepStrictEqual } from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEntryModule } from '../../../../../../src/runtime/moduleLoader.ts';
import { run } from './main.ts';
const directory = dirname(fileURLToPath(import.meta.url));
const amx = await loadEntryModule(join(directory, "main.amx"), { inputMappings: [`payload=${join(directory, "payload.json")}`] });
const payload = { payload: { distance: { value: 1.5, unit: "meter" }, status: "ready", priority: 2, observedAt: "2024-02-29T12:30:00Z", locations: [{ label: "Site A", value: { value: 500, unit: "centimeter" }, measuredAt: "2024-02-29T12:30:00Z" }], labels: ["First", null] } } as unknown as Parameters<typeof run>[0];
const generated = run(payload);
const replay = run(payload);
if (replay.exports === generated.exports || replay.views === generated.views) throw new Error("Generated run state was reused");
function normalizeVector(vector: unknown): unknown { if (!vector || typeof vector !== "object") return vector; return Object.fromEntries(Object.entries(vector).map(([identity, exponent]) => { let name = identity; try { const key = JSON.parse(identity) as unknown; if (Array.isArray(key) && typeof key[1] === "string") name = key[1]; } catch {} return [name, exponent]; })); }
function normalize(value: unknown): unknown { if (Array.isArray(value)) return value.map(normalize); if (!value || typeof value !== "object") return value; const result: Record<string, unknown> = {}; for (const [key, item] of Object.entries(value)) { if (key === "vector") result[key] = normalizeVector(item); else if (key === "factors" && Array.isArray(item)) result[key] = item.map(factor => { const entry = factor as { name: string; exponent: number }; return { name: entry.name, exponent: entry.exponent }; }); else result[key] = normalize(item); } return result; }
deepStrictEqual(normalize(generated.exports), normalize({ result: amx.env.get("result"), readyExport: amx.env.get("readyExport"), distanceMeters: amx.env.get("distanceMeters"), converted: amx.env.get("converted"), summary: amx.env.get("summary"), observedAt: amx.env.get("observedAt"), firstLocationRating: amx.env.get("firstLocationRating"), firstLocationNote: amx.env.get("firstLocationNote"), secondLabel: amx.env.get("secondLabel"), distanceMetersAgain: amx.env.get("distanceMetersAgain") }));
const events: Array<{ moduleOrder: number; documentNodeIndex: number; statementIndex: number; view: unknown }> = [];
for (const emission of amx.viewEmissions) {
  if (emission.kind === "table") {
    const columns = emission.declaration.options.filter(option => option.type === "tableColumnOption").map(option => ({ field: option.field, label: option.label }));
    const title = emission.declaration.options.find(option => option.type === "viewTitleOption")?.value ?? emission.name;
    const rows = emission.data.map(item => columns.map(column => (item as Record<string, unknown>)[column.field] ?? null));
    events.push({ moduleOrder: 1, documentNodeIndex: emission.documentNodeIndex, statementIndex: emission.statementIndex, view: { kind: "table", name: emission.name, title, description: "", columns, rows } });
  } else {
    const title = emission.declaration.options.find(option => option.type === "viewTitleOption")?.value ?? emission.name;
    const description = emission.declaration.options.find(option => option.type === "viewDescriptionOption")?.value ?? "";
    events.push({ moduleOrder: 1, documentNodeIndex: emission.documentNodeIndex, statementIndex: emission.statementIndex, view: { kind: "chart", name: emission.name, chartKind: emission.declaration.kind, title, description, data: emission.data, ...(emission.labels === undefined ? {} : { labels: emission.labels }), ...(emission.headings === undefined ? {} : { headings: emission.headings }), ...(emission.measurementDescriptors?.length ? { measurementDescriptors: emission.measurementDescriptors } : {}), showTable: emission.showTable } });
  }
}
for (const { model } of amx.diagramEmissions) {
  const elements = model.initialFrame.elements.map(element => { const { source, ...primitive } = element; return primitive; });
  events.push({ moduleOrder: model.file?.endsWith("types.amx") ? 0 : 1, documentNodeIndex: model.documentNodeIndex, statementIndex: model.statementIndex, view: { kind: "diagram", schema: "structured-v2", name: model.name, title: model.title, description: model.description, canvas: model.canvas, timeline: model.timeline, initialFrame: { time: model.initialFrame.time, elements } } });
}
events.sort((left, right) => left.moduleOrder - right.moduleOrder || left.documentNodeIndex - right.documentNodeIndex || left.statementIndex - right.statementIndex);
deepStrictEqual(normalize(generated.views), normalize(events.map(event => event.view)));
let generatedInputCode = ""; try { run({ payload: { distance: { value: 1.5, unit: "meter" }, status: "unknown" } } as unknown as Parameters<typeof run>[0]); } catch (error) { generatedInputCode = (error as { code?: string }).code ?? ""; }
let amxInputCode = ""; try { await loadEntryModule(join(directory, "main.amx"), { inputMappings: [`payload=${join(directory, "invalid-payload.json")}`] }); } catch (error) { amxInputCode = (error as { code?: string }).code ?? ""; }
if (generatedInputCode !== "AMX4003" || amxInputCode !== generatedInputCode) throw new Error(`Input diagnostic mismatch: ${generatedInputCode} !== ${amxInputCode}`);
console.log(JSON.stringify({ exports: generated.exports, views: generated.views, generatedInputCode, amxInputCode }));
