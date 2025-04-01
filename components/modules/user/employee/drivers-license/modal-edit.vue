<template>
    <div>
        <Modal size="md" :title="$t('employees.documents.editDocument')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmployeeDriversLicenseForm formType="update"
                        :selectedEmployeeDocument="props.selectedEmployeeDocument" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateEmployeeDocument" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { employeeDocumentService } from '@/components/api/user/EmployeeDocumentService'
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
    selectedEmployeeDocument: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshEmployeeDocuments'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshEmployeeDocuments() {
    emit('refreshEmployeeDocuments')
}

async function updateEmployeeDocument(employeeDocumentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const selectedEmployeeDocumentUuid = props.selectedEmployeeDocument?.uuid
        const params = {
            name: employeeDocumentDetails.name,
            note: employeeDocumentDetails.note,
        }
        const response = await employeeDocumentService.updateDocument(selectedEmployeeDocumentUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employees.documents.form.alert.documentSuccessfullyUpdated')}.`)
            refreshEmployeeDocuments()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>