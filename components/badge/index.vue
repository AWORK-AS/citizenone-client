<template>
    <div class="px-2 py-1 rounded-full text-xs" :class="[
        props.type === 'primary' && 'bg-primary text-white',
        props.type === 'active' && 'bg-green-700 text-white',
        props.type === 'inactive' && 'bg-red-800 text-white',
        props.type === 'notification' && 'bg-[#D27B7B] text-white',
        props.type === 'cart' && 'bg-[#D27B7B] text-white',
    ]">
        <slot />
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    type: {
        type: String,
        default: 'primary',
        required: true,
    },
})
</script>