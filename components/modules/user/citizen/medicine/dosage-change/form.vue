<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p class="text-xs text-blue-700">
                    {{ $t('citizens.medicineJournals.dosageChange.currentDosage') }}:
                    {{ props.selectedMedicine?.strength || '—' }}
                </p>
            </div>

            <div class="space-y-1">
                <FormLabel for="type" :label="$t('citizens.medicineJournals.dosageChange.type')" />
                <FormSelect id="type" :options="typeOptions" v-model="state.formDosageChange.type" />
                <FormError :error="v$?.formDosageChange?.type?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.type?.[0]" />
            </div>

            <div class="space-y-1">
                <FormLabel for="effective_date" :label="$t('citizens.medicineJournals.dosageChange.effectiveDate')" />
                <FormDateField id="effective_date" name="effective_date"
                    :placeholder="$t('citizens.medicineJournals.dosageChange.effectiveDate')"
                    v-model="state.formDosageChange.effective_date" />
                <FormError :error="v$?.formDosageChange?.effective_date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.effective_date?.[0]" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="strength" :label="$t('citizens.medicineJournals.dosageChange.newStrength')" />
                    <FormTextField id="strength" name="strength"
                        :placeholder="$t('citizens.medicineJournals.dosageChange.newStrength')"
                        v-model="state.formDosageChange.strength" />
                    <FormError :error="props?.error?.errors?.strength?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="max_daily_dose" :label="$t('citizens.medicineJournals.dosageChange.newMaxDailyDose')" />
                    <FormTextField id="max_daily_dose" name="max_daily_dose"
                        :placeholder="$t('citizens.medicineJournals.dosageChange.newMaxDailyDose')"
                        v-model="state.formDosageChange.max_daily_dose" @input="handleMaxDailyDoseInput" />
                    <FormError :error="props?.error?.errors?.max_daily_dose?.[0]" />
                </div>
            </div>

            <div class="space-y-1">
                <FormLabel for="reason" :label="$t('citizens.medicineJournals.dosageChange.reason')" />
                <FormTextArea id="reason" name="reason"
                    :placeholder="$t('citizens.medicineJournals.dosageChange.reasonPlaceholder')"
                    v-model="state.formDosageChange.reason" />
                <FormError :error="props?.error?.errors?.reason?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
                    {{ $t('save') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { euDecimalValidation } from '@/composables/euDecimalValidation'
import moment from 'moment'
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    selectedMedicine: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['closeModal', 'error', 'submitForm'])
const { t } = useI18n()
const language = useI18n()
const { validateEuropeanDecimal } = euDecimalValidation()

const typeOptions = computed(() => [
    { value: 'escalation', label: t('citizens.medicineJournals.dosageChange.escalate') },
    { value: 'de_escalation', label: t('citizens.medicineJournals.dosageChange.deEscalate') },
])

const state = reactive({
    formDosageChange: {
        type: 'escalation',
        effective_date: moment().format('YYYY-MM-DD'),
        strength: '',
        max_daily_dose: '',
        reason: '',
    },
})

const rules = computed(() => {
    return {
        formDosageChange: {
            type: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            effective_date: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function handleMaxDailyDoseInput(event: Event) {
    const target = event.target as HTMLInputElement
    if (language.locale.value === 'dk') {
        target.value = validateEuropeanDecimal(target.value)
    } else {
        target.value = target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    }
    state.formDosageChange.max_daily_dose = target.value
}

function submitForm() {
    emit('error', {})
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formDosageChange)
    }
}
</script>
