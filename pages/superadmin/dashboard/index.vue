<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.dashboard.dashboard') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.dashboard.dashboard') }}
            </template>

            <div class="p-1 space-y-5">

                <ModulesSuperadminDashboardTab />

                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-[22px] font-bold text-[#1F2533]">
                            {{ $t('superadmin.dashboard.dashboard') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5 capitalize">
                            {{ formattedDate }}
                        </p>
                    </div>
                    <button @click="navigateTo('/superadmin/companies/new')"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.companies.newCompany') }}
                    </button>
                </div>

                <!-- Row 1: 4 stat cards -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Clients -->
                    <div @click="navigateTo('/superadmin/companies')"
                        class="co-stat-card cursor-pointer hover:shadow-md transition-shadow" style="--accent:#42AED9">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="co-stat-label">
                                    {{ $t('superadmin.dashboard.clients') }}
                                </p>
                                <p class="co-stat-value">
                                    {{ state.totalCompanies }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.activeCompanies') }}
                                </p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#E4F1F6">
                                <Icon name="ph:buildings" class="w-5 h-5 text-[#205E77]" />
                            </div>
                        </div>
                    </div>

                    <!-- Paying -->
                    <div @click="navigateTo('/superadmin/companies?paying=true')"
                        class="co-stat-card cursor-pointer hover:shadow-md transition-shadow" style="--accent:#2E9E33">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="co-stat-label">
                                    {{ $t('superadmin.dashboard.paying') }}
                                </p>
                                <p class="co-stat-value text-[#2E9E33]">
                                    {{ state.payingCompanies }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.activeSubscribers') }}
                                </p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#EDF7EE">
                                <Icon name="ph:currency-circle-dollar" class="w-5 h-5 text-[#2E9E33]" />
                            </div>
                        </div>
                    </div>

                    <!-- Users -->
                    <div class="co-stat-card" style="--accent:#368F8B">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="co-stat-label">
                                    {{ $t('superadmin.dashboard.users') }}
                                </p>
                                <p class="co-stat-value">
                                    {{ state.totalUsers }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.registeredUsers') }}
                                </p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#EEF8F8">
                                <Icon name="ph:users-three" class="w-5 h-5 text-[#368F8B]" />
                            </div>
                        </div>
                    </div>

                    <!-- Invoices -->
                    <div @click="navigateTo('/superadmin/invoices')"
                        class="co-stat-card cursor-pointer hover:shadow-md transition-shadow" style="--accent:#368F8B">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="co-stat-label">
                                    {{ $t('superadmin.dashboard.invoices') }}
                                </p>
                                <p class="co-stat-value">
                                    {{ state.totalInvoices }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.invoicesCreated') }}
                                </p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#EEF8F8">
                                <Icon name="ph:invoice" class="w-5 h-5 text-[#368F8B]" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Row 1b: adoption and recurring revenue -->
                <div class="grid grid-cols-2 gap-4"
                    :class="state.recurringRevenue || state.churn ? 'lg:grid-cols-4' : 'lg:grid-cols-2'">
                    <!-- Users right now -->
                    <div class="co-stat-card" style="--accent:#42AED9">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-1">
                                    <p class="co-stat-label">{{ $t('superadmin.dashboard.adoption.usersOnlineNow') }}</p>
                                    <Tooltip :text="$t('superadmin.dashboard.adoption.help.usersOnlineNow')"
                                        position="bottom" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                    </Tooltip>
                                </div>
                                <p class="co-stat-value">{{ state.usersOnlineNow }}</p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.adoption.activeToday', { count: state.usersActiveToday }) }}
                                </p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#E4F1F6">
                                <Icon name="ph:pulse" class="w-5 h-5 text-[#205E77]" />
                            </div>
                        </div>
                    </div>

                    <!-- Companies active today -->
                    <div class="co-stat-card" style="--accent:#368F8B">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-1">
                                    <p class="co-stat-label">{{ $t('superadmin.dashboard.adoption.companiesActiveToday') }}</p>
                                    <Tooltip :text="$t('superadmin.dashboard.adoption.help.companiesActiveToday')"
                                        position="bottom" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                    </Tooltip>
                                </div>
                                <p class="co-stat-value">{{ state.companiesActiveToday }}</p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.adoption.activeThisWeek', { count: state.companiesActiveThisWeek }) }}
                                </p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#EEF8F8">
                                <Icon name="ph:buildings" class="w-5 h-5 text-[#368F8B]" />
                            </div>
                        </div>
                    </div>

                    <!-- MRR / ARR -->
                    <div v-if="state.recurringRevenue" class="co-stat-card" style="--accent:#2E9E33">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-1">
                                    <p class="co-stat-label">{{ $t('superadmin.dashboard.adoption.mrr') }}</p>
                                    <Tooltip :text="$t('superadmin.dashboard.adoption.help.mrr')"
                                        position="bottom" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                    </Tooltip>
                                </div>
                                <p class="co-stat-value text-[#2E9E33]">
                                    {{ formatAmount(state.recurringRevenue.mrr, 'DKK') }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.adoption.arr', { amount: formatAmount(state.recurringRevenue.arr, 'DKK') }) }}
                                </p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#EDF7EE">
                                <Icon name="ph:chart-line-up" class="w-5 h-5 text-[#2E9E33]" />
                            </div>
                        </div>
                    </div>

                    <!-- Committed: the part of the run rate that is collecting -->
                    <div v-if="state.recurringRevenue?.cmrr !== undefined" class="co-stat-card" style="--accent:#205E77">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-1">
                                    <p class="co-stat-label">{{ $t('superadmin.dashboard.adoption.cmrr') }}</p>
                                    <Tooltip :text="$t('superadmin.dashboard.adoption.help.cmrr')" position="bottom" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                    </Tooltip>
                                </div>
                                <p class="co-stat-value text-[#205E77]">
                                    {{ formatAmount(state.recurringRevenue.cmrr, 'DKK') }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.adoption.carr', { amount: formatAmount(state.recurringRevenue.carr, 'DKK') }) }}
                                </p>
                                <p v-if="state.recurringRevenue.agreements?.not_collecting" class="co-stat-sub text-[#CC3B2D]">
                                    {{ $t('superadmin.dashboard.adoption.notCollecting', { count: state.recurringRevenue.agreements.not_collecting }) }}
                                </p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#E4F1F6">
                                <Icon name="ph:shield-check" class="w-5 h-5 text-[#205E77]" />
                            </div>
                        </div>
                    </div>

                    <!-- Contracted: what the agreements are scheduled to bill -->
                    <div v-if="state.recurringRevenue?.contracted_next_12_months !== undefined" class="co-stat-card"
                        style="--accent:#42AED9">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-1">
                                    <p class="co-stat-label">{{ $t('superadmin.dashboard.adoption.contracted') }}</p>
                                    <Tooltip :text="$t('superadmin.dashboard.adoption.help.contracted')" position="bottom" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                    </Tooltip>
                                </div>
                                <p class="co-stat-value text-[#42AED9]">
                                    {{ formatAmount(state.recurringRevenue.contracted_next_12_months, 'DKK') }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.adoption.contractedThreeYears', { amount: formatAmount(state.recurringRevenue.contracted_next_36_months, 'DKK') }) }}
                                </p>
                                <NuxtLink to="/superadmin/analytics"
                                    class="co-stat-sub text-[#205E77] inline-flex items-center gap-1 hover:underline">
                                    {{ $t('superadmin.dashboard.adoption.seeForecast') }}
                                    <Icon name="ph:arrow-right" class="w-3 h-3" />
                                </NuxtLink>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#E8F6FC">
                                <Icon name="ph:calendar-check" class="w-5 h-5 text-[#42AED9]" />
                            </div>
                        </div>
                    </div>

                    <!-- Churn -->
                    <div v-if="state.churn" class="co-stat-card" style="--accent:#CC3B2D">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-1">
                                    <p class="co-stat-label">
                                        {{ $t('superadmin.dashboard.adoption.churn', { days: state.churn.window_days }) }}
                                    </p>
                                    <Tooltip :text="$t('superadmin.dashboard.adoption.help.churn')" position="bottom" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                    </Tooltip>
                                </div>
                                <p class="co-stat-value" :class="state.churn.churned > 0 ? 'text-[#CC3B2D]' : ''">
                                    {{ state.churn.rate === null ? '—' : `${state.churn.rate}%` }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.adoption.churnSub', {
                                        churned: state.churn.churned, base: state.churn.base
                                    }) }}
                                </p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#FFF0F0">
                                <Icon name="ph:user-minus" class="w-5 h-5 text-[#CC3B2D]" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Row 2: small licence stats -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                        <p class="co-stat-label">
                            {{ $t('superadmin.dashboard.totalPaidLicenses') }}
                        </p>
                        <p class="text-[22px] font-bold text-[#1F2533] mt-1">
                            {{ state.totalPaidLicenses }}
                        </p>
                    </div>
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                        <p class="co-stat-label">
                            {{ $t('superadmin.dashboard.activeLicenses') }}
                        </p>
                        <p class="text-[22px] font-bold text-[#1F2533] mt-1">
                            {{ state.totalActiveLicenses }}
                        </p>
                    </div>
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                        <p class="co-stat-label">
                            {{ $t('superadmin.dashboard.unusedLicenses') }}
                        </p>
                        <p class="text-[22px] font-bold text-[#1F2533] mt-1">
                            {{ state.unusedLicenses }}
                        </p>
                    </div>
                </div>

                <!-- Row 3: recent companies + right column -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    <!-- Recent companies (2/3) -->
                    <div class="lg:col-span-2 bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                        <div class="flex items-center justify-between px-5 py-4 border-b border-[#EAECF0]">
                            <h2 class="text-[13px] font-semibold text-[#1F2533]">{{
                                $t('superadmin.dashboard.recentCompanies') }}
                            </h2>
                            <button @click="navigateTo('/superadmin/companies')"
                                class="text-[12px] text-[#42AED9] hover:underline flex items-center gap-1">
                                {{ $t('superadmin.dashboard.viewAll') }}
                                <Icon name="ph:arrow-right" class="w-3 h-3" />
                            </button>
                        </div>
                        <div v-if="state.isLoading" class="flex justify-center py-10">
                            <Icon name="ph:spinner" class="w-6 h-6 text-[#42AED9] animate-spin" />
                        </div>
                        <div v-else-if="!state.recentCompanies.length"
                            class="flex flex-col items-center gap-2 py-10 text-[#8891A4]">
                            <Icon name="ph:buildings" class="w-10 h-10 opacity-30" />
                            <p class="text-sm">
                                {{ $t('superadmin.dashboard.noCompaniesYet') }}
                            </p>
                        </div>
                        <div v-else>
                            <div v-for="(company, i) in state.recentCompanies" :key="i"
                                class="flex items-center justify-between px-5 py-3.5 border-b border-[#F5F6F8] last:border-0 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                                @click="navigateTo(`/superadmin/companies/${company.uuid}/accounts`)">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                        :style="`background:${avatarColor(company.name)}`">
                                        {{ initials(company.name) }}
                                    </div>
                                    <div>
                                        <p class="text-[13px] font-semibold text-[#1F2533]">
                                            {{ company.name || '—' }}
                                        </p>
                                        <p class="text-[11px] text-[#8891A4]">
                                            {{ company.email || company.phone || '' }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span v-if="company.is_active"
                                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF7EE] text-[#2E9E33]">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                        {{ $t('superadmin.dashboard.active') }}
                                    </span>
                                    <span v-else
                                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF0F0] text-[#CC3B2D]">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#CC3B2D]"></span>
                                        {{ $t('superadmin.dashboard.inactive') }}
                                    </span>
                                    <Icon name="ph:caret-right" class="w-3.5 h-3.5 text-[#D5D9E2]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right column: revenue + storage -->
                    <div class="space-y-4">
                        <!-- Revenue -->
                        <div v-if="canViewFinancials" class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-[13px] font-semibold text-[#1F2533]">
                                    {{ $t('superadmin.dashboard.revenue.revenue') }}
                                </h2>
                            </div>
                            <div class="flex gap-1.5 mb-3">
                                <input type="date" v-model="state.revenueDateFrom"
                                    class="text-xs border border-[#EAECF0] rounded-lg px-2 py-1.5 text-[#5C6478] bg-white outline-none focus:border-[#42AED9] flex-1 transition-colors"
                                    @change="fetchDashboard" />
                                <input type="date" v-model="state.revenueDateTo"
                                    class="text-xs border border-[#EAECF0] rounded-lg px-2 py-1.5 text-[#5C6478] bg-white outline-none focus:border-[#42AED9] flex-1 transition-colors"
                                    @change="fetchDashboard" />
                            </div>
                            <p class="text-[24px] font-bold text-[#1F2533]">
                                {{ formatAmount(state.revenue, 'DKK') }}
                            </p>
                            <p class="text-[11px] text-[#8891A4] mt-0.5">
                                {{ $t('superadmin.dashboard.exclVat') }}
                            </p>
                        </div>

                        <!-- Storage -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                            <div class="flex items-center justify-between mb-3">
                                <h2 class="text-[13px] font-semibold text-[#1F2533]">{{
                                    $t('superadmin.dashboard.companyStorage.companyStorage') }}</h2>
                                <NuxtLink to="/superadmin/dashboard/company-storage"
                                    class="text-[12px] text-[#42AED9] hover:underline">
                                    {{ $t('superadmin.dashboard.companyStorage.seeAll') }}
                                </NuxtLink>
                            </div>
                            <div v-if="!state.companyStorage?.length" class="text-[12px] text-[#8891A4]">
                                {{ $t('superadmin.dashboard.companyStorage.notMeasuredYet') }}
                            </div>
                            <div v-else class="space-y-3">
                                <div v-for="(storage, storageIndex) in state.companyStorage.slice(0, 5)"
                                    :key="storageIndex">
                                    <div class="flex items-center justify-between text-[12px] mb-1">
                                        <span class="text-[#1F2533] font-medium truncate max-w-[140px]">
                                            {{ storage.name }}
                                        </span>
                                        <span class="ml-2" :class="storageUsageClass(storage)">
                                            {{ formatGb(storage.storage_used_gb) }} /
                                            {{ formatGb(storage.storage_quota_gb) }} GB
                                        </span>
                                    </div>
                                    <div class="h-1.5 bg-[#F5F6F8] rounded-full overflow-hidden">
                                        <div class="h-full rounded-full transition-all" :class="storageBarClass(storage)"
                                            :style="`width:${storagePercent(storage)}%`">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Row 4: customers who have gone quiet -->
                <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                    <div class="flex items-center justify-between px-5 py-4 border-b border-[#EAECF0]">
                        <div>
                            <div class="flex items-center gap-1.5">
                                <h2 class="text-[13px] font-semibold text-[#1F2533]">
                                    {{ $t('superadmin.dashboard.adoption.quietCustomers') }}
                                </h2>
                                <Tooltip :text="$t('superadmin.dashboard.adoption.help.quietCustomers')" position="bottom"
                                    wrap>
                                    <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                </Tooltip>
                            </div>
                            <p class="text-[11px] text-[#8891A4] mt-0.5">
                                {{ $t('superadmin.dashboard.adoption.quietCustomersHint') }}
                            </p>
                        </div>
                    </div>
                    <div v-if="!state.quietCompanies.length"
                        class="flex flex-col items-center gap-2 py-10 text-[#8891A4]">
                        <Icon name="ph:check-circle" class="w-10 h-10 opacity-30" />
                        <p class="text-sm">{{ $t('superadmin.dashboard.adoption.everyoneActive') }}</p>
                    </div>
                    <div v-else>
                        <div v-for="(company, i) in state.quietCompanies" :key="i"
                            class="flex items-center justify-between px-5 py-3.5 border-b border-[#F5F6F8] last:border-0 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                            @click="navigateTo(`/superadmin/companies/${company.uuid}/accounts`)">
                            <div class="flex items-center gap-3 min-w-0">
                                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                    :style="`background:${avatarColor(company.name)}`">
                                    {{ initials(company.name) }}
                                </div>
                                <div class="min-w-0">
                                    <p class="text-[13px] font-semibold text-[#1F2533] truncate">{{ company.name }}</p>
                                    <p class="text-[11px] text-[#8891A4]">
                                        <template v-if="company.has_ever_been_active">
                                            {{ $t('superadmin.dashboard.adoption.lastActive', {
                                                date: formatDay(company.last_active_at)
                                            }) }}
                                        </template>
                                        <template v-else>
                                            {{ $t('superadmin.dashboard.adoption.neverActive', {
                                                date: formatDay(company.created_at)
                                            }) }}
                                        </template>
                                    </p>
                                </div>
                            </div>
                            <span class="text-[12px] font-semibold shrink-0" :class="quietToneClass(company)">
                                {{ quietLabel(company) }}
                            </span>
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
import { usePermissions } from '@/composables/usePermissions'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { t } = useI18n()
const { can } = usePermissions()
const canViewFinancials = computed(() => can('view_financials'))
const userStore = useUserStore() as any

const localeMap: Record<string, string> = {
    en: 'en-GB',
    dk: 'da-DK',
    no: 'nb-NO',
    sv: 'sv-SE',
}

const formattedDate = computed(() => {
    const lang = userStore.getLanguage ?? 'dk'
    const locale = localeMap[lang] ?? 'da-DK'
    return new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const initials = (name: string) => (name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

const state = reactive({
    totalCompanies: 0,
    payingCompanies: 0,
    nonPayingCompanies: 0,
    totalUsers: 0,
    totalInvoices: 0,
    totalPaidLicenses: 0,
    totalActiveLicenses: 0,
    unusedLicenses: 0,
    revenue: 0,
    companyStorage: [] as any[],
    recentCompanies: [] as any[],
    usersOnlineNow: 0,
    usersActiveToday: 0,
    companiesActiveToday: 0,
    companiesActiveThisWeek: 0,
    quietCompanies: [] as any[],
    recurringRevenue: null as any,
    churn: null as any,
    // Måned til dato. Kortet stod på i dag-til-i dag, hvilket er en periode
    // der næsten altid er tom, og et tomt omsætningskort ligner en stille
    // måned frem for en forkert indstilling. Det er samtidig den periode
    // API'et selv falder tilbage på, når der ingen datoer er med.
    revenueDateFrom: moment().startOf('month').format('YYYY-MM-DD'),
    revenueDateTo: moment().format('YYYY-MM-DD'),
    isLoading: false,
    error: {} as any,
})

const formatGb = (value: any) => Number(value ?? 0).toLocaleString('da-DK', { maximumFractionDigits: 2 })

function formatDay(value: string) {
    return value ? moment(value).format('D. MMM YYYY') : '—'
}

// A customer silent for a month is a different conversation from one that was
// in yesterday, so the badge carries the tone. A signup that never logged in at
// all escalates faster: that is onboarding failing, not a quiet week.
function quietToneClass(company: any) {
    const days = company.quiet_days ?? 0
    if (!company.has_ever_been_active) return days >= 7 ? 'text-[#CC3B2D]' : 'text-[#D4900A]'
    if (days >= 30) return 'text-[#CC3B2D]'
    if (days >= 7) return 'text-[#D4900A]'
    return 'text-[#8891A4]'
}

function quietLabel(company: any) {
    if (!company.has_ever_been_active) return t('superadmin.dashboard.adoption.never')
    if ((company.quiet_days ?? 0) <= 0) return t('superadmin.dashboard.adoption.today')
    return t('superadmin.dashboard.adoption.daysQuiet', { days: company.quiet_days })
}

function storagePercent(storage: any) {
    const quota = Number(storage?.storage_quota_gb ?? 0)
    if (!quota) return 0
    return Math.min(100, Math.round((Number(storage?.storage_used_gb ?? 0) / quota) * 100))
}

function storageUsageClass(storage: any) {
    const percent = storagePercent(storage)
    if (percent >= 100) return 'text-[#CC3B2D] font-semibold'
    if (percent >= 80) return 'text-[#D4900A] font-semibold'
    return 'text-[#8891A4]'
}

function storageBarClass(storage: any) {
    const percent = storagePercent(storage)
    if (percent >= 100) return 'bg-[#CC3B2D]'
    if (percent >= 80) return 'bg-[#D4900A]'
    return 'bg-[#42AED9]'
}

onMounted(() => {
    fetchDashboard()
    fetchRecentCompanies()
})

async function fetchDashboard() {
    try {
        const response = await dashboardService.getDashboardData({
            date: { start_date: state.revenueDateFrom, end_date: state.revenueDateTo }
        })
        if (response) {
            state.totalCompanies = response?.data?.total_companies ?? 0
            state.payingCompanies = response?.data?.paying_companies ?? 0
            state.nonPayingCompanies = response?.data?.non_paying_companies ?? 0
            state.totalUsers = response?.data?.total_users ?? 0
            state.totalInvoices = response?.data?.total_invoices ?? 0
            state.totalPaidLicenses = response?.data?.total_paid_licenses ?? 0
            state.totalActiveLicenses = response?.data?.total_active_licenses ?? 0
            state.unusedLicenses = response?.data?.unused_licenses ?? 0
            state.revenue = response?.data?.total_revenue ?? 0
            state.companyStorage = response?.data?.company_storage ?? []
            state.usersOnlineNow = response?.data?.users_online_now ?? 0
            state.usersActiveToday = response?.data?.users_active_today ?? 0
            state.companiesActiveToday = response?.data?.companies_active_today ?? 0
            state.companiesActiveThisWeek = response?.data?.companies_active_this_week ?? 0
            state.quietCompanies = response?.data?.quiet_companies ?? []
            // Null when the superadmin lacks view_financials, so the cards stay hidden.
            state.recurringRevenue = response?.data?.recurring_revenue ?? null
            state.churn = response?.data?.churn ?? null
        }
    } catch (e: any) { state.error = e }
}

async function fetchRecentCompanies() {
    state.isLoading = true
    try {
        const response = await companyService.getCompanies({ page: 1, sortField: 'id', sortOrder: 'descend' })
        if (response) state.recentCompanies = response?.data?.slice(0, 8) ?? []
    } catch (_) { }
    state.isLoading = false
}
</script>

<style scoped>
.co-stat-card {
    background: white;
    border: 1px solid #EAECF0;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    position: relative;
    overflow: hidden;
}

.co-stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 12px 12px 0 0;
    background: var(--accent, #42AED9);
}

.co-stat-label {
    font-size: 10px;
    font-weight: 700;
    color: #8891A4;
    text-transform: uppercase;
    letter-spacing: 0.07em;
}

.co-stat-value {
    font-size: 28px;
    font-weight: 800;
    color: #1F2533;
    line-height: 1;
    margin-top: 6px;
}

.co-stat-sub {
    font-size: 11px;
    color: #8891A4;
    margin-top: 4px;
}
</style>
