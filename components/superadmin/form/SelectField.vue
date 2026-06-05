<template>
    <select
        :value="modelValue"
        class="co-input"
        :class="hasError ? 'border-red-300 focus:border-red-400' : ''"
        v-bind="$attrs"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
        <slot />
    </select>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    hasError: {
        type: Boolean,
        default: false,
    },
})

defineEmits(['update:modelValue'])
</script>
