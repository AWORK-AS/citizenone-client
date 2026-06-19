<template>
    <div>
        <Modal size="md" :title="$t('employment.cases.editCase')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentCaseModalForm formType="update" :selectedCase="state.formCase"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateCase" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const departmentStore = useDepartmentStore() as any

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    selectedCaseUuid: { type: String, required: false },
})
const emit = defineEmits(['close', 'refreshCases'])

const state = reactive({
    error: {} as Error,
    formCase: {} as any,
    isPageLoading: false,
})

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (isOpen && props.selectedCaseUuid) {
        fetchCase()
    }
})

function closeModal() {
    state.error = {}
    emit('close')
}

async function fetchCase() {
    state.isPageLoading = true
    try {
        const response = await employmentService.getCase(props.selectedCaseUuid)
        if (response?.data) {
            state.formCase = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function buildReportingDates(startDate: string, endDate: string, frequencyWeeks: number): string[] {
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

async function deleteOldReportingEvents(caseUuid: string, startDate: string, endDate: string) {
    try {
        const response = await myCalendarService.getSchedules({
            date: { start_date: startDate, end_date: endDate },
        })
        const rawEvents = response?.data?.data ?? response?.data ?? []
        const events = Array.isArray(rawEvents) ? rawEvents : []
        const matching = events.filter((e: any) => e.title?.includes(`[case:${caseUuid}]`))
        for (const event of matching) {
            try {
                await myCalendarService.deleteSchedule(event.uuid, { is_delete_future: false })
            } catch { /* ignore */ }
        }
    } catch { /* ignore */ }
}

async function createReportingEvents(caseData: any, frequencyWeeks: number) {
    const startDate = caseData.start_date
    const endDate = caseData.calculated_end_date ?? caseData.end_date
    if (!startDate || !endDate || !frequencyWeeks) return
    const dates = buildReportingDates(startDate, endDate, frequencyWeeks)
    const agreementName = caseData.agreement?.name ?? ''
    const caseUuid = caseData.uuid
    const employeeUuid = caseData.user?.uuid ?? userStore.getUser?.uuid
    const departmentUuid = departmentStore.getSelectedDepartment?.uuid

    for (const date of dates) {
        try {
            await myCalendarService.saveSchedule({
                calendar_type: 'my_self',
                employee_uuid: [employeeUuid],
                employee_group_uuid: [],
                title: `${t('employment.cases.form.reportingReminderTitle')}: ${agreementName} [case:${caseUuid}]`,
                description: `${t('employment.cases.form.reportingReminderNote')} (${startDate} – ${endDate})`,
                date_time_start: `${date} 09:00`,
                date_time_end: `${date} 10:00`,
                is_private: false,
                is_recurring: false,
                recurring: '',
                recurring_until: '',
                citizens_uuid: [],
                users_uuid: [],
                user_group_uuid: [],
                calendar_tag_uuid: [],
                send_invitation: false,
                department_uuid: departmentUuid ? [departmentUuid] : [],
            })
        } catch { /* ignore individual event failures */ }
    }
}

async function updateCase(details: any) {
    state.error = {}
    state.isPageLoading = true
    const { reminder_enabled, reporting_frequency_weeks, ...casePayload } = details
    try {
        const oldStartDate = state.formCase.start_date
        const oldEndDate = state.formCase.calculated_end_date ?? state.formCase.end_date
        if (oldStartDate && oldEndDate && props.selectedCaseUuid) {
            await deleteOldReportingEvents(props.selectedCaseUuid, oldStartDate, oldEndDate)
        }

        const response = await employmentService.updateCase(props.selectedCaseUuid, {
            ...casePayload,
            reminder_enabled,
            reporting_frequency_weeks: reminder_enabled ? reporting_frequency_weeks : null,
        })
        if (response.data) {
            if (reminder_enabled && reporting_frequency_weeks) {
                await createReportingEvents(response.data, reporting_frequency_weeks)
            }
            successAlert(`${t('alert.success')}!`, `${t('employment.cases.form.alert.caseSuccessfullyUpdated')}.`)
            emit('refreshCases')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
