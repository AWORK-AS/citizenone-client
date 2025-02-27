<template>
    <div>
        <Modal size="sm" :title="$t('citizens.nursingAreas.statuses.editStatus')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenNursingProfessionalRecordStatusForm formType="update"
                        :selectedStatus="props.selectedStatus" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateStatus" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { statusService } from '@/components/api/StatusService'
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
    selectedStatus: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshStatuses'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshStatuses() {
    emit('refreshStatuses')
}

async function updateStatus(statusDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const statusUuid = props.selectedStatus.uuid

        let params = {
            date: statusDetails.date,
            area_type: statusDetails.area_type,
            score: statusDetails.score,
            status: statusDetails.status,
        }
        const response = await statusService.updateStatus(statusUuid, params)
        if (response?.data) {
            refreshStatuses()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.statuses.alert.statusSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>