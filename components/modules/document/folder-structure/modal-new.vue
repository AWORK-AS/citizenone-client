<template>
    <div>
        <Modal size="lg" :title="$t('folderStructure.newFolderStructure')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesDocumentFolderStructureForm formType="create" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveFolderStructure" />
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
})
const emit = defineEmits(['close', 'refreshFolderStructures'])

const state = reactive({
    error: {} as Error,
    formFolderStructure: {
        name: '',
        structure: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshFolderStructures() {
    emit('refreshFolderStructures')
}

async function saveFolderStructure(folderStuctureDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            type: 'company',
            name: folderStuctureDetails.name,
            structure: JSON.stringify(folderStuctureDetails.structure),
        }
        const response = await folderStructureService.saveFolderStructure(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('folderStructure.form.alert.newFolderStructureSuccessfullyCreated')}.`)
            refreshFolderStructures()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>