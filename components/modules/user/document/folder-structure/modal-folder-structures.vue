<template>
    <div>
        <Modal size="2xl" :title="$t('folderStructure.folderStructure')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.newFolderStructureOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('folderStructure.newFolderStructure') }}
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
                                                @click="editFolderStructure(folder_structure)">
                                                <Icon name="ph:pencil" class="size-4" />
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
                <ModulesUserDocumentFolderStructureModalNew :isModalOpen="state.modal.newFolderStructureOpen"
                    @close="state.modal.newFolderStructureOpen = false"
                    @refreshFolderStructures="fetchFolderStructures" />
                <ModulesUserDocumentFolderStructureModalEdit :isModalOpen="state.modal.editFolderStructureOpen"
                    :selectedFolderStructure="state.selected_folder_structure"
                    @close="state.modal.editFolderStructureOpen = false"
                    @refreshFolderStructures="fetchFolderStructures" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { folderStructureService } from '@/components/api/FolderStructureService'
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
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'addictions.table.name', sorter: true, key: 'name' },
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
        newFolderStructureOpen: false,
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

async function fetchFolderStructures() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            type: 'company',
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

function editFolderStructure(folder_structure: any) {
    state.selected_folder_structure = folder_structure
    state.modal.editFolderStructureOpen = true
}
</script>