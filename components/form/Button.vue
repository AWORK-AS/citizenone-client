<template>
    <button type="button"
        class="flex items-center justify-center gap-x-2 outline-none text-xs rounded-lg font-semibold whitespace-nowrap transition-all duration-150 ease-out active:scale-[0.97] disabled:active:scale-100"
        :class="[
            props.buttonStyle === 'primary' && 'bg-primary text-white border-1.5 border-primary shadow-sm hover:bg-primary-600 hover:border-primary-600',
            props.buttonStyle === 'secondary' && 'outline-none bg-blue-50 text-blue-700 border-1.5 border-blue-200 shadow-none hover:border-blue-700 hover:bg-blue-50 hover:shadow-none hover:transform-none',
            props.buttonStyle === 'action' && 'outline-none bg-blue-50 text-blue-700 border-1.5 border-blue-200 shadow-none hover:border-blue-700 hover:bg-blue-50 hover:shadow-none hover:transform-none',
            props.buttonStyle === 'success' && 'bg-green-800 text-white hover:bg-green-900',
            props.buttonStyle === 'warning' && 'bg-orange-400 text-white hover:bg-orange-500',
            props.buttonStyle === 'danger' && '!bg-red-50 !text-red-600 !border-1.5 !border-red-200 hover:!border-red-600',
            props.buttonStyle === 'incident' && '!rounded-lg bg-red-400 text-white hover:bg-red-500 text-xs !px-3 !py-1.5',
            props.buttonStyle === 'incident-link' && 'text-red-600 hover:text-red-700 text-xs',
            props.buttonStyle === 'link' && 'text-gray-800 hover:text-tertiary',
            props.buttonStyle === 'back' && 'text-tertiary hover:text-tertiary/90 pl-0',
            props.buttonStyle === 'cancel' && 'bg-gray-200/50 border-1.5 border-gray-200 hover:bg-gray-200/70',
            props.buttonStyle === 'white' && 'py-3 bg-white hover:hover:bg-tertiary-25',
            props.buttonStyle === 'get-started' && 'bg-upgrade border border-upgrade text-upgrade hover:bg-green-600',
            props.buttonStyle === 'no-risk' && 'bg-green-700 border border-green-700 text-white',
            props.buttonStyle === 'increased-risk' && 'bg-yellow-500 border border-yellow-500 text-white',
            props.buttonStyle === 'acute-increased-risk' && 'bg-red-600 border border-red-600 text-white',
            props.buttonStyle === 'plans-none' && 'border bg-white text-gray-900 hover:bg-text-gray-700',
            props.buttonStyle === 'plans-expiring' && 'border bg-yellow-500 text-white hover:bg-yellow-400',
            props.buttonStyle === 'plans-expired' && 'border bg-red-600 text-white hover:bg-red-500',
            props.buttonStyle === 'AI' && '!bg-[#f0faf9] !text-[#0a6e5e] !border-1.5 !border-[#b6e9e3] hover:!border-[#0a6e5e]',
            props.buttonStyle === 'app-white' && 'bg-white text-primary',
            props.buttonStyle === 'app-order-now' && 'bg-primary text-white',
            props.buttonStyle === 'app-activated' && 'bg-[#02c18e] text-white',
            !props.buttonStyle && 'text-tertiary border border-primary hover:bg-primary hover:text-white',
            props.buttonSize === 'sm' && 'p-3',
            props.buttonSize === 'xs' && 'p-2',
            !props.buttonSize && 'px-4 py-2.5',
            props.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
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