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
                <FormLabel for="reason" :label="$t('citizens.medicineJournals.taperingSchedule.planReason')" />
                <FormTextArea id="reason" name="reason"
                    :placeholder="$t('citizens.medicineJournals.taperingSchedule.planReasonPlaceholder')"
                    v-model="state.formSchedule.reason" />
            </div>

            <div class="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-3">
                <p class="text-xs font-semibold text-primary">
                    {{ $t('citizens.medicineJournals.taperingSchedule.generateSteps') }}
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="total_duration_weeks"
                            :label="$t('citizens.medicineJournals.taperingSchedule.totalDurationWeeks')" />
                        <FormTextField id="total_duration_weeks" name="total_duration_weeks" type="number"
                            v-model="state.formSchedule.total_duration_weeks" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="interval_weeks"
                            :label="$t('citizens.medicineJournals.taperingSchedule.intervalWeeks')" />
                        <FormTextField id="interval_weeks" name="interval_weeks" type="number"
                            v-model="state.formSchedule.interval_weeks" />
                    </div>
                </div>
                <button type="button" @click="generateSteps"
                    class="w-full text-xs text-primary border border-primary/30 bg-white rounded-lg px-2.5 py-1.5 hover:bg-primary/5">
                    {{ $t('citizens.medicineJournals.taperingSchedule.generateSteps') }}
                </button>
            </div>

            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <p class="text-xs font-semibold text-gray-700">
                        {{ $t('citizens.medicineJournals.taperingSchedule.steps') }}
                    </p>
                    <button type="button" @click="addStep"
                        class="shrink-0 text-xs text-primary border border-primary/30 bg-white rounded-lg px-2.5 py-1 hover:bg-primary/5">
                        {{ $t('citizens.medicineJournals.taperingSchedule.addStep') }}
                    </button>
                </div>

                <FormError :error="props?.error?.errors?.steps?.[0]" />

                <div v-if="state.formSchedule.steps.length > 0" class="space-y-2">
                    <div v-for="(step, idx) in state.formSchedule.steps" :key="step._uid"
                        class="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                        <div class="flex items-center justify-between">
                            <p class="text-xs font-semibold text-gray-600">
                                {{ $t('citizens.medicineJournals.taperingSchedule.stepNumber') }} {{ idx + 1 }}
                            </p>
                            <button type="button" @click="removeStep(idx)" class="text-red-400 hover:text-red-600">
                                <Icon name="ph:x" class="size-4" />
                            </button>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div class="space-y-1">
                                <FormLabel :for="`type-${idx}`"
                                    :label="$t('citizens.medicineJournals.taperingSchedule.stepType')" />
                                <FormSelect :id="`type-${idx}`" :options="typeOptions" v-model="step.type" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :for="`effective_date-${idx}`"
                                    :label="$t('citizens.medicineJournals.taperingSchedule.stepEffectiveDate')" />
                                <FormDateField :id="`effective_date-${idx}`" :name="`effective_date-${idx}`"
                                    v-model="step.effective_date" />
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div class="space-y-1">
                                <FormLabel :for="`strength-${idx}`"
                                    :label="$t('citizens.medicineJournals.taperingSchedule.stepStrength')" />
                                <FormTextField :id="`strength-${idx}`" :name="`strength-${idx}`"
                                    v-model="step.strength" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :for="`max_daily_dose-${idx}`"
                                    :label="$t('citizens.medicineJournals.taperingSchedule.stepMaxDailyDose')" />
                                <FormTextField :id="`max_daily_dose-${idx}`" :name="`max_daily_dose-${idx}`"
                                    v-model="step.max_daily_dose" @input="(e: Event) => handleMaxDailyDoseInput(e, step)" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <FormLabel :for="`step-reason-${idx}`"
                                :label="$t('citizens.medicineJournals.taperingSchedule.stepReason')" />
                            <FormTextField :id="`step-reason-${idx}`" :name="`step-reason-${idx}`"
                                v-model="step.reason" />
                        </div>
                    </div>
                </div>
                <div v-else
                    class="text-xs text-gray-400 bg-white border border-dashed border-gray-200 rounded-lg px-3 py-2.5 text-center">
                    {{ $t('citizens.medicineJournals.taperingSchedule.noStepsAdded') }}
                </div>
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
import { useI18n } from "vue-i18n"
import { euDecimalValidation } from '@/composables/euDecimalValidation'
import moment from 'moment'

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

let uidCounter = 0
function nextUid() {
    uidCounter += 1
    return `step-${Date.now()}-${uidCounter}`
}

const state = reactive({
    formSchedule: {
        reason: '',
        total_duration_weeks: 6,
        interval_weeks: 2,
        steps: [] as { _uid: string, type: string, effective_date: string, strength: string, max_daily_dose: string, reason: string }[],
    },
})

function generateSteps() {
    const totalWeeks = Number(state.formSchedule.total_duration_weeks) || 0
    const intervalWeeks = Number(state.formSchedule.interval_weeks) || 0

    if (totalWeeks <= 0 || intervalWeeks <= 0) {
        return
    }

    const count = Math.floor(totalWeeks / intervalWeeks)
    const steps = []
    for (let i = 1; i <= count; i++) {
        steps.push({
            _uid: nextUid(),
            type: 'de_escalation',
            effective_date: moment().add(intervalWeeks * i, 'weeks').format('YYYY-MM-DD'),
            strength: '',
            max_daily_dose: '',
            reason: '',
        })
    }
    state.formSchedule.steps = steps
}

function addStep() {
    state.formSchedule.steps.push({
        _uid: nextUid(),
        type: 'de_escalation',
        effective_date: moment().format('YYYY-MM-DD'),
        strength: '',
        max_daily_dose: '',
        reason: '',
    })
}

function removeStep(idx: number) {
    state.formSchedule.steps.splice(idx, 1)
}

function handleMaxDailyDoseInput(event: Event, step: any) {
    const target = event.target as HTMLInputElement
    if (language.locale.value === 'dk') {
        target.value = validateEuropeanDecimal(target.value)
    } else {
        target.value = target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    }
    step.max_daily_dose = target.value
}

function submitForm() {
    emit('error', {})
    if (state.formSchedule.steps.length === 0) {
        return
    }
    const payload = {
        reason: state.formSchedule.reason,
        total_duration_weeks: state.formSchedule.total_duration_weeks || null,
        interval_weeks: state.formSchedule.interval_weeks || null,
        steps: state.formSchedule.steps.map(({ _uid, ...rest }) => rest),
    }
    emit('submitForm', payload)
}
</script>
