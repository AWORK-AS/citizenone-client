<template>
    <div>
        <Modal size="xs" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()">
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
                                                    <span v-if="viewFilter.title === 'Standard view'">
                                                        {{ $t('citizens.citizenJournals.filter.standardView') }}
                                                    </span>
                                                    <span v-if="viewFilter.title === 'Journal note view'">
                                                        {{ $t('citizens.citizenJournals.filter.journalNoteView') }}
                                                    </span>
                                                    <span v-if="viewFilter.title === 'Risk assessment view'">
                                                        {{ customPagesStore.getCustomPagesName?.riskAssessment + ' ' +
                                                            $t('view') }}
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
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal()">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                {{ $t('filter') }}
                            </FormButton>
                        </div>
                    </div>
                </form>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useCitizenJournalStore } from '@/store/citizen-journal'
import { useCustomPagesStore } from '@/store/custom-pages'

const customPagesStore = useCustomPagesStore() as any
const citizenJournalStore = useCitizenJournalStore()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'setFilterView'])

const state = reactive({
    selectedViewFilter: citizenJournalStore.getFilterView as any,
    options: {
        viewFilterLists: [
            { id: 1, title: 'Standard view' },
            { id: 2, title: 'Journal note view' },
            { id: 3, title: 'Risk assessment view' },
        ]
    }
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.selectedViewFilter = state.options.viewFilterLists.find((item: any) => item.title === citizenJournalStore.getFilterView)
    }
})

function closeModal() {
    emit('close')
}

function submitForm() {
    emit('setFilterView', state.selectedViewFilter.title)
    closeModal()
}
</script>