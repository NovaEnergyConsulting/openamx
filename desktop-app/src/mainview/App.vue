<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { DesktopRPCClient, PingResponse } from "../shared/rpc";
import { Button } from "@/components/ui/button";

const props = defineProps<{ rpc: DesktopRPCClient }>();
const result = ref<PingResponse | null>(null);
const error = ref("");
const pending = ref(false);

async function checkRuntime() {
	pending.value = true;
	error.value = "";
	try {
		result.value = await props.rpc.request.ping({ nonce: crypto.randomUUID() });
	} catch (cause) {
		error.value = cause instanceof Error ? cause.message : String(cause);
	} finally {
		pending.value = false;
	}
}

onMounted(checkRuntime);
</script>

<template>
	<main>
		<header>
			<span class="wordmark">OpenAMX</span>
			<span class="eyebrow">DESKTOP ARCHITECTURE SPIKE</span>
		</header>
		<section aria-labelledby="title">
			<p class="kicker">ELECTROBUN / VUE / BUN</p>
			<h1 id="title">A typed bridge, with authority kept behind it.</h1>
			<p class="lede">This webview can request a runtime identity. It has no direct file-system or evaluation capability.</p>
			<div class="proof" aria-live="polite">
				<div class="proof-heading">
					<span class="signal" :class="{ ready: result, failed: error }"></span>
					<strong>MAIN PROCESS</strong>
				</div>
				<p v-if="result" class="runtime">Bun {{ result.version }}</p>
				<p v-else-if="error" class="failure">{{ error }}</p>
				<p v-else class="waiting">{{ pending ? "Waiting for a typed response…" : "Not connected" }}</p>
				<Button type="button" :disabled="pending" @click="checkRuntime">
					{{ pending ? "Checking" : "Check connection" }}
				</Button>
			</div>
		</section>
		<footer>
			<span>REQUEST: <code>ping({ nonce })</code></span>
			<span>RESPONSE: <code>{ runtime, version }</code></span>
		</footer>
	</main>
</template>