<template>
    <span :class="['badge w-fit', classes[props.status] ?? 'badge-gray']">
        {{ $t(`whistleblower.statuses.${props.status}`) }}
    </span>
</template>

<script setup lang="ts">
const props = defineProps({
    status: {
        type: String,
        required: true,
    },
})

// Orange until someone has looked at it; green once closed.
const classes: Record<string, string> = {
    received: 'badge-orange',
    acknowledged: 'badge-blue',
    investigating: 'badge-purple',
    closed: 'badge-green',
}
</script>
