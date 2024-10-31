<template>
    <div>
        <Modal size="sm" :title="$t('citizens.documents.form.newFolder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenDocumentForm formType="create" :selectedDocument="state.formDirectory"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveDirectory" />
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
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const { t } = useI18n()
const router = useRouter()
const emit = defineEmits(['close', 'refreshDocuments'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formDirectory: {
        id: '',
        uuid: '',
        name: '',
        is_admin_access: false,
    },
})

function closeModal() {
    emit('close')
}

function refreshDocuments() {
    emit('refreshDocuments')
}

async function saveDirectory(directoryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const folderUuid = router?.currentRoute?.value?.query?.folder_uuid
        const params = {
            ...(folderUuid && { folder_uuid: folderUuid }),
            name: directoryDetails.name,
            is_admin_access: directoryDetails.is_admin_access,
            type: 'folder',
        }
        const response = await documentService.saveFileFolder(params)
        if (response?.data) {
            refreshDocuments()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.folderSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>