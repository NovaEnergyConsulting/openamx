<script setup lang="ts">
import type { TabState, WorkbenchState } from "../../shared/rpc";

defineProps<{ workbench: WorkbenchState }>();
const emit = defineEmits<{ select: [path: string]; close: [path: string] }>();

function label(tab: TabState) {
	return tab.label ?? tab.path.split(/[\\/]/).pop() ?? tab.path;
}
</script>

<template>
	<nav class="tabs" aria-label="Open tabs">
		<div v-for="tab in workbench.tabs" :key="tab.path" class="tab">
			<button :aria-current="workbench.active === tab.path ? 'page' : undefined" @click="emit('select', tab.path)">
				{{ label(tab) }}<span v-if="tab.dirty" aria-label="Unsaved changes"> *</span><span v-if="tab.conflict" aria-label="External conflict"> !</span>
			</button>
			<button class="icon-button" :aria-label="`Close ${label(tab)}`" title="Close tab" @click="emit('close', tab.path)">x</button>
		</div>
		<p v-if="!workbench.tabs.length" class="empty-tabs">No open documents</p>
	</nav>
</template>