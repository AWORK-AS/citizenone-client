<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.dashboard.dashboard') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.dashboard.dashboard') }}</template>

            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.numberOfTotalCompanies')"
                        :value="state.dashboard.totalCompanies" class="cursor-pointer hover:bg-gray-50"
                        @click="navigateTo('/superadmin/companies')" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.numberOfPayingCompnanies')"
                        :value="state.dashboard.payingCompanies" class="cursor-pointer hover:bg-gray-50"
                        @click="navigateTo('/superadmin/companies?paying=true')" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.numberOfNonpayingCompanies')"
                        :value="state.dashboard.nonPayingCompanies" class="cursor-pointer hover:bg-gray-50"
                        @click="navigateTo('/superadmin/companies?paying=false')" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.numberOfUsersWithLicenses')"
                        :value="state.dashboard.usersWithLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.numberOfTotalActiveLincenses')"
                        :value="state.dashboard.totalActiveLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.numberOfUnusedLicenses')"
                        :value="state.dashboard.unusedLicenses" />
                    <ModulesSuperadminDashboardCard title="Shared CitizenOne"
                        :value="state.dashboard.sharedCitizenOne" />
                    <ModulesSuperadminDashboardCompanyStorageCard
                        :title="$t('superadmin.dashboard.companyStorage.companyStorage')"
                        :companies="state.dashboard.companyStorage" />
                    <ModulesSuperadminDashboardRevenueCard :title="$t('superadmin.dashboard.revenue.revenue')"
                        :revenueData="state.dashboard.revenue" @filterDate="filterDate" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dashboardService } from '@/components/api/superadmin/DashboardService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    dashboard: {
        totalActiveLicenses: 0,
        unusedLicenses: 0,
        payingCompanies: 0,
        totalCompanies: 0,
        nonPayingCompanies: 0,
        usersWithLicenses: 0,
        total_revenue: 0,
        company_storage: 0,
        sharedCitizenOne: 0,
        revenue: {
            formDateRange: {
                start_date: moment(),
                end_date: moment(),
            },
            amount: 0,
        },
        companyStorage: [],
    },
    error: {} as Error,
    isPageLoading: false,
})

onMounted(() => {
    fetchDashboardData()
})

async function fetchDashboardData() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            date: {
                end_date: state.dashboard.revenue.formDateRange.end_date,
                start_date: state.dashboard.revenue.formDateRange.start_date,
            }
        }
        const response = await dashboardService.getDashboardData(params)
        if (response) {
            state.dashboard.totalActiveLicenses = response?.data?.total_active_licenses ?? 0
            state.dashboard.unusedLicenses = response?.data?.unused_licenses ?? 0
            state.dashboard.payingCompanies = response?.data?.paying_companies ?? 0
            state.dashboard.totalCompanies = response?.data?.total_companies ?? 0
            state.dashboard.nonPayingCompanies = response?.data?.non_paying_companies ?? 0
            state.dashboard.usersWithLicenses = response?.data?.users_with_licenses ?? 0

            state.dashboard.sharedCitizenOne = response?.data?.shared_citizen ?? 0
            state.dashboard.revenue.amount = response?.data?.total_revenue ?? 0
            state.dashboard.companyStorage = response?.data?.company_storage ?? 0
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function filterDate(formDateRange: any) {
    state.dashboard.revenue.formDateRange.start_date = formDateRange.start_date
    state.dashboard.revenue.formDateRange.end_date = formDateRange.end_date
    fetchDashboardData()
}
</script>