<template>
    <div>
        <Modal size="xs" :title="$t('events.editEvent')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesMyCalendarForm formType="update" :selectedSchedule="props.selectedSchedule"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateSchedule" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { myCalendarService } from '@/components/api/MyCalendarService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedSchedule: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['close', 'refreshSchedules'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshSchedules() {
    emit('refreshSchedules')
}

async function updateSchedule(scheduleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const scheduleUuid = scheduleDetails.uuid
        const params = {
            title: scheduleDetails.title,
            description: scheduleDetails.description,
            date_time_start: scheduleDetails.date_time_start,
            date_time_end: scheduleDetails.date_time_end,
            is_private: scheduleDetails.is_private,
        }
        const response = await myCalendarService.updateSchedule(scheduleUuid, params)
        if (response?.data) {
            refreshSchedules()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('events.alert.successfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>