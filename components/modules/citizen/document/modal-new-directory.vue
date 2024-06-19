<template>
    <div>
        <Modal size="sm" :title="$t('citizens.documents.form.newFolder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenDocumentForm formType="create" :selectedDirectory="state.formDirectory"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveDirectory" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { documentService } from '@/components/api/DocumentService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshDocuments'])

const state = reactive({
    error: [],
    isPageLoading: false,
    formDirectory: {
        id: '',
        uuid: '',
        name: '',
        date_given: '',
        description: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshDocuments() {
    emit('refreshDocuments')
}

async function saveDirectory(directoryDetails: any) {
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            name: directoryDetails.name,
        }
        const response = await documentService.saveCitizenFileFolder(params)
        if (response?.data) {
            refreshDocuments()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>