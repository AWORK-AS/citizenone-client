<template>
    <div>
        <Modal size="3xl" :title="$t('citizens.interventionHours.interventionHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="flex items-center gap-x-2 justify-end">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isAddInterventionHoursOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.interventionHours.newInterventionHours') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isDownloadInterventionHoursOpen = true">
                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.interventionHours.download.download') }}
                    </FormButton>
                </div>
                <div class="mt-5 space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.interventionHours"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.interventionHours?.data?.length === 0))">
                                <tr v-for="(inteventionHours, index) in state.interventionHours?.data" :key="index">
                                    <td width="15%">
                                        {{ formatDateTimeToReadable(inteventionHours?.date_time_start) }}
                                    </td>
                                    <td width="15%">
                                        {{ formatDateTimeToReadable(inteventionHours?.date_time_end) }}
                                    </td>
                                    <td width="20%">
                                        {{ inteventionHours?.note }}
                                    </td>
                                    <td width="10%">
                                        <div class="truncate">
                                            {{ formatNumber(language.locale.value, inteventionHours?.total_hours) }}
                                            <Badge type="primary" class="text-xxs"
                                                v-if="inteventionHours?.is_from_duty_schedule">
                                                {{ $t('citizens.interventionHours.table.fromDutySchedule') }}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        {{ inteventionHours?.user?.firstname + ' ' + inteventionHours?.user?.lastname }}
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editInterventionHours(inteventionHours)"
                                                v-if="inteventionHours?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.interventionHours.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="deleteInterventionHoursConfirmation(inteventionHours)"
                                                v-if="inteventionHours?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizens.interventionHours.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.interventionHours" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenInterventionHoursModalNew :isModalOpen="state.modal.isAddInterventionHoursOpen"
                    @close="state.modal.isAddInterventionHoursOpen = false"
                    @refreshInterventionHours="refreshInterventionHours()" />
                <ModulesUserCitizenInterventionHoursModalEdit :isModalOpen="state.modal.isEditInterventionHoursOpen"
                    :selectedInterventionHours="state.selectedInterventionHours"
                    @close="state.modal.isEditInterventionHoursOpen = false"
                    @refreshInterventionHours="refreshInterventionHours()" />
                <ModulesUserCitizenInterventionHoursModalDownload
                    :isModalOpen="state.modal.isDownloadInterventionHoursOpen"
                    @close="state.modal.isDownloadInterventionHoursOpen = false" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteInterventionHoursOpen"
                    :message="$t('citizens.interventionHours.table.confirmation.deleteInterventionHoursConfirmation') + '?'"
                    @close="state.modal.isDeleteInterventionHoursOpen = false" @confirm="deleteInterventionHours" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
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
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
const { successAlert } = useAlert()
const emit = defineEmits(['close', 'refreshCitizenDetails'])
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'citizens.interventionHours.table.datetimeStart', sorter: true, key: 'date_time_start' },
        { name: 'citizens.interventionHours.table.datetimeEnd', sorter: true, key: 'date_time_end' },
        { name: 'citizens.interventionHours.table.note' },
        { name: 'citizens.interventionHours.table.totalHours' },
        { name: 'citizens.interventionHours.table.createdBy' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddInterventionHoursOpen: false,
        isDeleteInterventionHoursOpen: false,
        isDownloadInterventionHoursOpen: false,
        isEditInterventionHoursOpen: false,
    },
    interventionHours: [] as any,
    selectedInterventionHours: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

function closeModal() {
    emit('close')
}

function refreshInterventionHours() {
    fetchInterventionHours()
    emit('refreshCitizenDetails')
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchInterventionHours()
    }
})

async function fetchInterventionHours() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await interventionHoursService.getInterventionHours(params)
        if (response) {
            state.interventionHours = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchInterventionHours()
}

function next() {
    currentTablePage++
    fetchInterventionHours()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchInterventionHours()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchInterventionHours()
}

function editInterventionHours(inteventionHours: any) {
    state.selectedInterventionHours = inteventionHours
    state.modal.isEditInterventionHoursOpen = true
}

function deleteInterventionHoursConfirmation(inteventionHours: any) {
    state.selectedInterventionHours = inteventionHours
    state.modal.isDeleteInterventionHoursOpen = true
}

async function deleteInterventionHours() {
    state.error = {}
    state.isTableLoading = true
    try {
        const interventionHoursUuid = state.selectedInterventionHours.uuid
        const response = await interventionHoursService.deleteInterventionHours(interventionHoursUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('citizens.interventionHours.table.alert.interventionHoursSuccessfullyDeleted')}.`)
            refreshInterventionHours()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>