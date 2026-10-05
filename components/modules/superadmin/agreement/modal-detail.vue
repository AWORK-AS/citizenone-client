<template>
    <Modal size="3xl" :title="state.agreement?.name ?? $t('superadmin.agreements.detail.title')" titleIcon="ph:handshake"
        :show="props.isModalOpen" @close="$emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isLoading">
                <div v-if="state.agreement" class="space-y-6">
                    <ModulesSuperadminAgreementInternalNotice />
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- Key figures -->
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <Tooltip v-for="card in cards" :key="card.key" :text="card.help" position="bottom" wrap>
                            <div class="rounded-xl border border-[#EAECF0] bg-white p-3 w-full text-left">
                                <p class="text-[11px] text-[#8891A4]">{{ card.label }}</p>
                                <p class="text-[17px] font-semibold text-[#1F2533]">{{ card.value }}</p>
                            </div>
                        </Tooltip>
                    </div>

                    <div class="flex flex-wrap items-center gap-2 text-[12px]">
                        <Tooltip :text="$t('superadmin.agreements.help.status')" position="top" wrap>
                            <span class="co-badge" :class="statusClass(state.agreement.status)">
                                {{ $t(`superadmin.agreements.statuses.${state.agreement.status}`) }}
                            </span>
                        </Tooltip>
                        <Tooltip :text="$t('superadmin.agreements.help.billingPlanBadge')" position="top" wrap>
                            <span class="co-badge co-badge-navy">
                                {{ $t(`superadmin.agreements.plans.${state.agreement.billing_plan}`) }}
                            </span>
                        </Tooltip>
                        <span class="text-[#5C6478]">
                            {{ formatDateToReadable(state.agreement.starts_on) }} - {{ formatDateToReadable(state.agreement.ends_on) }}
                            ({{ $t('superadmin.agreements.months', { count: state.agreement.term_months }) }})
                        </span>
                        <Tooltip v-if="state.agreement.renewals_count > 0" :text="$t('superadmin.agreements.renewedHelp')"
                            position="top" wrap>
                            <span class="co-badge co-badge-navy">
                                <Icon name="ph:arrows-clockwise" class="w-3 h-3" aria-hidden="true" />
                                {{ $t('superadmin.agreements.renewed', { count: state.agreement.renewals_count }) }}
                            </span>
                        </Tooltip>
                        <ModulesSuperadminAgreementNoticeBadge :deadline="state.agreement.notice_deadline"
                            :autoRenews="state.agreement.auto_renews" />
                    </div>

                    <div v-if="state.agreement.estimated_renewal_annual_value != null"
                        class="flex flex-wrap items-center gap-2 text-[13px] text-[#1F2533]">
                        <Tooltip :text="$t('superadmin.agreements.renewal.expectedHelp')" position="top" wrap>
                            <span class="inline-flex items-center gap-1">
                                {{ $t('superadmin.agreements.renewal.expected', {
                                    amount: formatNumber(state.agreement.estimated_renewal_annual_value) }) }}
                                <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7]"
                                    :aria-label="$t('superadmin.agreements.renewal.expectedHelp')" />
                            </span>
                        </Tooltip>
                        <Tooltip v-if="state.agreement.renewal_value_source"
                            :text="$t(`superadmin.agreements.renewal.sourceHelp.${state.agreement.renewal_value_source}`)"
                            position="top" wrap>
                            <span class="co-badge" :class="state.agreement.renewal_value_source === 'fallback' ? 'co-badge-gray' : 'co-badge-navy'">
                                {{ $t(`superadmin.agreements.renewal.sources.${state.agreement.renewal_value_source}`) }}
                            </span>
                        </Tooltip>
                    </div>

                    <p v-if="state.agreement.internal_note"
                        class="text-[13px] text-[#5C6478] bg-[#F9FAFB] border border-[#EAECF0] rounded-lg px-3 py-2 whitespace-pre-wrap">
                        {{ state.agreement.internal_note }}
                    </p>

                    <!-- Installments -->
                    <section class="border border-[#EAECF0] rounded-xl overflow-hidden">
                        <div class="px-4 py-2.5 bg-[#F9FAFB] border-b border-[#EAECF0]">
                            <p class="text-[13px] font-semibold text-[#1F2533]">
                                {{ $t('superadmin.agreements.detail.installments') }}
                            </p>
                        </div>
                        <table class="w-full text-[13px]">
                            <thead>
                                <tr class="text-left text-[11px] uppercase text-[#5C6478]">
                                    <th class="px-4 py-2">#</th>
                                    <th class="px-4 py-2">{{ $t('superadmin.agreements.table.dueOn') }}</th>
                                    <th class="px-4 py-2">{{ $t('superadmin.agreements.table.label') }}</th>
                                    <th class="px-4 py-2 text-right">{{ $t('superadmin.agreements.table.amount') }}</th>
                                    <th class="px-4 py-2">
                                        <Tooltip :text="$t('superadmin.agreements.table.coversHelp')" position="top" wrap>
                                            <span class="inline-flex items-center gap-1">
                                                {{ $t('superadmin.agreements.table.covers') }}
                                                <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7]"
                                                    :aria-label="$t('superadmin.agreements.table.coversHelp')" />
                                            </span>
                                        </Tooltip>
                                    </th>
                                    <th class="px-4 py-2">{{ $t('superadmin.agreements.detail.invoice') }}</th>
                                    <th class="px-4 py-2">{{ $t('superadmin.agreements.detail.paid') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in state.agreement.installments" :key="row.uuid"
                                    class="border-t border-[#F5F6F8]">
                                    <td class="px-4 py-2 text-[#8891A4]">{{ row.sequence }}</td>
                                    <td class="px-4 py-2">{{ formatDateToReadable(row.due_on) }}</td>
                                    <td class="px-4 py-2 text-[#5C6478]">
                                        {{ row.label }}
                                        <Tooltip v-if="isCancellationRemainder(row.label)"
                                            :text="$t('superadmin.agreements.remainder.help')" position="top" wrap>
                                            <span class="co-badge bg-[#FEF3C7] text-[#B45309] ml-1.5">
                                                <Icon name="ph:flag" class="w-3 h-3" aria-hidden="true" />
                                                {{ $t('superadmin.agreements.remainder.chip') }}
                                            </span>
                                        </Tooltip>
                                    </td>
                                    <td class="px-4 py-2 text-right font-medium">{{ formatAmount(row.amount, 'DKK') }}</td>
                                    <td class="px-4 py-2 text-[#5C6478] whitespace-nowrap">
                                        <template v-if="row.covers_from || row.covers_to">
                                            {{ row.covers_from ? formatDateToReadable(row.covers_from) : '-' }}
                                            &ndash;
                                            {{ row.covers_to ? formatDateToReadable(row.covers_to) : '-' }}
                                        </template>
                                        <span v-else class="text-[#B4BBC7]">-</span>
                                    </td>
                                    <td class="px-4 py-2">
                                        <div v-if="row.invoice" class="flex flex-wrap items-center gap-2">
                                            <Tooltip :text="$t('superadmin.agreements.detail.openInvoice')" position="top">
                                                <NuxtLink class="font-mono text-[#205E77] hover:underline"
                                                    :to="`/superadmin/companies/${props.companyUuid}/invoices/${row.invoice.uuid}/invoice-details`">
                                                    #{{ row.invoice.invoice_number }}
                                                </NuxtLink>
                                            </Tooltip>
                                            <ModulesSuperadminAgreementEconomicStatus :invoice="row.invoice"
                                                @updated="load" @failed="(error: any) => state.error = error" />
                                        </div>
                                        <Tooltip v-else-if="row.settled_externally_at"
                                            :text="row.settled_note
                                                ? $t('superadmin.agreements.settled.helpWithNote', { note: row.settled_note })
                                                : $t('superadmin.agreements.settled.help')" position="top" wrap>
                                            <span class="co-badge co-badge-gray">
                                                <Icon name="ph:check-square" class="w-3 h-3" aria-hidden="true" />
                                                {{ $t('superadmin.agreements.settled.chip') }}
                                            </span>
                                        </Tooltip>
                                        <div v-else class="flex items-center gap-2">
                                            <Tooltip :text="$t('superadmin.agreements.detail.notInvoicedHelp')"
                                                position="top" wrap>
                                                <span class="co-badge co-badge-gray">
                                                    {{ $t('superadmin.agreements.detail.notInvoiced') }}
                                                </span>
                                            </Tooltip>
                                            <Tooltip :text="$t('superadmin.agreements.linkInvoice.help')" position="top" wrap>
                                                <SuperadminTableButton @click="state.linkTarget = row">
                                                    <Icon name="ph:link" class="w-3.5 h-3.5" aria-hidden="true" />
                                                    {{ $t('superadmin.agreements.linkInvoice.action') }}
                                                </SuperadminTableButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                    <td class="px-4 py-2">
                                        <template v-if="row.invoice">
                                            <Tooltip v-if="row.invoice.is_paid"
                                                :text="$t('superadmin.agreements.detail.paidHelp')" position="top" wrap>
                                                <span class="co-badge co-badge-green">
                                                    <Icon name="ph:check" class="w-3 h-3" aria-hidden="true" />
                                                    {{ row.invoice.paid_at
                                                        ? formatDateToReadable(row.invoice.paid_at)
                                                        : $t('superadmin.invoices.table.paid') }}
                                                </span>
                                            </Tooltip>
                                            <Tooltip v-else :text="$t('superadmin.agreements.detail.unpaidHelp')"
                                                position="top" wrap>
                                                <span class="co-badge co-badge-red">
                                                    {{ $t('superadmin.invoices.table.unpaid') }}
                                                </span>
                                            </Tooltip>
                                        </template>
                                        <span v-else class="text-[#B4BBC7]">-</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <!-- Invoices covered by the agreement -->
                    <section class="border border-[#EAECF0] rounded-xl p-4 space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-1.5">
                                <p class="text-[13px] font-semibold text-[#1F2533]">
                                    {{ $t('superadmin.agreements.covered.title') }}
                                </p>
                                <Tooltip :text="$t('superadmin.agreements.covered.help')" position="top" wrap>
                                    <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7]"
                                        :aria-label="$t('superadmin.agreements.covered.help')" />
                                </Tooltip>
                            </div>
                            <Tooltip :text="$t('superadmin.agreements.covered.addHelp')" position="left" wrap>
                                <FormButton type="button" buttonStyle="action" @click="state.isCoverOpen = true">
                                    <Icon name="ph:plus" class="w-4 h-4" aria-hidden="true" />
                                    {{ $t('superadmin.agreements.covered.add') }}
                                </FormButton>
                            </Tooltip>
                        </div>
                        <p v-if="!(state.agreement.covered_invoices ?? []).length" class="text-[12px] text-[#8891A4]">
                            {{ $t('superadmin.agreements.covered.none') }}
                        </p>
                        <div v-for="invoice in state.agreement.covered_invoices ?? []" :key="invoice.uuid"
                            class="flex items-center justify-between gap-3 text-sm">
                            <NuxtLink class="font-mono text-[#205E77] hover:underline"
                                :to="`/superadmin/companies/${props.companyUuid}/invoices/${invoice.uuid}/invoice-details`">
                                #{{ invoice.invoice_number }}
                            </NuxtLink>
                            <span v-if="invoice.total_amount !== undefined" class="text-[#5C6478]">
                                {{ formatAmount(invoice.total_amount, 'DKK') }}
                            </span>
                            <Tooltip :text="$t('superadmin.agreements.covered.removeHelp')" position="left" wrap>
                                <SuperadminTableButton buttonStyle="danger" @click="removeCovered(invoice.uuid)">
                                    <Icon name="ph:x" class="w-3.5 h-3.5" aria-hidden="true" />
                                    {{ $t('superadmin.agreements.covered.remove') }}
                                </SuperadminTableButton>
                            </Tooltip>
                        </div>
                    </section>

                    <!-- Subscriptions -->
                    <section class="border border-[#EAECF0] rounded-xl p-4 space-y-3">
                        <div class="flex items-center gap-1.5">
                            <p class="text-[13px] font-semibold text-[#1F2533]">
                                {{ $t('superadmin.agreements.detail.subscriptions') }}
                            </p>
                            <Tooltip :text="$t('superadmin.agreements.help.subscriptions')" position="top" wrap>
                                <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7]"
                                    :aria-label="$t('superadmin.agreements.help.subscriptions')" />
                            </Tooltip>
                        </div>
                        <p v-if="!subscriptionOptions.length" class="text-[12px] text-[#8891A4]">
                            {{ $t('superadmin.agreements.detail.noSubscriptions') }}
                        </p>
                        <Tooltip v-for="option in subscriptionOptions" :key="option.uuid"
                            :text="$t('superadmin.agreements.detail.linkedElsewhere')" :disabled="!isLinkedElsewhere(option)"
                            position="top" wrap class="!block">
                            <label class="flex items-center gap-2 text-sm"
                                :class="isLinkedElsewhere(option) ? 'text-[#8891A4] cursor-not-allowed' : 'text-[#1F2533] cursor-pointer'">
                                <input type="checkbox" class="rounded border-[#D5D9E2]" :value="option.uuid"
                                    :disabled="isLinkedElsewhere(option)" v-model="state.linked" />
                                <span>{{ option.label }}</span>
                                <span class="co-badge co-badge-gray">
                                    {{ $t(`superadmin.agreements.detail.dealTypes.${option.deal_type ?? 'deal'}`) }}
                                </span>
                                <span v-if="option.user_name" class="text-[12px] text-[#8891A4]">{{ option.user_name }}</span>
                            </label>
                        </Tooltip>
                        <Tooltip :text="$t('superadmin.agreements.detail.saveSubscriptionsHelp')" position="top" wrap>
                            <FormButton type="button" buttonStyle="action" :disabled="!linkedChanged"
                                @click="saveSubscriptions">
                                <Icon name="ph:link" class="w-4 h-4" aria-hidden="true" />
                                {{ $t('superadmin.agreements.detail.saveSubscriptions') }}
                            </FormButton>
                        </Tooltip>
                    </section>

                    <!-- Actions -->
                    <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div v-if="state.agreement.status === 'active'" class="flex items-center gap-2">
                            <Tooltip :text="$t('superadmin.agreements.detail.cancelHelp')" position="top" wrap>
                                <FormButton type="button" buttonStyle="danger" @click="state.cancel.open = true">
                                    <Icon name="ph:prohibit" class="w-4 h-4" aria-hidden="true" />
                                    {{ $t('superadmin.agreements.detail.cancel') }}
                                </FormButton>
                            </Tooltip>
                        </div>
                        <span v-else></span>
                        <div class="flex items-center gap-2">
                            <Tooltip :text="$t('superadmin.agreements.detail.deleteHelp')" position="top" wrap>
                                <FormButton type="button" buttonStyle="danger" @click="state.isDeleteOpen = true">
                                    <Icon name="ph:trash" class="w-4 h-4" aria-hidden="true" />
                                    {{ $t('superadmin.agreements.detail.delete') }}
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('superadmin.agreements.detail.editHelp')" position="top">
                                <FormButton type="button" buttonStyle="primary" @click="$emit('edit', state.agreement)">
                                    <Icon name="ph:pencil-simple" class="w-4 h-4" aria-hidden="true" />
                                    {{ $t('superadmin.agreements.detail.edit') }}
                                </FormButton>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
            <ModulesSuperadminAgreementModalLinkInvoice :isModalOpen="!!state.linkTarget" :companyUuid="props.companyUuid"
                :agreementUuid="state.agreement?.uuid ?? ''" :installment="state.linkTarget"
                @close="state.linkTarget = null" @linked="onInvoiceLinked" />
            <ModulesSuperadminAgreementModalCoveredInvoices :isModalOpen="state.isCoverOpen"
                :companyUuid="props.companyUuid" :agreementUuid="state.agreement?.uuid ?? ''"
                @close="state.isCoverOpen = false" @covered="onCovered" />
            <ModulesSuperadminAgreementModalCancel :isModalOpen="state.cancel.open" :agreement="state.agreement"
                @close="state.cancel.open = false" @cancelled="onCancelled" />
            <DialogConfirmation :isModalOpen="state.isDeleteOpen"
                :message="$t('superadmin.agreements.detail.deleteConfirm') + '?'"
                @close="state.isDeleteOpen = false" @confirm="deleteAgreement" />
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { agreementService } from '@/components/api/superadmin/AgreementService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { isCancellationRemainder, unwrapData } from '@/composables/agreements'
import type { Agreement, LinkableSubscription } from '@/types/agreement'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    companyUuid: { type: String, required: true },
    agreementUuid: { type: String, default: '' },
})
const emit = defineEmits(['close', 'edit', 'changed', 'deleted'])

const { t } = useI18n()
const { formatAmount } = useAmountFormatter()
const formatNumber = (value: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(value) || 0)
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    agreement: null as Agreement | null,
    isLoading: false,
    error: {} as Error,
    linked: [] as string[],
    candidates: [] as LinkableSubscription[],
    cancel: { open: false },
    isDeleteOpen: false,
    linkTarget: null as any,
    isCoverOpen: false,
})

const cards = computed(() => {
    const a = state.agreement
    if (!a) return []
    return [
        { key: 'value', label: t('superadmin.agreements.table.contractValue'), value: formatAmount(a.contract_value, 'DKK'), help: t('superadmin.agreements.help.contractValue') },
        { key: 'mrr', label: t('superadmin.agreements.table.mrrArr'), value: `${formatAmount(a.contract_mrr, 'DKK')} / ${formatAmount(a.contract_arr, 'DKK')}`, help: t('superadmin.agreements.help.mrrArr') },
        { key: 'invoiced', label: t('superadmin.agreements.detail.invoicedTotal'), value: formatAmount(a.invoiced_total, 'DKK'), help: t('superadmin.agreements.help.invoiced') },
        { key: 'backlog', label: t('superadmin.agreements.table.backlog'), value: formatAmount(a.backlog, 'DKK'), help: t('superadmin.agreements.help.backlog') },
    ]
})

/** Linked subscriptions plus the company's main subscription, if not linked yet. */
const subscriptionOptions = computed<LinkableSubscription[]>(() => {
    const seen = new Set(state.candidates.map((c) => c.uuid))
    const linkedHere = (state.agreement?.subscriptions ?? [])
        .filter((s) => !seen.has(s.uuid))
        .map((s) => ({ ...s, deal_type: 'deal' as const, company_agreement_uuid: state.agreement?.uuid ?? null }))
    return [...linkedHere, ...state.candidates]
})

/** Already part of another agreement: shown, but cannot be moved from here. */
function isLinkedElsewhere(option: LinkableSubscription): boolean {
    return !!option.company_agreement_uuid && option.company_agreement_uuid !== state.agreement?.uuid
}

const linkedChanged = computed(() => {
    const original = (state.agreement?.subscriptions ?? []).map((s) => s.uuid).sort().join(',')
    return original !== [...state.linked].sort().join(',')
})

function statusClass(status: string) {
    return status === 'active' ? 'co-badge-green' : status === 'cancelled' ? 'co-badge-red' : status === 'ended' ? 'bg-[#FEF3C7] text-[#B45309]' : 'co-badge-gray'
}

watch(() => props.isModalOpen, (open: boolean) => { if (open) load() })

async function load() {
    if (!props.agreementUuid) return
    state.error = {}
    state.isLoading = true
    state.cancel.open = false
    try {
        state.agreement = unwrapData<Agreement>(await agreementService.getAgreement(props.agreementUuid))
        state.linked = (state.agreement?.subscriptions ?? []).map((s) => s.uuid)
        await loadCandidates()
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function loadCandidates() {
    state.candidates = []
    try {
        const list = unwrapData<LinkableSubscription[]>(await agreementService.getLinkableSubscriptions(props.companyUuid))
        state.candidates = Array.isArray(list) ? list : []
    } catch (_) {
        state.candidates = []
    }
}

// The API answers with the full agreement: replace local state with it.
function onInvoiceLinked(agreement: Agreement) {
    state.linkTarget = null
    state.agreement = agreement
    emit('changed')
}

function onCovered(agreement: Agreement) {
    state.isCoverOpen = false
    state.agreement = agreement
    emit('changed')
}

async function removeCovered(invoiceUuid: string) {
    if (!state.agreement) return
    state.error = {}
    try {
        state.agreement = unwrapData<Agreement>(await agreementService.removeCoveredInvoice(state.agreement.uuid, invoiceUuid))
        emit('changed')
    } catch (error: any) {
        state.error = error
    }
}

async function saveSubscriptions() {
    if (!state.agreement) return
    state.error = {}
    try {
        state.agreement = unwrapData<Agreement>(await agreementService.linkSubscriptions(state.agreement.uuid, state.linked))
        state.linked = (state.agreement?.subscriptions ?? []).map((s) => s.uuid)
        emit('changed')
    } catch (error: any) {
        state.error = error
    }
}

// The API answers with the full agreement: replace local state with it.
function onCancelled(agreement: Agreement) {
    state.cancel.open = false
    state.agreement = agreement
    emit('changed')
}

async function deleteAgreement() {
    if (!state.agreement) return
    state.error = {}
    state.isDeleteOpen = false
    try {
        await agreementService.deleteAgreement(state.agreement.uuid)
        emit('deleted')
    } catch (error: any) {
        // 422 when invoices already exist: the message from the API says so.
        state.error = error
    }
}
</script>
