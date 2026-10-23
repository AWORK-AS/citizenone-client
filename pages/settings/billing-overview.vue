<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('billingOverview.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('billingOverview.title') }}</template>

            <ModulesUserSettingsBillingSubTab class="mt-5" />

            <div class="mt-8 max-w-4xl">
                <p class="text-sm text-gray-600">{{ $t('billingOverview.intro') }}</p>

                <div v-if="state.loading" class="mt-6 text-sm text-gray-500">{{ $t('billingOverview.loading') }}</div>

                <div v-else-if="state.failed"
                    class="mt-6 rounded-lg border-1.5 border-gray-200 bg-white p-6 text-sm text-gray-600">
                    {{ state.forbidden ? $t('billingOverview.forbidden') : $t('billingOverview.failed') }}
                </div>

                <template v-else-if="state.data">
                    <!-- The four numbers the page exists for: what it costs a month,
                         how many separate charges that is, what those charges cost
                         in fees on their own, and when the next one comes. -->
                    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('billingOverview.summary.monthly') }}
                            </p>
                            <p class="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                                {{ kr(summary.monthly_equivalent_excl_vat) }}
                            </p>
                            <p class="mt-1 text-xs text-gray-500">{{ $t('billingOverview.summary.monthlyHint') }}</p>
                        </div>
                        <div class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('billingOverview.summary.charges') }}
                            </p>
                            <p class="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                                {{ summary.monthly_charges_count }}
                            </p>
                            <p class="mt-1 text-xs text-gray-500" v-if="summary.billing_days?.length">
                                {{ $t('billingOverview.summary.chargesHint', { days: summary.billing_days.map((d: number) => `${d}.`).join(', ') }) }}
                            </p>
                        </div>
                        <div class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('billingOverview.summary.fees') }}
                            </p>
                            <p class="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                                {{ kr(summary.monthly_service_fees) }}
                            </p>
                            <p class="mt-1 text-xs text-gray-500">
                                {{ $t('billingOverview.summary.feesHint', { fee: kr(serviceFee) }) }}
                            </p>
                        </div>
                        <div class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('billingOverview.summary.next') }}
                            </p>
                            <p class="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                                {{ summary.next_charge_on ? formatDateToReadable(summary.next_charge_on) : '-' }}
                            </p>
                            <p class="mt-1 text-xs text-gray-500" v-if="state.data.charges.length">
                                {{ kr(state.data.charges[0].total) }} {{ $t('billingOverview.inclVat') }}
                            </p>
                        </div>
                    </div>

                    <div v-if="state.data.agreement_billed"
                        class="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600 ring-1 ring-gray-200">
                        {{ $t('billingOverview.agreementNote') }}
                    </div>

                    <div v-if="!state.data.charges.length"
                        class="mt-6 rounded-lg border-1.5 border-gray-200 bg-white p-6 text-sm text-gray-600">
                        {{ $t('billingOverview.empty') }}
                    </div>

                    <!-- One card per charge on the card statement, in the order they come. -->
                    <section v-for="charge in state.data.charges" :key="charge.reference"
                        class="mt-6 rounded-lg border-1.5 border-gray-200 bg-white p-6">
                        <div class="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 class="text-sm font-semibold text-gray-900">
                                {{ charge.cadence === 'yearly'
                                    ? $t('billingOverview.charge.yearly', { day: charge.billing_day, month: monthName(charge.billing_month) })
                                    : $t('billingOverview.charge.monthly', { day: charge.billing_day }) }}
                            </h3>
                            <p class="text-sm text-gray-600">
                                {{ $t('billingOverview.charge.next', { date: formatDateToReadable(charge.next_charge_on) }) }}
                            </p>
                        </div>

                        <div class="table-responsive mt-4">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="text-left text-xs text-gray-500">
                                        <th class="pb-2 font-medium">{{ $t('billingOverview.table.product') }}</th>
                                        <th class="pb-2 font-medium text-right">{{ $t('billingOverview.table.quantity') }}</th>
                                        <th class="pb-2 font-medium text-right">{{ $t('billingOverview.table.unitPrice') }}</th>
                                        <th class="pb-2 font-medium text-right">{{ $t('billingOverview.table.amount') }}</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="(line, index) in charge.lines" :key="index">
                                        <td class="py-2 text-gray-900">
                                            {{ line.name }}
                                            <span class="ml-1 text-xs text-gray-500">
                                                {{ $t(`billingOverview.kind.${line.kind}`) }}
                                            </span>
                                        </td>
                                        <td class="py-2 text-right tabular-nums text-gray-700">{{ line.quantity }}</td>
                                        <td class="py-2 text-right tabular-nums text-gray-700">{{ kr(line.unit_price) }}</td>
                                        <td class="py-2 text-right tabular-nums text-gray-900">{{ kr(line.amount) }}</td>
                                    </tr>
                                </tbody>
                                <tfoot class="border-t border-gray-200 text-gray-700">
                                    <tr>
                                        <td colspan="3" class="pt-2">{{ $t('billingOverview.table.vat') }}</td>
                                        <td class="pt-2 text-right tabular-nums">{{ kr(charge.vat) }}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3">{{ $t('billingOverview.table.serviceFee') }}</td>
                                        <td class="text-right tabular-nums">{{ kr(charge.service_fee) }}</td>
                                    </tr>
                                    <tr class="font-semibold text-gray-900">
                                        <td colspan="3" class="pt-1">{{ $t('billingOverview.table.total') }}</td>
                                        <td class="pt-1 text-right tabular-nums">{{ kr(charge.total) }}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </section>

                    <p class="mt-6 text-xs text-gray-500">{{ $t('billingOverview.notIncluded') }}</p>
                </template>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
/**
 * "What am I paying for": every recurring card charge, one card each, priced
 * and dated the way the card is actually charged. Read-only. The figures come
 * from /user/billing/overview, which mirrors the billing commands.
 */
import { billingService } from '@/components/api/user/BillingService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'billingOverview.title',
        translate: true,
        href: '/settings/billing-overview',
    },
]

const state = reactive({
    loading: true,
    failed: false,
    forbidden: false,
    data: null as any,
})

const summary = computed(() => state.data?.summary ?? {})
const serviceFee = computed(() => state.data?.charges?.[0]?.service_fee ?? 4.75)

// We bill in DKK whatever language the page is read in.
function kr(amount: any) {
    return formatAmount(amount ?? 0, 'DKK')
}

const monthKeys = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function monthName(month: number | null) {
    return month ? t(`calendar.month.${monthKeys[month - 1]}`).toLowerCase() : ''
}

onMounted(async () => {
    try {
        const response = await billingService.getOverview()
        state.data = response?.data ?? null
        state.failed = !state.data
    } catch (error: any) {
        state.failed = true
        state.forbidden = error?.status === 403 || error?.response?.status === 403
    }
    state.loading = false
})
</script>
