<template>
    <div>
        <Modal size="3xl" :title="$t('citizens.treatments.statuses.statuses')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isAddStatusOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.treatments.statuses.newStatus') }}
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
                                            <span>{{ formatDateToReadable(status?.date) }}</span>
                                        </td>
                                        <td width="20%">
                                            <Badge type="primary" class="w-fit" v-if="status?.area_type">
                                                <p class="text-xxs truncate">
                                                    <span v-if="status?.area_type === 'functional_level'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.functionalLevel')
                                                        }}
                                                    </span>
                                                    <span v-if="status?.area_type === 'musculoskeletal_system'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.musculoskeletalSystem')
                                                        }}
                                                    </span>
                                                    <span v-if="status?.area_type === 'nutrition'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.nutrition')
                                                        }}
                                                    </span>
                                                    <span v-if="status?.area_type === 'skin_and_mucous_membranes'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.skinAndMucousMembranes')
                                                        }}
                                                    </span>
                                                    <span v-if="status?.area_type === 'communication'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.communication')
                                                        }}
                                                    </span>
                                                    <span v-if="status?.area_type === 'psychosocial_conditions'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.psychosocialConditions')
                                                        }}
                                                    </span>
                                                    <span v-if="status?.area_type === 'respiration_and_circulation'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.respirationAndCirculation')
                                                        }}
                                                    </span>
                                                    <span v-if="status?.area_type === 'sexuality'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.sexuality')
                                                        }}
                                                    </span>
                                                    <span v-if="status?.area_type === 'pain_and_sensory_impressions'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.painAndSensoryImpressions')
                                                        }}
                                                    </span>
                                                    <span v-if="status?.area_type === 'sleep_and_rest'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.sleepAndRest')
                                                        }}
                                                    </span>
                                                    <span v-if="status?.area_type === 'knowledge_and_development'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.knowledgeAndDevelopment')
                                                        }}
                                                    </span>
                                                    <span v-if="status?.area_type === 'excretion_of_waste'">
                                                        {{
                                                            $t('citizens.treatments.statuses.areaTypes.excretionOfWaste')
                                                        }}
                                                    </span>
                                                </p>
                                            </Badge>
                                            <div v-html="status.status" class="content" />
                                            <Badge type="primary" class="w-fit" v-if="status.score">
                                                <p class="text-xxs truncate" v-if="status.score == 1">
                                                    {{
                                                        $t('citizens.treatments.statuses.expectedLevels.minorChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs truncate" v-if="status.score == 2">
                                                    {{
                                                        $t('citizens.treatments.statuses.expectedLevels.moderateChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs truncate" v-if="status.score == 3">
                                                    {{
                                                        $t('citizens.treatments.statuses.expectedLevels.significantChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs truncate" v-if="status.score == 4">
                                                    {{
                                                        $t('citizens.treatments.statuses.expectedLevels.severeChallenges')
                                                    }}
                                                </p>
                                                <p class="text-xxs truncate" v-if="status.score == 5">
                                                    {{
                                                        $t('citizens.treatments.statuses.expectedLevels.verySubstantialChallenges')
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
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <FormButton class="rounded-md" buttonSize="sm"
                                                    @click="editStatus(status)" v-if="status?.is_editable">
                                                    <Icon name="ph:pencil" class="size-4" />
                                                    {{ $t('citizens.treatments.statuses.table.actions.edit') }}
                                                </FormButton>
                                                <FormButton class="rounded-md" buttonSize="sm"
                                                    @click="confirmStatusDeletion(status)" v-if="status?.is_deletable">
                                                    <Icon name="heroicons:trash" class="size-4" />
                                                    {{ $t('citizens.treatments.statuses.table.actions.delete') }}
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
                <ModulesUserCitizenTreatmentStatusModalNew :isModalOpen="state.modal.isAddStatusOpen"
                    :selectedTreatment="props.selectedTreatment" :selectedStatus="state.selectedStatus"
                    @close="state.modal.isAddStatusOpen = false" @refreshStatuses="fetchStatuses" />
                <ModulesUserCitizenTreatmentStatusModalEdit :isModalOpen="state.modal.isEditStatusOpen"
                    :selectedStatus="state.selectedStatus" @close="state.modal.isEditStatusOpen = false"
                    @refreshStatuses="fetchStatuses" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteStatusOpen"
                    :message="`${$t('citizens.treatments.statuses.table.confirmation.deleteStatusConfirmation')}?`"
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
    selectedTreatment: {
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
        { name: 'citizens.treatments.statuses.table.date' },
        { name: 'citizens.treatments.statuses.table.status', sorter: true, key: 'status' },
        { name: 'citizens.treatments.statuses.table.dateCreated' },
        { name: 'citizens.treatments.statuses.table.createdBy' },
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
            model_uuid: props.selectedTreatment?.uuid,
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
            successAlert(`${t('alert.success')}!`, `${t('citizens.treatments.statuses.table.alert.statusSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>