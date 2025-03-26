<template>
    <div>
        <Modal size="xl" :title="$t('citizens.medicineJournals.history.giveMedicines')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formMedicineHistory">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="date" :label="$t('citizens.medicineJournals.history.form.date')" />
                                <FormDateField id="date" name="date"
                                    :placeholder="$t('citizens.medicineJournals.history.form.date')"
                                    v-model="state.formMedicineHistory.date" />
                            </div>
                            <Disclosure v-slot="{ open }"
                                v-for="(medicine, index) in citizenMedicineStore.getSelectedMedicines" :key="index">
                                <div>
                                    <DisclosureButton
                                        class="w-full bg-gray-100 ring-1 ring-gray-100 flex justify-between p-3.5"
                                        :class="!open ? 'rounded-md' : 'rounded-tl-md rounded-tr-md'">
                                        <p class="text-sm font-semibold text-gray-700">
                                        <p v-if="language.locale.value === 'en'">
                                            {{ medicine?.en_name }}
                                        </p>
                                        <p v-if="language.locale.value === 'dk'">
                                            {{ medicine?.dk_name }}
                                        </p>
                                        </p>
                                        <div class="flex items-center">
                                            <Icon name="ic:round-keyboard-arrow-down" class="w-4 h-4" v-if="!open" />
                                            <Icon name="ic:round-keyboard-arrow-up" class="w-4 h-4" v-else />
                                        </div>
                                    </DisclosureButton>
                                    <DisclosurePanel>
                                        <div
                                            class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-bl-lg rounded-br-lg px-4 py-6 sm:p-8">
                                            <div class="space-y-3">
                                                <div class="space-y-3" v-if="medicine.is_pn_medicine">
                                                    <div class="space-y-1">
                                                        <FormLabel for="dosage"
                                                            :label="$t('citizens.medicineJournals.history.form.dailyDose')" />
                                                        <FormTextField id="dosage" name="dosage"
                                                            :placeholder="$t('citizens.medicineJournals.history.form.dailyDose')" />
                                                    </div>
                                                    <div class="space-y-1">
                                                        <p class="text-sm text-gray-600">
                                                            {{ $t('citizens.medicineJournals.history.form.type.type') }}
                                                        </p>
                                                        <div>
                                                            <RadioGroup v-model="state.formMedicineHistory.type"
                                                                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                <RadioGroupOption as="template"
                                                                    v-for="(type, index) in state.options.types"
                                                                    :key="index" :value="type.value"
                                                                    v-slot="{ active, checked }">
                                                                    <div
                                                                        :class="[
                                                                            active ? 'ring-1 ring-offset-2' : '',
                                                                            type.title === 'Delivered' && 'ring-primary',
                                                                            type.title === 'Deviated' && 'ring-red-600',
                                                                            type.title === 'Given' && 'ring-green-700',
                                                                            checked && type.title === 'Delivered' && 'bg-primary text-white ring-0 hover:bg-primary',
                                                                            checked && type.title === 'Deviated' && 'bg-red-600 text-white ring-0 hover:bg-red-600',
                                                                            checked && type.title === 'Given' && 'bg-green-700 text-white ring-0 hover:bg-green-700',
                                                                            !active && !checked && type.title === 'Delivered' && 'border border-primary ring-inset',
                                                                            !active && !checked && type.title === 'Deviated' && 'border border-red-600 ring-inset',
                                                                            !active && !checked && type.title === 'Given' && 'border border-green-700 ring-inset',
                                                                            active && checked ? 'text-white ring-1' : '',
                                                                            'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
                                                                        <span v-if="type.title === 'Delivered'">
                                                                            {{
                                                                                $t('citizens.medicineJournals.history.form.type.delivered')
                                                                            }}
                                                                        </span>
                                                                        <span v-if="type.title === 'Deviated'">
                                                                            {{
                                                                                $t('citizens.medicineJournals.history.form.type.deviated')
                                                                            }}
                                                                        </span>
                                                                        <span v-if="type.title === 'Given'">
                                                                            {{
                                                                                customPagesStore.getCustomPagesName?.giveMedicine
                                                                            }}
                                                                        </span>
                                                                    </div>
                                                                </RadioGroupOption>
                                                            </RadioGroup>
                                                        </div>
                                                        <FormError
                                                            :error="v$?.formMedicineHistory?.type?.$errors[0]?.$message.toString()" />
                                                        <FormError :error="props?.error?.errors?.type?.[0]" />
                                                    </div>
                                                    <div class="space-y-1">
                                                        <FormLabel for="evaluator"
                                                            :label="$t('citizens.medicineJournals.history.form.evaluator')" />
                                                        <FormSelect id="evaluator" name="evaluator"
                                                            :options="state.options.evaluators"
                                                            v-model="state.formMedicineHistory.evaluator" />
                                                        <FormError
                                                            :error="v$?.formMedicineHistory?.evaluator?.$errors[0]?.$message.toString()" />
                                                        <FormError :error="props?.error?.errors?.evaluator?.[0]" />
                                                    </div>
                                                    <div class="space-y-1">
                                                        <FormLabel for="evaluation_frequency"
                                                            :label="$t('citizens.medicineJournals.history.form.evaluationFrequency')" />
                                                        <FormSelectMultiple id="evaluation_frequency"
                                                            name="evaluation_frequency"
                                                            :options="state.options.evaluation_frequencies"
                                                            v-model="state.formMedicineHistory.evaluation_frequency" />
                                                        <FormError
                                                            :error="v$?.formMedicineHistory?.evaluation_frequency?.$errors[0]?.$message.toString()" />
                                                        <FormError
                                                            :error="props?.error?.errors?.evaluation_frequency?.[0]" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </DisclosurePanel>
                                </div>
                            </Disclosure>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="emit('close')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                        <DialogConfirmation :isModalOpen="state.modal.isMoreThanMedicineDailyConfirmationOpen"
                            :message="$t('citizens.medicineJournals.history.confirmation.rightDailyDoseConfirmation') + '?'"
                            @close="state.modal.isMoreThanMedicineDailyConfirmationOpen = false"
                            @confirm="giveMedicines" />
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useCitizenMedicineStore } from '@/store/citizen-medicines'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const citizenMedicineStore = useCitizenMedicineStore() as any

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshMedicineHistories'])
const customPagesStore = useCustomPagesStore() as any

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formMedicineHistory: {
        date: moment().format('YYYY-MM-DD'),
        dosages: [],
        evaluator_uuid: '',
    },
    modal: {
        isMoreThanMedicineDailyConfirmationOpen: false,
    },
})

function closeModal() {
    emit('close')
}

function refreshMedicineHistories() {
    emit('refreshMedicineHistories')
}

function submitForm() {
    state.modal.isMoreThanMedicineDailyConfirmationOpen = true
}

async function giveMedicines(medicineHistoryDetails: any) {
    // state.error = {}
    // state.isPageLoading = true
    // try {
    //     let params = {}
    //     const selectedMedicineUuid = props.selectedMedicine?.uuid
    //     if (props.selectedMedicine?.is_pn_medicine) {
    //         params = {
    //             medicine_uuid: selectedMedicineUuid,
    //             date: medicineHistoryDetails.date,
    //             dosage: medicineHistoryDetails.dosage,
    //             type: medicineHistoryDetails.type,
    //             evaluator_uuid: medicineHistoryDetails.evaluator,
    //             evaluation_frequency: medicineHistoryDetails.evaluation_frequency,
    //         }
    //     } else {
    //         params = {
    //             medicine_uuid: selectedMedicineUuid,
    //             date: medicineHistoryDetails.date,
    //             dosages: medicineHistoryDetails.dosages,
    //         }
    //     }
    //     const response = await medicineHistoryService.saveMedicineHistory(params)
    //     if (response?.data) {
    //         refreshMedicineHistories()
    //         closeModal()
    //         successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.history.form.alert.successfullyAdded')}.`)
    //     }
    // } catch (error: any) {
    //     state.error = error
    // }
    // state.isPageLoading = false
}
</script>