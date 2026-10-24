<script setup lang="ts">
import { ref } from "vue";
import { ExternalLink, FolderOpen, Play } from "@lucide/vue";
import type { DesktopExportAction, RunSummary, TextDiagnostic } from "../../shared/rpc";
import type { DrawerDock } from "../shell";

defineProps<{
	canRun: boolean;
	running: boolean;
	runState: "idle" | "running" | "success" | "failure" | "cancelled" | "stale";
	stage: string;
	status: string;
	cleanupPending: boolean;
	exportStatus: string;
	completedOutputId: string;
	drawerDock: DrawerDock;
	staticDiagnostics: TextDiagnostic[];
	runDiagnostics: TextDiagnostic[];
	previewDiagramErrors: Array<{ diagramId: string; diagnostic: TextDiagnostic }>;
	inputDiagnostics: TextDiagnostic[];
	summary: RunSummary;
}>();

const emit = defineEmits<{
	run: [];
	cancel: [];
	outputAction: [action: DesktopExportAction];
	navigateDiagnostic: [item: TextDiagnostic];
	navigateInputDiagnostic: [item: TextDiagnostic];
	dockChange: [dock: DrawerDock];
}>();

const expanded = ref(false);

function displayDiagnostic(item: TextDiagnostic): string {
	const context = [item.inputName, item.dataPath, item.dataLine ? `data line ${item.dataLine}` : ""].filter(Boolean).join(" · ");
	return context ? `${item.message} (${context})` : item.message;
}
</script>

<template>
	<section class="runtime-drawer" aria-label="Runtime drawer">
		<div class="drawer-heading">
			<strong>RUNTIME</strong><span class="state" :class="`state-${running ? 'running' : runState}`">{{ running ? "running" : runState }}</span>
			<span v-if="stage" class="drawer-stage">{{ stage }}</span><span class="header-spacer"></span>
			<button v-if="canRun" type="button" title="Run active document" aria-label="Run active document" @click="emit('run')"><Play :size="14" /></button>
			<button v-if="running" type="button" title="Cancel current job" aria-label="Cancel current job" @click="emit('cancel')">Cancel</button>
			<button type="button" :aria-expanded="expanded" @click="expanded = !expanded">{{ expanded ? "Hide details" : "Details" }}</button>
			<button type="button" :aria-pressed="drawerDock === 'bottom'" @click="emit('dockChange', 'bottom')">Bottom</button>
			<button type="button" :aria-pressed="drawerDock === 'right'" @click="emit('dockChange', 'right')">Right</button>
		</div>
		<p class="runtime-status" role="status" aria-live="polite">{{ status }}<span v-if="stage"> · {{ stage }}</span></p>
		<progress v-if="running" class="runtime-progress" aria-label="Current operation is running"></progress>
		<p v-if="cleanupPending" class="runtime-status" role="status" aria-live="polite">Worker cleanup is pending.</p>
		<p v-if="exportStatus" class="export-status" aria-live="polite">{{ exportStatus }}</p>
		<div v-if="completedOutputId" class="output-actions">
			<button type="button" title="Open exported file" aria-label="Open exported file" @click="emit('outputAction', 'open')"><ExternalLink :size="14" /> Open</button>
			<button type="button" title="Reveal exported file" aria-label="Reveal exported file" @click="emit('outputAction', 'reveal')"><FolderOpen :size="14" /> Reveal</button>
		</div>
		<div v-if="expanded" class="runtime-details">
			<p v-for="(item, index) in staticDiagnostics" :key="`static-${item.code}-${index}`"><button class="diagnostic-link" :disabled="!item.file || !item.line" @click="emit('navigateDiagnostic', item)">Static {{ item.code }}: {{ displayDiagnostic(item) }}</button></p>
			<p v-for="(item, index) in runDiagnostics" :key="`run-${item.code}-${index}`"><button class="diagnostic-link" :disabled="!item.file || !item.line" @click="emit('navigateDiagnostic', item)">Run {{ item.code }}: {{ displayDiagnostic(item) }}</button></p>
			<p v-for="item in previewDiagramErrors" :key="item.diagramId" role="alert">{{ item.diagnostic.code }} · {{ item.diagnostic.message }}<small v-if="item.diagnostic.file || item.diagnostic.line"> ({{ item.diagnostic.file }}<template v-if="item.diagnostic.line">:{{ item.diagnostic.line }}<template v-if="item.diagnostic.column">:{{ item.diagnostic.column }}</template></template>)</small></p>
			<p v-for="item in summary.values" :key="item.name"><code>{{ item.name }}</code> {{ item.value }}</p>
			<p v-for="item in inputDiagnostics" :key="`input-${item.code}-${item.inputName}`"><button class="diagnostic-link" :disabled="!item.line && !item.inputName" @click="emit('navigateInputDiagnostic', item)">Input {{ item.code }}: {{ displayDiagnostic(item) }}</button></p>
			<p v-if="!runDiagnostics.length && !staticDiagnostics.length && !previewDiagramErrors.length && !summary.values.length && !inputDiagnostics.length" class="muted">No runtime details.</p>
		</div>
	</section>
</template>