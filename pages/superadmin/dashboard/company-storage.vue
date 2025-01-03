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
                                <tr v-for="(company, index) in state.companyStorage?.data" :key="index">
                                    <td width="40%">
                                        <span>{{ company?.name }}</span>
                                    </td>
                                    <td width="30%">
                                        <span>{{ formatAmount(company?.storage_paid) }}</span>
                                    </td>
                                    <td width="30%">
                                        <span>{{ company?.storage_used }}</span>
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
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'superadmin.dashboard.companyStorage.table.name', sorter: true, key: 'name' },
        { name: 'superadmin.dashboard.companyStorage.table.storagePaid' },
        { name: 'superadmin.dashboard.companyStorage.table.storageUsed' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

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