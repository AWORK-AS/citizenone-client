<template>
    <div>
        <Modal size="4xl" :title="$t('plansandgoals.statuses')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.statuses"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.statuses?.data?.length === 0))">
                                    <tr v-for="(status, index) in state.statuses?.data" :key="index">
                                        <td width="15%">
                                            <span>{{ formatDateToReadable(status?.created_at) }}</span>
                                        </td>
                                        <td width="20%">
                                            <p>
                                                {{ status?.form?.title }}
                                            </p>
                                        </td>
                                        <td width="30%">
                                            <p :class="expandedDescription[index] ? '' : 'line-clamp-3'">
                                                {{ status?.form?.description }}
                                            </p>
                                            <button @click="toggleExpanded(index)"
                                                class="mt-2 text-primary text-sm hover:text-primary-700">
                                                {{ expandedDescription[index] ?
                                                    $t('showLess') :
                                                    $t('showMore') }}
                                            </button>
                                        </td>
                                        <td width="20%">
                                            <span>
                                                {{ status?.user?.firstname + ' ' + status?.user?.lastname }}
                                            </span>
                                        </td>
                                        <td width="15%">
                                            <div class="flex items-end gap-2">
                                                <FormButton class="rounded-md" buttonSize="sm"
                                                    @click="downloadStatus(status)">
                                                    <Icon name="ph:download" class="size-4" />
                                                    {{ $t('plansandgoals.table.actions.download') }}
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
                <DialogConfirmation :isModalOpen="state.modal.isDeleteStatusOpen"
                    :message="`${$t('plansandgoals.confirmation.deleteStatusConfirmation')}?`"
                    @close="state.modal.isDeleteStatusOpen = false" @confirm="deleteStatus" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { planGoalSubgoalService } from '@/components/api/user/PlanGoalSubgoalService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const expandedDescription = reactive([] as boolean[])

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
        { name: 'plansandgoals.table.dateCreated', sorter: true, key: 'created_at' },
        { name: 'plansandgoals.table.title' },
        { name: 'plansandgoals.table.description' },
        { name: 'plansandgoals.table.createdBy' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteStatusOpen: false,
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
            plan_goal_subgoal_uuid: props.selectedData?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await planGoalSubgoalService.getPlanGoalSubgoalStatuses(params)
        if (response) {
            state.statuses = response
            expandedDescription.splice(0, expandedDescription.length, ...response.data.map(() => false))
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

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchStatuses()
}

function toggleExpanded(index: number) {
    expandedDescription[index] = !expandedDescription[index]
}

async function downloadStatus(status: any) {
    state.isTableLoading = true
    state.error = {}
    try {
        const attachmentUuid = status?.uuid
        const response = await planGoalSubgoalService.downloadPlanGoalSubgoalStatuses(attachmentUuid)
        if (response) {
            saveAs(response)
        }
    } catch (error: any) {
        state.error.message = error?.message || 'An error occurred during the download.'
    }
    state.isTableLoading = false
}

function confirmStatusDeletion(status: any) {
    state.selectedStatus = status
    state.modal.isDeleteStatusOpen = true
}

async function deleteStatus() {
    state.error = {}
    state.isTableLoading = true
    try {
        const attachmentUuid = state.selectedStatus?.uuid
        const response = await planGoalSubgoalService.deletePlanGoalSubgoalStatuses(attachmentUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.statusSuccessfullyDeleted')}.`)
            fetchStatuses()
            state.modal.isDeleteStatusOpen = false
        }
    } catch (error: any) {
        state.error.message = error?.message || 'An error occurred during the deletion.'
    }
    state.isTableLoading = false
}
</script>