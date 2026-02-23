<template>
    <div>
        <Modal size="2xl" :title="$t('dutySchedules.shareDutySchedule.sharedDutySchedule')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="flex justify-end items-center gap-x-5 mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isShareDutySchedulesOpen = true">
                        <Icon name="ph:share-fat" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dutySchedules.shareDutySchedule.shareDutySchedule') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.shared_schedules"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.shared_schedules?.data?.length === 0))">
                                <tr v-for="(shared_schedule, index) in state.shared_schedules?.data" :key="index">
                                    <td width="35%">
                                        <p class="text-primary hover:text-primary-700 cursor-pointer"
                                            @click="navigateToExternalLink(`${runtimeConfig.public.appBaseURL}/guest/duty-schedules/${shared_schedule?.uuid}`)">
                                            {{
                                                `${runtimeConfig.public.appBaseURL}/guest/duty-schedules/${shared_schedule?.uuid}`
                                            }}
                                        </p>
                                    </td>
                                    <td width="35%">
                                        <div class="text-xs flex flex-wrap gap-1">
                                            <span v-for="(employee, index) in shared_schedule?.share_link_details"
                                                :key=index class="bg-primary px-2 py-1 text-white rounded-md">
                                                {{ employee?.shareable?.firstname + ' ' + (employee?.shareable?.lastname
                                                    ?? '') }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteSharedDutyScheduleConfirmation(shared_schedule)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('absences.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.shared_schedules" @previous="previous" @next="next" />
                </div>

                <ModulesUserDutyScheduleShareModalShare :isModalOpen="state.modal.isShareDutySchedulesOpen"
                    @close="state.modal.isShareDutySchedulesOpen = false"
                    @refreshSharedDutySchedules="fetchSharedDutySchedules" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteSharedJournalLink"
                    :message="$t('dutySchedules.shareDutySchedule.table.confirmation.deleteLinkConfirmation') + '?'"
                    @close="state.modal.isDeleteSharedJournalLink = false" @confirm="deleteSharedDutySchedule" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const { successAlert } = useAlert()
const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'dutySchedules.shareDutySchedule.table.link', isTranslateName: true, },
        { name: 'dutySchedules.shareDutySchedule.table.employee', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    shared_schedules: [] as any,
    isTableLoading: false,
    modal: {
        isShareDutySchedulesOpen: false,
        isDeleteSharedJournalLink: false,
    },
    selectedSharedDutySchedule: {} as any,
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
        fetchSharedDutySchedules()
    }
})

async function fetchSharedDutySchedules() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await dutyScheduleService.getSharedDutySchedules(params)
        if (response) {
            state.shared_schedules = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchSharedDutySchedules()
}

function next() {
    currentTablePage++
    fetchSharedDutySchedules()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchSharedDutySchedules()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchSharedDutySchedules()
}

function deleteSharedDutyScheduleConfirmation(sharedDutySchedule: any) {
    state.selectedSharedDutySchedule = sharedDutySchedule
    state.modal.isDeleteSharedJournalLink = true
}

async function deleteSharedDutySchedule() {
    state.error = {}
    state.isTableLoading = true
    try {
        const selectedSharedDutyScheduleUuid = state.selectedSharedDutySchedule.uuid
        const response = await dutyScheduleService.deleteSharedDutySchedules(selectedSharedDutyScheduleUuid)
        if (response) {
            fetchSharedDutySchedules()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.shareDutySchedule.table.alert.linkSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>