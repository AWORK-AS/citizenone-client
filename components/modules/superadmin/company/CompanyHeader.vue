<template>
    <header class="mb-6">
        <NuxtLink to="/superadmin/companies"
            class="inline-flex items-center gap-1.5 mb-3 text-sm text-ink-body hover:text-ink transition-colors">
            <Icon name="ph:arrow-left" class="w-4 h-4" aria-hidden="true" />
            {{ $t('superadmin.companyHeader.back') }}
        </NuxtLink>

        <div class="bg-white rounded-xl border border-line px-5 pt-5">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-3">
                        <h1 v-if="summary" class="text-2xl font-light text-ink truncate">{{ summary.name }}</h1>
                        <div v-else-if="isLoading" class="h-8 w-56 rounded-lg bg-surface-canvas animate-pulse" aria-hidden="true" />
                        <h1 v-else class="text-2xl font-light text-ink">{{ $t('superadmin.companyHeader.unknownCompany') }}</h1>

                        <ModulesSuperadminStatusPill v-if="pill" :variant="TONE_PILL_VARIANT[pill.tone]"
                            :label="$t(pill.labelKey, pill.params)" />
                    </div>

                    <dl v-if="summary" class="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div class="flex items-center gap-1.5">
                            <dt class="text-ink-body">{{ $t('superadmin.companyHeader.billing') }}</dt>
                            <dd class="font-semibold text-ink">{{ $t(`superadmin.companyHeader.billingMethod.${billing}`) }}</dd>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <dt class="text-ink-body">{{ $t('superadmin.companyHeader.economicNumber') }}</dt>
                            <dd class="font-semibold text-ink">{{ summary.economic_customer_number ?? '—' }}</dd>
                        </div>
                        <div v-if="summary.mrr !== null" class="flex items-center gap-1.5">
                            <dt class="text-ink-body">{{ $t('superadmin.companyHeader.mrr') }}</dt>
                            <dd class="font-semibold text-ink">
                                <Tooltip :text="$t('superadmin.companyHeader.mrrHelp', { date: formatDate(summary.mrr_captured_on) })" position="top" wrap>
                                    {{ formatAmount(summary.mrr, 'DKK') }}
                                </Tooltip>
                            </dd>
                        </div>
                        <div v-if="summary.agreement" class="flex items-center gap-1.5 min-w-0">
                            <dt class="text-ink-body">{{ $t('superadmin.companyHeader.agreement') }}</dt>
                            <dd class="font-semibold text-ink truncate">
                                {{ summary.agreement.name }}
                                <span v-if="summary.agreement.ends_on" class="font-normal text-ink-body">
                                    · {{ $t(summary.agreement.auto_renews ? 'superadmin.companyHeader.agreementRenews' : 'superadmin.companyHeader.agreementEnds', { date: formatDate(summary.agreement.ends_on) }) }}
                                </span>
                            </dd>
                        </div>
                        <div v-else-if="summary.can_view_financials" class="flex items-center gap-1.5">
                            <dt class="text-ink-body">{{ $t('superadmin.companyHeader.agreement') }}</dt>
                            <dd class="text-ink-body">{{ $t('superadmin.companyHeader.noAgreement') }}</dd>
                        </div>
                        <div v-if="summary.contract_ends_at" class="flex items-center gap-1.5">
                            <dt class="text-ink-body">{{ $t('superadmin.companyHeader.contractEnds') }}</dt>
                            <dd class="font-semibold text-warning-ink">{{ formatDate(summary.contract_ends_at) }}</dd>
                        </div>
                    </dl>
                </div>

                <div v-if="$slots.actions" class="flex flex-wrap gap-2 shrink-0">
                    <slot name="actions" />
                </div>
            </div>

            <nav class="mt-4 -mx-5 px-3 flex gap-1 overflow-x-auto border-t border-line"
                :aria-label="$t('superadmin.companyHeader.tabsLabel')">
                <NuxtLink v-for="tab in tabs" :key="tab.key" :to="tab.href"
                    class="inline-flex items-center gap-2 min-h-[44px] px-3 -mb-px border-b-2 text-sm whitespace-nowrap transition-colors"
                    :class="tab.key === active
                        ? 'border-tertiary text-tertiary font-semibold'
                        : 'border-transparent text-ink-body font-medium hover:text-ink'"
                    :aria-current="tab.key === active ? 'page' : undefined">
                    <Icon :name="tab.icon" class="w-4 h-4 shrink-0" aria-hidden="true" />
                    {{ $t(tab.labelKey) }}
                    <!-- Meetings still to come with this customer; pulses when one is today or on now. -->
                    <span v-if="tab.key === 'meetings' && meetingBadge.count"
                        class="relative inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-tertiary text-white text-[11px] font-semibold tabular-nums"
                        :title="$t('superadmin.companyHeader.meetingsBadge', { count: meetingBadge.count }, meetingBadge.count)">
                        <span v-if="meetingBadge.soon" class="absolute inset-0 rounded-full bg-tertiary animate-ping opacity-60" aria-hidden="true" />
                        <span class="relative">{{ meetingBadge.count }}</span>
                    </span>
                </NuxtLink>
            </nav>
        </div>
    </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { activeCompanyTab, billingLabel, companyStatusPill, companyTabs, TONE_PILL_VARIANT, upcomingMeetingsBadge } from '@/composables/superadminCompany'
import { salesMeetingService } from '@/components/api/superadmin/SalesMeetingService'
import { useCompanySummary } from '@/composables/useCompanySummary'
import { usePermissions } from '@/composables/usePermissions'

/**
 * The top of every superadmin company page: who the customer is, how they
 * stand, and the tabs to the rest of them. The data is cached per company, so
 * a tab switch does not refetch or flicker.
 */
const props = defineProps<{ companyUuid?: string }>()

const route = useRoute()
const { locale } = useI18n()
const { can } = usePermissions()
const { formatAmount } = useAmountFormatter()

const uuid = computed(() => props.companyUuid || String(route.params.company_uuid ?? ''))
const { summary, isLoading, ensure } = useCompanySummary(uuid)

const pill = computed(() => companyStatusPill(summary.value))
const billing = computed(() => billingLabel(summary.value) ?? 'card')
const tabs = computed(() => companyTabs(uuid.value, can))
const active = computed(() => activeCompanyTab(route.name as string))

function formatDate(value: string | null | undefined) {
    if (!value) return '—'
    const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)
    if (Number.isNaN(date.getTime())) return value

    return date.toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
}

const meetingBadge = ref({ count: 0, soon: false })

async function loadMeetingBadge() {
    if (!uuid.value || !can('view_companies')) return
    try {
        const response = await salesMeetingService.companyMeetings(uuid.value)
        meetingBadge.value = upcomingMeetingsBadge(response?.data ?? [])
    } catch {
        // Only a badge: without it the tab still works.
        meetingBadge.value = { count: 0, soon: false }
    }
}

onMounted(() => { ensure(); loadMeetingBadge() })
watch(uuid, () => { ensure(); loadMeetingBadge() })
</script>
