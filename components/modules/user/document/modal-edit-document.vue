<template>
    <div>
        <Modal size="sm"
            :title="props.selectedDocument?.type === 'folder' ? $t('drive.form.editFolder') : $t('drive.form.editFile')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenDocumentForm formType="update" :selectedDocument="props.selectedDocument"
                        :error="state.error" :showAdminCheckbox="true" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateDirectory" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { documentService } from '@/components/api/user/DocumentService'
import OneDriveService from '@/components/api/oneDrive/OneDriveService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const oneDriveService = new OneDriveService()
const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDocument: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshDocuments'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshDocuments() {
    emit('refreshDocuments')
}

async function updateDirectory(directoryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const isFolder = props.selectedDocument?.type === 'folder';
        const successMsg = isFolder
          ? t('drive.alert.folderSuccessfullyUpdated')
          : t('drive.alert.fileSuccessfullyUpdated');
        if (props.selectedDocument.is_onedrive) {
            
            await oneDriveService.renameFile(directoryDetails.uuid, directoryDetails.name)
            successAlert(`${t('alert.success')}!`, `${successMsg}.`)
            emit('refreshDocuments', {
                ...props.selectedDocument,
                name: directoryDetails.name
            })
            closeModal()
        } else {
            
            const directoryUuid = directoryDetails.uuid
            const params = {
                name: directoryDetails.name,
                is_admin_access: directoryDetails.is_admin_access,
            }
            const response = await documentService.updateFileFolder(directoryUuid, params)
            if (response?.data) {
                successAlert(`${t('alert.success')}!`, `${successMsg}.`)
                emit('refreshDocuments', {
                    ...props.selectedDocument,
                    name: directoryDetails.name,
                    is_admin_access: directoryDetails.is_admin_access
                })
                closeModal()
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>