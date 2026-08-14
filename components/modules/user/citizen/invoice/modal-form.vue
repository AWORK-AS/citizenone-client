<template>
    <Modal size="2xl" :title="$t('citizens.invoices.newTitle')" :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <div class="space-y-5">
                <Alert type="danger" :text="state.error" v-if="state.error" />

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="issued_at" :label="$t('citizens.invoices.form.issuedAt')" />
                        <FormDateField id="issued_at" name="issued_at" v-model="state.form.issued_at"
                            :placeholder="$t('citizens.invoices.form.issuedAt')" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="due_at" :label="$t('citizens.invoices.form.dueAt')" />
                        <FormDateField id="due_at" name="due_at" v-model="state.form.due_at"
                            :placeholder="$t('citizens.invoices.form.dueAt')" />
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <FormLabel for="lines" :label="$t('citizens.invoices.form.lines')" />
                        <FormButton buttonStyle="action" buttonSize="xs" @click="addLine">
                            <Icon name="ph:plus" class="size-4" />
                            {{ $t('citizens.invoices.form.addLine') }}
                        </FormButton>
                    </div>

                    <p class="text-xs text-gray-500" v-if="!props.services.length">
                        {{ $t('citizens.invoices.form.noServices') }}
                    </p>

                    <div class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead>
                                <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                                    <th class="py-1 pr-2 w-48">{{ $t('citizens.invoices.form.service') }}</th>
                                    <th class="py-1 pr-2">{{ $t('citizens.invoices.form.description') }}</th>
                                    <th class="py-1 pr-2 w-20">{{ $t('citizens.invoices.form.quantity') }}</th>
                                    <th class="py-1 pr-2 w-28">{{ unitPriceLabel }}</th>
                                    <th class="py-1 pr-2 w-20">{{ $t('citizens.invoices.form.vat') }}</th>
                                    <th class="py-1 pr-2 w-28">{{ $t('citizens.invoices.form.subsidy') }}</th>
                                    <th class="py-1 pr-2 w-28 text-right">{{ $t('citizens.invoices.form.lineTotal') }}</th>
                                    <th class="py-1 w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(line, index) in state.form.lines" :key="index" class="align-top">
                                    <td class="py-1 pr-2">
                                        <FormSelect :id="`service-${index}`" :options="serviceOptions"
                                            v-model="line.service_uuid" @change="applyService(line)"
                                            :placeholder="$t('citizens.invoices.form.freeLine')" />
                                    </td>
                                    <td class="py-1 pr-2">
                                        <FormTextField :id="`description-${index}`" :name="`description-${index}`"
                                            v-model="line.description"
                                            :placeholder="$t('citizens.invoices.form.description')" />
                                    </td>
                                    <td class="py-1 pr-2">
                                        <FormNumberField :name="`quantity-${index}`" :min="0" v-model="line.quantity"
                                            :placeholder="$t('citizens.invoices.form.quantity')" />
                                    </td>
                                    <td class="py-1 pr-2">
                                        <FormNumberField :name="`unit-price-${index}`" :min="0"
                                            v-model="line.unit_price"
                                            :placeholder="$t('citizens.invoices.form.unitPrice')" />
                                    </td>
                                    <td class="py-1 pr-2">
                                        <FormNumberField :name="`vat-${index}`" :min="0" v-model="line.vat_rate"
                                            :placeholder="$t('citizens.invoices.form.vat')" />
                                    </td>
                                    <td class="py-1 pr-2">
                                        <FormNumberField :name="`subsidy-${index}`" :min="0"
                                            v-model="line.subsidy_amount"
                                            :placeholder="$t('citizens.invoices.form.subsidy')" />
                                    </td>
                                    <td class="py-1 pr-2 pt-3 text-right tabular-nums">
                                        {{ formatAmount(lineTotal(line)) }}
                                    </td>
                                    <td class="py-1 pt-3">
                                        <button type="button" class="text-gray-400 hover:text-red-600"
                                            :aria-label="$t('delete')" @click="removeLine(index)">
                                            <Icon name="ph:trash" class="size-4" />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="flex justify-end">
                    <dl class="w-full sm:w-72 text-sm space-y-1">
                        <div class="flex justify-between">
                            <dt class="text-gray-500">{{ $t('citizens.invoices.net') }}</dt>
                            <dd class="tabular-nums">{{ formatAmount(totals.net) }}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-gray-500">{{ $t('citizens.invoices.vat') }}</dt>
                            <dd class="tabular-nums">{{ formatAmount(totals.vat) }}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-gray-500">{{ $t('citizens.invoices.subsidy') }}</dt>
                            <dd class="tabular-nums">- {{ formatAmount(totals.subsidy) }}</dd>
                        </div>
                        <div class="flex justify-between border-t border-gray-300 pt-1 font-semibold">
                            <dt>{{ $t('citizens.invoices.toPay') }}</dt>
                            <dd class="tabular-nums">{{ formatAmount(totals.total) }}</dd>
                        </div>
                    </dl>
                </div>

                <div class="space-y-1">
                    <FormLabel for="note" :label="$t('citizens.invoices.form.note')" />
                    <FormTextArea id="note" name="note" :rows="3" v-model="state.form.note"
                        :placeholder="$t('citizens.invoices.form.notePlaceholder')" />
                </div>

                <div class="flex items-center justify-end gap-2 pt-2">
                    <FormButton buttonStyle="action" @click="emit('close')" :disabled="state.isSaving">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="save" :disabled="state.isSaving">
                        {{ $t('save') }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { citizenInvoiceService } from '@/components/api/user/CitizenInvoiceService'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    isModalOpen: boolean
    citizenUuid: string
    services: any[]
    settings?: { default_vat_rate?: number; prices_include_vat?: boolean }
}>()

const emit = defineEmits<{ (event: 'saved'): void; (event: 'close'): void }>()

const { t, locale } = useI18n()

const state = reactive({
    form: emptyForm(),
    isSaving: false,
    error: '',
})

function emptyForm() {
    return { issued_at: '', due_at: '', note: '', lines: [newLine()] }
}

function newLine() {
    return {
        service_uuid: null,
        description: '',
        quantity: '1',
        unit_price: '',
        // A free line inherits the company rate; picking a service overwrites
        // it with whatever the catalogue says.
        vat_rate: String(props.settings?.default_vat_rate ?? 0),
        subsidy_amount: '',
    }
}

const pricesIncludeVat = computed(() => !!props.settings?.prices_include_vat)

const unitPriceLabel = computed(() => pricesIncludeVat.value
    ? t('services.form.unitPriceIncl')
    : t('citizens.invoices.form.unitPrice'))

// With VAT-inclusive prices the typed amount already holds the VAT, so the
// net is taken back out of it. This mirrors what the server stores.
function netOf(line: any): number {
    const amount = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0)
    const rate = Number(line.vat_rate) || 0

    return pricesIncludeVat.value && rate > 0 ? amount / (1 + rate / 100) : amount
}

const serviceOptions = computed(() => (props.services || []).map((service: any) => ({
    value: service.uuid,
    label: service.code ? `${service.code} · ${service.name}` : service.name,
})))

// Picking a service fills the line with what the catalogue says, and the price
// can still be corrected on the spot.
function applyService(line: any) {
    const service = (props.services || []).find((item: any) => item.uuid === line.service_uuid)

    if (!service) return

    line.description = service.name
    line.unit_price = String(service.unit_price ?? '')
    line.vat_rate = String(service.vat_rate ?? 0)
    line.subsidy_amount = service.default_subsidy ? String(service.default_subsidy) : ''
}

function lineTotal(line: any): number {
    const net = netOf(line)

    return net + net * ((Number(line.vat_rate) || 0) / 100)
}

const totals = computed(() => {
    let net = 0
    let vat = 0
    let subsidy = 0

    for (const line of state.form.lines) {
        const lineNet = netOf(line)
        net += lineNet
        vat += lineNet * ((Number(line.vat_rate) || 0) / 100)
        subsidy += Number(line.subsidy_amount) || 0
    }

    return { net, vat, subsidy, total: Math.max(net + vat - subsidy, 0) }
})

function formatAmount(amount: number): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount || 0)
}

function addLine() {
    state.form.lines.push(newLine())
}

function removeLine(index: number) {
    state.form.lines.splice(index, 1)

    if (state.form.lines.length === 0) addLine()
}

async function save() {
    state.error = ''

    const lines = state.form.lines
        .filter((line: any) => line.service_uuid || (line.description || '').trim() !== '')
        .map((line: any) => ({
            service_uuid: line.service_uuid || null,
            description: line.description || null,
            quantity: Number(line.quantity) || 1,
            unit_price: line.unit_price === '' ? null : Number(line.unit_price),
            vat_rate: Number(line.vat_rate) || 0,
            subsidy_amount: Number(line.subsidy_amount) || 0,
        }))

    if (lines.length === 0) {
        state.error = t('citizens.invoices.form.needsALine')

        return
    }

    state.isSaving = true

    try {
        await citizenInvoiceService.createInvoice(props.citizenUuid, {
            issued_at: state.form.issued_at || null,
            due_at: state.form.due_at || null,
            note: state.form.note || null,
            lines,
        })

        emit('saved')
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (isOpen) {
        state.form = emptyForm()
        state.error = ''
    }
})
</script>
