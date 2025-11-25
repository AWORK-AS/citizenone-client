<template>
    <button type="button"
        class="flex items-center justify-center gap-x-2 outline-none rounded-md text-xs truncate font-semibold" :class="[
            props.buttonStyle === 'primary' && 'bg-tertiary border border-tertiary text-white hover:bg-tertiary-800',
            props.buttonStyle === 'action' && 'border bg-tertiary text-white hover:bg-tertiary-800',
            props.buttonStyle === 'success' && 'bg-green-800 text-white hover:bg-green-900',
            props.buttonStyle === 'warning' && 'bg-orange-400 text-white hover:bg-orange-500',
            props.buttonStyle === 'danger' && 'bg-[#dc5151] text-white hover:bg-red-500',
            props.buttonStyle === 'incident' && 'bg-red-400 text-white hover:bg-red-500 text-xxs',
            props.buttonStyle === 'incident-link' && 'text-red-600 hover:text-red-700 text-xxs',
            props.buttonStyle === 'link' && 'text-gray-800 hover:text-tertiary',
            props.buttonStyle === 'back' && 'text-tertiary hover:text-tertiary/90 pl-0',
            props.buttonStyle === 'cancel' && 'bg-gray-200 hover:bg-gray-200/90',
            props.buttonStyle === 'white' && 'bg-white hover:hover:bg-tertiary-25',
            props.buttonStyle === 'get-started' && 'bg-upgrade border border-upgrade text-white hover:bg-green-600',
            props.buttonStyle === 'no-risk' && 'bg-green-700 border border-green-700 text-white',
            props.buttonStyle === 'increased-risk' && 'bg-yellow-500 border border-yellow-500 text-white',
            props.buttonStyle === 'acute-increased-risk' && 'bg-red-600 border border-red-600 text-white',
            props.buttonStyle === 'plans-none' && 'border bg-white text-gray-900 hover:bg-text-gray-700',
            props.buttonStyle === 'plans-expiring' && 'border bg-yellow-500 text-white hover:bg-yellow-400',
            props.buttonStyle === 'plans-expired' && 'border bg-red-600 text-white hover:bg-red-500',
            !props.buttonStyle && 'text-tertiary border border-tertiary hover:bg-tertiary hover:text-white',
            props.buttonSize === 'sm' && 'p-3',
            props.buttonSize === 'xs' && 'p-2',
            !props.buttonSize && 'px-4 py-3.5',
            props.disabled && 'py-3.5 bg-red-400 hover:bg-red-400 cursor-not-allowed'
        ]" :disabled="props.disabled">
        <slot name="icon-left" />
        <slot></slot>
        <slot name="right-left" />
    </button>
</template>

<script setup lang="ts">
const props = defineProps({
    buttonStyle: {
        type: String,
        required: false,
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false,
    },
    buttonSize: {
        type: String,
        required: false,
    },
})
</script>