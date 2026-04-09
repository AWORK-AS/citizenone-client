<template>
    <div class="relative inline-block" @mouseover="showTooltip" @mouseleave="hideTooltip">
        <div class="flex items-center">
            <slot />
            <div v-if="visible" class="absolute z-50 p-2 text-sm text-white bg-primary rounded shadow-lg tooltip"
                :class="[positionClasses, wrap ? 'w-64' : '']">
                <p :class="wrap ? 'text-xxs whitespace-pre-wrap break-words' : 'truncate text-xxs'">{{ text }}</p>
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
            return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2 tooltip-arrow-top'
        case 'bottom':
            return 'top-full mt-2 left-1/2 transform -translate-x-1/2 tooltip-arrow-bottom'
        case 'left':
            return 'right-full mr-2 top-1/2 transform -translate-y-1/2 tooltip-arrow-left'
        case 'right':
            return 'left-full ml-2 top-1/2 transform -translate-y-1/2 tooltip-arrow-right'
        default:
            return 'bottom-full mb-2 left-1/2 transform -translate-x-1/2 tooltip-arrow-top'
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
    border-color: #205E77 transparent transparent transparent;
}

.tooltip-arrow-bottom::after {
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 4px 4px 4px;
    border-color: transparent transparent #205E77 transparent;
}

.tooltip-arrow-left::after {
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 4px 0 4px 4px;
    border-color: transparent transparent transparent #205E77;
}

.tooltip-arrow-right::after {
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 4px 4px 4px 0;
    border-color: transparent #205E77 transparent transparent;
}
</style>
