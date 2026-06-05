<template>
    <div class="relative flex-1 min-w-[220px] max-w-[380px]">
        <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
        <input
            :value="modelValue"
            type="text"
            :placeholder="placeholder"
            class="w-full pl-9 pr-3 py-2 text-sm border border-[#EAECF0] rounded-lg bg-white text-[#1F2533] placeholder-[#8891A4] outline-none focus:border-[#42AED9] focus:ring-2 focus:ring-[#42AED9]/10 transition-colors"
            @input="emit('update:modelValue', ($event.target as HTMLInputElement).value); emit('input', $event)"
        />
    </div>
</template>

<script setup lang="ts">
defineProps({
    modelValue: {
        type: String,
        required: false,
        default: '',
    },
    placeholder: {
        type: String,
        required: false,
        default: '',
    },
})

const emit = defineEmits(['update:modelValue', 'input'])
</script>
