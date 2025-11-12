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
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { useUserStore } from '@/store/user'

const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshSchedules'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formSchedule: {
        id: '',
        uuid: '',
        employees: [],
        title: '',
        description: '',
        date_time_start: '',
        date_time_end: '',
        unit_uuid: '',
        calendar_tag_uuid: [],
        is_private: false,
        citizens_uuid: [],
        users_uuid: [],
        send_invitation: false,
        is_recurring: false,
        recurring: '',
        recurring_until: '',
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
            title: scheduleDetails.title,
            description: scheduleDetails.description,
            date_time_start: scheduleDetails.date_time_start,
            date_time_end: scheduleDetails.date_time_end,
            unit_uuid: scheduleDetails.unit_uuid,
            calendar_tag_uuid: scheduleDetails.calendar_tag_uuid,
            is_private: scheduleDetails.is_private,
            citizens_uuid: scheduleDetails.citizens_uuid,
            users_uuid: scheduleDetails.users_uuid,
            send_invitation: scheduleDetails.send_invitation,
            is_recurring: scheduleDetails.is_recurring,
            recurring: scheduleDetails.recurring,
            recurring_until: scheduleDetails.recurring_until,
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