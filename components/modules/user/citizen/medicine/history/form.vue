<template>
    <form @submit.prevent="validateForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="date" :label="$t('citizens.medicineJournals.history.form.date')" />
                <FormDateField id="date" name="date" :placeholder="$t('citizens.medicineJournals.history.form.date')"
                    v-model="state.formMedicineHistory.date" />
                <FormError :error="v$?.formMedicineHistory?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
            </div>
            <div class="space-y-8">
                <div v-for="(dosage, index) in state.formMedicineHistory.dosages" :key="index"
                    class="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                    <div class="space-y-1">
                        <FormLabel :for="`time_${index}`" :label="$t('citizens.medicineJournals.history.form.time')" />
                        <FormTextField :id="`time_${index}`" :name="`time_${index}`"
                            :placeholder="$t('citizens.medicineJournals.history.form.time')" :value="dosage?.time"
                            :disabled="true" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel :for="`quantity_${index}`"
                            :label="$t('citizens.medicineJournals.history.form.dailyDose')" />
                        <FormTextField :id="`quantity_${index}`" :name="`quantity_${index}`"
                            :placeholder="$t('citizens.medicineJournals.history.form.dailyDose')" :value="dosage.dosage"
                            @keyup="(event: any) => handleQuantityInput(event, index)" />
                    </div>
                    <div class="space-y-2">
                        <p class="text-sm text-gray-600">
                            {{ $t('citizens.medicineJournals.history.form.type.type') }}
                        </p>
                        <div>
                            <FormSelect :id="`type_${index}`" :name="`type_${index}`" :options="state.options.types"
                                v-model="state.formMedicineHistory.dosages[index].type" />
                        </div>
                    </div>
                    <div class="space-y-1 col-span-3">
                        <FormLabel :for="`comment_${index}`"
                            :label="$t('citizens.medicineJournals.history.form.comment')" />
                        <FormTextArea :id="`comment_${index}`" :name="`comment_${index}`"
                            :placeholder="$t('citizens.medicineJournals.history.form.comment')"
                            v-model="state.formMedicineHistory.dosages[index].comment" />
                    </div>
                </div>
            </div>
            <div class="space-y-3" v-if="props.selectedMedicine.is_pn_medicine">
                <div class="space-y-1">
                    <FormLabel for="evaluator" :label="$t('citizens.medicineJournals.history.form.evaluator')" />
                    <FormSelect id="evaluator" name="evaluator" :options="state.options.evaluators"
                        v-model="state.formMedicineHistory.evaluator" />
                    <FormError :error="v$?.formMedicineHistory?.evaluator?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.evaluator?.[0]" />
                </div>
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
import { userService } from '@/components/api/user/UserService'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { euDecimalValidation } from "@/composables/euDecimalValidation"
import { useCustomPagesStore } from '@/store/custom-pages'

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
        dosages: [],
        evaluator: '',
    } as any,
    modal: {
        isMoreThanMedicineDailyConfirmationOpen: false,
    },
    options: {
        evaluation_frequencies: [] as any,
        evaluators: [],
        types: [] as any
    }
})

onMounted(() => {
    state.options.types = [
        { value: 'delivered', label: `${t('citizens.medicineJournals.history.form.type.delivered')}` },
        { value: 'deviated', label: `${t('citizens.medicineJournals.history.form.type.deviated')}` },
        { value: 'given', label: `${customPagesStore.getCustomPagesName?.giveMedicine}` },
    ]
    fetchAllUsers()
    fetchMedicineHistoryPerMedicine(moment(props.selectedMedicineHistory?.date).format('YYYY-MM-DD'))
    state.formMedicineHistory = {
        uuid: props.selectedMedicineHistory.uuid,
        date: props.selectedMedicineHistory.date,
        dosages: [],
        evaluator: props.selectedMedicineHistory.evaluator?.uuid,
    }
    generateDosage()
})

const rules = computed(() => {
    if (props.selectedMedicine.is_pn_medicine) {
        return {
            formMedicineHistory: {
                date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                dosages: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                evaluator: {
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
        for (let minute = 0; minute < 60; minute += 15) {
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