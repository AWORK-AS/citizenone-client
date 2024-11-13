<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.dashboard.dashboard') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.dashboard.dashboard') }}</template>

            <div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.activeLicenses')"
                        :value="state.dashboard.activeLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.unusedLicenses')"
                        :value="state.dashboard.unusedLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.companiesWithLicenses')"
                        :value="state.dashboard.companiesWithLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.companiesWithoutLicenses')"
                        :value="state.dashboard.companiesWithoutLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.usersWithLicenses')"
                        :value="state.dashboard.usersWithLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.usersWithoutLicenses')"
                        :value="state.dashboard.usersWithoutLicenses" />
                    <ModulesSuperadminDashboardRevenueCard :title="$t('superadmin.dashboard.revenue')"
                        :revenueData="state.dashboard.revenue" />
                    <ModulesSuperadminDashboardCard title="Shared CitizenOne"
                        :value="state.dashboard.sharedCitizenOne" />
                    <ModulesSuperadminDashboardCompanyStorageCard :title="$t('superadmin.dashboard.companyStorage')"
                        :companies="state.dashboard.companyStorage" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { dashboardService } from '@/components/api/superadmin/DashboardService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    dashboard: {
        activeLicenses: 0,
        unusedLicenses: 0,
        companiesWithLicenses: 0,
        companiesWithoutLicenses: 0,
        usersWithLicenses: 0,
        usersWithoutLicenses: 0,
        sharedCitizenOne: 0,
        revenue: {
            period: 'Last 30 Days',
            amount: 'DKK0'
        },
        companyStorage: [
            { name: 'Company A', usage: '0GB', isPaid: true, cost: 'DKK0' },
            { name: 'Company B', usage: '0GB', isPaid: false, cost: 'DKK0' },
            { name: 'Company C', usage: '0GB', isPaid: false, cost: 'DKK0' },
        ],
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
        const response = await dashboardService.getDashboardData()
        if (response) {
            state.dashboard.activeLicenses = response?.data?.active_licenses ?? 0
            state.dashboard.unusedLicenses = response?.data?.unused_licenses ?? 0
            state.dashboard.companiesWithLicenses = response?.data?.companies_with_license ?? 0
            state.dashboard.companiesWithoutLicenses = response?.data?.companies_without_license ?? 0
            state.dashboard.usersWithLicenses = response?.data?.users_with_license ?? 0
            state.dashboard.usersWithoutLicenses = response?.data?.users_without_license ?? 0
            state.dashboard.sharedCitizenOne = response?.data?.shared_citizen ?? 0
            state.dashboard.revenue.amount = response?.data?.total_revenue ?? 0
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>