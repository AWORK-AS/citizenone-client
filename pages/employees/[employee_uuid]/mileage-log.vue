<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('mileageLog.mileageLog') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('mileageLog.mileageLog') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserEmployeeTabs />

                <div class="mt-10 space-y-5">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <LoadingSpinner :isActive="state.isSummaryLoading">
                            <div class="border-l-4 border-secondary shadow-md rounded-md px-4 py-3">
                                <p class="text-xs">{{ $t('mileageLog.summary.totalKm') }}</p>
                                <p class="text-sm">{{ formatNumber(language.locale.value, state.summary?.data?.total_kilometers || 0) }} km</p>
                            </div>
                        </LoadingSpinner>
                        <LoadingSpinner :isActive="state.isSummaryLoading">
                            <div class="border-l-4 border-secondary shadow-md rounded-md px-4 py-3">
                                <p class="text-xs">{{ $t('mileageLog.summary.totalTrips') }}</p>
                                <p class="text-sm">{{ state.summary?.data?.total_trips || 0 }}</p>
                            </div>
                        </LoadingSpinner>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <button class="flex items-center gap-x-1 text-sm text-primary group"
                            @click="state.modal.isFilterOpen = true">
                            <Icon name="ic:outline-filter-list" class="text-primary w-6 h-6 group-hover:text-primary-700" />
                            <span class="group-hover:text-primary-700">{{ $t('filter') }}</span>
                        </button>
                        <FormButton buttonStyle="action" @click="state.modal.isDownloadOpen = true">
                            <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('mileageLog.download.download') }}
                        </FormButton>
                    </div>

                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.mileageLogs"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.mileageLogs?.data?.length === 0))">
                                <tr v-for="(log, index) in state.mileageLogs?.data" :key="index">
                                    <td width="15%">
                                        <span class="truncate" v-if="log?.date_time_start">
                                            {{ formatDateTimeToReadable(log?.date_time_start) }}
                                        </span>
                                    </td>
                                    <td width="35%">
                                        <span class="truncate">{{ routeSummary(log) }}</span>
                                    </td>
                                    <td width="15%">
                                        {{ formatNumber(language.locale.value, log?.kilometers) }} km
                                    </td>
                                    <td width="20%">
                                        <div v-if="log?.citizen"
                                            class="rounded-xl bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold text-center w-fit">
                                            {{ log?.citizen?.firstname }} {{ log?.citizen?.lastname }}
                                        </div>
                                        <div v-else
                                            class="rounded-xl bg-teal-100 text-tertiary-800 px-2 py-1 text-xs font-semibold text-center w-fit">
                                            {{ $t('mileageLog.filter.notLinked') }}
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <FormButton type="button" buttonStyle="action" @click="viewMileageLog(log)">
                                            <Icon name="ph:eye" class="size-4" />
                                            {{ $t('mileageLog.table.actions.view') }}
                                        </FormButton>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.mileageLogs" @previous="previous" @next="next" />
                </div>
            </div>

            <ModulesUserMileageLogModalView :isModalOpen="state.modal.isViewOpen"
                :selectedMileageLog="state.selectedMileageLog" @close="state.modal.isViewOpen = false" />
            <ModulesUserMileageLogModalFilter type="employee" :isModalOpen="state.modal.isFilterOpen"
                @close="state.modal.isFilterOpen = false" @setFilter="setFilter" />
            <ModulesUserMileageLogDownloadModal :isModalOpen="state.modal.isDownloadOpen"
                :employeeUuid="employeeUuid?.toString()" :filters="state.filter"
                @close="state.modal.isDownloadOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { mileageLogService } from '@/components/api/user/MileageLogService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
const router = useRouter()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'employees.employees',
        translate: true,
        href: '/employees',
    },
    {
        name: 'mileageLog.mileageLog',
        translate: true,
        href: `/employees/${employeeUuid}/mileage-log`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'mileageLog.table.date', isTranslateName: true, sorter: true, key: 'date_time_start' },
        { name: 'mileageLog.table.route', isTranslateName: true, },
        { name: 'mileageLog.table.distance', isTranslateName: true, },
        { name: 'mileageLog.table.citizen', isTranslateName: true, },
        { name: '' },
    ],
    error: {} as Error,
    filter: {
        citizen_link: '' as any,
        start_date: '',
        end_date: '',
    },
    isSummaryLoading: false,
    isTableLoading: false,
    mileageLogs: [] as any,
    modal: {
        isDownloadOpen: false,
        isFilterOpen: false,
        isViewOpen: false,
    },
    selectedMileageLog: {} as any,
    sortData: {
        sortField: 'date_time_start',
        sortOrder: 'descend',
    },
    summary: {} as any,
})

onMounted(() => {
    fetchMileageLogs()
    fetchSummary()
})

function routeSummary(log: any) {
    const middle = (log?.stops ?? []).slice().sort((a: any, b: any) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0))
    const addresses = [log?.start_address, ...middle.map((s: any) => s.address), log?.end_address].filter(Boolean)
    return addresses.join(' → ')
}

async function fetchMileageLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        } as any

        if (state.filter.citizen_link === 'linked') {
            params.has_citizen = true
        } else if (state.filter.citizen_link === 'unlinked') {
            params.has_citizen = false
        }
        if (state.filter.start_date && state.filter.end_date) {
            params.start_date = state.filter.start_date
            params.end_date = state.filter.end_date
        }

        const response = await mileageLogService.getByEmployeeMileageLogs(employeeUuid, params)
        if (response) {
            state.mileageLogs = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchSummary() {
    state.isSummaryLoading = true
    try {
        const params = {
            user_uuids: Array(employeeUuid),
            start_date: state.filter.start_date,
            end_date: state.filter.end_date,
        }
        const response = await mileageLogService.getMileageSummary(params)
        if (response) {
            state.summary = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSummaryLoading = false
}

function previous() {
    currentTablePage--
    fetchMileageLogs()
}

function next() {
    currentTablePage++
    fetchMileageLogs()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchMileageLogs()
}

function setFilter(filter: any) {
    state.filter.citizen_link = filter.citizen_link
    state.filter.start_date = filter.date_range?.[0]
    state.filter.end_date = filter.date_range?.[1]
    fetchMileageLogs()
    fetchSummary()
}

function viewMileageLog(log: any) {
    state.selectedMileageLog = log
    state.modal.isViewOpen = true
}
</script>
