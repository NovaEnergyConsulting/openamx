<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import DataEditorPane from "../../../src/mainview/components/DataEditorPane.vue";
import type { DataInputSchema, TextDiagnostic } from "../../../src/shared/rpc";

const kind = ref<"csv" | "json">("csv");
const source = ref("asset,status,value\nASSET-000001,Active,0\n");
const revision = ref(1);
const rowCount = ref(100_000);
const sourceMeasurement = ref("Load a data fixture to measure the production editor component.");
const sourceBytes = ref(0);
const viewportMeasurement = ref("");
const completeMeasurement = ref("");
const dataPane = ref<InstanceType<typeof DataEditorPane> | null>(null);
const schema: DataInputSchema = {
	name: "rows", type: "Row[]", acceptedFormats: ["csv", "json"],
	fields: [
		{ name: "asset", type: "String", optional: false, hasDefault: false },
		{ name: "status", type: "String", optional: false, hasDefault: false },
		{ name: "value", type: "Number", optional: false, hasDefault: false }
	]
};
const diagnostics = ref<TextDiagnostic[]>([]);
const longTasks = ref<number[]>([]);
let observer: PerformanceObserver | undefined;
try {
	observer = new PerformanceObserver(entries => { longTasks.value.push(...entries.getEntries().map(entry => entry.duration)); });
	observer.observe({ type: "longtask", buffered: true });
} catch { /* Long Task API is not available in every embedded Chromium. */ }
const rowText = computed(() => `Rows: ${rowCount.value.toLocaleString()}`);

async function loadFixture(format: "csv" | "json") {
	kind.value = format;
	viewportMeasurement.value = "";
	completeMeasurement.value = "";
	longTasks.value = [];
	sourceMeasurement.value = `Generating ${rowText.value} ${format.toUpperCase()} in fixture worker…`;
	const { text, bytes } = await new Promise<{ text: string; bytes: number }>((resolve, reject) => {
		const worker = new Worker(new URL("./fixture.worker.ts", import.meta.url), { type: "module" });
		worker.addEventListener("message", event => { worker.terminate(); resolve(event.data); }, { once: true });
		worker.addEventListener("error", event => { worker.terminate(); reject(new Error(event.message)); }, { once: true });
		worker.postMessage({ rows: rowCount.value, format });
	});
	sourceBytes.value = bytes;
	source.value = text;
	revision.value++;
	await nextTick();
	sourceMeasurement.value = `Source ${bytes.toLocaleString()} bytes · parser result pending`;
}

function onReady(value: { kind: "csv" | "json"; phase: "viewport" | "complete"; rows: number; columns: number; elapsedMs: number; parseMs: number; materializeMs: number; gridMs: number; structured: boolean }) {
	if (kind.value !== value.kind) return;
	const measurement = `${value.rows.toLocaleString()} rows × ${value.columns} columns · ${value.elapsedMs.toFixed(1)} ms (parse ${value.parseMs.toFixed(1)} · materialize ${value.materializeMs.toFixed(1)} · grid ${value.gridMs.toFixed(1)}) · ${value.structured ? "structured" : "raw fallback"}`;
	sourceMeasurement.value = `Source ${sourceBytes.value.toLocaleString()} bytes · ${value.structured ? "structured" : "raw fallback"}`;
	if (value.phase === "viewport") viewportMeasurement.value = measurement;
	else completeMeasurement.value = measurement;
}

function changed(text: string) {
	source.value = text;
	revision.value++;
}

function focusDiagnostic() {
	diagnostics.value = [{ code: "AMX4003", message: "Fixture validation location", dataPath: "record[50000].value", dataLine: 50001, dataColumn: 18 }];
	void nextTick(() => dataPane.value?.focusDataLocation(50001, 18));
}
</script>

<template>
	<main>
		<header><h1>Production DataEditorPane check</h1><label>Fixture rows <input v-model.number="rowCount" type="number" min="1" max="100001" /></label></header>
		<div class="harness-actions"><button type="button" @click="loadFixture('csv')">Load CSV</button><button type="button" @click="loadFixture('json')">Load JSON array</button><button type="button" @click="focusDiagnostic">Navigate diagnostic</button></div>
		<output aria-live="polite">{{ sourceMeasurement }}</output>
		<output>First usable viewport: {{ viewportMeasurement || "not measured" }}</output>
		<output>Complete load: {{ completeMeasurement || "not measured" }}</output>
		<output>Long tasks over 50 ms: {{ longTasks.map(value => value.toFixed(1)).join(", ") || "none observed" }}</output>
		<DataEditorPane ref="dataPane" :kind="kind" :text="source" :revision="revision" :schema="schema" :diagnostics="diagnostics" input-name="rows" @change="changed" @ready="onReady" />
	</main>
</template>

<style>
html, body, #app { min-height: 100%; margin: 0; }
body { background: #edf2ee; color: #18322d; font: 13px "DM Sans", sans-serif; }
main { display: flex; width: min(1440px, calc(100vw - 32px)); height: calc(100vh - 32px); flex-direction: column; gap: 8px; margin: 16px auto; padding: 12px; background: #fff; }
header { display: flex; align-items: baseline; gap: 12px; }
header label { display: flex; align-items: center; gap: 6px; }
header input { width: 100px; min-height: 28px; border: 1px solid #82928b; padding: 3px 6px; }
h1 { margin: 0; font: 600 20px "Newsreader", Georgia, serif; }
p { margin: 0; }
.harness-actions { display: flex; gap: 6px; }
button { min-height: 30px; border: 1px solid #82928b; border-radius: 4px; background: white; padding: 4px 9px; }
output { font: 11px ui-monospace, monospace; }
.data-editor-pane { border: 1px solid #ced8d2; }
</style>