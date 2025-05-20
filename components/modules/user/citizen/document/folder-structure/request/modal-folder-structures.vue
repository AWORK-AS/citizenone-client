<template>
    <div>
        <Modal size="xl" :title="$t('folderStructure.requests.folderStructureRequests')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="flex justify-end items-center gap-x-5 mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.newFolderStructureRequestOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('folderStructure.requests.newFolderStructureRequest') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.folderStructureRequests"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.folderStructureRequests?.data?.length === 0))">
                                <tr v-for="(folderStructure, index) in state.folderStructureRequests?.data"
                                    :key="index">
                                    <td width="50%">
                                        <span>{{ folderStructure?.folder_structure?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editFolderStructure(folderStructure)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('folderStructure.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.folderStructureRequests" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenDocumentFolderStructureRequestModalNew
                    :isModalOpen="state.modal.newFolderStructureRequestOpen"
                    @close="state.modal.newFolderStructureRequestOpen = false"
                    @refreshFolderStructureRequests="fetchFolderStructureRequests" />
                <!-- <ModulesUserCitizenDocumentFolderStructureModalEdit :isModalOpen="state.modal.editFolderStructureOpen"
                    :selectedFolderStructure="state.selectedFolderStructure"
                    @close="state.modal.editFolderStructureOpen = false"
                    @refreshFolderStructures="fetchFolderStructureRequests" /> -->
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { folderStructureRequestService } from '@/components/api/user/FolderStructureRequestService'
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
        { name: 'addictions.table.name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    folderStructureRequests: [] as any,
    isTableLoading: false,
    modal: {
        editFolderStructureOpen: false,
        folderStructureRequestsOpen: false,
        newFolderStructureRequestOpen: false,
    },
    selectedFolderStructure: {},
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
        fetchFolderStructureRequests()
    }
})

async function fetchFolderStructureRequests() {
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
        const response = await folderStructureRequestService.getFolderStructureRequests(params)
        if (response) {
            state.folderStructureRequests = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchFolderStructureRequests()
}

function next() {
    currentTablePage++
    fetchFolderStructureRequests()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchFolderStructureRequests()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchFolderStructureRequests()
}

function editFolderStructure(folder_structure: any) {
    state.selectedFolderStructure = folder_structure
    state.modal.editFolderStructureOpen = true
}
</script>