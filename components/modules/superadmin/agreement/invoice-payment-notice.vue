<template>
    <p v-if="message" class="text-center mt-10 text-sm" :class="tone">
        {{ message }}
    </p>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { invoicePaymentState } from '@/composables/agreements'

/**
 * The line under an invoice's lines. It used to be a constant that said the
 * invoice was already paid, also on unpaid ones. It now follows is_paid /
 * status and invoice_type, and says nothing when the API sent no payment data.
 */
const props = defineProps({
    invoice: { type: Object as () => any, default: null },
    /** i18n key for the "paid via your chosen payment method" text of this screen. */
    paidViaMethodKey: { type: String, required: true },
    /** i18n key for an invoice covered by an agreement. The customer text is the default. */
    coveredKey: { type: String, default: 'invoicePayment.covered' },
})

const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const paymentState = computed(() => invoicePaymentState(props.invoice))

const message = computed(() => {
    switch (paymentState.value) {
        case 'covered':
            return t(props.coveredKey)
        case 'paid':
            if (props.invoice?.invoice_type === 'bank_transfer') {
                return props.invoice?.paid_at
                    ? t('invoicePayment.paidOn', { date: formatDateToReadable(props.invoice.paid_at) })
                    : t('invoicePayment.paid')
            }
            return t(props.paidViaMethodKey)
        case 'failed':
            return t('invoicePayment.failed')
        case 'bank_transfer_unpaid':
            return t('invoicePayment.payByBankTransfer')
        case 'unpaid':
            return t('invoicePayment.unpaid')
        default:
            return ''
    }
})

const tone = computed(() => paymentState.value === 'failed' ? 'text-[#CC3B2D]' : 'text-primary')
</script>
