<template>
    <div>
        <Modal size="lg" :title="$t('folderStructure.requests.newFolderStructureRequest')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenDocumentFolderStructureRequestForm formType="create" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveFolderStructureRequest" />
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
})
const emit = defineEmits(['close', 'refreshFolderStructureRequests'])

const state = reactive({
    error: {} as Error,
    formFolderStructure: {
        name: '',
        structure: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshFolderStructureRequests() {
    emit('refreshFolderStructureRequests')
}

async function saveFolderStructureRequest(folderStuctureDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            folder_structure_uuid: folderStuctureDetails.folder_structure,
            structure: JSON.stringify(folderStuctureDetails.structure),
        }
        const response = await folderStructureRequestService.saveFolderStructureRequest(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('folderStructure.requests.alert.newFolderStructureSuccessfullyRequested')}.`)
            refreshFolderStructureRequests()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>