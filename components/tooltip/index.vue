<template>
    <div class="relative inline-block" @mouseover="showTooltip" @mouseleave="hideTooltip">
        <slot />
        <div v-if="visible" class="absolute z-50 p-2 text-sm text-white bg-gray-800 rounded shadow-lg"
            :class="positionClasses" style="transition: opacity 0.2s; opacity: 0.9;">
            <p class="truncate">{{ text }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'

const props = defineProps({
    text: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        default: 'top',
    },
})

const visible = ref(false)

const showTooltip = () => {
    visible.value = true
}

const hideTooltip = () => {
    visible.value = false
}

const positionClasses = computed(() => {
    switch (props.position) {
        case 'top':
            return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'
        case 'bottom':
            return 'top-full mt-2 left-1/2 transform -translate-x-1/2'
        case 'left':
            return 'right-full mr-2 top-1/2 transform -translate-y-1/2'
        case 'right':
            return 'left-full ml-2 top-1/2 transform -translate-y-1/2'
        default:
            return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2'
    }
})
</script>
