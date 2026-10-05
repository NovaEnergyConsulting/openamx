<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import JsonEditorVue from "json-editor-vue";
import { Mode } from "vanilla-jsoneditor";
import { serializeCsvText } from "../../../../src/runtime/csvTextSerialization";
import type { CsvTextCell, DataTextParseResult } from "../../../../src/runtime/dataText";
import type { DataInputSchema, TextDiagnostic } from "../../shared/rpc";

type DataKind = "csv" | "json";
type GridRow = Record<string, unknown> & { __editorRowId: number; __quoted?: boolean[] };
type CsvColumn = { key: string; name: string; schema?: NonNullable<DataInputSchema["fields"]>[number] };
interface WorkerParseResponse {
	id: number;
	issue?: DataTextParseResult<unknown>["issue"];
	jsonValue?: unknown;
	csvHeaders?: CsvTextCell[];
	csvRowsJson?: string;
	rowCount?: number;
}

const props = defineProps<{
	kind: DataKind;
	text: string;
	revision: number;
	schema?: DataInputSchema;
	diagnostics?: TextDiagnostic[];
	external?: boolean;
	inputName?: string;
}>();
const emit = defineEmits<{
	change: [text: string];
	navigateDeclaration: [];
	ready: [measurement: { kind: DataKind; phase: "viewport" | "complete"; rows: number; columns: number; elapsedMs: number; parseMs: number; materializeMs: number; gridMs: number; structured: boolean }];
}>();

const MAX_GRID_ROWS = 100_000;
const rawText = ref(props.text);
const editorMode = ref<"structured" | "raw">("structured");
const searchText = ref("");
const selectedField = ref("");
const sortOrders = ref(new Map<string, "asc" | "desc" | null>());
const csvHeaders = ref<CsvTextCell[]>([]);
const csvRows = ref<GridRow[]>([]);
const jsonValue = ref<unknown>(null);
const jsonRows = ref<GridRow[]>([]);
const jsonFields = ref<string[]>([]);
const jsonFieldTypes = ref(new Map<string, string>());
const jsonArrayGrid = ref(false);
const gridRows = ref<GridRow[]>([]);
const gridRef = ref<any>();
const gridLoading = ref(false);
const gridRowsLoaded = ref(0);
const rawTextarea = ref<HTMLTextAreaElement | null>(null);
const parseError = ref("");
const localDiagnostics = ref<TextDiagnostic[]>([]);
let nextRowId = 0;
let suppressJsonCommit = false;
let lastEmittedText: string | undefined;
let workerMessageId = 0;
let parseRevision = 0;
let gridLoadRequest = 0;
let parserWorker: Worker | undefined;
let parseTimer: ReturnType<typeof setTimeout> | undefined;
const parseWaiters = new Map<number, (response: WorkerParseResponse) => void>();

function stopParserWorker(message: string) {
	parserWorker?.terminate();
	parserWorker = undefined;
	for (const resolve of parseWaiters.values()) resolve({ id: 0, issue: { message } });
	parseWaiters.clear();
}

function getParserWorker(): Worker {
	if (parserWorker) return parserWorker;
	parserWorker = new Worker(new URL("./dataText.worker.ts", import.meta.url), { type: "module" });
	parserWorker.addEventListener("message", (event: MessageEvent<WorkerParseResponse>) => {
		const resolve = parseWaiters.get(event.data.id);
		if (!resolve) return;
		parseWaiters.delete(event.data.id);
		resolve(event.data);
	});
	parserWorker.addEventListener("error", () => stopParserWorker("The background data parser stopped unexpectedly."));
	return parserWorker;
}

function parseInWorker(format: DataKind, text: string): Promise<WorkerParseResponse> {
	if (parseWaiters.size) stopParserWorker("Parsing was superseded by a newer document revision.");
	const id = ++workerMessageId;
	return new Promise(resolve => {
		parseWaiters.set(id, resolve);
		getParserWorker().postMessage({ id, format, text });
	});
}

const csvColumns = computed<CsvColumn[]>(() => csvHeaders.value.map((header, index) => ({
	key: `field${index}`,
	name: header.value,
	schema: props.schema?.fields?.find(field => field.name === header.value)
})));
const fieldChoices = computed(() => props.kind === "csv" ? csvColumns.value : jsonFields.value.map(name => ({ key: name, name })));
const searchableFields = computed(() => props.kind === "csv" ? csvColumns.value.map(column => column.key) : jsonFields.value);
const sourceRows = computed(() => props.kind === "csv" ? csvRows.value : jsonRows.value);
const visibleRows = computed(() => {
	const query = searchText.value.trim().toLocaleLowerCase();
	if (!query) return sourceRows.value;
	return sourceRows.value.filter(row => searchableFields.value.some(field => String(row[field] ?? "").toLocaleLowerCase().includes(query)));
});
const gridAvailable = computed(() => props.kind === "csv" ? csvHeaders.value.length > 0 : jsonArrayGrid.value);
const activeDiagnostics = computed(() => [...(props.diagnostics ?? []), ...localDiagnostics.value]);

function setParseError(message: string, code = "AMX4002") {
	parseError.value = message;
	localDiagnostics.value = [{ code, message }];
}

async function reloadGrid(onFirstViewport?: () => void) {
	const request = ++gridLoadRequest;
	const rows = visibleRows.value;
	gridLoading.value = true;
	gridRowsLoaded.value = 0;
	gridRows.value = rows;
	await nextTick();
	try {
		if (request !== gridLoadRequest || !gridRef.value) return;
		gridRowsLoaded.value = rows.length;
		onFirstViewport?.();
	} catch {
		setParseError("The virtual grid could not load this data safely. Raw source remains available.", "DESKTOP_DATA_GRID");
	} finally {
		if (request === gridLoadRequest) gridLoading.value = false;
	}
}

async function loadCsv(text: string, revision: number) {
	const started = performance.now();
	const parsed = await parseInWorker("csv", text);
	const parsedAt = performance.now();
	if (revision !== parseRevision || text !== rawText.value) return;
	csvHeaders.value = [];
	csvRows.value = [];
	parseError.value = "";
	localDiagnostics.value = [];
	if (parsed.issue) {
		setParseError(parsed.issue.message, parsed.issue.code ?? (parsed.issue.duplicate ? "AMX4003" : "AMX4002"));
		const completed = performance.now();
		emit("ready", { kind: "csv", phase: "complete", rows: parsed.rowCount ?? 0, columns: 0, elapsedMs: completed - started, parseMs: parsedAt - started, materializeMs: 0, gridMs: completed - parsedAt, structured: false });
		return;
	}
	const headers = parsed.csvHeaders ?? [];
	if (!headers.length) { setParseError("CSV needs a non-empty header row before structured editing is available."); return; }
	if (headers.some(header => !header.value.trim())) { setParseError("CSV headers must be non-empty before structured editing is available."); return; }
	if (new Set(headers.map(header => header.value)).size !== headers.length) { setParseError("Duplicate CSV headers cannot be represented safely in the grid. Edit raw text to resolve them.", "AMX4003"); return; }
	csvHeaders.value = headers.map(cell => ({ ...cell }));
	if (!selectedField.value) selectedField.value = "field0";
	try { csvRows.value = JSON.parse(parsed.csvRowsJson ?? "[]") as GridRow[]; }
	catch { setParseError("CSV records could not be materialized safely."); return; }
	nextRowId = Math.max(nextRowId, parsed.rowCount ?? csvRows.value.length);
	const materializedAt = performance.now();
	await reloadGrid(() => {
		const firstReady = performance.now();
		emit("ready", { kind: "csv", phase: "viewport", rows: csvRows.value.length, columns: csvHeaders.value.length, elapsedMs: firstReady - started, parseMs: parsedAt - started, materializeMs: materializedAt - parsedAt, gridMs: firstReady - materializedAt, structured: true });
	});
	if (parseError.value) return;
	const completed = performance.now();
	emit("ready", { kind: "csv", phase: "complete", rows: csvRows.value.length, columns: csvHeaders.value.length, elapsedMs: completed - started, parseMs: parsedAt - started, materializeMs: materializedAt - parsedAt, gridMs: completed - materializedAt, structured: true });
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object" && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function hasScalarCells(record: Record<string, unknown>): boolean {
	return Object.values(record).every(value => value === null || ["string", "number", "boolean"].includes(typeof value));
}

async function loadJson(text: string, revision: number) {
	const started = performance.now();
	const parsed = await parseInWorker("json", text);
	const parsedAt = performance.now();
	if (revision !== parseRevision || text !== rawText.value) return;
	parseError.value = "";
	localDiagnostics.value = [];
	jsonRows.value = [];
	jsonFields.value = [];
	jsonFieldTypes.value = new Map();
	jsonArrayGrid.value = false;
	if (parsed.issue) {
		setParseError(`${parsed.issue.message}${parsed.issue.dataPath ? ` at ${parsed.issue.dataPath}` : ""}`, parsed.issue.code ?? (parsed.issue.duplicate ? "AMX4003" : "AMX4002"));
		const complete = performance.now();
		emit("ready", { kind: "json", phase: "complete", rows: 0, columns: 0, elapsedMs: complete - started, parseMs: parsedAt - started, materializeMs: 0, gridMs: complete - parsedAt, structured: false });
		return;
	}
	const value = parsed.jsonValue;
	if (value === undefined) { setParseError("The validated JSON value could not be materialized safely."); return; }
	if (!Array.isArray(value)) {
		suppressJsonCommit = true;
		jsonValue.value = value;
		await nextTick();
		suppressJsonCommit = false;
		const materializedAt = performance.now();
		const complete = performance.now();
		emit("ready", { kind: "json", phase: "complete", rows: 0, columns: 0, elapsedMs: complete - started, parseMs: parsedAt - started, materializeMs: materializedAt - parsedAt, gridMs: complete - materializedAt, structured: true });
		return;
	}
	if (value.length > MAX_GRID_ROWS) { setParseError(`This JSON array exceeds ${MAX_GRID_ROWS.toLocaleString()} records. Keep it in raw mode; no records were truncated.`, "DESKTOP_DATA_LIMIT"); return; }
	if (!value.length && props.schema?.type.endsWith("[]") && props.schema.fields?.length) {
		jsonFields.value = props.schema.fields.map(field => field.name);
		selectedField.value = jsonFields.value[0] ?? "";
		jsonFieldTypes.value = new Map(props.schema.fields.map(field => [field.name, field.type]));
		jsonArrayGrid.value = true;
		const materializedAt = performance.now();
		await reloadGrid(() => emit("ready", { kind: "json", phase: "viewport", rows: 0, columns: jsonFields.value.length, elapsedMs: performance.now() - started, parseMs: parsedAt - started, materializeMs: materializedAt - parsedAt, gridMs: performance.now() - materializedAt, structured: true }));
		const complete = performance.now();
		emit("ready", { kind: "json", phase: "complete", rows: 0, columns: jsonFields.value.length, elapsedMs: complete - started, parseMs: parsedAt - started, materializeMs: materializedAt - parsedAt, gridMs: complete - materializedAt, structured: true });
		return;
	}
	const records = value.filter(isPlainRecord);
	if (!records.length || records.length !== value.length) {
		suppressJsonCommit = true;
		jsonValue.value = value;
		await nextTick();
		suppressJsonCommit = false;
		const materializedAt = performance.now();
		const complete = performance.now();
		emit("ready", { kind: "json", phase: "complete", rows: 0, columns: 0, elapsedMs: complete - started, parseMs: parsedAt - started, materializeMs: materializedAt - parsedAt, gridMs: complete - materializedAt, structured: true });
		return;
	}
	const fields = Object.keys(records[0]!);
	if (!fields.length || !records.every(record => {
		const keys = Object.keys(record);
		return keys.length === fields.length && keys.every((key, index) => key === fields[index]) && hasScalarCells(record);
	})) {
		suppressJsonCommit = true;
		jsonValue.value = value;
		await nextTick();
		suppressJsonCommit = false;
		const materializedAt = performance.now();
		const complete = performance.now();
		emit("ready", { kind: "json", phase: "complete", rows: 0, columns: 0, elapsedMs: complete - started, parseMs: parsedAt - started, materializeMs: materializedAt - parsedAt, gridMs: complete - materializedAt, structured: true });
		return;
	}
	jsonFields.value = fields;
	selectedField.value = fields[0] ?? "";
	jsonFieldTypes.value = new Map(fields.map(field => [field, typeof records[0]![field]]));
	jsonRows.value = records.map(record => ({ ...record, __editorRowId: nextRowId++ }));
	jsonArrayGrid.value = true;
	const rowsReady = performance.now();
	await reloadGrid(() => emit("ready", { kind: "json", phase: "viewport", rows: jsonRows.value.length, columns: jsonFields.value.length, elapsedMs: performance.now() - started, parseMs: parsedAt - started, materializeMs: rowsReady - parsedAt, gridMs: performance.now() - rowsReady, structured: true }));
	const complete = performance.now();
	emit("ready", { kind: "json", phase: "complete", rows: jsonRows.value.length, columns: jsonFields.value.length, elapsedMs: complete - started, parseMs: parsedAt - started, materializeMs: rowsReady - parsedAt, gridMs: complete - rowsReady, structured: true });
}

function loadText(text: string) {
	rawText.value = text;
	sortOrders.value = new Map();
	void gridRef.value?.clearSort();
	const revision = ++parseRevision;
	if (props.kind === "csv") void loadCsv(text, revision);
	else void loadJson(text, revision);
}

function commitText(text: string) {
	if (text === rawText.value) return;
	rawText.value = text;
	lastEmittedText = text;
	emit("change", text);
}

function onRawInput(event: Event) {
	const text = (event.target as HTMLTextAreaElement).value;
	rawText.value = text;
	lastEmittedText = text;
	emit("change", text);
	parseError.value = "";
	localDiagnostics.value = [];
	if (parseTimer) clearTimeout(parseTimer);
	const revision = ++parseRevision;
	parseTimer = setTimeout(() => {
		if (props.kind === "csv") void loadCsv(text, revision);
		else void loadJson(text, revision);
	}, 180);
}

function csvSourceRows(): CsvTextCell[][] {
	const header = csvHeaders.value.map(cell => ({ ...cell }));
	const records = csvRows.value.map(row => csvColumns.value.map((column, index) => ({ value: String(row[column.key] ?? ""), quoted: row.__quoted?.[index] ?? false })));
	return [header, ...records];
}

function commitCsvRows() {
	if (props.kind === "csv" && !parseError.value) commitText(serializeCsvText(csvSourceRows()));
}

function normalizeJsonCell(value: unknown, field: string): unknown {
	const originalType = jsonFieldTypes.value.get(field);
	if (typeof value !== "string") return value;
	if (originalType === "number" && value.trim() !== "") { const number = Number(value); if (Number.isFinite(number)) return number; }
	if (originalType === "boolean" && (value === "true" || value === "false")) return value === "true";
	return value;
}

function commitJsonRows() {
	if (props.kind !== "json" || !jsonArrayGrid.value) return;
	const records = jsonRows.value.map(row => Object.fromEntries(jsonFields.value.map(field => [field, normalizeJsonCell(row[field], field)])));
	suppressJsonCommit = true;
	jsonValue.value = records;
	commitText(`${JSON.stringify(records, null, 2)}\n`);
	void nextTick(() => { suppressJsonCommit = false; });
}

watch(jsonValue, value => {
	if (suppressJsonCommit || props.kind !== "json" || jsonArrayGrid.value || value === null || value === undefined) return;
	try { commitText(`${JSON.stringify(value, null, 2)}\n`); }
	catch { setParseError("This JSON value cannot be serialized safely; raw text is unchanged."); }
}, { deep: true });

function onGridEdit() { if (gridLoading.value) return; if (props.kind === "csv") commitCsvRows(); else commitJsonRows(); }
async function runHistory(direction: "undo" | "redo") { if (!gridRef.value || gridLoading.value) return; await gridRef.value[direction](); await nextTick(); onGridEdit(); }
async function toggleSort(field: string) {
	if (!gridRef.value || gridLoading.value) return;
	const current = sortOrders.value.get(field) ?? null;
	const order = current === "asc" ? "desc" : current === "desc" ? null : "asc";
	const next = new Map(sortOrders.value);
	next.set(field, order);
	sortOrders.value = next;
	await gridRef.value.sort(field, order);
}

function addRow() {
	if (gridLoading.value) return;
	if (props.kind === "csv") {
		const row: GridRow = { __editorRowId: nextRowId++, __quoted: [] };
		csvColumns.value.forEach((column, index) => { row[column.key] = ""; row.__quoted![index] = false; });
		csvRows.value = [...csvRows.value, row];
		void reloadGrid().then(commitCsvRows);
	} else {
		const row: GridRow = { __editorRowId: nextRowId++ };
		jsonFields.value.forEach(field => { row[field] = null; });
		jsonRows.value = [...jsonRows.value, row];
		void reloadGrid().then(commitJsonRows);
	}
}

function removeSelectedRows() {
	if (gridLoading.value) return;
	const selected = new Set((gridRef.value?.getCheckboxRecords?.() ?? []).map((row: GridRow) => row.__editorRowId));
	if (!selected.size) return;
	if (props.kind === "csv") { csvRows.value = csvRows.value.filter(row => !selected.has(row.__editorRowId)); void reloadGrid().then(commitCsvRows); }
	else { jsonRows.value = jsonRows.value.filter(row => !selected.has(row.__editorRowId)); void reloadGrid().then(commitJsonRows); }
}

function addField() {
	if (gridLoading.value) return;
	if (props.kind === "csv") {
		const index = csvHeaders.value.length;
		csvHeaders.value = [...csvHeaders.value, { value: `Column ${index + 1}`, quoted: false }];
		selectedField.value = `field${index}`;
		csvRows.value.forEach(row => { row[`field${index}`] = ""; row.__quoted?.push(false); });
		void reloadGrid().then(commitCsvRows);
	} else {
		const field = `field${jsonFields.value.length + 1}`;
		jsonFields.value = [...jsonFields.value, field];
		selectedField.value = field;
		jsonRows.value.forEach(row => { row[field] = null; });
		jsonFieldTypes.value.set(field, "object");
		void reloadGrid().then(commitJsonRows);
	}
}

function removeLastField() {
	if (gridLoading.value) return;
	if (props.kind === "csv" && csvHeaders.value.length > 1) {
		const index = csvHeaders.value.length - 1;
		csvHeaders.value = csvHeaders.value.slice(0, index);
		selectedField.value = `field${Math.max(0, index - 1)}`;
		csvRows.value.forEach(row => { delete row[`field${index}`]; row.__quoted?.pop(); });
		void reloadGrid().then(commitCsvRows);
	} else if (props.kind === "json" && jsonFields.value.length > 1) {
		const field = jsonFields.value.at(-1)!;
		jsonFields.value = jsonFields.value.slice(0, -1);
		selectedField.value = jsonFields.value.at(-1) ?? "";
		jsonRows.value.forEach(row => { delete row[field]; });
		jsonFieldTypes.value.delete(field);
		void reloadGrid().then(commitJsonRows);
	}
}

function moveSelectedRows(direction: -1 | 1) {
	if (gridLoading.value) return;
	const selected = new Set((gridRef.value?.getCheckboxRecords?.() ?? []).map((row: GridRow) => row.__editorRowId));
	if (!selected.size) return;
	const rows = props.kind === "csv" ? csvRows.value : jsonRows.value;
	if (direction < 0) {
		for (let index = 1; index < rows.length; index++) if (selected.has(rows[index]!.__editorRowId) && !selected.has(rows[index - 1]!.__editorRowId)) [rows[index - 1], rows[index]] = [rows[index]!, rows[index - 1]!];
	} else {
		for (let index = rows.length - 2; index >= 0; index--) if (selected.has(rows[index]!.__editorRowId) && !selected.has(rows[index + 1]!.__editorRowId)) [rows[index], rows[index + 1]] = [rows[index + 1]!, rows[index]!];
	}
	if (props.kind === "csv") { csvRows.value = [...rows]; void reloadGrid().then(commitCsvRows); }
	else { jsonRows.value = [...rows]; void reloadGrid().then(commitJsonRows); }
}

function moveSelectedField(direction: -1 | 1) {
	if (gridLoading.value) return;
	if (props.kind === "csv") {
		const index = Number(selectedField.value.slice(5));
		const next = index + direction;
		if (!Number.isSafeInteger(index) || index < 0 || next < 0 || next >= csvHeaders.value.length) return;
		[csvHeaders.value[index], csvHeaders.value[next]] = [csvHeaders.value[next]!, csvHeaders.value[index]!];
		for (const row of csvRows.value) { [row[`field${index}`], row[`field${next}`]] = [row[`field${next}`], row[`field${index}`]]; [row.__quoted![index], row.__quoted![next]] = [row.__quoted![next]!, row.__quoted![index]!]; }
		selectedField.value = `field${next}`;
		void reloadGrid().then(commitCsvRows);
	} else {
		const index = jsonFields.value.indexOf(selectedField.value);
		const next = index + direction;
		if (index < 0 || next < 0 || next >= jsonFields.value.length) return;
		[jsonFields.value[index], jsonFields.value[next]] = [jsonFields.value[next]!, jsonFields.value[index]!];
		selectedField.value = jsonFields.value[next]!;
		void reloadGrid().then(commitJsonRows);
	}
}

function applySearch() { if (!gridLoading.value) void reloadGrid(); }
function navigateDataDiagnostic(item: TextDiagnostic) { if (item.dataLine) focusDataLocation(item.dataLine, item.dataColumn ?? 1); }
function focusDataLocation(line: number, column = 1) {
	if (!Number.isSafeInteger(line) || line < 1) return;
	editorMode.value = "raw";
	void nextTick(() => {
		if (!rawTextarea.value) return;
		const lines = rawText.value.split("\n");
		const offset = lines.slice(0, line - 1).reduce((total, value) => total + value.length + 1, 0) + Math.max(0, column - 1);
		rawTextarea.value.focus();
		rawTextarea.value.setSelectionRange(offset, Math.min(rawText.value.length, offset + 1));
	});
}
defineExpose({ focusDataLocation });

async function acceptRawAndOpenStructured() {
	const revision = ++parseRevision;
	if (props.kind === "csv") await loadCsv(rawText.value, revision);
	else await loadJson(rawText.value, revision);
	if (revision === parseRevision && !parseError.value) editorMode.value = "structured";
}

onMounted(() => loadText(props.text));
onUnmounted(() => {
	if (parseTimer) clearTimeout(parseTimer);
	parseRevision++;
	gridLoadRequest++;
	stopParserWorker("Data editor was closed.");
});
watch(() => props.text, text => {
	if (text === lastEmittedText) { lastEmittedText = undefined; return; }
	if (text !== rawText.value) loadText(text);
});
watch(() => props.kind, () => loadText(props.text));
watch(() => props.schema, () => { if (props.kind === "json" && Array.isArray(jsonValue.value)) loadText(rawText.value); });
</script>

<template>
	<section class="data-editor-pane" :aria-label="`${kind.toUpperCase()} data editor`">
		<div class="data-editor-toolbar">
			<div class="data-editor-identity"><strong>{{ external ? `External / Private · ${inputName ?? kind.toUpperCase()}` : kind.toUpperCase() }}</strong><span v-if="schema">Mapped as {{ schema.name }} · {{ schema.type }}</span><span v-else-if="external">Explicitly opened mapped input</span></div>
			<div class="data-editor-actions">
				<button v-if="inputName" type="button" title="Go to the declared AMX input" aria-label="Go to AMX input declaration" @click="emit('navigateDeclaration')">AMX input</button>
				<template v-if="editorMode === 'structured' && !parseError && gridAvailable">
					<input v-model="searchText" aria-label="Search data rows" placeholder="Search rows" :disabled="gridLoading" @keydown.enter="applySearch" /><button type="button" title="Apply row search" aria-label="Apply row search" :disabled="gridLoading" @click="applySearch">Search</button>
					<select v-model="selectedField" aria-label="Select field to reorder" :disabled="gridLoading"><option value="" disabled>Choose field</option><option v-for="field in fieldChoices" :key="field.key" :value="field.key">{{ field.name }}</option></select>
					<button type="button" title="Move field left" aria-label="Move field left" :disabled="gridLoading || !selectedField" @click="moveSelectedField(-1)">← Field</button><button type="button" title="Move field right" aria-label="Move field right" :disabled="gridLoading || !selectedField" @click="moveSelectedField(1)">→ Field</button>
					<button type="button" title="Add row" aria-label="Add row" :disabled="gridLoading" @click="addRow">＋ Row</button><button type="button" title="Remove selected rows" aria-label="Remove selected rows" :disabled="gridLoading" @click="removeSelectedRows">− Rows</button><button type="button" title="Move selected rows up" aria-label="Move selected rows up" :disabled="gridLoading" @click="moveSelectedRows(-1)">↑ Rows</button><button type="button" title="Move selected rows down" aria-label="Move selected rows down" :disabled="gridLoading" @click="moveSelectedRows(1)">↓ Rows</button>
					<button type="button" title="Add field" aria-label="Add field" :disabled="gridLoading" @click="addField">＋ Field</button><button type="button" title="Remove last field" aria-label="Remove last field" :disabled="gridLoading" @click="removeLastField">− Field</button><button type="button" title="Undo data edit" aria-label="Undo data edit" :disabled="gridLoading" @click="runHistory('undo')">Undo</button><button type="button" title="Redo data edit" aria-label="Redo data edit" :disabled="gridLoading" @click="runHistory('redo')">Redo</button>
				</template>
				<button v-if="editorMode === 'structured'" type="button" :disabled="gridLoading" @click="editorMode = 'raw'">Raw text</button><button v-else type="button" :disabled="!!parseError" @click="acceptRawAndOpenStructured">Structured</button>
			</div>
		</div>
		<div v-if="activeDiagnostics.length" class="data-diagnostics" role="status"><button v-for="(item, index) in activeDiagnostics" :key="`${item.code}-${index}`" type="button" class="data-diagnostic" :disabled="!item.dataLine" @click="navigateDataDiagnostic(item)">{{ item.code }} · {{ item.message }}<small v-if="item.dataPath || item.dataLine">{{ item.dataPath }}<template v-if="item.dataLine"> ({{ item.dataLine }}:{{ item.dataColumn ?? 1 }})</template></small></button></div>
		<div v-if="editorMode === 'raw'" class="data-raw-pane"><textarea ref="rawTextarea" :aria-label="`${kind.toUpperCase()} raw source`" :value="rawText" spellcheck="false" @input="onRawInput" /><p v-if="parseError" class="data-editor-message" role="status">{{ parseError }} Raw source is preserved exactly.</p></div>
		<div v-else-if="parseError" class="data-editor-unavailable" role="status"><strong>Structured editing unavailable</strong><p>{{ parseError }}</p><button type="button" @click="editorMode = 'raw'">Edit raw text</button></div>
		<div v-else-if="kind === 'csv' && csvHeaders.length" class="data-grid-shell" :aria-busy="gridLoading"><p class="data-grid-meta">{{ gridLoading ? `Loading ${gridRowsLoaded.toLocaleString()} of ${csvRows.length.toLocaleString()} rows…` : `${csvRows.length.toLocaleString()} rows` }} · {{ csvHeaders.length }} columns</p>
			<vxe-table ref="gridRef" :data="gridRows" :row-config="{ keyField: '__editorRowId', useKey: true }" height="100%" border :loading="gridLoading" :scroll-y="{ enabled: true, gt: 0 }" :edit-config="{ trigger: gridLoading ? 'manual' : 'click', mode: 'cell' }" :keyboard-config="{ isArrow: true, isEnter: true, isTab: true, isEdit: true, isUndoRedo: true }" :sort-config="{ multiple: true }" @edit-closed="onGridEdit"><vxe-column type="checkbox" width="42" /><vxe-column type="seq" title="#" width="56" /><vxe-column v-for="column in csvColumns" :key="column.key" :field="column.key" :title="column.name" min-width="150" sortable :edit-render="{ name: 'input' }"><template #header><div class="data-grid-header"><button type="button" class="data-grid-sort" :aria-label="`Sort ${column.name}: ${sortOrders.get(column.key) ?? 'ascending'}`" :title="`Sort ${column.name}`" @click.stop="toggleSort(column.key)"><span>{{ column.name }}</span><span aria-hidden="true">{{ sortOrders.get(column.key) === "asc" ? "↑" : sortOrders.get(column.key) === "desc" ? "↓" : "↕" }}</span></button><small v-if="column.schema" class="schema-type">{{ column.schema.type }}{{ !column.schema.optional && !column.schema.hasDefault ? " · required" : "" }}{{ column.schema.optional ? " · optional" : "" }}{{ column.schema.hasDefault ? " · default" : "" }}</small></div></template></vxe-column></vxe-table>
		</div>
		<div v-else-if="kind === 'json' && jsonArrayGrid" class="data-grid-shell" :aria-busy="gridLoading"><p class="data-grid-meta">{{ gridLoading ? `Loading ${gridRowsLoaded.toLocaleString()} of ${jsonRows.length.toLocaleString()} records…` : `JSON array · ${jsonRows.length.toLocaleString()} records` }} · {{ jsonFields.length }} fields</p>
			<vxe-table ref="gridRef" :data="gridRows" :row-config="{ keyField: '__editorRowId', useKey: true }" height="100%" border :loading="gridLoading" :scroll-y="{ enabled: true, gt: 0 }" :edit-config="{ trigger: gridLoading ? 'manual' : 'click', mode: 'cell' }" :keyboard-config="{ isArrow: true, isEnter: true, isTab: true, isEdit: true, isUndoRedo: true }" :sort-config="{ multiple: true }" @edit-closed="onGridEdit"><vxe-column type="checkbox" width="42" /><vxe-column type="seq" title="#" width="56" /><vxe-column v-for="field in jsonFields" :key="field" :field="field" :title="field" min-width="150" sortable :edit-render="{ name: 'input' }"><template #header><div class="data-grid-header"><button type="button" class="data-grid-sort" :aria-label="`Sort ${field}: ${sortOrders.get(field) ?? 'ascending'}`" :title="`Sort ${field}`" @click.stop="toggleSort(field)"><span>{{ field }}</span><span aria-hidden="true">{{ sortOrders.get(field) === "asc" ? "↑" : sortOrders.get(field) === "desc" ? "↓" : "↕" }}</span></button><small v-if="schema?.fields?.find(item => item.name === field)" class="schema-type">{{ schema.fields.find(item => item.name === field)?.type }}</small></div></template></vxe-column></vxe-table>
		</div>
		<div v-else-if="kind === 'json'" class="json-tree-shell jse-theme-dark"><JsonEditorVue v-model="jsonValue" :mode="Mode.tree" :main-menu-bar="true" :navigation-bar="false" /></div>
		<div v-else class="data-editor-unavailable" role="status"><p>Structured editing is unavailable for this data shape. Raw mode preserves the source.</p><button type="button" @click="editorMode = 'raw'">Edit raw text</button></div>
	</section>
</template>

<style>
.data-editor-pane { display: flex; min-width: 0; min-height: 0; flex: 1; flex-direction: column; background: var(--shell-surface); color: var(--shell-ink); }
.data-editor-toolbar { display: flex; min-height: 42px; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--shell-line); padding: 6px 9px; }
.data-editor-identity { display: flex; min-width: 100px; flex-direction: column; gap: 3px; overflow: hidden; font: 10px "DM Mono", monospace; }
.data-editor-identity strong { color: var(--shell-ink); }
.data-editor-identity span, .data-grid-meta { color: var(--shell-muted); font: 10px "DM Sans", sans-serif; }
.data-editor-actions { display: flex; flex-wrap: wrap; justify-content: end; gap: 4px; }
.data-editor-actions input, .data-editor-actions select { width: 130px; min-height: 29px; padding: 5px 7px; border: 1px solid var(--shell-line); background: var(--shell-bg); color: var(--shell-ink); font: 10px "DM Sans", sans-serif; }
.data-editor-actions button, .data-editor-unavailable button { min-height: 29px; padding: 4px 7px; border: 1px solid var(--shell-line); background: transparent; color: var(--shell-ink); font-size: 10px; }
.data-editor-actions button:hover:not(:disabled), .data-editor-unavailable button:hover:not(:disabled) { background: var(--shell-raised); }
.data-diagnostics { max-height: 92px; overflow: auto; border-bottom: 1px solid var(--shell-line); padding: 5px 9px; }
.data-diagnostic { display: flex; width: 100%; justify-content: space-between; gap: 10px; border: 0; border-bottom: 1px solid var(--shell-line); border-radius: 0; padding: 4px; background: transparent; color: var(--shell-ink); text-align: left; font-size: 10px; }
.data-diagnostic small { color: var(--shell-muted); font: 9px "DM Mono", monospace; }
.data-raw-pane { display: flex; min-height: 0; flex: 1; flex-direction: column; padding: 8px; }
.data-raw-pane textarea { width: 100%; min-height: 200px; flex: 1; resize: none; border: 1px solid var(--shell-line); border-radius: 0; background: var(--shell-bg); color: var(--shell-ink); padding: 10px; font: 12px/1.6 "DM Mono", monospace; tab-size: 2; }
.data-editor-message { margin: 6px 0 0; color: #a13f32; font-size: 10px; }
.data-editor-unavailable { display: flex; min-height: 220px; flex: 1; flex-direction: column; align-items: start; justify-content: center; gap: 8px; padding: 24px; color: var(--shell-muted); font-size: 12px; }
.data-editor-unavailable strong { color: var(--shell-ink); font: 600 12px "DM Mono", monospace; }
.data-editor-unavailable p { max-width: 56ch; margin: 0; line-height: 1.5; }
.data-grid-shell {
	position: relative; display: flex; min-height: 260px; flex: 1; flex-direction: column; padding: 6px;
	--vxe-ui-font-color: var(--shell-ink);
	--vxe-ui-font-primary-color: var(--shell-accent);
	--vxe-ui-font-secondary-color: var(--shell-muted);
	--vxe-ui-font-placeholder-color: var(--shell-muted);
	--vxe-ui-layout-background-color: var(--shell-surface);
	--vxe-ui-table-header-background-color: var(--shell-raised);
	--vxe-ui-table-border-color: var(--shell-line);
	--vxe-ui-table-row-hover-background-color: var(--shell-raised);
	--vxe-ui-table-row-striped-background-color: var(--shell-bg);
	--vxe-ui-table-row-hover-striped-background-color: var(--shell-raised);
	--vxe-ui-table-row-current-background-color: var(--shell-selection);
	--vxe-ui-table-row-hover-current-background-color: var(--shell-selection);
	--vxe-ui-table-column-icon-border-color: var(--shell-muted);
	--vxe-ui-table-column-icon-border-hover-color: var(--shell-link);
	--vxe-ui-table-cell-placeholder-color: var(--shell-muted);
	--vxe-ui-table-cell-area-background-color: var(--shell-selection);
}
.data-grid-shell .vxe-table { min-height: 0; flex: 1; }
.data-grid-meta { flex: none; margin: 0; padding: 3px 2px 7px; }
.schema-type { display: block; color: var(--shell-muted); font: 9px "DM Mono", monospace; }
.data-grid-header { display: flex; min-width: 0; flex-direction: column; align-items: start; }
.data-grid-sort { display: flex; min-width: 0; align-items: center; gap: 5px; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; text-align: left; }
.json-tree-shell.jse-theme-dark {
	min-height: 260px; flex: 1; overflow: auto;
	--jse-theme: var(--shell-editor-theme);
	--jse-theme-color: var(--shell-accent);
	--jse-theme-color-highlight: var(--shell-accent);
	--jse-menu-color: var(--shell-accent-ink);
	--jse-background-color: var(--shell-surface);
	--jse-text-color: var(--shell-ink);
	--jse-text-color-inverse: var(--shell-accent-ink);
	--jse-main-border: 1px solid var(--shell-line);
	--jse-panel-background: var(--shell-raised);
	--jse-panel-color: var(--shell-ink);
	--jse-panel-color-readonly: var(--shell-muted);
	--jse-panel-border: 1px solid var(--shell-line);
	--jse-panel-background-border: var(--jse-panel-border);
	--jse-panel-button-color-highlight: var(--shell-ink);
	--jse-panel-button-background-highlight: var(--shell-selection);
	--jse-key-color: var(--shell-link);
	--jse-value-color: var(--shell-ink);
	--jse-value-color-number: var(--amx-token-literal);
	--jse-value-color-boolean: var(--amx-token-reference);
	--jse-value-color-null: var(--amx-token-reference);
	--jse-value-color-string: var(--amx-token-field);
	--jse-value-color-url: var(--shell-link);
	--jse-delimiter-color: var(--shell-muted);
	--jse-edit-outline: 2px solid var(--shell-focus);
	--jse-table-header-background: var(--shell-raised);
	--jse-table-header-background-highlight: var(--shell-selection);
	--jse-table-row-odd-background: var(--shell-bg);
	--jse-selection-background-color: var(--shell-selection);
	--jse-selection-background-inactive-color: var(--shell-raised);
	--jse-hover-background-color: var(--shell-raised);
	--jse-active-line-background-color: var(--shell-raised);
	--jse-input-background: var(--shell-surface);
	--jse-input-border: var(--jse-main-border);
	--jse-button-background: var(--shell-accent);
	--jse-button-background-highlight: var(--shell-accent);
	--jse-button-color: var(--shell-accent-ink);
	--jse-button-secondary-background: var(--shell-raised);
	--jse-button-secondary-background-highlight: var(--shell-selection);
	--jse-button-secondary-color: var(--shell-ink);
	--jse-a-color: var(--shell-link);
	--jse-a-color-highlight: var(--shell-link);
	--jse-context-menu-background: var(--shell-surface);
	--jse-context-menu-background-highlight: var(--shell-raised);
	--jse-context-menu-color: var(--shell-ink);
	--jse-context-menu-separator-color: var(--shell-line);
	--jse-context-menu-pointer-background: var(--shell-raised);
	--jse-context-menu-pointer-background-highlight: var(--shell-selection);
	--jse-context-menu-pointer-color: var(--shell-ink);
	--jse-tooltip-background: var(--shell-raised);
	--jse-tooltip-border: var(--jse-main-border);
	--jse-tooltip-action-button-background: var(--shell-selection);
	--jse-modal-background: var(--shell-surface);
	--jse-modal-overlay-background: var(--shell-overlay);
	--jse-modal-code-background: var(--shell-raised);
	--jse-navigation-bar-background: var(--shell-raised);
	--jse-navigation-bar-background-highlight: var(--shell-selection);
	--jse-collapsed-items-background-color: var(--shell-raised);
	--jse-collapsed-items-selected-background-color: var(--shell-selection);
	--jse-collapsed-items-link-color: var(--shell-link);
	--jse-collapsed-items-link-color-highlight: var(--shell-link);
	--jse-tag-background: var(--shell-raised);
	--jse-tag-color: var(--shell-muted);
}
@media (max-width: 800px) { .data-editor-toolbar { align-items: start; flex-direction: column; } .data-editor-actions { justify-content: start; } }
</style>
*** End Patch