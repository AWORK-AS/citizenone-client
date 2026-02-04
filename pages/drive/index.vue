<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('drive.companyDocuments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('drive.companyDocuments') }}</template>
            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-5">
                    <div class="mt-8 flex flex-col md:flex-row justify-between gap-3">
                        <div class="flex items-center justify-end md:justify-start gap-x-3">
                            <FormButton buttonStyle="action" class="rounded-md"
                                @click="navigateToExternalLink('https://drive.google.com/drive/u/0/home')">
                                <Icon name="mdi:google-drive" class="h-4 w-4" aria-hidden="true" />
                                Google Drive
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-md"
                                @click="navigateToExternalLink('https://onedrive.live.com/')">
                                <Icon name="mdi:microsoft-onedrive" class="h-4 w-4" aria-hidden="true" />
                                OneDrive
                            </FormButton>
                        </div>
                        <div class="flex flex-wrap items-center justify-end gap-3">
                            <Menu as="div" class="w-full md:w-fit relative inline-block text-left z-20">
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
                                            <MenuItem v-slot="{ active }" @click="openNewDocumentModal">
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
                            <FormButton buttonStyle="action" class="rounded-md" @click="triggerFileInput">
                                <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('drive.uploadFile') }}
                            </FormButton>
                            <input type="file" ref="documentFile" @change="uploadFile" class="hidden" multiple />
                            <FormButton buttonStyle="action" class="rounded-md"
                                @click="state.modal.isViewFolderStructureOpen = true">
                                <Icon name="ph:folder-notch-open" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('folderStructure.folderStructure') }}
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-md"
                                @click="state.modal.isCreateTemplateOpen = true">
                                <Icon name="ph:file" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('drive.createTemplate.createTemplate') }}
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-md" @click="navigateTo('/drive/expenses')">
                                <Icon name="ph:money" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('drive.expenses') }}
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
                                                {{ document?.updated_at &&
                                                    formatDateTimeToReadable(document?.updated_at) }}
                                            </span>
                                        </td>
                                        <td width="15%">
                                            <div class="flex items-end justify-end gap-2">
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
                                                <Tooltip :text="'Download PDF'"
                                                    v-if="['html', 'htm', 'docx'].includes(document?.file_url?.split('.').pop().toLowerCase())">
                                                    <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                        @click="downloadDocumentPdf(document)">
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
                        </div>
                        <Pagination :data="state.documents" @previous="previous" @next="next" />
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
                    <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen"
                        :title="$t('drive.upgradeStorage')"
                        :message="state.error?.message + ' ' + $t('drive.confirmation.upgradeStorageConfirmation') + '?'"
                        @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
                    <ModulesUserDocumentModalEdit :isOpen="state.modal.isDocumentEditorOpen"
                        :isEditMode="state.isEditMode" :initialName="state.docsFields.name"
                        :initialData="state.docsFields.content" @close="closeDocumentEditor" @save="saveDocument" />
                    <ModulesUserDocumentModalPreview :isModalOpen="state.modal.isViewDocumentOpen"
                        :selectedDocument="state.selectedDocument" @close="state.modal.isViewDocumentOpen = false" />
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useMammothConverter } from '@/composables/useMammothConverter'
import { documentService } from '@/components/api/user/DocumentService'
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
    modal: {
        isAddDirectoryOpen: false,
        isArchiveDocumentOpen: false,
        isCreateTemplateOpen: false,
        isDeleteDirectoryOpen: false,
        isDeleteFileOpen: false,
        isEditDocumentOpen: false,
        isMoveFileOpen: false,
        isUpgradeStorageOpen: false,
        isUploadFileOpen: false,
        isViewAccessOpen: false,
        isViewFolderStructureOpen: false,
        isDocumentEditorOpen: false,
        isViewDocumentOpen: false,
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

function viewDownloadDocument(document: any) {
    const extension = document.file_url.split('.').pop().toLowerCase()
    if (['docx', 'pages'].includes(extension)) {
        state.selectedDocument = document
        state.modal.isViewDocumentOpen = true
    } else {
        downloadFile(document)
    }
}

// async function viewDocument(document: any) {
//     state.isPageLoading = true;
//     try {
//         const response = await documentService.getContent(document.uuid, 'preview');

//         state.previewDocumentData = response;
//         state.selectedDocument = document;
//         state.modal.isViewDocumentOpen = true;
//     } catch (error: any) {
//         state.error = error;
//         console.error('Error loading document for preview:', error);
//     }
//     state.isPageLoading = false;
// }

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
    try {
        const response = await documentService.downloadPdf(document.uuid)
        if (response) {
            saveAs(response, document.name.split('.')[0] + '.pdf')
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

async function editDocument(document: any) {
    const ext = document.file_url.split('.').pop().toLowerCase();
    if (['html', 'htm', 'docx'].includes(ext)) {
        state.isPageLoading = true;
        try {
            const response = await documentService.getContent(document.uuid);

            if (response.type === 'file_data') {
                const { convertDocxToHtml } = useMammothConverter();

                // Decode base64 to ArrayBuffer
                const binaryString = atob(response.file_data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const arrayBuffer = bytes.buffer;

                const htmlContent = await convertDocxToHtml(arrayBuffer);

                state.selectedDocument = document;
                state.docsFields.name = document.name;
                state.docsFields.content = htmlContent;
                state.isEditMode = true;
                state.modal.isDocumentEditorOpen = true;
            } else {
                state.selectedDocument = document;
                state.docsFields.name = document.name;
                state.docsFields.content = response.content || '';
                state.isEditMode = true;
                state.modal.isDocumentEditorOpen = true;
            }
        } catch (error: any) {
            state.error = error;
            console.error(error);
        }
        state.isPageLoading = false;
    } else {
        state.selectedDocument = document
        state.modal.isEditDocumentOpen = true
    }
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

function openNewDocumentModal() {
    state.selectedDocument = {}
    state.docsFields.name = ''
    state.docsFields.content = ''
    state.isEditMode = false
    state.modal.isDocumentEditorOpen = true
}

function closeDocumentEditor() {
    state.modal.isDocumentEditorOpen = false
}

async function saveDocument(payload: any) {
    state.modal.isDocumentEditorOpen = false
    state.isPageLoading = true;
    try {
        if (state.isEditMode && state.selectedDocument?.uuid) {
            await documentService.saveContent(state.selectedDocument.uuid, {
                content: payload.content,
                name: payload.name
            });
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyUpdated')}.`);
        } else {
            // Creating a new document
            const blob = new Blob([payload.content], { type: 'text/html' });
            const file = new File([blob], payload.name.endsWith('.html') ? payload.name : payload.name + '.html', { type: 'text/html' });
            console.log(file)
            const formData = new FormData();
            formData.append('files[]', file);
            if (router?.currentRoute?.value?.query?.folder_uuid) {
                formData.append('folder_uuid', router.currentRoute.value.query.folder_uuid as string);
            }
            formData.append('type', 'file')
            formData.append('is_admin_access', '0');
            formData.append('name', payload.name)

            await documentService.saveFileFolder(formData);
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyAdded')}.`);
        }

        fetchDocuments();

    } catch (error: any) {
        state.error = error;
    }
    state.isPageLoading = false;
}

</script>