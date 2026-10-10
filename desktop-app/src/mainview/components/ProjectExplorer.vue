<script setup lang="ts">
import { computed, ref } from "vue";
import type { ProjectFile, WorkbenchState } from "../../shared/rpc";

const props = defineProps<{ files: ProjectFile[]; folders: string[]; workbench: WorkbenchState; canMoveActive: boolean }>();
const emit = defineEmits<{ open: [path: string]; createAmx: []; createFolder: []; moveActive: [] }>();
const search = ref("");
const visibleFiles = computed(() => props.files.filter(file => file.path.toLowerCase().includes(search.value.toLowerCase())));
function normalizePath(path: string): string {
	return path.replaceAll("\\", "/");
}

function fileName(path: string): string {
	return normalizePath(path).split("/").pop() ?? path;
}

const groupedFiles = computed(() => {
	const groups = new Map<string, ProjectFile[]>();
	for (const file of visibleFiles.value) {
		const path = normalizePath(file.path);
		const separator = path.lastIndexOf("/");
		const folder = separator === -1 ? "." : path.slice(0, separator);
		groups.set(folder, [...(groups.get(folder) ?? []), file]);
	}
	for (const folderPath of props.folders) {
		const folder = normalizePath(folderPath);
		if (folder.toLowerCase().includes(search.value.toLowerCase())) groups.set(folder, groups.get(folder) ?? []);
	}
	return [...groups].sort(([left], [right]) => left.localeCompare(right));
});
</script>

<template>
	<aside class="explorer" aria-label="Project explorer">
		<div class="section-heading"><span>PROJECT</span><span>{{ files.length + folders.length }}</span></div>
		<div class="explorer-actions"><button type="button" @click="emit('createAmx')">New AMX</button><button type="button" @click="emit('createFolder')">New folder</button><button type="button" :disabled="!canMoveActive" @click="emit('moveActive')">Move / rename</button></div>
		<input id="project-search" v-model="search" aria-label="Search project files" placeholder="Search files">
		<div v-for="[folder, entries] in groupedFiles" :key="folder">
			<p class="folder">{{ folder === '.' ? 'Root Folder' : folder }}</p>
			<button v-for="file in entries" :key="file.path" class="file" :class="{ selected: workbench.active?.endsWith(file.path) }" :aria-current="workbench.active?.endsWith(file.path) ? 'page' : undefined" @click="emit('open', file.path)">
				<span>{{ fileName(file.path) }}</span><small>{{ file.kind }}</small>
			</button>
		</div>
		<p v-if="!files.length && !folders.length" class="muted">No supported project files yet.</p>
		<p v-else-if="!groupedFiles.length" class="muted">No matching files or folders.</p>
	</aside>
</template>