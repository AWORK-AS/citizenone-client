<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <FormLabel for="medicine" :label="$t('citizens.medicineJournals.form.medicine')" />
                <FormTextField id="medicine" name="medicine"
                    :placeholder="$t('citizens.medicineJournals.form.medicine')"
                    v-model="state.formMedicine.medicine" />
                <FormError :error="v$?.formMedicine?.medicine?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.medicine?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="dosage_uuid" :label="$t('citizens.medicineJournals.form.dosageForm')" />
                <FormSelect id="dosage_uuid" :options="state.options.dosage_form"
                    v-model="state.formMedicine.dosage_uuid" />
                <FormError :error="v$?.formMedicine?.dosage_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.dosage_uuid?.[0]" />
            </div>
            <div class="grid grid-cols-2 gap-x-3">
                <div class="space-y-1">
                    <FormLabel for="strength" :label="$t('citizens.medicineJournals.form.strength')" />
                    <FormTextField id="strength" name="strength"
                        :placeholder="$t('citizens.medicineJournals.form.strength')"
                        v-model="state.formMedicine.strength" />
                    <FormError :error="v$?.formMedicine?.strength?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.strength?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="daily_dose" :label="$t('citizens.medicineJournals.form.dailyDose')" />
                    <FormTextField id="daily_dose" name="daily_dose"
                        :placeholder="$t('citizens.medicineJournals.form.dailyDose')"
                        v-model="state.formMedicine.daily_dose" @input="handleDailyDoseInput" />
                    <FormError :error="v$?.formMedicine?.daily_dose?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.daily_dose?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="schedule_frequency" :label="$t('citizens.medicineJournals.form.scheduleFrequency')" />
                <FormSelect id="schedule_frequency" name="schedule_frequency"
                    :options="state.options.schedule_frequencies" v-model="state.formMedicine.schedule_frequency" />
                <FormError :error="v$?.formMedicine?.schedule_frequency?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.schedule_frequency?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="time" :label="$t('citizens.medicineJournals.form.time')" />
                <FormSelectMultiple id="time" :options="state.options.time" v-model="state.formMedicine.time" />
                <FormError :error="v$?.formMedicine?.time?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.time?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="active_ingredients" :label="$t('citizens.medicineJournals.form.activeIngredients')" />
                <FormTextArea id="active_ingredients" name="active_ingredients"
                    :placeholder="$t('citizens.medicineJournals.form.activeIngredients')"
                    v-model="state.formMedicine.active_ingredients" />
                <FormError :error="v$?.formMedicine?.active_ingredients?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.active_ingredients?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="description" :label="$t('citizens.medicineJournals.form.description')" />
                <FormTextArea id="description" name="description"
                    :placeholder="$t('citizens.medicineJournals.form.description')"
                    v-model="state.formMedicine.description" />
                <FormError :error="v$?.formMedicine?.description?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.description?.[0]" />
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
    </form>
</template>

<script setup lang="ts">
import { dosageService } from '@/components/api/DosageService'
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
})
const emit = defineEmits(['closeModal', 'submitForm', 'isPageLoading', 'error'])
const { t } = useI18n()
const { validateEuropeanDecimal } = euDecimalValidation()

const state = reactive({
    formMedicine: {
        uuid: '',
        medicine: '',
        strength: '',
        dosage_uuid: '',
        daily_dose: '',
        active_ingredients: '',
        description: '',
        schedule_frequency: [],
        time: [] as any,
    },
    options: {
        dosage_form: [],
        schedule_frequencies: [
            { value: 'everyday', label: `${t('citizens.medicineJournals.scheduleFrequencies.everyday')}` },
            { value: 'every_other_day', label: `${t('citizens.medicineJournals.scheduleFrequencies.every2Days')}` },
            { value: 'every_third_day', label: `${t('citizens.medicineJournals.scheduleFrequencies.every3Days')}` },
            { value: 'every_four_days', label: `${t('citizens.medicineJournals.scheduleFrequencies.every4Days')}` },
            { value: 'every_five_days', label: `${t('citizens.medicineJournals.scheduleFrequencies.every5Days')}` },
            { value: 'every_six_days', label: `${t('citizens.medicineJournals.scheduleFrequencies.every6Days')}` },
            { value: 'weekly', label: `${t('citizens.medicineJournals.scheduleFrequencies.weekly')}` },
            { value: 'biweekly', label: `${t('citizens.medicineJournals.scheduleFrequencies.biweekly')}` },
            { value: 'monthly', label: `${t('citizens.medicineJournals.scheduleFrequencies.monthly')}` },
            { value: 'bimonthly', label: `${t('citizens.medicineJournals.scheduleFrequencies.bimonthly')}` },
            { value: 'quarterly', label: `${t('citizens.medicineJournals.scheduleFrequencies.quarterly')}` },
            { value: 'annually', label: `${t('citizens.medicineJournals.scheduleFrequencies.annually')}` },
        ],
        time: [] as any,
    }
})

onMounted(() => {
    state.formMedicine = {
        uuid: props.selectedMedicine.uuid,
        medicine: props.selectedMedicine.medicine,
        strength: props.selectedMedicine.strength,
        dosage_uuid: props.selectedMedicine.dosage?.uuid,
        daily_dose: props.selectedMedicine.daily_dose.replace('.', ','),
        active_ingredients: props.selectedMedicine.active_ingredients,
        description: props.selectedMedicine.description,
        schedule_frequency: props.selectedMedicine.schedule_frequency,
        time: [],
    }

    if (props.selectedMedicine.time?.length > 0) {
        state.formMedicine.time = []
        JSON.parse(props.selectedMedicine.time).forEach((time: any) => {
            state.formMedicine.time.push(time)
        })
    }

    fetchDosageForm()
})

watch(() => props.selectedMedicine, (newValue: any) => {
    if (newValue != null) {
        state.formMedicine = {
            uuid: newValue.uuid,
            medicine: newValue.medicine,
            strength: newValue.strength,
            dosage_uuid: newValue.dosage?.uuid,
            daily_dose: newValue.daily_dose,
            active_ingredients: newValue.active_ingredients,
            description: newValue.description,
            schedule_frequency: newValue.schedule_frequency,
            time: [],
        }

        if (props.selectedMedicine.time?.length > 0) {
            state.formMedicine.time = []
            JSON.parse(props.selectedMedicine.time).forEach((time: any) => {
                state.formMedicine.time.push(time)
            })
        }
    }
})

const rules = computed(() => {
    return {
        formMedicine: {
            medicine: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            strength: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            dosage_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            daily_dose: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            active_ingredients: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            description: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            schedule_frequency: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            time: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formMedicine)
    }
}

generateTimeIntervals()

function generateTimeIntervals() {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const hourStr = String(hour).padStart(2, '0')
            const minuteStr = String(minute).padStart(2, '0')
            const time = `${hourStr}:${minuteStr}`
            times.push({ value: time, label: time })
        }
    }
    state.options.time = times
}

async function fetchDosageForm() {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const response = await dosageService.getAllDosages()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.dosage_form = options
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}

function handleDailyDoseInput(event: Event) {
    const target = event.target as HTMLInputElement
    target.value = validateEuropeanDecimal(target.value)
    state.formMedicine.daily_dose = target.value
}
</script>