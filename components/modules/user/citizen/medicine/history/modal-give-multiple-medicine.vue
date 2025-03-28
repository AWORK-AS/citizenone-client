<template>
    <div>
        <Modal size="xl" :title="$t('citizens.medicineJournals.history.giveAllMedicines')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formGiveMedicine">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="date" :label="$t('citizens.medicineJournals.history.form.date')" />
                                <FormDateField id="date" name="date"
                                    :placeholder="$t('citizens.medicineJournals.history.form.date')"
                                    v-model="state.formGiveMedicine.date" />
                            </div>
                            <Disclosure v-slot="{ open }"
                                v-for="(selectedMedicine, selecedMedicineIndex) in state.formGiveMedicine.medicines"
                                :key="selecedMedicineIndex">
                                <div>
                                    <DisclosureButton
                                        class="w-full bg-gray-100 ring-1 ring-gray-100 flex justify-between p-3.5"
                                        :class="!open ? 'rounded-md' : 'rounded-tl-md rounded-tr-md'">
                                        <div class="text-sm font-semibold text-gray-700">
                                            <p v-if="language.locale.value === 'en'">
                                                {{ selectedMedicine?.medicine?.en_name }}
                                            </p>
                                            <p v-if="language.locale.value === 'dk'">
                                                {{ selectedMedicine?.medicine?.dk_name }}
                                            </p>
                                        </div>
                                        <div class="flex items-center">
                                            <Icon name="ic:round-keyboard-arrow-down" class="w-4 h-4" v-if="!open" />
                                            <Icon name="ic:round-keyboard-arrow-up" class="w-4 h-4" v-else />
                                        </div>
                                    </DisclosureButton>
                                    <DisclosurePanel>
                                        <div
                                            class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-bl-lg rounded-br-lg px-4 py-6 sm:p-8">
                                            <div class="space-y-3" v-if="selectedMedicine.is_pn_medicine">
                                                <div class="space-y-1">
                                                    <FormLabel for="dosage"
                                                        :label="$t('citizens.medicineJournals.history.form.dailyDose')" />
                                                    <FormTextField id="dosage" name="dosage"
                                                        :placeholder="$t('citizens.medicineJournals.history.form.dailyDose')"
                                                        v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].dosage" />
                                                </div>
                                                <div class="space-y-1">
                                                    <p class="text-sm text-gray-600">
                                                        {{ $t('citizens.medicineJournals.history.form.type.type') }}
                                                    </p>
                                                    <div>
                                                        <RadioGroup
                                                            v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].type"
                                                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            <RadioGroupOption as="template"
                                                                v-for="(type, typeIndex) in state.options.types"
                                                                :key="typeIndex" :value="type.value"
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
                                                </div>
                                                <div class="space-y-1">
                                                    <FormLabel for="evaluator"
                                                        :label="$t('citizens.medicineJournals.history.form.evaluator')" />
                                                    <FormSelect id="evaluator" name="evaluator"
                                                        :options="state.options.evaluators"
                                                        v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].evaluator_uuid" />
                                                </div>
                                                <div class="space-y-1">
                                                    <FormLabel for="evaluation_frequency"
                                                        :label="$t('citizens.medicineJournals.history.form.evaluationFrequency')" />
                                                    <FormSelectMultiple id="evaluation_frequency"
                                                        name="evaluation_frequency"
                                                        :options="state.options.evaluation_frequencies"
                                                        v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].evaluation_frequency" />
                                                </div>
                                                <div class="space-y-1">
                                                    <FormLabel :for="`comment_${selecedMedicineIndex}`"
                                                        :label="$t('citizens.medicineJournals.history.form.comment')" />
                                                    <FormTextArea :id="`comment_${selecedMedicineIndex}`"
                                                        :name="`comment_${selecedMedicineIndex}`"
                                                        :placeholder="$t('citizens.medicineJournals.history.form.comment')"
                                                        v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].comment" />
                                                </div>
                                            </div>
                                            <div class="space-y-4" v-else>
                                                <Disclosure v-slot="{ open }"
                                                    v-for="(dosage, dosageIndex) in selectedMedicine.dosages"
                                                    :key="dosageIndex">
                                                    <div>
                                                        <DisclosureButton
                                                            class="w-full bg-gray-100 ring-1 ring-gray-100 flex justify-between p-3.5"
                                                            :class="!open ? 'rounded-md' : 'rounded-tl-md rounded-tr-md'">
                                                            <p class="text-sm font-semibold text-gray-700">
                                                                {{ t('citizens.medicineJournals.history.form.time') }}:
                                                                {{ dosage?.time }}
                                                            </p>
                                                            <div class="flex items-center">
                                                                <Icon name="ic:round-keyboard-arrow-down"
                                                                    class="w-4 h-4" v-if="!open" />
                                                                <Icon name="ic:round-keyboard-arrow-up" class="w-4 h-4"
                                                                    v-else />
                                                            </div>
                                                        </DisclosureButton>
                                                        <DisclosurePanel>
                                                            <div
                                                                class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-bl-lg rounded-br-lg px-4 py-6 sm:p-8">
                                                                <div class="space-y-3">
                                                                    <div class="space-y-1">
                                                                        <FormLabel
                                                                            :for="`quantity_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :label="$t('citizens.medicineJournals.history.form.dailyDose')" />
                                                                        <FormTextField
                                                                            :id="`quantity_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :name="`quantity_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :placeholder="$t('citizens.medicineJournals.history.form.dailyDose')"
                                                                            :value="dosage.dosage"
                                                                            @keyup="(event: any) => handleQuantityInput(event, selecedMedicineIndex, dosageIndex)" />
                                                                    </div>
                                                                    <div class="space-y-1">
                                                                        <p class="text-sm text-gray-600">
                                                                            {{
                                                                                $t('citizens.medicineJournals.history.form.type.type')
                                                                            }}
                                                                        </p>
                                                                        <div>
                                                                            <RadioGroup
                                                                                v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].dosages[dosageIndex].type"
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
                                                                                        <span
                                                                                            v-if="type.title === 'Delivered'">
                                                                                            {{
                                                                                                $t('citizens.medicineJournals.history.form.type.delivered')
                                                                                            }}
                                                                                        </span>
                                                                                        <span
                                                                                            v-if="type.title === 'Deviated'">
                                                                                            {{
                                                                                                $t('citizens.medicineJournals.history.form.type.deviated')
                                                                                            }}
                                                                                        </span>
                                                                                        <span
                                                                                            v-if="type.title === 'Given'">
                                                                                            {{
                                                                                                customPagesStore.getCustomPagesName?.giveMedicine
                                                                                            }}
                                                                                        </span>
                                                                                    </div>
                                                                                </RadioGroupOption>
                                                                            </RadioGroup>
                                                                        </div>
                                                                    </div>
                                                                    <div class="space-y-1 col-span-2">
                                                                        <FormLabel
                                                                            :for="`comment_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :label="$t('citizens.medicineJournals.history.form.comment')" />
                                                                        <FormTextArea
                                                                            :id="`comment_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :name="`comment_${selecedMedicineIndex}_${dosageIndex}`"
                                                                            :placeholder="$t('citizens.medicineJournals.history.form.comment')"
                                                                            v-model="state.formGiveMedicine.medicines[selecedMedicineIndex].dosages[dosageIndex].comment" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </DisclosurePanel>
                                                    </div>
                                                </Disclosure>
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
                            @confirm="giveAllMedicines" />
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { medicineJournalService } from '@/components/api/user/MedicineJournalService'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { userService } from '@/components/api/user/UserService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useCitizenMedicineStore } from '@/store/citizen-medicines'
import { euDecimalValidation } from "@/composables/euDecimalValidation"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const citizenMedicineStore = useCitizenMedicineStore() as any
const { validateEuropeanDecimal } = euDecimalValidation()

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
    formGiveMedicine: {
        date: moment().format('YYYY-MM-DD'),
        medicines: [],
    } as any,
    modal: {
        isMoreThanMedicineDailyConfirmationOpen: false,
    },
    options: {
        evaluation_frequencies: [] as any,
        evaluators: [],
        types: [
            { value: 'delivered', title: 'Delivered' },
            { value: 'deviated', title: 'Deviated' },
            { value: 'given', title: 'Given' },
        ] as any
    }
})

function closeModal() {
    emit('close')
}

function refreshMedicineHistories() {
    emit('refreshMedicineHistories')
}

generateEvaluationFrequenciesTimeIntervals()

function generateEvaluationFrequenciesTimeIntervals() {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 1) {
            const hourStr = String(hour).padStart(2, '0')
            const minuteStr = String(minute).padStart(2, '0')
            const time = `${hourStr}:${minuteStr}`
            times.push({ value: time, label: time })
        }
    }
    state.options.evaluation_frequencies = times
}

watch(() => props.isModalOpen, (newValue) => {
    if (newValue) {
        fetchAllUsers()
        fetchAllSelectedMedicines()
    }
})

async function fetchAllUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname,
                })
            )
            state.options.evaluators = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllSelectedMedicines() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_medicine_uuid: Array(citizenMedicineStore.getSelectedMedicines),
        }
        const response = await medicineJournalService.getAllSelectedMedicines(params)
        if (response.data) {
            let medicines = [] as any
            response.data?.forEach((selectedMedicine: any) => {
                if (selectedMedicine?.is_pn_medicine) {
                    medicines.push({
                        medicine: selectedMedicine?.medicine,
                        is_pn_medicine: selectedMedicine?.is_pn_medicine,
                        citizen_medicine_uuid: selectedMedicine?.uuid,
                        dosage: '',
                        type: '',
                        evaluator_uuid: '',
                        evaluation_frequency: [],
                        comment: '',
                    })
                } else {
                    medicines.push({
                        medicine: selectedMedicine?.medicine,
                        is_pn_medicine: selectedMedicine?.is_pn_medicine,
                        citizen_medicine_uuid: selectedMedicine?.uuid,
                        dosages: generateDosage(selectedMedicine),
                    })
                }
            })
            state.formGiveMedicine.medicines = medicines
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function generateDosage(selectedMedicine: any) {
    let dosages = [] as any
    JSON.parse(selectedMedicine?.max_dosage_per_time).forEach((dosage: any) => {
        dosages.push({
            medicine_uuid: selectedMedicine?.uuid,
            time: dosage?.time,
            dosage: '',
            type: '',
            comment: '',
        })
    })
    return dosages
}

function submitForm() {
    state.modal.isMoreThanMedicineDailyConfirmationOpen = true
}

async function giveAllMedicines() {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {
            date: state.formGiveMedicine.date,
            medicines: state.formGiveMedicine.medicines,
        }
        const response = await medicineHistoryService.saveAllMedicineHistory(params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.history.form.alert.successfullyAdded')}.`)
            closeModal()
            citizenMedicineStore.resetSelectedMedicine()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function handleQuantityInput(event: Event, selectedMedicineIndex: number, dosageIndex: number) {
    const target = event.target as HTMLInputElement
    if (language.locale.value === 'dk') {
        target.value = validateEuropeanDecimal(target.value)
    }
    state.formGiveMedicine.medicines[selectedMedicineIndex].dosages[dosageIndex].dosage = target.value
}
</script>