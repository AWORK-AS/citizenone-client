<template>
    <select :value="current" :aria-label="label"
        class="h-9 rounded-lg border border-line bg-white pl-3 pr-8 text-[13px] text-ink-body outline-none focus:border-accent transition-colors"
        :class="current !== emptyValue && 'text-ink border-line-strong'"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
        <option v-if="placeholder !== undefined" :value="emptyValue">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
</template>

<script setup lang="ts">
/** A filter dropdown for the data table's `#filters` slot. */
const props = withDefaults(defineProps<{
    modelValue: string
    options: { value: string; label: string }[]
    /** The "all" option, sent as `emptyValue`. Left out when not given. */
    placeholder?: string
    emptyValue?: string
    label?: string
}>(), {
    placeholder: undefined,
    emptyValue: '',
    label: undefined,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// A value with no option of its own (a header sort the quick sort has no entry for) shows the placeholder.
const current = computed(() => (props.options.some(option => option.value === props.modelValue) ? props.modelValue : props.emptyValue))
</script>
