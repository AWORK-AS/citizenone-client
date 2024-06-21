<template>
    <button type="button"
        class="capitalize flex items-center justify-center gap-x-2 outline-none rounded-md text-xs truncate font-semibold"
        :class="[
            props.buttonStyle === 'primary' && 'bg-tertiary text-white hover:bg-tertiary-800',
            props.buttonStyle === 'action' && 'border bg-tertiary text-white hover:bg-tertiary-800',
            props.buttonStyle === 'success' && 'bg-green-800 text-white hover:bg-green-900',
            props.buttonStyle === 'warning' && 'bg-orange-500 text-white hover:bg-orange-400',
            props.buttonStyle === 'danger' && 'bg-red-800 text-white hover:bg-red-700',
            props.buttonStyle === 'link' && 'text-gray-800 hover:text-tertiary',
            props.buttonStyle === 'back' && 'text-tertiary hover:text-tertiary/90 pl-0',
            props.buttonStyle === 'cancel' && 'bg-tertiary-50 hover:bg-tertiary-100/90',
            props.buttonStyle === 'white' && 'bg-white hover:hover:bg-tertiary-25',
            !props.buttonStyle && 'text-tertiary border border-tertiary hover:bg-tertiary hover:text-white',
            props.buttonSize === 'sm' && 'p-2',
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