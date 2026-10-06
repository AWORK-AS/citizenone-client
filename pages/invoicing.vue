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

                    <div class="flex flex-wrap items-center justify-between gap-3">
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

                        <FormButton buttonStyle="action" @click="state.isModalOpen = true">
                            <Icon name="ph:plus" class="size-4" />
                            {{ $t('citizens.invoices.newTitle') }}
                        </FormButton>
                    </div>

                    <!-- What the last bulk send did: how many went out, and for each
                         one that did not, why. -->
                    <div v-if="state.sendResult" class="rounded-xl border bg-white px-5 py-4 shadow-sm space-y-2"
                        :class="state.sendResult.skipped > 0 ? 'border-amber-200' : 'border-green-200'">
                        <div class="flex items-start justify-between gap-3">
                            <p class="text-sm font-medium text-gray-900">
                                {{ $t('invoicing.bulkSend.summary', { queued: state.sendResult.queued, skipped: state.sendResult.skipped }) }}
                            </p>
                            <Tooltip :text="$t('invoicing.bulkSend.dismiss')" position="left">
                                <button type="button" class="text-gray-400 hover:text-gray-700 transition"
                                    :aria-label="$t('invoicing.bulkSend.dismiss')" @click="state.sendResult = null">
                                    <Icon name="ph:x" class="size-4" />
                                </button>
                            </Tooltip>
                        </div>
                        <p v-if="state.sendResult.queued > 0" class="text-[13px] text-gray-500">
                            {{ $t('invoicing.bulkSend.queuedHelp') }}
                        </p>
                        <ul v-if="skippedResults.length" class="space-y-1 text-[13px] text-amber-900">
                            <li v-for="result in skippedResults" :key="result.uuid" class="flex flex-wrap gap-x-2">
                                <span class="font-medium">{{ labelOf(result) }}</span>
                                <span>{{ reasonOf(result) }}</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Appears as soon as something is ticked. -->
                    <div v-if="state.selected.length"
                        class="sticky top-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary/5 px-4 py-3 ring-1 ring-primary/20">
                        <p class="text-sm font-medium text-primary">
                            {{ $t('invoicing.bulkSend.selected', { count: state.selected.length }) }}
                        </p>
                        <div class="flex items-center gap-2">
                            <Tooltip :text="$t('invoicing.bulkSend.clearHelp')" position="bottom">
                                <FormButton buttonStyle="cancel" :disabled="state.isSending" @click="state.selected = []">
                                    {{ $t('invoicing.bulkSend.clear') }}
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('invoicing.bulkSend.sendHelp')" wrap position="bottom">
                                <FormButton buttonStyle="primary" :disabled="state.isSending"
                                    @click="state.isConfirmOpen = true">
                                    <Icon name="ph:paper-plane-tilt" class="size-4" aria-hidden="true" />
                                    {{ $t('invoicing.bulkSend.send') }}
                                </FormButton>
                            </Tooltip>
                        </div>
                    </div>

                    <LoadingSpinner :isActive="state.isPageLoading || state.isSending">
                        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            <div v-for="card in cards" :key="card.key"
                                class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                                <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                    {{ card.label }}
                                </p>
                                <p class="mt-1 text-2xl font-semibold tabular-nums" :class="card.tone">
                                    {{ formatAmount(card.value) }}
                                </p>
                            </div>
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
                                        <th class="px-4 py-3 w-10">
                                            <Tooltip :text="$t('invoicing.bulkSend.selectAll')" position="right">
                                                <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                                    :aria-label="$t('invoicing.bulkSend.selectAll')"
                                                    :checked="allSendableSelected" :disabled="!sendableInvoices.length"
                                                    @change="toggleAll(($event.target as HTMLInputElement).checked)" />
                                            </Tooltip>
                                        </th>
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
                                        <td class="px-4 py-3">
                                            <Tooltip :text="selectTooltip(invoice)" wrap position="right">
                                                <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                                    :aria-label="selectTooltip(invoice)"
                                                    :disabled="!isSendable(invoice)" :checked="state.selected.includes(invoice.uuid)"
                                                    @change="toggleOne(invoice.uuid, ($event.target as HTMLInputElement).checked)" />
                                            </Tooltip>
                                        </td>
                                        <td class="px-4 py-3 tabular-nums">
                                            {{ invoice.invoice_number || $t('citizens.invoices.statuses.draft') }}
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
                    :pricesIncludeVat="state.settings.prices_include_vat"
                    @changed="services => state.services = services" />

                <ModulesUserInvoicingTemplates v-else-if="state.tab === 'templates'" :services="state.services" />

                <ModulesUserInvoicingReports v-else-if="state.tab === 'reports'" />

                <ModulesUserInvoicingSettingsForm v-else @saved="onSettingsSaved" />

                <DialogConfirmation :isModalOpen="state.isConfirmOpen"
                    :message="$t('invoicing.bulkSend.confirm', { count: state.selected.length })"
                    @close="state.isConfirmOpen = false" @confirm="sendSelected" />

                <ModulesUserCitizenInvoiceModalForm :isModalOpen="state.isModalOpen" :services="state.services"
                    :settings="state.settings" @close="state.isModalOpen = false" @saved="onInvoiceSaved" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenInvoiceService } from '@/components/api/user/CitizenInvoiceService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { BulkSendResult, BulkSendSummary } from '@/types/contract'
import { chunk, isSendable, sendBlockReason } from '@/composables/invoiceBulkSend'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const route = useRoute()
const { t, te, locale } = useI18n()
const { errorAlert } = useAlert()

const breadcrumbLinks = [{ name: 'invoicing.title', translate: true, href: '/invoicing' }]

const state = reactive({
    invoices: [] as any[],
    outstandingTotal: 0,
    summary: { revenue: 0, outstanding: 0, overdue: 0, paid: 0 },
    status: 'outstanding',
    tab: (route.query.tab as string) || 'invoices',
    services: [] as any[],
    isModalOpen: false,
    settings: { default_vat_rate: 25, prices_include_vat: false },
    isPageLoading: true,
    error: '',
    selected: [] as string[],
    isSending: false,
    isConfirmOpen: false,
    sendResult: null as BulkSendSummary | null,
    // Invoice numbers and names as they were when the send started, because the
    // list is refetched before the result is read.
    sentLabels: {} as Record<string, string>,
})

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && !user?.has_invoice_app) navigateTo('/apps')
}, { immediate: true })

const tabs = computed(() => [
    { value: 'invoices', label: t('invoicing.tabs.invoices') },
    { value: 'services', label: t('invoicing.tabs.services') },
    { value: 'templates', label: t('invoicing.tabs.templates') },
    { value: 'reports', label: t('invoicing.tabs.reports') },
    { value: 'settings', label: t('invoicing.tabs.settings') },
])

// The month everyone is asked about, plus the two figures that are chased no
// matter which month they were written in.
const cards = computed(() => [
    { key: 'revenue', label: t('invoicing.reports.cards.revenue'), value: state.summary.revenue, tone: 'text-gray-900' },
    { key: 'outstanding', label: t('invoicing.reports.cards.outstanding'), value: state.summary.outstanding, tone: 'text-gray-900' },
    {
        key: 'overdue',
        label: t('invoicing.reports.cards.overdue'),
        value: state.summary.overdue,
        tone: state.summary.overdue > 0 ? 'text-red-600' : 'text-gray-900',
    },
    { key: 'paid', label: t('invoicing.reports.cards.paid'), value: state.summary.paid, tone: 'text-gray-900' },
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
        // A row that left the list (another filter, or it was just sent) cannot stay ticked.
        state.selected = state.selected.filter(uuid => state.invoices.some(invoice => invoice.uuid === uuid && isSendable(invoice)))
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
}

async function loadSummary() {
    try {
        const response = await citizenInvoiceService.getReport({})
        const data = response?.data

        if (!data) return

        state.summary = {
            revenue: data.totals?.net_amount || 0,
            outstanding: data.open?.outstanding || 0,
            overdue: data.open?.overdue || 0,
            paid: data.totals?.paid_amount || 0,
        }
    } catch (error: any) {
        // The list is the point of the page; the cards are a summary of it.
    }
}

async function loadSettings() {
    try {
        const [response, services] = await Promise.all([
            citizenInvoiceService.getSettings(),
            citizenInvoiceService.getServices(),
        ])

        if (response?.data) state.settings = response.data
        state.services = services?.data || []
    } catch (error: any) {
        // The list is still usable without the settings, so a failure here
        // only costs the catalogue its defaults.
    }
}

// An invoice written here belongs to the citizen who was picked, so it shows
// up on their own page as well without anything further being done.
function onInvoiceSaved() {
    state.isModalOpen = false
    load()
}

function onSettingsSaved(settings: any) {
    if (settings) state.settings = settings
}

// Only an invoice that has not gone out and is still alive can be sent; the API
// says the same, this just keeps the checkbox from offering what would be refused.
const sendableInvoices = computed(() => state.invoices.filter(isSendable))

const allSendableSelected = computed(() =>
    sendableInvoices.value.length > 0 && sendableInvoices.value.every(invoice => state.selected.includes(invoice.uuid))
)

function selectTooltip(invoice: any): string {
    const reason = sendBlockReason(invoice)

    return reason ? t(`invoicing.bulkSend.reasons.${reason}`) : t('invoicing.bulkSend.selectRow')
}

function toggleOne(uuid: string, checked: boolean) {
    state.selected = checked
        ? [...new Set([...state.selected, uuid])]
        : state.selected.filter(item => item !== uuid)
}

// Everything the current filter shows, which is the whole list: the page does
// not paginate.
function toggleAll(checked: boolean) {
    state.selected = checked ? sendableInvoices.value.map(invoice => invoice.uuid) : []
}

const skippedResults = computed(() =>
    (state.sendResult?.results ?? []).filter((result: BulkSendResult) => result.status === 'skipped')
)

function labelOf(result: BulkSendResult): string {
    return result.invoice_number || state.sentLabels[result.uuid] || result.uuid
}

function reasonOf(result: BulkSendResult): string {
    const key = `invoicing.bulkSend.reasons.${result.reason}`

    // The API's own sentence is the fallback for a reason this version of the
    // client does not know yet.
    return result.reason && te(key) ? t(key) : (result.message || t('invoicing.bulkSend.reasons.error'))
}

async function sendSelected() {
    state.isConfirmOpen = false

    const uuids = [...state.selected]

    if (!uuids.length) return

    state.sentLabels = Object.fromEntries(state.invoices
        .filter(invoice => uuids.includes(invoice.uuid))
        .map(invoice => [invoice.uuid, [invoice.invoice_number || t('citizens.invoices.statuses.draft'), invoice.citizen?.name].filter(Boolean).join(' - ')]))
    state.isSending = true
    state.error = ''

    try {
        // The API takes at most 200 at a time.
        const summary: BulkSendSummary = { results: [], queued: 0, skipped: 0 }

        for (const batch of chunk(uuids, 200)) {
            const response = await citizenInvoiceService.bulkSendInvoices(batch)

            summary.results.push(...(response?.data?.results ?? []))
            summary.queued += response?.data?.queued ?? 0
            summary.skipped += response?.data?.skipped ?? 0
        }

        state.sendResult = summary
        state.selected = []
        await load()
    } catch (error: any) {
        errorAlert(`${t('alert.error')}!`, error?.message || '')
    }

    state.isSending = false
}

function setFilter(status: string) {
    state.status = status
    load()
}

onMounted(() => {
    load()
    loadSummary()
    loadSettings()
})
</script>
