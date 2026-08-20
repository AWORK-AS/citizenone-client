<template>
    <div>
        <div class="p-1">
            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <!-- Period -->
            <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm mb-5">
                <div class="flex flex-wrap items-end gap-4">
                    <div class="space-y-1">
                        <FormLabel :label="$t('socialWelfare.billing.fromDate')" />
                        <FormDateField id="from_date" name="from_date"
                            :placeholder="$t('socialWelfare.billing.fromDate')" v-model="state.filter.from_date" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel :label="$t('socialWelfare.billing.toDate')" />
                        <FormDateField id="to_date" name="to_date" :placeholder="$t('socialWelfare.billing.toDate')"
                            v-model="state.filter.to_date" />
                    </div>
                    <FormButton buttonStyle="primary" @click="fetchExtraction" :disabled="state.isLoading">
                        <Icon name="ph:funnel" class="w-4 h-4" />
                        {{ $t('socialWelfare.billing.generate') }}
                    </FormButton>
                    <FormButton v-if="billableGroupCount > 1" buttonStyle="success" @click="convertAll">
                        <Icon name="ph:files" class="w-4 h-4" />
                        {{ $t('socialWelfare.billing.convertAll') }} ({{ billableGroupCount }})
                    </FormButton>
                    <FormButton v-if="state.groups.length > 0" buttonStyle="action" @click="exportToCsv">
                        <Icon name="ph:download-simple" class="w-4 h-4" />
                        {{ $t('socialWelfare.billing.exportCsv') }}
                    </FormButton>
                </div>
            </div>

            <LoadingSpinner :isActive="state.isLoading">
                <div v-if="!state.hasFetched"
                    class="bg-white border border-[#EAECF0] rounded-xl p-12 text-center shadow-sm">
                    <Icon name="ph:invoice" class="w-12 h-12 text-[#8891A4] opacity-40 mx-auto mb-3" />
                    <p class="text-[#8891A4] text-sm">{{ $t('socialWelfare.billing.selectPeriod') }}</p>
                </div>

                <div v-else-if="!state.groups.length"
                    class="bg-white border border-[#EAECF0] rounded-xl p-12 text-center shadow-sm">
                    <Icon name="ph:invoice" class="w-12 h-12 text-[#8891A4] opacity-40 mx-auto mb-3" />
                    <p class="text-[#8891A4] text-sm">{{ $t('socialWelfare.billing.noData') }}</p>
                </div>

                <!-- One card per paying municipality, because that is what becomes one invoice -->
                <div v-else class="space-y-5">
                    <div v-for="group in state.groups" :key="group.municipality_uuid ?? 'unassigned'"
                        class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">

                        <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[#EAECF0] bg-[#F9FAFB]">
                            <div>
                                <p class="text-sm font-semibold text-[#1D2433]">
                                    {{ group.municipality_name || $t('socialWelfare.billing.noMunicipality') }}
                                </p>
                                <p class="text-[13px] text-[#8891A4]">
                                    {{ group.rows.length }} {{ $t('socialWelfare.billing.citizens') }}
                                </p>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class="text-sm font-semibold text-[#1D2433]">
                                    {{ formatAmount(groupTotal(group)) }}
                                </span>
                                <FormButton buttonStyle="primary" :disabled="!groupIsBillable(group)"
                                    @click="convertGroup(group)">
                                    <Icon name="ph:arrow-right" class="w-4 h-4" />
                                    {{ $t('socialWelfare.billing.convert') }}
                                </FormButton>
                            </div>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-white border-b border-[#EAECF0]">
                                    <tr>
                                        <th class="co-th">{{ $t('socialWelfare.billing.citizen') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.billing.section') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.billing.usedHours') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.billing.allocatedHours') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.billing.rate') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.billing.contractPrice') }}</th>
                                        <th class="co-th text-right">{{ $t('socialWelfare.billing.amount') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in group.rows" :key="row.citizen_uuid"
                                        class="border-b border-[#EAECF0] last:border-0"
                                        :class="row.is_fully_invoiced ? 'opacity-60' : ''">
                                        <td class="co-td">
                                            <p class="font-medium text-[#1D2433]">{{ row.citizen_name }}</p>
                                            <p v-if="row.is_fully_invoiced" class="co-badge co-badge-green text-[11px] mt-1 inline-block">
                                                {{ $t('socialWelfare.billing.invoiced') }}
                                            </p>
                                            <p v-else-if="row.invoiced_hours > 0" class="text-[12px] text-[#8891A4] mt-1">
                                                {{ $t('socialWelfare.billing.alreadyInvoicedHours', { hours: formatHours(row.invoiced_hours) }) }}
                                            </p>
                                        </td>
                                        <td class="co-td text-[#5C6478]">{{ row.section || '-' }}</td>
                                        <td class="co-td">
                                            <FormNumberField :id="`hours-${row.citizen_uuid}`" name="used_hours"
                                                :min="0" :step="0.25" class="w-24"
                                                :disabled="row.is_fully_invoiced" v-model="row.used_hours" />
                                        </td>
                                        <td class="co-td">
                                            <span v-if="row.allocated_hours === null" class="text-[#8891A4]">-</span>
                                            <span v-else :class="hoursClass(row)">
                                                {{ formatHours(row.allocated_hours) }}
                                                <span class="text-[12px]">({{ variance(row) }})</span>
                                            </span>
                                        </td>
                                        <td class="co-td">
                                            <FormNumberField :id="`rate-${row.citizen_uuid}`" name="hourly_rate"
                                                :min="0" :step="0.01" class="w-28"
                                                :disabled="row.is_fully_invoiced" v-model="row.hourly_rate" />
                                        </td>
                                        <td class="co-td text-[#5C6478]">
                                            {{ row.contract_price === null ? '-' : formatAmount(row.contract_price) }}
                                        </td>
                                        <td class="co-td text-right font-medium text-[#1D2433]">
                                            {{ formatAmount(rowAmount(row)) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-3 px-5">
                        <span class="text-sm text-[#5C6478]">{{ $t('socialWelfare.billing.totalForPeriod') }}</span>
                        <span class="text-base font-semibold text-[#1D2433]">{{ formatAmount(grandTotal) }}</span>
                    </div>
                </div>
            </LoadingSpinner>
        </div>
    </div>
</template>

<script setup lang="ts">
import { saveAs } from 'file-saver'
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { formatAmount } = useAmountFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any

// Guard: social_welfare only, same as the rest of this area
onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'social_welfare') {
        navigateTo('/overview')
    }
})

const state = reactive({
    error: {} as Error,
    hasFetched: false,
    isLoading: false,
    groups: [] as any[],
    filter: {
        from_date: '',
        to_date: '',
    },
})

// Hours and rate are editable, so every amount is derived, never read back
// from the server response.
function rowAmount(row: any): number {
    const hours = Number(row.used_hours ?? 0)
    const rate = Number(row.hourly_rate ?? 0)

    return Math.round(hours * rate * 100) / 100
}

function groupTotal(group: any): number {
    return Math.round(group.rows.reduce((sum: number, row: any) => sum + rowAmount(row), 0) * 100) / 100
}

const grandTotal = computed(() =>
    Math.round(state.groups.reduce((sum: number, g: any) => sum + groupTotal(g), 0) * 100) / 100
)

function billableRows(group: any): any[] {
    return group.rows.filter((row: any) => !row.is_fully_invoiced && rowAmount(row) > 0)
}

function groupIsBillable(group: any): boolean {
    return billableRows(group).length > 0
}

const billableGroupCount = computed(() => state.groups.filter(groupIsBillable).length)

function formatHours(hours: number | null): string {
    if (hours === null || hours === undefined) return '-'

    return Number(hours).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// The variance is the whole point of the column: is the delivery inside what
// was allocated, or over it?
function variance(row: any): string {
    const diff = Number(row.used_hours ?? 0) - Number(row.allocated_hours ?? 0)
    const sign = diff > 0 ? '+' : ''

    return `${sign}${formatHours(Math.round(diff * 100) / 100)}`
}

function hoursClass(row: any): string {
    const diff = Number(row.used_hours ?? 0) - Number(row.allocated_hours ?? 0)

    return diff > 0 ? 'text-[#B42318]' : 'text-[#5C6478]'
}

async function fetchExtraction() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await socialWelfareService.getBillingExtraction(state.filter)
        const data = response?.data ?? response ?? {}
        state.groups = data.groups ?? []
        state.hasFetched = true
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function groupPayload(group: any) {
    return {
        bill_to_name: group.municipality_name || t('socialWelfare.billing.noMunicipality'),
        note: `${t('socialWelfare.billing.noteFor')} ${state.filter.from_date} - ${state.filter.to_date}`,
        lines: billableRows(group).map((row: any) => ({
            citizen_uuid: row.citizen_uuid,
            description: `${row.citizen_name} - ${t('socialWelfare.billing.hoursFor')} ${state.filter.from_date} - ${state.filter.to_date}`,
            quantity: Number(row.used_hours),
            price: Number(row.hourly_rate),
        })),
    }
}

async function convert(groups: any[]) {
    const payload = groups.filter(groupIsBillable).map(groupPayload)

    if (!payload.length) return

    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await socialWelfareService.convertToInvoices({
            from_date: state.filter.from_date,
            to_date: state.filter.to_date,
            groups: payload,
        })
        const count = response?.data?.invoice_count ?? response?.invoice_count ?? payload.length
        successAlert(`${t('alert.success')}!`, t('socialWelfare.billing.alert.converted', { count }))
        // Refetch so the hours just billed show as invoiced instead of billable.
        await fetchExtraction()
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function convertGroup(group: any) {
    return convert([group])
}

function convertAll() {
    return convert(state.groups)
}

function exportToCsv() {
    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`

    const header = [
        t('socialWelfare.billing.municipality'),
        t('socialWelfare.billing.citizen'),
        t('socialWelfare.billing.section'),
        t('socialWelfare.billing.usedHours'),
        t('socialWelfare.billing.allocatedHours'),
        t('socialWelfare.billing.rate'),
        t('socialWelfare.billing.contractPrice'),
        t('socialWelfare.billing.amount'),
        t('socialWelfare.billing.invoiced'),
    ].map(escape).join(',')

    const lines = state.groups.flatMap((group: any) => group.rows.map((row: any) => [
        escape(group.municipality_name ?? ''),
        escape(row.citizen_name),
        escape(row.section ?? ''),
        escape(formatHours(row.used_hours)),
        escape(formatHours(row.allocated_hours)),
        escape(formatAmount(row.hourly_rate)),
        escape(row.contract_price === null ? '' : formatAmount(row.contract_price)),
        escape(formatAmount(rowAmount(row))),
        escape(row.is_fully_invoiced ? t('socialWelfare.billing.invoiced') : t('socialWelfare.billing.notInvoiced')),
    ].join(',')))

    const csv = [header, ...lines].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const period = state.filter.from_date && state.filter.to_date
        ? `${state.filter.from_date}_${state.filter.to_date}`
        : 'export'
    saveAs(blob, `faktureringsudtraek-${period}.csv`)
}
</script>
