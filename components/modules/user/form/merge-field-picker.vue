<template>
    <div class="relative inline-block">
        <button type="button" class="text-sm text-primary flex items-center gap-x-1" @click="toggle">
            <Icon name="ph:brackets-curly" class="h-4 w-4" aria-hidden="true" />
            {{ $t('forms.mergeFields.insert') }}
        </button>

        <div v-if="state.isOpen"
            class="absolute z-30 mt-1 w-80 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg p-2">
            <p v-if="state.isLoading" class="text-sm text-gray-500 px-2 py-1">{{ $t('forms.mergeFields.loading') }}</p>

            <p v-else-if="state.groups.length === 0" class="text-sm text-gray-500 px-2 py-1">
                {{ $t('forms.mergeFields.none') }}
            </p>

            <div v-for="group in state.groups" :key="group.group" class="mb-2 last:mb-0">
                <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-2 py-1">
                    {{ group.label }}
                </p>
                <button v-for="field in group.fields" :key="field.key" type="button"
                    class="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 flex items-center justify-between gap-x-2"
                    @click="choose(field)">
                    <span class="text-sm text-gray-800">{{ field.label }}</span>
                    <span v-if="field.sensitive"
                        class="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                        {{ $t('forms.mergeFields.personal') }}
                    </span>
                </button>
            </div>

            <p class="text-xs text-gray-500 border-t border-gray-100 mt-2 pt-2 px-2">
                {{ $t('forms.mergeFields.hint') }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { mergeFieldService } from '@/components/api/user/MergeFieldService'

const emit = defineEmits(['insert'])

const state = reactive({
    isOpen: false,
    isLoading: false,
    groups: [] as any[],
})

async function toggle() {
    state.isOpen = !state.isOpen

    if (!state.isOpen || state.groups.length > 0) return

    state.isLoading = true
    try {
        const response = await mergeFieldService.getCatalogue()
        state.groups = response?.data ?? []
    } catch {
        state.groups = []
    }
    state.isLoading = false
}

function choose(field: any) {
    emit('insert', `{{${field.key}}}`)
    state.isOpen = false
}
</script>
