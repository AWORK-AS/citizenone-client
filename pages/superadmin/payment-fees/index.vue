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
                <div class="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.paymentFees.header') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">
                            {{ $t('superadmin.paymentFees.subtitle') }}
                        </p>
                        <p class="text-xs text-[#8891A4] mt-1" v-if="state.apps.length">
                            <span v-for="(app, index) in state.apps" :key="app.uuid">
                                <span v-if="index"> &middot; </span>
                                {{ app.name }} {{ formatRate(app.payment_fee_percent) }} %
                            </span>
                        </p>
                    </div>

                    <div class="flex items-end gap-2">
                        <button type="button" class="co-badge co-badge-navy" @click="stepMonth(-1)">
                            <Icon name="ph:caret-left" class="size-4" />
                        </button>
                        <div class="min-w-[150px] text-center">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-[#8891A4]">
                                {{ $t('superadmin.paymentFees.period') }}
                            </p>
                            <p class="text-sm font-semibold text-[#1F2533]">{{ readablePeriod }}</p>
                        </div>
                        <button type="button" class="co-badge co-badge-navy" @click="stepMonth(1)"
                            :disabled="isCurrentMonth">
                            <Icon name="ph:caret-right" class="size-4" />
                        </button>
                    </div>
                </div>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
                    <div v-for="card in cards" :key="card.key"
                        class="bg-white border border-[#EAECF0] rounded-xl shadow-sm px-4 py-4">
                        <p class="text-[11px] font-semibold uppercase tracking-wide text-[#8891A4]">{{ card.label }}</p>
                        <p class="mt-1 text-2xl font-semibold text-[#1F2533] tabular-nums">{{ card.value }}</p>
                        <p class="mt-1 text-xs text-[#8891A4]">{{ card.hint }}</p>
                    </div>
                </div>

                <div class="bg-white border border-[#F0C4C4] rounded-xl shadow-sm px-4 py-4 mb-5"
                    v-if="hasGaps">
                    <p class="text-sm font-semibold text-[#B42318]">{{ $t('superadmin.paymentFees.gaps.title') }}</p>
                    <ul class="mt-1 text-sm text-[#5C6478] list-disc pl-5">
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

                <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden mb-5"
                    v-if="state.uncharged.length">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                <th class="co-th" colspan="4">{{ $t('superadmin.paymentFees.uncharged.title') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in state.uncharged" :key="`${row.company}-${row.period}`"
                                class="border-b border-[#F5F6F8]">
                                <td class="co-td text-[13px] text-[#1F2533]">{{ row.company }}</td>
                                <td class="co-td text-[13px] text-[#5C6478]">{{ row.period }}</td>
                                <td class="co-td text-[13px]"
                                    :class="row.months_waiting >= 2 ? 'text-[#B42318] font-medium' : 'text-[#5C6478]'">
                                    {{ $t('superadmin.paymentFees.uncharged.waiting', { months: row.months_waiting }) }}
                                </td>
                                <td class="co-td text-right text-[13px] font-semibold text-[#1F2533] tabular-nums">
                                    {{ formatAmount(row.fee_amount) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden mb-5"
                    v-if="state.byApplication.length > 1">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                <th class="co-th">{{ $t('superadmin.paymentFees.app') }}</th>
                                <th class="co-th text-right">{{ $t('superadmin.paymentFees.payments') }}</th>
                                <th class="co-th text-right">{{ $t('superadmin.paymentFees.volume') }}</th>
                                <th class="co-th text-right">{{ $t('superadmin.paymentFees.fee') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in state.byApplication" :key="row.generic_name || 'unknown'"
                                class="border-b border-[#F5F6F8]">
                                <td class="co-td text-[13px] text-[#1F2533]">
                                    {{ row.name || $t('superadmin.paymentFees.unknownApp') }}
                                </td>
                                <td class="co-td text-right text-[13px] text-[#5C6478] tabular-nums">
                                    {{ row.payment_count }}
                                </td>
                                <td class="co-td text-right text-[13px] text-[#5C6478] tabular-nums">
                                    {{ formatAmount(row.gross_amount) }}
                                </td>
                                <td class="co-td text-right text-[13px] font-semibold text-[#1F2533] tabular-nums">
                                    {{ formatAmount(row.fee_amount) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                <th class="co-th">{{ $t('superadmin.paymentFees.company') }}</th>
                                <th class="co-th text-right">{{ $t('superadmin.paymentFees.payments') }}</th>
                                <th class="co-th text-right">{{ $t('superadmin.paymentFees.volume') }}</th>
                                <th class="co-th text-right">{{ $t('superadmin.paymentFees.fee') }}</th>
                                <th class="co-th">{{ $t('superadmin.paymentFees.status') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in state.statements" :key="row.uuid"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                <td class="co-td text-[13px] text-[#1F2533]">{{ row.company.name }}</td>
                                <td class="co-td text-right text-[13px] text-[#5C6478] tabular-nums">
                                    {{ row.payment_count }}
                                </td>
                                <td class="co-td text-right text-[13px] text-[#5C6478] tabular-nums">
                                    {{ formatAmount(row.gross_amount) }}
                                </td>
                                <td class="co-td text-right text-[13px] font-semibold text-[#1F2533] tabular-nums">
                                    {{ formatAmount(row.fee_amount) }}
                                </td>
                                <td class="co-td">
                                    <span class="co-badge" :class="row.status === 'charged'
                                        ? 'co-badge-green' : 'co-badge-navy'">
                                        {{ $t(`superadmin.paymentFees.statuses.${row.status}`) }}
                                    </span>
                                </td>
                            </tr>
                            <tr v-if="!state.statements.length && !state.isLoading">
                                <td class="co-td text-[13px] text-[#8891A4]" colspan="5">
                                    {{ $t('superadmin.paymentFees.empty') }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { superadminPaymentFeeService } from '@/components/api/superadmin/PaymentFeeService'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()

const state = reactive({
    period: moment().format('YYYY-MM'),
    apps: [] as any[],
    byApplication: [] as any[],
    reconciliation: {} as any,
    uncharged: [] as any[],
    totals: { company_count: 0, payment_count: 0, gross_amount: 0, fee_amount: 0, uncharged_amount: 0 },
    statements: [] as any[],
    isLoading: true,
    error: '',
})

// Anything here means money is on its way to being lost, so it sits above the
// figures rather than under them.
const hasGaps = computed(() => Boolean(
    state.reconciliation?.payments_without_fee?.count
    || state.reconciliation?.fees_without_statement
    || state.reconciliation?.stale_statements?.count
))

const isCurrentMonth = computed(() => state.period === moment().format('YYYY-MM'))

const readablePeriod = computed(() => moment(state.period, 'YYYY-MM')
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
    const next = moment(state.period, 'YYYY-MM').add(step, 'month')

    if (next.isAfter(moment(), 'month')) return

    state.period = next.format('YYYY-MM')
    load()
}

async function load() {
    state.error = ''
    state.isLoading = true

    try {
        const response = await superadminPaymentFeeService.getPaymentFees({ period: state.period })
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
        state.error = error?.message || ''
    } finally {
        state.isLoading = false
    }
}

onMounted(() => load())
</script>
