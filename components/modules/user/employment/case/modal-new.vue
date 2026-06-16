<template>
    <div>
        <Modal size="md" :title="$t('employment.cases.newCase')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentCaseModalForm formType="create" :selectedCase="state.formCase"
                        :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveCase" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { reminderService } from '@/components/api/user/ReminderService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    citizenUuid: { type: String, required: true },
})
const emit = defineEmits(['close', 'refreshCases'])

const state = reactive({
    error: {} as Error,
    formCase: {} as any,
    isPageLoading: false,
})

function closeModal() {
    state.error = {}
    emit('close')
}

function buildReminderDates(startDate: string, endDate: string, frequencyWeeks: number): string[] {
    const dates: string[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    const stepMs = frequencyWeeks * 7 * 24 * 60 * 60 * 1000
    let current = new Date(start.getTime() + stepMs)
    while (current <= end) {
        dates.push(current.toISOString().slice(0, 10))
        current = new Date(current.getTime() + stepMs)
    }
    return dates
}

async function createRemindersForCase(caseData: any, frequencyWeeks: number) {
    const startDate = caseData.start_date
    const endDate = caseData.calculated_end_date ?? caseData.end_date
    if (!startDate || !endDate || !frequencyWeeks) return
    const dates = buildReminderDates(startDate, endDate, frequencyWeeks)
    const agreementName = caseData.agreement?.name ?? ''
    for (const date of dates) {
        try {
            await reminderService.saveReminder({
                title: `${t('employment.cases.form.reportingReminderTitle')}: ${agreementName}`,
                date_time: `${date} 09:00:00`,
                employee_uuid: caseData.user?.uuid ?? null,
                repeat: 'none',
                notes: `${t('employment.cases.form.reportingReminderNote')} (${startDate} – ${endDate})`,
            })
        } catch { /* ignore individual reminder failures */ }
    }
}

async function saveCase(details: any) {
    state.error = {}
    state.isPageLoading = true
    const { reminder_enabled, reporting_frequency_weeks, ...casePayload } = details
    try {
        const response = await employmentService.saveCase({
            ...casePayload,
            citizen_uuid: props.citizenUuid,
        })
        if (response.data) {
            if (reminder_enabled && reporting_frequency_weeks) {
                await createRemindersForCase(response.data, reporting_frequency_weeks)
            }
            successAlert(`${t('alert.success')}!`, `${t('employment.cases.form.alert.newCaseSuccessfullySaved')}.`)
            emit('refreshCases')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
