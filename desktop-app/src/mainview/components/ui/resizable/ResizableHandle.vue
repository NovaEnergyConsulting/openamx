<script setup lang="ts">
import { SplitterResizeHandle } from "reka-ui";

defineProps<{
	label: string;
	controls: string;
	valueText: string;
}>();

const emit = defineEmits<{ dragging: [dragging: boolean] }>();
</script>

<template>
	<SplitterResizeHandle
		v-bind="$attrs"
		class="resizable-handle"
		:aria-label="label"
		:aria-controls="controls"
		:aria-orientation="'vertical'"
		:aria-valuetext="valueText"
		@dragging="emit('dragging', $event)"
	>
		<span class="resizable-handle-track" aria-hidden="true"></span>
	</SplitterResizeHandle>
</template>