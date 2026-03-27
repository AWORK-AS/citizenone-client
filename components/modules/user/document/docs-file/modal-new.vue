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
import { useUserStore } from '@/store/user'
import { documentService } from '@/components/api/user/DocumentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    isOneDrive: {
        type: Boolean,
        default: false,
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
       
        const safeName = documentDetails.name.replace(/\.[^/.]+$/, ''); 
        const fileName = safeName + '.html';
        const blob = new Blob([documentDetails.content], { type: 'text/html' });
        const file = new File([blob], fileName, { type: 'text/html' });
        if (props.isOneDrive) {
            
            const userStore = useUserStore();
            let userId = localStorage.getItem('user_id');
            if (!userId && (userStore.user as any)?.id) {
                userId = String((userStore.user as any).id);
                localStorage.setItem('user_id', userId);
            }
            let parentId = '';
            const rawParentId = router?.currentRoute?.value?.query?.onedrive_folder_id;
            if (typeof rawParentId === 'string' && rawParentId.length > 0) {
                parentId = rawParentId;
            }
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', documentDetails.name);
            let endpoint = '/api/user/onedrive/upload';
            if (parentId) {
                endpoint = `/api/user/onedrive/upload-to-folder/${parentId}`;
            }
            const response = await $fetch(endpoint, {
                method: 'POST',
                headers: {
                    'X-User-Id': String(userId),
                    'Authorization': 'Bearer ' + localStorage.getItem('_token')
                },
                body: formData,
            }) as {
                success?: boolean;
                upload_result?: { id?: string };
                error?: string;
            };
            
            if (response && response.success && response.upload_result && response.upload_result.id) {
                successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyAdded')}.`);
                refreshDocuments();
                closeModal();
            } else {
                
                const msg = response?.error || 'Filen blev ikke oprettet korrekt. Prøv igen eller kontakt support.';
                errorAlert('Fejl!', msg);
                state.error = { message: msg };
            }
        } else {
            const formData = new FormData();
            formData.append('files[]', file);
            if (router?.currentRoute?.value?.query?.folder_uuid) {
                formData.append('folder_uuid', router.currentRoute.value.query.folder_uuid as string);
            }
            formData.append('type', 'file');
            formData.append('is_admin_access', documentDetails.is_admin_access);
            formData.append('name', documentDetails.name);
            const response = await documentService.saveFileFolder(formData);
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyAdded')}.`);
                refreshDocuments();
                closeModal();
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>