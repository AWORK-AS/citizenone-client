<template>
    <div>
        <Modal size="3xl" :title="$t('drive.editDocument')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDocumentDocsFileForm formType="update" :selectedDocument="state.formDocument"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateDocument" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useMammothConverter } from '@/composables/useMammothConverter'
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
    selectedDocument: {
        type: Object,
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
    resetForm()
}

function refreshDocuments() {
    emit('refreshDocuments')
}

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        state.formDocument.name = props.selectedDocument?.name ?? ''
        state.formDocument.is_admin_access = props.selectedDocument?.is_admin_access ? true : false
        fetchDocument()
    }
})

function resetForm() {
    state.formDocument = {
        name: '',
        content: '',
        is_admin_access: false,
    }
}

async function fetchDocument() {
    state.isPageLoading = true
    try {
        const params = {}
        const documentUuid = props.selectedDocument?.uuid
        const response = await documentService.getDocumentContent(documentUuid, params)
        if (response) {
            if (response.data?.type === 'file_data') {
                const { convertDocxToHtml } = useMammothConverter()
                const binaryString = atob(response?.data?.file_data)
                const bytes = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i)
                }
                const arrayBuffer = bytes.buffer
                const htmlContent = await convertDocxToHtml(arrayBuffer)
                state.formDocument.content = htmlContent
            } else {
                state.formDocument.content = response.content || ''
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateDocument(documentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const documentUuid = props.selectedDocument?.uuid
        const params = {
            content: documentDetails.content,
            name: documentDetails.name,
            is_admin_access: documentDetails.is_admin_access,
        }
        const response = await documentService.updateDocumentContent(documentUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyUpdated')}.`)
            refreshDocuments()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>