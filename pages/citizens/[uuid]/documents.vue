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
            <template #new-feature>
                <Tooltip :text="$t('features.seeNewFeatures')" position="left">
                    <Icon name="ph:question" class="h-6 w-6 cursor-pointer" aria-hidden="true"
                        @click="state.modal.isViewNewFeaturesOpen = true" />
                </Tooltip>
            </template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div class="flex">
                    <div v-if="showDraftButton" class="mt-8 flex justify-start items-center gap-x-3">
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="viewDirectory(selectedDocument, true)">
                            <Icon name="ph:file" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.documents.viewDraftFile') }}
                        </FormButton>
                    </div>
                    <div class="mt-8 ml-auto flex justify-end items-center gap-x-3">
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
                            <input type="file" ref="documentFile" @change="uploadFile" class="hidden" multiple />
                        </LoadingSpinner>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isViewFolderStructureOpen = true">
                            <Icon name="ph:folder-notch-open" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('folderStructure.folderStructure') }}
                        </FormButton>
                        <FormButton buttonStyle="action" class="rounded-md"
                            @click="state.modal.isCreateTemplateOpen = true">
                            <Icon name="ph:file" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.documents.createTemplate.createReport') }}
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
                                        <div class="flex items-end justify-end gap-2">
                                            <Tooltip :text="$t('citizens.documents.table.actions.view')">
                                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                                    @click="viewDirectory(document)" v-if="document?.type === 'folder'">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="document?.is_shared ? $t('citizens.documents.table.actions.unshare') :
                                                $t('citizens.documents.table.actions.share')"
                                                v-if="document?.type === 'file' && !is_draft">
                                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                                    @click="confirmDocumentShareUnshare(document)">
                                                    <Icon name="ph:share" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.move')"
                                                v-if="document?.type === 'file' && !is_draft">
                                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                                    @click="moveFileConfirmation(document)">
                                                    <Icon name="ph:arrows-out" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                                    @click="editDocument(document)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.access')"
                                                v-if="isAdmin(userStore.getUser?.roles) && !is_draft">
                                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                                    @click="viewDocumentAccess(document)">
                                                    <Icon name="ph:lock" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.archive')"
                                                v-if="!is_draft">
                                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                                    @click="confirmDocumentArchiving(document)">
                                                    <Icon name="ph:archive-light" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.delete')"
                                                v-if="document?.type === 'folder'">
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="deleteDirectoryConfirmation(document)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.documents.table.actions.delete')" v-else>
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
                <ModulesUserCitizenDocumentModalNewFeatures :isModalOpen="state.modal.isViewNewFeaturesOpen"
                    @close="state.modal.isViewNewFeaturesOpen = false" />
                <ModulesUserCitizenDocumentModalNewDirectory :isModalOpen="state.modal.isAddDirectoryOpen"
                    @close="state.modal.isAddDirectoryOpen = false" @refreshDocuments="fetchDocuments" />
                <ModulesUserCitizenDocumentModalEditDocument :isModalOpen="state.modal.isEditDocumentOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isEditDocumentOpen = false"
                    @refreshDocuments="fetchDocuments" />
                <ModulesUserCitizenDocumentStatusTemplateModalEdit :is-modal-open="state.modal.isEditDocumentDraftOpen"
                    :selectedDocument="state.selectedDocument" @close="state.modal.isEditDocumentDraftOpen = false" 
                    @refreshDocuments="fetchDocuments"/>
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
import { useUserStore } from '@/store/user'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const router = useRouter()
const route = useRoute()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const documentFile = ref(null) as any
const is_draft = ref(false)
let currentTablePage = 1
const selectedDocument = ref() as any
const breadcrumbLinks = [
    {
        name: 'citizens.tabs.documents',
        translate: true,
        href: `/citizens/${citizenUuid}/documents`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizens.documents.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'citizens.documents.table.owner', isTranslateName: true, },
        { name: 'citizens.documents.table.dateCreated', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'citizens.documents.table.lastModified', isTranslateName: true, sorter: true, key: 'updated_at' },
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
        isEditDocumentDraftOpen: false,
        isMoveFileOpen: false,
        isShareDocumentOpen: false,
        isUpgradeStorageOpen: false,
        isUploadFileOpen: false,
        isViewAccessOpen: false,
        isViewFolderStructureOpen: false,
        isViewNewFeaturesOpen: false,
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

const showDraftButton = computed(() => {
  return (
    route?.path.includes('/citizens/') &&
    route?.path.endsWith('/documents') &&
    !!route?.query.folder_uuid &&
    !route?.query.is_draft
  )
})

const handleRouteChange = () => {
    fetchDocuments()
}

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}

async function fetchDocuments(folderUuid: any = null) {
    state.error = {}
    state.isTableLoading = true
    try {
        const folderUuid = router?.currentRoute?.value?.query?.folder_uuid
        is_draft.value = is_draft.value = router?.currentRoute?.value?.query?.is_draft === 'true'
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
            ...(folderUuid && { folder_uuid: folderUuid }),
        }
        const response = (is_draft.value) ?  await citizenDocumentService.getCitizenFileFoldersDrafts(params) : await citizenDocumentService.getCitizenFileFolders(params) 
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
        const files = event.target.files

        if (!files || files.length === 0) return

        const params = new FormData()

        // Append all files with the same key, e.g., files[]
        for (const file of files) {
            params.append('files[]', file)
        }

        params.append('citizen_uuid', citizenUuid)
        params.append('type', 'file')
        params.append('is_admin_access', 'false')
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

async function viewDirectory(document: any, is_draft: boolean = false) {
  selectedDocument.value = router?.currentRoute?.value?.query?.folder_uuid
  currentTablePage = 1

  const folderUuid = typeof document === 'string' ? document : document?.uuid || selectedDocument.value

  let url = `/citizens/${citizenUuid}/documents?folder_uuid=${folderUuid}`

  if (is_draft) {
    url += `&is_draft=${is_draft}`
  }

  await navigateTo(url)
}


function editDocument(document: any) {
    state.selectedDocument = document
    if(is_draft.value){
        state.modal.isEditDocumentDraftOpen = true
    }else{
        state.modal.isEditDocumentOpen = true
    }
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