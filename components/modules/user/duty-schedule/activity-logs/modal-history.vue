<template>
    <div>
        <Modal size="xl" :title="modalTitle" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.logs"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.logs?.data?.length === 0))">
                                    <tr v-for="(log, index) in state.logs?.data" :key="log?.uuid ?? log?.id ?? index">
                                        <td width="200" class="align-top">
                                            <span class="text-sm text-gray-600">
                                                {{ formatDateTimeToReadable(log?.created_at) }}
                                            </span>
                                        </td>
                                        <td class="align-top">
                                            <div class="space-y-2">
                                                <div class="flex items-center gap-2 flex-wrap">
                                                    <Badge type="primary" class="w-fit shrink-0">
                                                        <p class="text-xxs">
                                                            {{
                                                                $t(`activityLogs.table.actionTypes.${log?.action_type}`)
                                                            }}
                                                        </p>
                                                    </Badge>
                                                    <p class="text-sm font-semibold text-gray-900">
                                                        {{ log?.title }}
                                                    </p>
                                                </div>
                                                <p class="text-xs text-gray-500" v-if="log?.employee">
                                                    {{ $t('activityLogs.table.employee') }}: {{ log.employee }}
                                                </p>
                                                <ul class="space-y-1" v-if="log?.changes && log.changes.length > 0">
                                                    <li class="text-sm text-gray-600 flex flex-wrap items-center gap-x-1"
                                                        v-for="(change, changeIndex) in log.changes" :key="changeIndex">
                                                        <span class="font-medium text-gray-700">
                                                            {{ change.label }}:
                                                        </span>
                                                        <span>{{ change.old ?? '-' }}</span>
                                                        <Icon name="heroicons:arrow-right" class="h-3 w-3 text-gray-400"
                                                            aria-hidden="true" />
                                                        <span>{{ change.new ?? '-' }}</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination v-if="showPagination" :data="state.logs" @previous="previous" @next="next" />
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    date: {
        type: String,
        required: false,
        default: null,
    },
})

const { formatDateTimeToReadable, formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()
let currentTablePage = 1
const emit = defineEmits(['close'])

const state = reactive({
    columnHeaders: [
        { name: 'activityLogs.table.createdAt', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'activityLogs.table.description', isTranslateName: true },
    ],
    error: {} as Error,
    isTableLoading: false,
    logs: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

const modalTitle = computed(() => props.date
    ? t('dutySchedules.activityLogsForDate', { date: formatDateToReadable(props.date) })
    : t('dutySchedules.activityLogs'))

const showPagination = computed(() => (state.logs?.meta?.last_page ?? 1) > 1)

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        currentTablePage = 1
        fetchActivityLogs()
    }
})

function closeModal() {
    emit('close')
}

async function fetchActivityLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        if (props.date) {
            params.date = props.date
        }
        const response = await dutyScheduleService.getDutySchedulesActivityLogs(params)
        if (response) {
            state.logs = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchActivityLogs()
}

function next() {
    currentTablePage++
    fetchActivityLogs()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchActivityLogs()
}
</script>
