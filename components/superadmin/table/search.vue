<template>
    <div class="relative flex-1 min-w-[220px] max-w-[380px]">
        <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" aria-hidden="true" />
        <input
            :value="modelValue"
            type="text"
            :placeholder="placeholder"
            class="w-full h-9 pl-9 pr-3 text-sm border border-line rounded-lg bg-white text-ink placeholder-ink-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors"
            :aria-label="placeholder || undefined"
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
