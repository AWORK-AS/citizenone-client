<template>
    <div>
        <Modal size="sm" :title="$t('citizens.useOfForce.statuses.newStatus')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenUseOfForceStatusForm formType="create" :selectedStatus="state.formStatus"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveStatus" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { statusService } from '@/components/api/user/StatusService'
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
    selectedData: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshStatuses'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formStatus: {
        title: '',
        score: '',
        status: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshStatuses() {
    emit('refreshStatuses')
}

async function saveStatus(statusDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {
            model_uuid: props.selectedData.uuid,
            title: statusDetails.title,
            score: statusDetails.score,
            status: statusDetails.status,
        }
        const response = await statusService.saveStatus(params)
        if (response?.data) {
            refreshStatuses()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.useOfForce.statuses.alert.statusSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>