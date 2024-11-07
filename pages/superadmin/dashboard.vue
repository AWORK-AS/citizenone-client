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
                        :value="state.activeLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.unusedLicenses')"
                        :value="state.unusedLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.companiesWithLicenses')"
                        :value="state.companiesWithLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.companiesWithoutLicenses')"
                        :value="state.companiesWithoutLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.usersWithLicenses')"
                        :value="state.usersWithLicenses" />
                    <ModulesSuperadminDashboardCard :title="$t('superadmin.dashboard.usersWithoutLicenses')"
                        :value="state.usersWithoutLicenses" />
                    <ModulesSuperadminDashboardRevenueCard :title="$t('superadmin.dashboard.revenue')"
                        :revenueData="state.revenue" />
                    <ModulesSuperadminDashboardCard title="Shared CitizenOne" :value="state.sharedCitizenOne" />
                    <ModulesSuperadminDashboardCompanyStorageCard :title="$t('superadmin.dashboard.companyStorage')"
                        :companies="state.companyStorage" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const state = reactive({
    activeLicenses: 0,
    error: {} as Error,
    unusedLicenses: 0,
    companiesWithLicenses: 0,
    companiesWithoutLicenses: 0,
    isPageLoading: false,
    usersWithLicenses: 0,
    usersWithoutLicenses: 0,
    revenue: {
        period: 'Last 30 Days',
        amount: 'DKK0'
    },
    sharedCitizenOne: 25,
    companyStorage: [
        { name: 'Company A', usage: '0GB', isPaid: true, cost: 'DKK0' },
        { name: 'Company B', usage: '0GB', isPaid: false, cost: 'DKK0' },
        { name: 'Company C', usage: '0GB', isPaid: false, cost: 'DKK0' },
    ]
})
</script>