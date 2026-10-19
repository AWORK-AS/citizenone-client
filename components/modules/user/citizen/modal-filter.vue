<template>
    <Modal size="sm" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
        <template #modal-body>
            <div class="space-y-4">
                <!-- Built from CITIZEN_LIST_FILTERS (utils/citizenListFilters.ts);
                     a from/to pair shares a row. -->
                <div v-for="row in rows" :key="row[0].key"
                    :class="row.length > 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : ''">
                    <div v-for="item in row" :key="item.key">
                        <div v-if="item.type === 'checkbox'" class="flex items-center gap-2">
                            <FormCheckbox :value="state.filter[item.key] === true" @click="toggle(item.key)" />
                            <span class="text-sm text-gray-700">{{ $t(item.label) }}</span>
                        </div>
                        <div v-else class="space-y-1">
                            <FormLabel :for="`filter_${item.key}`" :label="$t(item.label)" />
                            <FormSelect v-if="item.type === 'select'" :id="`filter_${item.key}`"
                                :options="optionsFor(item.options)" :placeholder="$t('citizens.filters.any')"
                                v-model="state.filter[item.key]" />
                            <FormDateField v-else-if="item.type === 'date'" :id="`filter_${item.key}`"
                                :name="`filter_${item.key}`" v-model="state.filter[item.key]" />
                            <FormTextField v-else :id="`filter_${item.key}`" :name="`filter_${item.key}`"
                                :type="item.type === 'number' ? 'number' : 'text'" v-model="state.filter[item.key]" />
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-2 pt-2">
                    <button type="button" class="text-sm font-medium text-gray-600 hover:underline" @click="reset">
                        {{ $t('table.clearFilters') }}
                    </button>
                    <div class="flex items-center gap-2">
                        <button type="button"
                            class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                            @click="closeModal">
                            {{ $t('cancel') }}
                        </button>
                        <FormButton type="button" buttonStyle="primary" @click="apply">
                            {{ $t('filter') }}
                        </FormButton>
                    </div>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useCitizenListFilterOptions } from '@/composables/useCitizenListFilterOptions'
import type { PropType } from 'vue'
import type { CitizenListFilter } from '@/utils/citizenListFilters'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    /** The filter currently in force, so reopening shows what is set. */
    filter: {
        type: Object,
        default: () => ({}),
    },
    /** The filters this person may use (availableCitizenListFilters). */
    filters: {
        type: Array as PropType<CitizenListFilter[]>,
        required: true,
    },
})

const emit = defineEmits(['close', 'setFilter'])
const { optionsFor, load } = useCitizenListFilterOptions()

function empty(): Record<string, any> {
    return Object.fromEntries(props.filters.map((item) => [item.key, null]))
}

const state = reactive({
    filter: {} as Record<string, any>,
})

// Consecutive filters in the same group share a row.
const rows = computed(() => {
    const result: CitizenListFilter[][] = []
    for (const item of props.filters) {
        const last = result[result.length - 1]
        if (item.group && last && last[0].group === item.group) {
            last.push(item)
        } else {
            result.push([item])
        }
    }

    return result
})

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return

    state.filter = { ...empty(), ...props.filter }
    load(props.filters)
})

function toggle(key: string) {
    state.filter[key] = state.filter[key] ? null : true
}

function closeModal() {
    emit('close')
}

function apply() {
    emit('setFilter', { ...state.filter })
    closeModal()
}

function reset() {
    state.filter = empty()
    emit('setFilter', {})
    closeModal()
}
</script>
