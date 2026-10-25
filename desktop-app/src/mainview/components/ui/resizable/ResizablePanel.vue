<script setup lang="ts">
import { SplitterPanel } from "reka-ui";

defineProps<{
	id: string;
	defaultSize: number;
	minSize: number;
	maxSize?: number;
	sizeUnit: "px" | "%";
}>();
</script>

<template>
	<SplitterPanel :id="id" :default-size="defaultSize" :min-size="minSize" :max-size="maxSize" :size-unit="sizeUnit" v-bind="$attrs">
		<slot />
	</SplitterPanel>
</template>