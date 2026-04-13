<template>
    <div>
        <Modal size="4xl" :title="$t('citizens.useOfForce.statuses.statuses')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" @click="state.modal.isAddStatusOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.useOfForce.statuses.newStatus') }}
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
                                            <div v-html="status.status" class="content" />
                                            <Badge type="primary" class="w-fit" v-if="status.score">
                                                <p class="text-xxs" v-if="status.score == 1">
                                                    {{
                                                        $t('citizens.useOfForce.statuses.currentLevels.minorChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="status.score == 2">
                                                    {{
                                                        $t('citizens.useOfForce.statuses.currentLevels.moderateChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="status.score == 3">
                                                    {{
                                                        $t('citizens.useOfForce.statuses.currentLevels.significantChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="status.score == 4">
                                                    {{
                                                        $t('citizens.useOfForce.statuses.currentLevels.severeChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs" v-if="status.score == 5">
                                                    {{
                                                        $t('citizens.useOfForce.statuses.currentLevels.verySubstantialChallenges')
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
                                                <FormButton buttonSize="sm" @click="editStatus(status)"
                                                    v-if="status?.is_editable">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                    {{ $t('citizens.useOfForce.statuses.table.actions.edit') }}
                                                </FormButton>
                                                <FormButton buttonSize="sm" @click="confirmStatusDeletion(status)"
                                                    v-if="status?.is_deletable">
                                                    <Icon name="heroicons:trash" class="size-4" />
                                                    {{ $t('citizens.useOfForce.statuses.table.actions.delete') }}
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
                <ModulesUserCitizenUseOfForceStatusModalNew :isModalOpen="state.modal.isAddStatusOpen"
                    :selectedData="props.selectedData" :selectedStatus="state.selectedStatus"
                    @close="state.modal.isAddStatusOpen = false" @refreshStatuses="fetchStatuses" />
                <ModulesUserCitizenUseOfForceStatusModalEdit :isModalOpen="state.modal.isEditStatusOpen"
                    :selectedStatus="state.selectedStatus" @close="state.modal.isEditStatusOpen = false"
                    @refreshStatuses="fetchStatuses" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteStatusOpen"
                    :message="`${$t('citizens.useOfForce.statuses.confirmation.deleteStatusConfirmation')}?`"
                    @close="state.modal.isDeleteStatusOpen = false" @confirm="deleteStatus" />
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
    columnHeaders: [
        { name: 'citizens.useOfForce.statuses.table.title', isTranslateName: true, sorter: true, key: 'title' },
        { name: 'citizens.useOfForce.statuses.table.status', isTranslateName: true, sorter: true, key: 'status' },
        { name: 'citizens.useOfForce.statuses.table.dateCreated', isTranslateName: true, },
        { name: 'citizens.useOfForce.statuses.table.createdBy', isTranslateName: true, },
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

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
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