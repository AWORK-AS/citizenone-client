<template>
    <span>{{ display }}</span>
</template>

<script setup lang="ts">
// Counts up to `value` with an ease-out tween. SSR-safe (renders the final
// value on the server; animates on the client).
const props = defineProps<{ value: number; duration?: number }>()

const display = ref(props.value ?? 0)
let raf = 0

function animate(to: number) {
    if (typeof requestAnimationFrame === 'undefined') {
        display.value = to
        return
    }
    cancelAnimationFrame(raf)
    const from = display.value
    const duration = props.duration ?? 700
    let start: number | null = null
    const step = (ts: number) => {
        if (start === null) start = ts
        const p = Math.min(1, (ts - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
        display.value = Math.round(from + (to - from) * eased)
        if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
}

watch(() => props.value, (v) => animate(v ?? 0))
onMounted(() => animate(props.value ?? 0))
onUnmounted(() => {
    if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf)
})
</script>
