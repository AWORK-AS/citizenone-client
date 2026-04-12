<template>
    <div>
        <Modal size="5xl" :title="$t('timeLogs.interventionHours.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isLoading">
                    <!-- Search and Table -->
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />

                        <TableSearch @search="handleSearch" />

                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.interventionHours"
                                :isLoading="state.isLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isLoading || (state.interventionHours?.data?.length === 0))">
                                    <tr v-for="(hour, index) in state.interventionHours?.data" :key="index">
                                        <td width="15%">
                                            <div class="flex items-center gap-x-2">
                                                <img :src="hour?.citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${hour?.citizen?.firstname + ' ' + hour?.citizen?.lastname}`"
                                                    class="rounded-full w-8 h-8 object-cover" />
                                                <span>{{ hour?.citizen?.firstname }} {{ hour?.citizen?.lastname
                                                    }}</span>
                                            </div>
                                        </td>
                                        <td width="12%">
                                            {{ hour?.date_time_start ? formatDateTimeToReadable(hour.date_time_start) :
                                            '-' }}
                                        </td>
                                        <td width="12%">
                                            {{ hour?.date_time_end ? formatDateTimeToReadable(hour.date_time_end) : '-'
                                            }}
                                        </td>
                                        <td width="20%">
                                            <div class="truncate" :title="hour?.note">{{ hour?.note || '-' }}</div>
                                        </td>
                                        <td width="8%">
                                            <span class="font-semibold">{{ formatNumber(language.locale.value,
                                                hour?.total_hours) }}</span>
                                        </td>
                                        <td width="10%">
                                            <div v-if="hour?.is_transportation"
                                                class="rounded-xl bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold text-center w-fit">
                                                {{ $t('timeLogs.interventionHours.transport') }}
                                            </div>
                                            <div v-else
                                                class="rounded-xl bg-teal-100 text-tertiary-800 px-2 py-1 text-xs font-semibold text-center w-fit">
                                                {{ $t('timeLogs.interventionHours.work') }}
                                            </div>
                                        </td>
                                        <td width="15%">
                                            <div class="flex items-center gap-x-2">
                                                <img :src="hour?.user?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${hour?.user?.firstname + ' ' + hour?.user?.lastname}`"
                                                    class="rounded-full w-6 h-6 object-cover" />
                                                <span class="text-sm">{{ hour?.user?.firstname }} {{
                                                    hour?.user?.lastname }}</span>
                                            </div>
                                        </td>
                                        <td width="8%">
                                            <FormButton type="button" buttonStyle="action" @click="viewLog(hour)">
                                                <Icon name="ph:eye" class="size-4" />
                                            </FormButton>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>

                        <Pagination :data="state.interventionHours" @previous="previous" @next="next" />
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>

        <!-- Modal to view location logs for transport -->
        <ModulesUserCitizenInterventionHoursModalViewLog :selectedCareHour="state.selectedHour"
            :isModalOpen="state.modal.isViewLogOpen" @close="state.modal.isViewLogOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])

const { formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'timeLogs.interventionHours.table.citizen', isTranslateName: true, sorter: true, key: 'citizen' },
        { name: 'timeLogs.interventionHours.table.dateTimeStart', isTranslateName: true, sorter: true, key: 'date_time_start' },
        { name: 'timeLogs.interventionHours.table.dateTimeEnd', isTranslateName: true, sorter: true, key: 'date_time_end' },
        { name: 'timeLogs.interventionHours.table.note', isTranslateName: true },
        { name: 'timeLogs.interventionHours.table.totalHours', isTranslateName: true },
        { name: 'timeLogs.interventionHours.table.type', isTranslateName: true, sorter: true, key: 'is_transportation' },
        { name: 'timeLogs.interventionHours.table.employee', isTranslateName: true },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isLoading: false,
    interventionHours: [] as any,
    modal: {
        isViewLogOpen: false,
    },
    selectedHour: null as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        fetchInterventionHours()
    }
})

function closeModal() {
    emit('close')
}

async function fetchInterventionHours() {
    state.error = {}
    state.isLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await interventionHoursService.getInterventionHourTimeLogs(params)
        if (response) {
            state.interventionHours = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function viewLog(hour: any) {
    state.selectedHour = hour
    state.modal.isViewLogOpen = true
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
</script>