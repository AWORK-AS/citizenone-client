<template>
    <div>
        <Modal size="xs" :title="$t('timeLogs.newTimeLog')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserTimeRegistrationForm formType="create" :selectedTimeLog="state.formTimeLog"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveTimeLog" />
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
const router = useRouter()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshTimeLogs'])

const state = reactive({
    error: {} as Error,
    formTimeLog: {
        date_time_start: '',
        date_time_end: '',
        status: '',
        remarks: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshTimeLogs() {
    emit('refreshTimeLogs')
}

async function saveTimeLog(timeLogDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            employee_uuid: employeeUuid,
            date_time_start: timeLogDetails.date_time_start,
            date_time_end: timeLogDetails.date_time_end,
            status: timeLogDetails.status,
            remarks: timeLogDetails.remarks,
        }
        const response = await timeLogService.saveTimeLog(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('timeLogs.form.alert.newTimeLogSuccessfullySaved')}.`)
            refreshTimeLogs()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>