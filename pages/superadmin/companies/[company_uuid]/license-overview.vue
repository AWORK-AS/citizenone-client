<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.accounts.accounts') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.accounts.accounts') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/companies">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesSuperadminCompanyTab />

                <div class="mt-10 w-full">
                    <LoadingSpinner :isActive="state.isPageLoading">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div>
                            <h3 class="py-3 text-sm font-semibold">
                                {{ $t('settings.licenseOverview.licenses') }}
                            </h3>
                            <div class="bg-white ring-1 ring-gray-200 rounded-3xl p-8 xl:p-10">
                                <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                                    @handleFilter="handleFilter" />
                                <div class="table-responsive">
                                    <Table :columnHeaders="state.columnHeaders" :data="state.licenses"
                                        :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                        <template #body
                                            v-if="!(state.isTableLoading || (state.licenses?.data?.length === 0))">
                                            <tr v-for="(license, index) in state.licenses?.data" :key="index">
                                                <td width="50%">
                                                    <span>{{ license?.license }}</span>
                                                </td>
                                                <td width="50%">
                                                    <span>
                                                        {{ license?.licensed_user?.firstname }}
                                                        {{ license?.licensed_user?.lastname }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </template>
                                    </Table>
                                </div>
                                <Pagination :data="state.licenses" @previous="previous" @next="next" />
                            </div>
                        </div>
                    </LoadingSpinner>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { licenseService } from '@/components/api/superadmin/LicenseService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
        { column: 'license' },
    ],
    columnHeaders: [
        { name: 'superadmin.companies.licenseOverview.table.license', sorter: true, key: 'license' },
        { name: 'superadmin.companies.licenseOverview.table.user' },
    ],
    dataFilter: [],
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    licenses: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    subscriptions: [] as any,
})

onMounted(() => {
    fetchLicenses()
})

async function fetchLicenses() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await licenseService.getLicenses(companyUuid, params)
        if (response) {
            state.licenses = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchLicenses()
}

function next() {
    currentTablePage++
    fetchLicenses()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchLicenses()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchLicenses()
}

function formatAmount(amount: any) {
    // Convert the number to a string with two decimal places
    let numberStr = parseFloat(amount).toFixed(2)

    // Split the string into integer and decimal parts
    let parts = numberStr.split('.')
    let integerPart = parts[0]
    let decimalPart = parts[1]

    // Add the thousands separators
    let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Combine the integer part with the decimal part
    return 'DKK ' + formattedIntegerPart + ',' + decimalPart
}
</script>