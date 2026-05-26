<template>
    <ul class="space-y-2" :class="props.depth > 0 ? 'ml-5 border-l border-gray-200 pl-4' : ''">
        <li v-for="node in props.nodes" :key="node.uuid || node.id" class="space-y-2">
            <div class="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <div class="pt-0.5">
                    <input
                        v-if="node.type === 'folder'"
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        :checked="selectedIds.includes(Number(node.id))"
                        @change="handleToggle(node, $event)"
                    />
                    <Icon v-else name="ph:file" class="mt-0.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                        <Icon :name="node.type === 'folder' ? 'ph:folder' : 'ph:file'" class="h-4 w-4 text-primary" aria-hidden="true" />
                        <span class="truncate text-sm font-medium text-gray-900">
                            {{ node.name }}
                        </span>
                    </div>
                    <p class="mt-0.5 text-xs text-gray-500">
                        {{ node.type }}
                    </p>
                </div>
            </div>

            <ModulesUserSettingsLicenseOverviewCitizenTree
                v-if="node.children?.length"
                :nodes="node.children"
                :selectedIds="selectedIds"
                :depth="props.depth + 1"
                :onToggleFolder="props.onToggleFolder"
            />
        </li>
    </ul>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineOptions({
    name: 'ModulesUserSettingsLicenseOverviewCitizenTree',
})

const props = defineProps({
    nodes: {
        type: Array as PropType<any[]>,
        required: true,
    },
    selectedIds: {
        type: Array as PropType<number[]>,
        required: true,
    },
    onToggleFolder: {
        type: Function as PropType<(node: any, checked: boolean) => void>,
        required: true,
    },
    depth: {
        type: Number,
        default: 0,
    },
})

function handleToggle(node: any, event: Event) {
    const target = event.target as HTMLInputElement | null
    props.onToggleFolder(node, target?.checked ?? false)
}
</script>