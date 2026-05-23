<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ state.company?.data?.name || $t('superadmin.companies.company') }} - {{
                    runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ state.company?.data?.name || $t('superadmin.companies.company') }}</template>

            <div class="p-1">
                <!-- Back -->
                <NuxtLink to="/superadmin/companies"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-5 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    {{ $t('superadmin.companies.accounts.allCompanies') }}
                </NuxtLink>

                <!-- Sub-nav tabs -->
                <div class="flex items-center gap-1 mb-6 border-b border-[#EAECF0]">
                    <button v-for="tab in detailTabs" :key="tab.href"
                        class="px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px" :class="$route.path === tab.href
                            ? 'border-[#42AED9] text-[#205E77]'
                            : 'border-transparent text-[#5C6478] hover:text-[#1F2533]'" @click="navigateTo(tab.href)">
                        <div class="flex items-center gap-1.5">
                            <Icon :name="tab.icon" class="w-4 h-4" />
                            {{ tab.label }}
                        </div>
                    </button>
                </div>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error?.message?.length > 0" />

                    <div v-if="!state.isPageLoading" class="space-y-5">

                        <!-- Company header card -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
                            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                                <div class="flex items-center gap-4">
                                    <!-- Avatar -->
                                    <div class="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                                        :style="`background:${avatarColor(state.company?.data?.name)}`">
                                        {{ initials(state.company?.data?.name) }}
                                    </div>
                                    <div>
                                        <h2 class="text-[20px] font-bold text-[#1F2533]">{{ state.company?.data?.name ||
                                            '—'
                                            }}</h2>
                                        <div class="flex flex-wrap items-center gap-2 mt-2">
                                            <!-- Active status -->
                                            <span v-if="state.company?.data?.is_active" class="co-badge co-badge-green">
                                                <span
                                                    class="w-1.5 h-1.5 rounded-full bg-[#2E9E33] animate-pulse"></span>
                                                {{ $t('superadmin.companies.table.active') }}
                                            </span>
                                            <span v-else class="co-badge co-badge-red">
                                                <span class="w-1.5 h-1.5 rounded-full bg-[#CC3B2D]"></span>
                                                {{ $t('superadmin.companies.table.inactive') }}
                                            </span>

                                            <!-- Plan badge -->
                                            <span v-if="state.subscription?.data?.deal?.name"
                                                class="co-badge co-badge-navy">
                                                <Icon name="ph:crown-simple" class="w-3 h-3" />
                                                {{ state.subscription.data.deal.name }}
                                            </span>

                                            <!-- Payment method -->
                                            <span v-if="state.company?.data?.subscription?.payment_method === 'card'"
                                                class="co-badge co-badge-blue">
                                                <Icon name="ph:credit-card" class="w-3 h-3" />
                                                {{ $t('superadmin.companies.accounts.paymentCard') }}
                                            </span>
                                            <span
                                                v-else-if="state.company?.data?.subscription?.payment_method === 'invoice'"
                                                class="co-badge co-badge-gray">
                                                <Icon name="ph:file-text" class="w-3 h-3" />
                                                {{ $t('superadmin.companies.accounts.manualInvoice') }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action buttons -->
                                <div class="flex flex-wrap gap-2">
                                    <!-- <button @click="impersonateCompany"
                                        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                                        style="background:#F3F0FF;color:#7C3AED;border-color:#DDD6FE">
                                        <Icon name="ph:user-switch" class="w-4 h-4" />
                                        {{ $t('superadmin.companies.accounts.loginAs') }}
                                    </button> -->
                                    <button v-if="state.company?.data?.subscription?.payment_method === 'card'"
                                        @click="sendCardUpdateLink"
                                        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-[#5C6478] border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                                        <Icon name="ph:envelope" class="w-4 h-4" />
                                        {{ $t('superadmin.companies.accounts.sendCardLink') }}
                                    </button>
                                    <button @click="navigateTo(`/superadmin/companies/${companyUuid}/edit`)"
                                        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-[#5C6478] border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                                        <Icon name="ph:pencil-simple" class="w-4 h-4" />
                                        {{ $t('superadmin.companies.table.actions.edit') }}
                                    </button>
                                    <button @click="toggleActive"
                                        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                        :class="state.company?.data?.is_active
                                            ? 'bg-red-50 text-[#CC3B2D] border border-red-200 hover:bg-red-100'
                                            : 'bg-green-50 text-[#2E9E33] border border-green-200 hover:bg-green-100'">
                                        <Icon :name="state.company?.data?.is_active ? 'ph:x-circle' : 'ph:check-circle'"
                                            class="w-4 h-4" />
                                        {{ state.company?.data?.is_active ?
                                            $t('superadmin.companies.table.actions.deactivate') :
                                            $t('superadmin.companies.table.actions.activate') }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Stats row -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                                <p class="text-[10px] font-semibold text-[#8891A4] uppercase tracking-wide mb-1">
                                    {{ $t('superadmin.dashboard.users') }}
                                </p>
                                <p class="text-[26px] font-bold text-[#1F2533]">
                                    {{ state.licensesCount?.data?.used ?? 0 }}
                                </p>
                                <p class="text-[11px] text-[#8891A4] mt-0.5">
                                    {{ $t('superadmin.companies.accounts.stats.activeLicenses') }}
                                </p>
                            </div>
                            <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                                <p class="text-[10px] font-semibold text-[#8891A4] uppercase tracking-wide mb-1">{{
                                    $t('superadmin.sidebar.licenses') }}</p>
                                <p class="text-[26px] font-bold text-[#1F2533]">
                                    {{ state.licensesCount?.data?.used ?? 0 }}
                                    <span class="text-[16px] font-normal text-[#8891A4]">/
                                        {{
                                            (state.licensesCount?.data?.used + state.licensesCount?.data?.unused) || 0
                                        }}
                                    </span>
                                </p>
                                <div class="mt-2 h-1.5 bg-[#EAECF0] rounded-full overflow-hidden">
                                    <div class="h-full rounded-full transition-all" style="background:#42AED9"
                                        :style="`width:${licencePercent}%`"></div>
                                </div>
                            </div>
                            <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                                <p class="text-[10px] font-semibold text-[#8891A4] uppercase tracking-wide mb-1">{{
                                    $t('superadmin.companies.accounts.stats.unused') }}</p>
                                <p class="text-[26px] font-bold text-[#1F2533]">
                                    {{ state.licensesCount?.data?.unused ?? 0 }}
                                </p>
                                <p class="text-[11px] text-[#8891A4] mt-0.5">
                                    {{ $t('superadmin.companies.accounts.stats.availableLicenses') }}
                                </p>
                            </div>
                            <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                                <p class="text-[10px] font-semibold text-[#8891A4] uppercase tracking-wide mb-1">
                                    {{ $t('superadmin.sidebar.apps') }}
                                </p>
                                <p class="text-[26px] font-bold text-[#1F2533]">
                                    {{ state.apps?.data?.length }}
                                </p>
                                <p class="text-[11px] text-[#8891A4] mt-0.5">
                                    {{ $t('superadmin.companies.accounts.stats.activatedModules') }}
                                </p>
                            </div>
                        </div>

                        <!-- Details + apps -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <!-- Company info -->
                            <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                                <h3 class="text-[13px] font-semibold text-[#1F2533] mb-4">{{
                                    $t('superadmin.companies.form.companyInformation') }}</h3>
                                <div class="space-y-3">
                                    <div v-if="state.company?.data?.email" class="flex items-center gap-3 text-[13px]">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-[#F5F6F8] flex items-center justify-center flex-shrink-0">
                                            <Icon name="ph:envelope" class="w-3.5 h-3.5 text-[#8891A4]" />
                                        </div>
                                        <span class="text-[#5C6478]">
                                            {{ state.company?.data.email }}
                                        </span>
                                    </div>
                                    <div v-if="state.company?.data?.phone" class="flex items-center gap-3 text-[13px]">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-[#F5F6F8] flex items-center justify-center flex-shrink-0">
                                            <Icon name="ph:phone" class="w-3.5 h-3.5 text-[#8891A4]" />
                                        </div>
                                        <span class="text-[#5C6478]">
                                            {{ state.company?.data.phone }}
                                        </span>
                                    </div>
                                    <div v-if="state.company?.data?.cvr" class="flex items-center gap-3 text-[13px]">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-[#F5F6F8] flex items-center justify-center flex-shrink-0">
                                            <Icon name="ph:identification-card" class="w-3.5 h-3.5 text-[#8891A4]" />
                                        </div>
                                        <span class="text-[#5C6478]">
                                            CVR: {{ state.company?.data.cvr }}
                                        </span>
                                    </div>
                                    <div v-if="state.company?.data?.website"
                                        class="flex items-center gap-3 text-[13px]">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-[#F5F6F8] flex items-center justify-center flex-shrink-0">
                                            <Icon name="ph:globe" class="w-3.5 h-3.5 text-[#8891A4]" />
                                        </div>
                                        <a :href="state.company?.data.website" target="_blank"
                                            class="text-[#42AED9] hover:underline truncate">
                                            {{ state.company?.data.website }}
                                        </a>
                                    </div>
                                    <div v-if="state.subscription?.data?.deal"
                                        class="flex items-center gap-3 text-[13px]">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-[#F5F6F8] flex items-center justify-center flex-shrink-0">
                                            <Icon name="ph:credit-card" class="w-3.5 h-3.5 text-[#8891A4]" />
                                        </div>
                                        <span class="text-[#5C6478]">
                                            {{ state.subscription.data.deal.name }} —
                                            {{ state.subscription.data.type === 'monthly'
                                                ? formatAmount(state.subscription.data.deal.monthly_price)
                                                : formatAmount(state.subscription.data.deal.yearly_price) }}
                                            / {{ state.subscription.data.type === 'monthly' ?
                                                $t('superadmin.companies.accounts.monthly') :
                                                $t('superadmin.companies.accounts.yearly')
                                            }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Apps -->
                            <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                                <h3 class="text-[13px] font-semibold text-[#1F2533] mb-4">{{
                                    $t('superadmin.companies.accounts.activatedAppsAndModules') }}</h3>
                                <div v-if="state.isAppsLoading" class="flex justify-center py-4">
                                    <Icon name="ph:spinner" class="w-5 h-5 text-[#42AED9] animate-spin" />
                                </div>
                                <div v-else-if="!state.apps?.data?.length"
                                    class="flex flex-col items-center gap-2 py-4 text-[#8891A4]">
                                    <Icon name="ph:squares-four" class="w-8 h-8 opacity-30" />
                                    <p class="text-[12px]">{{ $t('superadmin.companies.accounts.noAppsActivated') }}</p>
                                </div>
                                <div v-else class="space-y-2">
                                    <div v-for="(app, i) in state.apps?.data" :key="i"
                                        class="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#F9FAFB] border border-[#EAECF0]">
                                        <div class="flex items-center gap-2.5">
                                            <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style="background:#E4F1F6">
                                                <Icon name="ph:squares-four" class="w-4 h-4 text-[#205E77]" />
                                            </div>
                                            <span class="text-[13px] font-medium text-[#1F2533]">{{ app?.name }}</span>
                                        </div>
                                        <span class="co-badge co-badge-green text-[10px]">
                                            <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                            {{ $t('superadmin.companies.table.active') }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Accounts table -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                            <div class="flex items-center justify-between px-5 py-4 border-b border-[#EAECF0]">
                                <h3 class="text-[13px] font-semibold text-[#1F2533]">{{
                                    $t('superadmin.companies.accounts.userAccounts') }}</h3>
                                <button @click="navigateTo(`/superadmin/companies/${companyUuid}/accounts/new`)"
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white transition-colors"
                                    style="background:#205E77">
                                    <Icon name="ph:plus" class="w-3.5 h-3.5" />
                                    {{ $t('superadmin.companies.accounts.newAccount') }}
                                </button>
                            </div>
                            <SuperadminTable :columnHeaders="state.accountColumnHeaders" :data="state.accounts"
                                :isLoading="state.isAccountsLoading"
                                :emptyMessage="$t('superadmin.companies.accounts.noAccounts')" emptyIcon="ph:users"
                                rowKey="uuid">
                                <template #body>
                                    <tr v-for="(account, i) in state.accounts?.data" :key="i"
                                        class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                                        <td class="co-td">
                                            <div class="flex items-center gap-2.5">
                                                <img :src="account?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${account?.firstname}+${account?.lastname}&size=32`"
                                                    class="w-8 h-8 rounded-full object-cover" />
                                                <span class="text-[13px] font-medium text-[#1F2533]">{{
                                                    account?.firstname }} {{
                                                        account?.lastname }}</span>
                                            </div>
                                        </td>
                                        <td class="co-td text-[13px] text-[#5C6478]">{{ account?.email }}</td>
                                        <td class="co-td text-[13px] text-[#5C6478]">{{ account?.phone || '—' }}</td>
                                        <td class="co-td">
                                            <span v-for="(role, ri) in account?.roles" :key="ri"
                                                class="co-badge co-badge-gray text-[11px]">{{ role.name }}</span>
                                        </td>
                                        <td class="co-td">
                                            <span v-if="account?.is_active"
                                                class="co-badge co-badge-green text-[11px]">{{
                                                    $t('superadmin.companies.table.active') }}</span>
                                            <span v-else class="co-badge co-badge-red text-[11px]">{{
                                                $t('superadmin.companies.table.inactive') }}</span>
                                        </td>
                                        <td class="co-td" @click.stop>
                                            <div
                                                class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <SuperadminTableButton
                                                    @click="navigateTo(`/superadmin/companies/${companyUuid}/accounts/${account.uuid}/edit`)">
                                                    <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                                </SuperadminTableButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </SuperadminTable>
                            <Pagination :data="state.accounts" @previous="prevAccounts" @next="nextAccounts" />
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { licenseService } from '@/components/api/superadmin/LicenseService'
import { accountService } from '@/components/api/superadmin/AccountService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid as string

const state = reactive({
    accountColumnHeaders: computed(() => [
        { key: 'name', name: t('superadmin.accounts.table.name') },
        { key: 'email', name: t('superadmin.accounts.table.email') },
        { key: 'phone', name: t('superadmin.accounts.table.phone') },
        { key: 'role', name: t('superadmin.accounts.table.role') },
        { key: 'status', name: t('superadmin.companies.table.status') },
        { key: 'actions', name: '' },
    ]),
    accounts: [] as any,
    apps: [] as any,
    company: null as any,
    error: {} as Error,
    isAccountsLoading: false,
    isAppsLoading: false,
    isPageLoading: false,
    licensesCount: null as any,
    subscription: null as any,
})

const detailTabs = computed(() => [
    { label: t('superadmin.companies.accounts.tabs.overview'), href: `/superadmin/companies/${companyUuid}/accounts`, icon: 'ph:house' },
    { label: t('superadmin.sidebar.licenses'), href: `/superadmin/companies/${companyUuid}/license-overview`, icon: 'ph:key' },
    { label: t('superadmin.sidebar.apps'), href: `/superadmin/companies/${companyUuid}/apps`, icon: 'ph:squares-four' },
    { label: t('superadmin.sidebar.invoices'), href: `/superadmin/companies/${companyUuid}/invoices`, icon: 'ph:invoice' },
    { label: t('superadmin.companies.table.actions.edit'), href: `/superadmin/companies/${companyUuid}/edit`, icon: 'ph:pencil-simple' },
])

const licencePercent = computed(() => {
    const used = state.licensesCount?.data?.used ?? 0
    const total = state.licensesCount?.data?.total ?? 0
    return total ? Math.min(100, Math.round((used / total) * 100)) : 0
})

const COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const initials = (name: string) => (name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

let accountsPage = 1

onMounted(() => {
    fetchCompany()
    fetchSubscription()
    fetchLicensesCount()
    fetchApps()
    fetchAccounts()
})

async function fetchCompany() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await companyService.getCompany(companyUuid)
        if (response) {
            state.company = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchSubscription() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await licenseService.getSubscription(companyUuid)
        if (response) {
            state.subscription = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchLicensesCount() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await licenseService.getLicensesCount(companyUuid)
        if (response) {
            state.licensesCount = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchApps() {
    state.error = {}
    state.isAppsLoading = true
    try {
        const params = {
            page: 1,
        }
        const response = await companyService.getCompanyApps(companyUuid, params)
        if (response) {
            state.apps = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isAppsLoading = false
}

async function fetchAccounts() {
    state.error = {}
    state.isAccountsLoading = true
    try {
        const params = {
            company_uuid: companyUuid,
            page: accountsPage,
            sortField: 'id',
            sortOrder: 'descend',
        }
        const response = await accountService.getAccounts(params)
        if (response) {
            state.accounts = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isAccountsLoading = false
}

function prevAccounts() {
    accountsPage--
    fetchAccounts()
}

function nextAccounts() {
    accountsPage++
    fetchAccounts()
}

async function toggleActive() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            is_active: !state.company?.data?.is_active,
        }
        const response = await companyService.activateDeactiveCompany(companyUuid, params)
        if (response) {
            state.company.data.is_active = response?.data?.is_active
            const key = state.company?.data.is_active
                ? 'superadmin.companies.form.alert.companySuccessfullyActivated'
                : 'superadmin.companies.form.alert.companySuccessfullyDeactivated'
            successAlert(`${t('alert.success')}!`, `${t(key)}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function impersonateCompany() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await companyService.impersonateCompany(companyUuid)
        if (response?.data?.token) {
            window.open(`${useRuntimeConfig().public.appUserUrl || '/'}?impersonate_token=${response.data.token}`, '_blank')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function sendCardUpdateLink() {
    state.error = {}
    state.isPageLoading = true
    try {
        await companyService.sendCardUpdateLink(companyUuid)
        successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.accounts.cardLinkSent')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
