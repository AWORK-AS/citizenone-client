<template>
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
        v-if="props.patient">
        <div v-if="props.patient.risk_profile" class="flex items-center gap-2">
            <span class="size-2.5 rounded-full" :style="{ backgroundColor: riskColor }" />
            <div>
                <p class="text-[11px] uppercase tracking-wide text-gray-400">
                    {{ $t('citizens.form.dental.riskProfile.label') }}
                </p>
                <p class="text-sm font-medium text-gray-900">
                    {{ $t(`citizens.form.dental.riskProfile.${props.patient.risk_profile}`) }}
                </p>
            </div>
        </div>

        <div v-if="props.patient.patient_number">
            <p class="text-[11px] uppercase tracking-wide text-gray-400">
                {{ $t('citizens.form.dental.patientNumber') }}
            </p>
            <p class="text-sm font-medium text-gray-900 tabular-nums">{{ props.patient.patient_number }}</p>
        </div>

        <div v-if="payer">
            <p class="text-[11px] uppercase tracking-wide text-gray-400">{{ $t('citizens.toothChart.strip.payer') }}</p>
            <p class="text-sm font-medium text-gray-900">{{ payer }}</p>
        </div>

        <div>
            <p class="text-[11px] uppercase tracking-wide text-gray-400">
                {{ $t('citizens.toothChart.strip.nextCheckup') }}
            </p>
            <button type="button" @click="state.isEditing = !state.isEditing"
                class="group inline-flex items-center gap-1.5 text-sm font-medium"
                :class="isOverdue ? 'text-red-600' : 'text-gray-900'">
                <template v-if="props.patient.next_checkup_due">
                    {{ formatDate(props.patient.next_checkup_due) }}
                    <span v-if="isOverdue" class="text-xs font-normal">
                        &middot; {{ $t('citizens.toothChart.strip.overdue') }}
                    </span>
                </template>
                <span v-else class="text-gray-500">{{ $t('citizens.toothChart.strip.setCheckup') }}</span>
                <Icon name="ph:pencil-simple"
                    class="size-3.5 text-gray-300 transition group-hover:text-gray-500" />
            </button>
            <!-- The recall work list has always known when this patient was last
                 called in, and been the only place that could record it. From
                 the patient's own screen a colleague who has just rung leaves no
                 trace, and the natural next thing - a time in the book - was a
                 tab away with the date typed in again. -->
            <p class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500"
                v-if="props.patient.next_checkup_due">
                <span v-if="props.patient.last_reminder_sent_at">
                    {{ $t('citizens.toothChart.strip.lastRecalled') }}
                    {{ formatDate(props.patient.last_reminder_sent_at) }}
                </span>
                <span v-else>{{ $t('citizens.toothChart.strip.neverRecalled') }}</span>
                <button type="button" class="underline hover:text-gray-700"
                    :disabled="state.isRecalling" @click="recall">
                    {{ $t('citizens.toothChart.strip.recallNow') }}
                </button>
                <button type="button" class="underline hover:text-gray-700" @click="bookTime">
                    {{ $t('citizens.toothChart.strip.bookTime') }}
                </button>
            </p>
        </div>

        <div v-if="props.lastExamination">
            <p class="text-[11px] uppercase tracking-wide text-gray-400">
                {{ $t('citizens.toothChart.strip.lastExamination') }}
            </p>
            <p class="text-sm font-medium text-gray-900">
                {{ formatDate(props.lastExamination.examined_at) }}
                <span class="text-xs font-normal text-gray-500 tabular-nums">
                    &middot; dmf-s {{ props.lastExamination.primary.dmfs }}
                    / DMF-S {{ props.lastExamination.permanent.dmfs }}
                </span>
            </p>
        </div>

        <p class="text-xs text-gray-500 basis-full" v-if="props.patient.risk_profile_note">
            {{ props.patient.risk_profile_note }}
        </p>

        <div class="basis-full border-t border-slate-200 pt-3" v-if="state.isEditing">
            <Alert type="danger" :text="state.error" v-if="state.error" />

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div class="space-y-1">
                    <FormLabel for="last_checkup_date" :label="$t('citizens.form.dental.lastCheckupDate')" />
                    <FormDateField id="last_checkup_date" name="last_checkup_date"
                        :placeholder="$t('citizens.form.dental.lastCheckupDate')" v-model="state.form.last_checkup_date" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="checkup_interval_months"
                        :label="$t('citizens.form.dental.checkupInterval.label')" />
                    <FormSelect id="checkup_interval_months" :options="intervalOptions"
                        v-model="state.form.checkup_interval_months" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="strip_recall_channel" :label="$t('citizens.form.dental.recallChannel.label')" />
                    <FormSelect id="strip_recall_channel" :options="channelOptions"
                        v-model="state.form.recall_channel" :placeholder="$t('dentalRecalls.noChannel')" />
                </div>
                <div class="flex items-center justify-between gap-2">
                    <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-600"
                        @click="state.form.auto_reminder = !state.form.auto_reminder">
                        <FormCheckbox id="strip_auto_reminder" :value="state.form.auto_reminder" />
                        {{ $t('citizens.form.dental.autoReminder') }}
                    </label>
                </div>
            </div>

            <p class="mt-2 text-xs text-gray-500">{{ $t('citizens.toothChart.strip.checkupHelp') }}</p>

            <div class="mt-3 flex items-center justify-end gap-2">
                <FormButton buttonStyle="action" buttonSize="xs" @click="cancel" :disabled="state.isSaving">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton buttonStyle="primary" buttonSize="xs" @click="save" :disabled="state.isSaving">
                    <Icon name="ph:floppy-disk" class="size-4" />
                    {{ $t('save') }}
                </FormButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { toothChartService } from '@/components/api/user/ToothChartService'
import { dentalRecallService } from '@/components/api/user/DentalRecallService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    patient: any | null
    lastExamination: any | null
    citizenUuid: string
}>()

const emit = defineEmits<{ (event: 'saved'): void }>()

const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()

const state = reactive({
    isEditing: false,
    isSaving: false,
    isRecalling: false,
    error: '',
    form: {
        last_checkup_date: '',
        checkup_interval_months: null as number | null,
        recall_channel: null as string | null,
        auto_reminder: true,
    },
})

const intervalOptions = computed(() => [3, 6, 12, 18, 24].map((months: number) => ({
    value: months,
    label: t('citizens.toothChart.strip.everyMonths', { months }),
})))

const channelOptions = computed(() => ['letter', 'sms', 'email', 'app', 'phone'].map((channel: string) => ({
    value: channel,
    label: t(`citizens.form.dental.recallChannel.${channel}`),
})))

function fillForm() {
    state.form = {
        last_checkup_date: props.patient?.last_checkup_date || '',
        checkup_interval_months: props.patient?.checkup_interval_months ?? null,
        recall_channel: props.patient?.recall_channel || null,
        auto_reminder: props.patient?.auto_reminder ?? true,
    }
}

function cancel() {
    fillForm()
    state.isEditing = false
}

async function save() {
    state.isSaving = true
    state.error = ''

    try {
        await toothChartService.updateCheckup(props.citizenUuid, {
            last_checkup_date: state.form.last_checkup_date || null,
            checkup_interval_months: state.form.checkup_interval_months || null,
            recall_channel: state.form.recall_channel || null,
            auto_reminder: state.form.auto_reminder,
        })

        successAlert(`${t('alert.success')}!`, `${t('citizens.toothChart.strip.checkupSaved')}.`)
        state.isEditing = false
        emit('saved')
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

watch(() => props.patient, () => fillForm(), { immediate: true, deep: true })

const RISK_COLORS: Record<string, string> = {
    green: '#16a34a',
    yellow: '#eab308',
    red: '#dc2626',
}

const riskColor = computed(() => RISK_COLORS[props.patient?.risk_profile] || '#d1d5db')

/**
 * Who carries the bill is the first thing asked at the chair, so the insurance
 * details are collapsed into one line rather than three fields.
 */
const payer = computed(() => {
    const parts: string[] = []

    if (props.patient?.sygesikring_group) {
        parts.push(t(`citizens.form.dental.sygesikringGroup.${sygesikringKey(props.patient.sygesikring_group)}`))
    }

    if (props.patient?.is_member_of_sygeforsikring_danmark) {
        const group = props.patient.danmark_group
            ? ` ${t(`citizens.form.dental.danmarkGroup.${danmarkKey(props.patient.danmark_group)}`)}`
            : ''

        parts.push(`"danmark"${group}`)
    }

    if (props.patient?.municipal_subsidy) {
        parts.push(t('citizens.form.dental.municipalSubsidy'))
    }

    return parts.join(' · ')
})

const isOverdue = computed(() => {
    const due = props.patient?.next_checkup_due

    return due ? moment(due).isBefore(moment(), 'day') : false
})

// The stored values are snake_case; the translation keys are not.
function sygesikringKey(value: string): string {
    return { group_1: 'group1', group_2: 'group2', group_4: 'group4', but: 'but', foreign_insurance: 'foreignInsurance', other: 'other' }[value] || 'other'
}

function danmarkKey(value: string): string {
    return { basis: 'basis', group_1: 'group1', group_2: 'group2', group_5: 'group5' }[value] || 'basis'
}

function formatDate(date: string): string {
    return date ? moment(date).format('DD.MM.YYYY') : ''
}

/**
 * Records that this patient has been called back in.
 *
 * The same act the recall work list performs, from the screen where the
 * conversation actually happens. It stops the automatic reminder repeating what
 * a colleague just did by hand, which is the whole reason the timestamp exists.
 */
async function recall() {
    state.isRecalling = true

    try {
        await dentalRecallService.markContacted(props.citizenUuid)
        successAlert(`${t('alert.success')}!`, `${t('citizens.toothChart.strip.recalled')}.`)
        emit('saved')
    } catch (error: any) {
        errorAlert(`${t('alert.error')}!`, error?.message || '')
    } finally {
        state.isRecalling = false
    }
}

/**
 * Opens the patient's own calendar on the day they are due, because the point
 * of calling someone in is to give them a time.
 */
function bookTime() {
    navigateTo({
        path: `/citizens/${props.citizenUuid}/calendar`,
        query: { date: props.patient?.next_checkup_due },
    })
}
</script>
