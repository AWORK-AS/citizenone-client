<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{
                        $t('superadmin.dashboard.companyStorage.companyStorage') }} - {{ runtimeConfig?.public?.appName
                    }}
                </Title>
            </Head>

            <template #header>{{ $t('superadmin.dashboard.companyStorage.companyStorage') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/dashboard">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <div class="mt-5 space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.companyStorage"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.companyStorage?.data?.length === 0))">
                                <tr v-for="(company, index) in state.companyStorage?.data" :key="index"
                                    class="hover:bg-[#F9FAFB] cursor-pointer"
                                    @click="navigateTo(`/superadmin/companies/${company.uuid}/overview`)">
                                    <td width="28%">
                                        <span>{{ company?.name }}</span>
                                    </td>
                                    <td width="16%">
                                        <span :class="usageTextClass(company)">
                                            {{ formatGb(company?.storage_used_gb) }} GB
                                        </span>
                                    </td>
                                    <td width="16%">
                                        <span>{{ formatGb(company?.storage_quota_gb) }} GB</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-center gap-2">
                                            <div class="h-1.5 w-24 bg-[#F5F6F8] rounded-full overflow-hidden">
                                                <div class="h-full rounded-full" :class="usageBarClass(company)"
                                                    :style="`width:${usagePercent(company)}%`"></div>
                                            </div>
                                            <span class="text-[12px]" :class="usageTextClass(company)">
                                                {{ usagePercent(company) }}%
                                            </span>
                                        </div>
                                    </td>
                                    <td width="12%">
                                        <span>{{ formatAmount(company?.storage_paid) }}</span>
                                    </td>
                                    <td width="8%">
                                        <span class="text-[12px] text-[#8891A4]">
                                            {{ company?.storage_used_at ? formatMeasuredAt(company.storage_used_at) : '—' }}
                                        </span>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.companyStorage" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useAmountFormatter } from '@/composables/amountFormatter'
import { dashboardService } from '@/components/api/superadmin/DashboardService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
let currentTablePage = 1

const state = reactive({
    companyStorage: [] as any,
    columnHeaders: [
        { name: 'superadmin.dashboard.companyStorage.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'superadmin.dashboard.companyStorage.table.storageUsed', isTranslateName: true, sorter: true, key: 'storage_used_bytes' },
        { name: 'superadmin.dashboard.companyStorage.table.storageQuota', isTranslateName: true, },
        { name: 'superadmin.dashboard.companyStorage.table.usage', isTranslateName: true, },
        { name: 'superadmin.dashboard.companyStorage.table.storagePaid', isTranslateName: true, },
        { name: 'superadmin.dashboard.companyStorage.table.measuredAt', isTranslateName: true, },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'storage_used_bytes',
        sortOrder: 'descend',
    },
})

const formatGb = (value: any) => Number(value ?? 0).toLocaleString('da-DK', { maximumFractionDigits: 2 })

function usagePercent(company: any) {
    const quota = Number(company?.storage_quota_gb ?? 0)
    if (!quota) return 0
    return Math.min(100, Math.round((Number(company?.storage_used_gb ?? 0) / quota) * 100))
}

// Same thresholds as the customer-facing quota warnings (80% / 100%).
function usageTextClass(company: any) {
    const percent = usagePercent(company)
    if (percent >= 100) return 'text-[#CC3B2D] font-semibold'
    if (percent >= 80) return 'text-[#D4900A] font-semibold'
    return ''
}

function usageBarClass(company: any) {
    const percent = usagePercent(company)
    if (percent >= 100) return 'bg-[#CC3B2D]'
    if (percent >= 80) return 'bg-[#D4900A]'
    return 'bg-[#42AED9]'
}

function formatMeasuredAt(value: string) {
    return new Date(value).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
}

onMounted(() => {
    fetchCompanyStorage()
})

async function fetchCompanyStorage() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await dashboardService.getCompanyStorage(params)
        if (response) {
            state.companyStorage = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCompanyStorage()
}

function next() {
    currentTablePage++
    fetchCompanyStorage()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCompanyStorage()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchCompanyStorage()
}
</script>