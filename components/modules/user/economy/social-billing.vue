<template>
    <div>
        <div class="p-1 space-y-5">
            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <!-- The four steps, in the order they happen, so the screen says what
                 it is for before anything has been generated. -->
            <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-400">
                <li v-for="(step, index) in steps" :key="step" class="flex items-center gap-2">
                    <span class="flex items-center gap-1.5"
                        :class="index === currentStep ? 'text-primary font-medium' : ''">
                        <span class="flex h-5 w-5 items-center justify-center rounded-full border text-[11px]"
                            :class="index === currentStep ? 'border-primary text-primary' : 'border-slate-200'">
                            {{ index + 1 }}
                        </span>
                        {{ step }}
                    </span>
                    <Icon v-if="index < steps.length - 1" name="ph:caret-right" class="w-3 h-3 text-slate-300" />
                </li>
            </ol>

            <!-- Period -->
            <div class="bg-white border border-surface-200 rounded-xl p-5 shadow-sm">
                <div class="flex flex-wrap items-center gap-2 mb-4">
                    <Tooltip :text="$t('socialWelfare.billing.helpPeriod')" wrap position="bottom">
                        <Icon name="ph:info" class="w-4 h-4 text-slate-400 hover:text-primary transition" />
                    </Tooltip>
                    <button type="button" v-for="preset in presets" :key="preset.key" @click="applyPreset(preset.key)"
                        class="rounded-full border px-3 py-1 text-[13px] transition"
                        :class="state.preset === preset.key
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'">
                        {{ preset.label }}
                    </button>
                </div>
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
                    <FormButton v-if="state.groups.length > 0" buttonStyle="action" @click="exportToCsv">
                        <Icon name="ph:download-simple" class="w-4 h-4" />
                        {{ $t('socialWelfare.billing.exportCsv') }}
                    </FormButton>
                </div>
            </div>

            <!-- What happened last time convert was pressed, with the way on to
                 the invoices themselves. -->
            <div v-if="state.convertedCount > 0"
                class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
                <p class="flex items-center gap-2 text-sm text-green-900">
                    <Icon name="ph:check-circle" class="w-5 h-5" />
                    {{ $t('socialWelfare.billing.convertedBanner', { count: state.convertedCount }) }}
                </p>
                <FormButton buttonStyle="success" @click="navigateTo('/invoicing')" v-if="hasInvoiceApp">
                    <Icon name="ph:arrow-right" class="w-4 h-4" />
                    {{ $t('socialWelfare.billing.goToInvoices') }}
                </FormButton>
            </div>

            <LoadingSpinner :isActive="state.isLoading">
                <div v-if="!state.hasFetched"
                    class="bg-white border border-surface-200 rounded-xl p-12 text-center shadow-sm">
                    <Icon name="ph:invoice" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p class="text-slate-400 text-sm">{{ $t('socialWelfare.billing.selectPeriod') }}</p>
                </div>

                <div v-else-if="!state.groups.length"
                    class="bg-white border border-surface-200 rounded-xl p-12 text-center shadow-sm">
                    <Icon name="ph:invoice" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p class="text-slate-400 text-sm">{{ $t('socialWelfare.billing.noData') }}</p>
                </div>

                <div v-else class="space-y-5">
                    <!-- The period in four numbers, before the rows -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white border border-surface-200 rounded-xl p-4 shadow-sm">
                            <p class="text-xs text-slate-400 uppercase tracking-wide">
                                {{ $t('socialWelfare.billing.summaryInterventions') }}
                            </p>
                            <p class="text-2xl font-bold text-slate-900 mt-1">{{ selectedRowCount }}</p>
                        </div>
                        <div class="bg-white border border-surface-200 rounded-xl p-4 shadow-sm">
                            <p class="text-xs text-slate-400 uppercase tracking-wide">
                                {{ $t('socialWelfare.billing.summaryHours') }}
                            </p>
                            <p class="text-2xl font-bold text-secondary mt-1">{{ formatHours(selectedHours) }}</p>
                        </div>
                        <div class="bg-white border border-surface-200 rounded-xl p-4 shadow-sm">
                            <p class="text-xs text-slate-400 uppercase tracking-wide">
                                {{ $t('socialWelfare.billing.summaryAmount') }}
                            </p>
                            <p class="text-2xl font-bold text-slate-900 mt-1">{{ formatAmount(grandTotal) }}</p>
                        </div>
                        <div class="bg-white border border-surface-200 rounded-xl p-4 shadow-sm">
                            <p class="text-xs text-slate-400 uppercase tracking-wide">
                                {{ $t('socialWelfare.billing.summaryInvoiced') }}
                            </p>
                            <p class="text-2xl font-bold text-slate-400 mt-1">{{ formatHours(invoicedHours) }}</p>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <p class="text-[13px] text-slate-500">
                            {{ $t('socialWelfare.billing.selectedOfRows', { selected: selectedRowCount, total: billableRowCount }) }}
                        </p>
                        <Tooltip v-if="convertibleGroups.length > 1"
                            :text="$t('socialWelfare.billing.helpConvert')" wrap position="left">
                            <FormButton buttonStyle="primary" :disabled="state.isLoading"
                                @click="convert(convertibleGroups)">
                                <Icon name="ph:files" class="w-4 h-4" />
                                {{ $t('socialWelfare.billing.convertAllSelected') }}
                                ({{ $t('socialWelfare.billing.invoiceCount', { count: convertibleGroups.length }) }})
                            </FormButton>
                        </Tooltip>
                    </div>

                    <!-- One card per paying municipality, because that is what becomes one invoice -->
                    <div v-for="group in state.groups" :key="group.municipality_uuid ?? 'unassigned'"
                        class="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">

                        <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-surface-200 bg-slate-50">
                            <div>
                                <p class="text-sm font-semibold text-slate-900">
                                    {{ group.municipality_name || $t('socialWelfare.billing.noMunicipality') }}
                                </p>
                                <p class="text-[13px] text-slate-400">
                                    {{ group.rows.length }} {{ $t('socialWelfare.billing.citizens') }}
                                    <span v-if="selectedRowsOf(group).length">
                                        · {{ $t('socialWelfare.billing.selectedOfRows', {
                                            selected: selectedRowsOf(group).length,
                                            total: billableRowsOf(group).length
                                        }) }}
                                    </span>
                                </p>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class="text-sm font-semibold text-slate-900">
                                    {{ formatAmount(groupTotal(group)) }}
                                </span>
                                <Tooltip :text="$t('socialWelfare.billing.helpConvert')" wrap position="left">
                                    <FormButton buttonStyle="primary" :disabled="!groupIsConvertible(group) || state.isLoading"
                                        @click="convert([group])">
                                        <Icon name="ph:arrow-right" class="w-4 h-4" />
                                        {{ $t('socialWelfare.billing.convertSelected') }}
                                    </FormButton>
                                </Tooltip>
                            </div>
                        </div>

                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-white border-b border-surface-200">
                                    <tr>
                                        <th class="co-th w-10">
                                            <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                                :checked="allSelected(group)"
                                                :title="$t('socialWelfare.billing.selectAll')"
                                                @change="toggleGroup(group, ($event.target as HTMLInputElement).checked)" />
                                        </th>
                                        <th class="co-th w-8"></th>
                                        <th class="co-th">{{ $t('socialWelfare.billing.citizen') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.billing.stay') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.billing.section') }}</th>
                                        <th class="co-th">
                                            <span class="inline-flex items-center gap-1">
                                                {{ $t('socialWelfare.billing.usedHours') }}
                                                <Tooltip :text="$t('socialWelfare.billing.helpUsedHours')" wrap>
                                                    <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" />
                                                </Tooltip>
                                            </span>
                                        </th>
                                        <th class="co-th">
                                            <span class="inline-flex items-center gap-1">
                                                {{ $t('socialWelfare.billing.agreedHours') }}
                                                <Tooltip :text="$t('socialWelfare.billing.helpAgreedHours')" wrap>
                                                    <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" />
                                                </Tooltip>
                                            </span>
                                        </th>
                                        <th class="co-th">{{ $t('socialWelfare.billing.rate') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.billing.contractPrice') }}</th>
                                        <th class="co-th text-right">{{ $t('socialWelfare.billing.amount') }}</th>
                                        <th class="co-th w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template v-for="row in group.rows" :key="rowKey(row)">
                                    <tr class="border-b border-surface-200"
                                        :class="row.is_fully_invoiced ? 'opacity-60' : ''">
                                        <td class="co-td align-top">
                                            <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                                :disabled="!isBillable(row)" :checked="row.is_selected"
                                                @change="row.is_selected = ($event.target as HTMLInputElement).checked" />
                                        </td>
                                        <td class="co-td align-top">
                                            <button type="button" @click="toggleRow(row)"
                                                class="text-slate-500 hover:text-slate-900 transition"
                                                :aria-expanded="isExpanded(row)"
                                                :title="$t('socialWelfare.billing.showRegistrations')">
                                                <Icon :name="isExpanded(row) ? 'ph:caret-down' : 'ph:caret-right'"
                                                    class="w-4 h-4" />
                                            </button>
                                        </td>
                                        <td class="co-td">
                                            <p class="font-medium text-slate-900">{{ row.citizen_name }}</p>
                                            <p v-if="row.is_fully_invoiced" class="co-badge co-badge-green text-[11px] mt-1 inline-block">
                                                {{ $t('socialWelfare.billing.invoiced') }}
                                            </p>
                                            <p v-else-if="row.invoiced_hours > 0" class="text-[12px] text-slate-400 mt-1">
                                                {{ $t('socialWelfare.billing.alreadyInvoicedHours', { hours: formatHours(row.invoiced_hours) }) }}
                                            </p>
                                        </td>
                                        <td class="co-td">
                                            <p class="text-slate-900">
                                                {{ row.stay_journal_number || (row.stay_uuid ? $t('socialWelfare.billing.stayWithoutNumber') : $t('socialWelfare.billing.outsideStay')) }}
                                            </p>
                                            <p class="text-[12px] text-slate-400">{{ row.period_from }} - {{ row.period_to }}</p>
                                        </td>
                                        <td class="co-td text-slate-500">{{ row.section || '-' }}</td>
                                        <td class="co-td">
                                            <input type="number" min="0" step="0.25" class="co-cell-input w-24"
                                                :max="row.recorded_hours" :disabled="row.is_fully_invoiced"
                                                v-model="row.used_hours" @change="clampHours(row)" />
                                            <p v-if="writtenOff(row) > 0" class="text-[12px] text-orange-600 mt-1">
                                                {{ $t('socialWelfare.billing.writtenOff', { hours: formatHours(writtenOff(row)) }) }}
                                            </p>
                                        </td>
                                        <td class="co-td">
                                            <span v-if="row.agreed_hours === null || row.agreed_hours === undefined"
                                                class="text-slate-400 text-[13px]">
                                                {{ $t('socialWelfare.billing.noAgreedHours') }}
                                            </span>
                                            <template v-else>
                                                <p class="text-slate-900">
                                                    {{ formatHours(row.agreed_hours) }}
                                                    <span class="text-[11px] text-slate-400">
                                                        ({{ row.agreed_hours_source === 'contract'
                                                            ? $t('socialWelfare.billing.fromContract')
                                                            : $t('socialWelfare.billing.fromAllocation') }})
                                                    </span>
                                                </p>
                                                <p class="text-[12px] mt-0.5" :class="varianceClass(row)">
                                                    {{ varianceLabel(row) }}
                                                </p>
                                            </template>
                                        </td>
                                        <td class="co-td">
                                            <input type="number" min="0" step="0.01" class="co-cell-input w-28"
                                                :disabled="row.is_fully_invoiced" v-model="row.hourly_rate" />
                                        </td>
                                        <td class="co-td text-slate-500">
                                            {{ row.contract_price === null ? '-' : formatAmount(row.contract_price) }}
                                        </td>
                                        <td class="co-td text-right font-medium text-slate-900">
                                            {{ formatAmount(rowAmount(row)) }}
                                        </td>
                                        <td class="co-td text-right">
                                            <Tooltip v-if="isBillable(row)"
                                                :text="$t('socialWelfare.billing.convertRow')" position="left">
                                                <button type="button"
                                                    class="text-slate-400 hover:text-primary transition"
                                                    @click="convertRow(group, row)">
                                                    <Icon name="ph:receipt" class="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                        </td>
                                    </tr>

                                    <!-- The line as it will read on the invoice, and the
                                         registrations the total was built from. -->
                                    <tr v-if="isExpanded(row)" class="border-b border-surface-200 bg-slate-50">
                                        <td class="co-td" colspan="11">
                                            <div class="space-y-3">
                                                <div class="space-y-1 max-w-2xl">
                                                    <FormLabel :label="$t('socialWelfare.billing.lineDescription')" />
                                                    <input type="text" class="co-cell-input w-full"
                                                        :disabled="row.is_fully_invoiced" v-model="row.line_description" />
                                                </div>

                                                <div>
                                                    <p class="text-[12px] uppercase tracking-wide text-slate-400 mb-1">
                                                        {{ $t('socialWelfare.billing.registrations') }}
                                                    </p>
                                                    <p v-if="registrationsOf(row) === undefined" class="text-[13px] text-slate-400">
                                                        {{ $t('socialWelfare.billing.loadingRegistrations') }}
                                                    </p>
                                                    <p v-else-if="!registrationsOf(row).length" class="text-[13px] text-slate-400">
                                                        {{ $t('socialWelfare.billing.noRegistrations') }}
                                                    </p>
                                                    <table v-else class="w-full">
                                                        <thead>
                                                            <tr class="text-left text-[12px] uppercase text-slate-400">
                                                                <th class="py-1.5 pr-4 font-medium">{{ $t('socialWelfare.billing.date') }}</th>
                                                                <th class="py-1.5 pr-4 font-medium">{{ $t('socialWelfare.billing.time') }}</th>
                                                                <th class="py-1.5 pr-4 font-medium">{{ $t('socialWelfare.billing.hours') }}</th>
                                                                <th class="py-1.5 pr-4 font-medium">{{ $t('socialWelfare.billing.employee') }}</th>
                                                                <th class="py-1.5 pr-4 font-medium">{{ $t('socialWelfare.billing.note') }}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="reg in registrationsOf(row)" :key="reg.uuid"
                                                                class="text-[13px] text-slate-500"
                                                                :class="reg.is_invoiced ? 'opacity-60' : ''">
                                                                <td class="py-1.5 pr-4 whitespace-nowrap">{{ dateOf(reg) }}</td>
                                                                <td class="py-1.5 pr-4 whitespace-nowrap">{{ timeOf(reg) }}</td>
                                                                <td class="py-1.5 pr-4 whitespace-nowrap">{{ formatHours(reg.hours) }}</td>
                                                                <td class="py-1.5 pr-4">
                                                                    {{ reg.employee_name || '-' }}
                                                                    <span v-if="reg.is_from_duty_schedule"
                                                                        class="text-[11px] text-slate-400">({{ $t('socialWelfare.billing.fromDutySchedule') }})</span>
                                                                </td>
                                                                <td class="py-1.5 pr-4">
                                                                    {{ reg.note || '-' }}
                                                                    <span v-if="reg.is_invoiced"
                                                                        class="text-[11px] text-green-700">({{ $t('socialWelfare.billing.invoiced') }})</span>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    </template>

                                    <!-- Anything that is not delivered hours: a fee, a
                                         transport charge, a correction from last month. -->
                                    <tr v-for="(extra, index) in group.extras" :key="`extra-${index}`"
                                        class="border-b border-surface-200 bg-slate-50/60">
                                        <td class="co-td"></td>
                                        <td class="co-td"></td>
                                        <td class="co-td" colspan="3">
                                            <input type="text" class="co-cell-input w-full"
                                                :placeholder="$t('socialWelfare.billing.extraDescription')"
                                                v-model="extra.description" />
                                        </td>
                                        <td class="co-td">
                                            <input type="number" step="0.25" class="co-cell-input w-24"
                                                :placeholder="$t('socialWelfare.billing.extraQuantity')"
                                                v-model="extra.quantity" />
                                        </td>
                                        <td class="co-td"></td>
                                        <td class="co-td">
                                            <input type="number" step="0.01" class="co-cell-input w-28"
                                                :placeholder="$t('socialWelfare.billing.extraPrice')"
                                                v-model="extra.price" />
                                        </td>
                                        <td class="co-td"></td>
                                        <td class="co-td text-right font-medium text-slate-900">
                                            {{ formatAmount(extraAmount(extra)) }}
                                        </td>
                                        <td class="co-td text-right">
                                            <button type="button" class="text-slate-400 hover:text-red-600 transition"
                                                :title="$t('socialWelfare.billing.extraRemove')"
                                                @click="group.extras.splice(index, 1)">
                                                <Icon name="ph:trash" class="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="flex flex-wrap items-end justify-between gap-4 px-5 py-4 border-t border-surface-200">
                            <div class="space-y-1 flex-1 min-w-[16rem]">
                                <FormLabel :label="$t('socialWelfare.billing.invoiceNote')" />
                                <input type="text" class="co-cell-input w-full" v-model="group.note" />
                            </div>
                            <FormButton buttonStyle="action" @click="addExtra(group)">
                                <Icon name="ph:plus" class="w-4 h-4" />
                                {{ $t('socialWelfare.billing.addExtra') }}
                            </FormButton>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-3 px-5">
                        <span class="text-sm text-slate-500">{{ $t('socialWelfare.billing.totalForPeriod') }}</span>
                        <span class="text-base font-semibold text-slate-900">{{ formatAmount(grandTotal) }}</span>
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
import { useEconomyPeriod } from '@/composables/economyPeriod'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { formatAmount } = useAmountFormatter()
const { presetRange, matchPreset } = useEconomyPeriod()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any

// Guard: requires the "Management & Economy" page, same as the rest of this area
onMounted(() => {
    if (!userStore.getUser?.pages?.some((page: any) => page.name === 'Management & Economy')) {
        navigateTo('/overview')

        return
    }

    applyPreset('thisMonth')
    fetchExtraction()
})

const hasInvoiceApp = computed(() => Boolean(userStore.getUser?.has_invoice_app))

const state = reactive({
    error: {} as Error,
    hasFetched: false,
    isLoading: false,
    groups: [] as any[],
    convertedCount: 0,
    preset: 'thisMonth' as string,
    filter: {
        from_date: '',
        to_date: '',
    },
})

const steps = computed(() => [
    t('socialWelfare.billing.stepPeriod'),
    t('socialWelfare.billing.stepGenerate'),
    t('socialWelfare.billing.stepReview'),
    t('socialWelfare.billing.stepConvert'),
])

// The step the screen is actually on, so the strip reads as progress rather
// than decoration.
const currentStep = computed(() => {
    if (!state.filter.from_date || !state.filter.to_date) return 0
    if (!state.hasFetched) return 1
    if (!selectedRowCount.value && !state.groups.some((g: any) => extraLinesOf(g).length)) return 2

    return 3
})

const presets = computed(() => [
    { key: 'thisMonth', label: t('socialWelfare.billing.presetThisMonth') },
    { key: 'lastMonth', label: t('socialWelfare.billing.presetLastMonth') },
    { key: 'thisYear', label: t('socialWelfare.billing.presetThisYear') },
])

function applyPreset(key: string) {
    const range = presetRange(key)

    state.preset = key
    state.filter.from_date = range.from
    state.filter.to_date = range.to
}

// Dates typed by hand belong to whichever shortcut they happen to match, and to
// none of them otherwise, so the chips never claim a period that is not shown.
watch(() => [state.filter.from_date, state.filter.to_date], () => {
    state.preset = matchPreset(state.filter.from_date, state.filter.to_date)
})

// Registrations are fetched per row when it is opened, so a period with a
// hundred citizens does not drag every registration along with it. undefined
// means "still loading", an empty array means "loaded and there were none".
const expanded = ref<string[]>([])
const registrations = ref<Record<string, any[]>>({})

// A row is one stay, so a citizen can appear more than once and the uuid alone
// is not a key.
function rowKey(row: any): string {
    return `${row.citizen_uuid}:${row.stay_uuid ?? 'none'}`
}

function isExpanded(row: any): boolean {
    return expanded.value.includes(rowKey(row))
}

function registrationsOf(row: any): any[] | undefined {
    return registrations.value[rowKey(row)]
}

async function toggleRow(row: any) {
    const key = rowKey(row)

    if (isExpanded(row)) {
        expanded.value = expanded.value.filter(k => k !== key)

        return
    }

    expanded.value = [...expanded.value, key]

    // Cached from a previous open, and the extraction clears the cache when it
    // refetches, so there is nothing stale to show.
    if (registrations.value[key]) return

    try {
        const response = await socialWelfareService.getBillingRegistrations({
            citizen_uuid: row.citizen_uuid,
            stay_uuid: row.stay_uuid ?? undefined,
            from_date: state.filter.from_date,
            to_date: state.filter.to_date,
        })
        const data = response?.data ?? response ?? {}
        registrations.value = { ...registrations.value, [key]: data.rows ?? [] }
    } catch (error: any) {
        state.error = error
        expanded.value = expanded.value.filter(k => k !== key)
    }
}

function dateOf(reg: any): string {
    return (reg.date_time_start ?? '').slice(0, 10)
}

function timeOf(reg: any): string {
    const start = (reg.date_time_start ?? '').slice(11, 16)
    const end = (reg.date_time_end ?? '').slice(11, 16)

    return end ? `${start} - ${end}` : start
}

// Hours and rate are editable, so every amount is derived, never read back
// from the server response.
function rowAmount(row: any): number {
    const hours = Number(row.used_hours ?? 0)
    const rate = Number(row.hourly_rate ?? 0)

    return Math.round(hours * rate * 100) / 100
}

function extraAmount(extra: any): number {
    const quantity = Number(extra.quantity ?? 0)
    const price = Number(extra.price ?? 0)

    return Math.round(quantity * price * 100) / 100
}

// Hours billed below what was recorded settle the period all the same, so the
// difference is written off rather than carried into next month.
function writtenOff(row: any): number {
    const diff = Number(row.recorded_hours ?? 0) - Number(row.used_hours ?? 0)

    return Math.round(Math.max(0, diff) * 100) / 100
}

function clampHours(row: any) {
    const recorded = Number(row.recorded_hours ?? 0)

    if (Number(row.used_hours ?? 0) > recorded) {
        row.used_hours = recorded
    }
}

function isBillable(row: any): boolean {
    return !row.is_fully_invoiced && rowAmount(row) > 0
}

function billableRowsOf(group: any): any[] {
    return group.rows.filter(isBillable)
}

function selectedRowsOf(group: any): any[] {
    return group.rows.filter((row: any) => row.is_selected && isBillable(row))
}

// An extra only counts once it says something and costs something.
function extraLinesOf(group: any): any[] {
    return (group.extras ?? []).filter((extra: any) =>
        String(extra.description ?? '').trim().length > 0 && extraAmount(extra) !== 0
    )
}

function allSelected(group: any): boolean {
    const billable = billableRowsOf(group)

    return billable.length > 0 && billable.every((row: any) => row.is_selected)
}

function toggleGroup(group: any, checked: boolean) {
    billableRowsOf(group).forEach((row: any) => { row.is_selected = checked })
}

function addExtra(group: any) {
    group.extras.push({ description: '', quantity: '1', price: '' })
}

// The card total is what the invoice would say: the selected placements plus
// the extras typed underneath them.
function groupTotal(group: any): number {
    const rows = selectedRowsOf(group).reduce((sum: number, row: any) => sum + rowAmount(row), 0)
    const extras = extraLinesOf(group).reduce((sum: number, extra: any) => sum + extraAmount(extra), 0)

    return Math.round((rows + extras) * 100) / 100
}

const grandTotal = computed(() =>
    Math.round(state.groups.reduce((sum: number, g: any) => sum + groupTotal(g), 0) * 100) / 100
)

const billableRowCount = computed(() =>
    state.groups.reduce((sum: number, g: any) => sum + billableRowsOf(g).length, 0)
)

const selectedRowCount = computed(() =>
    state.groups.reduce((sum: number, g: any) => sum + selectedRowsOf(g).length, 0)
)

const selectedHours = computed(() =>
    Math.round(state.groups.reduce((sum: number, g: any) =>
        sum + selectedRowsOf(g).reduce((s: number, row: any) => s + Number(row.used_hours ?? 0), 0), 0) * 100) / 100
)

const invoicedHours = computed(() =>
    Math.round(state.groups.reduce((sum: number, g: any) =>
        sum + g.rows.reduce((s: number, row: any) => s + Number(row.invoiced_hours ?? 0), 0), 0) * 100) / 100
)

function groupIsConvertible(group: any): boolean {
    return selectedRowsOf(group).length > 0 || extraLinesOf(group).length > 0
}

const convertibleGroups = computed(() => state.groups.filter(groupIsConvertible))

function formatHours(hours: number | null): string {
    if (hours === null || hours === undefined) return '-'

    return Number(hours).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// The variance is the whole point of the column: is the delivery inside what
// was agreed, or over it?
function variance(row: any): number {
    return Math.round((Number(row.used_hours ?? 0) - Number(row.agreed_hours ?? 0)) * 100) / 100
}

function varianceLabel(row: any): string {
    const diff = variance(row)

    if (diff === 0) return t('socialWelfare.billing.matchesAgreed')

    const label = diff > 0
        ? t('socialWelfare.billing.overAgreed')
        : t('socialWelfare.billing.underAgreed')

    return `${formatHours(Math.abs(diff))} ${label}`
}

function varianceClass(row: any): string {
    const diff = variance(row)

    if (diff > 0) return 'text-red-700'

    return diff === 0 ? 'text-green-700' : 'text-slate-400'
}

async function fetchExtraction() {
    if (!state.filter.from_date || !state.filter.to_date) {
        errorAlert(`${t('alert.error')}!`, t('socialWelfare.billing.selectPeriod'))

        return
    }

    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await socialWelfareService.getBillingExtraction(state.filter)
        const data = response?.data ?? response ?? {}
        state.groups = (data.groups ?? []).map((group: any) => ({
            ...group,
            extras: [],
            note: `${t('socialWelfare.billing.noteFor')} ${state.filter.from_date} - ${state.filter.to_date}`,
            rows: (group.rows ?? []).map((row: any) => ({
                ...row,
                // Everything billable starts selected: the common case is the
                // whole period, and unticking is quicker than ticking twenty.
                is_selected: !row.is_fully_invoiced && Number(row.used_hours) > 0,
                // What the registrations add up to. Hours can be edited down to
                // the contract, never up past what was delivered.
                recorded_hours: Number(row.used_hours ?? 0),
                line_description: defaultLineDescription(row),
            })),
        }))
        state.hasFetched = true
        state.convertedCount = 0
        expanded.value = []
        registrations.value = {}
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function defaultLineDescription(row: any): string {
    return [row.citizen_name, row.stay_journal_number, `${t('socialWelfare.billing.hoursFor')} ${row.period_from} - ${row.period_to}`]
        .filter(Boolean).join(' - ')
}

function groupPayload(group: any, rows: any[]) {
    return {
        bill_to_name: group.municipality_name || t('socialWelfare.billing.noMunicipality'),
        note: group.note,
        lines: [
            ...rows.map((row: any) => ({
                citizen_uuid: row.citizen_uuid,
                description: String(row.line_description ?? '').trim() || defaultLineDescription(row),
                quantity: Number(row.used_hours),
                price: Number(row.hourly_rate),
                // The row's own window, not the filter's: a stay can be shorter
                // than the period asked for, and stamping the whole period would
                // take the other placement's hours with it.
                period_from: row.period_from,
                period_to: row.period_to,
            })),
            ...extraLinesOf(group).map((extra: any) => ({
                description: String(extra.description).trim(),
                quantity: Number(extra.quantity),
                price: Number(extra.price),
            })),
        ],
    }
}

async function convert(groups: any[], rowsByGroup?: Map<any, any[]>) {
    const payload = groups
        .map((group: any) => groupPayload(group, rowsByGroup?.get(group) ?? selectedRowsOf(group)))
        .filter((group: any) => group.lines.length > 0)

    if (!payload.length) {
        errorAlert(`${t('alert.error')}!`, t('socialWelfare.billing.nothingSelected'))

        return
    }

    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await socialWelfareService.convertToInvoices({
            from_date: state.filter.from_date,
            to_date: state.filter.to_date,
            groups: payload,
        })
        const count = response?.data?.invoice_count ?? response?.invoice_count ?? payload.length
        state.convertedCount = count
        successAlert(`${t('alert.success')}!`, t('socialWelfare.billing.alert.converted', { count }))
        // Refetch so the hours just billed show as invoiced instead of billable.
        await fetchExtraction()
        state.convertedCount = count
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

// One placement on its own invoice, without having to untick the rest first.
function convertRow(group: any, row: any) {
    return convert([group], new Map([[group, [row]]]))
}

function exportToCsv() {
    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`

    const header = [
        t('socialWelfare.billing.municipality'),
        t('socialWelfare.billing.citizen'),
        t('socialWelfare.billing.stay'),
        t('socialWelfare.billing.period'),
        t('socialWelfare.billing.section'),
        t('socialWelfare.billing.usedHours'),
        t('socialWelfare.billing.agreedHours'),
        t('socialWelfare.billing.rate'),
        t('socialWelfare.billing.contractPrice'),
        t('socialWelfare.billing.amount'),
        t('socialWelfare.billing.invoiced'),
    ].map(escape).join(',')

    const lines = state.groups.flatMap((group: any) => [
        ...group.rows.map((row: any) => [
            escape(group.municipality_name ?? ''),
            escape(row.citizen_name),
            escape(row.stay_journal_number ?? ''),
            escape(`${row.period_from} - ${row.period_to}`),
            escape(row.section ?? ''),
            escape(formatHours(row.used_hours)),
            escape(formatHours(row.agreed_hours)),
            escape(formatAmount(row.hourly_rate)),
            escape(row.contract_price === null ? '' : formatAmount(row.contract_price)),
            escape(formatAmount(rowAmount(row))),
            escape(row.is_fully_invoiced ? t('socialWelfare.billing.invoiced') : t('socialWelfare.billing.notInvoiced')),
        ].join(',')),
        ...extraLinesOf(group).map((extra: any) => [
            escape(group.municipality_name ?? ''),
            escape(t('socialWelfare.billing.extras')),
            escape(extra.description),
            '""', '""',
            escape(formatHours(Number(extra.quantity))),
            '""',
            escape(formatAmount(extra.price)),
            '""',
            escape(formatAmount(extraAmount(extra))),
            escape(t('socialWelfare.billing.notInvoiced')),
        ].join(',')),
    ])

    const csv = [header, ...lines].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const period = state.filter.from_date && state.filter.to_date
        ? `${state.filter.from_date}_${state.filter.to_date}`
        : 'export'
    saveAs(blob, `faktureringsudtraek-${period}.csv`)
}
</script>
