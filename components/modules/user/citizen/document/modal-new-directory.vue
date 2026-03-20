<template>
    <div>
        <Modal size="sm" :title="$t('citizens.documents.form.newFolder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenDocumentForm formType="create" :selectedDocument="state.formDirectory"
                        :error="state.error" :showAdminCheckbox="true" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveDirectory" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenDocumentService } from '@/components/api/user/CitizenDocumentService'
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
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshDocuments'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formDirectory: {
        id: '',
        uuid: '',
        name: '',
        is_admin_access: false,
        folder_structure_uuid: false,
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
        let params = {}
        if (directoryDetails.is_use_template) {
            params = {
                citizen_uuid: citizenUuid,
                ...(folderUuid && { folder_uuid: folderUuid }),
                folder_structure_uuid: directoryDetails.template,
                is_admin_access: directoryDetails.is_admin_access,
                type: 'folder',
            }
        } else {
            params = {
                citizen_uuid: citizenUuid,
                ...(folderUuid && { folder_uuid: folderUuid }),
                name: directoryDetails.name,
                is_admin_access: directoryDetails.is_admin_access,
                type: 'folder',
            }
        }
        const response = await citizenDocumentService.saveCitizenFileFolder(params)
        if (response?.data) {
            refreshDocuments()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.alert.folderSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>