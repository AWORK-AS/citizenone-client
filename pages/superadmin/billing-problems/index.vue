<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('paymentDunning.problems.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('paymentDunning.problems.title') }}</template>

            <div class="p-1">
                <div class="flex items-center justify-between mb-5 gap-3">
                    <div>
                        <h1 class="text-[22px] font-semibold text-ink">{{ $t('paymentDunning.problems.title') }}</h1>
                        <p class="text-sm text-ink-body mt-0.5 max-w-2xl">{{ $t('paymentDunning.problems.intro') }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <select v-if="state.tab === 'active'" v-model="state.status"
                            class="text-sm border border-line rounded-lg px-3 py-2 bg-white text-ink-body outline-none focus:border-accent transition-colors"
                            :aria-label="$t('paymentDunning.problems.col.status')">
                            <option value="">{{ $t('paymentDunning.problems.filterAll') }}</option>
                            <option v-for="s in statuses" :key="s" :value="s">{{ $t(`paymentDunning.problems.status.${s}`) }}</option>
                        </select>
                        <Tooltip :text="$t('paymentDunning.problems.refresh')" position="bottom">
                            <FormButton buttonStyle="action" :aria-label="$t('paymentDunning.problems.refresh')" @click="fetchRows">
                                <Icon name="ph:arrows-clockwise" class="h-4 w-4" aria-hidden="true" />
                            </FormButton>
                        </Tooltip>
                    </div>
                </div>

                <div class="flex gap-1 mb-4 border-b border-line" role="tablist">
                    <button v-for="tab in DUNNING_TABS" :key="tab" type="button" role="tab"
                        :aria-selected="state.tab === tab"
                        class="px-3.5 py-2 text-[13px] border-b-2 -mb-px transition-colors flex items-center gap-1.5"
                        :class="state.tab === tab ? 'text-tertiary font-semibold border-tertiary' : 'text-ink-body border-transparent hover:text-ink'"
                        @click="selectTab(tab)">
                        {{ $t(`paymentDunning.problems.tab.${tab}`) }}
                        <span class="co-badge" :class="state.tab === tab ? 'co-badge-blue' : 'co-badge-gray'">{{ state.counts[tab] }}</span>
                    </button>
                </div>

                <p v-if="!canManage" class="text-[13px] text-ink-body mb-3">
                    {{ $t('paymentDunning.problems.readOnly') }}
                </p>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <SuperadminTable :columnHeaders="columns" :data="{ data: visibleRows }" :isLoading="state.isLoading"
                    :emptyMessage="state.tab !== 'active' ? $t('paymentDunning.problems.emptyTab') : state.status ? $t('paymentDunning.problems.emptyFiltered') : $t('paymentDunning.problems.empty')"
                    emptyIcon="ph:check-circle" rowKey="company_uuid">
                    <template #body>
                        <tr v-for="row in visibleRows" :key="row.company_uuid"
                            class="border-b border-surface-canvas hover:bg-surface-subtle transition-colors">
                            <td class="co-td">
                                <Tooltip :text="$t('paymentDunning.problems.openCompany')" position="top">
                                    <NuxtLink :to="`/superadmin/companies/${row.company_uuid}/overview`"
                                        class="text-[13px] font-medium text-tertiary hover:underline truncate max-w-[200px] block">
                                        {{ row.company_name || '—' }}
                                    </NuxtLink>
                                </Tooltip>
                                <Tooltip v-if="row.needs_nexi_check" :text="$t('paymentDunning.problems.needsNexiCheckHelp')" position="top" wrap>
                                    <span class="co-badge co-badge-red mt-1">
                                        <Icon name="ph:warning" class="w-3 h-3" aria-hidden="true" />
                                        {{ $t('paymentDunning.problems.needsNexiCheck') }}
                                    </span>
                                </Tooltip>
                                <ul v-if="row.invoices.length" class="mt-1 space-y-0.5">
                                    <li v-for="invoice in row.invoices" :key="invoice.uuid"
                                        class="flex items-center gap-1.5 text-[11px] text-ink-body">
                                        <span class="font-mono">#{{ invoice.invoice_number }}</span>
                                        <span v-if="invoice.created_at || invoice.due_on">{{ formatDateToReadable((invoice.created_at ?? invoice.due_on)!) }}</span>
                                        <span>{{ formatAmount(invoice.total_amount, 'DKK') }}</span>
                                        <Tooltip v-if="invoice.card_security_status" :text="$t('paymentDunning.problems.invoiceStatusHelp')" position="top" wrap>
                                            <span class="co-badge co-badge-gray">{{ $t(`paymentDunning.problems.invoiceStatus.${invoice.card_security_status}`) }}</span>
                                        </Tooltip>
                                    </li>
                                </ul>
                            </td>
                            <td class="co-td">
                                <span class="co-badge" :class="row.billing_method === 'invoice' ? 'co-badge-navy' : 'co-badge-blue'">
                                    <Icon :name="row.billing_method === 'invoice' ? 'ph:file-text' : 'ph:credit-card'" class="w-3 h-3" aria-hidden="true" />
                                    {{ $t(`paymentDunning.problems.method.${row.billing_method}`) }}
                                </span>
                                <Tooltip v-if="row.invoice_card_security" :text="$t('paymentDunning.company.cardSecurityHelp')" position="top" wrap>
                                    <span class="co-badge co-badge-gray ml-1.5">
                                        <Icon name="ph:shield-check" class="w-3 h-3" aria-hidden="true" />
                                        {{ $t('paymentDunning.problems.securityCard') }}
                                    </span>
                                </Tooltip>
                                <p v-if="row.security_card" class="mt-1 text-[11px] text-ink-body">
                                    {{ $t('paymentDunning.problems.securityCardLine', { last_four: row.security_card.last_four ?? '—', expiry: row.security_card.expiry ?? '—' }) }}
                                </p>
                            </td>
                            <td class="co-td text-[13px] font-semibold text-ink">
                                {{ formatAmount(row.amount_outstanding, 'DKK') }}
                            </td>
                            <td class="co-td text-[13px] text-ink">{{ row.days_overdue }}</td>
                            <td class="co-td text-[13px] text-ink">{{ row.warnings_sent }}</td>
                            <td class="co-td text-[13px] text-ink-body">
                                {{ row.closes_on ? formatDateToReadable(row.closes_on) : $t('paymentDunning.problems.noClosingDate') }}
                            </td>
                            <td class="co-td">
                                <span class="co-badge" :class="statusClass(row)">
                                    {{ $t(dunningStatusKey(row)) }}
                                </span>
                                <Tooltip v-if="row.postponed_until" :text="row.postpone_note || $t('paymentDunning.problems.help.postpone')"
                                    position="top" wrap>
                                    <span class="co-badge co-badge-blue ml-1.5">
                                        {{ $t('paymentDunning.problems.postponedUntil', { date: formatDateToReadable(row.postponed_until) }) }}
                                    </span>
                                </Tooltip>
                                <div v-if="row.tab === 'collection' || row.tab === 'written_off'" class="mt-1 text-[11px] text-ink-body max-w-[220px]">
                                    <p v-if="collectionDate(row)">
                                        {{ $t(`paymentDunning.problems.since.${row.tab}`, { date: formatDateToReadable(collectionDate(row)!) }) }}
                                    </p>
                                    <p v-if="row.collection_note" class="whitespace-pre-line break-words">{{ row.collection_note }}</p>
                                </div>
                            </td>
                            <td class="co-td">
                                <div v-if="canManage" class="flex flex-wrap items-center gap-1.5 justify-end">
                                    <Tooltip v-for="action in actionsFor(row)" :key="action"
                                        :text="$t(`paymentDunning.problems.help.${action}`)" position="top" wrap>
                                        <SuperadminTableButton :buttonStyle="DANGER_ACTIONS.includes(action) ? 'danger' : undefined"
                                            @click="openAction(row, action)">
                                            {{ $t(`paymentDunning.problems.action.${action}`) }}
                                        </SuperadminTableButton>
                                    </Tooltip>
                                    <Tooltip v-if="securityChargeUnavailable(row)"
                                        :text="$t('paymentDunning.problems.help.charge_security_card_disabled')" position="top" wrap>
                                        <SuperadminTableButton :disabled="true">
                                            {{ $t('paymentDunning.problems.action.charge_security_card') }}
                                        </SuperadminTableButton>
                                    </Tooltip>
                                </div>
                            </td>
                        </tr>
                    </template>
                </SuperadminTable>
            </div>

            <ModulesSuperadminBillingModalAction :isModalOpen="state.modal.isOpen" :row="state.selected"
                :action="state.action" @close="state.modal.isOpen = false" @done="onDone" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { billingService, type DunningActResult } from '@/components/api/superadmin/BillingService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import {
    DUNNING_TABS,
    chargeStatus,
    chargeTone,
    dunningActions,
    dunningStatusKey,
    dunningTabCounts,
    outcomeTone,
    retryStatus,
    securityChargeUnavailable,
    type DunningAction,
    type DunningRow,
    type DunningStatus,
    type DunningTab,
    type DunningTabCounts,
} from '@/composables/billingMethod'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { can } = usePermissions()
const { refresh: refreshBadge } = useBillingProblemCount()

// Status filter inside "Aktive"; closed, collection and written off have their own tabs.
const statuses: DunningStatus[] = ['past_due', 'overdue', 'ready_to_close']
const DANGER_ACTIONS: DunningAction[] = ['close', 'revoke_security_card', 'retry_unknown_charge', 'collection', 'write_off']

// What the screen offers. The API refuses these without manage_financials anyway.
const canManage = computed(() => can('manage_financials'))

const state = reactive({
    rows: [] as DunningRow[],
    tab: 'active' as DunningTab,
    counts: dunningTabCounts(null) as DunningTabCounts,
    status: '' as '' | DunningStatus,
    isLoading: false,
    error: {} as Error,
    modal: { isOpen: false },
    selected: null as DunningRow | null,
    action: null as DunningAction | null,
})

const columns = computed(() => [
    { key: 'company', name: t('paymentDunning.problems.col.company') },
    { key: 'method', name: t('paymentDunning.problems.col.method') },
    { key: 'outstanding', name: t('paymentDunning.problems.col.outstanding') },
    { key: 'days', name: t('paymentDunning.problems.col.daysOverdue') },
    { key: 'warnings', name: t('paymentDunning.problems.col.warnings') },
    { key: 'closes', name: t('paymentDunning.problems.col.closesOn') },
    { key: 'status', name: t('paymentDunning.problems.col.status') },
    { key: 'actions', name: '' },
])

const visibleRows = computed(() => state.tab === 'active' && state.status ? state.rows.filter((row) => row.status === state.status) : state.rows)

function statusClass(row: DunningRow) {
    if (row.tab === 'written_off') return 'co-badge-gray'
    if (row.tab !== 'active') return 'co-badge-red'
    if (row.billing_method === 'card' && row.reminder_stage >= 3) return 'co-badge-red'
    return {
        past_due: 'co-badge-gray',
        overdue: 'co-badge-gray',
        ready_to_close: 'co-badge-red',
        suspended: 'co-badge-red',
        collection: 'co-badge-red',
        written_off: 'co-badge-gray',
    }[row.status]
}

function collectionDate(row: DunningRow) {
    return row.tab === 'written_off' ? (row.written_off_at ?? row.collection_at) : row.collection_at
}

function selectTab(tab: DunningTab) {
    if (state.tab === tab) return
    state.tab = tab
    state.status = ''
    state.rows = []
    fetchRows()
}

function actionsFor(row: DunningRow) {
    return dunningActions(row)
}

async function fetchRows() {
    const tab = state.tab
    state.error = {}
    state.isLoading = true
    try {
        const { rows, counts } = await billingService.getProblems({ tab })
        // A slower answer for a tab the user already left is dropped.
        if (tab !== state.tab) return
        state.rows = rows
        state.counts = counts
    } catch (error: any) {
        if (tab !== state.tab) return
        state.error = error
    }
    state.isLoading = false
}

function openAction(row: DunningRow, action: DunningAction) {
    state.selected = row
    state.action = action
    state.modal.isOpen = true
}

async function onDone(action: DunningAction, result: DunningActResult | null) {
    state.modal.isOpen = false
    const company = state.selected?.company_uuid

    // Retry and the security charge say how it ended; "pending" is never shown as paid.
    const outcome = action === 'retry' ? retryStatus(result)
        : action === 'charge_security_card' || action === 'retry_unknown_charge' ? chargeStatus(result) : null

    if (outcome) {
        const message = t(`paymentDunning.outcome.${action === 'retry' ? 'retry' : 'charge'}.${outcome}`)
        const tone = action !== 'retry' ? chargeTone(outcome as any) : outcomeTone(outcome as any)
        if (tone === 'success') successAlert(`${t('alert.success')}!`, message)
        else errorAlert(tone === 'info' ? t('paymentDunning.problems.title') : t('alert.warning'), message)
    } else {
        successAlert(`${t('alert.success')}!`, t(`paymentDunning.problems.done.${action}`))
    }

    // Update the row in place from the response; a payment that cleared the problem
    // drops out of the list on the next fetch.
    if (result?.row && company) {
        state.rows = state.rows.map((row) => (row.company_uuid === company ? result.row! : row))
    }

    // A row that moved tab (closed, reopened, sent to collection, written off) changes the
    // list and the tab counts, so fetch again.
    const stays = !!result?.row && result.row.tab === state.tab
    await Promise.all([stays ? Promise.resolve() : fetchRows(), refreshBadge()])
}

onMounted(fetchRows)
</script>
