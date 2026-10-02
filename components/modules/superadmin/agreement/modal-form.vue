<template>
    <Modal size="2xl" :title="props.agreement ? $t('superadmin.agreements.form.editTitle') : $t('superadmin.agreements.form.createTitle')"
        titleIcon="ph:handshake" :show="props.isModalOpen" @close="$emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isSaving">
                <div class="space-y-5">
                    <ModulesSuperadminAgreementInternalNotice />
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <form @submit.prevent="submit" class="space-y-6">
                        <!-- Contract -->
                        <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <SuperadminFormLabel :label="$t('superadmin.agreements.form.name')" required />
                                <input class="co-input" type="text" v-model="form.name" maxlength="255"
                                    :placeholder="$t('superadmin.agreements.form.namePlaceholder')" />
                            </div>
                            <div>
                                <SuperadminFormLabel :label="$t('superadmin.agreements.form.startsOn')" required />
                                <input class="co-input" type="date" v-model="form.starts_on" />
                            </div>
                            <div>
                                <div class="flex items-center gap-1">
                                    <SuperadminFormLabel :label="$t('superadmin.agreements.form.termMonths')" required />
                                    <Tooltip :text="$t('superadmin.agreements.help.termMonths')" position="top" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] mb-[5px]"
                                            :aria-label="$t('superadmin.agreements.help.termMonths')" />
                                    </Tooltip>
                                </div>
                                <input class="co-input" type="number" min="1" step="1" v-model="form.term_months" />
                            </div>
                            <div>
                                <div class="flex items-center gap-1">
                                    <SuperadminFormLabel :label="$t('superadmin.agreements.form.noticeMonths')" />
                                    <Tooltip :text="$t('superadmin.agreements.help.noticeMonths')" position="top" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] mb-[5px]"
                                            :aria-label="$t('superadmin.agreements.help.noticeMonths')" />
                                    </Tooltip>
                                </div>
                                <input class="co-input" type="number" min="0" step="1" v-model="form.notice_months" />
                            </div>
                            <div class="flex items-end pb-2">
                                <Tooltip :text="$t('superadmin.agreements.help.autoRenews')" position="top" wrap>
                                    <label class="inline-flex items-center gap-2 text-sm text-[#1F2533] cursor-pointer">
                                        <input type="checkbox" v-model="form.auto_renews" class="rounded border-[#D5D9E2]" />
                                        {{ $t('superadmin.agreements.form.autoRenews') }}
                                    </label>
                                </Tooltip>
                            </div>
                            <div>
                                <div class="flex items-center gap-1">
                                    <SuperadminFormLabel :label="$t('superadmin.agreements.form.contractValue')" required />
                                    <Tooltip :text="$t('superadmin.agreements.help.contractValue')" position="top" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] mb-[5px]"
                                            :aria-label="$t('superadmin.agreements.help.contractValue')" />
                                    </Tooltip>
                                </div>
                                <input class="co-input" type="number" min="0" step="0.01" v-model="form.contract_value" />
                            </div>
                            <div>
                                <div class="flex items-center gap-1">
                                    <SuperadminFormLabel :label="$t('superadmin.agreements.form.feePerInvoice')" />
                                    <Tooltip :text="$t('superadmin.agreements.help.feePerInvoice')" position="top" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] mb-[5px]"
                                            :aria-label="$t('superadmin.agreements.help.feePerInvoice')" />
                                    </Tooltip>
                                </div>
                                <input class="co-input" type="number" min="0" step="0.01" v-model="form.fee_per_invoice" />
                            </div>
                            <div>
                                <SuperadminFormLabel :label="$t('superadmin.agreements.form.paymentMethod')" required />
                                <SuperadminFormSelectField v-model="form.payment_method">
                                    <option value="bank_transfer">{{ $t('superadmin.agreements.paymentMethods.bank_transfer') }}</option>
                                    <option value="card">{{ $t('superadmin.agreements.paymentMethods.card') }}</option>
                                </SuperadminFormSelectField>
                            </div>
                            <div class="md:col-span-2">
                                <SuperadminFormLabel :label="$t('superadmin.agreements.form.internalNote')" />
                                <textarea class="co-input" rows="2" v-model="form.internal_note"
                                    :placeholder="$t('superadmin.agreements.form.internalNotePlaceholder')" />
                            </div>
                        </section>

                        <!-- Settled outside CitizenOne (backfilling existing customers) -->
                        <section class="border border-[#EAECF0] rounded-xl p-4 bg-[#F9FAFB] space-y-3">
                            <div class="flex items-center gap-1.5">
                                <p class="text-[13px] font-semibold text-[#1F2533]">
                                    {{ $t('superadmin.agreements.form.settledTitle') }}
                                </p>
                                <Tooltip :text="$t('superadmin.agreements.help.settledExternally')" position="top" wrap>
                                    <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7]"
                                        :aria-label="$t('superadmin.agreements.help.settledExternally')" />
                                </Tooltip>
                            </div>
                            <p class="text-[12px] text-[#5C6478]">{{ $t('superadmin.agreements.help.settledExternally') }}</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <SuperadminFormLabel :label="$t('superadmin.agreements.form.settledBefore')" />
                                    <input class="co-input" type="date" v-model="form.settled_externally_before" />
                                </div>
                                <div>
                                    <SuperadminFormLabel :label="$t('superadmin.agreements.form.settledNote')" />
                                    <input class="co-input" type="text" maxlength="255" v-model="form.settled_note"
                                        :placeholder="$t('superadmin.agreements.form.settledNotePlaceholder')" />
                                </div>
                            </div>
                        </section>

                        <!-- Billing plan -->
                        <section class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div class="flex items-center gap-1">
                                        <SuperadminFormLabel :label="$t('superadmin.agreements.form.billingPlan')" required />
                                        <Tooltip :text="$t('superadmin.agreements.help.billingPlan')" position="top" wrap>
                                            <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] mb-[5px]"
                                                :aria-label="$t('superadmin.agreements.help.billingPlan')" />
                                        </Tooltip>
                                    </div>
                                    <SuperadminFormSelectField v-model="form.billing_plan">
                                        <option v-for="plan in plans" :key="plan" :value="plan">
                                            {{ $t(`superadmin.agreements.plans.${plan}`) }}
                                        </option>
                                    </SuperadminFormSelectField>
                                </div>
                                <div v-if="form.billing_plan === 'prepaid_multi_year'">
                                    <SuperadminFormLabel :label="$t('superadmin.agreements.form.prepaidYears')" required />
                                    <input class="co-input" type="number" min="1" step="1" v-model="form.prepaid_years" />
                                </div>
                            </div>

                            <!-- Installments: preset helper + editable list -->
                            <div v-if="form.billing_plan === 'installments'"
                                class="border border-[#EAECF0] rounded-xl p-4 space-y-4 bg-[#F9FAFB]">
                                <div>
                                    <p class="text-[13px] font-semibold text-[#1F2533]">
                                        {{ $t('superadmin.agreements.form.presetTitle') }}
                                    </p>
                                    <p class="text-[12px] text-[#5C6478]">{{ $t('superadmin.agreements.form.presetHint') }}</p>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                    <div>
                                        <SuperadminFormLabel :label="$t('superadmin.agreements.form.upfrontPercent')" />
                                        <input class="co-input" type="number" min="0" max="100" step="0.01"
                                            v-model="form.preset.upfront_percent" />
                                    </div>
                                    <div>
                                        <SuperadminFormLabel :label="$t('superadmin.agreements.form.remainingCount')" />
                                        <input class="co-input" type="number" min="0" step="1"
                                            v-model="form.preset.remaining_count" />
                                    </div>
                                    <div>
                                        <SuperadminFormLabel :label="$t('superadmin.agreements.form.remainingInterval')" />
                                        <input class="co-input" type="number" min="1" step="1"
                                            v-model="form.preset.remaining_interval_months" />
                                    </div>
                                    <Tooltip :text="hasLockedRows
                                        ? $t('superadmin.agreements.form.presetLocked')
                                        : $t('superadmin.agreements.form.applyPresetHelp')" position="top" wrap>
                                        <FormButton type="button" buttonStyle="action" :disabled="hasLockedRows"
                                            @click="applyPreset">
                                            <Icon name="ph:magic-wand" class="w-4 h-4" aria-hidden="true" />
                                            {{ $t('superadmin.agreements.form.applyPreset') }}
                                        </FormButton>
                                    </Tooltip>
                                </div>

                                <!-- Editable explicit list -->
                                <div>
                                    <div class="flex items-center justify-between mb-2">
                                        <p class="text-[13px] font-semibold text-[#1F2533]">
                                            {{ $t('superadmin.agreements.form.installmentList') }}
                                        </p>
                                        <Tooltip :text="$t('superadmin.agreements.form.addInstallmentHelp')" position="left">
                                            <FormButton type="button" buttonStyle="action" buttonSize="xs"
                                                @click="addRow">
                                                <Icon name="ph:plus" class="w-4 h-4" aria-hidden="true" />
                                                {{ $t('superadmin.agreements.form.addInstallment') }}
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                    <p v-if="!form.installments.length" class="text-[12px] text-[#8891A4] py-2">
                                        {{ $t('superadmin.agreements.form.noInstallments') }}
                                    </p>
                                    <div v-for="(row, index) in form.installments" :key="index"
                                        class="grid grid-cols-12 gap-2 items-center mb-2">
                                        <span class="col-span-1 text-[12px] text-[#8891A4] text-center">{{ index + 1 }}</span>
                                        <input class="co-cell-input col-span-3" type="date" v-model="row.due_on"
                                            :disabled="row.locked" @input="markEdited"
                                            :aria-label="$t('superadmin.agreements.table.dueOn')" />
                                        <input class="co-cell-input col-span-3" type="number" step="0.01" min="0"
                                            v-model.number="row.amount" :disabled="row.locked" @input="markEdited"
                                            :aria-label="$t('superadmin.agreements.table.amount')" />
                                        <input class="co-cell-input col-span-3" type="text" v-model="row.label"
                                            :disabled="row.locked" @input="markEdited"
                                            :aria-label="$t('superadmin.agreements.table.label')" />
                                        <div class="col-span-2 flex justify-end">
                                            <Tooltip v-if="row.settledAt" :text="settledTooltip(row)" position="left" wrap>
                                                <span class="co-badge co-badge-gray">
                                                    <Icon name="ph:check-square" class="w-3 h-3" aria-hidden="true" />
                                                    {{ $t('superadmin.agreements.settled.chip') }}
                                                </span>
                                            </Tooltip>
                                            <Tooltip v-else-if="row.locked" :text="$t('superadmin.agreements.form.lockedRow')"
                                                position="left" wrap>
                                                <Icon name="ph:lock-simple" class="w-4 h-4 text-[#8891A4]"
                                                    :aria-label="$t('superadmin.agreements.form.lockedRow')" />
                                            </Tooltip>
                                            <Tooltip v-else :text="$t('superadmin.agreements.form.removeInstallment')"
                                                position="left">
                                                <button type="button" class="text-[#8891A4] hover:text-[#CC3B2D] p-1"
                                                    :aria-label="$t('superadmin.agreements.form.removeInstallment')"
                                                    @click="removeRow(index)">
                                                    <Icon name="ph:trash" class="w-4 h-4" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <!-- Sum check -->
                                    <Tooltip :text="$t('superadmin.agreements.form.sumCheckHelp')" position="top" wrap>
                                        <div class="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium"
                                            :class="sumOk ? 'bg-[#EDF7EE] text-[#1B6B1E]' : 'bg-[#FFF0F0] text-[#CC3B2D]'"
                                            role="status">
                                            <Icon :name="sumOk ? 'ph:check-circle' : 'ph:warning'" class="w-4 h-4"
                                                aria-hidden="true" />
                                            <span v-if="sumOk">
                                                {{ $t('superadmin.agreements.form.sumOk', { sum: formatAmount(listSum, 'DKK') }) }}
                                            </span>
                                            <span v-else>
                                                {{ $t('superadmin.agreements.form.sumMismatch', {
                                                    sum: formatAmount(listSum, 'DKK'),
                                                    value: formatAmount(Number(form.contract_value) || 0, 'DKK'),
                                                    diff: formatAmount(listDiff, 'DKK'),
                                                }) }}
                                            </span>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </section>

                        <!-- Live preview from the server -->
                        <section class="border border-[#EAECF0] rounded-xl overflow-hidden">
                            <div class="flex items-center justify-between px-4 py-2.5 bg-[#F9FAFB] border-b border-[#EAECF0]">
                                <div class="flex items-center gap-1.5">
                                    <p class="text-[13px] font-semibold text-[#1F2533]">
                                        {{ $t('superadmin.agreements.form.previewTitle') }}
                                    </p>
                                    <Tooltip :text="$t('superadmin.agreements.help.preview')" position="top" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7]"
                                            :aria-label="$t('superadmin.agreements.help.preview')" />
                                    </Tooltip>
                                </div>
                                <Icon v-if="preview.isLoading" name="ph:spinner"
                                    class="w-4 h-4 text-[#42AED9] animate-spin" aria-hidden="true" />
                            </div>
                            <div v-if="preview.meta && preview.rows.length"
                                class="flex flex-wrap gap-2 px-4 py-2.5 border-b border-[#F5F6F8]">
                                <Tooltip :text="$t('superadmin.agreements.preview.endsOnHelp')" position="top" wrap>
                                    <span class="co-badge co-badge-gray">
                                        {{ $t('superadmin.agreements.preview.endsOn', { date: formatDateToReadable(preview.meta.ends_on ?? '') }) }}
                                    </span>
                                </Tooltip>
                                <Tooltip :text="$t('superadmin.agreements.help.noticeMonths')" position="top" wrap>
                                    <span class="co-badge co-badge-gray">
                                        {{ $t('superadmin.agreements.preview.noticeDeadline', { date: formatDateToReadable(preview.meta.notice_deadline ?? '') }) }}
                                    </span>
                                </Tooltip>
                                <Tooltip :text="$t('superadmin.agreements.help.mrrArr')" position="top" wrap>
                                    <span class="co-badge co-badge-navy">
                                        {{ $t('superadmin.agreements.preview.mrrArr', {
                                            mrr: formatAmount(preview.meta.contract_mrr ?? 0, 'DKK'),
                                            arr: formatAmount(preview.meta.contract_arr ?? 0, 'DKK') }) }}
                                    </span>
                                </Tooltip>
                            </div>
                            <p v-if="preview.error" class="px-4 py-3 text-[12px] text-[#CC3B2D]">{{ preview.error }}</p>
                            <p v-else-if="!preview.rows.length" class="px-4 py-4 text-[12px] text-[#8891A4]">
                                {{ $t('superadmin.agreements.form.previewEmpty') }}
                            </p>
                            <table v-else class="w-full text-[13px]">
                                <thead>
                                    <tr class="text-left text-[11px] uppercase text-[#5C6478]">
                                        <th class="px-4 py-2">#</th>
                                        <th class="px-4 py-2">{{ $t('superadmin.agreements.table.dueOn') }}</th>
                                        <th class="px-4 py-2">{{ $t('superadmin.agreements.table.label') }}</th>
                                        <th class="px-4 py-2 text-right">{{ $t('superadmin.agreements.table.amount') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(row, i) in preview.rows" :key="i" class="border-t border-[#F5F6F8]">
                                        <td class="px-4 py-2 text-[#8891A4]">{{ i + 1 }}</td>
                                        <td class="px-4 py-2">{{ formatDateToReadable(row.due_on) }}</td>
                                        <td class="px-4 py-2 text-[#5C6478]">{{ row.label }}</td>
                                        <td class="px-4 py-2 text-right font-medium">{{ formatAmount(row.amount, 'DKK') }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="$emit('close')">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="!canSubmit">
                                {{ $t('superadmin.agreements.form.save') }}
                            </FormButton>
                        </div>
                    </form>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { agreementService } from '@/components/api/superadmin/AgreementService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import {
    buildAgreementPayload,
    buildPresetInstallments,
    installmentsDifference,
    installmentsMatchContract,
    installmentsSum,
    unwrapData,
    unwrapPreview,
    type AgreementFormState,
} from '@/composables/agreements'
import type { Agreement, BillingPlan, InstallmentInput, SchedulePreview } from '@/types/agreement'
import type { Error } from '@/types'

type Row = InstallmentInput & { locked?: boolean; settledNote?: string | null; settledAt?: string | null }

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    companyUuid: { type: String, required: true },
    /** Present when editing. */
    agreement: { type: Object as () => Agreement | null, default: null },
})
const emit = defineEmits(['close', 'saved'])

const { t } = useI18n()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()

const plans: BillingPlan[] = ['monthly', 'yearly', 'prepaid_multi_year', 'installments']

const state = reactive({ isSaving: false, error: {} as Error })
const preview = reactive({ rows: [] as InstallmentInput[], meta: null as SchedulePreview | null, isLoading: false, error: '' })

function blankForm(): AgreementFormState & { installments: Row[] } {
    return {
        name: '',
        starts_on: moment().format('YYYY-MM-DD'),
        term_months: 12,
        notice_months: 3,
        auto_renews: true,
        billing_plan: 'yearly',
        prepaid_years: null,
        contract_value: '',
        fee_per_invoice: 0,
        payment_method: 'bank_transfer',
        internal_note: '',
        settled_externally_before: '',
        settled_note: '',
        preset: { upfront_percent: 30, remaining_count: 3, remaining_interval_months: 12 },
        installments: [],
        installmentsEdited: false,
        presetApplied: false,
    }
}

const form = reactive(blankForm())

const hasLockedRows = computed(() => form.installments.some((row: Row) => row.locked))
const listSum = computed(() => installmentsSum(form.installments))
const listDiff = computed(() => installmentsDifference(form.installments, Number(form.contract_value) || 0))
const sumOk = computed(() => installmentsMatchContract(form.installments, Number(form.contract_value) || 0))

const previewReady = computed(() =>
    !!form.starts_on && Number(form.term_months) > 0 && Number(form.contract_value) > 0
    && (form.billing_plan !== 'prepaid_multi_year' || Number(form.prepaid_years) > 0)
    && (form.billing_plan !== 'installments' || form.installments.length > 0)
)

const canSubmit = computed(() =>
    form.name.trim().length > 0
    && previewReady.value
    && (form.billing_plan !== 'installments' || sumOk.value)
)

function resetFromProps() {
    state.error = {}
    preview.rows = []
    preview.meta = null
    preview.error = ''
    Object.assign(form, blankForm())
    const a = props.agreement
    if (!a) return
    Object.assign(form, {
        name: a.name,
        starts_on: a.starts_on,
        term_months: a.term_months,
        notice_months: a.notice_months,
        auto_renews: a.auto_renews,
        billing_plan: a.billing_plan,
        prepaid_years: a.prepaid_years,
        contract_value: a.contract_value,
        fee_per_invoice: a.fee_per_invoice,
        payment_method: a.payment_method,
        internal_note: a.internal_note ?? '',
        settled_externally_before: a.settled_externally_before ?? '',
        settled_note: a.settled_note ?? '',
        installments: a.billing_plan === 'installments'
            ? (a.installments ?? []).map((row) => ({
                due_on: row.due_on,
                amount: row.amount,
                label: row.label,
                // An installment that already has an invoice, or was settled
                // outside CitizenOne, is history.
                locked: !!row.invoice || !!row.settled_externally_at,
                settledAt: row.settled_externally_at,
                settledNote: row.settled_note,
            }))
            : [],
    })
}

watch(() => props.isModalOpen, (open: boolean) => { if (open) resetFromProps() })

function label(sequence: number, total: number, upfront: number | null): string {
    return upfront !== null
        ? t('superadmin.agreements.form.presetLabelUpfront', { n: sequence, total, percent: upfront })
        : t('superadmin.agreements.form.presetLabel', { n: sequence, total })
}

function applyPreset() {
    if (hasLockedRows.value) return
    form.installments = buildPresetInstallments(
        Number(form.contract_value) || 0,
        form.starts_on,
        {
            upfront_percent: Number(form.preset.upfront_percent),
            remaining_count: Number(form.preset.remaining_count),
            remaining_interval_months: Number(form.preset.remaining_interval_months),
        },
        label,
    )
    form.presetApplied = true
    form.installmentsEdited = false
}

function settledTooltip(row: Row): string {
    return row.settledNote
        ? t('superadmin.agreements.settled.helpWithNote', { note: row.settledNote })
        : t('superadmin.agreements.settled.help')
}

function markEdited() { form.installmentsEdited = true }

function addRow() {
    const last = form.installments[form.installments.length - 1]
    form.installments.push({
        due_on: last ? moment(last.due_on).add(12, 'months').format('YYYY-MM-DD') : form.starts_on,
        amount: Math.max(0, listDiff.value),
        label: null,
    })
    markEdited()
}

function removeRow(index: number) {
    form.installments.splice(index, 1)
    markEdited()
}

// Live schedule preview, from the server so it matches what will be saved.
let previewTimer: any = null
let previewSeq = 0
watch(
    () => JSON.stringify(buildAgreementPayload(form)),
    () => {
        clearTimeout(previewTimer)
        if (!props.isModalOpen || !previewReady.value) {
            preview.rows = []
            preview.meta = null
            preview.error = ''
            return
        }
        previewTimer = setTimeout(runPreview, 400)
    },
)

async function runPreview() {
    const seq = ++previewSeq
    preview.isLoading = true
    preview.error = ''
    try {
        const response = await agreementService.previewSchedule(buildAgreementPayload(form))
        if (seq !== previewSeq) return
        const result = unwrapPreview(response)
        preview.rows = result.installments
        preview.meta = result
    } catch (error: any) {
        if (seq !== previewSeq) return
        preview.rows = []
        preview.meta = null
        preview.error = error?.message ?? ''
    }
    if (seq === previewSeq) preview.isLoading = false
}

async function submit() {
    if (!canSubmit.value) return
    state.error = {}
    state.isSaving = true
    try {
        const payload = buildAgreementPayload(form)
        const response = props.agreement
            ? await agreementService.updateAgreement(props.agreement.uuid, payload)
            : await agreementService.createAgreement(props.companyUuid, payload)
        emit('saved', unwrapData(response))
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
