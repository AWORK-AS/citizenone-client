<template>
    <div class="bg-white border border-surface-200 rounded-xl shadow-sm overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-surface-200 bg-slate-50">
            <div>
                <p class="text-sm font-semibold text-slate-900">{{ $t('socialWelfare.invoices.title') }}</p>
                <p class="text-[13px] text-slate-400">{{ $t('socialWelfare.invoices.subtitle') }}</p>
            </div>
            <div class="flex items-center gap-2">
                <button type="button" v-for="option in statusOptions" :key="option.value" @click="setStatus(option.value)"
                    class="rounded-full border px-3 py-1 text-[13px] transition"
                    :class="state.status === option.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'">
                    {{ option.label }}
                </button>
            </div>
        </div>

        <Alert class="m-4" type="danger" :text="state.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <!-- Mass actions on whatever is ticked -->
        <div v-if="state.selected.length" class="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-surface-200 bg-primary/5">
            <span class="text-sm text-slate-700">{{ $t('socialWelfare.invoices.selected', { count: state.selected.length }) }}</span>
            <FormButton buttonStyle="action" :disabled="state.isWorking" @click="run('mark_sent')">
                <Icon name="ph:check" class="w-4 h-4" />
                {{ $t('socialWelfare.invoices.markSent') }}
            </FormButton>
            <FormButton buttonStyle="action" :disabled="state.isWorking" @click="run('mark_unsent')">
                <Icon name="ph:arrow-counter-clockwise" class="w-4 h-4" />
                {{ $t('socialWelfare.invoices.markUnsent') }}
            </FormButton>
            <div class="flex items-center gap-2">
                <input type="email" class="co-cell-input w-56" v-model="state.recipient"
                    :placeholder="$t('socialWelfare.invoices.recipientPlaceholder')" />
                <FormButton buttonStyle="primary" :disabled="state.isWorking" @click="run('send_email')">
                    <Icon name="ph:paper-plane-tilt" class="w-4 h-4" />
                    {{ $t('socialWelfare.invoices.sendEmail') }}
                </FormButton>
            </div>
            <FormButton v-if="state.economicAvailable" buttonStyle="action" :disabled="state.isWorking" @click="run('push_economic')">
                <Icon name="ph:upload-simple" class="w-4 h-4" />
                {{ $t('socialWelfare.invoices.pushEconomic') }}
            </FormButton>
            <FormButton v-if="state.dineroAvailable" buttonStyle="action" :disabled="state.isWorking" @click="run('push_dinero')">
                <Icon name="ph:upload-simple" class="w-4 h-4" />
                {{ $t('socialWelfare.invoices.pushDinero') }}
            </FormButton>
        </div>

        <LoadingSpinner :isActive="state.isLoading">
            <p v-if="!state.invoices.length" class="px-5 py-8 text-center text-sm text-slate-400">
                {{ $t('socialWelfare.invoices.empty') }}
            </p>
            <div v-else class="overflow-x-auto">
                <table class="w-full">
                    <thead class="border-b border-surface-200">
                        <tr>
                            <th class="co-th w-10">
                                <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                    :checked="allSelected" :title="$t('socialWelfare.billing.selectAll')"
                                    @change="toggleAll(($event.target as HTMLInputElement).checked)" />
                            </th>
                            <th class="co-th">{{ $t('socialWelfare.invoices.number') }}</th>
                            <th class="co-th">{{ $t('socialWelfare.invoices.billTo') }}</th>
                            <th class="co-th">{{ $t('socialWelfare.invoices.interventions') }}</th>
                            <th class="co-th">{{ $t('socialWelfare.invoices.due') }}</th>
                            <th class="co-th text-right">{{ $t('socialWelfare.billing.amount') }}</th>
                            <th class="co-th">{{ $t('socialWelfare.invoices.status') }}</th>
                            <th class="co-th"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="invoice in state.invoices" :key="invoice.uuid" class="border-b border-surface-200 last:border-0 text-[13px]">
                            <td class="co-td">
                                <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                    :value="invoice.uuid" v-model="state.selected" />
                            </td>
                            <td class="co-td font-medium text-slate-900 tabular-nums">{{ invoice.invoice_number }}</td>
                            <td class="co-td">
                                <p class="text-slate-900">{{ invoice.bill_to_name }}</p>
                                <p class="text-[12px] text-slate-400">
                                    {{ [invoice.ean_number ? `EAN ${invoice.ean_number}` : null, invoice.recipient_email].filter(Boolean).join(' · ') }}
                                </p>
                            </td>
                            <td class="co-td text-slate-500">{{ (invoice.citizen_names ?? []).join(', ') || '-' }}</td>
                            <td class="co-td text-slate-500 tabular-nums">{{ invoice.due_date || '-' }}</td>
                            <td class="co-td text-right text-slate-900 tabular-nums">{{ formatAmount(invoice.total_amount) }}</td>
                            <td class="co-td">
                                <span v-if="invoice.sent_at" class="co-badge co-badge-green text-[11px]">
                                    {{ $t('socialWelfare.invoices.sent') }}
                                </span>
                                <span v-else class="text-slate-400">{{ $t('socialWelfare.invoices.notSent') }}</span>
                                <p v-if="invoice.sent_to" class="text-[11px] text-slate-400">{{ invoice.sent_to }}</p>
                                <p v-if="state.failures[invoice.uuid]" class="text-[11px] text-red-600">{{ state.failures[invoice.uuid] }}</p>
                            </td>
                            <td class="co-td text-right">
                                <button type="button" class="text-slate-400 hover:text-primary transition"
                                    :title="$t('socialWelfare.invoices.download')" @click="download(invoice)">
                                    <Icon name="ph:file-pdf" class="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { documentBlobViewer } from '@/composables/documentBlobViewer'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { formatAmount } = useAmountFormatter()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { openBlobInNewTab } = documentBlobViewer()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isWorking: false,
    status: 'unsent',
    invoices: [] as any[],
    selected: [] as string[],
    recipient: '',
    economicAvailable: false,
    dineroAvailable: false,
    failures: {} as Record<string, string>,
})

const statusOptions = computed(() => [
    { value: 'unsent', label: t('socialWelfare.invoices.filterUnsent') },
    { value: 'sent', label: t('socialWelfare.invoices.filterSent') },
    { value: 'all', label: t('socialWelfare.invoices.filterAll') },
])

const allSelected = computed(() =>
    state.invoices.length > 0 && state.invoices.every((invoice: any) => state.selected.includes(invoice.uuid))
)

function toggleAll(checked: boolean) {
    state.selected = checked ? state.invoices.map((invoice: any) => invoice.uuid) : []
}

function setStatus(status: string) {
    state.status = status
    refresh()
}

async function refresh() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await socialWelfareService.getClientInvoices({ status: state.status })
        state.invoices = response?.data ?? []
        state.economicAvailable = Boolean(response?.economic_available)
        state.dineroAvailable = Boolean(response?.dinero_available)
        state.selected = state.selected.filter(uuid => state.invoices.some((invoice: any) => invoice.uuid === uuid))
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

// Each invoice is reported on its own, so the ones that went through are not
// held back by one without a recipient.
async function run(action: string) {
    state.error = {} as Error
    state.isWorking = true
    state.failures = {}
    try {
        const response = await socialWelfareService.bulkClientInvoices({
            action,
            invoice_uuids: state.selected,
            recipient: action === 'send_email' && state.recipient ? state.recipient : null,
        })

        for (const result of response?.results ?? []) {
            if (!result.ok) {
                state.failures[result.uuid] = result.message || t(`socialWelfare.invoices.reasons.${result.reason ?? 'error'}`)
            }
        }

        if (response?.failed > 0) {
            errorAlert(`${t('alert.error')}!`, t('socialWelfare.invoices.partial', { ok: response.succeeded, failed: response.failed }))
        } else {
            successAlert(`${t('alert.success')}!`, t('socialWelfare.invoices.done', { count: response?.succeeded ?? 0 }))
            state.selected = []
        }

        const failures = { ...state.failures }
        await refresh()
        state.failures = failures
    } catch (error: any) {
        state.error = error
    }
    state.isWorking = false
}

async function download(invoice: any) {
    try {
        const blob = await socialWelfareService.downloadClientInvoice(invoice.uuid)
        if (blob) openBlobInNewTab(blob)
    } catch (error: any) {
        state.error = error
    }
}

onMounted(refresh)

defineExpose({ refresh })
</script>
