<template>
    <div>
        <Modal size="sm" :title="$t('normPeriod.assignEmployee')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleNormHoursUserNormPeriodForm formType="create" :selectedEmployee="props.selectedEmployee"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveNormPeriod" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { normPeriodService } from '@/components/api/user/NormPeriodService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
})

const { t } = useI18n()
const router = useRouter()
const emit = defineEmits(['close', 'refreshDutySchedules'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formNormPeriod: {
        norm_period_uuid: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshDutySchedules() {
    emit('refreshDutySchedules')
}

async function saveNormPeriod(normPeriodDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            user_uuids: [props.selectedEmployee.uuid],
        }

        const response = await normPeriodService.assignUsers(normPeriodDetails.norm_period_uuid, params)
        if (response?.message) {
            refreshDutySchedules()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('normPeriod.alert.employeeAssigned')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>