<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { ShellCommand } from "../shell";

const props = defineProps<{ open: boolean; commands: ShellCommand[] }>();
const emit = defineEmits<{ dismiss: [] }>();
const query = ref("");
const matches = computed(() => props.commands.filter(command => command.label.toLowerCase().includes(query.value.toLowerCase())));

watch(() => props.open, open => {
	if (!open) return;
	query.value = "";
	void nextTick(() => document.querySelector<HTMLInputElement>("#command-search")?.focus());
});

function run(command: ShellCommand) {
	if (!command.enabled) return;
	emit("dismiss");
	void command.run();
}
</script>

<template>
	<div v-if="open" class="palette-backdrop" @click.self="emit('dismiss')">
		<section class="palette" role="dialog" aria-modal="true" aria-label="Commands">
			<input id="command-search" v-model="query" aria-label="Search commands" placeholder="Find a command">
			<button v-for="command in matches" :key="command.id" :disabled="!command.enabled" :title="command.enabled ? command.shortcut : command.disabledReason" @click="run(command)">
				{{ command.label }}
				<small>{{ command.enabled ? command.shortcut : command.disabledReason }}</small>
			</button>
			<p v-if="!matches.length" class="muted">No matching commands.</p>
			<button type="button" @click="emit('dismiss')">Close</button>
		</section>
	</div>
</template>