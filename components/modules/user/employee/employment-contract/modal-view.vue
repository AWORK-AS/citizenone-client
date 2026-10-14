<template>
    <div>
        <Modal size="3xl" :title="$t('employees.documents.employmentContracts')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" @click="state.modal.isAddNewDocumentOpen = true">
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
                                        <td width="24%">
                                            <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                                v-if="document?.file_url" @click="viewDocument(document)">
                                                <Icon name="ph:file" class="size-6" />
                                                <span>{{ document?.name }}</span>
                                            </div>
                                        </td>
                                        <td width="16%">
                                            <span>{{ document?.note }}</span>
                                        </td>
                                        <!-- Task #33: sent to the employee to sign -->
                                        <td width="18%" :data-testid="`contract-signature-${document?.uuid}`">
                                            <span v-if="document?.signature?.status === 'signed'"
                                                class="inline-flex flex-col">
                                                <span class="inline-flex items-center gap-1 text-sm font-medium text-[#2E9E33]">
                                                    <Icon name="ph:seal-check-fill" class="size-4" />
                                                    {{ $t('employees.documents.signature.signed') }}
                                                </span>
                                                <span class="text-xs text-gray-500">
                                                    {{ $t('employees.documents.signature.signedOnBy', { date: formatDate(document.signature.signed_at), name: document.signature.signed_name }) }}
                                                </span>
                                            </span>
                                            <span v-else-if="document?.signature?.status === 'pending'"
                                                class="inline-flex flex-col">
                                                <span class="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                                                    <Icon name="ph:hourglass-medium" class="size-4" />
                                                    {{ $t('employees.documents.signature.pending') }}
                                                </span>
                                                <span class="text-xs text-gray-500">
                                                    {{ $t('employees.documents.signature.sentOn', { date: formatDate(document.signature.requested_at) }) }}
                                                </span>
                                            </span>
                                            <span v-else class="text-sm text-gray-400">
                                                {{ $t('employees.documents.signature.notSent') }}
                                            </span>
                                        </td>
                                        <td width="42%">
                                            <div class="flex flex-wrap items-center gap-2">
                                                <FormButton v-if="document?.is_signable && !document?.signature" type="button"
                                                    buttonStyle="action" :data-testid="`contract-send-${document?.uuid}`"
                                                    @click="confirmSignatureRequest(document)">
                                                    <Icon name="ph:signature" class="size-4" />
                                                    {{ $t('employees.documents.signature.send') }}
                                                </FormButton>
                                                <FormButton v-if="document?.signature?.status === 'pending'" type="button"
                                                    buttonStyle="action" @click="confirmSignatureWithdrawal(document)">
                                                    <Icon name="ph:arrow-counter-clockwise" class="size-4" />
                                                    {{ $t('employees.documents.signature.withdraw') }}
                                                </FormButton>
                                                <FormButton v-if="document?.signature?.status === 'signed'" type="button"
                                                    buttonStyle="action" @click="downloadCertificate(document)">
                                                    <Icon name="ph:certificate" class="size-4" />
                                                    {{ $t('employees.documents.signature.certificate') }}
                                                </FormButton>
                                                <FormButton v-if="document?.file_url && canDownloadDocuments" type="button"
                                                    buttonStyle="action" @click="downloadDocument(document)">
                                                    <Icon name="ph:download-simple" class="size-4" />
                                                    {{ $t('employees.documents.table.actions.download') }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="editDocument(document)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                    {{ $t('employees.documents.table.actions.edit') }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="confirmDocumentArchiving(document)">
                                                    <Icon name="ph:archive-light" class="size-4" />
                                                    {{ $t('employees.documents.table.actions.archive') }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="primary"
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
                <ModulesUserEmployeeEmploymentContractModalNew :isModalOpen="state.modal.isAddNewDocumentOpen"
                    @close="state.modal.isAddNewDocumentOpen = false" @refreshEmployeeDocuments="fetchDocuments" />
                <ModulesUserEmployeeEmploymentContractModalEdit :isModalOpen="state.modal.isEditDocumentOpen"
                    :selectedEmployeeDocument="state.selectedEmployeeDocument"
                    @close="state.modal.isEditDocumentOpen = false" @refreshEmployeeDocuments="fetchDocuments" />
                <DialogConfirmation :isModalOpen="state.modal.isArchiveDocumentOpen"
                    :message="$t('employees.documents.confirmation.archiveConfirmation') + '?'"
                    @close="state.modal.isArchiveDocumentOpen = false" @confirm="archiveDocument" />
                <DialogConfirmation :isModalOpen="state.modal.isSignatureRequestOpen"
                    :message="$t('employees.documents.signature.confirmSend') + '?'"
                    @close="state.modal.isSignatureRequestOpen = false" @confirm="requestSignature" />
                <DialogConfirmation :isModalOpen="state.modal.isSignatureWithdrawOpen"
                    :message="$t('employees.documents.signature.confirmWithdraw') + '?'"
                    @close="state.modal.isSignatureWithdrawOpen = false" @confirm="withdrawSignatureRequest" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteDocumentOpen"
                    :message="$t('employees.documents.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteDocumentOpen = false" @confirm="deleteDocument" />
                <ModulesUserDocumentDocsFileModalPreview :isModalOpen="preview.isOpen" :selectedDocument="preview.document"
                    :loadFile="loadDocument" :downloadFile="downloadDocumentFile" :canDownload="canDownloadDocuments"
                    @close="preview.isOpen = false" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { employeeDocumentService } from '@/components/api/user/EmployeeDocumentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { saveAs } from 'file-saver'
import moment from 'moment'
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
const { isAtLeast, can } = usePermissions()
// Without download_documents a document can still be viewed, but not saved.
const canDownloadDocuments = computed(() => isAtLeast('Admin') || can('download_documents'))
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'employees.documents.table.file', isTranslateName: true, },
        { name: 'employees.documents.table.note', isTranslateName: true, },
        { name: 'employees.documents.signature.column', isTranslateName: true, },
        { name: '' },
    ],
    documents: [] as any,
    error: {} as Error,
    modal: {
        isAddNewDocumentOpen: false,
        isArchiveDocumentOpen: false,
        isEditDocumentOpen: false,
        isDeleteDocumentOpen: false,
        isSignatureRequestOpen: false,
        isSignatureWithdrawOpen: false,
    },
    isTableLoading: false,
    selectedEmployeeDocument: [] as any,
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
            file_type: 'employment_contract',
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

async function downloadDocument(document: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const documentUuid = document?.uuid
        const response = await employeeDocumentService.downloadDocument(documentUuid)
        if (response) {
            saveAs(response, document?.name)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

// Opening a document shows it in the app's viewer, never in a browser tab or
// on disk; only users with download_documents get a Download button there.
const preview = reactive({
    isOpen: false,
    document: {} as any,
})

function viewDocument(document: any) {
    preview.document = document
    preview.isOpen = true
}

function loadDocument(document: any): Promise<Blob | null> {
    return employeeDocumentService.viewDocument(document?.uuid)
}

function downloadDocumentFile(document: any): Promise<Blob | null> {
    return employeeDocumentService.downloadDocument(document?.uuid)
}

function editDocument(document: any) {
    state.selectedEmployeeDocument = document
    state.modal.isEditDocumentOpen = true
}

function confirmDocumentArchiving(document: any) {
    state.selectedEmployeeDocument = document
    state.modal.isArchiveDocumentOpen = true
}

async function archiveDocument() {
    state.error = {}
    state.isTableLoading = true
    try {
        const documentUuid = state.selectedEmployeeDocument?.uuid
        const response = await employeeDocumentService.archiveUnarchiveDocument(documentUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employees.documents.alert.documentSuccessfullyArchived')}.`)
            fetchDocuments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

// Task #33: send an employment contract to the employee to sign, take a
// request back while it waits, and print the evidence once it is signed.
function formatDate(value: string | null): string {
    return value ? moment(value).format('DD-MM-YYYY') : ''
}

function confirmSignatureRequest(document: any) {
    state.selectedEmployeeDocument = document
    state.modal.isSignatureRequestOpen = true
}

function confirmSignatureWithdrawal(document: any) {
    state.selectedEmployeeDocument = document
    state.modal.isSignatureWithdrawOpen = true
}

async function requestSignature() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employeeDocumentService.requestSignature(state.selectedEmployeeDocument?.uuid)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('employees.documents.signature.sent')}.`)
            fetchDocuments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function withdrawSignatureRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employeeDocumentService.withdrawSignatureRequest(state.selectedEmployeeDocument?.uuid)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('employees.documents.signature.withdrawn')}.`)
            fetchDocuments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function downloadCertificate(document: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employeeDocumentService.downloadSignatureCertificate(document?.uuid)
        if (response) {
            saveAs(response, `${t('employees.documents.signature.certificate')} - ${document?.name}.pdf`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmDocumentDeletion(document: any) {
    state.selectedEmployeeDocument = document
    state.modal.isDeleteDocumentOpen = true
}

async function deleteDocument() {
    state.error = {}
    state.isTableLoading = true
    try {
        const selectedEmployeeDocumentUuid = state.selectedEmployeeDocument.uuid
        const response = await employeeDocumentService.deleteDocument(selectedEmployeeDocumentUuid)
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