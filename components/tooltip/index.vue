<template>
    <div class="relative inline-block" @mouseenter="showTooltip" @mouseleave="scheduleHide">
        <div class="flex items-center">
            <slot />
        </div>
        <div v-if="visible && !disabled && text"
            class="absolute z-50 text-sm text-white bg-primary rounded-md shadow-lg tooltip"
            :class="[positionClasses, wrap ? 'w-44' : 'whitespace-nowrap']" @mouseenter="cancelHide"
            @mouseleave="scheduleHide">
            <div :class="wrap ? 'px-2.5 py-1.5 max-h-36 overflow-y-auto' : 'px-2.5 py-1.5'">
                <p :class="wrap ? 'text-xs whitespace-pre-wrap break-words' : 'truncate text-xs'">{{ text }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    text: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        default: 'top',
    },
    wrap: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
})

const visible = ref(false)
let hideTimer = null

const showTooltip = () => {
    visible.value = true
}

const scheduleHide = () => {
    hideTimer = setTimeout(() => {
        visible.value = false
    }, 100)
}

const cancelHide = () => {
    if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
    }
}

onBeforeUnmount(() => {
    visible.value = false
    if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
    }
})

const positionClasses = computed(() => {
    switch (props.position) {
        case 'top':
            return 'bottom-full mb-2 left-1/2 -translate-x-1/2 tooltip-arrow-top'
        case 'bottom':
            return 'top-full mt-2 left-1/2 -translate-x-1/2 tooltip-arrow-bottom'
        case 'left':
            return 'right-full mr-2 top-1/2 -translate-y-1/2 tooltip-arrow-left'
        case 'right':
            return 'left-full ml-2 top-1/2 -translate-y-1/2 tooltip-arrow-right'
        default:
            return 'bottom-full mb-2 left-1/2 -translate-x-1/2 tooltip-arrow-top'
    }
})
</script>

<style>
.tooltip::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
}

.tooltip-arrow-top::after {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px 4px 0 4px;
    border-color: #0f4c75 transparent transparent transparent;
}

.tooltip-arrow-bottom::after {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 4px 4px 4px;
    border-color: transparent transparent #0f4c75 transparent;
}

.tooltip-arrow-left::after {
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 4px 0 4px 4px;
    border-color: transparent transparent transparent #0f4c75;
}

.tooltip-arrow-right::after {
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 4px 4px 4px 0;
    border-color: transparent #0f4c75 transparent transparent;
}
</style>
