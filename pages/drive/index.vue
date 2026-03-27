<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('drive.companyDocuments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>


            <template #header>
                <div class="flex items-center gap-x-2">
                    <span>{{ $t('drive.companyDocuments') }}</span>
                    <span v-if="state.viewMode === 'google-drive'"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Icon name="mdi:google-drive" class="h-4 w-4 mr-1" />
                        Google Drive (active)
                    </span>
                    <span v-else-if="state.viewMode === 'local' && !state.isInsideOneDrive"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-sky-100 text-sky-800">
                        <Icon name="ph:folder-notch-open" class="h-4 w-4 mr-1" />
                        CitizenOne Documents (active)
                    </span>
                    <span v-else-if="state.isInsideOneDrive && state.isOneDriveActivated"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Icon name="mdi:microsoft-onedrive" class="h-4 w-4 mr-1" />
                        OneDrive (active)
                    </span>
                    <button type="button" @click="state.modal.isDriveInfoOpen = true" class="ml-1 flex items-center">
                        <Icon name="ph:question" class="h-5 w-5 text-gray-600 hover:text-gray-800" aria-hidden="true" />
                    </button>
                </div>
            </template>

            <LoadingSpinner :isActive="state.isPageLoading">
           <div class="space-y-5">
            <div class="mt-8 flex flex-col md:flex-row justify-between gap-3">
                <div class="flex items-center justify-end md:justify-start gap-x-3">
                <FormButton buttonStyle="action" class="rounded-md" @click="toggleGoogleDriveView">
                    <Icon v-if="state.viewMode !== 'google-drive'" name="mdi:google-drive" class="h-4 w-4" aria-hidden="true" />
                    {{ state.viewMode === 'google-drive' ? 'CitizenOne Documents' : 'Google Drive' }}
                </FormButton>
                <FormButton buttonStyle="action" class="rounded-md" @click="handleOneDriveButtonClick">
                    <Icon name="mdi:microsoft-onedrive" class="h-4 w-4" aria-hidden="true" />
                    {{ state.isInsideOneDrive ? $t('drive.companyDocuments') : 'OneDrive' }}
                </FormButton>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-3">
                <Menu as="div" class="w-full md:w-fit relative inline-block text-left z-20" v-if="state.viewMode === 'local'">
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
                        <MenuItem v-slot="{ active }" @click="state.modal.isAddDirectoryOpen = true">
                            <button :class="[
                            active && 'bg-gray-100',
                            'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                            ]">
                            <Icon name="ph:folder" class="mr-2 h-4 w-4" aria-hidden="true" />
                            {{ $t('drive.createNewFolder') }}
                            </button>
                        </MenuItem>
                        <MenuItem v-slot="{ active }" @click="state.modal.isCreateDocumentFileOpen = true">
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

                
            

               <!-- Knap til opret ny mappe (Google Drive/OneDrive) fjernet efter ønske -->

                <FormButton buttonStyle="action" class="rounded-md"
                @click="state.viewMode === 'google-drive' ? uploadToGoogleDrive() : state.isInsideOneDrive ? handleOneDriveUpload() : triggerFileInput()"
                v-if="state.viewMode === 'google-drive' || state.isInsideOneDrive || state.viewMode === 'local'">
                <Icon name="ph:upload" class="h-4 w-4" aria-hidden="true" />
                {{ $t('drive.uploadFile') }}
                </FormButton>

                <input type="file" ref="documentFile" @change="uploadFile" class="hidden" multiple v-if="state.viewMode === 'local'" />

                <FormButton buttonStyle="action" class="rounded-md"
                @click="state.modal.isViewFolderStructureOpen = true"
                v-if="!state.isInsideOneDrive && (state.viewMode === 'local' || state.viewMode === 'google-drive')">
                <Icon name="ph:folder-notch-open" class="h-4 w-4" aria-hidden="true" />
                {{ $t('folderStructure.folderStructure') }}
                </FormButton>

                <FormButton buttonStyle="action" class="rounded-md"
                @click="state.modal.isCreateTemplateOpen = true"
                v-if="state.viewMode === 'local' || state.viewMode === 'google-drive' || state.isInsideOneDrive">
                <Icon name="ph:file" class="h-4 w-4" aria-hidden="true" />
                {{ $t('drive.createTemplate.createTemplate') }}
                </FormButton>

                <FormButton buttonStyle="action" class="rounded-md" @click="navigateTo('/drive/expenses')"
                v-if="!state.isInsideOneDrive && (state.viewMode === 'local' || state.viewMode === 'google-drive')">
                <Icon name="ph:money" class="h-4 w-4" aria-hidden="true" />
                {{ $t('drive.expenses') }}
                </FormButton>
               
                </div>
                </div>
                <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex items-center gap-x-2">
                        <TableSearch @search="handleSearch" class="flex-1" />
                        <div v-if="state.isInsideOneDrive" class="flex items-center gap-x-1 text-xs text-gray-500 whitespace-nowrap">
                            <span v-if="state.isOneDriveCacheLoading" class="flex items-center gap-x-1">
                                <Icon name="ph:circle-notch" class="h-3.5 w-3.5 animate-spin text-blue-500" />
                                Henter filer...
                            </span>
                            <span v-else-if="state.isOneDriveCacheReady" class="flex items-center gap-x-1 text-green-600">
                                <Icon name="ph:check-circle" class="h-3.5 w-3.5" />
                                Søgning klar
                            </span>
                            <button
                                v-if="!state.isOneDriveCacheLoading"
                                @click="prefetchOneDriveCache(true)"
                                class="ml-1 p-1 rounded hover:bg-gray-100"
                                title="Opdater søgecache"
                            >
                                <Icon name="ph:arrows-clockwise" class="h-3.5 w-3.5 text-gray-500" />
                            </button>
                        </div>
                    </div>
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
                        <div
                            class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                            @click="goBackOneDriveFolder"
                            v-if="state.isInsideOneDrive && (state.oneDriveFolderStack.length > 0 || state.dataFilter.search)"
                        >
                            <Icon name="ph:arrow-left" size="16" class="text-black" />
                            <span class="text-sm">{{ $t('back') }}</span>
                        </div>
                        <div v-if="state.isPageLoading" class="w-full flex justify-center items-center py-10">
                            <LoadingSpinner :isActive="true" />
                        </div>
                        <Table v-else :columnHeaders="state.columnHeaders"
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
                                        <div v-else-if="state.isInsideOneDrive">
                                            <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                                v-if="document?.type === 'file'" @click="viewDownloadDocument(document)">
                                                <Icon name="ph:file" class="size-6" />
                                                <Tooltip :text="$t('drive.form.forAdministratorsOnly')"
                                                    class="flex items-center" v-if="document?.is_admin_access">
                                                    <Icon name="ph:lock-key-fill" class="w-5 h-5 text-red-700" />
                                                </Tooltip>
                                                <span class="truncate">{{ document?.name }}</span>
                                            </div>
                                            <div class="text-black flex items-center gap-x-1" v-else-if="document?.type === 'folder'">
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
                                            <!-- OneDrive: Move always first -->
                                            <Tooltip :text="$t('drive.table.actions.move')"
                                                v-if="document?.is_onedrive && (document?.type === 'file' || document?.type === 'folder')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="moveFileConfirmation(document)">
                                                    <Icon name="ph:arrows-out" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <!-- OneDrive: Folder View -->
                                            <Tooltip :text="$t('drive.table.actions.view')"
                                                v-if="document?.type === 'folder' && state.isInsideOneDrive">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewOneDriveDirectory(document)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <!-- Local files: Full actions -->
                                            <Tooltip :text="$t('drive.table.actions.view')"
                                                v-else-if="document?.type === 'folder'">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewDirectory(document)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.downloadPDF')"
                                                v-if="document.type === 'file' && (state.isInsideOneDrive || state.viewMode === 'local')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="openDownloadDocumentPdfDialog(document)">
                                                    <Icon name="ph:file-pdf" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.edit')">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editDocument(document)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.access')"
                                                v-if="isAdmin(userStore.getUser?.roles) && !state.isInsideOneDrive">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="viewDocumentAccess(document)">
                                                    <Icon name="ph:lock" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('drive.table.actions.archive')" v-if="!state.isInsideOneDrive">
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




                <!-- Unified modal block for all modes (local, Google Drive, OneDrive) -->
                <ModulesUserDocumentModalNewDirectory
                    :isModalOpen="state.modal.isAddDirectoryOpen"
                    :isOneDrive="state.isInsideOneDrive"
                    @close="state.modal.isAddDirectoryOpen = false"
                    @refreshDocuments="handleRefreshDocuments"
                />
                <ModulesUserDocumentModalEditDocument
                    :isModalOpen="state.modal.isEditDocumentOpen && state.selectedDocument?.type === 'folder'"
                    :selectedDocument="state.selectedDocument"
                    @close="state.modal.isEditDocumentOpen = false"
                    @refreshDocuments="handleRenameRefresh"
                />
                <ModulesUserDocumentDocsFileModalEdit
                    :isModalOpen="state.modal.isEditDocumentOpen && state.selectedDocument?.type === 'file'"
                    :selectedDocument="state.selectedDocument"
                    @close="state.modal.isEditDocumentOpen = false"
                    @refreshDocuments="handleRefreshDocuments"
                    @submitForm="saveOneDriveFileContent"
                />
                <ModulesUserDocumentAccessModalView
                    :isModalOpen="state.modal.isViewAccessOpen"
                    :selectedDocument="state.selectedDocument"
                    @close="state.modal.isViewAccessOpen = false"
                />
                <ModulesUserDocumentModalMoveFile
                    :isModalOpen="state.modal.isMoveFileOpen"
                    :selectedDocument="state.selectedDocument"
                    :onedriveFolders="state.isInsideOneDrive ? state.onedriveFolders : []"
                    :companyFolders="!state.isInsideOneDrive ? state.documents.data.filter((d: any) => d.type === 'folder') : []"
                    @close="state.modal.isMoveFileOpen = false"
                    @refreshDocuments="handleRefreshDocuments"
                    @moveOneDriveFile="handleMoveOneDriveFile"
                />
                <ModulesUserDocumentFolderStructureModalFolderStructures
                    :isModalOpen="state.modal.isViewFolderStructureOpen"
                    @close="state.modal.isViewFolderStructureOpen = false"
                />

                <!-- OneDrive mappestruktur modal -->
                <Modal size="xl" title="OneDrive mappestruktur" :show="state.modal.isOneDriveFolderStructureOpen" @close="state.modal.isOneDriveFolderStructureOpen = false">
                    <template #modal-body>
                        <div v-if="!state.isOneDriveCacheReady" class="flex items-center gap-x-2 py-6 justify-center text-gray-500">
                            <Icon name="ph:circle-notch" class="h-5 w-5 animate-spin text-blue-500" />
                            <span>Henter filer...</span>
                        </div>
                        <div v-else>
                            <input
                                type="text"
                                v-model="oneDriveFolderSearch"
                                placeholder="Søg i mapper..."
                                class="w-full mb-4 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <div class="max-h-96 overflow-y-auto space-y-1">
                                <div
                                    v-for="folder in filteredOneDriveFolders"
                                    :key="folder.uuid"
                                    @click="navigateToOneDriveFolder(folder)"
                                    class="flex items-center gap-x-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                                >
                                    <Icon name="ph:folder" class="h-5 w-5 text-blue-400 shrink-0" />
                                    <div class="min-w-0">
                                        <div class="text-sm font-medium truncate">{{ folder.name }}</div>
                                        <div v-if="folder.parentPath" class="text-xs text-gray-400 truncate">{{ folder.parentPath }}</div>
                                    </div>
                                </div>
                                <div v-if="filteredOneDriveFolders.length === 0" class="text-center text-gray-400 text-sm py-6">
                                    Ingen mapper fundet
                                </div>
                            </div>
                        </div>
                    </template>
                </Modal>


                <!-- Unified dialog/modal block for all modes (local, Google Drive, OneDrive) -->
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
                <ModulesUserDocumentDocsFileModalNew
                    :isModalOpen="state.modal.isCreateDocumentFileOpen"
                    :isOneDrive="state.isInsideOneDrive"
                    @close="state.modal.isCreateDocumentFileOpen = false"
                    @refreshDocuments="handleRefreshDocuments"
                />
                <ModulesUserDocumentDocsFileModalEditLayoutWarning
                    :isModalOpen="state.modal.isEditDocumentFileWarningOpen"
                    :selectedDocument="state.selectedDocument"
                    @close="state.modal.isEditDocumentFileWarningOpen = false"
                    @refreshDocuments="handleRefreshDocuments"
                />
                <ModulesUserDocumentDocsFileModalPreview
                    :isModalOpen="state.modal.isViewDocumentOpen"
                    :selectedDocument="state.selectedDocument"
                    @close="state.modal.isViewDocumentOpen = false"
                />
                <DialogConfirmation
                    :isModalOpen="state.modal.isDownloadDialogConfirmationOpen"
                    :message="$t('drive.confirmation.downloadWithCompanyLogoConfirmation') + '?'"
                    @close="cancelCompanyLogoDownload" @confirm="confirmCompanyLogoDownload"
                />
                <ModulesUserDocumentModalNewGoogleDriveDirectory
                    :isModalOpen="state.modal.isCreateGoogleDriveFolderOpen"
                    :parentFolderId="state.googleDriveFolderId || undefined"
                    @close="state.modal.isCreateGoogleDriveFolderOpen = false"
                    @folderCreated="() => fetchGoogleDriveFiles(state.googleDriveFolderId)"
                />
                <ModulesUserDocumentModalEditGoogleDriveDocument
                    :isModalOpen="state.modal.isEditGoogleDriveDocumentOpen"
                    :selectedDocument="state.selectedDocument"
                    :parentFolderId="state.googleDriveFolderId || undefined"
                    @close="state.modal.isEditGoogleDriveDocumentOpen = false"
                    @refreshDocuments="fetchGoogleDriveFiles"
                />
                <ModulesUserDocumentModalMoveGoogleDriveFile
                    :isModalOpen="state.modal.isMoveGoogleDriveFileOpen"
                    :selectedDocument="state.selectedDocument"
                    :parentFolderId="state.googleDriveFolderId"
                    @close="state.modal.isMoveGoogleDriveFileOpen = false"
                    @refreshDocuments="fetchGoogleDriveFiles"
                />
                <ModulesUserDocumentStatusTemplateModalNew
                    :isModalOpen="state.modal.isCreateTemplateOpen"
                    :variant="state.isInsideOneDrive ? 'onedrive' : state.viewMode"
                    :parentFolderId="state.viewMode === 'google-drive' ? (state.googleDriveFolderId || undefined) : undefined"
                    :onedriveFolders="oneDriveFoldersForModal"
                    @close="state.modal.isCreateTemplateOpen = false"
                />
                <DialogConfirmation
                    :isModalOpen="state.modal.isActiveGoogleDriveOpen"
                    :title="$t('drive.googleDrive')"
                    :message="$t('drive.googleDriveNotActivatedMessage') || 'Google Drive is not activated. Activate now?'"
                    @close="state.modal.isActiveGoogleDriveOpen = false" @confirm="navigateToApps"
                />
                <DialogConfirmation
                    :isModalOpen="state.modal.isDeleteGoogleDriveFileOpen"
                    :message="$t('drive.confirmation.deleteFileConfirmation') + '?'"
                    @close="state.modal.isDeleteGoogleDriveFileOpen = false" @confirm="deleteGoogleDriveFile"
                />
                <ModulesUserDocumentModalDocumentInfo
                    :isModalOpen="state.modal.isDriveInfoOpen"
                    :variant="state.isInsideOneDrive ? 'drive-onedrive' : state.viewMode === 'google-drive' ? 'drive-google' : 'drive-local'"
                    @close="state.modal.isDriveInfoOpen = false"
                />

                
                    </div>
                </LoadingSpinner>
            </NuxtLayout>
        </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { documentService } from '@/components/api/user/DocumentService'
<<<<<<< Updated upstream
import { googledriveService } from '@/components/api/user/GoogleDriveService'
=======
>>>>>>> Stashed changes
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'
import OneDriveService from '@/components/api/oneDrive/OneDriveService'
import { useOneDriveCache } from '@/composables/useOneDriveCache'
const oneDriveService = new OneDriveService()
const runtimeConfig = useRuntimeConfig()

async function handleOneDriveUpload() {
    try {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.onchange = async (e: any) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            state.isPageLoading = true;
            let allSuccess = true;
            let errorMessages: string[] = [];
            const folderId = (router?.currentRoute?.value?.query?.onedrive_folder_id as string) || 'root';
            for (const file of files) {
                const allowedExts = ['docx', 'txt', 'pdf', 'html'];
                const ext = file.name.split('.').pop()?.toLowerCase();
                if (!allowedExts.includes(ext || '')) {
                    allSuccess = false;
                    errorMessages.push('Du kan kun uploade .docx, .txt, .pdf eller .html filer til OneDrive.');
                    continue;
                }
                try {
                    const response: any = await oneDriveService.uploadFile(folderId, file);
                    if (response?.error) {
                        allSuccess = false;
                        errorMessages.push(response.error);
                    }
                } catch (err: any) {
                    allSuccess = false;
                    const backendError = err?.response?._data?.error || err?.data?.error;
                    errorMessages.push(backendError || err?.message || 'Fejl ved upload');
                }
            }
            if (allSuccess) {
                successAlert(`${t('alert.success')}!`, 'Fil(er) uploadet til OneDrive.');
            } else {
                errorAlert('Fejl!', errorMessages.join('\n'));
            }
            await fetchOneDriveFiles();
            state.isPageLoading = false;
        };
        fileInput.click();
    } catch (error: any) {
        errorAlert('Fejl!', error?.message || 'Kunne ikke uploade fil til OneDrive.');
        state.isPageLoading = false;
    }
}

const oneDriveButtonText = computed(() => {
    return state.isInsideOneDrive ? 'Virksomhedsdokumenter' : 'OneDrive';
});


async function handleOneDriveButtonClick() {
    if (state.isInsideOneDrive) {
       
        const newQuery = { ...router.currentRoute.value.query };
        delete newQuery.onedrive;
        delete newQuery.onedrive_folder_id;
        router.push({ query: newQuery });
        state.isInsideOneDrive = false;
        fetchDocuments();
    } else {
       
        router.push({
            query: {
                ...router.currentRoute.value.query,
                onedrive: '1',
            }
        });
        state.isInsideOneDrive = true;
        prefetchOneDriveCache();
        fetchOneDriveFiles().then(() => { prefetchOneDriveCache(); });
        // Start folder fetch in background after a short delay to avoid PHP session lock contention
        setTimeout(() => fetchOneDriveFolders(), 200);
    }
}

const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert, errorAlert } = useAlert()
const userStore = useUserStore() as any
const { t } = useI18n()
const router = useRouter()
const documentFile = ref(null) as any
let currentTablePage = 1
let lastOneDriveSearchRequestId = 0;
const oneDriveFolderSearch = ref('')
const filteredOneDriveFolders = computed(() => {
    const folders = oneDriveCache.getCache().filter((f: any) => f.type === 'folder')
    const term = oneDriveFolderSearch.value.toLowerCase()
    if (!term) return folders.sort((a: any, b: any) => a.name.localeCompare(b.name))
    return folders.filter((f: any) => f.name.toLowerCase().includes(term) || f.parentPath?.toLowerCase().includes(term))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))
})

function navigateToOneDriveFolder(folder: any) {
    state.modal.isOneDriveFolderStructureOpen = false
    oneDriveFolderSearch.value = ''
    viewOneDriveDirectory(folder)
}

// OneDrive søge-cache: henter alle filer i baggrunden én gang (modul-niveau via composable)
const oneDriveCache = useOneDriveCache()
const oneDriveFoldersForModal = ref<{value: string, label: string}[]>([])

function mapOneDriveItem(item: any) {
    let ext = ''
    if (item?.name && typeof item.name === 'string' && item.name.includes('.')) {
        ext = item.name.split('.').pop().toLowerCase()
    }
    return {
        name: item?.name ?? item?.file?.name ?? item?.file?.mimeType ?? 'File',
        type: item?.folder ? 'folder' : 'file',
        onedrive_type: ext,
        created_at: item?.createdDateTime ?? item?.created_at ?? null,
        updated_at: item?.lastModifiedDateTime ?? item?.updated_at ?? null,
        user: {
            firstname: item?.createdBy?.user?.displayName ?? item?.created_by?.user?.firstname ?? '',
            lastname: item?.created_by?.user?.lastname ?? '',
        },
        file_url: item?.webUrl ?? item?.['@microsoft.graph.downloadUrl'] ?? null,
        is_admin_access: false,
        uuid: item?.id ?? null,
        is_onedrive: true,
        parentPath: (() => {
            const raw = item?.parentReference?.path ?? ''
            const idx = raw.indexOf(':')
            return idx >= 0 ? raw.slice(idx + 1).replace(/^\//, '') : ''
        })(),
    }
}

async function prefetchOneDriveCache(force = false) {
    if (oneDriveCache.isLoading()) return
    // Brug eksisterende cache hvis den stadig er frisk
    if (oneDriveCache.isFresh(force)) {
        // Cache er allerede klar — genopbyg kun modal-listen og marker som klar
        oneDriveFoldersForModal.value = oneDriveCache.getCache()
            .filter((f: any) => f.type === 'folder')
            .sort((a: any, b: any) => a.name.localeCompare(b.name))
            .map((f: any) => ({ value: f.uuid, label: f.parentPath ? `${f.parentPath} / ${f.name}` : f.name }))
        state.isOneDriveCacheReady = true
        state.isOneDriveCacheLoading = false
        return
    }
    oneDriveCache.setLoading(true)
    state.isOneDriveCacheLoading = true
    state.isOneDriveCacheReady = false
    try {
        const userId = userStore.getUser?.id || localStorage.getItem('user_id')
        const token = localStorage.getItem('_token')
        const response: any = await $fetch(`/api/user/onedrive/all-files`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-User-Id': String(userId),
                'Authorization': 'Bearer ' + token,
            },
            credentials: 'include',
        })
        const files = Array.isArray(response?.value) ? response.value : (Array.isArray(response) ? response : [])
        oneDriveCache.setCache(files.map(mapOneDriveItem))
        oneDriveFoldersForModal.value = oneDriveCache.getCache()
            .filter((f: any) => f.type === 'folder')
            .sort((a: any, b: any) => a.name.localeCompare(b.name))
            .map((f: any) => ({ value: f.uuid, label: f.parentPath ? `${f.parentPath} / ${f.name}` : f.name }))
        state.isOneDriveCacheReady = true
    } catch {
        state.isOneDriveCacheReady = false
    } finally {
        oneDriveCache.setLoading(false)
        state.isOneDriveCacheLoading = false
    }
}
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
    documents: { data: [] } as any,
    onedriveFolders: [] as any,
    isInsideOneDrive: false,
    googleDriveFiles: [] as any,
    googleDriveFolderId: null as string | null,
    googleDriveFolderStack: [] as string[],
    oneDriveFolderStack: [] as string[],
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
        isOneDriveFolderStructureOpen: false,
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
    isOneDriveActivated: false,
    isSearching: false,
    isWaitingForSearch: false,
    isOneDriveCacheLoading: false,
    isOneDriveCacheReady: false,
})

onMounted(() => {
    state.modal.isMoveFileOpen = false;
    if (router.currentRoute.value.query.onedrive === '1') {
        state.isInsideOneDrive = true;
        // Genopbyg mapper øjeblikkeligt fra cache hvis den er varm
        prefetchOneDriveCache();
        // Hent aktuelle mappe-filer og kør prefetch bagefter (undgår PHP session locking)
        fetchOneDriveFiles().then(() => { prefetchOneDriveCache(); });
        // Start folder fetch in background after a short delay to avoid PHP session lock contention
        setTimeout(() => fetchOneDriveFolders(), 200);
    } else {
        fetchDocuments();
    }
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
    // Undgå fetch hvis vi er i gang med en OneDrive-søgning
    if (state.isSearching || state.isWaitingForSearch) return;
    const isOneDrive = router.currentRoute.value.query.onedrive === '1';
    const searchTerm = (Array.isArray(state.dataFilter.search)
        ? (state.dataFilter.search[0] || '').toLowerCase()
        : (state.dataFilter.search || '').toLowerCase());
    if (isOneDrive && searchTerm && searchTerm.length > 0) {
        // Der søges allerede, så fetch ikke
        return;
    }
    if (isOneDrive) {
        fetchOneDriveFiles();
    } else {
        fetchDocuments();
    }
}, { deep: true })

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

function handleRenameRefresh(updatedDoc: any) {
    const doc = updatedDoc || state.selectedDocument;
    if (!doc || !doc.uuid) return;
    const docIndex = state.documents?.data?.findIndex((d: any) => d.uuid === doc.uuid);
    if (docIndex > -1) {
        state.documents.data[docIndex].name = doc.name;
        if (typeof doc.is_admin_access !== 'undefined') {
            state.documents.data[docIndex].is_admin_access = doc.is_admin_access;
        }
    }
}

function oneDriveLogin() {
    router.push('/apps')
}


async function handleOneDriveClick() {
    fetchOneDriveFiles();
}

function handleRefreshDocuments() {
    if (state.isInsideOneDrive) {
        fetchOneDriveFiles();
    } else {
        fetchDocuments();
    }
}

async function handleOneDriveNewDocument() {
    const userId = userStore.user?.id || localStorage.getItem('user_id');
    const documentName = prompt('Indtast dokumentnavn:');
    if (!documentName) return;
    let parentId = undefined;
    const rawParentId = router?.currentRoute?.value?.query?.onedrive_folder_id;
    if (typeof rawParentId === 'string') {
        parentId = rawParentId;
    }
    try {
        await oneDriveService.createDocument(documentName, userId, parentId);
        await fetchOneDriveFiles();
        successAlert(`${t('alert.success')}!`, 'Dokument blev oprettet i OneDrive.');
    } catch (error: any) {
        errorAlert('Fejl!', String(error?.message) || 'Kunne ikke oprette dokument i OneDrive.');
    }
}
async function fetchOneDriveFiles(): Promise<void> {
    state.error = {};
    state.isTableLoading = true;
    try {
        const folderId = router?.currentRoute?.value?.query?.onedrive_folder_id;
        const userId = userStore.getUser?.id || localStorage.getItem('user_id');
        const token = localStorage.getItem('_token');
        let response;
        if (folderId) {
            response = await $fetch(`/api/user/onedrive/folder/${folderId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-User-Id': String(userId),
                    'Authorization': 'Bearer ' + token
                },
                credentials: 'include',
            });
        } else {
            response = await $fetch('/api/user/onedrive/files', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-User-Id': String(userId),
                    'Authorization': 'Bearer ' + token
                },
                credentials: 'include',
            });
        }
        let resp = response;
        if (typeof resp === 'string') {
            try {
                resp = JSON.parse(resp);
            } catch {
                throw new Error('Ugyldigt svar fra OneDrive API');
            }
        }
        let files: any[] = [];
        if (Array.isArray(resp)) {
            files = resp;
        } else if (resp && typeof resp === 'object') {
            const r = resp as Record<string, any>;
            if (Array.isArray(r.data)) {
                files = r.data;
            } else if (Array.isArray(r.value)) {
                files = r.value;
            }
        }
        let mappedFiles = files.map((item: any) => {
            let ext = '';
            if (item?.name && typeof item.name === 'string' && item.name.includes('.')) {
                ext = item.name.split('.').pop().toLowerCase();
            }
            return {
                name: item?.name ?? item?.file?.name ?? item?.file?.mimeType ?? 'File',
                type: item?.folder ? 'folder' : 'file',
                onedrive_type: ext,
                created_at: item?.createdDateTime ?? item?.created_at ?? null,
                updated_at: item?.lastModifiedDateTime ?? item?.updated_at ?? null,
                user: {
                    firstname: item?.createdBy?.user?.displayName ?? item?.created_by?.user?.firstname ?? '',
                    lastname: item?.created_by?.user?.lastname ?? '',
                },
                file_url: item?.webUrl ?? item?.['@microsoft.graph.downloadUrl'] ?? null,
                is_admin_access: false,
                uuid: item?.id ?? null,
                is_onedrive: true,
            };
        });

        state.documents = {
            data: mappedFiles,
            current_page: 1,
            per_page: mappedFiles.length,
            total: mappedFiles.length,
        };
        state.isInsideOneDrive = true;
        state.isOneDriveActivated = true;
    } catch (error: any) {
        const status = error?.status || error?.statusCode || error?.response?.status
        if (status === 401 || status === 403) {
        
            state.isOneDriveActivated = false;
            oneDriveLogin()
            return
        }
        console.error('fetchOneDriveFiles error:', error);
        state.error = { message: error?.message || 'Ukendt fejl', errors: error?.errors };
        errorAlert('Fejl!', error?.message || 'Ukendt fejl ved hentning af OneDrive-data');
    }
    state.isTableLoading = false;
    state.isPageLoading = false;
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
    if (typeof state.googleDriveFolderId === 'string') {
        state.googleDriveFolderStack.push(state.googleDriveFolderId)
    }
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
async function viewOneDriveDirectory(document: any) {
    if (document?.type !== 'folder') return;
    const currentFolderId = router.currentRoute.value.query.onedrive_folder_id;
    
    state.oneDriveFolderStack.push(typeof currentFolderId === 'string' ? currentFolderId : '');
    state.isPageLoading = true;
   
    state.documents.data = [];
    
    await router.push({
        query: {
            ...router.currentRoute.value.query,
            onedrive_folder_id: document.uuid,
            onedrive: '1',
        }
    });
    await fetchOneDriveFiles();
    
}

async function goBackOneDriveFolder() {
    const previousFolderId = state.oneDriveFolderStack.pop() || null;
    state.isPageLoading = true;
    state.documents.data = [];
    if (previousFolderId) {
        await router.push({
            query: {
                ...router.currentRoute.value.query,
                onedrive_folder_id: previousFolderId,
                onedrive: '1',
            }
        });
        await fetchOneDriveFiles();
    } else {
       
        state.dataFilter.search = '';
        const newQuery = { ...router.currentRoute.value.query };
        delete newQuery.onedrive_folder_id;
        newQuery.onedrive = '1';
        await router.push({ query: newQuery });
        await fetchOneDriveFiles();
    }
}
async function fetchDocuments(folderUuid: any = null): Promise<void> {
    
    if (state.isInsideOneDrive || router?.currentRoute?.value?.query?.onedrive === '1') {
        return;
    }
    state.error = {};
    state.isTableLoading = true;
    try {
        const folderUuid = router?.currentRoute?.value?.query?.folder_uuid;
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
            ...(folderUuid && { folder_uuid: folderUuid }),
        };
        const response = await documentService.getFileFolders(params);
        if (response) {
            state.documents = response;
            state.isInsideOneDrive = false;
        }
    } catch (error: any) {
        state.error = error;
    }
    state.isTableLoading = false;
    if (router.currentRoute.value.query.onedrive === '1' || state.isInsideOneDrive) {
        state.isPageLoading = false;
    } else {
        state.isPageLoading = false;
    }
}

function previous() {
    currentTablePage--;
    if (!state.isInsideOneDrive && router?.currentRoute?.value?.query?.onedrive !== '1') {
        fetchDocuments();
    }
}

function next() {
    currentTablePage++;
    if (!state.isInsideOneDrive && router?.currentRoute?.value?.query?.onedrive !== '1') {
        fetchDocuments();
    }
}

function sort(sortingData: any) {
    currentTablePage = 1;
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    };
    if (!state.isInsideOneDrive && router?.currentRoute?.value?.query?.onedrive !== '1') {
        fetchDocuments();
    }
}
<<<<<<< Updated upstream

function handleSearch(value: any) {
    currentTablePage = 1
    const searchValue = Array.isArray(value) ? value[0] ?? '' : value ?? ''
    state.dataFilter.search = searchValue?.[0] == '' ? [] : value
=======
async function handleSearch(value: any) {
    currentTablePage = 1;
    let searchValue = '';
    if (Array.isArray(value)) {
        searchValue = value[0] ?? '';
    } else if (typeof value === 'string') {
        searchValue = value;
    } else if (value && typeof value === 'object' && 'value' in value) {
        searchValue = (value as any).value ?? '';
    } else {
        searchValue = '';
    }
    state.dataFilter.search = searchValue;
>>>>>>> Stashed changes

    if (state.viewMode === 'google-drive') {
        fetchGoogleDriveFiles(state.googleDriveFolderId, state.dataFilter.search || undefined);
    } else if (state.isInsideOneDrive) {
        const searchTerm = (state.dataFilter.search || '').toLowerCase();
        if (searchTerm && searchTerm.length > 0) {
            // Brug cache hvis tilgængelig – øjeblikkeligt resultat
            if (state.isOneDriveCacheReady && oneDriveCache.getCache().length > 0) {
                const cacheMatches = oneDriveCache.getCache().filter((doc: any) =>
                    doc?.name?.toLowerCase().includes(searchTerm)
                )
                state.documents = { data: cacheMatches, current_page: 1, per_page: cacheMatches.length, total: cacheMatches.length }
                return
            }

            // Ingen cache endnu – søg via API (fallback)
            const localMatches = (state.documents?.data || []).filter((doc: any) =>
                doc?.name?.toLowerCase().includes(searchTerm)
            )
            if (localMatches.length > 0) {
                state.documents = { data: localMatches, current_page: 1, per_page: localMatches.length, total: localMatches.length }
            }

            state.isTableLoading = true;
            state.isSearching = true;
            const userId = userStore.getUser?.id || localStorage.getItem('user_id');
            const token = localStorage.getItem('_token');
            const requestId = ++lastOneDriveSearchRequestId;
            try {
                const response: any = await $fetch(`/api/user/onedrive/search-all?query=${encodeURIComponent(searchTerm)}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-User-Id': String(userId),
                        'Authorization': 'Bearer ' + token
                    },
                    credentials: 'include',
                });

                if (requestId !== lastOneDriveSearchRequestId) return;

                const files = Array.isArray(response.value) ? response.value : [];
                const mappedFiles = files.map(mapOneDriveItem);
                state.documents = {
                    data: mappedFiles,
                    current_page: 1,
                    per_page: mappedFiles.length,
                    total: mappedFiles.length,
                };
            } catch (error: any) {
                if (requestId !== lastOneDriveSearchRequestId) return;
                state.error = { message: error?.message || 'Ukendt fejl', errors: error?.errors };
                errorAlert('Fejl!', error?.message || 'Ukendt fejl ved OneDrive-søgning');
            }
            if (requestId === lastOneDriveSearchRequestId) {
                state.isTableLoading = false;
                state.isPageLoading = false;
                state.isSearching = false;
            }
        } else {
            fetchOneDriveFiles();
        }
    } else {
        fetchDocuments();
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
    state.error = {};
    state.isTableLoading = true;
    try {
        if (document?.is_onedrive) {
            try {
                const response = await documentService.downloadPdf(document?.uuid);
                if (response) {
                    saveAs(response, (document?.name?.split('.')[0] || 'dokument') + '.pdf');
                    state.isTableLoading = false;
                    return;
                }
            } catch (e) {
               
            }
            const downloadUrl = document?.['@microsoft.graph.downloadUrl'] || null;
            if (downloadUrl) {
                const response = await fetch(downloadUrl);
                const blob = await response.blob();
                saveAs(blob, (document?.name?.split('.')[0] || 'dokument') + '.pdf');
            } else if (document?.file_url) {
                window.open(document.file_url, '_blank');
            } else {
                throw new Error('Kunne ikke finde link til OneDrive-filen');
            }
        } else {
            const response = await documentService.downloadPdf(document?.uuid);
            if (response) {
                saveAs(response, (document?.name?.split('.')[0] || 'dokument') + '.pdf');
            }
            
            state.error = {};
            state.isTableLoading = true;
            try {
                const documentUuid = document?.uuid;
                const response = await documentService.downloadFile(documentUuid);
                if (response) {
                    saveAs(response, document?.name);
                }
            } catch (error: any) {
                state.error = error;
            }
            state.isTableLoading = false;
        }
    } catch (error: any) {
        state.error = error;
    }
    state.isTableLoading = false;
}


function triggerFileInput() {
    documentFile.value.click()
}

async function uploadFile(event: any) {
    state.error = {}; 
    state.isPageLoading = true;
    let allSuccess = true;
    let errorMessages: string[] = [];
    try {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        if (state.isInsideOneDrive) {
            const userId = userStore.user?.id || localStorage.getItem('user_id');
            const token = localStorage.getItem('_token');
            const parentId = router?.currentRoute?.value?.query?.onedrive_folder_id;
            for (const file of files) {
                const allowedExts = ['docx', 'txt', 'pdf', 'html'];
                const ext = file.name.split('.').pop()?.toLowerCase();
                if (!allowedExts.includes(ext || '')) {
                    allSuccess = false;
                    errorMessages.push('Du kan kun uploade .docx, .txt, .pdf eller .html filer til OneDrive.');
                    state.error = { message: 'Du kan kun uploade .docx, .txt, .pdf eller .html filer til OneDrive.' };
                    continue;
                }
               
                const formData = new FormData();
                formData.append('file', file);
                let endpoint = '/api/user/onedrive/uploade-document';
                if (parentId) {
                    endpoint = `/api/user/onedrive/upload-to-folder/${parentId}`;
                }
              
                if (!parentId) {
                    formData.append('parent_id', '');
                }
                try {
                    const response: any = await $fetch(endpoint, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-User-Id': String(userId),
                            'Authorization': 'Bearer ' + token,
                        },
                        credentials: 'include',
                    });
                    if (response?.error) {
                        allSuccess = false;
                        errorMessages.push(response.error);
                        if (String(response.error).includes('UTF-8 encoding')) {
                            errorAlert('Fejl!', 'Filen kunne ikke gemmes korrekt pga. tegnsætningsfejl (UTF-8 encoding problem). Prøv at gemme filen igen med UTF-8 encoding.');
                        } else {
                            errorAlert('Fejl!', response.error);
                        }
                    }
                } catch (err: any) {
                    allSuccess = false;
                    const backendError = err?.response?._data?.error;
                    errorMessages.push(backendError || err?.message || 'Kunne ikke uploade filen til OneDrive.');
                    errorAlert('Fejl!', backendError || err?.message || 'Kunne ikke uploade filen til OneDrive.');
                }
            }
            resetFileInput();
           
            if (parentId) {
                
                const folderObj = state.documents.data.find((doc: any) => doc.uuid === parentId && doc.type === 'folder');
                if (folderObj) {
                    await viewDirectory(folderObj);
                } else {
                    
                    await fetchOneDriveFiles(); 
                }
            } else {
                await fetchOneDriveFiles();
            }
            if (allSuccess) {
                successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyAdded') || 'Fil(er) uploadet til OneDrive.'}`);
            }
        }
        
    } catch (error: any) {
        state.error = error;
        resetFileInput();
        errorAlert('Fejl!', error?.message || 'Kunne ikke uploade fil(er).');
    }
    state.isPageLoading = false;
}

const resetFileInput = () => {
    if (documentFile.value) {
        documentFile.value.value = null
    }
}

async function viewDirectory(document: any) {
    currentTablePage = 1
    if (document?.is_onedrive) {
        if (!document?.uuid) {
            errorAlert('Fejl!', 'Mappen har ikke noget id. (uuid mangler)');
            return;
        }
        state.error = {}
        state.isTableLoading = true
        try {
            router.push({
                query: {
                    ...router.currentRoute.value.query,
                    onedrive_folder_id: document.uuid,
                    onedrive: '1',
                }
            });
            const userId = userStore.user?.id || localStorage.getItem('user_id');
            const endpointUrl = `/api/user/onedrive/folder/${document.uuid}`;
            const response = await $fetch(endpointUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-User-Id': String(userId),
                    'Authorization': 'Bearer ' + localStorage.getItem('_token')
                },
                credentials: 'include',
            })
            const resp: any = response
            const files = Array.isArray(resp?.value)
                ? resp.value
                : Array.isArray(resp?.data)
                    ? resp.data
                    : Array.isArray(resp)
                        ? resp
                        : []
            const mappedFiles = files.map((item: any) => ({
                name: item?.name ?? item?.file?.name ?? item?.file?.mimeType ?? 'File',
                type: item?.folder ? 'folder' : 'file',
                created_at: item?.createdDateTime ?? item?.created_at ?? null,
                updated_at: item?.lastModifiedDateTime ?? item?.updated_at ?? null,
                user: {
                    firstname: item?.createdBy?.user?.displayName ?? item?.created_by?.user?.firstname ?? '',
                    lastname: item?.created_by?.user?.lastname ?? '',
                },
                file_url: item?.webUrl ?? item?.['@microsoft.graph.downloadUrl'] ?? null,
                is_admin_access: false,
                uuid: item?.id ?? null,
                is_onedrive: true,
            }))
            state.documents = {
                data: mappedFiles,
                current_page: 1,
                per_page: mappedFiles.length,
                total: mappedFiles.length,
            }
            state.documents = JSON.parse(JSON.stringify(state.documents))
            state.isInsideOneDrive = true
        } catch (error: any) {
            state.error = error
            errorAlert('Fejl!', 'Kunne ikke åbne OneDrive mappen')
        }
        state.isTableLoading = false
    const current = router?.currentRoute?.value?.query?.folder_uuid
    if (current) {
        state.folderStack.push(current as string)
    }
    await navigateTo(`/drive?folder_uuid=${document.uuid}`)
}}

async function editDocument(document: any) {
   
    if (document.is_onedrive) {
        state.selectedDocument = {
            ...document,
            uuid: document.uuid, 
            type: document.type,
            onedrive_type: document.onedrive_type,
        };
    } else {
        state.selectedDocument = document;
    }
    if (state.viewMode === 'google-drive') {
        state.modal.isEditGoogleDriveDocumentOpen = true;
    } else {
       
        if (document.type === 'file') {
            state.modal.isEditDocumentOpen = true;
            
            if (document.is_onedrive) {
                state.isPageLoading = true;
                try {
                    const token = localStorage.getItem('_token');
                    const userId = userStore.getUser?.id || localStorage.getItem('user_id');
                    const encodedId = encodeURIComponent(document.uuid);
                    const endpoint = `/api/user/onedrive/file/${encodedId}`;
                    const headers = {
                        'Accept': 'application/json',
                        'X-User-Id': userId,
                        'Authorization': 'Bearer ' + token
                    };
                    console.log('[OneDrive DEBUG] fetch endpoint:', endpoint);
                    console.log('[OneDrive DEBUG] fetch headers:', headers);
                    const res = await fetch(endpoint, { headers });
                    const data = await res.json();
                    state.docsFields.content = data.content;
                } catch (e) {
                    errorAlert('Fejl!', 'Kunne ikke hente filindhold fra OneDrive.');
                    state.docsFields.content = '';
                }
                state.isPageLoading = false;
                
            } else {
                
                state.docsFields.content = document.content || '';
            }
        } else {
            state.modal.isEditDocumentOpen = true;
        }
    }
}


async function saveOneDriveFileContent() {
    if (!state.selectedDocument?.is_onedrive || state.selectedDocument.type !== 'file') return;
    state.isPageLoading = true;
    try {
        const token = localStorage.getItem('_token');
        const userId = userStore.getUser?.id || localStorage.getItem('user_id');
        const encodedId = encodeURIComponent(state.selectedDocument.uuid);
        await fetch(`/api/user/onedrive/file/${encodedId}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-User-Id': userId,
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ content: state.docsFields.content })
        });
        successAlert('Succes!', 'Filen blev gemt på OneDrive.');
        state.modal.isEditDocumentOpen = false;
        await fetchOneDriveFiles();
    } catch (e) {
        errorAlert('Fejl!', 'Kunne ikke gemme filen på OneDrive.');
    }
    state.isPageLoading = false;
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
                state.error = {}
            fetchDocuments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function moveFileConfirmation(document: any) {
    state.modal.isMoveFileOpen = false;
    fetchOneDriveFolders(); // trigger in background if not already loaded/loading
    await new Promise(resolve => setTimeout(resolve, 200));
    state.selectedDocument = document;
    state.modal.isMoveFileOpen = true;
}

async function fetchOneDriveFolders(force = false) {
    // Brug cache hvis frisk
    if (oneDriveCache.isFoldersFresh(force)) {
        state.onedriveFolders = oneDriveCache.getFolders()
        return
    }
    if (oneDriveCache.isFoldersLoading()) return
    oneDriveCache.setFoldersLoading(true)
    state.error = {}
    try {
        const response = await $fetch('/api/user/onedrive/all-folders', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-User-Id': String(userStore.user?.id || localStorage.getItem('user_id')),
                'Authorization': 'Bearer ' + localStorage.getItem('_token')
            },
            credentials: 'include',
        });
        let folders: any[] = [];
        if (Array.isArray(response)) {
            folders = response;
        } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
            folders = (response as any).data;
        }
        const mappedFolders = folders.map((item: any) => ({
            value: item.id,
            label: item.name,
        }));
        oneDriveCache.setFolders(mappedFolders)
        state.onedriveFolders = mappedFolders;
    } catch (error: any) {
        state.error = error;
    } finally {
        oneDriveCache.setFoldersLoading(false)
    }
}
      
    async function handleOneDriveFileUpload() {
                                   
    const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = async (event: any) => {
        const files = event.target.files;
            if (!files || files.length === 0) return;
            state.isPageLoading = true;
            try {
                let parentId = undefined;
                const rawParentId = router?.currentRoute?.value?.query?.onedrive_folder_id;
            if (typeof rawParentId === 'string') {
                 parentId = rawParentId;
                }
                const userId = userStore.user?.id || localStorage.getItem('user_id');
                    let allSuccess = true;
                    for (const file of files) {
                        try {
                            const res: any = await oneDriveService.uploadFile(parentId || 'root', file);
                            if (res?.error) {
                                allSuccess = false;
                                errorAlert('Fejl!', res.error);
                            }
                        } catch (uploadErr: any) {
                            allSuccess = false;
                            errorAlert('Fejl!', uploadErr?.data?.error || uploadErr?.message || 'Kunne ikke uploade filen.');
                        }
                    }
                    await fetchOneDriveFiles();
                    if (allSuccess) {
                        successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyAdded') || 'Fil(er) uploadet til OneDrive.'}`);
                    }
                } catch (error: any) {
                    errorAlert('Fejl!', String(error?.message) || 'Kunne ikke uploade fil(er) til OneDrive.');
                        }
                        state.isPageLoading = false;
                        };
                        input.click();
                                }

async function handleCreateNewFolder() {
    const userId = userStore.user?.id || localStorage.getItem('user_id');
    const folderName = prompt('Indtast mappenavn:');
    if (!folderName) return;

    if (state.isInsideOneDrive) {
    
        let parentId: string | undefined = undefined;
        const rawParentId = router?.currentRoute?.value?.query?.onedrive_folder_id;
        if (typeof rawParentId === 'string') {
            parentId = rawParentId;
        }
        try {
            const token = localStorage.getItem('_token');
            await $fetch('/api/user/onedrive/create-folder', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'X-User-Id': userId,
                    'Accept': 'application/json',
                },
                body: {
                    name: folderName,
                    parent_id: parentId || null,
                },
                credentials: 'include',
            });
            await fetchOneDriveFiles();
            await fetchOneDriveFolders(true);
            successAlert(`${t('alert.success')}!`, 'Mappen blev oprettet i OneDrive.');
        } catch (error: any) {
            errorAlert('Fejl!', error?.data?.error || error?.message || 'Kunne ikke oprette mappe i OneDrive.');
        }
    } else {
        
        const params = new FormData();
        params.append('type', 'folder');
        params.append('name', folderName);
        params.append('is_admin_access', 'false');
        const folderUuid = router?.currentRoute?.value?.query?.folder_uuid;
        if (typeof folderUuid === 'string') params.append('folder_uuid', folderUuid);
        try {
            const response = await documentService.saveFileFolder(params);
            if (response?.data) {
                fetchDocuments();
                successAlert(`${t('alert.success')}!`, `${t('drive.alert.folderSuccessfullyAdded') || 'Mappe blev oprettet.'}`);
            }
        } catch (error: any) {
            errorAlert('Fejl!', error?.message || 'Kunne ikke oprette mappe.');
        }
    }
}
async function handleMoveOneDriveFile(folderId: string) {
    state.error = {}
    if (!folderId) {
        state.error = { message: 'Vælg venligst en mappe' } as Error;
        return;
    }
    state.isTableLoading = true;
    try {
        const fileId = state.selectedDocument?.uuid;
        const response = await $fetch(`/api/user/onedrive/move/${fileId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-User-Id': String(userStore.user?.id || localStorage.getItem('user_id')),
                'Authorization': 'Bearer ' + localStorage.getItem('_token')
            },
            body: {
                parent_id: folderId,
            },
            credentials: 'include',
        });
        successAlert(`${t('alert.success')}!`, `${t('drive.alert.fileSuccessfullyMoved') || 'Fil blev flyttet'}.`);
        await fetchOneDriveFiles();
        handleRefreshDocuments();
    } catch (error: any) {
        console.error('handleMoveOneDriveFile error:', error);
        if (error?.status === 400 || error?.statusCode === 400) {
            errorAlert('Fejl!', 'Filen kan ikke flyttes fordi den er åben. Luk venligst filen først.');
        } else {
            state.error = error;
            errorAlert('Fejl!', error?.message || 'Kunne ikke flytte filen. Prøv igen.');
        }
    } 
    state.isTableLoading = false;
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
    state.error = {};
    state.isTableLoading = true;
    const docIndex = state.documents?.data?.findIndex((doc: any) => doc.uuid === state.selectedDocument.uuid) ?? -1;
    const originalDoc = docIndex > -1 ? state.documents.data[docIndex] : null;
    if (docIndex > -1) {
        state.documents.data.splice(docIndex, 1);
    }
    try {
        let response;
        if (state.selectedDocument?.is_onedrive) {
           response = await $fetch(`/api/user/onedrive/delete-onedrive/${state.selectedDocument.uuid}`, {
                method: 'DELETE',
                headers: {
                    'X-User-Id': String(userStore.user?.id || localStorage.getItem('user_id')),
                    'Authorization': 'Bearer ' + localStorage.getItem('_token'),
            },
                credentials: 'include',
});
        } else {
            response = await documentService.deleteDocument(state.selectedDocument.uuid);
        }
      
        if (state.selectedDocument.type === 'folder') {
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.deletedFolderSuccessfully') || 'Mappe blev slettet.'}`);
        } else {
            successAlert(`${t('alert.success')}!`, `${t('drive.alert.deletedFileSuccessfully') || 'Fil blev slettet.'}`);
        }
    } catch (error: any) {
        if (originalDoc && docIndex > -1) {
            state.documents.data.splice(docIndex, 0, originalDoc);
        }
        state.error = error;
    }
	state.isTableLoading = false;
}

async function downloadDocumentPdf(document: any) {
    state.error = {};
    state.isTableLoading = true;
    try {
        if (document?.is_onedrive) {
            const blob = await oneDriveService.downloadFile(document.uuid);
            saveAs(blob, (document?.name?.split('.')[0] || 'dokument') + '.pdf');
        } else {
            const response = await documentService.downloadPdf(document?.uuid);
            if (response) {
                saveAs(response, (document?.name?.split('.')[0] || 'dokument') + '.pdf');
            }
        }
    } catch (error: any) {
        state.error = error;
    }
    state.isTableLoading = false;
}
</script>









