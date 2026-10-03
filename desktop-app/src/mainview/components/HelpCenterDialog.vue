<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { starterExamples } from "../starterExamples";

type HelpTopic = { id: string; title: string; summary: string; terms: string; steps: string[] };
type Shortcut = { label: string; shortcut?: string };

const props = defineProps<{ open: boolean; initialSection?: string; shortcuts: Shortcut[] }>();
const emit = defineEmits<{ close: []; createProject: [source?: string]; exportDiagnostics: [] }>();

const topics: HelpTopic[] = [
	{ id: "getting-started", title: "Start a project", summary: "Create a local workspace and open a report.", terms: "welcome first project starter create open", steps: ["Choose Create project and select an empty folder.", "Open an existing .amx file, or create one from the project explorer.", "Edit the active document. Its preview follows the current unsaved text.", "Use Inputs to map declared data, then Export to prepare a report or named data output."] },
	{ id: "starters", title: "Starter examples", summary: "Begin with a bundled, offline report template.", terms: "example templates hello asset management operation note", steps: ["Choose a starter to create a project with a new report buffer.", "The starter is saved through the normal conflict-aware autosave path; live preview follows the active buffer.", "No explicit Run command is issued, and both templates use built-in values with no external files."] },
	{ id: "language", title: "AMX language essentials", summary: "Understand executable fences, imports, and typed inputs.", terms: "language syntax code fence markdown let type function import export input record table chart cli", steps: ["Only exact, case-sensitive ```amx fences execute; ordinary Markdown and other code fences stay narrative.", "Use let for bindings, type and fn for typed records/functions, and input declarations for JSON or CSV data.", "Imports resolve from local project files. Explicit exports control which bindings can be exported as JSON or CSV.", "The desktop uses the same parser/runtime and preserves existing CLI behavior; this guide adds no alternate syntax."] },
	{ id: "documents", title: "Documents and imports", summary: "Work with the active report and unsaved modules.", terms: "active tab import source editor save intelligence rename", steps: ["The active .amx tab is the target for analysis, preview, Run, and Export.", "Open imported modules in tabs; current unsaved module text is used for analysis.", "Save preserves exact text, including invalid drafts. Disk conflicts must be resolved before replacement.", "Editor completion, diagnostics, navigation, and rename are derived from the shared parser and checker."] },
	{ id: "data", title: "Inputs and data editing", summary: "Map logical inputs and edit structured files.", terms: "csv json external private mapping schema validation", steps: ["Use the Inputs panel to browse for a declared logical input.", "Project defaults are portable; local selections remain machine-local unless explicitly promoted.", "CSV and JSON tabs support structured editing and raw text. Invalid source remains available for correction.", "External data is labeled private. Diagnostic summaries never include its path or contents."] },
	{ id: "preview-export", title: "Preview and export", summary: "Keep results tied to the current document state.", terms: "run preview cancel stale html pdf docx json csv", steps: ["Preview updates after edits; Pause and Refresh are available in the context pane.", "Run is explicit. A stale result is labeled and is not presented as current success.", "Export supports HTML, PDF, DOCX, JSON, and CSV where the selected binding is eligible.", "Cancellation or a failed preparation preserves an existing destination; atomic replacement cannot be interrupted once started."] },
	{ id: "recovery", title: "Conflicts and recovery", summary: "Resolve external edits and recover unsaved work safely.", terms: "conflict autosave crash restore discard recovery", steps: ["Autosave writes exact text and pauses when an external disk conflict is detected.", "Resolve a conflict before saving or performing dependent file operations.", "Recovery snapshots are local and can be restored into memory or discarded.", "Restoring recovery never writes over project files automatically."] },
	{ id: "diagnostics", title: "Diagnostic export privacy", summary: "Download a bounded diagnostic summary for support.", terms: "logs export privacy path secret credential source input", steps: ["The summary contains the app label, export time, coarse workbench state, and diagnostic-code counts.", "It omits project and file paths, diagnostic messages, document/source text, input values, recovery data, and credentials.", "The export stays on this device until you choose to share the downloaded file."] },
	{ id: "release-notes", title: "Release notes", summary: "V0.6 workbench capabilities and evidence limits.", terms: "version changes release notes feature", steps: ["The workbench now centers the active document with live preview and explicit Run.", "Project lifecycle includes conflict-aware autosave, trash, and local recovery.", "AMX intelligence, CSV/JSON editing, logical inputs, settings, and five-format export are available.", "This feature milestone does not certify native platform releases, packaging, broad Office, Marketplace, or formal accessibility."] }
];

const query = ref("");
const activeId = ref("getting-started");
const filteredTopics = computed(() => {
	const needle = query.value.trim().toLocaleLowerCase();
	return topics.filter(topic => !needle || `${topic.title} ${topic.summary} ${topic.terms} ${topic.steps.join(" ")}`.toLocaleLowerCase().includes(needle));
});
const activeTopic = computed(() => filteredTopics.value.find(topic => topic.id === activeId.value) ?? filteredTopics.value[0]);
const filteredShortcuts = computed(() => {
	const needle = query.value.trim().toLocaleLowerCase();
	return props.shortcuts.filter(item => item.shortcut && (!needle || `${item.label} ${item.shortcut}`.toLocaleLowerCase().includes(needle)));
});

watch(() => [props.open, props.initialSection] as const, ([open, section]) => {
	if (!open) return;
	activeId.value = topics.some(topic => topic.id === section) ? section! : "getting-started";
	query.value = "";
});
</script>

<template>
	<div v-if="open" class="help-backdrop" @click.self="emit('close')">
		<section class="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title">
			<header class="help-header">
				<div><p class="eyebrow">OPENAMX FIELD GUIDE</p><h2 id="help-title">Help and shortcuts</h2></div>
				<button type="button" class="icon-button" aria-label="Close help" title="Close" @click="emit('close')">×</button>
			</header>
			<label class="help-search"><span>Search help and commands</span><input v-model="query" autofocus type="search" placeholder="Try imports, recovery, Ctrl+S…"></label>
			<div class="help-layout">
				<nav class="help-topics" aria-label="Help topics">
					<button v-for="topic in filteredTopics" :key="topic.id" type="button" :aria-current="activeTopic?.id === topic.id ? 'page' : undefined" @click="activeId = topic.id">
						<strong>{{ topic.title }}</strong><small>{{ topic.summary }}</small>
					</button>
					<p v-if="!filteredTopics.length && !filteredShortcuts.length" class="help-empty">No matching help.</p>
				</nav>
				<article v-if="activeTopic" class="help-content">
					<h3>{{ activeTopic.title }}</h3><p class="help-summary">{{ activeTopic.summary }}</p>
					<ol><li v-for="step in activeTopic.steps" :key="step">{{ step }}</li></ol>
					<button v-if="activeTopic.id === 'getting-started'" type="button" class="help-primary" @click="emit('createProject', starterExamples[0].source)">Create a project with Hello OpenAMX</button>
					<div v-if="activeTopic.id === 'starters'" class="starter-list">
						<article v-for="starter in starterExamples" :key="starter.id" class="starter-item"><div><strong>{{ starter.title }}</strong><p>{{ starter.description }}</p></div><button type="button" @click="emit('createProject', starter.source)">Use starter</button></article>
					</div>
					<div v-if="activeTopic.id === 'diagnostics'" class="help-export"><button type="button" @click="emit('exportDiagnostics')">Download diagnostic summary</button></div>
				</article>
				<section class="help-shortcuts" aria-label="Keyboard shortcuts">
					<h3>Keyboard shortcuts</h3>
					<dl v-if="filteredShortcuts.length"><template v-for="item in filteredShortcuts" :key="item.label"><dt>{{ item.label }}</dt><dd><kbd>{{ item.shortcut }}</kbd></dd></template></dl>
					<p v-else class="help-empty">No matching shortcuts.</p>
					<div class="help-release"><h3>Release notes · V0.6</h3><p>Active-document preview, project recovery, AMX intelligence, structured CSV/JSON editing, and unified five-format export.</p><p>Feature acceptance is distinct from native platform, packaging, Office, licensing, Marketplace, and formal accessibility certification.</p></div>
				</section>
			</div>
			<footer class="help-footer"><span>Search is local. No telemetry is sent.</span><button type="button" @click="emit('close')">Close</button></footer>
		</section>
	</div>
</template>