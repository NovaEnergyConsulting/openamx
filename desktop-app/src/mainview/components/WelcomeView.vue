<script setup lang="ts">
import { defineEmits, defineProps, } from 'vue';
import type { RecentProject, RecoveryItem } from "../../shared/rpc";

defineProps<{ recents: RecentProject[]; recovery: RecoveryItem[]; status: string }>();
const emit = defineEmits<{ openProject: []; createProject: []; restore: [root: string]; restoreRecovery: []; discardRecovery: []; clearRecents: []; openHelp: [section?: string] }>();
</script>

<template>
	<section class="welcome" aria-label="Welcome to OpenAMX">
		<p class="eyebrow">OPENAMX WORKBENCH</p>
		<h1>Open or create a project</h1>
		<p class="welcome-copy">Create a project in an empty folder, open an existing project or choose a recent project
			from the list below.</p>
		<div class="welcome-actions">
			<button type="button" @click="emit('openProject')">Open project</button>
			<button type="button" @click="emit('createProject')">Create project</button>
		</div>
		<p class="project-feedback" role="status" aria-live="polite">{{ status }}</p>
		<section class="recent-projects" aria-label="Recent projects">
			<div class="section-heading"><span>RECENT PROJECTS</span><button v-if="recents.length" class="text-button"
					type="button" @click="emit('clearRecents')">Clear</button></div>
			<button v-for="recent in recents" :key="recent.root" class="recent-project" type="button"
				@click="emit('restore', recent.root)">{{ recent.root }}</button>
			<p v-if="!recents.length" class="muted">No validated recent projects.</p>
		</section>
		<div class="welcome-notices">
			<div v-if="!recovery.length">Recovery: no snapshots to restore</div>
			<div v-else>Recovery: {{ recovery.length }} unsaved file{{ recovery.length === 1 ? '' : 's' }} available
				<button type="button" @click="emit('restoreRecovery')">Restore</button>
				<button type="button" @click="emit('discardRecovery')">Discard</button>
			</div>
		</div>
		<div class="welcome-actions">
			<!-- <button type="button" @click="emit('openHelp', 'getting-started')">Guided first
				project</button> -->
			<button type="button" @click="emit('openHelp')">Help and shortcuts</button>
			<button type="button" @click="emit('openHelp', 'release-notes')">Release
				notes</button>
		</div>
	</section>
</template>