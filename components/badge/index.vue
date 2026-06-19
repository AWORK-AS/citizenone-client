<template>
    <div :class="[
        props.type === 'notification' ? 'min-w-[18px] h-[18px] px-1 py-0 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none' : 'px-2 py-1 rounded-full text-center',
        props.type === 'primary' && 'bg-primary text-white text-xs',
        props.type === 'active' && 'bg-green-700 text-white text-xs',
        props.type === 'inactive' && 'bg-red-800 text-white text-xs',
        props.type === 'pending' && 'bg-yellow-500 text-white text-xs',
        props.type === 'cash-in' && 'bg-green-700 text-white text-xs',
        props.type === 'cash-out' && 'bg-red-400 text-white text-xs',
        props.type === 'coming-soon' && 'bg-secondary text-white',
        props.type === 'cart' && 'bg-[#D27B7B] text-white text-xs',
        props.type === 'none' && 'bg-primary text-white text-xs',
        props.type === 'no-risk' && 'bg-green-700 text-white text-xs',
        props.type === 'increased-risk' && 'bg-yellow-500 text-white text-xs',
        props.type === 'acute-increased-risk' && 'bg-red-600 text-white text-xs',
        props.type === 'harmless' && 'bg-primary text-white text-xs',
        props.type === 'low-risk' && 'bg-yellow-500 text-white text-xs',
        props.type === 'moderate-risk' && 'bg-orange-500 text-white text-xs',
        props.type === 'high-risk' && 'bg-red-500 text-white text-xs',
        props.type === 'plans-and-goals' && 'bg-yellow-600 text-white text-xs',
        props.type === 'single-goal' && 'bg-blue-600 text-white text-xs',
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