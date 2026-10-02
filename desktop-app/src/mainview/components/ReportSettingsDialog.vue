<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { ReportSettingKey, ReportSettingsSnapshot, ReportSettingsValues } from "../../shared/rpc";

const props = defineProps<{
	open: boolean;
	settings: ReportSettingsSnapshot | null;
	busy?: boolean;
	error?: string;
}>();
const emit = defineEmits<{
	close: [];
	save: [scope: "project" | "document", values: ReportSettingsValues];
	pickLogo: [scope: "project" | "document"];
}>();

const scope = ref<"project" | "document">("project");
const values = ref<ReportSettingsValues>({});
const firstField = ref<HTMLInputElement | null>(null);
const textFields: Array<{ key: Exclude<ReportSettingKey, "sourceVisible">; label: string }> = [
	{ key: "organization", label: "Organization" },
	{ key: "logo", label: "Logo path" },
	{ key: "logoAlt", label: "Logo alternative text" },
	{ key: "accent", label: "Accent color" },
	{ key: "author", label: "Author" },
	{ key: "status", label: "Status" },
	{ key: "classification", label: "Classification" },
	{ key: "footer", label: "Footer" }
];

function setFirstField(element: unknown) {
	firstField.value = element instanceof HTMLInputElement ? element : null;
}

watch(() => [props.open, props.settings] as const, () => {
	if (!props.settings) return;
	values.value = { ...(scope.value === "project" ? props.settings.project : props.settings.document) };
}, { immediate: true });
watch(() => props.open, async open => {
	if (!open) return;
	await nextTick();
	firstField.value?.focus();
});

const effectiveSourceVisible = computed(() => {
	const value = values.value.sourceVisible;
	return typeof value === "boolean" ? value : props.settings?.effective.sourceVisible !== false;
});

function textValue(key: Exclude<ReportSettingKey, "sourceVisible">): string {
	const value = values.value[key];
	if (key === "accent" && value == null) return typeof props.settings?.effective.accent === "string" ? props.settings.effective.accent : "#146C94";
	return typeof value === "string" ? value : "";
}

function setText(key: Exclude<ReportSettingKey, "sourceVisible">, value: string) {
	values.value = { ...values.value, [key]: value || null };
}

function inherit(key: ReportSettingKey) {
	values.value = { ...values.value, [key]: null };
}

function submit() {
	emit("save", scope.value, { ...values.value });
}
</script>

<template>
	<div v-if="open" class="settings-backdrop" @click.self="!busy && emit('close')">
		<section class="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="report-settings-title">
			<header class="settings-dialog-header">
				<div><p class="eyebrow">REPORT IDENTITY</p><h2 id="report-settings-title">Report Settings</h2></div>
				<button type="button" class="icon-button" aria-label="Close report settings" title="Close" :disabled="busy" @click="emit('close')">×</button>
			</header>
			<div class="settings-scopes" role="tablist" aria-label="Settings scope">
				<button type="button" role="tab" :aria-selected="scope === 'project'" @click="scope = 'project'; values = { ...(settings?.project ?? {}) }">Project defaults</button>
				<button type="button" role="tab" :aria-selected="scope === 'document'" @click="scope = 'document'; values = { ...(settings?.document ?? {}) }">Current document</button>
			</div>
			<div v-if="settings?.diagnostics.length" class="settings-diagnostics" role="alert">
				<p v-for="(item, index) in settings.diagnostics" :key="`${item.code}-${index}`"><strong>{{ item.code }}</strong> {{ item.message }}</p>
			</div>
			<form class="settings-fields" @submit.prevent="submit">
				<label v-for="field in textFields" :key="field.key" class="settings-field">
					<span>{{ field.label }}</span>
					<div class="settings-input-row">
						<input :ref="field.key === 'organization' ? setFirstField : undefined" :id="field.key === 'organization' ? 'report-settings-first' : undefined" :value="textValue(field.key)" :readonly="field.key === 'logo'" :disabled="busy" :type="field.key === 'accent' ? 'color' : 'text'" @input="setText(field.key, ($event.target as HTMLInputElement).value)">
						<button v-if="field.key === 'logo'" type="button" :disabled="busy" @click="emit('pickLogo', scope)">Browse</button>
						<button type="button" class="text-button" :disabled="busy" @click="inherit(field.key)">{{ scope === 'document' ? 'Inherit' : 'Clear' }}</button>
					</div>
					<small v-if="scope === 'document' && settings?.effective[field.key] && values[field.key] == null">Inherited: {{ settings.effective[field.key] }}</small>
				</label>
				<label class="source-visibility">
					<input type="checkbox" :checked="effectiveSourceVisible" :disabled="busy" @change="values = { ...values, sourceVisible: ($event.target as HTMLInputElement).checked }">
					<span>Show executable source in reports</span>
					<button type="button" class="text-button" :disabled="busy" @click="inherit('sourceVisible')">{{ scope === 'document' ? 'Inherit' : 'Clear' }}</button>
				</label>
				<p v-if="settings?.accentFallback" class="contrast-note">This accent has insufficient contrast; report text and controls use #146C94.</p>
				<p v-if="error" class="settings-diagnostics" role="alert">{{ error }}</p>
				<footer class="settings-actions">
					<button type="button" class="text-button" :disabled="busy" @click="emit('close')">Cancel</button>
					<button type="submit" :disabled="busy">{{ busy ? 'Saving…' : 'Save settings' }}</button>
				</footer>
			</form>
		</section>
	</div>
</template>
