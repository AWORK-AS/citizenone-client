<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.billing.extraction') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('employment.billing.extraction') }}</template>

            <div class="p-1">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Date range filter -->
                <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm mb-5">
                    <div class="flex flex-wrap items-end gap-4">
                        <div class="space-y-1">
                            <FormLabel :label="$t('employment.billing.fromDate')" />
                            <FormDateField id="from_date" name="from_date"
                                :placeholder="$t('employment.billing.fromDate')" v-model="state.filter.from_date" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel :label="$t('employment.billing.toDate')" />
                            <FormDateField id="to_date" name="to_date" :placeholder="$t('employment.billing.toDate')"
                                v-model="state.filter.to_date" />
                        </div>
                        <FormButton buttonStyle="primary" @click="fetchBillingData" :disabled="state.isLoading">
                            <Icon name="ph:funnel" class="w-4 h-4" />
                            {{ $t('employment.billing.generate') }}
                        </FormButton>
                        <FormButton v-if="selectedUuids.length > 0" buttonStyle="success"
                            @click="markSelectedAsInvoiced">
                            <Icon name="ph:check-circle" class="w-4 h-4" />
                            {{ $t('employment.billing.markSelected') }} ({{ selectedUuids.length }})
                        </FormButton>
                        <FormButton v-if="state.rows.length > 0" buttonStyle="action" @click="exportToCsv">
                            <Icon name="ph:download-simple" class="w-4 h-4" />
                            {{ $t('employment.billing.exportCsv') }}
                        </FormButton>
                    </div>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <!-- Empty state -->
                    <div v-if="!state.hasFetched"
                        class="bg-white border border-[#EAECF0] rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:invoice" class="w-12 h-12 text-[#8891A4] opacity-40 mx-auto mb-3" />
                        <p class="text-[#8891A4] text-sm">{{ $t('employment.billing.selectPeriod') }}</p>
                    </div>

                    <div v-else-if="!state.rows.length"
                        class="bg-white border border-[#EAECF0] rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:invoice" class="w-12 h-12 text-[#8891A4] opacity-40 mx-auto mb-3" />
                        <p class="text-[#8891A4] text-sm">{{ $t('employment.billing.noData') }}</p>
                    </div>

                    <!-- Results table -->
                    <div v-else class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                        <!-- Summary bar -->
                        <div class="flex items-center justify-between px-5 py-3 border-b border-[#EAECF0] bg-[#F9FAFB]">
                            <div class="flex items-center gap-4 text-sm text-[#5C6478]">
                                <span class="flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-[#2E9E33]"></span>
                                    {{ invoicedCount }} {{ $t('employment.billing.invoiced') }}
                                </span>
                                <span class="flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-[#D4900A]"></span>
                                    {{ notInvoicedCount }} {{ $t('employment.billing.notInvoiced') }}
                                </span>
                            </div>
                            <label class="flex items-center gap-2 text-sm text-[#5C6478] cursor-pointer">
                                <input type="checkbox" :checked="allSelected" @change="toggleSelectAll"
                                    class="rounded" />
                                {{ $t('selectAll') }}
                            </label>
                        </div>

                        <table class="w-full">
                            <thead>
                                <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                    <th class="co-th w-8"></th>
                                    <th class="co-th">{{ $t('employment.billing.citizen') }}</th>
                                    <th class="co-th">{{ $t('employment.billing.cpr') }}</th>
                                    <th class="co-th">{{ $t('employment.billing.agreement') }}</th>
                                    <th class="co-th">{{ $t('employment.billing.period') }}</th>
                                    <th class="co-th">{{ $t('employment.billingRules.table.rate') }}</th>
                                    <th class="co-th">{{ $t('employment.billing.weeks') }}</th>
                                    <th class="co-th">{{ $t('employment.billing.bonus') }}</th>
                                    <th class="co-th">{{ $t('employment.billing.total') }}</th>
                                    <th class="co-th">{{ $t('employment.billing.customerNumber') }}</th>
                                    <th class="co-th">{{ $t('employment.billing.productNumber') }}</th>
                                    <th class="co-th">{{ $t('employment.billing.invoiced') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in state.rows" :key="row.uuid"
                                    class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors"
                                    :class="row.is_invoiced ? 'opacity-60' : ''">
                                    <td class="co-td">
                                        <input v-if="!row.is_invoiced" type="checkbox" :value="row.uuid"
                                            v-model="selectedUuids" class="rounded" />
                                    </td>
                                    <td class="co-td text-[13px] font-medium text-[#1F2533]">
                                        {{ row.citizen_name }}
                                    </td>
                                    <td class="co-td text-[13px] text-[#5C6478] font-mono">
                                        {{ row.cpr ?? '—' }}
                                    </td>
                                    <td class="co-td text-[13px] text-[#5C6478]">
                                        {{ row.agreement_name ?? '—' }}
                                    </td>
                                    <td class="co-td text-[13px] text-[#5C6478]">
                                        {{ formatDateToReadable(row.period_from) }} – {{ formatDateToReadable(row.period_to) }}
                                    </td>
                                    <td class="co-td text-[13px] text-[#1F2533]">
                                        {{ row.pricing_type === 'hourly'
                                            ? formatAmount(row.price_per_hour)
                                            : row.pricing_type === 'bonus'
                                                ? '—'
                                                : formatAmount(row.price_per_week) }}
                                    </td>
                                    <td class="co-td text-[13px] text-[#1F2533]">
                                        {{ row.pricing_type === 'hourly'
                                            ? (row.billable_hours ?? 0)
                                            : row.pricing_type === 'bonus'
                                                ? '—'
                                                : (row.billable_weeks ?? 0) }}
                                    </td>
                                    <td class="co-td text-[13px] text-[#1F2533]">
                                        {{ row.bonus_amount ? formatAmount(row.bonus_amount) : '—' }}
                                    </td>
                                    <td class="co-td text-[13px] font-semibold text-[#1F2533]">
                                        {{ formatAmount(row.total) }}
                                    </td>
                                    <td class="co-td text-[13px] text-[#5C6478] font-mono">
                                        {{ row.customer_number ?? '—' }}
                                    </td>
                                    <td class="co-td text-[13px] text-[#5C6478] font-mono">
                                        {{ row.product_number ?? '—' }}
                                    </td>
                                    <td class="co-td">
                                        <span v-if="row.is_invoiced" class="co-badge co-badge-green text-[11px]">
                                            <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                            {{ $t('employment.billing.invoiced') }}
                                        </span>
                                        <span v-else class="co-badge co-badge-gray text-[11px]">
                                            {{ $t('employment.billing.notInvoiced') }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { saveAs } from 'file-saver'
import { employmentService } from '@/components/api/user/EmploymentService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const router = useRouter()

// Guard: employment_services only
onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/overview')
    }
})

const state = reactive({
    error: {} as Error,
    hasFetched: false,
    isLoading: false,
    rows: [] as any[],
    filter: {
        from_date: '',
        to_date: '',
    },
})

const selectedUuids = ref<string[]>([])

const invoicedCount = computed(() => state.rows.filter(r => r.is_invoiced).length)
const notInvoicedCount = computed(() => state.rows.filter(r => !r.is_invoiced).length)
const allSelected = computed(() =>
    notInvoicedCount.value > 0 && selectedUuids.value.length === notInvoicedCount.value
)

function toggleSelectAll() {
    if (allSelected.value) {
        selectedUuids.value = []
    } else {
        selectedUuids.value = state.rows.filter(r => !r.is_invoiced).map(r => r.uuid)
    }
}

async function fetchBillingData() {
    state.error = {} as Error
    state.isLoading = true
    selectedUuids.value = []
    try {
        const response = await employmentService.getBillingExtraction(state.filter)
        state.rows = response?.data ?? response ?? []
        state.hasFetched = true
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function exportToCsv() {
    const fmtDate = (d: string) => {
        const [y, m, day] = d.split('-')
        return `${day}/${m}/${y}`
    }
    const escape = (val: string) => `"${String(val ?? '').replace(/"/g, '""')}"`

    const header = [
        t('employment.billing.citizen'),
        t('employment.billing.cpr'),
        t('employment.billing.agreement'),
        t('employment.billing.period'),
        t('employment.billingRules.table.rate'),
        t('employment.billing.weeks'),
        t('employment.billing.bonus'),
        t('employment.billing.total'),
        t('employment.billing.customerNumber'),
        t('employment.billing.productNumber'),
        t('employment.billing.invoiced'),
    ].map(escape).join(',')

    const lines = state.rows.map(r => {
        const rate = r.pricing_type === 'hourly'
            ? (r.price_per_hour ?? '')
            : r.pricing_type === 'bonus'
                ? ''
                : (r.price_per_week ?? '')
        const qty = r.pricing_type === 'hourly'
            ? (r.billable_hours ?? '')
            : r.pricing_type === 'bonus'
                ? ''
                : (r.billable_weeks ?? '')
        return [
            escape(r.citizen_name ?? ''),
            escape(r.cpr ?? ''),
            escape(r.agreement_name ?? ''),
            escape(`${fmtDate(r.period_from)} – ${fmtDate(r.period_to)}`),
            rate !== '' ? escape(formatAmount(rate)) : '',
            qty,
            r.bonus_amount != null ? escape(formatAmount(r.bonus_amount)) : '',
            r.total != null ? escape(formatAmount(r.total)) : '',
            escape(r.customer_number ?? ''),
            escape(r.product_number ?? ''),
            r.is_invoiced ? t('employment.billing.invoiced') : t('employment.billing.notInvoiced'),
        ].join(',')
    })

    const csv = [header, ...lines].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const period = state.filter.from_date && state.filter.to_date
        ? `${state.filter.from_date}_${state.filter.to_date}`
        : 'export'
    saveAs(blob, `billing-${period}.csv`)
}

async function markSelectedAsInvoiced() {
    if (!selectedUuids.value.length) return
    state.error = {} as Error
    state.isLoading = true
    try {
        await employmentService.markWeeksAsInvoiced({ uuids: selectedUuids.value })
        successAlert(`${t('alert.success')}!`, `${t('employment.billing.alert.markedAsInvoiced')}.`)
        selectedUuids.value = []
        await fetchBillingData()
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
