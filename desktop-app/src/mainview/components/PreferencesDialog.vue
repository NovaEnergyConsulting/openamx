<script setup lang="ts">
import { ref, watch } from "vue";
import type { DrawerDock, ShellTheme } from "../shell";

const props = defineProps<{ open: boolean; theme: ShellTheme; drawerDock: DrawerDock; wrapLines: boolean; autosave: boolean; autosaveDelayMs: number }>();
const emit = defineEmits<{ close: []; save: [value: { theme: ShellTheme; drawerDock: DrawerDock; wrapLines: boolean; autosave: boolean; autosaveDelayMs: number }] }>();

const theme = ref<ShellTheme>(props.theme);
const drawerDock = ref<DrawerDock>(props.drawerDock);
const wrapLines = ref(props.wrapLines);
const autosave = ref(props.autosave);
const autosaveDelayMs = ref(props.autosaveDelayMs);
watch(() => props.open, open => {
	if (!open) return;
	theme.value = props.theme;
	drawerDock.value = props.drawerDock;
	wrapLines.value = props.wrapLines;
	autosave.value = props.autosave;
	autosaveDelayMs.value = props.autosaveDelayMs;
});
</script>

<template>
	<div v-if="open" class="settings-backdrop" @click.self="emit('close')">
		<section class="preferences-dialog" role="dialog" aria-modal="true" aria-labelledby="preferences-title">
			<header class="settings-dialog-header"><div><p class="eyebrow">LOCAL WORKBENCH</p><h2 id="preferences-title">Preferences</h2></div><button type="button" class="icon-button" aria-label="Close preferences" title="Close" @click="emit('close')">×</button></header>
			<form class="preferences-fields" @submit.prevent="emit('save', { theme, drawerDock, wrapLines, autosave, autosaveDelayMs })">
				<label class="settings-field"><span>Appearance</span><select v-model="theme"><option value="system">Follow system</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
				<label class="settings-field"><span>Runtime drawer</span><select v-model="drawerDock"><option value="bottom">Dock at bottom</option><option value="right">Dock at right</option></select></label>
				<label class="source-visibility"><input v-model="wrapLines" type="checkbox"><span>Wrap long editor lines</span></label>
				<label class="source-visibility"><input v-model="autosave" type="checkbox"><span>Autosave editable files</span></label>
				<label class="settings-field"><span>Autosave delay (100–10,000 ms)</span><input v-model.number="autosaveDelayMs" type="number" min="100" max="10000" step="100" :disabled="!autosave"></label>
				<p class="preferences-note">Preferences are stored locally on this device. Autosave uses conflict checks and atomic replacement.</p>
				<footer class="settings-actions"><button type="button" class="text-button" @click="emit('close')">Cancel</button><button type="submit">Save preferences</button></footer>
			</form>
		</section>
	</div>
</template>