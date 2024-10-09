<template>
    <div>
        <Modal size="md" :title="$t('employees.documents.newDocument')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesEmployeeEmploymentContractForm formType="create"
                        :selectedEmployeeDocument="state.formEmployeeDocument" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveEmployeeDocument" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { employeeDocumentService } from '@/components/api/EmployeeDocumentService'
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
const emit = defineEmits(['close', 'refreshEmployeeDocument'])

const state = reactive({
    error: {} as Error,
    formEmployeeDocument: {
        file: '',
        note: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshEmployeeDocument() {
    emit('refreshEmployeeDocument')
}

async function saveEmployeeDocument(employeeDocumentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('file', employeeDocumentDetails.file)
        params.append('file_type', 'child_protection_certificate')
        params.append('note', employeeDocumentDetails.note)
        const response = await employeeDocumentService.saveDocument(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employees.documents.form.alert.documentSuccessfullySaved')}.`)
            refreshEmployeeDocument()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>