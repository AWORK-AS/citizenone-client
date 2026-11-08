<template>
    <header class="mb-6">
        <NuxtLink to="/superadmin/companies"
            class="inline-flex items-center gap-1.5 mb-3 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <Icon name="ph:arrow-left" class="w-4 h-4" aria-hidden="true" />
            {{ $t('superadmin.companyHeader.back') }}
        </NuxtLink>

        <div class="bg-white rounded-xl border border-surface-200 px-5 pt-5">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-3">
                        <h1 v-if="summary" class="text-2xl font-light text-gray-900 truncate">{{ summary.name }}</h1>
                        <div v-else-if="isLoading" class="h-8 w-56 rounded-lg bg-gray-100 animate-pulse" aria-hidden="true" />
                        <h1 v-else class="text-2xl font-light text-gray-900">{{ $t('superadmin.companyHeader.unknownCompany') }}</h1>

                        <span v-if="pill"
                            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold"
                            :class="TONE_CLASSES[pill.tone].pill">
                            <span class="w-1.5 h-1.5 rounded-full" :class="TONE_CLASSES[pill.tone].dot" aria-hidden="true" />
                            {{ $t(pill.labelKey, pill.params) }}
                        </span>
                    </div>

                    <dl v-if="summary" class="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div class="flex items-center gap-1.5">
                            <dt class="text-gray-500">{{ $t('superadmin.companyHeader.billing') }}</dt>
                            <dd class="font-semibold text-gray-800">{{ $t(`superadmin.companyHeader.billingMethod.${billing}`) }}</dd>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <dt class="text-gray-500">{{ $t('superadmin.companyHeader.economicNumber') }}</dt>
                            <dd class="font-semibold text-gray-800">{{ summary.economic_customer_number ?? '—' }}</dd>
                        </div>
                        <div v-if="summary.mrr !== null" class="flex items-center gap-1.5">
                            <dt class="text-gray-500">{{ $t('superadmin.companyHeader.mrr') }}</dt>
                            <dd class="font-semibold text-gray-800">
                                <Tooltip :text="$t('superadmin.companyHeader.mrrHelp', { date: formatDate(summary.mrr_captured_on) })" position="top" wrap>
                                    {{ formatAmount(summary.mrr, 'DKK') }}
                                </Tooltip>
                            </dd>
                        </div>
                        <div v-if="summary.agreement" class="flex items-center gap-1.5 min-w-0">
                            <dt class="text-gray-500">{{ $t('superadmin.companyHeader.agreement') }}</dt>
                            <dd class="font-semibold text-gray-800 truncate">
                                {{ summary.agreement.name }}
                                <span v-if="summary.agreement.ends_on" class="font-normal text-gray-500">
                                    · {{ $t(summary.agreement.auto_renews ? 'superadmin.companyHeader.agreementRenews' : 'superadmin.companyHeader.agreementEnds', { date: formatDate(summary.agreement.ends_on) }) }}
                                </span>
                            </dd>
                        </div>
                        <div v-else-if="summary.can_view_financials" class="flex items-center gap-1.5">
                            <dt class="text-gray-500">{{ $t('superadmin.companyHeader.agreement') }}</dt>
                            <dd class="text-gray-500">{{ $t('superadmin.companyHeader.noAgreement') }}</dd>
                        </div>
                        <div v-if="summary.contract_ends_at" class="flex items-center gap-1.5">
                            <dt class="text-gray-500">{{ $t('superadmin.companyHeader.contractEnds') }}</dt>
                            <dd class="font-semibold text-orange-700">{{ formatDate(summary.contract_ends_at) }}</dd>
                        </div>
                    </dl>
                </div>

                <div v-if="$slots.actions" class="flex flex-wrap gap-2 shrink-0">
                    <slot name="actions" />
                </div>
            </div>

            <nav class="mt-4 -mx-5 px-3 flex gap-1 overflow-x-auto border-t border-surface-200"
                :aria-label="$t('superadmin.companyHeader.tabsLabel')">
                <NuxtLink v-for="tab in tabs" :key="tab.key" :to="tab.href"
                    class="inline-flex items-center gap-2 min-h-[44px] px-3 -mb-px border-b-2 text-sm whitespace-nowrap transition-colors"
                    :class="tab.key === active
                        ? 'border-primary text-primary font-semibold'
                        : 'border-transparent text-gray-500 font-medium hover:text-gray-900'"
                    :aria-current="tab.key === active ? 'page' : undefined">
                    <Icon :name="tab.icon" class="w-4 h-4 shrink-0" aria-hidden="true" />
                    {{ $t(tab.labelKey) }}
                </NuxtLink>
            </nav>
        </div>
    </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { activeCompanyTab, billingLabel, companyStatusPill, companyTabs, TONE_CLASSES } from '@/composables/superadminCompany'
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

onMounted(() => ensure())
watch(uuid, () => ensure())
</script>
