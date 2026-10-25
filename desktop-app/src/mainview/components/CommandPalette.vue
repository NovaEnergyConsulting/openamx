<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { ShellCommand } from "../shell";

const props = defineProps<{ open: boolean; commands: ShellCommand[] }>();
const emit = defineEmits<{ dismiss: [] }>();
const query = ref("");
const matches = computed(() => props.commands.filter(command => command.label.toLowerCase().includes(query.value.toLowerCase())));
const enabledMatches = computed(() => matches.value.filter(command => command.enabled));
const selectedCommandId = ref<string | null>(null);
const selectedCommand = computed(() => enabledMatches.value.find(command => command.id === selectedCommandId.value));

function selectFirstEnabled() {
	selectedCommandId.value = enabledMatches.value[0]?.id ?? null;
}

function reconcileSelection() {
	if (!selectedCommand.value) selectFirstEnabled();
}

watch(() => props.open, open => {
	if (!open) return;
	query.value = "";
	selectFirstEnabled();
	void nextTick(() => document.querySelector<HTMLInputElement>("#command-search")?.focus());
});
watch(query, () => {
	if (props.open) selectFirstEnabled();
}, { flush: "sync" });
watch(() => props.commands, () => {
	if (props.open) reconcileSelection();
});

function run(command: ShellCommand) {
	if (!command.enabled) return;
	emit("dismiss");
	void command.run();
}

function handleSearchKeydown(event: KeyboardEvent) {
	if (event.key === "ArrowDown" || event.key === "ArrowUp") {
		event.preventDefault();
		event.stopPropagation();
		const currentIndex = enabledMatches.value.findIndex(command => command.id === selectedCommandId.value);
		const nextIndex = currentIndex < 0
			? 0
			: Math.max(0, Math.min(enabledMatches.value.length - 1, currentIndex + (event.key === "ArrowDown" ? 1 : -1)));
		selectedCommandId.value = enabledMatches.value[nextIndex]?.id ?? null;
		return;
	}
	if (event.key !== "Enter") return;
	event.preventDefault();
	event.stopPropagation();
	const command = selectedCommand.value;
	if (command) run(command);
}
</script>

<template>
	<div v-if="open" class="palette-backdrop" @click.self="emit('dismiss')">
		<section class="palette" role="dialog" aria-modal="true" aria-label="Commands">
			<input id="command-search" v-model="query" aria-label="Search commands" aria-autocomplete="list" aria-controls="command-results" :aria-expanded="true" :aria-activedescendant="selectedCommand ? `command-option-${selectedCommand.id}` : undefined" placeholder="Find a command" @keydown="handleSearchKeydown">
			<div id="command-results" role="group" aria-label="Commands">
				<button v-for="command in matches" :id="`command-option-${command.id}`" :key="command.id" type="button" tabindex="-1" :aria-disabled="!command.enabled" :aria-pressed="command.id === selectedCommandId" :class="{ 'command-selected': command.id === selectedCommandId }" :disabled="!command.enabled" :title="command.enabled ? command.shortcut : command.disabledReason" @click="run(command)">
					{{ command.label }}
					<small>{{ command.enabled ? command.shortcut : command.disabledReason }}</small>
				</button>
			</div>
			<p v-if="!matches.length" class="muted">No matching commands.</p>
			<button type="button" @click="emit('dismiss')">Close</button>
		</section>
	</div>
</template>