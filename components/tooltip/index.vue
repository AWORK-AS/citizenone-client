<template>
    <div ref="triggerRef" class="relative inline-block" @mouseenter="showTooltip" @mouseleave="scheduleHide">
        <div class="flex items-center">
            <slot />
        </div>

        <Teleport to="body">
            <div v-if="visible && !disabled && text"
                class="fixed z-[9999] text-sm text-white bg-primary rounded-md shadow-lg tooltip"
                :class="wrap ? 'w-72' : 'whitespace-nowrap'" :style="tooltipStyle" @mouseenter="cancelHide"
                @mouseleave="scheduleHide">
                <div :class="wrap ? 'px-2.5 py-1.5 max-h-36 overflow-y-auto' : 'px-2.5 py-1.5'">
                    <p class="text-white"
                        :class="wrap ? 'text-xs whitespace-pre-wrap break-words' : 'truncate text-xs'">{{ text }}</p>
                </div>
                <span class="tooltip-arrow" :class="`tooltip-arrow-${position}`" />
            </div>
        </Teleport>
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
const triggerRef = ref(null)
const tooltipStyle = ref({})
let hideTimer = null

function computePosition() {
    if (!triggerRef.value) return
    const rect = triggerRef.value.getBoundingClientRect()
    const GAP = 8

    switch (props.position) {
        case 'bottom':
            tooltipStyle.value = {
                top: `${rect.bottom + GAP}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translateX(-50%)',
            }
            break
        case 'left':
            tooltipStyle.value = {
                top: `${rect.top + rect.height / 2}px`,
                left: `${rect.left - GAP}px`,
                transform: 'translate(-100%, -50%)',
            }
            break
        case 'right':
            tooltipStyle.value = {
                top: `${rect.top + rect.height / 2}px`,
                left: `${rect.right + GAP}px`,
                transform: 'translateY(-50%)',
            }
            break
        case 'top':
        default:
            tooltipStyle.value = {
                top: `${rect.top - GAP}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translate(-50%, -100%)',
            }
            break
    }
}

const showTooltip = () => {
    computePosition()
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
</script>

<style>
.tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
}

.tooltip-arrow-top {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px 4px 0 4px;
    border-color: #0f4c75 transparent transparent transparent;
}

.tooltip-arrow-bottom {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 4px 4px 4px;
    border-color: transparent transparent #0f4c75 transparent;
}

.tooltip-arrow-left {
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 4px 0 4px 4px;
    border-color: transparent transparent transparent #0f4c75;
}

.tooltip-arrow-right {
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 4px 4px 4px 0;
    border-color: transparent #0f4c75 transparent transparent;
}
</style>
