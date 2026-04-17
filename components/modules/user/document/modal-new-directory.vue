
<template>
    <div>
        <Modal size="sm" :title="$t('drive.form.newFolder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDocumentForm formType="create" :selectedDocument="state.formDirectory"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveDirectory" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { documentService } from '@/components/api/user/DocumentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const { successAlert } = useAlert()
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
            const token = localStorage.getItem('_token');
            const response = await $fetch('/api/user/onedrive/create-folder', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-User-Id': String(userId),
                    'Authorization': 'Bearer ' + token,
                },
                body: {
                    name: directoryDetails.name,
                    parent_id: parentId,
                },
                credentials: 'include',
            });
            if ((response && typeof response === 'object' && ('id' in response || 'success' in response)) || (typeof response === 'string' && response.length > 0)) {
                refreshDocuments();
                closeModal();
                successAlert(`${t('alert.success')}!`, `${t('drive.alert.folderSuccessfullyAdded')}.`);
            }
        } else {
            const folderUuid = router?.currentRoute?.value?.query?.folder_uuid;
            let params = {};
            if (directoryDetails.is_use_template) {
                params = {
                    ...(folderUuid && { folder_uuid: folderUuid }),
                    folder_structure_uuid: directoryDetails.template,
                    is_admin_access: directoryDetails.is_admin_access,
                    type: 'folder',
                };
            } else {
                params = {
                    ...(folderUuid && { folder_uuid: folderUuid }),
                    name: directoryDetails.name,
                    is_admin_access: directoryDetails.is_admin_access,
                    type: 'folder',
                };
            }
            const response = await documentService.saveFileFolder(params);
            if (response?.data) {
                refreshDocuments();
                closeModal();
                successAlert(`${t('alert.success')}!`, `${t('drive.alert.folderSuccessfullyAdded')}.`);
            }
        }
    } catch (error: any) {
        state.error = error;
    }
    state.isPageLoading = false;
}
</script>