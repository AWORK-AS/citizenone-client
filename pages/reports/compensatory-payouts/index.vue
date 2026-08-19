<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('compensatoryPayoutsReport.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('compensatoryPayoutsReport.title') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="flex justify-between items-center mb-2">
                    <button
                        class="flex items-center gap-1.5 outline-none rounded-md text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 text-gray-600"
                        @click="state.modal.isFilterOpen = true">
                        <Icon name="ic:outline-filter-list" class="h-4 w-4" />
                        {{ $t('filter') }}
                        <span v-if="activeFilterCount > 0"
                            class="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">
                            {{ activeFilterCount }}
                        </span>
                    </button>
                    <FormButton buttonStyle="action" @click="exportPayouts">
                        <Icon name="ph:download-simple" class="h-4 w-4" />
                        {{ $t('compensatoryPayoutsReport.export') }}
                    </FormButton>
                </div>

                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.payouts"
                        :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.payouts?.data?.length === 0))">
                            <tr v-for="(payout, index) in state.payouts?.data" :key="index">
                                <td width="30%">
                                    <span>{{ payout?.user?.name ?? '-' }}</span>
                                </td>
                                <td width="25%">
                                    <span>{{ payout?.time_account?.name ?? '-' }}</span>
                                </td>
                                <td width="20%">
                                    <span>{{ formatDateToReadable(payout?.transaction_date) }}</span>
                                </td>
                                <td width="25%">
                                    <span>{{ formatNumber(language.locale.value, Math.abs(payout?.amount ?? 0)) }}</span>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.payouts" @previous="previous" @next="next" />
            </div>

            <Modal size="sm" :title="$t('filter')" :show="state.modal.isFilterOpen"
                @close="state.modal.isFilterOpen = false">
                <template #modal-body>
                    <form @submit.prevent="applyFilter()">
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="filter_date_start"
                                    :label="$t('compensatoryPayoutsReport.filters.dateStart')" />
                                <FormDateField id="filter_date_start" name="filter_date_start"
                                    placeholder="YYYY-MM-DD" v-model="state.filterForm.date_start" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="filter_date_end"
                                    :label="$t('compensatoryPayoutsReport.filters.dateEnd')" />
                                <FormDateField id="filter_date_end" name="filter_date_end"
                                    placeholder="YYYY-MM-DD" v-model="state.filterForm.date_end" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel"
                                    @click="state.modal.isFilterOpen = false">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
                                    {{ $t('filter') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { compensatoryPayoutReportService } from '@/components/api/user/CompensatoryPayoutReportService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const language = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const { isAtLeast, can } = usePermissions()
let currentTablePage = 1

const breadcrumbLinks = [
    { name: 'compensatoryPayoutsReport.title', translate: true, href: '/reports/compensatory-payouts' },
]

onMounted(() => {
    if (!isAtLeast('Admin') && !can('register_time_account_payout')) {
        navigateTo('/reports')
        return
    }
    fetchPayouts()
})

const state = reactive({
    columnHeaders: [
        { name: 'compensatoryPayoutsReport.table.employee', isTranslateName: true, sorter: false, key: 'user' },
        { name: 'compensatoryPayoutsReport.table.account', isTranslateName: true, sorter: false, key: 'time_account' },
        { name: 'compensatoryPayoutsReport.table.date', isTranslateName: true, sorter: true, key: 'transaction_date' },
        { name: 'compensatoryPayoutsReport.table.amount', isTranslateName: true, sorter: false, key: 'amount' },
    ],
    dataFilter: {
        date_start: '',
        date_end: '',
    },
    filterForm: {
        date_start: '',
        date_end: '',
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isFilterOpen: false,
    },
    payouts: [] as any,
    sortData: {
        sortField: 'transaction_date',
        sortOrder: 'descend',
    },
})

const activeFilterCount = computed(() => {
    let count = 0
    if (state.dataFilter.date_start) count++
    if (state.dataFilter.date_end) count++
    return count
})

watch(() => state.modal.isFilterOpen, (isOpen: boolean) => {
    if (isOpen) {
        state.filterForm.date_start = state.dataFilter.date_start
        state.filterForm.date_end = state.dataFilter.date_end
    }
})

function buildParams() {
    const params: any = {
        page: currentTablePage,
        sortField: state.sortData.sortField,
        sortOrder: state.sortData.sortOrder,
    }
    if (state.dataFilter.date_start) params.date_start = state.dataFilter.date_start
    if (state.dataFilter.date_end) params.date_end = state.dataFilter.date_end
    return params
}

async function fetchPayouts() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await compensatoryPayoutReportService.getPayouts(buildParams())
        if (response) {
            state.payouts = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function exportPayouts() {
    state.error = {}
    try {
        const blob = await compensatoryPayoutReportService.exportPayouts(buildParams())
        if (!blob) return

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'compensatory-payouts.xlsx'
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (error: any) {
        state.error = error
    }
}

function applyFilter() {
    state.dataFilter.date_start = state.filterForm.date_start
    state.dataFilter.date_end = state.filterForm.date_end
    state.modal.isFilterOpen = false
    currentTablePage = 1
    fetchPayouts()
}

function previous() {
    currentTablePage--
    fetchPayouts()
}

function next() {
    currentTablePage++
    fetchPayouts()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = { sortField: sortingData.column, sortOrder: sortingData.sort }
    fetchPayouts()
}
</script>
