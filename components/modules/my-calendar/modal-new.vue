<template>
    <div>
        <Modal size="xs" :title="$t('schedules.newSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesMyCalendarForm formType="create" :selectedSchedule="state.formSchedule" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveSchedule" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { myCalendarService } from '@/components/api/MyCalendarService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

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
        title: '',
        description: '',
        date_time_start: '',
        date_time_end: '',
        is_private: false,
        citizens_uuid: [],
        users_uuid: [],
        send_invitation: false,
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
            title: scheduleDetails.title,
            description: scheduleDetails.description,
            date_time_start: scheduleDetails.date_time_start,
            date_time_end: scheduleDetails.date_time_end,
            is_private: scheduleDetails.is_private,
            citizens_uuid: scheduleDetails.citizens_uuid,
            users_uuid: scheduleDetails.users_uuid,
            send_invitation: scheduleDetails.send_invitation,
        }
        const response = await myCalendarService.saveSchedule(params)
        if (response?.data) {
            refreshSchedules()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('schedules.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>