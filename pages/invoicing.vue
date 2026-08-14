<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('invoicing.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('invoicing.title') }}</template>

            <div class="space-y-5">
                <nav class="border-b border-gray-200">
                    <div class="-mb-px flex gap-6 overflow-x-auto">
                        <button type="button" v-for="tab in tabs" :key="tab.value" @click="setTab(tab.value)" :class="[
                            'whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition',
                            state.tab === tab.value
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        ]">
                            {{ tab.label }}
                        </button>
                    </div>
                </nav>

                <template v-if="state.tab === 'invoices'">
                    <Alert type="danger" :text="state.error" v-if="state.error" />

                    <div class="inline-flex rounded-lg bg-gray-100 p-0.5">
                        <button type="button" v-for="option in filterOptions" :key="option.value"
                            @click="setFilter(option.value)" :class="[
                                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                                state.status === option.value
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            ]">
                            {{ option.label }}
                        </button>
                    </div>

                    <LoadingSpinner :isActive="state.isPageLoading">
                        <div class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5 max-w-xs">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('invoicing.outstandingTotal') }}
                            </p>
                            <p class="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">
                                {{ formatAmount(state.outstandingTotal) }}
                            </p>
                        </div>

                        <div v-if="state.invoices.length === 0"
                            class="mt-5 px-6 py-14 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg text-center">
                            <div class="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon name="ph:receipt" class="h-7 w-7 text-primary" />
                            </div>
                            <h3 class="mt-4 text-lg font-semibold text-gray-900">{{ $t('invoicing.empty.title') }}</h3>
                            <p class="mt-1 text-sm text-gray-500 max-w-md mx-auto">{{ $t('invoicing.empty.text') }}</p>
                        </div>

                        <div v-else class="mt-5 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-x-auto">
                            <table class="min-w-full text-sm">
                                <thead>
                                    <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                                        <th class="px-4 py-3">{{ $t('invoicing.table.number') }}</th>
                                        <th class="px-4 py-3">{{ $t('invoicing.table.citizen') }}</th>
                                        <th class="px-4 py-3">{{ $t('invoicing.table.issued') }}</th>
                                        <th class="px-4 py-3">{{ $t('invoicing.table.due') }}</th>
                                        <th class="px-4 py-3 text-right">{{ $t('citizens.invoices.vat') }}</th>
                                        <th class="px-4 py-3 text-right">{{ $t('citizens.invoices.toPay') }}</th>
                                        <th class="px-4 py-3 text-right">{{ $t('citizens.invoices.outstanding') }}</th>
                                        <th class="px-4 py-3">{{ $t('invoicing.table.status') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="invoice in state.invoices" :key="invoice.uuid"
                                        class="border-t border-gray-100">
                                        <td class="px-4 py-3 tabular-nums">
                                            {{ invoice.invoice_number }}
                                            <span class="text-xs text-gray-400" v-if="invoice.type === 'credit_note'">
                                                &middot; {{ $t('invoicing.creditNote') }}
                                            </span>
                                        </td>
                                        <td class="px-4 py-3">
                                            <button type="button" class="font-medium text-primary hover:underline"
                                                @click="navigateTo(`/citizens/${invoice.citizen.uuid}/invoices`)">
                                                {{ invoice.citizen.name }}
                                            </button>
                                        </td>
                                        <td class="px-4 py-3 tabular-nums">{{ formatDate(invoice.issued_at) }}</td>
                                        <td class="px-4 py-3 tabular-nums"
                                            :class="isOverdue(invoice) ? 'text-red-600 font-medium' : ''">
                                            {{ formatDate(invoice.due_at) }}
                                        </td>
                                        <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(invoice.vat_amount) }}</td>
                                        <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(invoice.total_amount) }}</td>
                                        <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(invoice.outstanding) }}</td>
                                        <td class="px-4 py-3">
                                            <Badge :type="statusStyle(invoice.status)">
                                                {{ $t(`citizens.invoices.statuses.${invoice.status}`) }}
                                            </Badge>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </LoadingSpinner>
                </template>

                <ModulesUserInvoicingServiceCatalogue v-else-if="state.tab === 'services'"
                    :defaultVatRate="state.settings.default_vat_rate"
                    :pricesIncludeVat="state.settings.prices_include_vat" />

                <ModulesUserInvoicingSettingsForm v-else @saved="onSettingsSaved" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenInvoiceService } from '@/components/api/user/CitizenInvoiceService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const route = useRoute()
const { t, locale } = useI18n()

const breadcrumbLinks = [{ name: 'invoicing.title', translate: true, href: '/invoicing' }]

const state = reactive({
    invoices: [] as any[],
    outstandingTotal: 0,
    status: 'outstanding',
    tab: (route.query.tab as string) || 'invoices',
    settings: { default_vat_rate: 25, prices_include_vat: false },
    isPageLoading: true,
    error: '',
})

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && !user?.has_invoice_app) navigateTo('/apps')
}, { immediate: true })

const tabs = computed(() => [
    { value: 'invoices', label: t('invoicing.tabs.invoices') },
    { value: 'services', label: t('invoicing.tabs.services') },
    { value: 'settings', label: t('invoicing.tabs.settings') },
])

const filterOptions = computed(() => [
    { value: 'outstanding', label: t('invoicing.filters.outstanding') },
    { value: '', label: t('invoicing.filters.all') },
    { value: 'paid', label: t('invoicing.filters.paid') },
    { value: 'draft', label: t('invoicing.filters.draft') },
])

function statusStyle(status: string): string {
    if (status === 'paid') return 'active'
    if (status === 'cancelled' || status === 'credited') return 'inactive'
    if (status === 'partly_paid') return 'pending'

    return 'primary'
}

// An invoice is late when its due date has passed and money is still owed.
function isOverdue(invoice: any): boolean {
    return invoice.due_at && invoice.outstanding > 0 && moment(invoice.due_at).isBefore(moment(), 'day')
}

function formatAmount(amount: number): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0)
}

function formatDate(date: string): string {
    return date ? moment(date).format('DD.MM.YYYY') : ''
}

// The tab lives in the address bar, so a link can point straight at the
// catalogue and a reload stays where you were.
function setTab(tab: string) {
    state.tab = tab
    navigateTo({ path: '/invoicing', query: tab === 'invoices' ? {} : { tab } })
}

async function load() {
    state.error = ''

    try {
        const response = await citizenInvoiceService.getForCompany({ status: state.status })
        state.invoices = response?.data?.invoices || []
        state.outstandingTotal = response?.data?.outstanding_total || 0
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
}

async function loadSettings() {
    try {
        const response = await citizenInvoiceService.getSettings()

        if (response?.data) state.settings = response.data
    } catch (error: any) {
        // The list is still usable without the settings, so a failure here
        // only costs the catalogue its defaults.
    }
}

function onSettingsSaved(settings: any) {
    if (settings) state.settings = settings
}

function setFilter(status: string) {
    state.status = status
    load()
}

onMounted(() => {
    load()
    loadSettings()
})
</script>
