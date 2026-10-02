<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import JsonEditorVue from "json-editor-vue";

interface Row {
	id: number;
	asset: string;
	status: string;
	value: number;
}

const grid = ref<any>();
const rows = ref<Row[]>([]);
const rowCount = ref(100_000);
const firstViewportMs = ref("not measured");
const visibleRows = ref(0);
const scrollHeight = ref(0);
const heapMb = ref("not measured");
const fallback = ref("");
const historyResult = ref("not tested");
const rawJson = ref('{"items":[{"name":"North","active":true}],"meta":{"version":1}}');
const parsedJson = ref(JSON.parse(rawJson.value));
const jsonMode = ref("tree");
const rawValid = ref(true);
const jsonEditCount = ref(0);
const cancellationMs = ref("not measured");
const compositionResult = ref("not tested");
const jsonModel = computed({
	get: () => parsedJson.value,
	set: (value: unknown) => {
		parsedJson.value = value;
		rawJson.value = `${JSON.stringify(value, null, 2)}\n`;
		jsonEditCount.value++;
	}
});

async function loadRows() {
	fallback.value = "";
	await nextTick();
	if (rowCount.value > 100_000) {
		await grid.value.reloadData([]);
		fallback.value = "This proof supports up to 100,000 rows. Keep the larger source in raw mode; no rows were truncated or loaded.";
		firstViewportMs.value = "bounded raw fallback";
	visibleRows.value = 0;
	return;
	}
	const started = performance.now();
	const data = Array.from({ length: rowCount.value }, (_, index) => ({
		id: index + 1,
		asset: `ASSET-${String(index + 1).padStart(6, "0")}`,
		status: index % 7 === 0 ? "Review" : "Active",
		value: (index % 997) / 10
	}));
	await grid.value.loadData(data);
	await nextTick();
	requestAnimationFrame(() => requestAnimationFrame(() => {
		firstViewportMs.value = (performance.now() - started).toFixed(1);
		visibleRows.value = document.querySelectorAll(".vxe-body--row").length;
		scrollHeight.value = document.querySelector<HTMLElement>(".vxe-table--scroll-y-handle")?.scrollHeight ?? 0;
		heapMb.value = ((performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0) > 0
			? (((performance as Performance & { memory?: { usedJSHeapSize: number } }).memory!.usedJSHeapSize / 1_048_576).toFixed(1))
			: "unavailable";
	}));
}

async function undoGrid() {
	const result = await grid.value?.undo?.();
	const firstAsset = grid.value?.getTableData?.().fullData?.[0]?.asset;
	historyResult.value = result ? `undo ${String(result.status)}; first asset: ${String(firstAsset)}` : "undo API unavailable";
}

async function redoGrid() {
	const result = await grid.value?.redo?.();
	const firstAsset = grid.value?.getTableData?.().fullData?.[0]?.asset;
	historyResult.value = result ? `redo ${String(result.status)}; first asset: ${String(firstAsset)}` : "redo API unavailable";
}

function updateRaw(next: string) {
	rawJson.value = next;
	try {
		parsedJson.value = JSON.parse(next);
		rawValid.value = true;
	} catch {
		rawValid.value = false;
	}
}

function enterTreeMode() {
	try {
		parsedJson.value = JSON.parse(rawJson.value);
		rawValid.value = true;
		jsonMode.value = "tree";
	} catch {
		rawValid.value = false;
	}
}

function measureComposition() {
	const input = document.querySelector<HTMLInputElement>("[data-ime-probe]");
	if (!input) return;
	let events = 0;
	input.addEventListener("compositionstart", () => events++);
	input.addEventListener("compositionend", () => events++);
	input.dispatchEvent(new CompositionEvent("compositionstart", { data: "に", bubbles: true }));
	input.value = "にほん";
	input.dispatchEvent(new InputEvent("input", { data: "ほん", inputType: "insertCompositionText", bubbles: true, isComposing: true }));
	input.dispatchEvent(new CompositionEvent("compositionend", { data: "にほん", bubbles: true }));
	compositionResult.value = `synthetic composition events: ${events}; native IME not exercised`;
}

function cancelWorker() {
	const started = performance.now();
	const worker = new Worker(new URL("./busy.worker.ts", import.meta.url), { type: "module" });
	worker.addEventListener("message", event => {
		if (event.data?.type !== "started") return;
		worker.terminate();
		cancellationMs.value = (performance.now() - started).toFixed(2);
	}, { once: true });
}
</script>

<template>
	<main>
		<header>
			<div>
				<p class="eyebrow">OpenAMX / Sprint 041</p>
				<h1>Structured data candidate proof</h1>
			</div>
			<button type="button" @click="measureComposition">Probe composition events</button>
		</header>
		<section class="grid-proof" aria-labelledby="csv-title">
			<div class="section-heading">
				<div><h2 id="csv-title">CSV grid / vxe-table</h2><p>Click a cell to edit. Source order is held separately from view operations.</p></div>
				<div class="controls">
					<label>Rows <input v-model.number="rowCount" type="number" min="100" max="200000" step="100" /></label>
					<button type="button" @click="loadRows">Load rows</button>
					<button type="button" @click="undoGrid">Undo</button>
					<button type="button" @click="redoGrid">Redo</button>
					<button type="button" @click="cancelWorker">Cancel worker</button>
				</div>
			</div>
			<div class="measurements" aria-live="polite">
				<span>Viewport: <output data-testid="viewport-ms">{{ firstViewportMs }} ms</output></span>
				<span>Rendered rows: <output data-testid="visible-rows">{{ visibleRows }}</output></span>
				<span>Scroll extent: <output data-testid="scroll-height">{{ scrollHeight }} px</output></span>
				<span>Browser heap: <output data-testid="heap-mb">{{ heapMb }} MB</output></span>
				<span>History: <output data-testid="history-result">{{ historyResult }}</output></span>
				<span>Cancel: <output data-testid="cancel-ms">{{ cancellationMs }} ms</output></span>
				<span>Composition: <output data-testid="composition-result">{{ compositionResult }}</output></span>
			</div>
			<input data-ime-probe aria-label="Composition probe" value="" />
			<p v-if="fallback" class="fallback" role="status">{{ fallback }}</p>
			<vxe-table v-else ref="grid" :data="rows" height="420" border keep-source :scroll-y="{ enabled: true, gt: 0 }" :edit-config="{ trigger: 'click', mode: 'cell' }" :keyboard-config="{ isArrow: true, isEnter: true, isTab: true, isEdit: true, isUndoRedo: true }">
				<vxe-column type="seq" title="#" width="70" />
				<vxe-column field="asset" title="Asset" min-width="180" :edit-render="{ name: 'input' }" />
				<vxe-column field="status" title="Status" min-width="140" :edit-render="{ name: 'input' }" />
				<vxe-column field="value" title="Value" min-width="130" :edit-render="{ name: 'input' }" />
			</vxe-table>
		</section>
		<section class="json-proof" aria-labelledby="json-title">
			<div class="section-heading">
				<div><h2 id="json-title">JSON tree / json-editor-vue</h2><p>Invalid raw text remains untouched; structured mode is gated on parse success.</p></div>
				<div class="controls"><button type="button" @click="enterTreeMode">Open structured mode</button></div>
			</div>
			<div class="json-modes">
				<div>
					<label for="raw-json">Authoritative raw source</label>
					<textarea id="raw-json" aria-label="JSON raw source" :value="rawJson" @input="updateRaw(($event.target as HTMLTextAreaElement).value)" />
					<output data-testid="raw-status">{{ rawValid ? "Valid JSON" : "Invalid JSON retained exactly" }}</output>
				</div>
				<div>
					<label>Structured tree <span v-if="!rawValid">Unavailable while source is invalid</span></label>
					<div class="json-editor-frame">
						<JsonEditorVue v-if="rawValid" v-model="jsonModel" :mode="jsonMode" :main-menu-bar="false" :navigation-bar="false" />
						<p v-else class="unavailable">Repair the raw JSON to enable structured editing. Raw bytes are preserved.</p>
					</div>
					<output data-testid="json-edit-count">Structured updates: {{ jsonEditCount }}</output>
				</div>
			</div>
		</section>
	</main>
</template>

<style>
:root { font-family: "DM Sans", sans-serif; color: #18322d; background: #edf2ee; font-synthesis: none; }
* { box-sizing: border-box; }
body { margin: 0; }
button, input, textarea { font: inherit; }
button { border: 1px solid #82928b; border-radius: 4px; background: #fff; color: #18322d; min-height: 34px; padding: 0 11px; cursor: pointer; }
button:hover { background: #e3ede7; }
main { width: min(1440px, calc(100vw - 40px)); margin: 24px auto; display: grid; gap: 20px; }
header, .section-heading, .controls, .measurements { display: flex; align-items: center; gap: 10px; }
header, .section-heading { justify-content: space-between; }
h1, h2, p { margin: 0; }
h1 { font: 600 24px "Newsreader", Georgia, serif; }
h2 { font-size: 16px; }
.eyebrow { color: #a34a32; text-transform: uppercase; font-size: 11px; font-weight: 700; }
.grid-proof, .json-proof { background: #fff; border: 1px solid #ced8d2; padding: 16px; }
.section-heading p { margin-top: 4px; color: #66746d; font-size: 12px; }
.controls { flex-wrap: wrap; justify-content: flex-end; }
.controls label { display: flex; align-items: center; gap: 6px; }
.controls input { width: 100px; height: 34px; border: 1px solid #9ca9a2; padding: 0 7px; }
.measurements { min-height: 34px; flex-wrap: wrap; font: 12px ui-monospace, monospace; color: #40524a; }
.measurements output { color: #a34a32; }
[data-ime-probe] { width: 1px; height: 1px; position: absolute; left: -10000px; }
.json-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
.json-modes > div { min-width: 0; display: grid; grid-template-rows: auto minmax(300px, 360px) auto; gap: 7px; }
.json-modes label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; }
textarea { width: 100%; resize: vertical; border: 1px solid #9ca9a2; padding: 10px; font: 12px/1.5 ui-monospace, monospace; }
.json-editor-frame { min-height: 300px; overflow: auto; border: 1px solid #9ca9a2; }
.json-editor-frame > :deep(*) { min-height: 298px; }
.unavailable { padding: 18px; color: #8d3828; }
.fallback { min-height: 120px; padding: 24px; border: 1px solid #d0a28d; background: #fbf2ec; color: #793a27; }
@media (max-width: 800px) { .json-modes { grid-template-columns: 1fr; } header, .section-heading { align-items: flex-start; flex-direction: column; } }
</style>