<template>
    <div>
        <Modal size="2xl" :title="$t('folderStructure.folderStructure')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="flex justify-end items-center gap-x-5 mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.newFolderStructureOpen = true" v-if="isAdmin(userStore.getUser?.roles)">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('folderStructure.newFolderStructure') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isViewFolderStructureRequestsOpen = true">
                        <Icon name="ph:folder" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('folderStructure.requests.folderStructureRequests') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.folder_structures"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.folder_structures?.data?.length === 0))">
                                <tr v-for="(folder_structure, index) in state.folder_structures?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ folder_structure?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="viewFolderStructure(folder_structure)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('folderStructure.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editFolderStructure(folder_structure)"
                                                v-if="isAdmin(userStore.getUser?.roles)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('folderStructure.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.folder_structures" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenDocumentFolderStructureModalView :isModalOpen="state.modal.viewFolderStructureOpen"
                    :selectedFolderStructure="state.selected_folder_structure"
                    @close="state.modal.viewFolderStructureOpen = false" />
                <ModulesUserCitizenDocumentFolderStructureModalNew :isModalOpen="state.modal.newFolderStructureOpen"
                    @close="state.modal.newFolderStructureOpen = false"
                    @refreshFolderStructures="fetchFolderStructures" />
                <ModulesUserCitizenDocumentFolderStructureModalEdit :isModalOpen="state.modal.editFolderStructureOpen"
                    :selectedFolderStructure="state.selected_folder_structure"
                    @close="state.modal.editFolderStructureOpen = false"
                    @refreshFolderStructures="fetchFolderStructures" />

                <ModulesUserCitizenDocumentFolderStructureRequestModalFolderStructures
                    :isModalOpen="state.modal.isViewFolderStructureRequestsOpen"
                    @close="state.modal.isViewFolderStructureRequestsOpen = false"
                    @refreshFolderStructures="fetchFolderStructures" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { folderStructureService } from '@/components/api/user/FolderStructureService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const emit = defineEmits(['close'])
const userStore = useUserStore() as any
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'folderStructure.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    folder_structures: [] as any,
    isTableLoading: false,
    modal: {
        editFolderStructureOpen: false,
        isViewFolderStructureRequestsOpen: false,
        newFolderStructureOpen: false,
        viewFolderStructureOpen: false,
    },
    selected_folder_structure: {},
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchFolderStructures()
    }
})

function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}

async function fetchFolderStructures() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            type: 'citizen',
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await folderStructureService.getFolderStructures(params)
        if (response) {
            state.folder_structures = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchFolderStructures()
}

function next() {
    currentTablePage++
    fetchFolderStructures()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchFolderStructures()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchFolderStructures()
}

function viewFolderStructure(folderStructure: any) {
    state.selected_folder_structure = folderStructure
    state.modal.viewFolderStructureOpen = true
}

function editFolderStructure(folderStructure: any) {
    state.selected_folder_structure = folderStructure
    state.modal.editFolderStructureOpen = true
}
</script>