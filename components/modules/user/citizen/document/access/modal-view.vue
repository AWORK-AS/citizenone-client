<template>
    <div>
        <Modal size="2xl" :title="$t('citizens.documents.access.access')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="flex justify-end items-center gap-x-5 mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isAddAccessOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.documents.access.newAccess') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.fileFolderAccess"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.fileFolderAccess?.data?.length === 0))">
                                <tr v-for="(access, index) in state.fileFolderAccess?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ access?.user?.firstname }}</span>
                                        <span>{{ access?.user?.lastname }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="deleteAccessConfirmation(access)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizens.documents.access.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.fileFolderAccess" @previous="previous" @next="next" />
                </div>

                <ModulesUserCitizenDocumentAccessModalNew :isModalOpen="state.modal.isAddAccessOpen"
                    :selectedDocument="props.selectedDocument" @close="state.modal.isAddAccessOpen = false"
                    @refreshAccesses="fetchAccesses()" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteAccessOpen"
                    :message="$t('citizens.documents.access.table.confirmation.deleteAccessConfirmation') + '?'"
                    @close="state.modal.isDeleteAccessOpen = false" @confirm="deleteAccess" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenDocumentAccessService } from '@/components/api/user/CitizenDocumentAccessService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDocument: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close'])
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'addictions.table.name', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    fileFolderAccess: [] as any,
    isTableLoading: false,
    modal: {
        isAddAccessOpen: false,
        isDeleteAccessOpen: false,
    },
    selectedAccess: {},
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
        fetchAccesses()
    }
})

async function fetchAccesses() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            file_folder_uuid: props.selectedDocument?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await citizenDocumentAccessService.getCitizenFileFolderAccesses(params)
        if (response) {
            state.fileFolderAccess = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchAccesses()
}

function next() {
    currentTablePage++
    fetchAccesses()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchAccesses()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchAccesses()
}

function deleteAccessConfirmation(folderStructure: any) {
    state.selectedAccess = folderStructure
    state.modal.isDeleteAccessOpen = true
}

async function deleteAccess() {
    state.error = {}
    state.isTableLoading = true
    try {
        const selectedAccessUuid = state.selectedAccess.uuid
        const response = await citizenDocumentAccessService.deleteCitizenFileFolderAccess(selectedAccessUuid)
        if (response) {
            fetchAccesses()
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.access.table.alert.accessSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>