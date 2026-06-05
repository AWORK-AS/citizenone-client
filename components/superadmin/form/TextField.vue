<template>
    <input :type="type" :value="modelValue" :placeholder="placeholder" class="co-input"
        :class="hasError ? 'border-red-300 focus:border-red-400' : ''" v-bind="$attrs"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'text',
    },
    placeholder: {
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
