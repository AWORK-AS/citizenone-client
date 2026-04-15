<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.dashboard.dashboard') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.dashboard.dashboard') }}</template>

            <div class="space-y-6">

                <!-- Top action bar -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">{{ $t('superadmin.dashboard.dashboard') }}</h1>
                        <p class="text-sm text-gray-500 mt-0.5 capitalize">{{ formattedDate }}</p>
                    </div>
                    <FormButton buttonStyle="action" @click="navigateTo('/superadmin/companies/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.companies.newCompany') }}
                    </FormButton>
                </div>

                <!-- Stat cards row 1: company overview -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div
                        class="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-primary transition-colors"
                        @click="navigateTo('/superadmin/companies')">
                        <div class="flex items-center justify-between">
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {{ $t('superadmin.dashboard.numberOfTotalCompanies') }}
                            </p>
                            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Icon name="ph:buildings" class="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <p class="text-3xl font-bold text-gray-900 mt-3">{{ state.dashboard.totalCompanies }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ $t('superadmin.companies.companies') }}</p>
                    </div>

                    <div
                        class="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-green-400 transition-colors"
                        @click="navigateTo('/superadmin/companies?paying=true')">
                        <div class="flex items-center justify-between">
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {{ $t('superadmin.dashboard.numberOfPayingCompnanies') }}
                            </p>
                            <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                                <Icon name="ph:currency-circle-dollar" class="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <p class="text-3xl font-bold text-green-600 mt-3">{{ state.dashboard.payingCompanies }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ $t('superadmin.companies.table.active') }}</p>
                    </div>

                    <div
                        class="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-red-300 transition-colors"
                        @click="navigateTo('/superadmin/companies?paying=false')">
                        <div class="flex items-center justify-between">
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {{ $t('superadmin.dashboard.numberOfNonpayingCompanies') }}
                            </p>
                            <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                                <Icon name="ph:x-circle" class="w-5 h-5 text-red-500" />
                            </div>
                        </div>
                        <p class="text-3xl font-bold text-red-500 mt-3">{{ state.dashboard.nonPayingCompanies }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ $t('superadmin.companies.table.inactive') }}</p>
                    </div>
                </div>

                <!-- Stat cards row 2: licence overview -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <div class="bg-white rounded-xl border border-gray-200 p-5">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {{ $t('superadmin.dashboard.numberOfUsersWithLicenses') }}
                        </p>
                        <p class="text-2xl font-bold text-gray-900 mt-2">{{ state.dashboard.usersWithLicenses }}</p>
                    </div>
                    <div class="bg-white rounded-xl border border-gray-200 p-5">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {{ $t('superadmin.dashboard.numberOfTotalActiveLincenses') }}
                        </p>
                        <p class="text-2xl font-bold text-gray-900 mt-2">{{ state.dashboard.totalActiveLicenses }}</p>
                    </div>
                    <div class="bg-white rounded-xl border border-gray-200 p-5">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {{ $t('superadmin.dashboard.numberOfUnusedLicenses') }}
                        </p>
                        <p class="text-2xl font-bold text-gray-900 mt-2">{{ state.dashboard.unusedLicenses }}</p>
                    </div>
                    <div class="bg-white rounded-xl border border-gray-200 p-5">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Shared CitizenOne</p>
                        <p class="text-2xl font-bold text-gray-900 mt-2">{{ state.dashboard.sharedCitizenOne }}</p>
                    </div>
                </div>

                <!-- Main content: recent companies + activity -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    <!-- Recent companies (2/3 width) -->
                    <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200">
                        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 class="text-sm font-semibold text-gray-700">{{ $t('superadmin.companies.companies') }}</h2>
                            <NuxtLink to="/superadmin/companies"
                                class="text-xs text-primary hover:underline flex items-center gap-1">
                                {{ $t('seeAll') }} <Icon name="ph:arrow-right" class="w-3 h-3" />
                            </NuxtLink>
                        </div>
                        <div v-if="state.isPageLoading" class="p-8 flex justify-center">
                            <Icon name="ph:spinner" class="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                        <div v-else-if="state.recentCompanies.length === 0"
                            class="p-10 flex flex-col items-center gap-2 text-gray-400">
                            <Icon name="ph:buildings" class="w-10 h-10" />
                            <p class="text-sm">{{ $t('superadmin.companies.noCompaniesFound') }}</p>
                        </div>
                        <div v-else>
                            <div v-for="(company, index) in state.recentCompanies" :key="index"
                                class="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                                @click="navigateTo(`/superadmin/companies/${company.uuid}/accounts`)">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span class="text-xs font-bold text-primary">
                                            {{ (company.name || '?').charAt(0).toUpperCase() }}
                                        </span>
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-gray-900">{{ company.name || '—' }}</p>
                                        <p class="text-xs text-gray-400">{{ company.email || company.phone || '' }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span v-if="company.is_active"
                                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        {{ $t('superadmin.companies.table.active') }}
                                    </span>
                                    <span v-else
                                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                        <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                        {{ $t('superadmin.companies.table.inactive') }}
                                    </span>
                                    <Icon name="ph:caret-right" class="w-4 h-4 text-gray-300" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Revenue + storage (1/3 width) -->
                    <div class="space-y-5">
                        <!-- Revenue card -->
                        <div class="bg-white rounded-xl border border-gray-200 p-5">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-sm font-semibold text-gray-700">
                                    {{ $t('superadmin.dashboard.revenue.revenue') }}
                                </h2>
                                <div class="flex gap-1">
                                    <input type="date" v-model="state.dashboard.revenue.formDateRange.start_date"
                                        class="text-xs border border-gray-200 rounded px-1.5 py-0.5 text-gray-600"
                                        @change="onDateChange" />
                                    <input type="date" v-model="state.dashboard.revenue.formDateRange.end_date"
                                        class="text-xs border border-gray-200 rounded px-1.5 py-0.5 text-gray-600"
                                        @change="onDateChange" />
                                </div>
                            </div>
                            <p class="text-2xl font-bold text-gray-900">
                                DKK {{ formatAmount(state.dashboard.revenue.amount) }}
                            </p>
                            <p class="text-xs text-gray-400 mt-1">{{ $t('excludeVat') }}</p>
                        </div>

                        <!-- Storage card -->
                        <div class="bg-white rounded-xl border border-gray-200 p-5">
                            <h2 class="text-sm font-semibold text-gray-700 mb-3">
                                {{ $t('superadmin.dashboard.companyStorage.companyStorage') }}
                            </h2>
                            <div v-if="!state.dashboard.companyStorage?.length"
                                class="text-xs text-gray-400">
                                {{ $t('superadmin.companies.noCompaniesFound') }}
                            </div>
                            <div v-else class="space-y-2">
                                <div v-for="(s, i) in state.dashboard.companyStorage.slice(0, 5)" :key="i"
                                    class="flex items-center justify-between text-xs">
                                    <span class="text-gray-600 truncate max-w-[120px]">{{ s.name }}</span>
                                    <span class="text-gray-400 font-mono">{{ s.used_storage ?? '0' }} GB</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dashboardService } from '@/components/api/superadmin/DashboardService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()

const formattedDate = computed(() => {
    return new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const state = reactive({
    dashboard: {
        totalActiveLicenses: 0,
        unusedLicenses: 0,
        payingCompanies: 0,
        totalCompanies: 0,
        nonPayingCompanies: 0,
        usersWithLicenses: 0,
        sharedCitizenOne: 0,
        revenue: {
            formDateRange: {
                start_date: moment().format('YYYY-MM-DD'),
                end_date: moment().format('YYYY-MM-DD'),
            },
            amount: 0,
        },
        companyStorage: [] as any[],
    },
    recentCompanies: [] as any[],
    error: {} as Error,
    isPageLoading: false,
})

onMounted(() => {
    fetchDashboardData()
    fetchRecentCompanies()
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
            state.dashboard.companyStorage = response?.data?.company_storage ?? []
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchRecentCompanies() {
    try {
        const response = await companyService.getCompanies({
            page: 1,
            sortField: 'id',
            sortOrder: 'descend',
        })
        if (response) {
            state.recentCompanies = response?.data?.slice(0, 8) ?? []
        }
    } catch (_) { /* silent */ }
}

function onDateChange() {
    fetchDashboardData()
}
</script>
