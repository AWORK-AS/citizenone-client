<template>
    <div>
        <Modal size="3xl" :title="$t('drive.editDocument')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <template v-if="props.selectedDocument?.is_onedrive">
                    <template v-if="isEditableOneDriveFile">
                        <LoadingSpinner :isActive="state.isPageLoading">
                            <ModulesUserDocumentDocsFileForm formType="update" :selectedDocument="state.formDocument"
                                :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                                @closeModal="closeModal" @submitForm="updateOneDriveDocument" />
                        </LoadingSpinner>
                    </template>
                    <template v-else>
                        <div class="p-6 text-center">
                            <div class="inline-block px-4 py-2 bg-red-100 text-red-700 rounded">
                                {{
                                    $t('drive.editOneDriveNotSupported') !== 'drive.editOneDriveNotSupported'
                                        ? $t('drive.editOneDriveNotSupported')
                                        : 'Redigering af denne filtype fra OneDrive er ikke understøttet direkte i CitizenOne.'
                                        +
                                        ' Åbn og redigér filen i OneDrive.'
                                }}
                            </div>
                        </div>
                    </template>
                </template>
                <!-- The editor only loads Word files. For anything else (a PDF, an
                     image) it would show a "not supported" notice, and saving that
                     replaced the real file (AW-2026-10720), so only the name can be
                     changed here. -->
                <template v-else-if="!isEditableCompanyFile">
                    <LoadingSpinner :isActive="state.isPageLoading">
                        <form @submit.prevent="renameDocument" class="space-y-4">
                            <Alert type="danger" :text="state.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div class="space-y-1">
                                <FormLabel for="document-name" :label="$t('drive.documentEditor.documentName')" />
                                <FormTextField id="document-name" name="document-name"
                                    :placeholder="$t('drive.documentEditor.documentName')"
                                    v-model="state.formDocument.name" />
                                <FormError :error="state.error?.errors?.name?.[0]" />
                            </div>
                            <p class="text-sm text-gray-600">{{ $t('drive.documentEditor.formatNotEditable') }}</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('drive.documentEditor.cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary"
                                    :disabled="!state.formDocument.name?.trim()">
                                    {{ $t('drive.documentEditor.save') }}
                                </FormButton>
                            </div>
                        </form>
                    </LoadingSpinner>
                </template>
                <template v-else>
                    <LoadingSpinner :isActive="state.isPageLoading">
                        <ModulesUserDocumentDocsFileForm formType="update" :selectedDocument="state.formDocument"
                            :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                            @closeModal="closeModal" @submitForm="updateDocument" />
                    </LoadingSpinner>
                </template>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import OneDriveService from '@/components/api/oneDrive/OneDriveService'
const oneDriveService = new OneDriveService()
const isEditableOneDriveFile = computed(() => {
    if (!props.selectedDocument?.is_onedrive) return false;
    const ext = props.selectedDocument?.name?.split('.')?.pop()?.toLowerCase();
    return ['txt', 'html'].includes(ext);
});
// Same list as the backend's EDITABLE_EXTENSIONS: the formats the editor can load.
const EDITABLE_COMPANY_FILE_EXTENSIONS = ['doc', 'docx']
const isEditableCompanyFile = computed(() => {
    const source = props.selectedDocument?.file_url || props.selectedDocument?.name || ''
    const ext = String(source).split('?')[0].split('.').pop()?.toLowerCase() ?? ''
    return EDITABLE_COMPANY_FILE_EXTENSIONS.includes(ext)
});
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
        if (props.selectedDocument?.is_onedrive && isEditableOneDriveFile.value) {
            fetchOneDriveDocument()
        } else if (!props.selectedDocument?.is_onedrive && isEditableCompanyFile.value) {
            fetchDocument()
        }
    }
})
async function fetchOneDriveDocument() {
    state.isPageLoading = true
    // Debug: Log selectedDocument
    try {
        // Brug hele OneDrive-id'et (inkl. '!')
        const fileId = props.selectedDocument?.uuid;
        const encodedFileId = encodeURIComponent(fileId);
        const ext = props.selectedDocument?.name?.split('.')?.pop()?.toLowerCase();
        const runtimeConfig = useRuntimeConfig();
        const apiBaseURL = runtimeConfig.public.apiBaseURL;
        const userId = localStorage.getItem('user_id');
        const token = localStorage.getItem('_token');

        if (ext === 'docx') {
            const response = await fetch(`/api/user/onedrive/docx-text/${encodedFileId}`, {
                method: 'GET',
                headers: {
                    'X-User-Id': String(userId),
                    'Authorization': 'Bearer ' + token,
                },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Kunne ikke hente docx-tekst fra OneDrive');
            const data = await response.json();
            state.formDocument.content = data.text || '';
        } else if (["txt", "html"].includes(ext)) {
            const response = await fetch(`/api/user/onedrive/file/${encodedFileId}`, {
                method: 'GET',
                headers: {
                    'X-User-Id': String(userId),
                    'Authorization': 'Bearer ' + token,
                },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Kunne ikke hente fil fra OneDrive');
            const text = await response.text();
            state.formDocument.content = text;
        } else {
            state.formDocument.content = '';
        }
    } catch (error) {
        let msg = '';
        if (typeof error === 'string') {
            msg = error;
        } else if (error && typeof error === 'object' && 'message' in error) {
            msg = (error as any).message;
        } else {
            msg = JSON.stringify(error);
        }
        state.error = { message: msg };
    }
    state.isPageLoading = false
}
async function updateOneDriveDocument(documentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const fileId = props.selectedDocument?.uuid
        const encodedFileId = encodeURIComponent(fileId);
        const ext = props.selectedDocument?.name?.split('.')?.pop()?.toLowerCase()
        const runtimeConfig = useRuntimeConfig();
        const apiBaseURL = runtimeConfig.public.apiBaseURL;
        const userId = localStorage.getItem('user_id');
        const token = localStorage.getItem('_token');

        // 1. Omdøb filen hvis navnet er ændret
        if (documentDetails.name && documentDetails.name !== props.selectedDocument?.name) {
            const renameResponse = await fetch(`/api/user/onedrive/rename-file`, {
                method: 'PATCH',
                headers: {
                    'X-User-Id': String(userId),
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileId,
                    newName: documentDetails.name,
                }),
                credentials: 'include',
            });
            if (!renameResponse.ok) throw new Error('Kunne ikke omdøbe filen på OneDrive');
        }

        // 2. Opdater indhold hvis tekstfil
        if (["txt", "html"].includes(ext)) {
            const contentToSend = typeof documentDetails.content === 'string' ? documentDetails.content : '';
            const response = await fetch(`/api/user/onedrive/file/${encodedFileId}`, {
                method: 'PUT',
                headers: {
                    'X-User-Id': String(userId),
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': ext === 'html' ? 'text/html' : 'text/plain',
                    'Accept': 'application/json',
                },
                body: contentToSend,
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Kunne ikke opdatere filen på OneDrive');
        }

        successAlert(`${t('alert.success')}!`, 'Fil opdateret på OneDrive.');
        refreshDocuments();
        closeModal();
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

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

// Name only: the same endpoint the folder edit uses, which never touches the stored file.
async function renameDocument() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await documentService.updateFileFolder(props.selectedDocument?.uuid, {
            name: state.formDocument.name.trim(),
            is_admin_access: state.formDocument.is_admin_access,
        })
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