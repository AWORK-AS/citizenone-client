<template>
    <div>
        <Modal size="3xl" :title="$t('drive.newDocument')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDocumentDocsFileForm formType="create" :selectedDocument="state.formDocument"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveDocument" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { documentService } from '@/components/api/user/DocumentService'
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
const emit = defineEmits(['close', 'refreshDocuments'])
const router = useRouter()

const state = reactive({
    error: {} as Error,
    formDocument: {
        name: '',
        content: '',
        is_admin_access: false,
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshDocuments() {
    emit('refreshDocuments')
}

async function saveDocument(documentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const blob = new Blob([documentDetails.content], { type: 'text/html' })
        const file = new File([blob], documentDetails.name.endsWith('.html') ? documentDetails.name : documentDetails.name + '.html', { type: 'text/html' })
        console.log(file)
        const formData = new FormData()
        formData.append('files[]', file)
        if (router?.currentRoute?.value?.query?.folder_uuid) {
            formData.append('folder_uuid', router.currentRoute.value.query.folder_uuid as string)
        }
        formData.append('type', 'file')
        formData.append('is_admin_access', documentDetails.is_admin_access)
        formData.append('name', documentDetails.name)
        const response = await documentService.saveFileFolder(formData)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyAdded')}.`)
            refreshDocuments()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>