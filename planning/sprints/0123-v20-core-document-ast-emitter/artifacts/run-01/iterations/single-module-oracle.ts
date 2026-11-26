import { deepStrictEqual } from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEntryModule } from '../../../../../../src/runtime/moduleLoader.ts';
import { run } from './main.ts';
const directory = dirname(fileURLToPath(import.meta.url));
const amx = await loadEntryModule(join(directory, "main.amx"));
const generated = run({});
deepStrictEqual(generated.exports, { result: amx.env.get("result"), readyExport: amx.env.get("readyExport"), stateExport: amx.env.get("stateExport") });
const events: Array<{ documentNodeIndex: number; statementIndex: number; view: unknown }> = [];
for (const emission of amx.viewEmissions) {
  if (emission.kind === "table") {
    const columns = emission.declaration.options.filter(option => option.type === "tableColumnOption").map(option => ({ field: option.field, label: option.label }));
    const title = emission.declaration.options.find(option => option.type === "viewTitleOption")?.value ?? emission.name;
    const rows = emission.data.map(item => columns.map(column => (item as Record<string, unknown>)[column.field] ?? null));
    events.push({ documentNodeIndex: emission.documentNodeIndex, statementIndex: emission.statementIndex, view: { kind: "table", name: emission.name, title, description: "", columns, rows } });
  } else {
    const title = emission.declaration.options.find(option => option.type === "viewTitleOption")?.value ?? emission.name;
    const description = emission.declaration.options.find(option => option.type === "viewDescriptionOption")?.value ?? "";
    events.push({ documentNodeIndex: emission.documentNodeIndex, statementIndex: emission.statementIndex, view: { kind: "chart", name: emission.name, chartKind: emission.declaration.kind, title, description, data: emission.data, ...(emission.labels === undefined ? {} : { labels: emission.labels }), ...(emission.headings === undefined ? {} : { headings: emission.headings }), ...(emission.measurementDescriptors?.length ? { measurementDescriptors: emission.measurementDescriptors } : {}), showTable: emission.showTable } });
  }
}
for (const { model } of amx.diagramEmissions) {
  const elements = model.initialFrame.elements.map(element => { const { source, ...primitive } = element; return primitive; });
  events.push({ documentNodeIndex: model.documentNodeIndex, statementIndex: model.statementIndex, view: { kind: "diagram", schema: "structured-v2", name: model.name, title: model.title, description: model.description, canvas: model.canvas, timeline: model.timeline, initialFrame: { time: model.initialFrame.time, elements } } });
}
events.sort((left, right) => left.documentNodeIndex - right.documentNodeIndex || left.statementIndex - right.statementIndex);
deepStrictEqual(generated.views, events.map(event => event.view));
console.log(JSON.stringify({ exports: generated.exports, views: generated.views }));
