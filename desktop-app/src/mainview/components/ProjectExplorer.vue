<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import type { ProjectFile, WorkbenchState } from "../../shared/rpc";

type EditableKind = "amx" | "csv" | "json" | "css";
type ExplorerMenu = { kind: "actions" | "file" | "folder"; path?: string; fileKind?: ProjectFile["kind"]; x: number; y: number };

const props = defineProps<{ files: ProjectFile[]; folders: string[]; workbench: WorkbenchState; canMoveActive: boolean }>();
const emit = defineEmits<{
	open: [path: string]; createFile: [kind: EditableKind, folder: string]; createFolder: [folder: string];
	duplicateActive: []; duplicateFile: [path: string]; moveActive: []; moveFile: [path: string]; deleteFile: [path: string];
	moveToFolder: [source: string, destination: string]; invalidDrop: [message: string];
	openNativeProjectItem: [path: string]; revealProjectItem: [path: string]; pickOpen: []; manageTrash: [];
}>();
const search = ref("");
const menu = ref<ExplorerMenu | null>(null);
const newSubmenuOpen = ref(false);
const menuInvoker = ref<HTMLElement | null>(null);
const visibleFiles = computed(() => props.files.filter(file => file.path.toLowerCase().includes(search.value.toLowerCase())));
const menuStyle = computed(() => {
	if (!menu.value) return {};
	return {
		left: `${Math.max(8, Math.min(menu.value.x, window.innerWidth - 236))}px`,
		top: `${Math.max(8, Math.min(menu.value.y, window.innerHeight - 320))}px`
	};
});

function normalizePath(path: string): string {
	return path.replaceAll("\\", "/");
}

function fileName(path: string): string {
	return normalizePath(path).split("/").pop() ?? path;
}

function isEditable(kind: ProjectFile["kind"] | undefined): boolean {
	return kind === "amx" || kind === "csv" || kind === "json" || kind === "css";
}

function isGeneratedOutput(kind: ProjectFile["kind"] | undefined): boolean {
	return kind === "html-output" || kind === "pdf-output" || kind === "docx-output";
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

function showMenu(event: MouseEvent | KeyboardEvent, kind: ExplorerMenu["kind"], path?: string, fileKind?: ProjectFile["kind"]) {
	event.preventDefault();
	const target = event.currentTarget;
	if (!(target instanceof HTMLElement)) return;
	const bounds = target.getBoundingClientRect();
	const pointer = event instanceof MouseEvent && event.type === "contextmenu";
	menuInvoker.value = target;
	menu.value = { kind, path, fileKind, x: pointer ? event.clientX : bounds.left, y: pointer ? event.clientY : bounds.bottom };
	newSubmenuOpen.value = false;
	void nextTick(() => document.querySelector<HTMLElement>(".explorer-menu [role='menuitem']")?.focus());
}

function showActions(event: MouseEvent) {
	if (menu.value?.kind === "actions") {
		menu.value = null;
		return;
	}
	showMenu(event, "actions");
}

function onRowKeydown(event: KeyboardEvent, kind: ExplorerMenu["kind"], path: string, fileKind?: ProjectFile["kind"]) {
	if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) showMenu(event, kind, path, fileKind);
}

function beginFileDrag(event: DragEvent, path: string, kind: ProjectFile["kind"]) {
	if (!event.dataTransfer || !isEditable(kind)) { event.preventDefault(); return; }
	event.dataTransfer.effectAllowed = "move";
	event.dataTransfer.setData("application/x-openamx-project-file", path);
}

function allowFolderDrop(event: DragEvent) {
	if (!event.dataTransfer?.types.includes("application/x-openamx-project-file")) return;
	event.preventDefault();
	event.dataTransfer.dropEffect = "move";
}

function dropFileOnFolder(event: DragEvent, folder: string) {
	event.preventDefault();
	const source = event.dataTransfer?.getData("application/x-openamx-project-file");
	const file = props.files.find(candidate => candidate.path === source);
	if (!source || !file || !isEditable(file.kind)) {
		emit("invalidDrop", "Only editable project files can be moved by drag and drop.");
		return;
	}
	const normalizedSource = normalizePath(source);
	const name = normalizedSource.split("/").pop() ?? normalizedSource;
	const destination = folder === "." ? name : `${normalizePath(folder)}/${name}`;
	if (normalizedSource === normalizePath(destination)) {
		emit("invalidDrop", "The file is already in that folder.");
		return;
	}
	emit("moveToFolder", source, destination);
}

function rejectFileDrop(event: DragEvent) {
	if (!event.dataTransfer?.types.includes("application/x-openamx-project-file")) return;
	event.preventDefault();
	emit("invalidDrop", "Drop a project file onto a folder, not another file.");
}

function closeMenu(restoreFocus = false) {
	menu.value = null;
	newSubmenuOpen.value = false;
	if (restoreFocus) menuInvoker.value?.focus();
}

function onWindowPointerDown(event: PointerEvent) {
	const target = event.target;
	if (target instanceof Element && target.closest(".explorer-menu, .explorer-actions-trigger")) return;
	closeMenu();
}

function onMenuKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") {
		event.stopPropagation();
		closeMenu(true);
		return;
	}
	const items = [...(event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>("[role='menuitem']:not([disabled])")];
	const current = items.indexOf(document.activeElement as HTMLElement);
	let next = current;
	if (event.key === "ArrowDown") next = (current + 1) % items.length;
	else if (event.key === "ArrowUp") next = (current - 1 + items.length) % items.length;
	else if (event.key === "Home") next = 0;
	else if (event.key === "End") next = items.length - 1;
	else return;
	event.preventDefault();
	items[next]?.focus();
}

onMounted(() => window.addEventListener("pointerdown", onWindowPointerDown, true));
onUnmounted(() => window.removeEventListener("pointerdown", onWindowPointerDown, true));
</script>

<template>
	<aside class="explorer" aria-label="Project explorer">
		<div class="section-heading"><span>PROJECT</span><span :aria-label="`${folders.length} folders, ${files.length} files`">{{ folders.length }}/{{ files.length }}</span></div>
		<div class="explorer-actions"><button class="explorer-actions-trigger" type="button" aria-haspopup="menu" :aria-expanded="menu?.kind === 'actions'" @click="showActions">Project actions</button></div>
		<input id="project-search" v-model="search" aria-label="Search project files" placeholder="Search files">
		<div v-for="[folder, entries] in groupedFiles" :key="folder">
			<p v-if="folder === '.'" class="folder" @dragover="allowFolderDrop" @drop="dropFileOnFolder($event, '.')">Root Folder</p>
			<button v-else type="button" class="folder" :aria-label="`${folder}, folder actions`" @contextmenu="showMenu($event, 'folder', folder)" @keydown="onRowKeydown($event, 'folder', folder)" @dragover="allowFolderDrop" @drop="dropFileOnFolder($event, folder)">{{ folder }}</button>
			<button v-for="file in entries" :key="file.path" type="button" class="file" :draggable="isEditable(file.kind)" :class="{ selected: workbench.active?.endsWith(file.path) }" :aria-current="workbench.active?.endsWith(file.path) ? 'page' : undefined" @click="emit('open', file.path)" @contextmenu="showMenu($event, 'file', file.path, file.kind)" @keydown="onRowKeydown($event, 'file', file.path, file.kind)" @dragstart="beginFileDrag($event, file.path, file.kind)" @dragover.prevent @drop="rejectFileDrop">
				<span>{{ fileName(file.path) }}</span><small>{{ file.kind }}</small>
			</button>
		</div>
		<p v-if="!files.length && !folders.length" class="muted">No supported project files yet.</p>
		<p v-else-if="!groupedFiles.length" class="muted">No matching files or folders.</p>
		<div v-if="menu" class="explorer-menu" :style="menuStyle" :aria-label="menu.kind === 'actions' ? 'Project actions' : `${menu.path} actions`" role="menu" @keydown="onMenuKeydown">
			<template v-if="menu.kind === 'actions'">
				<button type="button" role="menuitem" aria-haspopup="menu" :aria-expanded="newSubmenuOpen" @click="newSubmenuOpen = !newSubmenuOpen">New</button>
				<div v-if="newSubmenuOpen" class="explorer-submenu" role="menu" aria-label="New project item">
					<button type="button" role="menuitem" @click="emit('createFile', 'amx', '.'); closeMenu()">AMX file</button>
					<button type="button" role="menuitem" @click="emit('createFile', 'csv', '.'); closeMenu()">CSV file</button>
					<button type="button" role="menuitem" @click="emit('createFile', 'json', '.'); closeMenu()">JSON file</button>
					<button type="button" role="menuitem" @click="emit('createFile', 'css', '.'); closeMenu()">CSS file</button>
				</div>
				<button type="button" role="menuitem" @click="emit('createFolder', '.'); closeMenu()">New folder</button>
				<button type="button" role="menuitem" :disabled="!canMoveActive" @click="emit('duplicateActive'); closeMenu()">Duplicate active file</button>
				<button type="button" role="menuitem" :disabled="!canMoveActive" @click="emit('moveActive'); closeMenu()">Rename / Move active file</button>
				<button type="button" role="menuitem" @click="emit('pickOpen'); closeMenu()">Open file</button>
				<button type="button" role="menuitem" @click="emit('manageTrash'); closeMenu()">Manage Trash</button>
			</template>
			<template v-else-if="menu.kind === 'file' && menu.path">
				<button v-if="!isGeneratedOutput(menu.fileKind)" type="button" role="menuitem" @click="emit('open', menu.path!); closeMenu()">Open</button>
				<button v-if="isGeneratedOutput(menu.fileKind)" type="button" role="menuitem" @click="emit('openNativeProjectItem', menu.path!); closeMenu()">Open externally</button>
				<template v-if="isEditable(menu.fileKind)">
					<button type="button" role="menuitem" @click="emit('duplicateFile', menu.path!); closeMenu()">Duplicate</button>
					<button type="button" role="menuitem" @click="emit('moveFile', menu.path!); closeMenu()">Rename / Move</button>
					<button type="button" role="menuitem" @click="emit('deleteFile', menu.path!); closeMenu()">Delete to Trash</button>
				</template>
				<button type="button" role="menuitem" @click="emit('revealProjectItem', menu.path!); closeMenu()">Reveal in system file manager</button>
			</template>
			<template v-else-if="menu.kind === 'folder' && menu.path">
				<button type="button" role="menuitem" @click="emit('createFile', 'amx', menu.path!); closeMenu()">New AMX file</button>
				<button type="button" role="menuitem" @click="emit('createFile', 'csv', menu.path!); closeMenu()">New CSV file</button>
				<button type="button" role="menuitem" @click="emit('createFile', 'json', menu.path!); closeMenu()">New JSON file</button>
				<button type="button" role="menuitem" @click="emit('createFile', 'css', menu.path!); closeMenu()">New CSS file</button>
				<button type="button" role="menuitem" @click="emit('createFolder', menu.path!); closeMenu()">New folder</button>
				<button type="button" role="menuitem" @click="emit('revealProjectItem', menu.path!); closeMenu()">Reveal in system file manager</button>
			</template>
		</div>
	</aside>
</template>