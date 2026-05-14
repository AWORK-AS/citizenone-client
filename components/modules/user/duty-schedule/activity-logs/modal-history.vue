<template>
    <div>
        <Modal size="3xl" :title="$t('dutySchedules.activityLogs')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.logs"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.logs?.data?.length === 0))">
                                    <tr v-for="(log, index) in state.logs?.data" :key="index">
                                        <td width="25%">
                                            <span>{{ formatDateTimeToReadable(log?.created_at) }}</span>
                                        </td>
                                        <td width="25%">
                                            <span>{{ log?.causer?.firstname + ' ' + log?.causer?.lastname }}</span>
                                        </td>
                                        <td width="50%">
                                            <div class="space-y-2"
                                                :class="expandedDescription[index] ? '' : 'line-clamp-2'">
                                                <Badge type="primary" class="w-fit">
                                                    <p class="text-xxs" v-if="log?.action_type === 'created'">
                                                        {{ $t('activityLogs.table.actionTypes.created') }}
                                                    </p>
                                                    <p class="text-xxs" v-if="log?.action_type === 'deleted'">
                                                        {{ $t('activityLogs.table.actionTypes.deleted') }}
                                                    </p>
                                                    <p class="text-xxs" v-if="log?.action_type === 'published'">
                                                        {{ $t('activityLogs.table.actionTypes.published') }}
                                                    </p>
                                                    <p class="text-xxs" v-if="log?.action_type === 'updated'">
                                                        {{ $t('activityLogs.table.actionTypes.updated') }}
                                                    </p>
                                                </Badge>
                                                <div class="bg-green-200 rounded-md space-y-1 p-4"
                                                    v-if="['created', 'published', 'updated'].includes(log?.action_type)">
                                                    <p class="text-sm font-semibold">
                                                        {{ $t('activityLogs.table.newData') }}
                                                    </p>
                                                    <div class="flex items-center gap-x-1 text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.typeOfShift') }}:
                                                        </p>
                                                        <p>
                                                            <span>
                                                                {{
                                                                    language.locale.value === 'en' ?
                                                                        log?.new_data?.shift?.en_name :
                                                                        language.locale.value === 'no' ?
                                                                            log?.new_data?.shift?.no_name :
                                                                            language.locale.value === 'sv' ?
                                                                                log?.new_data?.shift?.sv_name :
                                                                                log?.new_data?.shift?.dk_name
                                                                }}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div class="flex items-center gap-x-1 text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.dateTimeStart') }}:
                                                        </p>
                                                        <p>
                                                            {{
                                                                formatDateTimeToReadable(log?.new_data?.date_time_start)
                                                            }}
                                                        </p>
                                                    </div>
                                                    <div class="flex items-center gap-x-1 text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.dateTimeEnd') }}:
                                                        </p>
                                                        <p>
                                                            {{
                                                                formatDateTimeToReadable(log?.new_data?.date_time_end)
                                                            }}
                                                        </p>
                                                    </div>
                                                    <div class="flex items-start gap-x-1 text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.note') }}:
                                                        </p>
                                                        <p>
                                                            {{ log?.new_data?.note }}
                                                        </p>
                                                    </div>
                                                    <div class="text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.citizens') }}:
                                                        </p>
                                                        <div>
                                                            <span
                                                                v-for="(citizenSchedule, citizenIndex) in log?.new_data?.citizen_schedules"
                                                                :key="citizenIndex">
                                                                {{ citizenSchedule?.citizen?.firstname + ' ' +
                                                                    citizenSchedule?.citizen?.lastname }}<span
                                                                    v-if="citizenIndex < log?.new_data?.citizen_schedules?.length - 1">,
                                                                </span><span v-else>.</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div class="text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.tags') }}:
                                                        </p>
                                                        <Tooltip :text="tag?.tag"
                                                            v-for="(tag, tagIndex) in log?.new_data?.duty_schedule_tags"
                                                            :key="tagIndex">
                                                            <div class="text-white w-4 h-4 text-xxs rounded-full flex items-center justify-center"
                                                                :style="{ backgroundColor: tag?.color }">
                                                                <span v-if="tag?.tag">
                                                                    {{ tag?.tag?.charAt(0) }}
                                                                </span>
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                    <div class="text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.departments') }}:
                                                        </p>
                                                        <div>
                                                            <span
                                                                v-for="(department, departmentIndex) in log?.new_data?.departments"
                                                                :key="departmentIndex">
                                                                {{ department?.name }}<span
                                                                    v-if="departmentIndex < log?.new_data?.departments.length - 1">,
                                                                </span><span v-else>.</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="bg-yellow-100 rounded-md space-y-1.5 p-4 mt-3"
                                                    v-if="log?.old_data && ['deleted', 'published', 'updated'].includes(log?.action_type)">
                                                    <p class="text-sm font-semibold">
                                                        {{ $t('activityLogs.table.previousData') }}
                                                    </p>
                                                    <div class="flex items-center gap-x-1 text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.typeOfShift') }}:
                                                        </p>
                                                        <p>
                                                            <span>
                                                                {{
                                                                    language.locale.value === 'en' ?
                                                                        log?.old_data?.shift?.en_name :
                                                                        language.locale.value === 'no' ?
                                                                            log?.old_data?.shift?.no_name :
                                                                            language.locale.value === 'sv' ?
                                                                                log?.old_data?.shift?.sv_name :
                                                                                log?.old_data?.shift?.dk_name
                                                                }}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div class="flex items-center gap-x-1 text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.dateTimeStart') }}:
                                                        </p>
                                                        <p>
                                                            {{
                                                                formatDateTimeToReadable(log?.old_data?.date_time_start)
                                                            }}
                                                        </p>
                                                    </div>
                                                    <div class="flex items-center gap-x-1 text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.dateTimeEnd') }}:
                                                        </p>
                                                        <p>
                                                            {{
                                                                formatDateTimeToReadable(log?.old_data?.date_time_end)
                                                            }}
                                                        </p>
                                                    </div>
                                                    <div class="flex items-start gap-x-1 text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.note') }}:
                                                        </p>
                                                        <p>
                                                            {{ log?.old_data?.note }}
                                                        </p>
                                                    </div>
                                                    <div class="text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.citizens') }}:
                                                        </p>
                                                        <div>
                                                            <span
                                                                v-for="(citizenSchedule, citizenIndex) in log?.old_data?.citizen_schedules"
                                                                :key="citizenIndex">
                                                                {{ citizenSchedule?.citizen?.firstname + ' ' +
                                                                    citizenSchedule?.citizen?.lastname }}<span
                                                                    v-if="citizenIndex < log?.old_data?.citizen_schedules?.length - 1">,
                                                                </span><span v-else>.</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div class="text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.tags') }}:
                                                        </p>
                                                        <Tooltip :text="tag?.tag"
                                                            v-for="(tag, tagIndex) in log?.old_data?.duty_schedule_tags"
                                                            :key="tagIndex">
                                                            <div class="text-white w-4 h-4 text-xxs rounded-full flex items-center justify-center"
                                                                :style="{ backgroundColor: tag?.color }">
                                                                <span v-if="tag?.tag">
                                                                    {{ tag?.tag?.charAt(0) }}
                                                                </span>
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                    <div class="text-sm">
                                                        <p class="font-semibold">
                                                            {{ $t('activityLogs.table.data.departments') }}:
                                                        </p>
                                                        <div>
                                                            <span
                                                                v-for="(department, departmentIndex) in log?.old_data?.departments"
                                                                :key="departmentIndex">
                                                                {{ department?.name }}<span
                                                                    v-if="departmentIndex < log?.old_data?.departments.length - 1">,
                                                                </span><span v-else>.</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button @click="toggleExpanded(index)"
                                                class="mt-3 text-primary text-sm hover:text-primary-700">
                                                {{ expandedDescription[index] ?
                                                    $t('showLess') :
                                                    $t('showMore') }}
                                            </button>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.logs" @previous="previous" @next="next" />
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
})

const { formatDateTimeToReadable } = useDatetimeFormatter()
const language = useI18n()
const expandedDescription = reactive([] as boolean[])
let currentTablePage = 1
const emit = defineEmits(['close'])

const state = reactive({
    columnHeaders: [
        { name: 'activityLogs.table.createdAt', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'activityLogs.table.user', isTranslateName: true, },
        { name: 'activityLogs.table.description', isTranslateName: true, },
    ],
    error: {} as Error,
    isTableLoading: false,
    logs: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
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
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder
        }
        const response = await dutyScheduleService.getDutySchedulesActivityLogs(params)
        if (response) {
            state.logs = response
            expandedDescription.splice(0, expandedDescription.length, ...response.data.map(() => false))
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

function toggleExpanded(index: number) {
    expandedDescription[index] = !expandedDescription[index]
}
</script>