<script setup lang="ts">
import { computed } from 'vue'

/**
 * Every field FMK returned for an element, nested as FMK sends it
 * (GK 3.5: all data must be showable; GK 3.4: codes stay findable).
 * Field names are FMK's own element names.
 */
defineOptions({ name: 'ModulesUserFmkFieldTree' })

const props = defineProps<{ value: any, depth?: number }>()

const entries = computed(() => {
    if (props.value === null || typeof props.value !== 'object') return []
    return Object.entries(props.value).map(([key, value]) => ({
        key,
        label: key.startsWith('@') ? key.slice(1) : key === '#text' ? '' : key,
        value,
        isList: Array.isArray(value),
        isScalar: value === null || typeof value !== 'object',
    }))
})
</script>

<template>
    <dl class="space-y-1" :class="(depth ?? 0) > 0 ? 'border-l border-[#e2e8f0] pl-3' : ''">
        <div v-for="entry in entries" :key="entry.key" class="text-sm">
            <template v-if="entry.isScalar">
                <dt v-if="entry.label" class="inline font-semibold text-[#64748b]">{{ entry.label }}:</dt>
                <dd class="ml-1 inline break-words text-[#1a2332]">{{ entry.value }}</dd>
            </template>
            <template v-else-if="entry.isList">
                <dt class="font-semibold text-[#64748b]">{{ entry.label }} ({{ entry.value.length }})</dt>
                <dd v-for="(item, index) in entry.value" :key="index" class="mt-1">
                    <ModulesUserFmkFieldTree v-if="item !== null && typeof item === 'object'" :value="item" :depth="(depth ?? 0) + 1" />
                    <span v-else class="text-[#1a2332]">{{ item }}</span>
                </dd>
            </template>
            <template v-else>
                <dt class="font-semibold text-[#64748b]">{{ entry.label }}</dt>
                <dd class="mt-1">
                    <ModulesUserFmkFieldTree :value="entry.value" :depth="(depth ?? 0) + 1" />
                </dd>
            </template>
        </div>
    </dl>
</template>
