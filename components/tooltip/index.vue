<!-- components/Tooltip.vue -->
<template>
    <div class="relative" ref="tooltipContainer">
        <slot></slot>
        <p class="z-50 truncate absolute -top-8 bg-gray-800 text-white p-2 rounded-md text-xs" v-if="visible">
            {{ props.text }}
        </p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    text: {
        type: String,
        required: true,
    },
})

// Define refs with their types
const tooltipContainer: Ref<HTMLElement | null> = ref(null)
const visible = ref(false)

const showTooltip = () => {
    visible.value = true
};

const hideTooltip = () => {
    visible.value = false
}

onMounted(() => {
    if (tooltipContainer.value) {
        tooltipContainer.value.addEventListener('mouseenter', showTooltip)
        tooltipContainer.value.addEventListener('mouseleave', hideTooltip)
    }
});

onUnmounted(() => {
    if (tooltipContainer.value) {
        tooltipContainer.value.removeEventListener('mouseenter', showTooltip)
        tooltipContainer.value.removeEventListener('mouseleave', hideTooltip)
    }
});
</script>