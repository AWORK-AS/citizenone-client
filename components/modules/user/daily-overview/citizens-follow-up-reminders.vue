<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="p-5" v-if="state.citizensWithFollowUps?.data?.length === 0">
            <div
                class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-80 max-h-80 text-sm mt-2">
                {{ $t('overview.followUpReminders.noFollowUps') }}
            </div>
        </div>

        <div class="text-sm space-y-2 divide-y overflow-scroll min-h-96 max-h-96 px-5 py-4" v-else>
            <div v-for="(citizen, index) in state.citizensWithFollowUps?.data" :key="index"
                class="pl-4 pr-3 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                @click="navigateToCitizen(citizen)">
                <div class="flex gap-x-3">
                    <div class="relative">
                        <img :src="getCitizenImage(citizen)"
                            class="rounded-full w-12 h-12 object-cover border-2 border-secondary" />
                        <span class="absolute -top-1 -right-1 flex h-5 w-5">
                            <span v-if="isOverdue(getMostUrgentReminder(citizen)?.attachment?.follow_up_date)"
                                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span v-else
                                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <Icon
                                :name="isOverdue(getMostUrgentReminder(citizen)?.attachment?.follow_up_date) ? 'ph:warning-fill' : 'ph:bell-fill'"
                                :class="[
                                    isOverdue(getMostUrgentReminder(citizen)?.attachment?.follow_up_date) ? 'bg-red-500' : 'bg-orange-500',
                                    'relative inline-flex rounded-full h-5 w-5 text-white p-0.5'
                                ]" />
                        </span>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-semibold text-primary">
                            {{ citizen.firstname }} {{ citizen.lastname }}
                        </p>
                        <div class="flex items-center gap-2 mt-1">
                            <span v-if="citizen.reminders.length > 1"
                                class="text-xxs bg-blue-100 text-primary px-2 py-0.5 rounded-full font-medium">
                                {{ citizen.reminders.length }} {{ $t('overview.followUpReminders.reminders') }}
                            </span>
                        </div>
                        <div class="mt-2 space-y-1">
                            <div class="flex items-start gap-x-2">
                                <Icon name="ph:file-text" class="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p class="text-xs text-gray-700 font-medium">
                                    {{ getMostUrgentReminder(citizen)?.attachment?.form?.title }}
                                </p>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <Icon name="ph:calendar" class="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <p :class="[
                                    'text-xs font-medium',
                                    isOverdue(getMostUrgentReminder(citizen)?.attachment?.follow_up_date) ? 'text-red-600' : 'text-secondary'
                                ]">
                                    <span v-if="isOverdue(getMostUrgentReminder(citizen)?.attachment?.follow_up_date)">
                                        {{ $t('overview.followUpReminders.overdue') }}:
                                    </span>
                                    <span
                                        v-else-if="isDueToday(getMostUrgentReminder(citizen)?.attachment?.follow_up_date)">
                                        {{ $t('overview.followUpReminders.dueToday') }}:
                                    </span>
                                    <span v-else>
                                        {{ $t('overview.followUpReminders.dueOn') }}:
                                    </span>
                                    {{
                                        formatDateToReadable(getMostUrgentReminder(citizen)?.attachment?.follow_up_date)
                                    }}
                                </p>
                            </div>
                            <div class="flex items-center gap-x-2"
                                v-if="getMostUrgentReminder(citizen)?.attachment?.user">
                                <Icon name="ph:user" class="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <p class="text-xxs text-gray-500">
                                    {{ $t('overview.createdBy') }}
                                    {{ getMostUrgentReminder(citizen)?.attachment?.user?.firstname }}
                                    {{ getMostUrgentReminder(citizen)?.attachment?.user?.lastname }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { reportService } from '@/components/api/user/ReportService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const props = defineProps({
    dateRange: {
        type: Object,
        required: false,
    },
})

const departmentStore = useDepartmentStore()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    isPageLoading: false,
    citizensWithFollowUps: [] as any,
    error: {} as Error,
})

watch(() => props.dateRange, () => {
    fetchCitizensWithFollowUps()
}, { deep: true })

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizensWithFollowUps()
    }
})

onMounted(() => {
    fetchCitizensWithFollowUps()
})

async function fetchCitizensWithFollowUps() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName,
        }

        if (props.dateRange) {
            params.end_date = props.dateRange.end_date
            params.start_date = props.dateRange.start_date
        }
        const response = await reportService.getUserReportFollowUp(params)
        if (response) {
            state.citizensWithFollowUps = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function isOverdue(followUpDate: string): boolean {
    return moment(followUpDate).isBefore(moment(), 'day')
}

function isDueToday(followUpDate: string): boolean {
    return moment(followUpDate).isSame(moment(), 'day')
}
function getMostUrgentReminder(citizen: any): any {
    if (!citizen?.reminders || citizen.reminders.length === 0) {
        return null
    }
    const sortedReminders = [...citizen.reminders].sort((a: any, b: any) => {
        const dateA = moment(a?.attachment?.follow_up_date)
        const dateB = moment(b?.attachment?.follow_up_date)
        return dateA.diff(dateB)
    })

    return sortedReminders[0]
}
function getCitizenImage(citizen: any): string {
    const firstReminder = citizen?.reminders?.[0]
    const citizenData = firstReminder?.attachment?.model?.citizen

    if (citizenData?.image) {
        return citizenData.image
    }

    const name = `${citizen?.firstname || ''} ${citizen?.lastname || ''}`
    return `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${encodeURIComponent(name)}`
}
function navigateToCitizen(citizen: any) {
    const firstReminder = citizen?.reminders?.[0]
    const citizenUuid = firstReminder?.attachment?.model?.citizen?.uuid

    if (citizenUuid) {
        navigateTo(`/citizens/${citizenUuid}/journals`)
    }
}
</script>
