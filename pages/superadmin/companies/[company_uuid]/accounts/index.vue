<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ state.company?.data?.name || $t('superadmin.companies.company') }} - {{
                    runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ state.company?.data?.name || $t('superadmin.companies.company') }}</template>

            <div class="p-1">
                <ModulesSuperadminCompanyHeader>
                    <template #actions>
                        <button @click="impersonateCompany"
                            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors bg-violet-50 text-violet-600 border-violet-200">
                            <Icon name="ph:user-switch" class="w-4 h-4" />
                            {{ $t('superadmin.companies.accounts.loginAs') }}
                        </button>
                        <button v-if="state.subscription?.data?.payment_method === 'card'"
                            @click="sendCardUpdateLink"
                            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-ink-body border border-line hover:bg-surface-canvas transition-colors">
                            <Icon name="ph:envelope" class="w-4 h-4" />
                            {{ $t('superadmin.companies.accounts.sendCardLink') }}
                        </button>
                        <button @click="navigateTo(`/superadmin/companies/${companyUuid}/edit`)"
                            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-ink-body border border-line hover:bg-surface-canvas transition-colors">
                            <Icon name="ph:pencil-simple" class="w-4 h-4" />
                            {{ $t('superadmin.companies.table.actions.edit') }}
                        </button>
                        <button @click="toggleActive"
                            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                            :class="state.company?.data?.is_active
                                ? 'bg-red-50 text-danger border border-red-200 hover:bg-red-100'
                                : 'bg-green-50 text-success border border-green-200 hover:bg-green-100'">
                            <Icon :name="state.company?.data?.is_active ? 'ph:x-circle' : 'ph:check-circle'"
                                class="w-4 h-4" />
                            {{ state.company?.data?.is_active ?
                                $t('superadmin.companies.table.actions.deactivate') :
                                $t('superadmin.companies.table.actions.activate') }}
                        </button>
                    </template>
                </ModulesSuperadminCompanyHeader>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error?.message?.length > 0" />

                    <div v-if="!state.isPageLoading" class="space-y-5">

                        <!-- Stats row -->
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div class="bg-white border border-line rounded-xl p-4 shadow-sm">
                                <p class="text-[10px] font-semibold text-ink-muted uppercase tracking-wide mb-1">
                                    {{ $t('superadmin.dashboard.users') }}
                                </p>
                                <p class="text-[26px] font-bold text-ink">
                                    {{ state.licensesCount?.data?.used ?? 0 }}
                                </p>
                                <p class="text-[11px] text-ink-muted mt-0.5">
                                    {{ $t('superadmin.companies.accounts.stats.activeLicenses') }}
                                </p>
                            </div>
                            <div class="bg-white border border-line rounded-xl p-4 shadow-sm">
                                <p class="text-[10px] font-semibold text-ink-muted uppercase tracking-wide mb-1">{{
                                    $t('superadmin.sidebar.licenses') }}</p>
                                <p class="text-[26px] font-bold text-ink">
                                    {{ state.licensesCount?.data?.used ?? 0 }}
                                    <span class="text-[16px] font-normal text-ink-muted">/
                                        {{
                                            (state.licensesCount?.data?.used + state.licensesCount?.data?.unused) || 0
                                        }}
                                    </span>
                                </p>
                                <div class="mt-2 h-1.5 bg-line rounded-full overflow-hidden">
                                    <div class="h-full rounded-full transition-all bg-accent"
                                        :style="`width:${licencePercent}%`"></div>
                                </div>
                            </div>
                            <div class="bg-white border border-line rounded-xl p-4 shadow-sm">
                                <p class="text-[10px] font-semibold text-ink-muted uppercase tracking-wide mb-1">{{
                                    $t('superadmin.companies.accounts.stats.unused') }}</p>
                                <p class="text-[26px] font-bold text-ink">
                                    {{ state.licensesCount?.data?.unused ?? 0 }}
                                </p>
                                <p class="text-[11px] text-ink-muted mt-0.5">
                                    {{ $t('superadmin.companies.accounts.stats.availableLicenses') }}
                                </p>
                            </div>
                            <div class="bg-white border border-line rounded-xl p-4 shadow-sm">
                                <p class="text-[10px] font-semibold text-ink-muted uppercase tracking-wide mb-1">
                                    {{ $t('superadmin.sidebar.apps') }}
                                </p>
                                <p class="text-[26px] font-bold text-ink">
                                    {{ state.apps?.data?.length }}
                                </p>
                                <p class="text-[11px] text-ink-muted mt-0.5">
                                    {{ $t('superadmin.companies.accounts.stats.activatedModules') }}
                                </p>
                            </div>
                            <SuperadminCompanyStorageStat :companyUuid="(companyUuid as string)" />
                        </div>

                        <!-- Storage usage -->
                        <SuperadminCompanyStorageBreakdown :companyUuid="(companyUuid as string)" />

                        <!-- Details + apps -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <!-- Company info -->
                            <div class="bg-white border border-line rounded-xl p-5 shadow-sm">
                                <h3 class="text-[13px] font-semibold text-ink mb-4">{{
                                    $t('superadmin.companies.form.companyInformation') }}</h3>
                                <div class="space-y-3">
                                    <div v-if="state.company?.data?.email" class="flex items-center gap-3 text-[13px]">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-surface-canvas flex items-center justify-center flex-shrink-0">
                                            <Icon name="ph:envelope" class="w-3.5 h-3.5 text-ink-muted" />
                                        </div>
                                        <span class="text-ink-body">
                                            {{ state.company?.data.email }}
                                        </span>
                                    </div>
                                    <div v-if="state.company?.data?.phone" class="flex items-center gap-3 text-[13px]">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-surface-canvas flex items-center justify-center flex-shrink-0">
                                            <Icon name="ph:phone" class="w-3.5 h-3.5 text-ink-muted" />
                                        </div>
                                        <span class="text-ink-body">
                                            {{ state.company?.data.phone }}
                                        </span>
                                    </div>
                                    <div v-if="state.company?.data?.cvr" class="flex items-center gap-3 text-[13px]">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-surface-canvas flex items-center justify-center flex-shrink-0">
                                            <Icon name="ph:identification-card" class="w-3.5 h-3.5 text-ink-muted" />
                                        </div>
                                        <span class="text-ink-body">
                                            CVR: {{ state.company?.data.cvr }}
                                        </span>
                                    </div>
                                    <div v-if="state.company?.data?.website"
                                        class="flex items-center gap-3 text-[13px]">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-surface-canvas flex items-center justify-center flex-shrink-0">
                                            <Icon name="ph:globe" class="w-3.5 h-3.5 text-ink-muted" />
                                        </div>
                                        <a :href="state.company?.data.website" target="_blank"
                                            class="text-accent hover:underline truncate">
                                            {{ state.company?.data.website }}
                                        </a>
                                    </div>
                                    <div v-if="state.subscription?.data?.deal"
                                        class="flex items-center gap-3 text-[13px]">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-surface-canvas flex items-center justify-center flex-shrink-0">
                                            <Icon name="ph:credit-card" class="w-3.5 h-3.5 text-ink-muted" />
                                        </div>
                                        <span class="text-ink-body">
                                            {{ state.subscription.data.deal.name }} —
                                            <template v-if="state.subscription.data.type === 'free'">
                                                {{ $t('superadmin.companies.accounts.free') }}
                                            </template>
                                            <template v-else-if="state.subscription.data.type?.includes('monthly')">
                                                {{ formatAmount(state.subscription.data.deal.monthly_price, 'DKK') }}
                                                / {{ $t('superadmin.companies.accounts.monthly') }}
                                            </template>
                                            <template v-else>
                                                {{ formatAmount(state.subscription.data.deal.yearly_price, 'DKK') }}
                                                / {{ $t('superadmin.companies.accounts.yearly') }}
                                            </template>
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-3 text-[13px]">
                                        <div
                                            class="w-7 h-7 rounded-lg bg-surface-canvas flex items-center justify-center flex-shrink-0">
                                            <Icon name="ph:building" class="w-3.5 h-3.5 text-ink-muted" />
                                        </div>
                                        <span class="text-ink-body">
                                            74312{{ state.company?.data.id }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Apps -->
                            <div class="bg-white border border-line rounded-xl p-5 shadow-sm">
                                <h3 class="text-[13px] font-semibold text-ink mb-4">{{
                                    $t('superadmin.companies.accounts.activatedAppsAndModules') }}</h3>
                                <div v-if="state.isAppsLoading" class="flex justify-center py-4">
                                    <Icon name="ph:spinner" class="w-5 h-5 text-accent animate-spin" />
                                </div>
                                <div v-else-if="!state.apps?.data?.length"
                                    class="flex flex-col items-center gap-2 py-4 text-ink-muted">
                                    <Icon name="ph:squares-four" class="w-8 h-8 opacity-30" />
                                    <p class="text-[12px]">{{ $t('superadmin.companies.accounts.noAppsActivated') }}</p>
                                </div>
                                <div v-else class="space-y-2">
                                    <div v-for="(app, i) in state.apps?.data" :key="i"
                                        class="flex items-center justify-between py-2.5 px-3 rounded-lg bg-surface-subtle border border-line">
                                        <div class="flex items-center gap-2.5">
                                            <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-tertiary-soft">
                                                <Icon name="ph:squares-four" class="w-4 h-4 text-tertiary" />
                                            </div>
                                            <span class="text-[13px] font-medium text-ink">
                                                {{ app?.name }}
                                            </span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <span v-if="app?.active_quantity > 0" class="co-badge co-badge-green text-[10px]">
                                                <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                                                {{ $t('superadmin.companies.table.active') }}
                                            </span>
                                            <span v-else class="co-badge co-badge-red text-[10px]">
                                                <span class="w-1.5 h-1.5 rounded-full bg-danger"></span>
                                                {{ $t('superadmin.companies.companyApps.table.inactive') }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Accounts table -->
                        <div class="bg-white border border-line rounded-xl shadow-sm overflow-hidden">
                            <div
                                class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line">
                                <div class="flex items-center gap-3">
                                    <h3 class="text-[13px] font-semibold text-ink">{{
                                        $t('superadmin.companies.accounts.userAccounts') }}</h3>
                                    <SuperadminTableSearch v-model="searchQuery"
                                        :placeholder="$t('superadmin.companies.accounts.searchPlaceholder')"
                                        @input="debouncedAccountsSearch" style="min-width: 320px; max-width: none" />
                                </div>
                                <button @click="navigateTo(`/superadmin/companies/${companyUuid}/accounts/new`)"
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white transition-colors bg-tertiary">
                                    <Icon name="ph:plus" class="w-3.5 h-3.5" />
                                    {{ $t('superadmin.companies.accounts.newAccount') }}
                                </button>
                            </div>
                            <div class="p-5">
                                <SuperadminTable :columnHeaders="state.accountColumnHeaders" :data="state.accounts"
                                    :isLoading="state.isAccountsLoading"
                                    :emptyMessage="$t('superadmin.companies.accounts.noAccounts')" emptyIcon="ph:users"
                                    rowKey="uuid">
                                    <template #body>
                                        <tr v-for="(account, i) in state.accounts?.data" :key="i"
                                            class="border-b border-surface-canvas hover:bg-surface-subtle transition-colors group">
                                            <td class="co-td">
                                                <div class="flex items-center gap-2.5">
                                                    <img :src="account?.image ?? avatarUrl(`${account?.firstname}+${account?.lastname}`)"
                                                        class="w-8 h-8 rounded-full object-cover" />
                                                    <span class="text-[13px] font-medium text-ink">{{
                                                        account?.firstname }} {{
                                                            account?.lastname }}</span>
                                                </div>
                                            </td>
                                            <td class="co-td text-[13px] text-ink-body">{{ account?.email }}</td>
                                            <td class="co-td text-[13px] text-ink-body">{{ account?.phone || '—' }}
                                            </td>
                                            <td class="co-td">
                                                <span v-for="(role, ri) in account?.roles" :key="ri"
                                                    class="co-badge co-badge-gray text-[11px]">{{ role.name }}</span>
                                            </td>
                                            <td class="co-td">
                                                <span v-if="account?.is_archived"
                                                    class="co-badge co-badge-gray text-[11px]">{{
                                                        $t('superadmin.accounts.table.archived') }}</span>
                                                <span v-else-if="account?.is_active"
                                                    class="co-badge co-badge-green text-[11px]">{{
                                                        $t('superadmin.companies.table.active') }}</span>
                                                <span v-else class="co-badge co-badge-red text-[11px]">{{
                                                    $t('superadmin.companies.table.inactive') }}</span>
                                            </td>
                                            <td class="co-td" @click.stop>
                                                <div
                                                    class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <SuperadminTableButton
                                                        v-if="!account?.roles?.some((r: any) => r.name === 'Superadmin')"
                                                        @click="impersonateAccount(account)"
                                                        :title="$t('superadmin.accounts.table.actions.impersonate')">
                                                        <Icon name="ph:user-switch" class="w-3.5 h-3.5" />
                                                    </SuperadminTableButton>
                                                    <SuperadminTableButton
                                                        @click="navigateTo(`/superadmin/companies/${companyUuid}/accounts/${account.uuid}/edit`)"
                                                        :title="$t('superadmin.accounts.table.actions.edit')">
                                                        <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                                    </SuperadminTableButton>
                                                    <ModulesSuperadminCompanyMenuAssignLicense
                                                        v-if="canManageLicenses && !account?.roles?.some((r: any) => r.name === 'Superadmin')"
                                                        :companyUuid="companyUuid" :userUuid="account.uuid"
                                                        @assigned="fetchApps" />
                                                    <SuperadminTableButton
                                                        @click="activateDeactivateAccount(i as number, account)"
                                                        :title="account.is_active ? $t('superadmin.accounts.table.actions.deactivate') : $t('superadmin.accounts.table.actions.activate')">
                                                        <Icon :name="account.is_active ? 'ph:x' : 'ph:check'"
                                                            class="w-3.5 h-3.5" />
                                                    </SuperadminTableButton>
                                                    <SuperadminTableButton @click="confirmAccountArchiving(account)"
                                                        :title="account?.is_archived ? $t('superadmin.accounts.table.actions.restore') : $t('superadmin.accounts.table.actions.archive')"
                                                        :buttonStyle="account?.is_archived ? 'success' : 'danger'">
                                                        <Icon :name="account?.is_archived ? 'ph:arrow-counter-clockwise' : 'ph:archive'"
                                                            class="w-3.5 h-3.5" />
                                                    </SuperadminTableButton>
                                                </div>
                                            </td>
                                        </tr>
                                    </template>
                                </SuperadminTable>
                                <Pagination :data="state.accounts" @previous="prevAccounts" @next="nextAccounts" />
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
            <DialogReopenEmployee :isModalOpen="state.modal.isArchiveAccountOpen && !!state.selectedAccount?.is_archived"
                :name="`${state.selectedAccount?.firstname ?? ''} ${state.selectedAccount?.lastname ?? ''}`.trim()"
                :freeSeats="state.freeUserSeats"
                @close="state.modal.isArchiveAccountOpen = false" @confirm="archiveAccount"
                @buy="navigateTo(`/superadmin/companies/${companyUuid}/license-overview`)" />
            <DialogConfirmation :isModalOpen="state.modal.isArchiveAccountOpen && !state.selectedAccount?.is_archived"
                :message="$t('superadmin.accounts.confirmation.archiveConfirmation') + '? ' +
                    $t('superadmin.accounts.confirmation.archiveExplanation') + '.'"
                @close="state.modal.isArchiveAccountOpen = false" @confirm="archiveAccount" />
        </NuxtLayout>
    </div>

        <!-- Bank-på-adgangen. Åbnes af den 403 der siger at kunden ikke har sagt ja
             endnu, så formularen først kommer når den er nødvendig. -->
        <ModulesSuperadminSupportAccessRequestDialog :isOpen="state.supportAccess.isOpen"
            :accountUuid="state.supportAccess.accountUuid" :accountName="state.supportAccess.accountName"
            @close="state.supportAccess.isOpen = false" @requested="state.supportAccess.isOpen = false" />
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { licenseService } from '@/components/api/superadmin/LicenseService'
import { accountService } from '@/components/api/superadmin/AccountService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { successAlert, warningAlertWithAction } = useAlert()
const { can } = usePermissions()
const { t } = useI18n()

const canManageLicenses = computed(() => can('manage_licenses'))
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid as string
const searchQuery = ref('')

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

    // Bank-på-adgangen. Kontoen huskes her, fordi dialogen åbnes fra fejlsvaret på et
    // forsøg og ikke fra knappen - så den skal vide hvilken konto forsøget gjaldt.
    supportAccess: {
        isOpen: false,
        accountUuid: null as string | null,
        accountName: '',
    },
    company: null as any,
    dataFilter: {
        search: '',
    } as any,
    error: {} as Error,
    isAccountsLoading: false,
    isAppsLoading: false,
    isPageLoading: false,
    licensesCount: null as any,
    modal: {
        isArchiveAccountOpen: false,
    },
    selectedAccount: null as any,
    freeUserSeats: null as number | null,
    subscription: null as any,
})


const licencePercent = computed(() => {
    const used = state.licensesCount?.data?.used ?? 0
    const total = state.licensesCount?.data?.total ?? 0
    return total ? Math.min(100, Math.round((used / total) * 100)) : 0
})

// The header shows whether the company is active; it is told when that changes.
const { refresh: refreshCompanySummary } = useCompanySummary(String(companyUuid))

let accountsPage = 1
let accountsSearchTimeout: any = null
let isImpersonating = false

onMounted(() => {
    fetchCompany()
    fetchSubscription()
    fetchLicensesCount()
    fetchApps()
    fetchAccounts()
})

async function fetchCompany() {
    if (isImpersonating) return
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
    if (isImpersonating) return
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
    if (isImpersonating) return
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
    if (isImpersonating) return
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

function debouncedAccountsSearch() {
    if (isImpersonating) return
    clearTimeout(accountsSearchTimeout)
    accountsSearchTimeout = setTimeout(() => {
        accountsPage = 1
        fetchAccounts()
    }, 350)

    clearTimeout(accountsSearchTimeout)
    accountsSearchTimeout = setTimeout(() => {
        const trimmed = searchQuery.value.trim()
        state.dataFilter.search = trimmed.length ? Array(trimmed.split(/\s+/)) : null
        accountsPage = 1
        fetchAccounts()
    }, 350)
}

async function fetchAccounts() {
    if (isImpersonating) return
    state.error = {}
    state.isAccountsLoading = true
    try {
        const params: any = {
            company_uuid: companyUuid,
            page: accountsPage,
            sortField: 'id',
            sortOrder: 'descend',
        }
        if (state.dataFilter.search) params.search = state.dataFilter.search
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
            refreshCompanySummary()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function beginImpersonation() {
    isImpersonating = true
    clearTimeout(accountsSearchTimeout)
}

function recoverFromFailedImpersonation() {
    isImpersonating = false
    const originalToken = localStorage.getItem('_original_token')
    if (originalToken) {
        localStorage.setItem('_token', originalToken)
        localStorage.removeItem('_original_token')
    }
}

/**
 * Beder kunden om lov, hvis de ikke allerede har sagt ja.
 *
 * `support_access_required` er backendens svar på "du må godt spørge, men der er ikke
 * sagt ja til netop denne konto endnu". Det er ikke en fejl at vise som en fejl: det er
 * en anmodning der skal sendes, så dialogen åbnes med kontoen udfyldt.
 */
function askForAccess(account: any) {
    state.supportAccess.accountUuid = account.uuid
    state.supportAccess.accountName = [account.firstname, account.lastname].filter(Boolean).join(' ')
    state.supportAccess.isOpen = true
}

async function impersonateAccount(account: any) {
    state.error = {}
    state.isPageLoading = true
    beginImpersonation()
    try {
        const response = await accountService.impersonateAccount(account.uuid)
        if (response?.impersonation_token) {
            localStorage.setItem('_original_token', localStorage.getItem('_token') ?? '')
            localStorage.setItem('_token', response.impersonation_token)
            navigateTo('/overview')
        } else {
            isImpersonating = false
        }
    } catch (error: any) {
        recoverFromFailedImpersonation()

        if (error?.code === 'support_access_required') {
            askForAccess(account)
        } else {
            state.error = error
        }
    }
    state.isPageLoading = false
}

async function impersonateCompany() {
    state.error = {}
    state.isPageLoading = true
    beginImpersonation()
    try {
        const response = await companyService.impersonateCompany(companyUuid)
        if (response?.impersonation_token) {
            localStorage.setItem('_original_token', localStorage.getItem('_token') ?? '')
            localStorage.setItem('_token', response.impersonation_token)
            navigateTo('/overview')
        } else {
            isImpersonating = false
        }
    } catch (error: any) {
        recoverFromFailedImpersonation()

        // The company's admin was tried; the answer names them, so ask for
        // access to that account instead of only showing the refusal.
        if (error?.code === 'support_access_required' && error?.account?.uuid) {
            askForAccess(error.account)
        } else {
            state.error = error
        }
    }
    state.isPageLoading = false
}

async function activateDeactivateAccount(index: number, account: any) {
    state.error = {}
    state.isAccountsLoading = true
    try {
        const response = await accountService.activateDeactiveAccount(account.uuid, { is_active: !account.is_active })
        if (response) {
            state.accounts.data[index].is_active = response?.data?.is_active
            if (response?.data?.is_active) {
                successAlert(`${t('alert.success')}!`, `${t('superadmin.accounts.form.alert.accountSuccessfullyActivated')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('superadmin.accounts.form.alert.accountSuccessfullyDeactivated')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isAccountsLoading = false
}

// A restore asks first how many user licences the company has free, so the
// dialog can say whether the employee will get one. If that fails the dialog
// is a plain confirm, and the restore's own warning still shows.
async function confirmAccountArchiving(account: any) {
    state.selectedAccount = account
    state.freeUserSeats = null
    if (account?.is_archived) {
        try {
            const response = await accountService.getReopenSeats(account.uuid)
            const free = response?.data?.free_user_seats
            state.freeUserSeats = typeof free === 'number' ? free : null
        } catch {
            state.freeUserSeats = null
        }
    }
    state.modal.isArchiveAccountOpen = true
}

async function archiveAccount() {
    state.error = {}
    state.isAccountsLoading = true
    const archive = !state.selectedAccount?.is_archived
    try {
        const response = await accountService.archiveAccount(state.selectedAccount.uuid, archive)
        if (response?.data) {
            fetchAccounts()
            // Restored, but the company had no free user licence left.
            if (!archive && response.warning?.code === 'no_user_license') {
                warningAlertWithAction(t('alert.warning'), response.warning.message, {
                    label: t('superadmin.sidebar.licenses'),
                    run: () => navigateTo(`/superadmin/companies/${companyUuid}/license-overview`),
                })
            } else {
                successAlert(`${t('alert.success')}!`, `${t(archive
                    ? 'superadmin.accounts.alert.archivedSuccessfully'
                    : 'superadmin.accounts.alert.restoredSuccessfully')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isAccountsLoading = false
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
