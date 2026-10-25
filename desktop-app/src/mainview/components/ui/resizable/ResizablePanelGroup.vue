<script setup lang="ts">
import { SplitterGroup } from "reka-ui";

withDefaults(defineProps<{ direction: "horizontal" | "vertical"; keyboardResizeBy?: number }>(), {
	keyboardResizeBy: 10
});

const emit = defineEmits<{ layout: [layout: number[]] }>();
</script>

<template>
	<SplitterGroup :direction="direction" :keyboard-resize-by="keyboardResizeBy" v-bind="$attrs" @layout="emit('layout', $event)">
		<slot />
	</SplitterGroup>
</template>