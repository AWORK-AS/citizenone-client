<template>
    <div>
        <Modal size="xs" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()">
                    <div class="space-y-3">
                        <fieldset>
                            <RadioGroup v-model="state.formFilter.selectedViewFilter"
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
                                                        {{ $t('plansandgoals.filter.showAllPlansAndGoals') }}
                                                    </span>
                                                    <span v-if="viewFilter.title === 'Plans with goals'">
                                                        {{ $t('plansandgoals.filter.showOnlyPlansWithGoals')
                                                        }}
                                                    </span>
                                                    <span v-if="viewFilter.title === 'Single goals'">
                                                        {{ $t('plansandgoals.filter.showOnlySingleGoals') }}
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
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formFilter.is_completed"
                                @toggleSwitch="state.formFilter.is_completed = !state.formFilter.is_completed" />
                            <p>
                                {{ $t('plansandgoals.filter.completed') }}
                            </p>
                        </div>
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
import { useCitizenPlansAndGoalsStore } from '@/store/citizen-plans-and-goals'

const citizenPlansAndGoalsStore = useCitizenPlansAndGoalsStore()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'setFilterView'])

const state = reactive({
    formFilter: {
        is_completed: citizenPlansAndGoalsStore.getFilterIsCompleted as any,
        selectedViewFilter: citizenPlansAndGoalsStore.getFilterView as any,
    },
    options: {
        viewFilterLists: [
            { id: 1, title: 'Plans and goals' },
            { id: 2, title: 'Plans with goals' },
            { id: 3, title: 'Single goals' },
        ]
    }
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.formFilter.selectedViewFilter = state.options.viewFilterLists.find((item: any) => item.title === citizenPlansAndGoalsStore.getFilterView)
    }
})

function closeModal() {
    emit('close')
}

function submitForm() {
    emit('setFilterView', state.formFilter)
    closeModal()
}
</script>