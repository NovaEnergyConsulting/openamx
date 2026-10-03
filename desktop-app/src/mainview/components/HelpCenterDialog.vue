<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { starterExamples } from "../starterExamples";
import helpContent from "./help-content.json";

type Shortcut = { label: string; shortcut?: string };

const props = defineProps<{ open: boolean; initialSection?: string; shortcuts: Shortcut[] }>();
const emit = defineEmits<{ close: []; createProject: [source?: string]; exportDiagnostics: [] }>();

const topics = helpContent.topics;
const copy = helpContent.copy;

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
				<div><p class="eyebrow">{{ copy.eyebrow }}</p><h2 id="help-title">{{ copy.title }}</h2></div>
				<button type="button" class="icon-button" :aria-label="copy.closeHelpLabel" :title="copy.closeTitle" @click="emit('close')">×</button>
			</header>
			<label class="help-search"><span>{{ copy.searchLabel }}</span><input v-model="query" autofocus type="search" :placeholder="copy.searchPlaceholder"></label>
			<div class="help-layout">
				<nav class="help-topics" :aria-label="copy.topicsLabel">
					<button v-for="topic in filteredTopics" :key="topic.id" :data-topic-id="topic.id" type="button" :aria-current="activeTopic?.id === topic.id ? 'page' : undefined" @click="activeId = topic.id">
						<strong>{{ topic.title }}</strong><small>{{ topic.summary }}</small>
					</button>
					<p v-if="!filteredTopics.length && !filteredShortcuts.length" class="help-empty">{{ copy.noMatchingHelp }}</p>
				</nav>
				<article v-if="activeTopic" class="help-content">
					<h3>{{ activeTopic.title }}</h3><p class="help-summary">{{ activeTopic.summary }}</p>
					<ol><li v-for="step in activeTopic.steps" :key="step">{{ step }}</li></ol>
					<button v-if="activeTopic.id === 'getting-started'" type="button" class="help-primary" @click="emit('createProject', starterExamples[0].source)">{{ copy.createProjectAction }}</button>
					<div v-if="activeTopic.id === 'starters'" class="starter-list">
						<article v-for="starter in starterExamples" :key="starter.id" class="starter-item"><div><strong>{{ starter.title }}</strong><p>{{ starter.description }}</p></div><button type="button" @click="emit('createProject', starter.source)">{{ copy.starterAction }}</button></article>
					</div>
					<div v-if="activeTopic.id === 'diagnostics'" class="help-export"><button type="button" @click="emit('exportDiagnostics')">{{ copy.diagnosticExportAction }}</button></div>
				</article>
				<section class="help-shortcuts" :aria-label="copy.shortcutsTitle">
					<h3>{{ copy.shortcutsTitle }}</h3>
					<dl v-if="filteredShortcuts.length"><template v-for="item in filteredShortcuts" :key="item.label"><dt>{{ item.label }}</dt><dd><kbd>{{ item.shortcut }}</kbd></dd></template></dl>
					<p v-else class="help-empty">{{ copy.noMatchingShortcuts }}</p>
					<div class="help-release"><h3>{{ copy.releaseNotesTitle }}</h3><p v-for="paragraph in copy.releaseNotes" :key="paragraph">{{ paragraph }}</p></div>
				</section>
			</div>
			<footer class="help-footer"><span>{{ copy.footerNote }}</span><button type="button" @click="emit('close')">{{ copy.closeButton }}</button></footer>
		</section>
	</div>
</template>