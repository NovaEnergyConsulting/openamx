<script setup lang="ts">
import type { RecentProject } from "../../shared/rpc";

defineProps<{ recents: RecentProject[]; status: string }>();
const emit = defineEmits<{ openProject: []; createProject: []; restore: [root: string]; clearRecents: []; openHelp: [] }>();
</script>

<template>
	<section class="welcome" aria-label="Welcome to OpenAMX">
		<p class="eyebrow">OPENAMX WORKBENCH</p>
		<h1>Open a project to start working.</h1>
		<p class="welcome-copy">Your recent projects stay on this machine. Create a project in an empty folder or open an existing local project.</p>
		<div class="welcome-actions">
			<button type="button" @click="emit('openProject')">Open project</button>
			<button type="button" @click="emit('createProject')">Create project</button>
			<button type="button" class="quiet-button" @click="emit('openHelp')">Help and shortcuts</button>
		</div>
		<p class="project-feedback" role="status" aria-live="polite">{{ status }}</p>
		<section class="recent-projects" aria-label="Recent projects">
			<div class="section-heading"><span>RECENT PROJECTS</span><button v-if="recents.length" class="text-button" type="button" @click="emit('clearRecents')">Clear</button></div>
			<button v-for="recent in recents" :key="recent.root" class="recent-project" type="button" @click="emit('restore', recent.root)">{{ recent.root }}</button>
			<p v-if="!recents.length" class="muted">No validated recent projects.</p>
		</section>
		<div class="welcome-notices"><span>Recovery: no snapshots to restore</span><span>Release notes available from Help</span></div>
	</section>
</template>