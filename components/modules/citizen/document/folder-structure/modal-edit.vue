<template>
    <div>
        <Modal size="lg" :title="$t('citizens.documents.folderStructure.editFolderStructure')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenDocumentFolderStructureForm formType="update"
                        :selectedFolderStructure="props.selectedFolderStructure" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateFolderStructure" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { folderStructureService } from '@/components/api/FolderStructureService'
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
    selectedFolderStructure: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshFolderStructures'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshFolderStructures() {
    emit('refreshFolderStructures')
}

async function updateFolderStructure(folderStructureDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const folderStructureUuid = props?.selectedFolderStructure?.uuid
        const params = {
            name: folderStructureDetails.name,
            structure: JSON.stringify(folderStructureDetails.structure),
        }
        const response = await folderStructureService.updateFolderStructure(folderStructureUuid, params)
        if (response?.data) {
            refreshFolderStructures()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.folderStructure.alert.folderStructureSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>