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
                                                {{ $t('folderStructure.requests.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="confirmApproveFolderStructureRequest(folderStructure)">
                                                <Icon name="ph:check" class="size-4" />
                                                {{ $t('folderStructure.requests.table.actions.approve') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="confirmDisapproveFolderStructureRequest(folderStructure)">
                                                <Icon name="ph:x" class="size-4" />
                                                {{ $t('folderStructure.requests.table.actions.disapprove') }}
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
                <ModulesUserCitizenDocumentFolderStructureRequestModalEdit
                    :isModalOpen="state.modal.editFolderStructureOpen"
                    :selectedFolderStructureRequest="state.selectedFolderStructureRequest"
                    @close="state.modal.editFolderStructureOpen = false"
                    @refreshFolderStructureRequests="fetchFolderStructureRequests" />


                <DialogConfirmation :isModalOpen="state.modal.isApproveRequestOpen"
                    :message="$t('folderStructure.requests.table.confirmation.approveFolderStructureRequestConfirmation') + '?'"
                    @close="state.modal.isApproveRequestOpen = false" @confirm="approveFolderStructureRequest" />
                <DialogConfirmation :isModalOpen="state.modal.isDisapproveRequestOpen"
                    :message="$t('folderStructure.requests.table.confirmation.disapproveFolderStructureRequestConfirmation') + '?'"
                    @close="state.modal.isDisapproveRequestOpen = false" @confirm="rejectFolderStructureRequest" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { folderStructureRequestService } from '@/components/api/user/FolderStructureRequestService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const emit = defineEmits(['close', 'refreshFolderStructures'])
const { t } = useI18n()
const { successAlert } = useAlert()
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
        isApproveRequestOpen: false,
        isDisapproveRequestOpen: false,
    },
    selectedFolderStructureRequest: {},
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

function editFolderStructure(folderStructure: any) {
    state.selectedFolderStructureRequest = folderStructure
    state.modal.editFolderStructureOpen = true
}

function confirmApproveFolderStructureRequest(folderStructure: any) {
    state.selectedFolderStructureRequest = folderStructure
    state.modal.isApproveRequestOpen = true
}

function confirmDisapproveFolderStructureRequest(folderStructure: any) {
    state.selectedFolderStructureRequest = folderStructure
    state.modal.isDisapproveRequestOpen = true
}

async function approveFolderStructureRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const folderStructureRequestUuid = state.selectedFolderStructureRequest.uuid
        const response = await folderStructureRequestService.approveFolderStructureRequest(folderStructureRequestUuid)
        if (response) {
            fetchFolderStructureRequests()
            successAlert(`${t('alert.success')}!`, `${t('folderStructure.requests.table.alert.folderStructureRequestSuccessfullyApproved')}.`)
            emit('refreshFolderStructures')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function rejectFolderStructureRequest() {
    state.error = {}
    state.isTableLoading = true
    try {
        const folderStructureRequestUuid = state.selectedFolderStructureRequest.uuid
        const response = await folderStructureRequestService.disapproveFolderStructureRequest(folderStructureRequestUuid)
        if (response) {
            fetchFolderStructureRequests()
            successAlert(`${t('alert.success')}!`, `${t('folderStructure.requests.table.alert.folderStructureRequestSuccessfullyDisapproved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>