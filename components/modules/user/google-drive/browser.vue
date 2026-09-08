<template>
    <div class="space-y-4">
        <LoadingSpinner :isActive="state.isPageLoading">
            <div v-if="!state.isConnected" class="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Icon name="mdi:google-drive" class="size-10 text-gray-300" aria-hidden="true" />
                <p class="text-sm font-medium text-gray-500">{{ $t('drive.googleDriveNotActivatedMessage') }}</p>
                <FormButton buttonStyle="action" @click="connectGoogleDrive">
                    <Icon name="mdi:google-drive" class="h-4 w-4" aria-hidden="true" />
                    Google Drive
                </FormButton>
            </div>

            <div v-else class="space-y-4">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="flex flex-col md:flex-row justify-between gap-3">
                    <TableSearch @search="handleSearch" class="flex-1" />
                    <div class="flex flex-wrap items-center justify-end gap-3">
                        <FormButton buttonStyle="action" @click="state.modal.isCreateFolderOpen = true">
                            <Icon name="ph:folder" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('drive.createNewFolder') }}
                        </FormButton>
                        <FormButton buttonStyle="success" @click="uploadFile">
                            <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('drive.uploadFile') }}
                        </FormButton>
                    </div>
                </div>

                <div class="table-responsive">
                    <div class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                        @click="goBackFolder" v-if="state.folderStack.length">
                        <Icon name="ph:arrow-left" size="16" class="text-black" />
                        <span class="text-sm">{{ $t('back') }}</span>
                    </div>

                    <Table :columnHeaders="state.columnHeaders" :data="state.files" :isLoading="state.isTableLoading"
                        :sortData="state.sortData" emptyIcon="ph:folder-notch-open">
                        <template #body v-if="!(state.isTableLoading || state.files?.data?.length === 0)">
                            <tr v-for="(document, index) in state.files.data" :key="index">
                                <td width="30%">
                                    <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                        v-if="document?.type === 'file'" @click="openFile(document)">
                                        <Icon name="ph:file" class="size-6" />
                                        <span class="truncate">{{ document?.name }}</span>
                                    </div>
                                    <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                        v-else @click="viewDirectory(document)">
                                        <Icon name="ph:folder-notch-open-light" class="size-6" />
                                        <span class="truncate">{{ document?.name }}</span>
                                    </div>
                                </td>
                                <td width="25%">
                                    <span class="truncate">{{ formatDateTimeToReadable(document?.created_at) }}</span>
                                </td>
                                <td width="25%">
                                    <span class="truncate">{{ document?.updated_at && formatDateTimeToReadable(document?.updated_at) }}</span>
                                </td>
                                <td width="20%">
                                    <div class="flex items-end justify-end gap-2">
                                        <Tooltip :text="$t('drive.table.actions.view')" v-if="document?.type === 'folder'">
                                            <FormButton :aria-label="$t('drive.table.actions.view')" type="button"
                                                buttonStyle="action" @click="viewDirectory(document)">
                                                <Icon name="ph:eye" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('drive.table.actions.move')">
                                            <FormButton :aria-label="$t('drive.table.actions.move')" type="button"
                                                buttonStyle="action" @click="openMoveModal(document)">
                                                <Icon name="ph:arrows-out" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('drive.table.actions.edit')">
                                            <FormButton :aria-label="$t('drive.table.actions.edit')" type="button"
                                                buttonStyle="action" @click="openEditModal(document)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('drive.table.actions.delete')">
                                            <FormButton :aria-label="$t('drive.table.actions.delete')" type="button"
                                                buttonStyle="danger" @click="openDeleteModal(document)">
                                                <Icon name="ph:trash" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
            </div>
        </LoadingSpinner>

        <ModulesUserDocumentModalNewGoogleDriveDirectory :isModalOpen="state.modal.isCreateFolderOpen"
            :parentFolderId="state.folderId || undefined" @close="state.modal.isCreateFolderOpen = false"
            @folderCreated="() => fetchFiles(state.folderId)" />
        <ModulesUserDocumentModalEditGoogleDriveDocument :isModalOpen="state.modal.isEditOpen"
            :selectedDocument="state.selectedDocument" :parentFolderId="state.folderId || undefined"
            @close="state.modal.isEditOpen = false" @refreshDocuments="fetchFiles" />
        <ModulesUserDocumentModalMoveGoogleDriveFile :isModalOpen="state.modal.isMoveOpen"
            :selectedDocument="state.selectedDocument" :parentFolderId="state.folderId"
            @close="state.modal.isMoveOpen = false" @refreshDocuments="fetchFiles" />
        <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
            :message="$t('drive.confirmation.deleteFileConfirmation') + '?'" @close="state.modal.isDeleteOpen = false"
            @confirm="deleteFile" />
    </div>
</template>

<script setup lang="ts">
import { googledriveService } from '@/components/api/user/GoogleDriveService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    isConnected: false,
    isPageLoading: false,
    isTableLoading: false,
    error: {} as Error,
    folderId: null as string | null,
    folderStack: [] as string[],
    search: '',
    files: { data: [], current_page: 1, per_page: 0, total: 0 } as any,
    selectedDocument: {} as any,
    columnHeaders: [
        { name: 'drive.table.name', isTranslateName: true, key: 'name' },
        { name: 'drive.table.dateCreated', isTranslateName: true, key: 'created_at' },
        { name: 'drive.table.lastModified', isTranslateName: true, key: 'updated_at' },
        { name: '' },
    ],
    sortData: {
        sortField: 'name',
        sortOrder: 'descend',
    },
    modal: {
        isCreateFolderOpen: false,
        isEditOpen: false,
        isMoveOpen: false,
        isDeleteOpen: false,
    },
})

onMounted(() => {
    checkStatus()
})

async function checkStatus() {
    state.isPageLoading = true
    try {
        const status = await googledriveService.getGoogleDriveStatus()
        state.isConnected = !!(status?.connected || status?.is_connected || status === true || status?.data?.connected)
        if (state.isConnected) {
            await fetchFiles()
        }
    } catch (error: any) {
        state.isConnected = false
    }
    state.isPageLoading = false
}

async function connectGoogleDrive() {
    try {
        const response = await googledriveService.getGoogleDriveAuthUrl()
        const authUrl = response?.authUrl || response?.auth_url
        if (!authUrl) return
        window.open(authUrl, 'Google Drive Authentication', 'width=500,height=600')
        const handleAuthComplete = (event: MessageEvent) => {
            if (event.data?.type === 'google-drive-auth-complete') {
                window.removeEventListener('message', handleAuthComplete)
                checkStatus()
            }
        }
        window.addEventListener('message', handleAuthComplete)
    } catch (error: any) {
        state.error = error
    }
}

async function fetchFiles(parentFolderId: string | null = null, search: string | undefined = undefined) {
    state.error = {}
    state.isTableLoading = true
    try {
        state.folderId = parentFolderId
        const response = await googledriveService.getGoogleDriveFiles(parentFolderId || undefined, search)
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

        const transformedFiles = files.map((file: any) => ({
            id: file.id,
            name: file.name,
            file_url: file.webViewLink || file.webContentLink,
            created_at: file.createdTime,
            updated_at: file.modifiedTime,
            type: file.mimeType?.includes('folder') ? 'folder' : 'file',
        }))
        state.files = {
            data: transformedFiles,
            current_page: 1,
            per_page: transformedFiles.length,
            total: transformedFiles.length,
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function viewDirectory(document: any) {
    if (document?.type !== 'folder') return
    state.folderStack.push(state.folderId ?? '')
    fetchFiles(document.id)
}

function goBackFolder() {
    const previousFolderId = state.folderStack.pop() || null
    fetchFiles(previousFolderId)
}

function handleSearch(value: any) {
    const searchValue = Array.isArray(value) ? value[0] ?? '' : value ?? ''
    state.search = searchValue
    fetchFiles(state.folderId, state.search || undefined)
}

async function openFile(file: any) {
    if (file?.file_url) {
        await navigateTo(file.file_url, { external: true, open: { target: '_blank' } })
    }
}

function uploadFile() {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.multiple = true
    fileInput.onchange = async (e: any) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        state.isPageLoading = true
        try {
            for (const file of files) {
                await googledriveService.uploadFileToGoogleDrive(file, state.folderId || undefined)
            }
            successAlert(`${t('alert.success')}!`, t('drive.uploadFile'))
            await fetchFiles(state.folderId)
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
    fileInput.click()
}

function openEditModal(document: any) {
    state.selectedDocument = document
    state.modal.isEditOpen = true
}

function openMoveModal(document: any) {
    state.selectedDocument = document
    state.modal.isMoveOpen = true
}

function openDeleteModal(document: any) {
    state.selectedDocument = document
    state.modal.isDeleteOpen = true
}

async function deleteFile() {
    state.error = {}
    state.isPageLoading = true
    try {
        await googledriveService.deleteGoogleDriveFile(state.selectedDocument.id)
        successAlert(`${t('alert.success')}!`, t('drive.confirmation.deleteFileConfirmation'))
        state.modal.isDeleteOpen = false
        await fetchFiles(state.folderId)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
