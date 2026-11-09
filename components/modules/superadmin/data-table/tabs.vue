<template>
    <div class="flex flex-wrap items-center bg-white border border-line rounded-lg p-0.5" role="group">
        <Tooltip v-for="tab in tabs" :key="tab.key" :text="tab.help ?? ''" position="bottom" wrap>
            <button type="button"
                class="h-8 px-3 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5"
                :class="modelValue === tab.key ? 'bg-tertiary text-white' : 'text-ink-body hover:text-ink'"
                :aria-pressed="modelValue === tab.key" @click="emit('update:modelValue', tab.key)">
                <span v-if="tab.dot" class="w-1.5 h-1.5 rounded-full" :class="tab.dot" aria-hidden="true" />
                {{ tab.label }}
                <span v-if="tab.count !== undefined && tab.count !== null" class="text-[11px] font-normal opacity-70 tabular-nums">
                    {{ tab.count }}
                </span>
            </button>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
/**
 * One choice out of a few, with counts: the status tabs of a superadmin list.
 * Sits in the data table's `#filters` slot.
 */
defineProps<{
    modelValue: string
    tabs: { key: string; label: string; count?: number | null; help?: string; dot?: string }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
