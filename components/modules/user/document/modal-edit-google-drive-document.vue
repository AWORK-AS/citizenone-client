<template>
    <div>
        <Modal size="sm"
            :title="props.selectedDocument?.mimeType?.includes('folder') ? $t('drive.form.editFolder') : $t('drive.form.editFile')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenDocumentForm formType="update" :selectedDocument="props.selectedDocument"
                        :error="state.error" :showAdminCheckbox="false" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateGoogleDrive" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { googledriveService } from '@/components/api/user/GoogleDriveService'
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
    parentFolderId: {
        type: String,
        required: false,
    }
})
const emit = defineEmits(['close', 'refreshDocuments'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshDocuments(folderId: string | null = null) {
    emit('refreshDocuments', folderId ?? props.parentFolderId ?? null)
}

async function updateGoogleDrive(details: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        console.log('modal updateGoogleDrive called; details:', details, 'props.selectedDocument:', props.selectedDocument)
        const fileId = details.id || props.selectedDocument?.id
        if (!fileId) throw new Error('Missing Google Drive file id')
        const params: any = { name: details.name }
        const response = await googledriveService.updateGoogleDriveFile(fileId, params)
        console.log('Google Drive PATCH response:', response)
        // determine parent folder id: prefer details.parent_id, then selectedDocument.parents[0], then prop
        const parentId = details.parent_id || details.parentId || props.selectedDocument?.parents?.[0] || props.parentFolderId || null
        refreshDocuments(parentId)
        console.log('Emitted refreshDocuments for folder:', parentId)
        closeModal()
        successAlert(`${t('alert.success')}!`, `${t('drive.alert.folderSuccessfullyUpdated') || 'Document updated'}`)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
