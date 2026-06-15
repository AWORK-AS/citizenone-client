<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Target number to animate to. */
    value: number
    /** Animation duration in ms. */
    duration?: number
  }>(),
  { duration: 900 },
)

const display = ref(0)
let raf = 0
let startTs = 0
let fromVal = 0

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

function animate(to: number): void {
  cancelAnimationFrame(raf)

  if (prefersReduced || typeof window === 'undefined') {
    display.value = to
    return
  }

  fromVal = display.value
  startTs = 0

  const step = (ts: number): void => {
    if (!startTs) startTs = ts
    const progress = Math.min((ts - startTs) / props.duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
    display.value = Math.round(fromVal + (to - fromVal) * eased)
    if (progress < 1) raf = requestAnimationFrame(step)
  }

  raf = requestAnimationFrame(step)
}

onMounted(() => animate(props.value ?? 0))
watch(() => props.value, (v) => animate(v ?? 0))
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <span>{{ display }}</span>
</template>
