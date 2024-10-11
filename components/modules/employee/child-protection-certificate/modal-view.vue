<template>
    <div>
        <Modal size="xl" :title="$t('employees.documents.childProtectionCertificates')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAddNewDocumentOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('employees.documents.newDocument') }}
                        </FormButton>
                    </div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.documents"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.documents?.data?.length === 0))">
                                    <tr v-for="(document, index) in state.documents?.data" :key="index">
                                        <td width="30%">
                                            <span>{{ document?.name }}</span>
                                        </td>
                                        <td width="40%">
                                            <span>{{ document?.note }}</span>
                                        </td>
                                        <td width="30%">
                                            <div class="flex items-end gap-2">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editDocument(document)">
                                                    <Icon name="ph:pencil" class="size-4" />
                                                    {{ $t('employees.table.actions.edit') }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="confirmDocumentDeletion(document)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                    {{ $t('employees.documents.table.actions.delete') }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.documents" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesEmployeeEmploymentContractModalNew :isModalOpen="state.modal.isAddNewDocumentOpen"
                    @close="state.modal.isAddNewDocumentOpen = false" @refreshEmployeeDocuments="fetchDocuments" />
                <ModulesEmployeeEmploymentContractModalEdit :isModalOpen="state.modal.isEditDocumentOpen"
                    :selectedEmployeeDocument="state.selectedDocument" @close="state.modal.isEditDocumentOpen = false"
                    @refreshEmployeeDocuments="fetchDocuments" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteDocumentOpen"
                    :message="$t('employees.documents.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteDocumentOpen = false" @confirm="deleteDocument" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { employeeDocumentService } from '@/components/api/EmployeeDocumentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const router = useRouter()
const { successAlert } = useAlert()
const { t } = useI18n()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'employees.documents.table.file' },
        { name: 'employees.documents.table.note' },
        { name: '' },
    ],
    documents: [] as any,
    error: {} as Error,
    modal: {
        isAddNewDocumentOpen: false,
        isEditDocumentOpen: false,
        isDeleteDocumentOpen: false,
    },
    isTableLoading: false,
    selectedDocument: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchDocuments()
    }
})

function closeModal() {
    emit('close')
}

async function fetchDocuments() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            file_type: 'child_protection_certificate',
            employee_uuid: employeeUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await employeeDocumentService.getDocuments(params)
        if (response) {
            state.documents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchDocuments()
}

function next() {
    currentTablePage++
    fetchDocuments()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchDocuments()
}

function editDocument(document: any) {
    state.selectedDocument = document
    state.modal.isEditDocumentOpen = true
}

function confirmDocumentDeletion(document: any) {
    state.selectedDocument = document
    state.modal.isDeleteDocumentOpen = true
}

async function deleteDocument() {
    state.error = {}
    state.isTableLoading = true
    try {
        const selectedDocumentUuid = state.selectedDocument.uuid
        const response = await employeeDocumentService.deleteDocument(selectedDocumentUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('employees.documents.alert.documentSuccessfullyDeleted')}.`)
            fetchDocuments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>