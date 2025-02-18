<template>
    <div>
        <Modal size="xs" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-3">
                    <fieldset>
                        <RadioGroup v-model="state.selectedViewFilter"
                            class="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-1 sm:gap-x-4">
                            <RadioGroupOption as="template" v-for="viewFilter in state.options.viewFilterLists"
                                :key="viewFilter.id" :value="viewFilter" :aria-label="viewFilter.title"
                                v-slot="{ active, checked }">
                                <div
                                    :class="[active ? 'border-primary ring-1 ring-primary' : 'border-gray-300', 'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-xs focus:outline-hidden']">
                                    <span class="flex flex-1">
                                        <span class="flex flex-col">
                                            <p class="block text-sm font-medium text-gray-900">
                                                <span v-if="viewFilter.title === 'Plans and goals'">
                                                    {{ $t('citizens.plansandgoals.filter.showAllPlansAndGoals') }}
                                                </span>
                                                <span v-if="viewFilter.title === 'Plans with goals'">
                                                    {{ $t('citizens.citizenJournals.filter.showOnlyPlansWithGoals') }}
                                                </span>
                                                <span v-if="viewFilter.title === 'Plans with goals'">
                                                    {{ $t('citizens.citizenJournals.filter.showOnlySingleGoals') }}
                                                </span>
                                            </p>
                                        </span>
                                    </span>
                                    <Icon name="ph:check-circle"
                                        :class="[!checked ? 'invisible' : '', 'size-5 text-primary']"
                                        aria-hidden="true" />
                                    <span
                                        :class="[active ? 'border' : 'border-1', checked ? 'border-primary' : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-lg']"
                                        aria-hidden="true" />
                                </div>
                            </RadioGroupOption>
                        </RadioGroup>
                    </fieldset>
                </div>
                <div class="mt-5 flex gap-x-3 justify-end">
                    <FormButton buttonStyle="primary" @click="closeModal" class="rounded-md">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useCitizenJournalStore } from '@/store/citizen-journal'

const citizenJournalStore = useCitizenJournalStore()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    selectedViewFilter: citizenJournalStore.getFilterView as any,
    options: {
        viewFilterLists: [
            { id: 1, title: 'Show all plans and goals' },
            { id: 2, title: 'Show only plans with goals' },
            { id: 3, title: 'Show only single goals' },
        ]
    }
})

watch(() => state.selectedViewFilter, (value: any) => {
    citizenJournalStore.setFilterView(value?.title)
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.selectedViewFilter = state.options.viewFilterLists.find((item: any) => item.title === citizenJournalStore.getFilterView)
    }
})

function closeModal() {
    emit('close')
}
</script>