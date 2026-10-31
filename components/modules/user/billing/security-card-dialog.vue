<template>
    <Modal size="sm" :title="$t('paymentDunning.customer.attachCard')" titleIcon="ph:shield-check" :show="props.isOpen"
        @close="close">
        <template #modal-body>
            <div class="space-y-4">
                <p class="text-sm text-gray-600">{{ $t('paymentDunning.customer.changeCardHelp') }}</p>

                <Alert v-if="state.error" type="danger" :text="state.error" />

                <template v-if="!state.checkoutReady">
                    <!-- The consent text and its version come from the API, so what the customer
                         read is exactly what is logged with the timestamp. -->
                    <p v-if="state.info" class="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 whitespace-pre-line">
                        {{ state.info.consent_text }}
                    </p>
                    <Tooltip :text="$t('paymentDunning.customer.consentHelp')" position="top" wrap class="!block">
                        <label class="flex items-start gap-2 text-sm text-gray-800 cursor-pointer">
                            <input type="checkbox" class="mt-1 rounded border-gray-300" v-model="state.consent" />
                            <span>{{ $t('paymentDunning.customer.consentCheckbox') }}</span>
                        </label>
                    </Tooltip>
                    <p v-if="state.needsConsent" class="text-[12px] text-red-600" role="alert">
                        {{ $t('paymentDunning.customer.consentRequired') }}
                    </p>

                    <div class="flex justify-end gap-3">
                        <FormButton type="button" buttonStyle="cancel" @click="close">
                            {{ $t('paymentDunning.customer.cancel') }}
                        </FormButton>
                        <Tooltip :text="$t('paymentDunning.customer.changeCardHelp')" position="top" wrap>
                            <FormButton type="button" buttonStyle="primary" :disabled="state.isStarting || !state.info" @click="start">
                                {{ state.isStarting ? $t('paymentStatus.pleaseWait') : $t('paymentDunning.customer.attachCard') }}
                            </FormButton>
                        </Tooltip>
                    </div>
                </template>

                <p v-if="state.isSaving" class="text-sm text-gray-600 flex items-center gap-2">
                    <Icon name="ph:spinner" class="h-4 w-4 animate-spin" aria-hidden="true" />
                    {{ $t('paymentStatus.pleaseWait') }}
                </p>

                <!-- The Nexi widget mounts here once a payment has been minted. -->
                <div v-show="state.checkoutReady" id="security-card-checkout" class="mx-auto max-w-sm"></div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { billingService, type CardSecurityInfo } from '@/components/api/user/BillingService'
import { errorMessageKey } from '@/composables/billingMethod'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

/**
 * Attach (or replace) the card an invoice customer has put up as security.
 * Nothing is charged here. The consent text is shown next to the box that must
 * be ticked, and the API logs the consent with a timestamp. Nexi hosts the card
 * form, so no card number ever reaches this app.
 */
const props = defineProps({ isOpen: { type: Boolean, required: true } })
const emit = defineEmits(['close', 'saved'])

const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()
const { successAlert } = useAlert()

let checkout = null as any

const state = reactive({
    consent: false,
    needsConsent: false,
    isStarting: false,
    isSaving: false,
    checkoutReady: false,
    error: '' as string,
    info: null as CardSecurityInfo | null,
})

watch(() => props.isOpen, async (open: boolean) => {
    if (!open) return
    state.consent = false
    state.needsConsent = false
    state.error = ''
    state.checkoutReady = false
    state.info = null

    try {
        state.info = await billingService.getCardSecurity()
        // 404: the feature is off, so there is nothing to attach.
        if (!state.info) emit('close')
    } catch (error: any) {
        state.error = errorText(error, t('paymentDunning.customer.loadFailed'))
    }
})

function errorText(error: any, fallback: string): string {
    const key = errorMessageKey(error)
    return key ? t(key) : (error?.message || fallback)
}

function close() {
    checkout?.cleanup?.()
    checkout = null
    state.checkoutReady = false
    emit('close')
}

async function start() {
    state.error = ''
    state.needsConsent = !state.consent
    if (!state.consent) return

    state.isStarting = true
    try {
        const response = await billingService.startCardSecurityCheckout(state.info?.consent_version ?? '')
        const paymentId = response?.data?.payment_id

        if (!paymentId) {
            state.error = t('paymentDunning.customer.cardFailed')
            return
        }

        state.checkoutReady = true
        await nextTick()

        checkout = new Dibs.Checkout({
            checkoutKey: runtimeConfig?.public?.checkoutKey,
            paymentId,
            containerId: 'security-card-checkout',
            language: nexiCheckoutLanguage(locale.value),
            theme: { buttonRadius: '5px' },
        })

        checkout.on('payment-completed', () => complete(paymentId))
    } catch (error: any) {
        state.error = errorText(error, t('paymentDunning.customer.cardFailed'))
    } finally {
        state.isStarting = false
    }
}

async function complete(paymentId: string) {
    checkout?.cleanup?.()
    checkout = null
    state.checkoutReady = false
    state.isSaving = true

    try {
        await billingService.completeCardSecurity(paymentId)
        successAlert(`${t('alert.success')}!`, t('paymentDunning.customer.cardSaved'))
        emit('saved')
    } catch (error: any) {
        state.error = errorText(error, t('paymentDunning.customer.cardFailed'))
    } finally {
        state.isSaving = false
    }
}

onUnmounted(() => checkout?.cleanup?.())
</script>
