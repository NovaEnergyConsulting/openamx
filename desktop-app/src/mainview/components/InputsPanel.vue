<script setup lang="ts">
import type { InputConfiguration, TextDiagnostic } from "../../shared/rpc";

const props = defineProps<{
	configuration: InputConfiguration;
	diagnostics: TextDiagnostic[];
	validation: "aggregate" | "fail-fast";
	busy?: boolean;
}>();
const emit = defineEmits<{
	browse: [name: string];
	clear: [name: string, scope: "session" | "local" | "project"];
	promote: [name: string];
	open: [name: string];
	declaration: [line: number, column: number];
	diagnostic: [value: TextDiagnostic];
	validationChange: [mode: "aggregate" | "fail-fast"];
}>();

function statusLabel(status: InputConfiguration["inputs"][number]["status"]): string {
	if (status === "valid") return "Valid";
	if (status === "unvalidated") return "Not validated";
	if (status === "invalid") return "Invalid";
	return "Missing";
}

function clearScope(source: InputConfiguration["inputs"][number]["source"]): "session" | "local" | "project" {
	return source === "per-run" ? "session" : source === "project" ? "project" : "local";
}

function inputDiagnostics(name: string): TextDiagnostic[] {
	return props.diagnostics.filter(diagnostic => diagnostic.inputName === name).slice(0, 20);
}
</script>

<template>
	<section class="inputs-panel" aria-label="Declared inputs">
		<header class="context-heading">
			<div><p class="eyebrow">ACTIVE DOCUMENT</p><h2>Inputs</h2></div>
			<label class="validation-mode">Validation
				<select :value="validation" :disabled="busy" @change="emit('validationChange', ($event.target as HTMLSelectElement).value as 'aggregate' | 'fail-fast')">
					<option value="aggregate">Aggregate</option>
					<option value="fail-fast">Fail fast</option>
				</select>
			</label>
		</header>
		<p v-for="(diagnostic, index) in configuration.diagnostics" :key="`${diagnostic.code}-${index}`" class="settings-diagnostic" role="status">
			<strong>{{ diagnostic.code }}</strong> {{ diagnostic.message }}
		</p>
		<div v-if="configuration.inputs.length" class="input-list">
			<article v-for="input in configuration.inputs" :key="input.name" class="input-row">
				<div class="input-row-heading">
					<div><button v-if="input.line" type="button" class="input-name" @click="emit('declaration', input.line, input.column ?? 1)">{{ input.name }}</button><strong v-else>{{ input.name }}</strong><code>{{ input.type }}</code></div>
					<span class="input-status" :class="`input-status-${input.status}`">{{ statusLabel(input.status) }}</span>
				</div>
				<p class="input-source">Source <strong>{{ input.source === "per-run" ? "Session" : input.source }}</strong></p>
				<p v-for="(diagnostic, index) in inputDiagnostics(input.name)" :key="`${diagnostic.code}-${index}`" class="input-diagnostic-row">
					<button type="button" class="input-diagnostic" @click="emit('diagnostic', diagnostic)">{{ diagnostic.code }} · {{ diagnostic.message }}<small v-if="diagnostic.dataPath || diagnostic.dataLine">{{ diagnostic.dataPath }}<template v-if="diagnostic.dataLine"> · row {{ diagnostic.dataLine }}</template></small></button>
				</p>
				<div class="input-actions">
					<button type="button" :disabled="busy" @click="emit('browse', input.name)">Browse</button>
					<button type="button" :disabled="busy || input.source === 'missing'" @click="emit('clear', input.name, clearScope(input.source))">Clear</button>
					<button type="button" :disabled="busy || input.source === 'missing'" @click="emit('open', input.name)">Open in Data Editor</button>
					<button v-if="input.source === 'local'" type="button" :disabled="busy" @click="emit('promote', input.name)">Promote to project</button>
				</div>
			</article>
		</div>
		<p v-else-if="!configuration.diagnostics.length" class="inputs-empty">No logical inputs are declared by this document.</p>
		<p class="inputs-privacy">Selections stay on this device unless explicitly promoted to the project.</p>
	</section>
</template>
