<template>
    <div>
        <Modal size="sm"
            :title="props.selectedDocument?.type === 'folder' ? $t('citizens.documents.form.editFolder') : $t('citizens.documents.form.editFile')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenDocumentForm formType="update" :selectedDocument="props.selectedDocument"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateDirectory" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { documentService } from '@/components/api/DocumentService'
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
        const directoryUuid = directoryDetails.uuid
        const params = {
            name: directoryDetails.name,
            is_admin_access: directoryDetails.is_admin_access,
        }
        const response = await documentService.updateFileFolder(directoryUuid, params)
        if (response?.data) {
            refreshDocuments()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.alert.folderSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>