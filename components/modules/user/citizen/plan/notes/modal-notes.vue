<template>
    <div>
        <Modal size="4xl" :title="$t('plansandgoals.notes')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isAddStatusOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('plansandgoals.newNote') }}
                        </FormButton>
                    </div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.statuses"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.statuses?.data?.length === 0))">
                                    <tr v-for="(status, index) in state.statuses?.data" :key="index">
                                        <td width="20%">
                                            <p>
                                                {{ status.title }}
                                            </p>
                                        </td>
                                        <td width="30%">
                                            <Badge type="primary" class="w-fit lowercase" v-if="status?.copied_from">
                                                <p class="text-xxs">
                                                    {{
                                                        $t('plansandgoals.table.copiedFrom')
                                                    }}
                                                    {{ status?.copied_from === 'journal_note' ?
                                                        $t('plansandgoals.table.journalNote') :
                                                        customPagesStore.getCustomPagesName?.riskAssessment }}
                                                </p>
                                            </Badge>
                                            <div v-html="status.status" class="content" />
                                            <Badge type="primary" class="w-fit" v-if="status.score">
                                                <p class="text-xxs" v-if="status.score == 1">
                                                    {{
                                                        $t('plansandgoals.table.expectedLevels.minorChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="status.score == 2">
                                                    {{
                                                        $t('plansandgoals.table.expectedLevels.moderateChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="status.score == 3">
                                                    {{
                                                        $t('plansandgoals.table.expectedLevels.significantChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="status.score == 4">
                                                    {{
                                                        $t('plansandgoals.table.expectedLevels.severeChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="status.score == 5">
                                                    {{
                                                        $t('plansandgoals.table.expectedLevels.verySubstantialChallenges')
                                                    }}
                                                </p>
                                            </Badge>
                                        </td>
                                        <td width="20%">
                                            <span>{{ formatDateToReadable(status?.created_at) }}</span>
                                        </td>
                                        <td width="20%">
                                            <span>
                                                {{ status?.user?.firstname + ' ' + status?.user?.lastname }}
                                            </span>
                                        </td>
                                        <td width="10%">
                                            <div class="flex items-end gap-2">
                                                <FormButton class="rounded-md" buttonSize="sm"
                                                    @click="editStatus(status)" v-if="status?.is_editable">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                    {{ $t('plansandgoals.table.actions.edit') }}
                                                </FormButton>
                                                <FormButton class="rounded-md" buttonSize="sm"
                                                    @click="confirmStatusDeletion(status)" v-if="status?.is_deletable">
                                                    <Icon name="heroicons:trash" class="size-4" />
                                                    {{ $t('plansandgoals.table.actions.delete') }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.statuses" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesUserCitizenPlanNotesModalNew :isModalOpen="state.modal.isAddStatusOpen"
                    :selectedData="props.selectedData" :selectedStatus="state.selectedStatus"
                    @close="state.modal.isAddStatusOpen = false" @refreshStatuses="fetchNotes" />
                <ModulesUserCitizenPlanNotesModalEdit :isModalOpen="state.modal.isEditStatusOpen"
                    :selectedStatus="state.selectedStatus" @close="state.modal.isEditStatusOpen = false"
                    @refreshStatuses="fetchNotes" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteStatusOpen"
                    :message="`${$t('plansandgoals.confirmation.deleteNoteConfirmation')}?`"
                    @close="state.modal.isDeleteStatusOpen = false" @confirm="deleteNote" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { statusService } from '@/components/api/user/StatusService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { useCustomPagesStore } from '@/store/custom-pages'

const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
let currentTablePage = 1

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedData: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshData'])

const state = reactive({
    columnHeaders: [
        { name: 'plansandgoals.table.title', sorter: true, key: 'title' },
        { name: 'plansandgoals.table.notes', sorter: true, key: 'status' },
        { name: 'plansandgoals.table.dateCreated' },
        { name: 'plansandgoals.table.createdBy' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddStatusOpen: false,
        isDeleteStatusOpen: false,
        isEditStatusOpen: false,
    },
    selectedStatus: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    statuses: [] as any
})

function closeModal() {
    emit('close')
}

function refreshData() {
    emit('refreshData')
}

watch(() => props.isModalOpen, (newValue: any) => {
    if (newValue) {
        fetchNotes()
    }
})


async function fetchNotes() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            model_uuid: props.selectedData?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await statusService.getStatuses(params)
        if (response) {
            state.statuses = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchNotes()
}

function next() {
    currentTablePage++
    fetchNotes()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchNotes()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchNotes()
}

function editStatus(status: any) {
    state.selectedStatus = status
    state.modal.isEditStatusOpen = true
}

function confirmStatusDeletion(status: any) {
    state.selectedStatus = status
    state.modal.isDeleteStatusOpen = true
}

async function deleteNote() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await statusService.deleteStatus(state.selectedStatus.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchNotes()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.noteSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>