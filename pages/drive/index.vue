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
                <div class="inline-flex items-center gap-x-2">
                    <span v-if="state.viewMode === 'google-drive'"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Icon name="mdi:google-drive" class="h-4 w-4 mr-1" />
                        Google Drive (active)
                    </span>
                    <button v-if="state.viewMode === 'google-drive'" type="button"
                        @click="state.modal.isDriveInfoOpen = true" class="ml-1 flex items-center">
                        <Icon name="ph:question" class="h-5 w-5 text-gray-600 hover:text-gray-800" aria-hidden="true">
                        </Icon>
                    </button>
                    <span v-else-if="state.viewMode === 'local'"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-sky-100 text-sky-800">
                        <Icon name="ph:folder-notch-open" class="h-4 w-4 mr-1" />
                        CitizenOne Documents (active)
                    </span>
                    <button v-if="state.viewMode === 'local'" type="button" @click="state.modal.isDriveInfoOpen = true"
                        class="ml-1 flex items-center">
                        <Icon name="ph:question" class="h-5 w-5 text-gray-600 hover:text-gray-800" aria-hidden="true">
                        </Icon>
                    </button>
                </div>
            </template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-5">
                    <div class="mt-8 flex flex-col md:flex-row justify-between gap-3">
                        <div class="flex items-center justify-end md:justify-start gap-x-3">
                            <FormButton buttonStyle="action" class="rounded-md" @click="toggleGoogleDriveView">
                                <Icon v-if="state.viewMode !== 'google-drive'" name="mdi:google-drive" class="h-4 w-4"
                                    aria-hidden="true" />
                                {{ state.viewMode === 'google-drive' ? 'CitizenOne Documents' : 'Google Drive' }}
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-md"
                                @click="navigateToExternalLink('https://onedrive.live.com/')">
                                <Icon name="mdi:microsoft-onedrive" class="h-4 w-4" aria-hidden="true" />
                                OneDrive
                            </FormButton>
                        </div>
                        <div class="flex flex-wrap items-center justify-end gap-3">
                            <Menu as="div" class="w-full md:w-fit relative inline-block text-left z-20"
                                v-if="state.viewMode === 'local'">
                                <div>
                                    <MenuButton class="w-full md:w-fit">
                                        <FormButton buttonStyle="action" class="w-full md:w-fit rounded-lg">
                                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                            {{ $t('drive.new') }}
                                        </FormButton>
                                    </MenuButton>
                                </div>

                                <transition enter-active-class="transition duration-100 ease-out"
                                    enter-from-class="transform scale-95 opacity-0"
                                    enter-to-class="transform scale-100 opacity-100"
                                    leave-active-class="transition duration-75 ease-in"
                                    leave-from-class="transform scale-100 opacity-100"
                                    leave-to-class="transform scale-95 opacity-0">
                                    <MenuItems
                                        class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                                        <div class="px-1 py-1">
                                            <MenuItem v-slot="{ active }"
                                                @click="state.modal.isAddDirectoryOpen = true">
                                            <button :class="[
                                                active && 'bg-gray-100',
                                                'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                            ]">
                                                <Icon name="ph:folder" class="mr-2 h-4 w-4" aria-hidden="true" />
                                                {{ $t('drive.createNewFolder') }}
                                            </button>
                                            </MenuItem>
                                            <MenuItem v-slot="{ active }"
                                                @click="state.modal.isCreateDocumentFileOpen = true">
                                            <button :class="[
                                                active && 'bg-gray-100',
                                                'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                            ]">
                                                <Icon name="ph:file-plus" class="mr-2 h-4 w-4" aria-hidden="true" />
                                                {{ $t('drive.newDocument') }}
                                            </button>
                                            </MenuItem>
                                        </div>
                                    </MenuItems>
                                </transition>
                            </Menu>
                            <FormButton buttonStyle="action" class="rounded-md"
                                @click="state.viewMode === 'google-drive' ? (state.modal.isCreateGoogleDriveFolderOpen = true) : (state.modal.isAddDirectoryOpen = true)"
                                v-if="state.viewMode === 'google-drive'">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('drive.createNewFolder') }}
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-md"
                                @click="state.viewMode === 'google-drive' ? uploadToGoogleDrive() : triggerFileInput()">
                                <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('drive.uploadFile') }}
                            </FormButton>
                            <input type="file" ref="documentFile" @change="uploadFile" class="hidden" multiple
                                v-if="state.viewMode === 'local'" />
                            <FormButton buttonStyle="action" class="rounded-md"
                                @click="state.modal.isViewFolderStructureOpen = true" v-if="state.viewMode === 'local'">
                                <Icon name="ph:folder-notch-open" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('folderStructure.folderStructure') }}
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-md"
                                @click="state.modal.isCreateTemplateOpen = true"
                                v-if="state.viewMode === 'local' || state.viewMode === 'google-drive'">
                                <Icon name="ph:file" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('drive.createTemplate.createTemplate') }}
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-md" @click="navigateTo('/drive/expenses')"
                                v-if="state.viewMode === 'local'">
                                <Icon name="ph:money" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('drive.expenses') }}
                            </FormButton>
                        </div>
                    </div>

                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <div class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                            @click="goBackGoogleDriveFolder"
                            v-if="state.viewMode === 'google-drive' && state.googleDriveFolderStack.length">
                            <Icon name="ph:arrow-left" size="16" class="text-black" />
                            <span class="text-sm">{{ $t('back') }}</span>
                        </div>
                        <div class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                            @click="goBackLocalFolder"
                            v-if="state.viewMode === 'local' && (router.currentRoute.value.query.folder_uuid || state.folderStack.length)">
                            <Icon name="ph:arrow-left" size="16" class="text-black" />
                            <span class="text-sm">{{ $t('back') }}</span>
                        </div>
                        <Table :columnHeaders="state.columnHeaders"
                            :data="state.viewMode === 'google-drive' ? state.googleDriveFiles : state.documents"
                            :isLoading="state.isTableLoading" :sortData="state.sortData"
                            :emptyMessage="state.viewMode === 'google-drive' && !state.googleDriveConnected ? 'You have not activated or linked your Google Drive' : ''"
                            @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || ((state.viewMode === 'google-drive' ? state.googleDriveFiles : state.documents)?.data?.length === 0))">
                                <tr v-for="(document, index) in (state.viewMode === 'google-drive' ? state.googleDriveFiles.data : state.documents?.data)"
                                    :key="index">
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
                                            <div class="text-black flex items-center gap-x-1" v-else>
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
                                                v-if="document?.file_url" @click="viewDownloadDocument(document)">
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
                                        <div class="flex items-end justify-end gap-2"
                                            v-if="state.viewMode === 'google-drive'">
                                            <!-- Google Drive: Folder View + Delete -->
                                            <Tooltip :text="$t('drive.table.actions.view')"
                                                v-if="document?.type === 'folder'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewGoogleDriveDirectory(document)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.move')"
                                                v-if="document?.type === 'file' || document?.type === 'folder'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="moveGoogleDriveFileConfirmation(document)">
                                                    <Icon name="ph:arrows-out" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.edit')"
                                                v-if="document?.type === 'file' || document?.type === 'folder'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editDocument(document)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
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
                                            <Tooltip :text="$t('drive.table.actions.downloadPDF')"
                                                v-if="['html', 'htm', 'docx'].includes(document?.file_url?.split('.').pop().toLowerCase())">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="openDownloadDocumentPdfDialog(document)">
                                                    <Icon name="ph:file-pdf" class="size-4" />
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
                        <Pagination :data="state.viewMode === 'google-drive' ? state.googleDriveFiles : state.documents"
                            @previous="previous" @next="next" />
                    </div>
                    <ModulesUserDocumentModalNewDirectory :isModalOpen="state.modal.isAddDirectoryOpen"
                        @close="state.modal.isAddDirectoryOpen = false" @refreshDocuments="fetchDocuments" />
                    <ModulesUserDocumentModalEditDocument :isModalOpen="state.modal.isEditDocumentOpen"
                        :selectedDocument="state.selectedDocument" @close="state.modal.isEditDocumentOpen = false"
                        @refreshDocuments="fetchDocuments" />
                    <ModulesUserDocumentAccessModalView :isModalOpen="state.modal.isViewAccessOpen"
                        :selectedDocument="state.selectedDocument" @close="state.modal.isViewAccessOpen = false" />
                    <ModulesUserDocumentModalMoveFile :isModalOpen="state.modal.isMoveFileOpen"
                        :selectedDocument="state.selectedDocument" @close="state.modal.isMoveFileOpen = false"
                        @refreshDocuments="fetchDocuments" />
                    <ModulesUserDocumentFolderStructureModalFolderStructures
                        :isModalOpen="state.modal.isViewFolderStructureOpen"
                        @close="state.modal.isViewFolderStructureOpen = false" />

                    <DialogConfirmation :isModalOpen="state.modal.isArchiveDocumentOpen"
                        :message="$t('drive.confirmation.archiveConfirmation') + '?'"
                        @close="state.modal.isArchiveDocumentOpen = false" @confirm="archiveDocument" />
                    <DialogConfirmation :isModalOpen="state.modal.isDeleteDirectoryOpen"
                        :message="$t('drive.confirmation.deleteFolderConfirmation') + '?'"
                        @close="state.modal.isDeleteDirectoryOpen = false" @confirm="deleteDocument" />
                    <DialogConfirmation :isModalOpen="state.modal.isDeleteFileOpen"
                        :message="$t('drive.confirmation.deleteFileConfirmation') + '?'"
                        @close="state.modal.isDeleteFileOpen = false" @confirm="deleteDocument" />
                    <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen"
                        :title="$t('drive.upgradeStorage')"
                        :message="state.error?.message + ' ' + $t('drive.confirmation.upgradeStorageConfirmation') + '?'"
                        @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
                    <ModulesUserDocumentDocsFileModalNew :isModalOpen="state.modal.isCreateDocumentFileOpen"
                        @close="state.modal.isCreateDocumentFileOpen = false" @refreshDocuments="fetchDocuments" />
                    <ModulesUserDocumentDocsFileModalEditLayoutWarning
                        :isModalOpen="state.modal.isEditDocumentFileWarningOpen"
                        :selectedDocument="state.selectedDocument"
                        @close="state.modal.isEditDocumentFileWarningOpen = false" @refreshDocuments="fetchDocuments" />
                    <ModulesUserDocumentDocsFileModalPreview :isModalOpen="state.modal.isViewDocumentOpen"
                        :selectedDocument="state.selectedDocument" @close="state.modal.isViewDocumentOpen = false" />
                    <DialogConfirmation :isModalOpen="state.modal.isDownloadDialogConfirmationOpen"
                        :message="$t('drive.confirmation.downloadWithCompanyLogoConfirmation') + '?'"
                        @close="cancelCompanyLogoDownload" @confirm="confirmCompanyLogoDownload" />
                    <ModulesUserDocumentModalNewGoogleDriveDirectory
                        :isModalOpen="state.modal.isCreateGoogleDriveFolderOpen"
                        :parentFolderId="state.googleDriveFolderId || undefined"
                        @close="state.modal.isCreateGoogleDriveFolderOpen = false"
                        @folderCreated="() => fetchGoogleDriveFiles(state.googleDriveFolderId)" />
                    <ModulesUserDocumentModalEditGoogleDriveDocument
                        :isModalOpen="state.modal.isEditGoogleDriveDocumentOpen"
                        :selectedDocument="state.selectedDocument" :parentFolderId="state.googleDriveFolderId"
                        @close="state.modal.isEditGoogleDriveDocumentOpen = false"
                        @refreshDocuments="fetchGoogleDriveFiles" />
                    <ModulesUserDocumentModalMoveGoogleDriveFile :isModalOpen="state.modal.isMoveGoogleDriveFileOpen"
                        :selectedDocument="state.selectedDocument" :parentFolderId="state.googleDriveFolderId"
                        @close="state.modal.isMoveGoogleDriveFileOpen = false"
                        @refreshDocuments="fetchGoogleDriveFiles" />
                    <ModulesUserDocumentStatusTemplateModalNew :isModalOpen="state.modal.isCreateTemplateOpen"
                        :variant="state.viewMode"
                        :parentFolderId="state.viewMode === 'google-drive' ? state.googleDriveFolderId : undefined"
                        @close="state.modal.isCreateTemplateOpen = false" />
                    <DialogConfirmation :isModalOpen="state.modal.isActiveGoogleDriveOpen"
                        :title="$t('drive.googleDrive')"
                        :message="$t('drive.googleDriveNotActivatedMessage') || 'Google Drive is not activated. Activate now?'"
                        @close="state.modal.isActiveGoogleDriveOpen = false" @confirm="navigateToApps" />
                    <DialogConfirmation :isModalOpen="state.modal.isDeleteGoogleDriveFileOpen"
                        :message="$t('drive.confirmation.deleteFileConfirmation') + '?'"
                        @close="state.modal.isDeleteGoogleDriveFileOpen = false" @confirm="deleteGoogleDriveFile" />
                    <ModulesUserDocumentModalDocumentInfo :isModalOpen="state.modal.isDriveInfoOpen"
                        :variant="state.viewMode === 'google-drive' ? 'drive-google' : 'drive-local'"
                        @close="state.modal.isDriveInfoOpen = false" />
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
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
    folderStack: [] as string[],
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
        isActiveGoogleDriveOpen: false,
        isCreateTemplateOpen: false,
        isCreateDocumentFileOpen: false,
        isCreateGoogleDriveFolderOpen: false,
        isDeleteDirectoryOpen: false,
        isDeleteFileOpen: false,
        isDeleteGoogleDriveFileOpen: false,
        isEditDocumentOpen: false,
        isEditDocumentFileOpen: false,
        isEditDocumentFileWarningOpen: false,
        isEditGoogleDriveDocumentOpen: false,
        isMoveFileOpen: false,
        isMoveGoogleDriveFileOpen: false,
        isUpgradeStorageOpen: false,
        isUploadFileOpen: false,
        isViewAccessOpen: false,
        isViewFolderStructureOpen: false,
        isViewDocumentOpen: false,
        isDownloadDialogConfirmationOpen: false,
        isDriveInfoOpen: false,
    },
    selectedDocument: {} as any,
    previewDocumentData: null as ArrayBuffer | null,
    docsFields: {
        name: '',
        content: ''
    },
    isEditMode: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    isCompanyLogoIncluded: false,
    isAlreadyDownlaoding: false,
    googleDriveConnected: false,
})

onMounted(() => {
    fetchDocuments()
    initDriveView()
})

async function initDriveView() {
    state.isPageLoading = true
    try {
        const status = await googledriveService.getGoogleDriveStatus()
        // Expecting status to indicate connection; accept several shapes
        const connected = !!(status?.connected || status?.is_connected || status === true || status?.data?.connected)
        state.googleDriveConnected = connected
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

            if (connected) {
                // only switch to google-drive when actually connected
                state.viewMode = 'google-drive'
                state.googleDriveFolderId = null
                state.googleDriveFolderStack = []
                await fetchGoogleDriveFiles()
            } else {
                // keep local view and prompt activation
                state.modal.isActiveGoogleDriveOpen = true
                state.googleDriveFiles = { data: [], current_page: 1, per_page: 0, total: 0 }
            }
        } catch (error: any) {
            state.googleDriveConnected = false
            // on error keep local view and prompt activation
            state.modal.isActiveGoogleDriveOpen = true
            state.googleDriveFiles = { data: [], current_page: 1, per_page: 0, total: 0 }
        } finally {
            state.isPageLoading = false
        }
    } else {
        state.viewMode = 'local'
        fetchDocuments()
    }
}

async function navigateToApps() {
    state.modal.isActiveGoogleDriveOpen = false
    await navigateTo('/apps')
}

async function openGoogleDriveFile(file: any) {
    if (file?.file_url) {
        await navigateToExternalLink(file.file_url)
    }
}

async function uploadToGoogleDrive() {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.multiple = true
    fileInput.onchange = async (e: any) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        state.isPageLoading = true
        try {
            for (const file of files) {
                await googledriveService.uploadFileToGoogleDrive(file, state.googleDriveFolderId || undefined)
            }

            successAlert(`${t('alert.success')}!`, 'File uploaded to Google Drive')
            await fetchGoogleDriveFiles(state.googleDriveFolderId)
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
        await fetchGoogleDriveFiles(state.googleDriveFolderId)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchGoogleDriveFiles(parentFolderId: string | null = null, search: String | undefined = undefined) {
    state.error = {}
    state.isTableLoading = true
    try {
        state.googleDriveFolderId = parentFolderId
        const response = await googledriveService.getGoogleDriveFiles(parentFolderId || undefined, search)
        let files = Array.isArray(response)
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
    // Always push current folder id (can be null for root) so the back button shows
    state.googleDriveFolderStack.push(state.googleDriveFolderId)
    fetchGoogleDriveFiles(document.id)
}

function goBackGoogleDriveFolder() {
    const previousFolderId = state.googleDriveFolderStack.pop() || null
    fetchGoogleDriveFiles(previousFolderId)
}

function goBackLocalFolder() {
    const previousFolder = state.folderStack.pop() || null
    if (previousFolder) {
        navigateTo(`/drive?folder_uuid=${previousFolder}`)
    } else {
        navigateTo(`/drive`)
    }
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
    const searchValue = Array.isArray(value) ? value[0] ?? '' : value ?? ''
    state.dataFilter.search = searchValue?.[0] == '' ? [] : value

    if (state.viewMode === 'google-drive') {
        fetchGoogleDriveFiles(state.googleDriveFolderId, state.dataFilter.search || undefined)
    } else {
        fetchDocuments()
    }
}

function viewDownloadDocument(document: any) {
    const extension = document.file_url.split('.').pop().toLowerCase()
    if (['docx', 'pages'].includes(extension)) {
        state.selectedDocument = document
        state.modal.isViewDocumentOpen = true
    } else {
        downloadFile(document)
    }
}

function openDownloadDocumentPdfDialog(document: any) {
    state.selectedDocument = document
    state.modal.isDownloadDialogConfirmationOpen = true
}

function cancelCompanyLogoDownload() {
    state.modal.isDownloadDialogConfirmationOpen = false
    state.isCompanyLogoIncluded = false

    if (!state.isAlreadyDownlaoding) {
        downloadDocumentPdf(state.selectedDocument)
    }
}

function confirmCompanyLogoDownload() {
    state.modal.isDownloadDialogConfirmationOpen = false
    state.isCompanyLogoIncluded = true

    downloadDocumentPdf(state.selectedDocument)
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

async function downloadDocumentPdf(document: any) {
    state.error = {}
    state.isTableLoading = true
    state.isAlreadyDownlaoding = true
    try {
        const params = {
            is_company_logo_included: state.isCompanyLogoIncluded,
        }
        const response = await documentService.downloadPdf(document?.uuid, params)
        if (response) {
            saveAs(response, state.selectedDocument.name.split('.')[0] + '.pdf')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
    state.isCompanyLogoIncluded = false
    state.isAlreadyDownlaoding = false
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
    const current = router?.currentRoute?.value?.query?.folder_uuid
    if (current) {
        state.folderStack.push(current as string)
    }
    await navigateTo(`/drive?folder_uuid=${document.uuid}`)
}

function editDocument(document: any) {
    state.selectedDocument = document
    if (state.viewMode === 'google-drive') {
        state.modal.isEditGoogleDriveDocumentOpen = true
    } else {
        const ext = document.file_url?.split('.').pop()?.toLowerCase()
        if (['html', 'htm', 'docx'].includes(ext)) {
            state.modal.isEditDocumentFileWarningOpen = true
        } else {
            state.modal.isEditDocumentOpen = true
        }
    }
}

async function confirmOpenEditDocFile() {
    state.modal.isEditDocumentFileWarningOpen = false
    await nextTick()
    state.modal.isEditDocumentFileOpen = true
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
            const currentFolder = router?.currentRoute?.value?.query?.folder_uuid || undefined
            fetchDocuments(currentFolder)
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