<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.newSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesDutyScheduleForm formType="create" :selectedSchedule="state.formSchedule"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveSchedule" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { dutyScheduleService } from '@/components/api/DutyScheduleService'
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
        user_uuid: '',
    },
})

watch(() => props.isModalOpen, () => {
    state.error = {}
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
            user_uuid: scheduleDetails.user_uuid,
        }
        const response = await dutyScheduleService.saveDutySchedule(params)
        if (response?.data) {
            refreshSchedules()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>