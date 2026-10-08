<template>
    <div v-if="hasData" class="space-y-4">
        <div class="grid grid-cols-2 gap-4" :class="showHeadline ? 'lg:grid-cols-5' : 'lg:grid-cols-4'">
            <!-- Contract MRR / ARR: the headline -->
            <div v-if="showHeadline" class="co-metric-card" style="--accent:#2E9E33">
                <div class="flex items-center gap-1">
                    <p class="co-metric-label">{{ $t('superadmin.metrics.contractMrr') }}</p>
                    <Tooltip :text="$t('superadmin.metrics.help.contractMrr')" position="bottom" wrap>
                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]"
                            :aria-label="$t('superadmin.metrics.help.contractMrr')" />
                    </Tooltip>
                </div>
                <p class="co-metric-value text-[#2E9E33]">{{ formatAmount(num(data.contract_mrr), 'DKK') }}</p>
                <p class="co-metric-sub">
                    {{ $t('superadmin.metrics.contractArr', { amount: formatAmount(num(data.contract_arr), 'DKK') }) }}
                </p>
            </div>

            <!-- Cash MRR. The 12-month total is the "Kontraheret, næste 12 mdr." card on Ledelse. -->
            <div class="co-metric-card" style="--accent:#42AED9">
                <div class="flex items-center gap-1">
                    <p class="co-metric-label">{{ $t('superadmin.metrics.cashMrr') }}</p>
                    <Tooltip :text="$t('superadmin.metrics.help.cashMrr')" position="bottom" wrap>
                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]"
                            :aria-label="$t('superadmin.metrics.help.cashMrr')" />
                    </Tooltip>
                </div>
                <p class="co-metric-value text-[#205E77]">{{ formatAmount(num(data.cash_mrr), 'DKK') }}</p>
            </div>

            <!-- Backlog -->
            <div class="co-metric-card" style="--accent:#205E77">
                <div class="flex items-center gap-1">
                    <p class="co-metric-label">{{ $t('superadmin.metrics.backlog') }}</p>
                    <Tooltip :text="$t('superadmin.metrics.help.backlog')" position="bottom" wrap>
                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]"
                            :aria-label="$t('superadmin.metrics.help.backlog')" />
                    </Tooltip>
                </div>
                <p class="co-metric-value">{{ formatAmount(num(data.agreement_backlog), 'DKK') }}</p>
                <p class="co-metric-sub">{{ $t('superadmin.metrics.backlogSub') }}</p>
            </div>

            <!-- Outstanding -->
            <div class="co-metric-card" style="--accent:#CC3B2D">
                <div class="flex items-center gap-1">
                    <p class="co-metric-label">{{ $t('superadmin.metrics.outstanding') }}</p>
                    <Tooltip :text="$t('superadmin.metrics.help.outstanding')" position="bottom" wrap>
                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]"
                            :aria-label="$t('superadmin.metrics.help.outstanding')" />
                    </Tooltip>
                </div>
                <p class="co-metric-value" :class="num(data.agreement_outstanding) > 0 ? 'text-[#CC3B2D]' : ''">
                    {{ formatAmount(num(data.agreement_outstanding), 'DKK') }}
                </p>
                <p class="co-metric-sub">{{ $t('superadmin.metrics.outstandingSub') }}</p>
            </div>

            <!-- Bindings ending -->
            <div class="co-metric-card" style="--accent:#E0A83D">
                <div class="flex items-center gap-1">
                    <p class="co-metric-label">{{ $t('superadmin.metrics.bindingsEnding') }}</p>
                    <Tooltip :text="$t('superadmin.metrics.help.bindingsEnding')" position="bottom" wrap>
                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]"
                            :aria-label="$t('superadmin.metrics.help.bindingsEnding')" />
                    </Tooltip>
                    <Tooltip v-if="withoutPlan > 0" :text="$t('superadmin.metrics.help.renewalsWithoutPlan', { count: withoutPlan })"
                        position="bottom" wrap>
                        <span class="co-badge bg-[#FEF3C7] text-[#B45309]" data-testid="renewals-without-plan">
                            <Icon name="ph:warning" class="w-3 h-3" aria-hidden="true" />
                            {{ withoutPlan }}
                        </span>
                    </Tooltip>
                </div>
                <div class="mt-2 flex items-center gap-2">
                    <Tooltip v-for="bucket in bindingBuckets" :key="bucket.key"
                        :text="$t('superadmin.metrics.bindingsWithin', { count: bucket.count, months: bucket.months })"
                        position="bottom" wrap>
                        <div class="rounded-lg bg-[#F9FAFB] border border-[#EAECF0] px-2.5 py-1.5 text-center min-w-[52px]">
                            <p class="text-[17px] font-bold leading-none text-[#1F2533]">{{ bucket.count }}</p>
                            <p class="text-[10px] text-[#8891A4] mt-1">{{ $t('superadmin.metrics.monthsShort', { months: bucket.months }) }}</p>
                        </div>
                    </Tooltip>
                </div>
            </div>
        </div>

        <!-- The bindings that end soonest, each linking to the company's Aftaler tab -->
        <div v-if="showUpcoming && upcoming.length"
            class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
            <div class="px-5 py-3 border-b border-[#EAECF0] flex items-center gap-1.5">
                <h2 class="text-[13px] font-semibold text-[#1F2533]">{{ $t('superadmin.metrics.upcomingTitle') }}</h2>
                <Tooltip :text="$t('superadmin.metrics.help.upcoming')" position="top" wrap>
                    <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7]"
                        :aria-label="$t('superadmin.metrics.help.upcoming')" />
                </Tooltip>
            </div>
            <NuxtLink v-for="row in upcoming" :key="row.agreement_uuid"
                :to="`/superadmin/companies/${row.company_uuid}/agreements`"
                class="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-[#F5F6F8] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                <div class="min-w-0">
                    <p class="text-[13px] font-medium text-[#1F2533] truncate">
                        {{ row.company_name }}
                        <span class="text-[#8891A4] font-normal">{{ row.agreement_name }}</span>
                    </p>
                    <p class="text-[11px] text-[#8891A4]">
                        {{ $t('superadmin.metrics.upcomingDates', {
                            ends: formatDateToReadable(row.ends_on), notice: formatDateToReadable(row.notice_deadline) }) }}
                    </p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <ModulesSuperadminAgreementRenewalPlanChip v-if="renewalPlanMissing(row)" />
                    <Tooltip :text="row.auto_renews ? $t('superadmin.agreements.help.autoRenews') : $t('superadmin.metrics.noAutoRenewHelp')"
                        position="top" wrap>
                        <span class="co-badge" :class="row.auto_renews ? 'co-badge-navy' : 'co-badge-gray'">
                            {{ row.auto_renews ? $t('superadmin.agreements.autoRenews') : $t('superadmin.metrics.noAutoRenew') }}
                        </span>
                    </Tooltip>
                    <span class="text-[13px] font-semibold text-[#1F2533]">{{ formatAmount(num(row.contract_mrr), 'DKK') }}</span>
                </div>
            </NuxtLink>
        </div>

        <Tooltip :text="$t('superadmin.agreements.internal.help')" position="top" wrap>
            <p class="text-[11px] text-[#8891A4] flex items-center gap-1.5">
                <Icon name="ph:eye-slash" class="w-3.5 h-3.5" aria-hidden="true" />
                {{ $t('superadmin.metrics.internalNote') }}
            </p>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { renewalPlanMissing, renewalsWithoutPlan } from '@/composables/agreements'
import type { BindingsEnding } from '@/types/agreement'

/**
 * The agreement figures from `recurring_revenue`: contract MRR/ARR as the
 * headline, cash MRR/ARR for the next 12 months, backlog, outstanding and the
 * bindings that end within 3, 6 and 12 months. Renders nothing until the API
 * sends them (contract_mrr absent), so the screens work against an older server.
 */
const props = defineProps({
    data: { type: Object as () => any, default: null },
    showHeadline: { type: Boolean, default: true },
    /** The short list of the bindings that end next (bindings_ending.upcoming). */
    showUpcoming: { type: Boolean, default: false },
})

const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()

const hasData = computed(() => props.data && props.data.contract_mrr !== undefined && props.data.contract_mrr !== null)

function num(value: any): number {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
}

const withoutPlan = computed(() => renewalsWithoutPlan(props.data))

const upcoming = computed<any[]>(() => (props.data?.bindings_ending?.upcoming ?? []).slice(0, 8))

const bindingBuckets = computed(() => {
    const ending: Partial<BindingsEnding> = props.data?.bindings_ending ?? {}
    return [
        { key: '3', months: 3, count: num(ending.within_3_months) },
        { key: '6', months: 6, count: num(ending.within_6_months) },
        { key: '12', months: 12, count: num(ending.within_12_months) },
    ]
})
</script>

<style scoped>
.co-metric-card {
    background: white;
    border: 1px solid #EAECF0;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    position: relative;
    overflow: hidden;
}

.co-metric-card::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
    background: var(--accent, #42AED9);
}

.co-metric-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #8891A4;
}

.co-metric-value {
    font-size: 24px;
    font-weight: 800;
    line-height: 1.1;
    margin-top: 6px;
    color: #1F2533;
}

.co-metric-sub {
    font-size: 12px;
    color: #5C6478;
    margin-top: 4px;
}
</style>
