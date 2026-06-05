<template>
    <button type="button"
        class="inline-flex items-center gap-1 px-[10px] py-[5px] rounded-lg text-[12px] font-medium border transition-all cursor-pointer"
        :class="[
            props.buttonStyle === 'danger' && 'bg-[#F5F6F8] text-[#CC3B2D] border-red-200   hover:bg-red-50',
            props.buttonStyle === 'success' && 'bg-[#F5F6F8] text-[#2E9E33] border-green-200  hover:bg-green-50',
            !props.buttonStyle && 'bg-[#F5F6F8] text-[#5C6478] border-[#EAECF0]  hover:bg-[#EEF4FB] hover:text-[#205E77]',
            props.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        ]" :disabled="props.disabled">
        <slot name="icon-left" />
        <slot />
        <slot name="icon-right" />
    </button>
</template>

<script setup lang="ts">
const props = defineProps({
    buttonStyle: {
        type: String as () => 'danger' | 'success' | undefined,
        required: false,
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false,
    },
})
</script>
