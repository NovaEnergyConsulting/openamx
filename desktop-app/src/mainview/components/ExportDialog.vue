<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { X } from "@lucide/vue";
import type { DataOutputSchema } from "../../shared/rpc";

type ExportFormat = "html" | "pdf" | "docx" | "json" | "csv";

const props = defineProps<{
	open: boolean;
	activeLabel: string;
	outputs: DataOutputSchema[];
	selectedFormat: ExportFormat;
	selectedOutput: string;
	fileName: string;
	busy: boolean;
	error: string;
	outputsTruncated: boolean;
}>();

const emit = defineEmits<{
	close: [];
	format: [format: ExportFormat];
	output: [name: string];
	fileName: [name: string];
	export: [];
}>();

const closeButton = ref<HTMLButtonElement | null>(null);
const eligibleOutputs = computed(() => props.outputs.filter(output => output.formats.includes(props.selectedFormat as "json" | "csv")));
const needsBinding = computed(() => props.selectedFormat === "json" || props.selectedFormat === "csv");
const canExport = computed(() => !props.busy && (!needsBinding.value || eligibleOutputs.value.some(output => output.name === props.selectedOutput)));

watch(() => props.open, open => {
	if (open) void nextTick(() => closeButton.value?.focus());
});
</script>

<template>
	<div v-if="open" class="export-backdrop" @click.self="emit('close')">
		<section class="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
			<header class="export-dialog-header">
				<div><p class="eyebrow">ACTIVE DOCUMENT</p><h2 id="export-title">Export</h2><p class="export-document-name">{{ activeLabel }}</p></div>
				<button ref="closeButton" class="icon-button" type="button" aria-label="Close export" @click="emit('close')"><X :size="16" /></button>
			</header>
			<label class="export-field">Format
				<select :value="selectedFormat" :disabled="busy" @change="emit('format', ($event.target as HTMLSelectElement).value as ExportFormat)">
					<option value="html">HTML</option>
					<option value="pdf">PDF</option>
					<option value="docx">DOCX</option>
					<option value="json" :disabled="!outputs.some(output => output.formats.includes('json'))">JSON data</option>
					<option value="csv" :disabled="!outputs.some(output => output.formats.includes('csv'))">CSV data</option>
				</select>
			</label>
			<label v-if="needsBinding" class="export-field">Exported value
				<select :value="selectedOutput" :disabled="busy || !eligibleOutputs.length" @change="emit('output', ($event.target as HTMLSelectElement).value)">
					<option v-for="output in eligibleOutputs" :key="output.name" :value="output.name">{{ output.name }} · {{ output.type }}</option>
				</select>
				<small v-if="!eligibleOutputs.length">No explicitly exported values support this format.</small>
			</label>
			<label class="export-field">File name <input :value="fileName" :disabled="busy" autocomplete="off" spellcheck="false" @input="emit('fileName', ($event.target as HTMLInputElement).value)"></label>
			<p v-if="outputsTruncated" class="export-note">Only the first supported exported values are listed.</p>
			<p v-if="error" class="export-error" role="alert">{{ error }}</p>
			<footer class="export-dialog-actions">
				<button type="button" class="quiet-button" :disabled="busy" @click="emit('close')">Cancel</button>
				<button type="button" class="primary-button" :disabled="!canExport" @click="emit('export')">{{ busy ? "Preparing…" : "Choose destination…" }}</button>
			</footer>
		</section>
	</div>
</template>
