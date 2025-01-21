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
            <div class="space-y-1">
                <FormLabel for="quantity" :label="$t('citizens.medicineJournals.history.form.dailyDose')" />
                <FormTextField id="quantity" name="quantity"
                    :placeholder="$t('citizens.medicineJournals.history.form.dailyDose')"
                    v-model="state.formMedicineHistory.quantity" @input="handleQuantityInput" />
                <FormError :error="v$?.formMedicineHistory?.quantity?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.quantity?.[0]" />
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
                                type.title === 'Deviated' && 'ring-green-700',
                                type.title === 'Given' && 'ring-yellow-500',
                                checked && type.title === 'Delivered' && 'bg-primary text-white ring-0 hover:bg-primary',
                                checked && type.title === 'Deviated' && 'bg-green-700 text-white ring-0 hover:bg-green-700',
                                checked && type.title === 'Given' && 'bg-yellow-500 text-white ring-0 hover:bg-yellow-500',
                                !active && !checked && type.title === 'Delivered' && 'border border-primary ring-inset',
                                !active && !checked && type.title === 'Deviated' && 'border border-green-700 ring-inset',
                                !active && !checked && type.title === 'Given' && 'border border-yellow-500 ring-inset',
                                active && checked ? 'text-white ring-1' : '',
                                'cursor-pointer flex items-center justify-center rounded-md px-2 py-2 text-xs']">
                                <span v-if="type.title === 'Delivered'">
                                    {{ $t('citizens.medicineJournals.history.form.type.delivered') }}
                                </span>
                                <span v-if="type.title === 'Deviated'">
                                    {{ $t('citizens.medicineJournals.history.form.type.deviated') }}
                                </span>
                                <span v-if="type.title === 'Given'">
                                    {{ $t('citizens.medicineJournals.history.form.type.given') }}
                                </span>
                            </div>
                        </RadioGroupOption>
                    </RadioGroup>
                </div>
                <FormError :error="v$?.formMedicineHistory?.type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.type?.[0]" />
            </div>
            <div class="space-y-3" v-if="props.selectedMedicine.is_pn_medicine">
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
                    <FormSelect id="evaluation_frequency" name="evaluation_frequency"
                        :options="state.options.evaluation_frequencies"
                        v-model="state.formMedicineHistory.evaluation_frequency" />
                    <FormError
                        :error="v$?.formMedicineHistory?.evaluation_frequency?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.evaluation_frequency?.[0]" />
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
import { userService } from '@/components/api/UserService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { euDecimalValidation } from "@/composables/euDecimalValidation"

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
const { validateEuropeanDecimal } = euDecimalValidation()

const state = reactive({
    formMedicineHistory: {
        uuid: '',
        date: '',
        quantity: '',
        type: '',
        evaluator: '',
        evaluation_frequency: [],
    },
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
    state.formMedicineHistory = {
        uuid: props.selectedMedicineHistory.uuid,
        date: props.selectedMedicineHistory.date,
        quantity: language.locale.value === 'dk' ? props.selectedMedicineHistory.quantity?.toString().replace('.', ',') : props.selectedMedicineHistory.quantity?.toString(),
        type: props.selectedMedicineHistory.type,
        evaluator: props.selectedMedicineHistory.evaluator?.uuid,
        evaluation_frequency: props.selectedMedicineHistory.evaluation_frequency,
    }
    fetchAllUsers()
})

watch(() => props.selectedMedicineHistory, (newValue: any) => {
    if (newValue != null) {
        state.formMedicineHistory = {
            uuid: newValue.uuid,
            date: newValue.date,
            quantity: language.locale.value === 'dk' ? newValue.quantity?.toString().replace('.', ',') : newValue.quantity?.toString(),
            type: newValue.type,
            evaluator: props.selectedMedicineHistory.evaluator?.uuid,
            evaluation_frequency: props.selectedMedicineHistory.evaluation_frequency,
        }
    }
})

const rules = computed(() => {
    if (props.selectedMedicine.is_pn_medicine) {
        return {
            formMedicineHistory: {
                date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                quantity: {
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
                quantity: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                type: {
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
        if (parseInt(state.formMedicineHistory.quantity) > parseInt(props.selectedMedicine?.daily_dose)) {
            state.modal.isMoreThanMedicineDailyConfirmationOpen = true
        } else {
            submitForm()
        }
    }
}

function submitForm() {
    emit('submitForm', state.formMedicineHistory)
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

function handleQuantityInput(event: Event) {
    const target = event.target as HTMLInputElement
    if (language.locale.value === 'dk') {
        target.value = validateEuropeanDecimal(target.value)
    }
    state.formMedicineHistory.quantity = target.value
}
</script>