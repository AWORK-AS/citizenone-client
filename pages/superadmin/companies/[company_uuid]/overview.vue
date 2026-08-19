<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ state.company?.name || $t('superadmin.companies.companies') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>
                <span v-if="state.company?.name" class="font-semibold">{{ state.company.name }}</span>
                <span v-else>{{ $t('superadmin.companies.companies') }}</span>
            </template>

            <div>
                <!-- Back link -->
                <NuxtLink class="flex items-center gap-x-2 mb-4 max-w-fit hover:cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    to="/superadmin/companies">
                    <Icon name="ph:arrow-left" size="18" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesSuperadminCompanyTab />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div v-if="!state.isPageLoading && state.company" class="mt-6 space-y-6">

                        <!-- Company header card -->
                        <div class="bg-white rounded-xl border border-gray-200 p-6">
                            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span class="text-xl font-bold text-primary">
                                            {{ (state.company?.name || '?').charAt(0).toUpperCase() }}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 class="text-xl font-bold text-gray-900">{{ state.company?.name }}</h2>
                                        <div class="flex flex-wrap items-center gap-2 mt-1.5">
                                            <!-- Account status -->
                                            <span v-if="state.company?.is_active"
                                                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Aktiv
                                            </span>
                                            <span v-else
                                                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                                                <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                                Inaktiv
                                            </span>

                                            <!-- Billing type -->
                                            <span v-if="state.company?.subscription?.payment_method === 'card'"
                                                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                <Icon name="ph:credit-card" class="w-3.5 h-3.5" />
                                                Betalingskort
                                            </span>
                                            <span v-else-if="state.company?.subscription?.payment_method === 'invoice'"
                                                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                                <Icon name="ph:file-text" class="w-3.5 h-3.5" />
                                                Manuel faktura
                                            </span>

                                            <!-- Card payment status -->
                                            <span v-if="state.company?.subscription?.payment_method === 'card' && state.company?.subscription?.card_active === true"
                                                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                Kort aktivt
                                            </span>
                                            <span v-else-if="state.company?.subscription?.payment_method === 'card' && state.company?.subscription?.card_active === false"
                                                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                                                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                Kort stoppet
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action buttons -->
                                <div class="flex flex-wrap gap-2">
                                    <button
                                        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                                        @click="impersonateCompany">
                                        <Icon name="ph:user-switch" class="w-4 h-4" />
                                        Log ind som kunde
                                    </button>
                                    <button v-if="state.company?.subscription?.payment_method === 'card'"
                                        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors"
                                        @click="sendCardUpdateLink">
                                        <Icon name="ph:envelope" class="w-4 h-4" />
                                        Send kortlink
                                    </button>
                                    <button v-if="state.company?.subscription?.payment_method === 'card'"
                                        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors"
                                        @click="updateCard">
                                        <Icon name="ph:credit-card" class="w-4 h-4" />
                                        Opdater kort
                                    </button>
                                    <FormButton buttonStyle="action"
                                        @click="navigateTo(`/superadmin/companies/${companyUuid}/edit`)">
                                        <Icon name="ph:pencil-simple" class="size-4" />
                                        Rediger
                                    </FormButton>
                                </div>
                            </div>
                        </div>

                        <!-- Stats row -->
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div class="bg-white rounded-xl border border-gray-200 p-4">
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Slutbrugere</p>
                                <p class="text-2xl font-bold text-gray-900">
                                    {{ state.company?.is_active ? (state.userCount ?? '—') : '—' }}
                                </p>
                                <p class="text-xs text-gray-400 mt-0.5">aktive brugere</p>
                            </div>
                            <div class="bg-white rounded-xl border border-gray-200 p-4">
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Licenser brugt</p>
                                <p class="text-2xl font-bold text-gray-900">
                                    {{ state.licensesCount?.data?.used ?? 0 }}
                                    <span class="text-base font-normal text-gray-400">/ {{ state.licensesCount?.data?.total ?? 0 }}</span>
                                </p>
                                <div class="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-primary rounded-full"
                                        :style="{ width: licencePercent + '%' }"></div>
                                </div>
                            </div>
                            <div class="bg-white rounded-xl border border-gray-200 p-4">
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ubrugte licenser</p>
                                <p class="text-2xl font-bold text-gray-900">{{ state.licensesCount?.data?.unused ?? 0 }}</p>
                                <p class="text-xs text-gray-400 mt-0.5">tilgængelige</p>
                            </div>
                            <div class="bg-white rounded-xl border border-gray-200 p-4">
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Aktive apps</p>
                                <p class="text-2xl font-bold text-gray-900">{{ state.apps.length }}</p>
                                <p class="text-xs text-gray-400 mt-0.5">moduler aktiveret</p>
                            </div>
                            <div class="bg-white rounded-xl border border-gray-200 p-4">
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lagerplads</p>
                                <p class="text-2xl font-bold" :class="storageTextClass">
                                    <template v-if="state.isStorageLoading">
                                        <Icon name="ph:spinner" class="w-5 h-5 text-gray-300 animate-spin" />
                                    </template>
                                    <template v-else>
                                        {{ formatGb(state.storage?.storage_used_gb) }}
                                        <span class="text-base font-normal text-gray-400">
                                            / {{ formatGb(state.storage?.storage_quota_gb) }} GB
                                        </span>
                                    </template>
                                </p>
                                <div class="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div class="h-full rounded-full" :class="storageBarClass"
                                        :style="{ width: storagePercent + '%' }"></div>
                                </div>
                                <p class="text-xs text-gray-400 mt-1">{{ storagePercent }}% brugt</p>
                            </div>
                        </div>

                        <!-- Storage breakdown -->
                        <div class="bg-white rounded-xl border border-gray-200 p-5">
                            <div class="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <h3 class="text-sm font-semibold text-gray-700">Lagerforbrug</h3>
                                    <p class="text-xs text-gray-400 mt-0.5">
                                        Hvad fylder kundens data
                                        <span v-if="state.storage?.measured_at">
                                            · målt {{ formatDateTime(state.storage.measured_at) }}
                                        </span>
                                    </p>
                                </div>
                                <button
                                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors"
                                    :disabled="state.isStorageLoading" @click="fetchStorage">
                                    <Icon name="ph:arrows-clockwise" class="w-4 h-4"
                                        :class="state.isStorageLoading ? 'animate-spin' : ''" />
                                    Genberegn
                                </button>
                            </div>

                            <div v-if="state.isStorageLoading" class="flex justify-center py-4">
                                <Icon name="ph:spinner" class="w-5 h-5 text-gray-400 animate-spin" />
                            </div>
                            <div v-else-if="!usedBreakdown.length" class="text-sm text-gray-400 py-2">
                                Kunden bruger ikke lagerplads endnu
                            </div>
                            <div v-else class="space-y-3">
                                <div v-for="item in usedBreakdown" :key="item.category">
                                    <div class="flex items-center justify-between text-sm mb-1">
                                        <span class="text-gray-700">{{ storageCategoryLabels[item.category] || item.category }}</span>
                                        <span class="text-gray-500">
                                            {{ formatSize(item.bytes) }}
                                            <span class="text-gray-400 ml-1">({{ item.percent }}%)</span>
                                        </span>
                                    </div>
                                    <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div class="h-full bg-primary/60 rounded-full"
                                            :style="{ width: Math.min(100, item.percent) + '%' }"></div>
                                    </div>
                                </div>
                            </div>

                            <p v-if="state.storage?.storage_limit_gb !== null && state.storage?.storage_limit_gb !== undefined"
                                class="text-xs text-gray-400 mt-4">
                                Kvoten er sat manuelt til {{ formatGb(state.storage.storage_limit_gb) }} GB af en superadmin.
                            </p>
                        </div>

                        <!-- Details + apps row -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <!-- Company info -->
                            <div class="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 class="text-sm font-semibold text-gray-700 mb-4">Virksomhedsoplysninger</h3>
                                <div class="space-y-3">
                                    <div v-if="state.company?.email" class="flex items-center gap-3 text-sm">
                                        <Icon name="ph:envelope" class="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span class="text-gray-600">{{ state.company.email }}</span>
                                    </div>
                                    <div v-if="state.company?.phone" class="flex items-center gap-3 text-sm">
                                        <Icon name="ph:phone" class="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span class="text-gray-600">{{ state.company.phone }}</span>
                                    </div>
                                    <div v-if="state.company?.cvr" class="flex items-center gap-3 text-sm">
                                        <Icon name="ph:identification-card" class="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span class="text-gray-600">CVR: {{ state.company.cvr }}</span>
                                    </div>
                                    <div v-if="state.company?.website" class="flex items-center gap-3 text-sm">
                                        <Icon name="ph:globe" class="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <a :href="state.company.website" target="_blank"
                                            class="text-primary hover:underline truncate">{{ state.company.website }}</a>
                                    </div>
                                    <div v-if="state.company?.subscription?.expires_at" class="flex items-center gap-3 text-sm">
                                        <Icon name="ph:calendar" class="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span class="text-gray-600">
                                            Udløber:
                                            <span :class="isExpiringSoon ? 'text-orange-600 font-medium' : ''">
                                                {{ formatDate(state.company.subscription.expires_at) }}
                                            </span>
                                            <span v-if="isExpiringSoon" class="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">
                                                Udløber snart
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Enabled apps / modules -->
                            <div class="bg-white rounded-xl border border-gray-200 p-5">
                                <h3 class="text-sm font-semibold text-gray-700 mb-4">Aktiverede apps / moduler</h3>
                                <div v-if="state.isAppsLoading" class="flex justify-center py-4">
                                    <Icon name="ph:spinner" class="w-5 h-5 text-gray-400 animate-spin" />
                                </div>
                                <div v-else-if="!state.apps.length" class="text-sm text-gray-400 py-2">
                                    Ingen apps aktiveret
                                </div>
                                <div v-else class="space-y-2">
                                    <div v-for="(app, i) in state.apps" :key="i"
                                        class="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
                                        <div class="flex items-center gap-2.5">
                                            <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Icon name="ph:squares-four" class="w-4 h-4 text-primary" />
                                            </div>
                                            <span class="text-sm font-medium text-gray-700">{{ app?.name }}</span>
                                        </div>
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Aktiv
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Subscription card -->
                        <div v-if="state.subscription" class="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 class="text-sm font-semibold text-gray-700 mb-4">{{ $t('subscription.currentSubscription') }}</h3>
                            <div class="flex flex-wrap items-center gap-6">
                                <div>
                                    <p class="text-xs text-gray-500">Plan</p>
                                    <p class="font-semibold text-gray-900 mt-0.5">{{ state.subscription?.data?.deal?.name || '—' }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Pris</p>
                                    <p class="font-semibold text-gray-900 mt-0.5">
                                        {{ ['monthly', 'custom_monthly'].includes(state.subscription?.data?.type)
                                            ? formatAmount(state.subscription?.data?.deal?.monthly_price ?? 0)
                                            : formatAmount(state.subscription?.data?.deal?.yearly_price ?? 0) }}
                                        / {{ ['monthly', 'custom_monthly'].includes(state.subscription?.data?.type) ? 'md.' : 'år' }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Brugere inkluderet</p>
                                    <p class="font-semibold text-gray-900 mt-0.5">{{ state.subscription?.data?.deal?.users ?? '—' }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Lager</p>
                                    <p class="font-semibold text-gray-900 mt-0.5">{{ state.subscription?.data?.deal?.storage_size ?? '—' }}</p>
                                </div>
                            </div>
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
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { successAlert } = useAlert()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid

const state = reactive({
    company: null as any,
    subscription: null as any,
    licensesCount: null as any,
    apps: [] as any[],
    userCount: null as any,
    storage: null as any,
    error: {} as Error,
    isPageLoading: false,
    isAppsLoading: false,
    isStorageLoading: false,
})

// Keys come from the backend breakdown (StorageCalculator), so they stay stable.
const storageCategoryLabels: Record<string, string> = {
    citizen_files: 'Borgerfiler',
    journal_attachments: 'Journalbilag',
    news: 'Nyheder',
    assessments: 'Vurderinger',
    chat: 'Beskeder',
    incidents: 'Hændelser',
    employee_documents: 'Medarbejderdokumenter',
    procedures: 'Procedurer',
    tasks: 'Opgaver',
    company_files: 'Virksomhedsfiler',
    nursing_areas: 'Plejeområder',
}

const licencePercent = computed(() => {
    const used = state.licensesCount?.data?.used ?? 0
    const total = state.licensesCount?.data?.total ?? 0
    if (!total) return 0
    return Math.min(100, Math.round((used / total) * 100))
})

const storagePercent = computed(() => {
    const used = Number(state.storage?.storage_used_gb ?? 0)
    const quota = Number(state.storage?.storage_quota_gb ?? 0)
    if (!quota) return 0
    return Math.min(100, Math.round((used / quota) * 100))
})

// Same thresholds as the customer-facing quota warnings (80% / 100%).
const storageTextClass = computed(() => {
    if (storagePercent.value >= 100) return 'text-red-600'
    if (storagePercent.value >= 80) return 'text-orange-600'
    return 'text-gray-900'
})

const storageBarClass = computed(() => {
    if (storagePercent.value >= 100) return 'bg-red-500'
    if (storagePercent.value >= 80) return 'bg-orange-400'
    return 'bg-primary'
})

const usedBreakdown = computed(() =>
    (state.storage?.breakdown ?? []).filter((item: any) => Number(item?.bytes) > 0)
)

function formatGb(value: any) {
    const number = Number(value ?? 0)
    return Number.isFinite(number) ? number.toLocaleString('da-DK', { maximumFractionDigits: 2 }) : '0'
}

function formatSize(bytes: any) {
    const number = Number(bytes ?? 0)
    if (number >= 1024 * 1024 * 1024) return (number / (1024 ** 3)).toLocaleString('da-DK', { maximumFractionDigits: 2 }) + ' GB'
    if (number >= 1024 * 1024) return (number / (1024 ** 2)).toLocaleString('da-DK', { maximumFractionDigits: 1 }) + ' MB'
    if (number >= 1024) return (number / 1024).toLocaleString('da-DK', { maximumFractionDigits: 0 }) + ' KB'
    return number + ' B'
}

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('da-DK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const isExpiringSoon = computed(() => {
    const exp = state.company?.subscription?.expires_at
    if (!exp) return false
    const diff = new Date(exp).getTime() - Date.now()
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000 // within 30 days
})

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(() => {
    fetchAll()
})

async function fetchAll() {
    state.error = {}
    state.isPageLoading = true
    await Promise.allSettled([
        fetchCompany(),
        fetchSubscription(),
        fetchLicensesCount(),
        fetchApps(),
        fetchStorage(),
    ])
    state.isPageLoading = false
}

async function fetchStorage() {
    state.isStorageLoading = true
    try {
        const response = await licenseService.getCompanyStorage(companyUuid as string)
        if (response) state.storage = response
    } catch (_) { /* usage is informational - the rest of the page still renders */ }
    state.isStorageLoading = false
}

async function fetchCompany() {
    try {
        const response = await companyService.getCompany(companyUuid)
        if (response) state.company = response?.data ?? response
    } catch (error: any) { state.error = error }
}

async function fetchSubscription() {
    try {
        const response = await licenseService.getSubscription(companyUuid)
        if (response) state.subscription = response
    } catch (_) { /* no subscription is fine */ }
}

async function fetchLicensesCount() {
    try {
        const response = await licenseService.getLicensesCount(companyUuid)
        if (response) state.licensesCount = response
    } catch (_) { }
}

async function fetchApps() {
    state.isAppsLoading = true
    try {
        const response = await companyService.getCompanyApps(companyUuid, { page: 1 })
        if (response) state.apps = response?.data ?? []
    } catch (_) { state.apps = [] }
    state.isAppsLoading = false
}

async function impersonateCompany() {
    try {
        const response = await companyService.impersonateCompany(companyUuid)
        if (response?.data?.token) {
            const appUrl = runtimeConfig.public.appUserUrl || '/'
            window.open(`${appUrl}?impersonate_token=${response.data.token}`, '_blank')
        }
    } catch (_) {
        window.open(`/?company=${companyUuid}`, '_blank')
    }
}

async function sendCardUpdateLink() {
    try {
        await companyService.sendCardUpdateLink(companyUuid)
        successAlert('Sendt!', 'Kortupdate-link er sendt til kunden.')
    } catch (_) { }
}

async function updateCard() {
    navigateTo(`/superadmin/companies/${companyUuid}/update-card`)
}
</script>
