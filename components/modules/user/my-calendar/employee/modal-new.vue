<template>
    <div>
        <Modal size="xs" :title="`${$t('events.newEvent')} (${$t('events.form.employees')})`" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserMyCalendarEmployeeForm formType="create" :selectedSchedule="state.formSchedule"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveSchedule" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const departmentStore = useDepartmentStore()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDate: {
        type: String,
        default: '',
    },
})
const emit = defineEmits(['close', 'refreshSchedules'])

watch(() => props.isModalOpen, (open: boolean) => {
    if (open && props.selectedDate) {
        state.formSchedule.date_time_start = moment(props.selectedDate).startOf('day').format('YYYY-MM-DD HH:mm')
        state.formSchedule.date_time_end = moment(props.selectedDate).startOf('day').add(1, 'hour').format('YYYY-MM-DD HH:mm')
    }
})

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formSchedule: {
        id: '',
        uuid: '',
        employees: [],
        employee_group_uuid: [],
        title: '',
        description: '',
        date_time_start: moment().startOf('day').format('YYYY-MM-DD HH:mm'),
        date_time_end: moment().startOf('day').add(1, 'hour').format('YYYY-MM-DD HH:mm'),
        unit_uuid: '',
        calendar_tag_uuid: [],
        is_private: false,
        citizens_uuid: [],
        users_uuid: [],
        user_group_uuid: [],
        send_invitation: false,
        department_uuid: [],
        recurring: {
            is_recurring: false,
            recurring: '',
            recurring_until: '',
            frequency: '',
            every: '',
            weekly_on: [],
            monthly_on_the_enabled: false,
            monthly_each: [],
            monthly_on_the_sequence: '',
            monthly_on_the_day: '',
            yearly_in_months: [],
            yearly_on_the_enabled: false,
            yearly_on_the_sequence: '',
            yearly_on_the_day: '',
            is_apply_to_all: false,
        },
    },
})

function closeModal() {
    emit('close')
}

function refreshSchedules() {
    emit('refreshSchedules')
}

async function saveSchedule(scheduleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            calendar_type: 'employees',
            employees_uuid: scheduleDetails.employees,
            employee_group_uuid: scheduleDetails.employee_group_uuid,
            title: scheduleDetails.title,
            description: scheduleDetails.description,
            date_time_start: scheduleDetails.date_time_start,
            date_time_end: scheduleDetails.date_time_end,
            unit_uuid: scheduleDetails.unit_uuid,
            calendar_tag_uuid: scheduleDetails.calendar_tag_uuid,
            is_private: scheduleDetails.is_private,
            is_online_meeting: scheduleDetails.is_online_meeting,
            meeting_url: scheduleDetails.meeting_url,
            citizens_uuid: scheduleDetails.citizens_uuid,
            users_uuid: scheduleDetails.users_uuid,
            user_group_uuid: scheduleDetails.user_group_uuid,
            send_invitation: scheduleDetails.send_invitation,
            department_uuid: [departmentStore.getSelectedDepartment.uuid],
            is_recurring: scheduleDetails.recurring.is_recurring,
            recurring: scheduleDetails.recurring.recurring,
            recurring_until: scheduleDetails.recurring.recurring_until,
        } as any
        if (scheduleDetails.recurring.recurring === 'custom') {
            params.frequency = scheduleDetails.recurring.frequency
            params.every = scheduleDetails.recurring.every
            if (scheduleDetails.recurring.frequency === 'weekly') {
                params.weekly_on = scheduleDetails.recurring.weekly_on
            } else if (scheduleDetails.recurring.frequency === 'monthly') {
                params.monthly_on_the_enabled = scheduleDetails.recurring.monthly_on_the_enabled
                if (!scheduleDetails.recurring.monthly_on_the_enabled) {
                    params.monthly_each = scheduleDetails.recurring.monthly_each
                } else {
                    params.monthly_on_the_sequence = scheduleDetails.recurring.monthly_on_the_sequence
                    params.monthly_on_the_day = scheduleDetails.recurring.monthly_on_the_day
                }
            } else if (scheduleDetails.recurring.frequency === 'yearly') {
                params.yearly_in_months = scheduleDetails.recurring.yearly_in_months
                if (scheduleDetails.recurring.yearly_on_the_enabled) {
                    params.yearly_on_the_sequence = scheduleDetails.recurring.yearly_on_the_sequence
                    params.yearly_on_the_day = scheduleDetails.recurring.yearly_on_the_day
                }
            }
        }
        const response = await myCalendarService.saveSchedule(params)
        if (response?.data) {
            refreshSchedules()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('events.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>