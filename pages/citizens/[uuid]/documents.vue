<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.documents') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.documents') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex justify-end items-center gap-x-3">
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isAddDirectoryOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.documents.createNewFolder') }}
                        </FormButton>
                        <LoadingSpinner :isActive="state.isPageLoading">
                            <FormButton buttonStyle="action" class="rounded-md" @click="triggerFileInput">
                                <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('citizens.documents.uploadFile') }}
                            </FormButton>
                            <input type="file" ref="documentFile" @change="uploadFile" class="hidden" />
                        </LoadingSpinner>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isViewFolderStructureOpen = true">
                            <Icon name="ph:folder-notch-open" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('folderStructure.folderStructure') }}
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isCreateTemplateOpen = true">
                            <Icon name="ph:file" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.documents.createTemplate.createTemplate') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <!-- <div class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                            @click="$router.back()" v-if="router?.currentRoute?.value?.query?.folder_uuid">
                            <Icon name="ph:arrow-left" size="16" class="text-black" />
                            <span class="text-sm">{{ $t('back') }}</span>
                        </div> -->
                        <Table :columnHeaders="state.columnHeaders" :data="state.documents"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.documents?.data?.length === 0))">
                                <tr v-for="(document, index) in state.documents?.data" :key="index">
                                    <td width="25%">
                                        <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                            v-if="document?.file_url" @click="downloadFile(document)">
                                            <Icon name="ph:file" class="size-6" />
                                            <Tooltip :text="$t('citizens.documents.form.forAdministratorsOnly')"
                                                class="flex items-center" v-if="document?.is_admin_access">
                                                <Icon name="ph:lock-key-fill" class="w-5 h-5 text-red-700" />
                                            </Tooltip>
                                            <span class="truncate">{{ document?.name }}</span>
                                        </div>
                                        <span v-else class="flex items-center gap-x-1">
                                            <Icon name="ph:folder-notch-open-light" class="size-6" />
                                            <Tooltip :text="$t('citizens.documents.form.forAdministratorsOnly')"
                                                class="flex items-center" v-if="document?.is_admin_access">
                                                <Icon name="ph:lock-key-fill" class="w-5 h-5 text-red-700" />
                                            </Tooltip>
                                            <span class="truncate">{{ document?.name }}</span>
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ document?.user?.firstname }}</span>
                                        <span>{{ document?.user?.lastname }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ formatDateTimeToReadable(document?.created_at) }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>
                                            {{ document?.updated_at && formatDateTimeToReadable(document?.updated_at) }}
                                        </span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2">
                                            <Tooltip :text="$t('citizens.documents.table.actions.view')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewDirectory(document)" v-if="document?.type === 'folder'">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="document?.is_shared ? $t('citizens.documents.table.actions.unshare') :
                                                $t('citizens.documents.table.actions.share')"
                                                v-if="document?.type === 'file'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="confirmDocumentShareUnshare(document)">
                                                    <Icon name="ph:share" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.move')"
                                                v-if="document?.type === 'file'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="moveFileConfirmation(document)">
                                                    <Icon name="ph:arrows-out" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editDocument(document)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.access')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewDocumentAccess(document)">
                                                    <Icon name="ph:lock" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.archive')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="confirmDocumentArchiving(document)">
                                                    <Icon name="ph:archive-light" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.delete')"
                                                v-if="document?.type === 'folder'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="deleteDirectoryConfirmation(document)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.delete')" v-else>
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="deleteFileConfirmation(document)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.documents" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenDocumentModalNewDirectory :isModalOpen="state.modal.isAddDirectoryOpen"
                    @close="state.modal.isAddDirectoryOpen = false" @refreshDocuments="fetchDocuments" />
                <ModulesUserCitizenDocumentModalEditDocument :isModalOpen="state.modal.isEditDocumentOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isEditDocumentOpen = false"
                    @refreshDocuments="fetchDocuments" />
                <ModulesUserCitizenDocumentAccessModalView :isModalOpen="state.modal.isViewAccessOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isViewAccessOpen = false" />
                <ModulesUserCitizenDocumentStatusTemplateModalNew :isModalOpen="state.modal.isCreateTemplateOpen"
                    @close="state.modal.isCreateTemplateOpen = false" />
                <ModulesUserCitizenDocumentModalMoveFile :isModalOpen="state.modal.isMoveFileOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isMoveFileOpen = false"
                    @refreshDocuments="fetchDocuments" />
                <ModulesUserCitizenDocumentFolderStructureModalFolderStructures
                    :isModalOpen="state.modal.isViewFolderStructureOpen"
                    @close="state.modal.isViewFolderStructureOpen = false" />
                <DialogConfirmation :isModalOpen="state.modal.isShareDocumentOpen"
                    :message="state.selectedDocument?.is_shared ? $t('citizens.documents.confirmation.unshareConfirmation') : $t('citizens.documents.confirmation.shareConfirmation') + '?'"
                    @close="state.modal.isShareDocumentOpen = false" @confirm="shareUnshareDocument" />
                <DialogConfirmation :isModalOpen="state.modal.isArchiveDocumentOpen"
                    :message="$t('citizens.documents.confirmation.archiveConfirmation') + '?'"
                    @close="state.modal.isArchiveDocumentOpen = false" @confirm="archiveDocument" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteDirectoryOpen"
                    :message="$t('citizens.documents.confirmation.deleteFolderConfirmation') + '?'"
                    @close="state.modal.isDeleteDirectoryOpen = false" @confirm="deleteDocument" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteFileOpen"
                    :message="$t('citizens.documents.confirmation.deleteFileConfirmation') + '?'"
                    @close="state.modal.isDeleteFileOpen = false" @confirm="deleteDocument" />
                <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen"
                    :title="$t('citizens.documents.upgradeStorage')"
                    :message="state.error?.message + ' ' + $t('citizens.documents.confirmation.upgradeStorageConfirmation') + '?'"
                    @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { citizenDocumentService } from '@/components/api/user/CitizenDocumentService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const documentFile = ref(null) as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'citizens.tabs.documents',
        translate: true,
        href: `/citizens/${citizenUuid}/documents`,
    },
]

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'citizens.documents.table.name', sorter: true, key: 'name' },
        { name: 'citizens.documents.table.owner' },
        { name: 'citizens.documents.table.dateCreated', sorter: true, key: 'created_at' },
        { name: 'citizens.documents.table.lastModified', sorter: true, key: 'updated_at' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    documents: [] as any,
    modal: {
        isAddDirectoryOpen: false,
        isArchiveDocumentOpen: false,
        isCreateTemplateOpen: false,
        isDeleteDirectoryOpen: false,
        isDeleteFileOpen: false,
        isEditDocumentOpen: false,
        isMoveFileOpen: false,
        isShareDocumentOpen: false,
        isUpgradeStorageOpen: false,
        isUploadFileOpen: false,
        isViewAccessOpen: false,
        isViewFolderStructureOpen: false,
    },
    selectedDocument: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchDocuments()
})

watch(() => router?.currentRoute?.value?.query, (newParams, oldParams) => {
    handleRouteChange()
}, { deep: true })

const handleRouteChange = () => {
    fetchDocuments()
}

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

async function fetchDocuments(folderUuid: any = null) {
    state.error = {}
    state.isTableLoading = true
    try {
        const folderUuid = router?.currentRoute?.value?.query?.folder_uuid
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
            ...(folderUuid && { folder_uuid: folderUuid }),
        }
        const response = await citizenDocumentService.getCitizenFileFolders(params)
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

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchDocuments()
}

async function downloadFile(document: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const documentUuid = document?.uuid
        const response = await citizenDocumentService.downloadCitizenFile(documentUuid)
        if (response) {
            saveAs(response, document?.name)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function triggerFileInput() {
    documentFile.value.click()
}

async function uploadFile(event: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const folderUuid = router?.currentRoute?.value?.query?.folder_uuid as any
        let params = new FormData()
        params.append('citizen_uuid', citizenUuid)
        params.append('type', 'file')
        params.append('is_admin_access', 'false')
        params.append('file', event.target.files[0])
        if (folderUuid) {
            params.append('folder_uuid', folderUuid)
        }
        const response = await citizenDocumentService.saveCitizenFileFolder(params)
        if (response?.data) {
            resetFileInput()
            fetchDocuments()
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.alert.fileSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
        resetFileInput()
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    state.isPageLoading = false
}

const resetFileInput = () => {
    if (documentFile.value) {
        documentFile.value.value = null
    }
}

async function viewDirectory(document: any) {
    await navigateTo(`/citizens/${citizenUuid}/documents?folder_uuid=${document.uuid}`)
}

function editDocument(document: any) {
    state.selectedDocument = document
    state.modal.isEditDocumentOpen = true
}

function viewDocumentAccess(document: any) {
    state.selectedDocument = document
    state.modal.isViewAccessOpen = true
}

function confirmDocumentShareUnshare(document: any) {
    state.selectedDocument = document
    state.modal.isShareDocumentOpen = true
}

async function shareUnshareDocument() {
    state.error = {}
    state.isTableLoading = true
    try {
        const documentUuid = state.selectedDocument?.uuid
        const isDocumentShared = state.selectedDocument?.is_shared
        const response = await citizenDocumentService.shareUnshareDocument(documentUuid)
        if (response.data) {
            if (isDocumentShared) {
                successAlert(`${t('alert.success')}!`, `${t('citizens.documents.alert.fileSuccessfullyUnshared')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('citizens.documents.alert.fileSuccessfullyShared')}.`)
            }
            fetchDocuments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmDocumentArchiving(document: any) {
    state.selectedDocument = document
    state.modal.isArchiveDocumentOpen = true
}

async function archiveDocument() {
    state.error = {}
    state.isTableLoading = true
    try {
        const documentUuid = state.selectedDocument?.uuid
        const response = await citizenDocumentService.archiveUnarchiveDocument(documentUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.alert.documentSuccessfullyArchived')}.`)
            fetchDocuments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function moveFileConfirmation(document: any) {
    state.selectedDocument = document
    state.modal.isMoveFileOpen = true
}

function deleteDirectoryConfirmation(document: any) {
    state.selectedDocument = document
    state.modal.isDeleteDirectoryOpen = true
}

function deleteFileConfirmation(document: any) {
    state.selectedDocument = document
    state.modal.isDeleteFileOpen = true
}

async function deleteDocument() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenDocumentService.deleteDocument(state.selectedDocument.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchDocuments()
            if (state.selectedDocument.type === 'folder') {
                successAlert(`${t('alert.success')}!`, `${t('citizens.documents.alert.deletedFolderSuccessfully')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('citizens.documents.alert.deletedFileSuccessfully')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>