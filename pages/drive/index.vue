<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('drive.companyDocuments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('drive.companyDocuments') }}
                <span v-if="state.viewMode === 'google-drive'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                <Icon name="mdi:google-drive" class="h-4 w-4 mr-1" />
                                Google Drive (active)
                </span>
                <span v-else-if="state.viewMode === 'local'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-sky-100 text-sky-800">
                                <Icon name="ph:folder-notch-open" class="h-4 w-4 mr-1" />
                                CitizenOne Documents (active)
                </span>
            </template>

            <div class="space-y-5">
                <div class="mt-8 flex flex-col md:flex-row justify-between gap-3">
                    <div class="flex items-center justify-end md:justify-start gap-x-3">
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="toggleGoogleDriveView">
                            <Icon v-if="state.viewMode !== 'google-drive'" name="mdi:google-drive" class="h-4 w-4" aria-hidden="true" />
                            {{ state.viewMode === 'google-drive' ? 'CitizenOne Documents' : 'Google Drive' }}
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="navigateToExternalLink('https://onedrive.live.com/')">
                            <Icon name="mdi:microsoft-onedrive" class="h-4 w-4" aria-hidden="true" />
                            OneDrive
                        </FormButton>
                    </div>
                    <div class="flex flex-wrap items-center justify-end gap-3">
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.viewMode === 'google-drive' ? (state.modal.isCreateGoogleDriveFolderOpen = true) : (state.modal.isAddDirectoryOpen = true)">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('drive.createNewFolder') }}
                        </FormButton>
                        <LoadingSpinner :isActive="state.isPageLoading">
                            <FormButton buttonStyle="action" class="rounded-md" @click="state.viewMode === 'google-drive' ? uploadToGoogleDrive() : triggerFileInput()">
                                <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('drive.uploadFile') }}
                            </FormButton>
                            <input type="file" ref="documentFile" @change="uploadFile" class="hidden" multiple v-if="state.viewMode === 'local'" />
                        </LoadingSpinner>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isViewFolderStructureOpen = true" v-if="state.viewMode === 'local'">
                            <Icon name="ph:folder-notch-open" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('folderStructure.folderStructure') }}
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isCreateTemplateOpen = true" v-if="state.viewMode === 'local'">
                            <Icon name="ph:file" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('drive.createTemplate.createTemplate') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <div class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                            @click="goBackGoogleDriveFolder" v-if="state.viewMode === 'google-drive' && state.googleDriveFolderStack.length">
                            <Icon name="ph:arrow-left" size="16" class="text-black" />
                            <span class="text-sm">{{ $t('back') }}</span>
                        </div>
                        <Table :columnHeaders="state.columnHeaders" 
                            :data="state.viewMode === 'google-drive' ? state.googleDriveFiles : state.documents"
                            :isLoading="state.isTableLoading" :sortData="state.sortData"
                            :emptyMessage="state.viewMode === 'google-drive' && !state.googleDriveConnected ? 'You have not activated or linked your Google Drive' : ''"
                            @sort="sort">
                            <template #body v-if="!(state.isTableLoading || ((state.viewMode === 'google-drive' ? state.googleDriveFiles : state.documents)?.data?.length === 0))">
                                <tr v-for="(document, index) in (state.viewMode === 'google-drive' ? state.googleDriveFiles.data : state.documents?.data)" :key="index">
                                    <td width="25%">
                                        <div v-if="state.viewMode === 'google-drive'">
                                            <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                                v-if="document?.type === 'file'" @click="openGoogleDriveFile(document)">
                                                <Icon name="ph:file" class="size-6" />
                                                <Tooltip :text="$t('drive.form.forAdministratorsOnly')"
                                                    class="flex items-center" v-if="document?.is_admin_access">
                                                    <Icon name="ph:lock-key-fill" class="w-5 h-5 text-red-700" />
                                                </Tooltip>
                                                <span class="truncate">{{ document?.name }}</span>
                                            </div>
                                            <div class="text-black flex items-center gap-x-1"
                                                v-else>
                                                <Icon name="ph:folder-notch-open-light" class="size-6" />
                                                <Tooltip :text="$t('drive.form.forAdministratorsOnly')"
                                                    class="flex items-center" v-if="document?.is_admin_access">
                                                    <Icon name="ph:lock-key-fill" class="w-5 h-5 text-red-700" />
                                                </Tooltip>
                                                <span class="truncate">{{ document?.name }}</span>
                                            </div>
                                        </div>
                                        <div v-else>
                                            <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                                v-if="document?.file_url" @click="downloadFile(document)">
                                                <Icon name="ph:file" class="size-6" />
                                                <Tooltip :text="$t('drive.form.forAdministratorsOnly')"
                                                    class="flex items-center" v-if="document?.is_admin_access">
                                                    <Icon name="ph:lock-key-fill" class="w-5 h-5 text-red-700" />
                                                </Tooltip>
                                                <span class="truncate">{{ document?.name }}</span>
                                            </div>
                                            <span v-else class="flex items-center gap-x-1">
                                                <Icon name="ph:folder-notch-open-light" class="size-6" />
                                                <Tooltip :text="$t('drive.form.forAdministratorsOnly')"
                                                    class="flex items-center" v-if="document?.is_admin_access">
                                                    <Icon name="ph:lock-key-fill" class="w-5 h-5 text-red-700" />
                                                </Tooltip>
                                                <span class="truncate">{{ document?.name }}</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <p class="truncate">
                                            {{ document?.user?.firstname + ' ' + document?.user?.lastname }}
                                        </p>
                                    </td>
                                    <td width="20%">
                                        <span class="truncate">
                                            {{ formatDateTimeToReadable(document?.created_at) }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span class="truncate">
                                            {{ document?.updated_at && formatDateTimeToReadable(document?.updated_at) }}
                                        </span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2" v-if="state.viewMode === 'google-drive'">
                                            <!-- Google Drive: Folder View + Delete -->
                                            <Tooltip :text="$t('drive.table.actions.view')" v-if="document?.type === 'folder'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewGoogleDriveDirectory(document)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.move')" v-if="document?.type === 'file'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="moveGoogleDriveFileConfirmation(document)">
                                                    <Icon name="ph:arrows-out" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.delete')">
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="deleteFromGoogleDrive(document)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                        <div class="flex items-end justify-end gap-2" v-else>
                                            <!-- Local files: Full actions -->
                                            <Tooltip :text="$t('drive.table.actions.view')"
                                                v-if="document?.type === 'folder'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewDirectory(document)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.move')"
                                                v-if="document?.type === 'file'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="moveFileConfirmation(document)">
                                                    <Icon name="ph:arrows-out" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editDocument(document)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.access')"
                                                v-if="isAdmin(userStore.getUser?.roles)">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewDocumentAccess(document)">
                                                    <Icon name="ph:lock" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.archive')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="confirmDocumentArchiving(document)">
                                                    <Icon name="ph:archive-light" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.delete')"
                                                v-if="document?.type === 'folder'">
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="deleteDirectoryConfirmation(document)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.delete')" v-else>
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
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
                <ModulesUserDocumentModalNewDirectory :isModalOpen="state.modal.isAddDirectoryOpen"
                    @close="state.modal.isAddDirectoryOpen = false" @refreshDocuments="fetchDocuments" />
                <ModulesUserDocumentModalNewGoogleDriveDirectory :isModalOpen="state.modal.isCreateGoogleDriveFolderOpen"
                    @close="state.modal.isCreateGoogleDriveFolderOpen = false" @folderCreated="fetchGoogleDriveFiles" />
                <ModulesUserDocumentModalEditDocument :isModalOpen="state.modal.isEditDocumentOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isEditDocumentOpen = false"
                    @refreshDocuments="fetchDocuments" />
                <ModulesUserDocumentAccessModalView :isModalOpen="state.modal.isViewAccessOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isViewAccessOpen = false" />
                <ModulesUserDocumentModalMoveFile :isModalOpen="state.modal.isMoveFileOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isMoveFileOpen = false"
                    @refreshDocuments="fetchDocuments" />
                <ModulesUserDocumentModalMoveGoogleDriveFile :isModalOpen="state.modal.isMoveGoogleDriveFileOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isMoveGoogleDriveFileOpen = false"
                    @refreshDocuments="fetchGoogleDriveFiles(state.googleDriveFolderId)" />
                <ModulesUserDocumentFolderStructureModalFolderStructures
                    :isModalOpen="state.modal.isViewFolderStructureOpen"
                    @close="state.modal.isViewFolderStructureOpen = false" />

                <ModulesUserDocumentStatusTemplateModalNew :isModalOpen="state.modal.isCreateTemplateOpen"
                    @close="state.modal.isCreateTemplateOpen = false" />

                <DialogConfirmation :isModalOpen="state.modal.isArchiveDocumentOpen"
                    :message="$t('drive.confirmation.archiveConfirmation') + '?'"
                    @close="state.modal.isArchiveDocumentOpen = false" @confirm="archiveDocument" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteDirectoryOpen"
                    :message="$t('drive.confirmation.deleteFolderConfirmation') + '?'"
                    @close="state.modal.isDeleteDirectoryOpen = false" @confirm="deleteDocument" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteFileOpen"
                    :message="$t('drive.confirmation.deleteFileConfirmation') + '?'"
                    @close="state.modal.isDeleteFileOpen = false" @confirm="deleteDocument" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteGoogleDriveFileOpen"
                    :message="$t('drive.confirmation.deleteFileConfirmation') + '?'"
                    @close="state.modal.isDeleteGoogleDriveFileOpen = false" @confirm="deleteGoogleDriveFile" />
                <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen" :title="$t('drive.upgradeStorage')"
                    :message="state.error?.message + ' ' + $t('drive.confirmation.upgradeStorageConfirmation') + '?'"
                    @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { documentService } from '@/components/api/user/DocumentService'
import { googledriveService } from '@/components/api/user/GoogleDriveService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const userStore = useUserStore() as any
const { t } = useI18n()
const router = useRouter()
const documentFile = ref(null) as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'drive.companyDocuments',
        translate: true,
        href: '/drive',
    },
]

const state = reactive({
    viewMode: 'local' as 'local' | 'google-drive',
    columnHeaders: [
        { name: 'drive.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'drive.table.owner', isTranslateName: true, },
        { name: 'drive.table.dateCreated', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'drive.table.lastModified', isTranslateName: true, sorter: true, key: 'updated_at' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    documents: [] as any,
    googleDriveFiles: [] as any,
    googleDriveFolderId: null as string | null,
    googleDriveFolderStack: [] as string[],
    modal: {
        isAddDirectoryOpen: false,
        isArchiveDocumentOpen: false,
        isCreateTemplateOpen: false,
        isCreateGoogleDriveFolderOpen: false,
        isDeleteDirectoryOpen: false,
        isDeleteFileOpen: false,
        isDeleteGoogleDriveFileOpen: false,
        isEditDocumentOpen: false,
        isMoveFileOpen: false,
        isMoveGoogleDriveFileOpen: false,
        isUpgradeStorageOpen: false,
        isUploadFileOpen: false,
        isViewAccessOpen: false,
        isViewFolderStructureOpen: false,
    },
    selectedDocument: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    initDriveView()
})

async function initDriveView() {
    state.isPageLoading = true
    try {
        const status = await googledriveService.getGoogleDriveStatus()
        // Expecting status to indicate connection; accept several shapes
        const connected = !!(status?.connected || status?.is_connected || status === true || status?.data?.connected)
        if (connected) {
            state.viewMode = 'google-drive'
            state.googleDriveFolderId = null
            state.googleDriveFolderStack = []
            await fetchGoogleDriveFiles()
        } else {
            state.viewMode = 'local'
            await fetchDocuments()
        }
    } catch (error: any) {
        // fallback to local view on error
        state.viewMode = 'local'
        await fetchDocuments()
    }
    state.isPageLoading = false
}

watch(() => router?.currentRoute?.value?.query, (newParams, oldParams) => {
    handleRouteChange()
}, { deep: true })

const handleRouteChange = () => {
    fetchDocuments()
}

function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

async function toggleGoogleDriveView() {
    if (state.viewMode === 'local') {
            state.isPageLoading = true
            try {
                const status = await googledriveService.getGoogleDriveStatus()
                const connected = !!(status?.connected || status?.is_connected || status === true || status?.data?.connected)
                state.googleDriveConnected = connected
                state.viewMode = 'google-drive'
                if (connected) {
                    state.googleDriveFolderId = null
                    state.googleDriveFolderStack = []
                    await fetchGoogleDriveFiles()
                } else {
                    state.googleDriveFiles = { data: [], current_page: 1, per_page: 0, total: 0 }
                }
            } catch (error: any) {
                state.googleDriveConnected = false
                state.viewMode = 'google-drive'
                state.googleDriveFiles = { data: [], current_page: 1, per_page: 0, total: 0 }
            }
            state.isPageLoading = false
    } else {
        state.viewMode = 'local'
        fetchDocuments()
    }
}

async function openGoogleDriveFile(file: any) {
    if (file?.file_url) {
        await navigateToExternalLink(file.file_url)
    }
}

async function uploadToGoogleDrive() {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.onchange = async (e: any) => {
        const file = e.target.files?.[0]
        if (!file) return
        
        state.isPageLoading = true
        try {
            await googledriveService.uploadFileToGoogleDrive(file)
            successAlert(`${t('alert.success')}!`, 'File uploaded to Google Drive')
            await fetchGoogleDriveFiles()
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
    fileInput.click()
}

async function deleteFromGoogleDrive(file: any) {
    state.selectedDocument = file
    state.modal.isDeleteGoogleDriveFileOpen = true
}

async function deleteGoogleDriveFile() {
    state.error = {}
    state.isPageLoading = true
    try {
        await googledriveService.deleteGoogleDriveFile(state.selectedDocument.id)
        successAlert(`${t('alert.success')}!`, 'File deleted from Google Drive')
        state.modal.isDeleteGoogleDriveFileOpen = false
        await fetchGoogleDriveFiles()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchGoogleDriveFiles(parentFolderId: string | null = null) {
    state.error = {}
    state.isTableLoading = true
    try {
        state.googleDriveFolderId = parentFolderId
        const response = await googledriveService.getGoogleDriveFiles(parentFolderId || undefined)
        console.log('Google Drive response:', response)
        const files = Array.isArray(response)
            ? response
            : Array.isArray(response?.files)
                ? response.files
                : Array.isArray(response?.data)
                    ? response.data
                    : Array.isArray(response?.data?.files)
                        ? response.data.files
                        : Array.isArray(response?.data?.data)
                            ? response.data.data
                            : []
        if (files?.length) {
            // Transform Google Drive response to match table structure
            const transformedFiles = files.map((file: any) => ({
                id: file.id,
                name: file.name,
                file_url: file.webViewLink || file.webContentLink,
                created_at: file.createdTime,
                updated_at: file.modifiedTime,
                user: { 
                    firstname: 'Google', 
                    lastname: 'Drive' 
                },
                type: file.mimeType?.includes('folder') ? 'folder' : 'file',
                is_admin_access: false
            }))
            
            state.googleDriveFiles = {
                data: transformedFiles,
                current_page: 1,
                per_page: transformedFiles.length,
                total: transformedFiles.length
            }
            
            console.log('Transformed Google Drive files:', state.googleDriveFiles)
        } else {
            state.googleDriveFiles = {
                data: [],
                current_page: 1,
                per_page: 0,
                total: 0
            }
        }
    } catch (error: any) {
        console.error('Error fetching Google Drive files:', error)
        state.error = error
    }
    state.isTableLoading = false
}

function viewGoogleDriveDirectory(document: any) {
    if (document?.type !== 'folder') return
    if (state.googleDriveFolderId) {
        state.googleDriveFolderStack.push(state.googleDriveFolderId)
    }
    fetchGoogleDriveFiles(document.id)
}

function goBackGoogleDriveFolder() {
    const previousFolderId = state.googleDriveFolderStack.pop() || null
    fetchGoogleDriveFiles(previousFolderId)
}

async function fetchDocuments(folderUuid: any = null) {
    state.error = {}
    state.isTableLoading = true
    try {
        const folderUuid = router?.currentRoute?.value?.query?.folder_uuid
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
            ...(folderUuid && { folder_uuid: folderUuid }),
        }
        const response = await documentService.getFileFolders(params)
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
        const response = await documentService.downloadFile(documentUuid)
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
        const files = event.target.files

        if (!files || files.length === 0) return

        const params = new FormData()
        params.append('type', 'file')
        params.append('is_admin_access', 'false')

        // Append all files with the same key, e.g., files[]
        for (const file of files) {
            params.append('files[]', file)
        }

        if (folderUuid) {
            params.append('folder_uuid', folderUuid)
        }
        const response = await documentService.saveFileFolder(params)
        if (response?.data) {
            resetFileInput()
            fetchDocuments()
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyAdded')}.`)
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
    currentTablePage = 1
    await navigateTo(`/drive?folder_uuid=${document.uuid}`)
}

function editDocument(document: any) {
    state.selectedDocument = document
    state.modal.isEditDocumentOpen = true
}

function viewDocumentAccess(document: any) {
    state.selectedDocument = document
    state.modal.isViewAccessOpen = true
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
        const response = await documentService.archiveUnarchiveDocument(documentUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.documentSuccessfullyArchived')}.`)
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

function moveGoogleDriveFileConfirmation(document: any) {
    state.selectedDocument = document
    state.modal.isMoveGoogleDriveFileOpen = true
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
        const response = await documentService.deleteDocument(state.selectedDocument.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchDocuments()
            if (state.selectedDocument.type === 'folder') {
                successAlert(`${t('alert.success')}!`, `${t('drive.alert.deletedFolderSuccessfully')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('drive.alert.deletedFileSuccessfully')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>