<template>
    <div>
        <Modal size="xl" :title="$t('plansandgoals.statuses')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isAddStatusOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('plansandgoals.newStatus') }}
                        </FormButton>
                    </div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                            @handleFilter="handleFilter" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.statuses"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.statuses?.data?.length === 0))">
                                    <tr v-for="(status, index) in state.statuses?.data" :key="index">
                                        <td width="30%">
                                            <Badge type="primary" class="w-fit" v-if="status?.copied_from">
                                                <p class="text-xxs">
                                                    {{
                                                        $t('plansandgoals.table.copiedFrom')
                                                    }}
                                                    {{ status?.copied_from === 'journal_note' ?
                                                        $t('plansandgoals.table.journalNote') :
                                                        $t('plansandgoals.table.riskAssessment') }}
                                                </p>
                                            </Badge>
                                            <div v-html="status.status" class="content" />
                                        </td>
                                        <td width="30%">
                                            <span>{{ formatDateToReadable(status?.created_at) }}</span>
                                        </td>
                                        <td width="20%">
                                            <span>
                                                {{ status?.user?.firstname + ' ' + status?.user?.lastname }}
                                            </span>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <FormButton class="rounded-md" buttonSize="sm"
                                                    @click="editStatus(status)" v-if="status?.is_editable">
                                                    <Icon name="ph:pencil" class="size-4" />
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
                <ModulesCitizenPlanStatusModalNew :isModalOpen="state.modal.isAddStatusOpen"
                    :selectedData="props.selectedData" :selectedStatus="state.selectedStatus"
                    @close="state.modal.isAddStatusOpen = false" @refreshStatuses="fetchStatuses" />
                <ModulesCitizenPlanStatusModalEdit :isModalOpen="state.modal.isEditStatusOpen"
                    :selectedStatus="state.selectedStatus" @close="state.modal.isEditStatusOpen = false"
                    @refreshStatuses="fetchStatuses" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteStatusOpen"
                    :message="`${$t('plansandgoals.confirmation.deleteStatusConfirmation')}?`"
                    @close="state.modal.isDeleteStatusOpen = false" @confirm="deleteStatus" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { statusService } from '@/components/api/StatusService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
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
    columnFilter: [
        { column: 'status' },
    ],
    columnHeaders: [
        { name: 'plansandgoals.table.status', sorter: true, key: 'status' },
        { name: 'plansandgoals.table.dateCreated' },
        { name: 'plansandgoals.table.createdBy' },
        { name: '' },
    ],
    dataFilter: [],
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
        fetchStatuses()
    }
})


async function fetchStatuses() {
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
    fetchStatuses()
}

function next() {
    currentTablePage++
    fetchStatuses()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchStatuses()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchStatuses()
}

function editStatus(status: any) {
    state.selectedStatus = status
    state.modal.isEditStatusOpen = true
}

function confirmStatusDeletion(status: any) {
    state.selectedStatus = status
    state.modal.isDeleteStatusOpen = true
}

async function deleteStatus() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await statusService.deleteStatus(state.selectedStatus.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchStatuses()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.statusSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>