<template>
    <div class="space-y-5">
        <p class="text-sm text-gray-500 max-w-2xl">{{ $t('invoicing.settings.help') }}</p>

        <Alert type="danger" :text="state.error" v-if="state.error" />
        <Alert type="warning" :text="$t('invoicing.settings.adminOnly')" v-if="!canEdit" />

        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-5 space-y-4">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('invoicing.settings.vat') }}</h3>

                    <div class="space-y-1">
                        <FormLabel for="default_vat_rate" :label="$t('invoicing.settings.defaultVatRate')" />
                        <FormNumberField name="default_vat_rate" :min="0" :max="100" :disabled="!canEdit"
                            v-model="state.form.default_vat_rate" placeholder="25" />
                        <p class="text-xs text-gray-500">{{ $t('invoicing.settings.defaultVatRateHelp') }}</p>
                    </div>

                    <div class="flex items-start justify-between gap-4 border-t border-gray-100 pt-4">
                        <div>
                            <p class="text-sm font-medium text-gray-900">{{ $t('invoicing.settings.pricesIncludeVat') }}</p>
                            <p class="text-xs text-gray-500 max-w-sm">{{ $t('invoicing.settings.pricesIncludeVatHelp') }}</p>
                        </div>
                        <FormSwitch :value="state.form.prices_include_vat" :disabled="!canEdit"
                            @toggleSwitch="canEdit && (state.form.prices_include_vat = !state.form.prices_include_vat)" />
                    </div>

                    <div class="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                        {{ $t('invoicing.settings.example') }}
                        <span class="font-medium text-gray-900">{{ example }}</span>
                    </div>
                </div>

                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-5 space-y-4">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('invoicing.settings.invoiceDetails') }}</h3>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <FormLabel for="vat_number" :label="$t('invoicing.settings.vatNumber')" />
                            <FormTextField id="vat_number" name="vat_number" :disabled="!canEdit"
                                v-model="state.form.vat_number" :placeholder="$t('invoicing.settings.vatNumber')" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="payment_terms_days" :label="$t('invoicing.settings.paymentTerms')" />
                            <FormNumberField name="payment_terms_days" :min="0" :max="365" :disabled="!canEdit"
                                v-model="state.form.payment_terms_days" placeholder="14" />
                        </div>
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="payment_details" :label="$t('invoicing.settings.paymentDetails')" />
                        <FormTextArea id="payment_details" name="payment_details" :rows="3" :disabled="!canEdit"
                            v-model="state.form.payment_details"
                            :placeholder="$t('invoicing.settings.paymentDetailsPlaceholder')" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="invoice_footer" :label="$t('invoicing.settings.footer')" />
                        <FormTextArea id="invoice_footer" name="invoice_footer" :rows="2" :disabled="!canEdit"
                            v-model="state.form.invoice_footer"
                            :placeholder="$t('invoicing.settings.footerPlaceholder')" />
                    </div>
                </div>

                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-5 space-y-4">
                    <div class="flex items-center gap-1.5">
                        <h3 class="text-sm font-semibold text-gray-900">{{ $t('invoicing.settings.onlinePayment') }}</h3>
                        <!-- Who gets the money, who takes what, and who is on
                             the hook. Asked every time and worth answering
                             where the question comes up. -->
                        <Tooltip :text="$t('invoicing.settings.onlinePaymentTooltip')" :wrap="true">
                            <Icon name="ph:info" class="size-4 text-gray-400" />
                        </Tooltip>
                    </div>

                    <p class="text-xs text-gray-500" v-if="!state.payments.available">
                        {{ $t('invoicing.settings.onlinePaymentUnavailable') }}
                    </p>

                    <p class="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800"
                        v-else-if="state.payments.live === false">
                        {{ $t('invoicing.settings.testMode') }}
                    </p>

                    <template v-else>
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <p class="text-sm font-medium text-gray-900">
                                    {{ state.payments.charges_enabled
                                        ? $t('invoicing.settings.paymentsReady')
                                        : $t('invoicing.settings.paymentsNotReady') }}
                                </p>
                                <p class="text-xs text-gray-500 max-w-sm">
                                    {{ $t('invoicing.settings.onlinePaymentHelp', {
                                        rate: String(state.payments.fee_percent || 0).replace('.', ',')
                                    }) }}
                                </p>
                            </div>
                            <span class="inline-flex size-2.5 rounded-full mt-1.5"
                                :class="state.payments.charges_enabled ? 'bg-green-500' : 'bg-gray-300'"></span>
                        </div>

                        <FormButton buttonStyle="action" buttonSize="xs" @click="connectPayments"
                            :disabled="!canEdit || state.isConnecting">
                            <Icon name="ph:credit-card" class="size-4" />
                            {{ state.payments.connected
                                ? $t('invoicing.settings.continueSetup')
                                : $t('invoicing.settings.connectPayments') }}
                        </FormButton>
                    </template>
                </div>

                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-5 space-y-4">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('invoicing.settings.design') }}</h3>

                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <p class="text-sm font-medium text-gray-900">{{ $t('invoicing.settings.showLogo') }}</p>
                            <p class="text-xs text-gray-500 max-w-sm">{{ $t('invoicing.settings.showLogoHelp') }}</p>
                        </div>
                        <FormSwitch :value="state.form.show_logo" :disabled="!canEdit"
                            @toggleSwitch="canEdit && (state.form.show_logo = !state.form.show_logo)" />
                    </div>

                    <div class="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
                        <div>
                            <p class="text-sm font-medium text-gray-900">{{ $t('invoicing.settings.accentColor') }}</p>
                            <p class="text-xs text-gray-500 max-w-sm">{{ $t('invoicing.settings.accentColorHelp') }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <FormColorPicker id="accent_color" v-model="state.form.accent_color" v-if="canEdit" />
                            <span class="inline-block size-6 rounded border border-gray-200" v-else
                                :style="{ backgroundColor: state.form.accent_color }"></span>
                            <button type="button" class="text-xs text-gray-500 hover:text-primary" v-if="canEdit"
                                @click="state.form.accent_color = '#111111'">
                                {{ $t('invoicing.settings.resetColor') }}
                            </button>
                        </div>
                    </div>

                    <div class="rounded-lg border border-gray-200 p-3">
                        <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {{ $t('invoicing.settings.preview') }}
                        </p>
                        <p class="mt-1 text-lg font-semibold" :style="{ color: state.form.accent_color }">
                            {{ $t('citizens.invoices.invoice') }}
                        </p>
                        <div class="mt-2 border-t-2" :style="{ borderColor: state.form.accent_color }"></div>
                        <p class="mt-3 text-xs text-gray-500">{{ $t('invoicing.settings.previewHelp') }}</p>
                        <FormButton buttonStyle="action" buttonSize="xs" class="mt-2" @click="preview">
                            <Icon name="ph:eye" class="size-4" />
                            {{ $t('invoicing.settings.previewInvoice') }}
                        </FormButton>
                    </div>
                </div>
            </div>

            <div class="mt-5 flex justify-end" v-if="canEdit">
                <FormButton buttonStyle="primary" @click="save" :disabled="state.isSaving">
                    {{ $t('save') }}
                </FormButton>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { citizenInvoiceService } from '@/components/api/user/CitizenInvoiceService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['saved'])

const { successAlert } = useAlert()
const { isAtLeast } = usePermissions()
const { t, locale } = useI18n()

const canEdit = computed(() => isAtLeast('Admin'))

const state = reactive({
    form: {
        default_vat_rate: '25',
        prices_include_vat: false,
        vat_number: '',
        payment_terms_days: '14',
        payment_details: '',
        invoice_footer: '',
        show_logo: true,
        accent_color: '#111111',
    },
    payments: { available: false, connected: false, charges_enabled: false, fee_percent: 0 } as any,
    isPageLoading: true,
    isConnecting: false,
    isSaving: false,
    error: '',
})

// Shows what a 100 price turns into, which is the fastest way to see whether
// the switch is set the way the company quotes.
const example = computed(() => {
    const rate = Number(state.form.default_vat_rate) || 0
    const format = (amount: number) => new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)

    if (state.form.prices_include_vat) {
        const net = 100 / (1 + rate / 100)

        return t('invoicing.settings.exampleIncl', { net: format(net), vat: format(100 - net) })
    }

    return t('invoicing.settings.exampleExcl', { vat: format(100 * (rate / 100)), total: format(100 + 100 * (rate / 100)) })
})

// The provider hosts the setup, so this hands the company over and picks the
// answer up when they come back.
async function connectPayments() {
    state.error = ''
    state.isConnecting = true

    try {
        const response = await citizenInvoiceService.startPaymentOnboarding()
        const url = response?.data?.url

        if (url) window.location.href = url
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isConnecting = false
    }
}

async function loadPaymentStatus() {
    try {
        const response = await citizenInvoiceService.getPaymentStatus()
        state.payments = response?.data || state.payments
    } catch (error: any) {
        // Online payment is an extra; the rest of the setup works without it.
    }
}

async function load() {
    state.error = ''

    try {
        const response = await citizenInvoiceService.getSettings()
        const settings = response?.data

        if (settings) {
            state.form = {
                default_vat_rate: String(settings.default_vat_rate ?? 25),
                prices_include_vat: !!settings.prices_include_vat,
                vat_number: settings.vat_number || '',
                payment_terms_days: String(settings.payment_terms_days ?? 14),
                payment_details: settings.payment_details || '',
                invoice_footer: settings.invoice_footer || '',
                show_logo: settings.show_logo !== false,
                accent_color: settings.accent_color || '#111111',
            }
        }
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
}

// The PDF is built from what is saved, so a preview always follows a save.
async function preview() {
    if (canEdit.value) await save()

    try {
        const blob = await citizenInvoiceService.previewPdf()

        if (!blob) return

        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

async function save() {
    state.isSaving = true
    state.error = ''

    try {
        const response = await citizenInvoiceService.updateSettings({
            default_vat_rate: Number(state.form.default_vat_rate) || 0,
            prices_include_vat: state.form.prices_include_vat,
            vat_number: state.form.vat_number || null,
            payment_terms_days: Number(state.form.payment_terms_days) || 0,
            payment_details: state.form.payment_details || null,
            invoice_footer: state.form.invoice_footer || null,
            show_logo: state.form.show_logo,
            accent_color: state.form.accent_color || null,
        })

        successAlert(`${t('alert.success')}!`, `${t('invoicing.settings.saved')}.`)
        emit('saved', response?.data)
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

onMounted(() => {
    load()
    loadPaymentStatus()
})
</script>
