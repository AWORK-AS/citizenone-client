<template>
    <div>
        <Modal size="md" :title="$t('employees.documents.editDocument')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmployeeDocumentBoxMoveFolder :currentType="props.selectedEmployeeDocument?.file_type"
                        v-model:fileType="state.moveTo" v-model:issuedAt="state.moveIssuedAt" />
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
    isPageLoading: false,
    moveTo: '',
    moveIssuedAt: '',
})

function closeModal() {
    state.moveTo = ''
    state.moveIssuedAt = ''
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
            issued_at: employeeDocumentDetails.issued_at || '',
        }
        // Moved to another folder, with the date obtained when one is given.
        if (state.moveTo && state.moveTo !== props.selectedEmployeeDocument?.file_type) {
            Object.assign(params, { file_type: state.moveTo }, state.moveIssuedAt ? { issued_at: state.moveIssuedAt } : {})
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