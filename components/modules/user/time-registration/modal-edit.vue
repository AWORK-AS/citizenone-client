<template>
    <div>
        <Modal size="sm" :title="$t('timeLogs.editTimeLog')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserTimeRegistrationForm formType="update" :selectedTimeLog="props.selectedTimeLog"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateTimeLog" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { timeLogService } from '@/components/api/user/TimeLogService'
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
    selectedTimeLog: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshTimeLogs'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshTimeLogs() {
    emit('refreshTimeLogs')
}

async function updateTimeLog(timeLogDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const timeLogUuid = props.selectedTimeLog.uuid
        const params = {
            date_time_start: timeLogDetails.date_time_start,
            date_time_end: timeLogDetails.date_time_end,
            status: timeLogDetails.status,
            remarks: timeLogDetails.remarks,
        }
        const response = await timeLogService.updateTimeLog(timeLogUuid, params)
        if (response?.data) {
            refreshTimeLogs()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('timeLogs.form.alert.timeLogSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>