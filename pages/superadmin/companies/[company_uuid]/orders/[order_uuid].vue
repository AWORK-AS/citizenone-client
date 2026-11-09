<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companyOrders.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.companyOrders.title') }}</template>

            <div class="p-1 space-y-4">
                <ModulesSuperadminCompanyHeader />

                <NuxtLink :to="`/superadmin/companies/${companyUuid}/license-overview`"
                    class="inline-flex items-center gap-1 text-[12px] text-secondary hover:underline">
                    <Icon name="ph:arrow-left" class="w-3.5 h-3.5" aria-hidden="true" />
                    {{ $t('superadmin.companyOrders.back') }}
                </NuxtLink>

                <LoadingSpinner :isActive="state.loading && !order">
                    <Alert v-if="state.error" type="danger" :text="state.error" />

                    <div v-if="order" class="space-y-4">
                        <!-- Header: status and e-conomic -->
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div class="flex items-center gap-2">
                                    <h2 class="text-[18px] font-light text-ink">{{ $t('superadmin.companyOrders.title') }}</h2>
                                    <ModulesSuperadminStatusPill :variant="orderStatusVariant(order.status)"
                                        :label="$t(orderStatusKey(order.status))" data-testid="order-status" />
                                </div>
                                <p class="text-[12px] text-ink-muted mt-1">
                                    {{ $t('superadmin.companyOrders.createdBy', {
                                        name: order.created_by?.name || order.created_by?.email || '—',
                                        date: formatDate(order.created_at) }) }}
                                    <template v-if="order.completed_at">
                                        · {{ $t('superadmin.companyOrders.completedBy', {
                                            name: order.completed_by?.name || order.completed_by?.email || '—',
                                            date: formatDate(order.completed_at) }) }}
                                    </template>
                                </p>
                            </div>
                            <div class="text-right">
                                <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">e-conomic</p>
                                <p class="text-[13px] text-ink" data-testid="order-economic">{{ economicText }}</p>
                                <NuxtLink v-if="order.invoice" :to="`/superadmin/invoices/${order.invoice.uuid}/invoice-details`"
                                    class="text-[12px] font-mono text-secondary hover:underline">
                                    {{ $t('superadmin.companyOrders.invoice', { number: order.invoice.invoice_number }) }}
                                </NuxtLink>
                            </div>
                        </div>

                        <Alert v-if="order.company_refusal" type="danger" :text="refusalText" />
                        <Alert v-else-if="order.quote_error" type="danger" :text="order.quote_error.message" />

                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <!-- Lines -->
                            <section class="lg:col-span-2 bg-white border border-line rounded-xl shadow-sm">
                                <div class="px-5 py-4 border-b border-line flex flex-wrap items-end justify-between gap-3">
                                    <h3 class="text-[13px] font-semibold text-ink">{{ $t('superadmin.companyOrders.lines') }}</h3>
                                    <div v-if="isDraft" class="w-full sm:w-80">
                                        <FormLabel for="order_term" :label="$t('superadmin.companies.licenseOverview.grant.term.label')" />
                                        <select id="order_term" :value="order.term" @change="onTermChange" :disabled="state.saving"
                                            data-testid="order-term"
                                            class="w-full text-sm border border-line rounded-lg px-2 py-1.5 bg-white text-ink outline-none focus:border-accent">
                                            <option v-for="option in termOptions" :key="option.value" :value="option.value">
                                                {{ $t(option.labelKey, option.params) }}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <table class="w-full text-[13px]">
                                    <thead>
                                        <tr class="text-left text-[11px] uppercase tracking-wide text-ink-muted">
                                            <th class="px-5 py-2 font-semibold">{{ $t('superadmin.companyOrders.col.product') }}</th>
                                            <th class="px-3 py-2 font-semibold text-right">{{ $t('superadmin.companyOrders.col.quantity') }}</th>
                                            <th class="px-3 py-2 font-semibold text-right">{{ $t('superadmin.companyOrders.col.unitPrice') }}</th>
                                            <th class="px-3 py-2 font-semibold text-right">{{ $t('superadmin.companyOrders.col.amount') }}</th>
                                            <th class="px-5 py-2"><span class="sr-only">{{ $t('superadmin.companyOrders.remove') }}</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-if="!order.lines.length">
                                            <td colspan="5" class="px-5 py-8 text-center text-ink-muted">{{ $t('superadmin.companyOrders.noLines') }}</td>
                                        </tr>
                                        <template v-for="line in order.lines" :key="line.uuid">
                                            <tr class="border-t border-surface-canvas" :data-testid="`order-line-${line.uuid}`">
                                                <td class="px-5 py-2.5">
                                                    <p class="font-medium text-ink">{{ line.name }}</p>
                                                    <p v-if="line.discount_percent > 0" class="text-[11px] text-ink-muted" data-testid="order-line-discount-reason">
                                                        {{ $t('superadmin.companyOrders.discount.reasonLine', { percent: discountLabel(line.discount_percent), reason: line.discount_reason }) }}
                                                        <template v-if="line.discount_on_renewal"> · {{ $t('superadmin.companyOrders.discount.keptOnRenewal') }}</template>
                                                    </p>
                                                    <p v-if="quoteLine(line.uuid)?.free" class="text-[11px] text-ink-muted">
                                                        {{ $t('superadmin.companies.licenseOverview.grant.billingBox.included', { count: quoteLine(line.uuid)?.free }) }}
                                                    </p>
                                                    <p v-if="quoteLine(line.uuid)?.period_to" class="text-[11px] text-ink-muted">
                                                        {{ formatDate(quoteLine(line.uuid)?.period_from) }} – {{ formatDate(quoteLine(line.uuid)?.period_to) }}
                                                    </p>
                                                </td>
                                                <td class="px-3 py-2.5 text-right">
                                                    <input v-if="isDraft" type="number" min="1" max="1000" :value="line.quantity"
                                                        :aria-label="$t('superadmin.companyOrders.col.quantity')"
                                                        :disabled="state.saving" @change="onQuantityChange(line, $event)"
                                                        class="w-20 text-right text-sm border border-line rounded-lg px-2 py-1 outline-none focus:border-accent" />
                                                    <span v-else class="tabular-nums">{{ line.quantity }}</span>
                                                </td>
                                                <td class="px-3 py-2.5 text-right tabular-nums">
                                                    <template v-if="quoteLine(line.uuid)?.discount_percent > 0 && quoteLine(line.uuid)?.paid > 0">
                                                        <span class="block text-[11px] text-ink-muted line-through" data-testid="order-line-list-price">{{ dkk(quoteLine(line.uuid)?.list_unit_price) }}</span>
                                                        <span class="block">
                                                            <span class="text-[11px] font-semibold text-info-ink">−{{ discountLabel(quoteLine(line.uuid)?.discount_percent) }} %</span>
                                                            {{ dkk(quoteLine(line.uuid)?.unit_price) }}
                                                        </span>
                                                    </template>
                                                    <template v-else>{{ dkk(quoteLine(line.uuid)?.unit_price) }}</template>
                                                </td>
                                                <td class="px-3 py-2.5 text-right tabular-nums">{{ dkk(quoteLine(line.uuid)?.amount) }}</td>
                                                <td class="px-5 py-2.5 text-right whitespace-nowrap">
                                                    <button v-if="isDraft && canManage" type="button" :disabled="state.saving" @click="openDiscount(line)"
                                                        :aria-expanded="state.discount.lineUuid === line.uuid"
                                                        :aria-label="$t(line.discount_percent > 0 ? 'superadmin.companyOrders.discount.edit' : 'superadmin.companyOrders.discount.give')"
                                                        :title="$t(line.discount_percent > 0 ? 'superadmin.companyOrders.discount.edit' : 'superadmin.companyOrders.discount.give')"
                                                        class="mr-2 text-ink-muted hover:text-info" data-testid="order-line-discount">
                                                        <Icon name="ph:tag" class="w-4 h-4" aria-hidden="true" />
                                                    </button>
                                                    <button v-if="isDraft" type="button" :disabled="state.saving" @click="removeLine(line)"
                                                        :aria-label="$t('superadmin.companyOrders.remove')"
                                                        class="text-ink-muted hover:text-danger">
                                                        <Icon name="ph:trash" class="w-4 h-4" aria-hidden="true" />
                                                    </button>
                                                </td>
                                            </tr>
                                            <!-- Inline discount editor: percent and a required reason -->
                                            <tr v-if="isDraft && canManage && state.discount.lineUuid === line.uuid" class="bg-surface-canvas"
                                                data-testid="order-discount-editor">
                                                <td colspan="5" class="px-5 py-3">
                                                    <div class="flex flex-wrap items-start gap-3">
                                                        <div class="w-28">
                                                            <FormLabel :for="`discount_percent_${line.uuid}`" :label="$t('superadmin.companyOrders.discount.percent')" />
                                                            <input :id="`discount_percent_${line.uuid}`" type="number" min="0" :max="maxDiscount" step="0.01"
                                                                v-model="state.discount.percent"
                                                                class="w-full text-sm text-right border border-line rounded-lg px-2 py-1.5 bg-white outline-none focus:border-accent" />
                                                        </div>
                                                        <div class="flex-1 min-w-[14rem]">
                                                            <FormLabel :for="`discount_reason_${line.uuid}`" :label="$t('superadmin.companyOrders.discount.reason')" />
                                                            <textarea :id="`discount_reason_${line.uuid}`" rows="2" maxlength="500" v-model="state.discount.reason"
                                                                :placeholder="$t('superadmin.companyOrders.discount.reasonPlaceholder')"
                                                                class="w-full text-sm border border-line rounded-lg px-2 py-1.5 bg-white text-ink outline-none focus:border-accent resize-none"></textarea>
                                                        </div>
                                                    </div>
                                                    <label class="mt-2 inline-flex items-center gap-2 text-[12px] text-ink-body">
                                                        <input type="checkbox" v-model="state.discount.onRenewal" class="rounded border-line text-accent focus:ring-accent" />
                                                        {{ $t('superadmin.companyOrders.discount.onRenewal') }}
                                                    </label>
                                                    <p class="text-[11px] text-ink-muted mt-1">
                                                        {{ $t('superadmin.companyOrders.discount.hint', { max: discountLabel(maxDiscount) }) }}
                                                        <template v-if="discountPreview !== null"> · {{ $t('superadmin.companyOrders.discount.preview', { price: dkk(discountPreview) }) }}</template>
                                                    </p>
                                                    <p v-if="discountErrorText" class="text-[12px] text-danger-ink mt-1" role="alert">{{ discountErrorText }}</p>
                                                    <div class="mt-3 flex flex-wrap gap-2">
                                                        <FormButton buttonStyle="action" :disabled="!discountBody || state.saving" @click="saveDiscount(line)">
                                                            {{ $t('superadmin.companyOrders.discount.save') }}
                                                        </FormButton>
                                                        <FormButton v-if="line.discount_percent > 0" buttonStyle="danger" :disabled="state.saving" @click="removeDiscount(line)">
                                                            {{ $t('superadmin.companyOrders.discount.remove') }}
                                                        </FormButton>
                                                        <FormButton buttonStyle="link" :disabled="state.saving" @click="closeDiscount">
                                                            {{ $t('superadmin.companyOrders.discount.close') }}
                                                        </FormButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        </template>
                                    </tbody>
                                </table>

                                <!-- Add a product -->
                                <div v-if="isDraft && !order.company_refusal" class="px-5 py-4 border-t border-line flex flex-wrap items-end gap-3"
                                    data-testid="order-add-line">
                                    <div class="flex-1 min-w-[12rem]">
                                        <FormLabel for="order_product" :label="$t('superadmin.companyOrders.product')" />
                                        <select id="order_product" v-model="state.newLine.product"
                                            class="w-full text-sm border border-line rounded-lg px-2 py-1.5 bg-white text-ink outline-none focus:border-accent">
                                            <option value="" disabled>{{ $t('superadmin.companyOrders.pickProduct') }}</option>
                                            <option v-for="product in pickable" :key="productKey(product)" :value="productKey(product)">
                                                {{ product.name }} · {{ $t('superadmin.companyOrders.listPrice', { price: dkk(product.yearly_price) }) }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="w-24">
                                        <FormLabel for="order_quantity" :label="$t('superadmin.companyOrders.col.quantity')" />
                                        <input id="order_quantity" type="number" min="1" max="1000" v-model.number="state.newLine.quantity"
                                            class="w-full text-sm border border-line rounded-lg px-2 py-1.5 outline-none focus:border-accent" />
                                    </div>
                                    <FormButton buttonStyle="action" :disabled="!newLinePayload || state.saving" @click="addLine">
                                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('superadmin.companyOrders.addLine') }}
                                    </FormButton>
                                </div>
                            </section>

                            <!-- Totals: how the customer is billed -->
                            <section class="bg-white border border-line rounded-xl shadow-sm p-5 space-y-3 text-[13px]" aria-live="polite"
                                data-testid="order-totals">
                                <div class="flex items-center justify-between">
                                    <h3 class="font-semibold text-ink">{{ $t('superadmin.companies.licenseOverview.grant.billingBox.title') }}</h3>
                                    <Icon v-if="state.saving" name="ph:spinner" class="w-4 h-4 animate-spin text-accent" aria-hidden="true" />
                                </div>
                                <template v-if="order.quote">
                                    <ul class="space-y-1">
                                        <li v-for="line in order.quote.lines" :key="line.uuid">
                                            <div class="flex justify-between gap-3">
                                                <span class="text-ink-body">{{ line.paid }} × {{ line.name }}</span>
                                                <span class="tabular-nums">{{ dkk(line.amount) }}</span>
                                            </div>
                                            <div v-if="line.discount_percent > 0 && line.paid > 0" class="flex justify-between gap-3 text-[12px] text-ink-muted">
                                                <span>{{ $t('superadmin.companyOrders.discount.totalsLine', { percent: discountLabel(line.discount_percent), price: dkk(line.list_unit_price) }) }}</span>
                                                <span class="tabular-nums">−{{ dkk(line.discount_amount) }}</span>
                                            </div>
                                        </li>
                                        <li v-if="order.quote.fee > 0" class="flex justify-between gap-3">
                                            <span class="text-ink-body">{{ $t('superadmin.companies.licenseOverview.grant.billingBox.fee') }}</span>
                                            <span class="tabular-nums">{{ dkk(order.quote.fee) }}</span>
                                        </li>
                                        <li v-if="order.quote.discount_total > 0" class="flex justify-between gap-3 font-medium text-ink" data-testid="order-discount-total">
                                            <span>{{ $t('superadmin.companyOrders.discount.total') }}</span>
                                            <span class="tabular-nums">−{{ dkk(order.quote.discount_total) }}</span>
                                        </li>
                                        <li class="flex justify-between gap-3 text-ink-muted">
                                            <span>{{ $t('superadmin.companies.licenseOverview.grant.billingBox.vat') }}</span>
                                            <span class="tabular-nums">{{ dkk(order.quote.vat) }}</span>
                                        </li>
                                        <li class="flex justify-between gap-3 pt-2 border-t border-line font-semibold text-ink">
                                            <span>{{ $t('superadmin.companies.licenseOverview.grant.billingBox.total') }}</span>
                                            <span class="tabular-nums" data-testid="order-total">{{ dkk(order.quote.total_amount) }}</span>
                                        </li>
                                    </ul>
                                    <p v-if="order.quote.period_to" class="text-[12px] text-ink-muted">
                                        {{ $t(order.quote.prorated
                                            ? 'superadmin.companies.licenseOverview.grant.billingBox.periodProrated'
                                            : 'superadmin.companies.licenseOverview.grant.billingBox.period', {
                                            from: formatDate(order.quote.period_from), to: formatDate(order.quote.period_to) }) }}
                                    </p>
                                    <p class="flex items-start gap-2 rounded-lg bg-accent-soft px-3 py-2 text-ink">
                                        <Icon name="ph:receipt" class="w-4 h-4 mt-px flex-shrink-0" aria-hidden="true" />
                                        <span>{{ $t(order.quote.total_amount > 0 ? 'superadmin.companyOrders.billingDraft' : 'superadmin.companyOrders.billingFree', {
                                            customer: order.company?.economic_customer_number ?? '—' }) }}</span>
                                    </p>
                                </template>
                                <p v-else class="text-ink-muted">{{ $t('superadmin.companyOrders.noQuote') }}</p>

                                <div class="pt-2 space-y-2">
                                    <FormButton v-if="isDraft && canManage" buttonStyle="primary" class="w-full"
                                        :disabled="!orderCanComplete(order) || state.saving || !!order.company_refusal"
                                        @click="state.confirmOpen = true" data-testid="order-complete">
                                        <Icon name="ph:check-circle" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('superadmin.companyOrders.complete') }}
                                    </FormButton>
                                    <FormButton v-if="order.can_retry && canManage" buttonStyle="primary" class="w-full"
                                        :disabled="state.saving" @click="retry" data-testid="order-retry">
                                        <Icon name="ph:arrow-clockwise" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('superadmin.companyOrders.retry') }}
                                    </FormButton>
                                    <FormButton v-if="isDraft && canManage" buttonStyle="danger" class="w-full"
                                        :disabled="state.saving" @click="state.cancelOpen = true">
                                        {{ $t('superadmin.companyOrders.cancel') }}
                                    </FormButton>
                                </div>
                            </section>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <DialogConfirmation :isModalOpen="state.confirmOpen" :title="$t('superadmin.companyOrders.confirm.title')"
                :message="confirmText" :confirmLabel="$t('superadmin.companyOrders.complete')"
                @close="state.confirmOpen = false" @confirm="complete" />
            <DialogConfirmation :isModalOpen="state.cancelOpen" :title="$t('superadmin.companyOrders.cancel')"
                :message="$t('superadmin.companyOrders.cancelConfirm')" :confirmLabel="$t('superadmin.companyOrders.cancel')"
                @close="state.cancelOpen = false" @confirm="cancel" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { companyOrderService } from '@/components/api/superadmin/CompanyOrderService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { usePermissions } from '@/composables/usePermissions'
import { CREATE_AGREEMENT, grantTermOptions } from '@/composables/licenseGrant'
import {
    DEFAULT_MAX_DISCOUNT_PERCENT,
    availableProducts,
    discountError,
    discountLabel,
    discountPayload,
    discountedUnitPrice,
    quoteDiscounts,
    orderCanComplete,
    orderConfirmKey,
    orderEconomicLabel,
    orderLinePayload,
    orderSeatCount,
    orderStatusKey,
    orderStatusVariant,
    productKey,
    type OrderProduct,
} from '@/composables/superadminOrder'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const { can } = usePermissions()
const { successAlert, errorAlert } = useAlert()

const companyUuid = route.params.company_uuid as string
const orderUuid = route.params.order_uuid as string

const state = reactive({
    order: null as any,
    products: [] as OrderProduct[],
    loading: true,
    saving: false,
    error: '' as string,
    confirmOpen: false,
    cancelOpen: false,
    newLine: { product: '', quantity: 1 },
    discount: { lineUuid: '' as string, percent: '' as string | number, reason: '', onRenewal: false },
})

const order = computed(() => state.order)
const isDraft = computed(() => order.value?.status === 'draft')
const canManage = computed(() => can('manage_financials'))

const dkk = (value: unknown) => formatAmount(Number(value ?? 0), 'DKK')
const formatDate = (value?: string | null) => value ? formatDateToReadable(value) : '—'

const termOptions = computed(() => grantTermOptions({
    agreements: order.value?.agreements ?? [],
    yearly: order.value?.yearly !== false,
    formatDate: (date: string) => formatDateToReadable(date),
}).filter(option => option.value !== CREATE_AGREEMENT))

const pickable = computed(() => availableProducts(state.products, order.value?.lines ?? []))
const newLinePayload = computed(() => orderLinePayload(state.newLine.product, state.newLine.quantity))

const economicText = computed(() => {
    const label = orderEconomicLabel(order.value ?? {})
    return t(label.key, label.params)
})

const refusalText = computed(() => t(`superadmin.companyOrders.refusal.${order.value?.company_refusal}`))

const maxDiscount = computed(() => Number(order.value?.max_discount_percent ?? DEFAULT_MAX_DISCOUNT_PERCENT))

const discountBody = computed(() => discountPayload(state.discount.percent, state.discount.reason, state.discount.onRenewal, maxDiscount.value))

/** Shown once the staff member has typed something; empty fields are not an error yet. */
const discountErrorText = computed(() => {
    if (state.discount.percent === '' && state.discount.reason === '') return ''
    const code = discountError(state.discount.percent, state.discount.reason, maxDiscount.value)
    return code ? t(`superadmin.companyOrders.discount.errors.${code}`, { max: discountLabel(maxDiscount.value) }) : ''
})

const discountPreview = computed(() => {
    const line = quoteLine(state.discount.lineUuid)
    const percent = Number(String(state.discount.percent).replace(',', '.'))
    if (!line || !(line.paid > 0) || !Number.isFinite(percent) || percent <= 0 || percent > 100) return null
    return discountedUnitPrice(line.list_unit_price ?? line.unit_price, percent)
})

const confirmText = computed(() => {
    const quote = order.value?.quote
    const text = t(orderConfirmKey(quote), {
        seats: orderSeatCount(quote),
        amount: dkk(quote?.total_amount),
        customer: order.value?.company?.economic_customer_number ?? '—',
    })
    const discounts = quoteDiscounts(quote)
    if (!discounts.length) return text
    const list = discounts.map((line: any) => t('superadmin.companyOrders.discount.confirmLine', {
        name: line.name, percent: discountLabel(line.discount_percent), reason: line.discount_reason ?? '',
    })).join('; ')
    return `${text} ${t('superadmin.companyOrders.discount.confirm', { total: dkk(quote?.discount_total), list })}`
})

function quoteLine(uuid: string) {
    return (order.value?.quote?.lines ?? []).find((line: any) => line.uuid === uuid)
}

async function load() {
    state.loading = true
    state.error = ''
    try {
        const [response, products] = await Promise.all([
            companyOrderService.show(orderUuid),
            companyOrderService.products(companyUuid),
        ])
        state.order = response?.data ?? null
        state.products = products?.data?.products ?? []
    } catch (error: any) {
        state.error = error?.message || t('superadmin.companyOrders.loadFailed')
    }
    state.loading = false
}

/** Every change returns the whole order with its new quote. */
async function save(call: () => Promise<any>, success?: string) {
    state.saving = true
    try {
        const response = await call()
        if (response?.data) state.order = response.data
        if (success) successAlert(`${t('alert.success')}!`, success)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companyOrders.saveFailed'))
        await load()
    }
    state.saving = false
}

function onTermChange(event: Event) {
    const term = (event.target as HTMLSelectElement).value
    save(() => companyOrderService.setTerm(orderUuid, term))
}

async function addLine() {
    const payload = newLinePayload.value
    if (!payload) return
    await save(() => companyOrderService.addLine(orderUuid, payload))
    state.newLine.product = ''
    state.newLine.quantity = 1
}

function onQuantityChange(line: any, event: Event) {
    const quantity = Number((event.target as HTMLInputElement).value)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000 || quantity === line.quantity) return
    save(() => companyOrderService.updateLine(orderUuid, line.uuid, quantity))
}

function openDiscount(line: any) {
    if (state.discount.lineUuid === line.uuid) return closeDiscount()
    state.discount.lineUuid = line.uuid
    state.discount.percent = line.discount_percent > 0 ? line.discount_percent : ''
    state.discount.reason = line.discount_reason ?? ''
    state.discount.onRenewal = !!line.discount_on_renewal
}

function closeDiscount() {
    state.discount.lineUuid = ''
    state.discount.percent = ''
    state.discount.reason = ''
    state.discount.onRenewal = false
}

async function saveDiscount(line: any) {
    const body = discountBody.value
    if (!body) return
    await save(() => companyOrderService.setDiscount(orderUuid, line.uuid, body))
    closeDiscount()
}

async function removeDiscount(line: any) {
    await save(() => companyOrderService.setDiscount(orderUuid, line.uuid, { discount_percent: 0, discount_reason: null, discount_on_renewal: false }))
    closeDiscount()
}

function removeLine(line: any) {
    save(() => companyOrderService.removeLine(orderUuid, line.uuid))
}

function complete() {
    save(() => companyOrderService.complete(orderUuid), t('superadmin.companyOrders.completed'))
}

function retry() {
    save(() => companyOrderService.retry(orderUuid), t('superadmin.companyOrders.retried'))
}

function cancel() {
    save(() => companyOrderService.cancel(orderUuid), t('superadmin.companyOrders.cancelled'))
}

onMounted(load)
</script>
