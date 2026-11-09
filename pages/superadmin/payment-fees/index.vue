<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.paymentFees.pageTitle') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.paymentFees.header') }}
            </template>

            <div class="p-1">
                <ModulesSuperadminPageHeader :title="$t('superadmin.paymentFees.header')">
                    <template #subtitle>
                        {{ $t('superadmin.paymentFees.subtitle') }}
                        <span class="block text-xs text-ink-muted mt-1" v-if="state.apps.length">
                            <span v-for="(app, index) in state.apps" :key="app.uuid">
                                <span v-if="index"> &middot; </span>
                                {{ app.name }} {{ formatRate(app.payment_fee_percent) }} %
                            </span>
                        </span>
                    </template>
                    <template #actions>
                    <div class="flex items-end gap-2">
                        <button type="button" class="co-badge co-badge-navy" @click="stepMonth(-1)">
                            <Icon name="ph:caret-left" class="size-4" />
                        </button>
                        <div class="min-w-[150px] text-center">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                                {{ $t('superadmin.paymentFees.period') }}
                            </p>
                            <p class="text-sm font-semibold text-ink">{{ readablePeriod }}</p>
                        </div>
                        <button type="button" class="co-badge co-badge-navy" @click="stepMonth(1)"
                            :disabled="isCurrentMonth">
                            <Icon name="ph:caret-right" class="size-4" />
                        </button>
                    </div>
                    </template>
                </ModulesSuperadminPageHeader>



                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
                    <div v-for="card in cards" :key="card.key"
                        class="bg-white border border-line rounded-xl shadow-sm px-4 py-4">
                        <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{{ card.label }}</p>
                        <p class="mt-1 text-2xl font-semibold text-ink tabular-nums">{{ card.value }}</p>
                        <p class="mt-1 text-xs text-ink-muted">{{ card.hint }}</p>
                    </div>
                </div>

                <div class="bg-white border border-danger-line rounded-xl shadow-sm px-4 py-4 mb-5"
                    v-if="hasGaps">
                    <p class="text-sm font-semibold text-danger-ink">{{ $t('superadmin.paymentFees.gaps.title') }}</p>
                    <ul class="mt-1 text-sm text-ink-body list-disc pl-5">
                        <li v-if="state.reconciliation.payments_without_fee?.count">
                            {{ $t('superadmin.paymentFees.gaps.paymentsWithoutFee', {
                                count: state.reconciliation.payments_without_fee.count,
                                amount: formatAmount(state.reconciliation.payments_without_fee.amount),
                            }) }}
                        </li>
                        <li v-if="state.reconciliation.fees_without_statement">
                            {{ $t('superadmin.paymentFees.gaps.feesWithoutStatement', {
                                count: state.reconciliation.fees_without_statement,
                            }) }}
                        </li>
                        <li v-if="state.reconciliation.stale_statements?.count">
                            {{ $t('superadmin.paymentFees.gaps.stale', {
                                count: state.reconciliation.stale_statements.count,
                                amount: formatAmount(state.reconciliation.stale_statements.amount),
                                period: state.reconciliation.stale_statements.oldest_period,
                            }) }}
                        </li>
                    </ul>
                </div>

                <div class="bg-white border border-line rounded-xl shadow-sm overflow-hidden mb-5"
                    v-if="state.uncharged.length">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-surface-subtle border-b border-line">
                                <th class="co-th" colspan="4">{{ $t('superadmin.paymentFees.uncharged.title') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in state.uncharged" :key="`${row.company}-${row.period}`"
                                class="border-b border-surface-canvas">
                                <td class="co-td text-[13px] text-ink">{{ row.company }}</td>
                                <td class="co-td text-[13px] text-ink-body">{{ row.period }}</td>
                                <td class="co-td text-[13px]"
                                    :class="row.months_waiting >= 2 ? 'text-danger-ink font-medium' : 'text-ink-body'">
                                    {{ $t('superadmin.paymentFees.uncharged.waiting', { months: row.months_waiting }) }}
                                </td>
                                <td class="co-td text-right text-[13px] font-semibold text-ink tabular-nums">
                                    {{ formatAmount(row.fee_amount) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-white border border-line rounded-xl shadow-sm overflow-hidden mb-5"
                    v-if="state.byApplication.length > 1">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-surface-subtle border-b border-line">
                                <th class="co-th">{{ $t('superadmin.paymentFees.app') }}</th>
                                <th class="co-th text-right">{{ $t('superadmin.paymentFees.payments') }}</th>
                                <th class="co-th text-right">{{ $t('superadmin.paymentFees.volume') }}</th>
                                <th class="co-th text-right">{{ $t('superadmin.paymentFees.fee') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in state.byApplication" :key="row.generic_name || 'unknown'"
                                class="border-b border-surface-canvas">
                                <td class="co-td text-[13px] text-ink">
                                    {{ row.name || $t('superadmin.paymentFees.unknownApp') }}
                                </td>
                                <td class="co-td text-right text-[13px] text-ink-body tabular-nums">
                                    {{ row.payment_count }}
                                </td>
                                <td class="co-td text-right text-[13px] text-ink-body tabular-nums">
                                    {{ formatAmount(row.gross_amount) }}
                                </td>
                                <td class="co-td text-right text-[13px] font-semibold text-ink tabular-nums">
                                    {{ formatAmount(row.fee_amount) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- The month's statements, one per company. The API sends the month
                     whole, so search, sort and paging happen here. -->
                <ModulesSuperadminDataTable :columns="columns" :rows="page.rows" rowKey="uuid"
                    :loading="state.isLoading" :error="state.loadError" :meta="page.meta"
                    :sort="list.state.sort" :order="list.state.order"
                    v-model:search="list.searchInput.value"
                    :filtered="!!list.state.search" emptyIcon="ph:coins"
                    :emptyTitle="$t('superadmin.paymentFees.empty')"
                    :exportName="`${$t('superadmin.paymentFees.header')} ${list.state.filters.period}`"
                    :exportRows="() => page.all"
                    @sort="list.toggleSort" @page="list.setPage" @reset="list.reset" @retry="reload">
                    <template #cell-company="{ row }">
                        <span class="text-ink">{{ row.company?.name }}</span>
                    </template>
                    <template #cell-gross_amount="{ row }">
                        {{ formatAmount(row.gross_amount) }}
                    </template>
                    <template #cell-fee_amount="{ row }">
                        <span class="font-semibold text-ink">{{ formatAmount(row.fee_amount) }}</span>
                    </template>
                    <template #cell-status="{ row }">
                        <ModulesSuperadminStatusPill :variant="row.status === 'charged' ? 'success' : 'warning'"
                            :label="$t(`superadmin.paymentFees.statuses.${row.status}`)" />
                    </template>
                </ModulesSuperadminDataTable>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { superadminPaymentFeeService } from '@/components/api/superadmin/PaymentFeeService'
import { useI18n } from 'vue-i18n'
import { useListQuery } from '@/composables/useListQuery'
import { clientPage, type DataTableColumn } from '@/composables/dataTable'

const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()

const state = reactive({
    loadedPeriod: '',
    apps: [] as any[],
    byApplication: [] as any[],
    reconciliation: {} as any,
    uncharged: [] as any[],
    totals: { company_count: 0, payment_count: 0, gross_amount: 0, fee_amount: 0, uncharged_amount: 0 },
    statements: [] as any[],
    isLoading: true,
    loadError: null as string | null,
})

// The month, search, sort and page live in the URL, so a link shows the same month.
const list = useListQuery({
    filters: { period: moment().format('YYYY-MM') },
    onChange: () => {
        // Only another month is another request; the rest happens on the rows already here.
        if (list.state.filters.period !== state.loadedPeriod) load()
    },
})

const columns = computed<DataTableColumn[]>(() => [
    { key: 'company', label: t('superadmin.paymentFees.company'), sortable: true,
        csv: { value: row => row.company?.name } },
    { key: 'payment_count', label: t('superadmin.paymentFees.payments'), sortable: true, align: 'right',
        cellClass: 'text-[13px] text-ink-body tabular-nums', csv: { type: 'number' } },
    { key: 'gross_amount', label: t('superadmin.paymentFees.volume'), sortable: true, align: 'right',
        cellClass: 'text-[13px] text-ink-body tabular-nums', csv: { type: 'amount' } },
    { key: 'fee_amount', label: t('superadmin.paymentFees.fee'), sortable: true, align: 'right',
        cellClass: 'text-[13px] tabular-nums', csv: { type: 'amount' } },
    { key: 'status', label: t('superadmin.paymentFees.status'), sortable: true,
        csv: { value: row => t(`superadmin.paymentFees.statuses.${row.status}`) } },
])

const page = computed(() => clientPage(state.statements, {
    search: list.state.search,
    searchText: row => [row.company?.name, t(`superadmin.paymentFees.statuses.${row.status}`)].join(' '),
    sort: list.state.sort,
    order: list.state.order,
    sortValue: (row, sort) => (sort === 'company' ? row.company?.name : row[sort]),
    page: list.state.page,
    perPage: 25,
}))

// Anything here means money is on its way to being lost, so it sits above the
// figures rather than under them.
const hasGaps = computed(() => Boolean(
    state.reconciliation?.payments_without_fee?.count
    || state.reconciliation?.fees_without_statement
    || state.reconciliation?.stale_statements?.count
))

const period = computed(() => (/^\d{4}-\d{2}$/.test(list.state.filters.period) ? list.state.filters.period : moment().format('YYYY-MM')))

const isCurrentMonth = computed(() => period.value === moment().format('YYYY-MM'))

const readablePeriod = computed(() => moment(period.value, 'YYYY-MM')
    .locale(locale.value === 'en' ? 'en' : 'da')
    .format('MMMM YYYY'))

const cards = computed(() => [
    {
        key: 'fee',
        label: t('superadmin.paymentFees.cards.fee'),
        value: formatAmount(state.totals.fee_amount),
        hint: t('superadmin.paymentFees.cards.feeHint', { count: state.totals.company_count }),
    },
    {
        key: 'uncharged',
        label: t('superadmin.paymentFees.cards.uncharged'),
        value: formatAmount(state.totals.uncharged_amount),
        hint: t('superadmin.paymentFees.cards.unchargedHint'),
    },
    {
        key: 'volume',
        label: t('superadmin.paymentFees.cards.volume'),
        value: formatAmount(state.totals.gross_amount),
        hint: t('superadmin.paymentFees.cards.volumeHint'),
    },
    {
        key: 'payments',
        label: t('superadmin.paymentFees.cards.payments'),
        value: String(state.totals.payment_count),
        hint: t('superadmin.paymentFees.cards.paymentsHint'),
    },
])

function formatAmount(amount: number): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0)
}

function formatRate(rate: number): string {
    return String(Number(rate) || 0).replace('.', ',')
}

// The month ahead has nothing in it yet, so the arrow stops at today.
function stepMonth(step: number) {
    const next = moment(period.value, 'YYYY-MM').add(step, 'month')

    if (next.isAfter(moment(), 'month')) return

    // A new month starts on its first page, with the search kept.
    list.setFilter('period', next.format('YYYY-MM'))
}

function reload() {
    load()
}

let requestSeq = 0

async function load() {
    const seq = ++requestSeq
    const requested = period.value
    state.loadedPeriod = list.state.filters.period
    state.loadError = null
    state.isLoading = true

    try {
        const response = await superadminPaymentFeeService.getPaymentFees({ period: requested })
        if (seq !== requestSeq) return
        const data = response?.data

        if (data) {
            state.apps = data.apps || []
            state.byApplication = data.by_application || []
            state.reconciliation = data.reconciliation || {}
            state.uncharged = data.uncharged || []
            state.totals = data.totals
            state.statements = data.statements || []
        }
    } catch (error: any) {
        if (seq !== requestSeq) return
        state.loadedPeriod = ''
        state.loadError = error?.message || t('superadmin.dataTable.errorTitle')
    }
    if (seq === requestSeq) state.isLoading = false
}
</script>
