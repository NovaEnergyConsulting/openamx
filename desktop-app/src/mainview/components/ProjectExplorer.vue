<script setup lang="ts">
import { computed, ref } from "vue";
import type { ProjectFile, WorkbenchState } from "../../shared/rpc";

const props = defineProps<{ files: ProjectFile[]; workbench: WorkbenchState }>();
const emit = defineEmits<{ open: [path: string] }>();
const search = ref("");
const visibleFiles = computed(() => props.files.filter(file => file.path.toLowerCase().includes(search.value.toLowerCase())));
const groupedFiles = computed(() => {
	const groups = new Map<string, ProjectFile[]>();
	for (const file of visibleFiles.value) {
		const folder = file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : ".";
		groups.set(folder, [...(groups.get(folder) ?? []), file]);
	}
	return [...groups];
});
</script>

<template>
	<aside class="explorer" aria-label="Project explorer">
		<div class="section-heading"><span>PROJECT</span><span>{{ files.length }}</span></div>
		<input id="project-search" v-model="search" aria-label="Search project files" placeholder="Search files">
		<div v-for="[folder, entries] in groupedFiles" :key="folder">
			<p class="folder">{{ folder }}</p>
			<button v-for="file in entries" :key="file.path" class="file" :class="{ selected: workbench.active?.endsWith(file.path) }" :aria-current="workbench.active?.endsWith(file.path) ? 'page' : undefined" @click="emit('open', file.path)">
				<span>{{ file.path.split('/').pop() }}</span><small>{{ file.kind }}</small>
			</button>
		</div>
		<p v-if="!files.length" class="muted">No supported project files yet.</p>
		<p v-else-if="!visibleFiles.length" class="muted">No matching files.</p>
	</aside>
</template>