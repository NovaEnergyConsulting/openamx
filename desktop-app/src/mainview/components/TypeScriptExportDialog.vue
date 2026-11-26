<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { X } from "@lucide/vue";
import type { DesktopExportAction, DesktopGraphPreview, DesktopJobStatus, DesktopOutputPathState } from "../../shared/rpc";

const props = defineProps<{
	open: boolean;
	activeLabel: string;
	directoryName: string;
	busy: boolean;
	jobStatus: DesktopJobStatus;
	stage: string;
	error: string;
	preview: DesktopGraphPreview | null;
	pathStates: DesktopOutputPathState[];
	outputId: string;
}>();
const closeButton = ref<HTMLButtonElement | null>(null);

watch(() => props.open, open => {
	if (open) void nextTick(() => closeButton.value?.focus());
});

const emit = defineEmits<{
	close: [];
	choose: [];
	outputAction: [action: DesktopExportAction];
}>();
</script>

<template>
	<div v-if="open" class="export-backdrop" @click.self="emit('close')">
		<section class="export-dialog typescript-export-dialog" role="dialog" aria-modal="true" aria-labelledby="typescript-export-title">
			<header class="export-dialog-header">
				<div><p class="eyebrow">ACTIVE DOCUMENT</p><h2 id="typescript-export-title">Export TypeScript</h2><p class="export-document-name">{{ activeLabel }}</p></div>
				<button ref="closeButton" class="icon-button" type="button" aria-label="Close TypeScript export" :disabled="jobStatus === 'committing'" @click="emit('close')"><X :size="16" /></button>
			</header>
			<p v-if="directoryName" class="typescript-export-root"><strong>Output directory</strong> <code>{{ directoryName }}</code></p>
			<p v-if="busy" class="runtime-status" role="status" aria-live="polite">{{ stage || "Preparing graph" }}<span v-if="stage === 'committing'"> · {{ jobStatus === "committing" ? "Publication cannot be interrupted." : "Preparing publication; cancellation remains available." }}</span></p>
			<progress v-if="busy" class="runtime-progress" aria-label="TypeScript graph export is running"></progress>
			<template v-if="preview">
				<div class="typescript-export-summary">
					<span>{{ preview.moduleCount }} modules</span>
					<span>{{ preview.bytes.toLocaleString() }} bytes</span>
					<span>Entry: <code>{{ preview.entryOutputPath }}</code></span>
				</div>
				<div class="typescript-export-paths" role="region" aria-label="Generated module paths">
					<p v-for="path in preview.modulePaths" :key="path"><code>{{ path }}</code></p>
				</div>
				<div v-if="preview.overwritePaths.length" class="typescript-export-paths" role="region" aria-label="Existing graph targets approved for replacement">
					<strong>Existing targets</strong>
					<p v-for="path in preview.overwritePaths" :key="path"><code>{{ path }}</code></p>
				</div>
			</template>
			<p v-if="error" class="export-error" role="alert">{{ error }}</p>
			<div v-if="pathStates.length" class="typescript-export-paths" role="region" aria-label="Writer path outcomes">
				<strong>Writer outcomes</strong>
				<p v-for="item in pathStates" :key="item.outputPath">
					<code>{{ item.outputPath }}</code> · {{ item.state }}<span v-if="item.detail"> · {{ item.detail }}</span>
				</p>
			</div>
			<footer class="export-dialog-actions">
				<button type="button" class="quiet-button" :disabled="jobStatus === 'committing'" @click="emit('close')">{{ busy ? "Cancel preparation" : outputId ? "Close" : "Cancel" }}</button>
				<template v-if="outputId">
					<button type="button" class="quiet-button" @click="emit('outputAction', 'reveal')">Reveal folder</button>
					<button type="button" class="primary-button" @click="emit('outputAction', 'open')">Open entry</button>
				</template>
				<button v-else type="button" class="primary-button" :disabled="busy" @click="emit('choose')">{{ busy ? "Preparing…" : directoryName ? "Export again…" : "Choose output directory…" }}</button>
			</footer>
		</section>
	</div>
</template>