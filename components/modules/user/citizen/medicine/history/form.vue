<template>
    <form @submit.prevent="validateForm()" id="formMedicineHistory">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="date" :label="$t('citizens.medicineJournals.history.form.date')" />
                <FormDateField id="date" name="date" :placeholder="$t('citizens.medicineJournals.history.form.date')"
                    v-model="state.formMedicineHistory.date" />
                <FormError :error="v$?.formMedicineHistory?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
            </div>
            <div class="space-y-3" v-if="props.selectedMedicine.is_pn_medicine">
                <div class="space-y-1">
                    <FormLabel for="dosage" :label="$t('citizens.medicineJournals.history.form.dailyDose')" />
                    <FormTextField id="dosage" name="dosage"
                        :placeholder="$t('citizens.medicineJournals.history.form.dailyDose')"
                        v-model="state.formMedicineHistory.dosage" />
                    <FormError :error="v$?.formMedicineHistory?.dosage?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.dosage?.[0]" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ $t('citizens.medicineJournals.history.form.type.type') }}
                    </p>
                    <div>
                        <RadioGroup v-model="state.formMedicineHistory.type"
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <RadioGroupOption as="template" v-for="(type, index) in state.options.types" :key="index"
                                :value="type.value" v-slot="{ active, checked }">
                                <div :class="[
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
                                        {{ customPagesStore.getCustomPagesName?.giveMedicine }}
                                    </span>
                                </div>
                            </RadioGroupOption>
                        </RadioGroup>
                    </div>
                    <FormError :error="v$?.formMedicineHistory?.type?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.type?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="evaluator" :label="$t('citizens.medicineJournals.history.form.evaluator')" />
                    <FormSelect id="evaluator" name="evaluator" :options="state.options.evaluators"
                        v-model="state.formMedicineHistory.evaluator" />
                    <FormError :error="v$?.formMedicineHistory?.evaluator?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.evaluator?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="evaluation_frequency"
                        :label="$t('citizens.medicineJournals.history.form.evaluationFrequency')" />
                    <FormSelectMultiple id="evaluation_frequency" name="evaluation_frequency"
                        :options="state.options.evaluation_frequencies"
                        v-model="state.formMedicineHistory.evaluation_frequency" />
                    <FormError
                        :error="v$?.formMedicineHistory?.evaluation_frequency?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.evaluation_frequency?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel :for="`comment`" :label="$t('citizens.medicineJournals.history.form.comment')" />
                    <FormTextArea :id="`comment`" :name="`comment`"
                        :placeholder="$t('citizens.medicineJournals.history.form.comment')"
                        v-model="state.formMedicineHistory.comment" />
                </div>
            </div>
            <div class="space-y-4" v-else>
                <Disclosure v-slot="{ open }" v-for="(dosage, index) in state.formMedicineHistory.dosages" :key="index">
                    <div>
                        <DisclosureButton class="w-full bg-gray-100 ring-1 ring-gray-100 flex justify-between p-3.5"
                            :class="!open ? 'rounded-md' : 'rounded-tl-md rounded-tr-md'">
                            <p class="text-sm font-semibold text-gray-700">
                                {{ t('citizens.medicineJournals.history.form.time') }}:
                                {{ dosage?.time }}
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
                                    <div class="space-y-1">
                                        <FormLabel :for="`quantity_${index}`"
                                            :label="$t('citizens.medicineJournals.history.form.dailyDose')" />
                                        <FormTextField :id="`quantity_${index}`" :name="`quantity_${index}`"
                                            :placeholder="$t('citizens.medicineJournals.history.form.dailyDose')"
                                            :value="dosage.dosage"
                                            @keyup="(event: any) => handleQuantityInput(event, index)" />
                                    </div>
                                    <div class="space-y-1">
                                        <p class="text-sm text-gray-600">
                                            {{ $t('citizens.medicineJournals.history.form.type.type') }}
                                        </p>
                                        <div>
                                            <RadioGroup v-model="state.formMedicineHistory.dosages[index].type"
                                                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                <RadioGroupOption as="template"
                                                    v-for="(type, index) in state.options.types" :key="index"
                                                    :value="type.value" v-slot="{ active, checked }">
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
                                                            {{ customPagesStore.getCustomPagesName?.giveMedicine }}
                                                        </span>
                                                    </div>
                                                </RadioGroupOption>
                                            </RadioGroup>
                                        </div>
                                        <FormError
                                            :error="v$?.formMedicineHistory?.type?.$errors[0]?.$message.toString()" />
                                        <FormError :error="props?.error?.errors?.type?.[0]" />
                                    </div>
                                    <div class="space-y-1 col-span-2">
                                        <FormLabel :for="`comment_${index}`"
                                            :label="$t('citizens.medicineJournals.history.form.comment')" />
                                        <FormTextArea :id="`comment_${index}`" :name="`comment_${index}`"
                                            :placeholder="$t('citizens.medicineJournals.history.form.comment')"
                                            v-model="state.formMedicineHistory.dosages[index].comment" />
                                    </div>
                                </div>
                            </div>
                        </DisclosurePanel>
                    </div>
                </Disclosure>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <DialogConfirmation :isModalOpen="state.modal.isMoreThanMedicineDailyConfirmationOpen"
            :message="$t('citizens.medicineJournals.history.confirmation.rightDailyDoseConfirmation') + '?'"
            @close="state.modal.isMoreThanMedicineDailyConfirmationOpen = false" @confirm="submitForm" />
    </form>
</template>

<script setup lang="ts">
import moment from 'moment'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { userService } from '@/components/api/user/UserService'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { euDecimalValidation } from "@/composables/euDecimalValidation"
import { useCustomPagesStore } from '@/store/custom-pages'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedMedicine: {
        type: Object,
        required: true,
    },
    selectedMedicineHistory: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm', 'isPageLoading', 'error'])

const { t } = useI18n()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any
const { validateEuropeanDecimal } = euDecimalValidation()

const state = reactive({
    formMedicineHistory: {
        uuid: '',
        date: '',
        dosage: '',
        type: '',
        evaluator: '',
        evaluation_frequency: [],
        dosages: [],
        comment: '',
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

onMounted(() => {
    fetchAllUsers()
    fetchMedicineHistoryPerMedicine(moment(props.selectedMedicineHistory?.date).format('YYYY-MM-DD'))
    state.formMedicineHistory = {
        uuid: props.selectedMedicineHistory.uuid,
        date: props.selectedMedicineHistory.date,
        dosage: props.selectedMedicineHistory?.quantity,
        type: props.selectedMedicineHistory?.type,
        dosages: [],
        evaluator: props.selectedMedicineHistory.evaluator?.uuid,
        evaluation_frequency: [],
        comment: props.selectedMedicineHistory.comment,
    }
    if (props.selectedMedicineHistory.evaluation_frequency?.length > 0) {
        props.selectedMedicineHistory.evaluation_frequency?.forEach((time: any) => {
            state.formMedicineHistory.evaluation_frequency.push(time)
        })
    }
    generateDosage()
})

watch(() => state.formMedicineHistory.date, (date: any) => {
    fetchMedicineHistoryPerMedicine(date)
})

const rules = computed(() => {
    if (props.selectedMedicine.is_pn_medicine) {
        return {
            formMedicineHistory: {
                date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                dosage: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                type: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                evaluator: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                evaluation_frequency: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formMedicineHistory: {
                date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                dosages: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function validateForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        if (computeAllEnteredQuantities() !== parseInt(props.selectedMedicine?.max_daily_dose)) {
            state.modal.isMoreThanMedicineDailyConfirmationOpen = true
        } else {
            submitForm()
        }
    }
}

function computeAllEnteredQuantities() {
    let total = 0
    state.formMedicineHistory.dosages.forEach((dosage: any) => {
        total += parseFloat(dosage?.dosage)
    })
    return total
}

function submitForm() {
    emit('submitForm', state.formMedicineHistory)
}

function generateDosage() {
    JSON.parse(props.selectedMedicine?.max_dosage_per_time).forEach((dosage: any) => {
        state.formMedicineHistory.dosages.push({
            medicine_uuid: props.selectedMedicine?.uuid,
            time: dosage?.time,
            dosage: '',
            type: '',
            comment: '',
        })
    })
}

async function fetchMedicineHistoryPerMedicine(date: any) {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const params = {
            date: date
        }
        const response = await medicineHistoryService.getMedicineHistoryByMedicineUuid(props.selectedMedicine?.uuid, params)
        if (response) {
            state.formMedicineHistory.dosages = response.data
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}

async function fetchAllUsers() {
    emit('error', {})
    emit('isPageLoading', true)
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
        emit('error', error)
    }
    emit('isPageLoading', false)
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

function handleQuantityInput(event: Event, index: number) {
    const target = event.target as HTMLInputElement
    if (language.locale.value === 'dk') {
        target.value = validateEuropeanDecimal(target.value)
    }
    state.formMedicineHistory.dosages[index].dosage = target.value
}
</script>

<style>
#formMedicineHistory .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>