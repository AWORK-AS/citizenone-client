<template>
    <div>
        <Modal size="lg" :title="$t('folderStructure.requests.editFolderStructureRequest')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenDocumentFolderStructureRequestForm formType="update"
                        :selectedFolderStructureRequest="props.selectedFolderStructureRequest" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateFolderStructureRequest" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { folderStructureRequestService } from '@/components/api/user/FolderStructureRequestService'
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
    selectedFolderStructureRequest: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshFolderStructureRequests'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshFolderStructureRequests() {
    emit('refreshFolderStructureRequests')
}

async function updateFolderStructureRequest(folderStructureDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const folderStructureRequestUuid = props?.selectedFolderStructureRequest?.uuid
        const params = {
            structure: JSON.stringify(folderStructureDetails.structure),
        }
        const response = await folderStructureRequestService.updateFolderStructureRequest(folderStructureRequestUuid, params)
        if (response?.data) {
            refreshFolderStructureRequests()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('folderStructure.requests.table.alert.folderStructureRequestSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>