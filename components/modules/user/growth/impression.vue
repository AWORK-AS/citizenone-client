<template>
    <span class="hidden" aria-hidden="true" />
</template>

<script setup lang="ts">
// Placed inside a growth loop's entry point: rendered means it is on screen, so it counts as
// seen. Renders nothing visible.
import { recordGrowthEvent, type GrowthLoop } from '@/composables/growthEvents'

const props = defineProps<{ loop: GrowthLoop }>()

onMounted(() => recordGrowthEvent(props.loop, 'impression'))
</script>
