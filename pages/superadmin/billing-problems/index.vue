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
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">{{ $t('paymentDunning.problems.title') }}</h1>
                        <p class="text-sm text-[#5C6478] mt-0.5 max-w-2xl">{{ $t('paymentDunning.problems.intro') }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <select v-model="state.status"
                            class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#5C6478] outline-none focus:border-[#42AED9] transition-colors"
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

                <p v-if="!canManage" class="text-[13px] text-[#5C6478] mb-3">
                    {{ $t('paymentDunning.problems.readOnly') }}
                </p>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <SuperadminTable :columnHeaders="columns" :data="{ data: visibleRows }" :isLoading="state.isLoading"
                    :emptyMessage="state.status ? $t('paymentDunning.problems.emptyFiltered') : $t('paymentDunning.problems.empty')"
                    emptyIcon="ph:check-circle" rowKey="company_uuid">
                    <template #body>
                        <tr v-for="row in visibleRows" :key="row.company_uuid"
                            class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                            <td class="co-td">
                                <Tooltip :text="$t('paymentDunning.problems.openCompany')" position="top">
                                    <NuxtLink :to="`/superadmin/companies/${row.company_uuid}/overview`"
                                        class="text-[13px] font-medium text-[#205E77] hover:underline truncate max-w-[200px] block">
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
                                        class="flex items-center gap-1.5 text-[11px] text-[#5C6478]">
                                        <span class="font-mono">#{{ invoice.invoice_number }}</span>
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
                                <p v-if="row.security_card" class="mt-1 text-[11px] text-[#5C6478]">
                                    {{ $t('paymentDunning.problems.securityCardLine', { last_four: row.security_card.last_four ?? '—', expiry: row.security_card.expiry ?? '—' }) }}
                                </p>
                            </td>
                            <td class="co-td text-[13px] font-semibold text-[#1F2533]">
                                {{ formatAmount(row.amount_outstanding, 'DKK') }}
                            </td>
                            <td class="co-td text-[13px] text-[#1F2533]">{{ row.days_overdue }}</td>
                            <td class="co-td text-[13px] text-[#1F2533]">{{ row.warnings_sent }}</td>
                            <td class="co-td text-[13px] text-[#5C6478]">
                                {{ row.closes_on ? formatDateToReadable(row.closes_on) : $t('paymentDunning.problems.noClosingDate') }}
                            </td>
                            <td class="co-td">
                                <span class="co-badge" :class="statusClass(row.status)">
                                    {{ $t(`paymentDunning.problems.status.${row.status}`) }}
                                </span>
                                <Tooltip v-if="row.postponed_until" :text="row.postpone_note || $t('paymentDunning.problems.help.postpone')"
                                    position="top" wrap>
                                    <span class="co-badge co-badge-blue ml-1.5">
                                        {{ $t('paymentDunning.problems.postponedUntil', { date: formatDateToReadable(row.postponed_until) }) }}
                                    </span>
                                </Tooltip>
                            </td>
                            <td class="co-td">
                                <div v-if="canManage" class="flex flex-wrap items-center gap-1.5 justify-end">
                                    <Tooltip v-for="action in actionsFor(row)" :key="action"
                                        :text="$t(`paymentDunning.problems.help.${action}`)" position="top" wrap>
                                        <SuperadminTableButton :buttonStyle="action === 'close' || action === 'revoke_security_card' || action === 'retry_unknown_charge' ? 'danger' : undefined"
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
import { chargeStatus, chargeTone, dunningActions, outcomeTone, retryStatus, securityChargeUnavailable, type DunningAction, type DunningRow, type DunningStatus } from '@/composables/billingMethod'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { can } = usePermissions()
const { refresh: refreshBadge } = useBillingProblemCount()

const statuses: DunningStatus[] = ['past_due', 'overdue', 'ready_to_close', 'suspended']

// What the screen offers. The API refuses these without manage_financials anyway.
const canManage = computed(() => can('manage_financials'))

const state = reactive({
    rows: [] as DunningRow[],
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

const visibleRows = computed(() => state.status ? state.rows.filter((row) => row.status === state.status) : state.rows)

function statusClass(status: DunningStatus) {
    return {
        past_due: 'co-badge-gray',
        overdue: 'co-badge-gray',
        ready_to_close: 'co-badge-red',
        suspended: 'co-badge-red',
    }[status]
}

function actionsFor(row: DunningRow) {
    return dunningActions(row)
}

async function fetchRows() {
    state.error = {}
    state.isLoading = true
    try {
        const { rows } = await billingService.getProblems()
        state.rows = rows
    } catch (error: any) {
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

    await Promise.all([result?.row ? Promise.resolve() : fetchRows(), refreshBadge()])
}

onMounted(fetchRows)
</script>
