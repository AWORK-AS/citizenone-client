<template>
    <div>
        <Modal size="md" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()" id="formMedicineFilter">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-3">
                        <fieldset>
                            <RadioGroup v-model="state.filter.isActive"
                                class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-y-6 sm:gap-x-4">
                                <RadioGroupOption as="template" v-for="viewFilter in state.options.activeInactiveFilter"
                                    :key="viewFilter.value" :value="viewFilter" :aria-label="viewFilter.title"
                                    v-slot="{ active, checked }">
                                    <div
                                        :class="[active ? 'border-primary ring-1 ring-primary' : 'border-gray-300', 'relative flex cursor-pointer rounded-full border bg-white p-4 shadow-xs focus:outline-hidden']">
                                        <span class="flex flex-1">
                                            <span class="flex flex-col">
                                                <p class="block text-sm font-medium text-gray-900">
                                                    <span v-if="viewFilter.title === 'Active'">
                                                        {{
                                                            $t('citizens.medicineJournals.form.active')
                                                        }}
                                                    </span>
                                                    <span v-if="viewFilter.title === 'Inactive'">
                                                        {{
                                                            $t('citizens.medicineJournals.form.inactive')
                                                        }}
                                                    </span>
                                                    <span v-if="viewFilter.title === 'Deactivated'">
                                                        {{
                                                            $t('citizens.medicineJournals.form.deactivated')
                                                        }}
                                                    </span>
                                                </p>
                                            </span>
                                        </span>
                                        <Icon name="ph:check-circle"
                                            :class="[!checked ? 'invisible' : '', 'size-5 text-primary']"
                                            aria-hidden="true" />
                                        <span
                                            :class="[active ? 'border' : 'border-1', checked ? 'border-primary' : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-full']"
                                            aria-hidden="true" />
                                    </div>
                                </RadioGroupOption>
                            </RadioGroup>
                        </fieldset>
                        <div class="space-y-1">
                            <FormLabel for="medication_type"
                                :label="$t('citizens.medicineJournals.form.medicationTypes.medicationType')" />
                            <FormSelect id="medication_type" :options="state.options.medicationTypes"
                                v-model="state.filter.medicationType" />
                            <FormError :error="v$?.filter?.medicationType?.$errors[0]?.$message.toString()" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal()">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary">
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
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useCitizenMedicineStore } from '@/store/citizen-medicines'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const citizenMedicineStore = useCitizenMedicineStore()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'setFilter'])

const state = reactive({
    error: {} as Error,
    filter: {
        isActive: citizenMedicineStore.getFilterByActiveInactiveDeactivated as any,
        medicationType: '',
        tags: [],
    },
    isPageLoading: false,
    options: {
        activeInactiveFilter: [
            { value: 'active', title: 'Active' },
            { value: 'inactive', title: 'Inactive' },
            { value: 'deactivated', title: 'Deactivated' },
        ],
        medicationTypes: [
            { value: 'all', label: `${t('citizens.medicineJournals.form.medicationTypes.all')}` },
            { value: 'pn_medicine', label: `${t('citizens.medicineJournals.form.medicationTypes.pnMedicine')}` },
            { value: 'regular_medicine', label: `${t('citizens.medicineJournals.form.medicationTypes.regularMedicine')}` },
        ],
        tags: [],
    }
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.filter.isActive = state.options.activeInactiveFilter.find((item: any) => item.value === citizenMedicineStore.getFilterByActiveInactiveDeactivated)
        state.options.medicationTypes = [
            { value: 'all', label: `${t('citizens.medicineJournals.form.medicationTypes.all')}` },
            { value: 'pn_medicine', label: `${t('citizens.medicineJournals.form.medicationTypes.pnMedicine')}` },
            { value: 'regular_medicine', label: `${t('citizens.medicineJournals.form.medicationTypes.regularMedicine')}` },
        ]
        state.filter.medicationType = citizenMedicineStore.getFilterMedicationType
    }
})

const rules = computed(() => {
    return {
        filter: {
            medicationType: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('setFilter', state.filter)
        closeModal()
    }
}
</script>

<style>
#formMedicineFilter .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>