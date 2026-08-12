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

        <div v-if="props.patient.next_checkup_due">
            <p class="text-[11px] uppercase tracking-wide text-gray-400">
                {{ $t('citizens.toothChart.strip.nextCheckup') }}
            </p>
            <p class="text-sm font-medium" :class="isOverdue ? 'text-red-600' : 'text-gray-900'">
                {{ formatDate(props.patient.next_checkup_due) }}
                <span v-if="isOverdue" class="text-xs font-normal">
                    &middot; {{ $t('citizens.toothChart.strip.overdue') }}
                </span>
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
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    patient: any | null
    lastExamination: any | null
}>()

const { t } = useI18n()

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
</script>
