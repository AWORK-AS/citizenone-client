<template>
    <!-- Invoice customers only. Card customers keep the plan card as it was, and
         agreement customers (Elite) never reach this: their card is the Elite one. -->
    <div v-if="isInvoice && billing" class="bg-white ring-1 ring-gray-200 rounded-md p-6" data-testid="payment-method-card">
        <div class="flex items-start gap-3">
            <span class="shrink-0 rounded-full bg-[#EEF4FB] p-2">
                <Icon name="ph:file-text" class="h-5 w-5 text-[#0F4C75]" aria-hidden="true" />
            </span>
            <div class="min-w-0 flex-1">
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('paymentDunning.customer.method') }}</h3>
                <Tooltip :text="$t('paymentDunning.customer.invoiceMethodHelp')" position="top" wrap>
                    <p class="mt-1 text-base font-semibold text-[#0F4C75]">{{ $t('paymentDunning.customer.invoiceMethod') }}</p>
                </Tooltip>
                <p class="mt-1 text-sm text-gray-600">{{ $t('paymentDunning.customer.invoiceMethodHelp') }}</p>
            </div>
        </div>

        <div v-if="billing.invoice_card_security" class="mt-5 border-t border-gray-100 pt-4">
            <template v-if="billing.card_masked">
                <p class="text-sm font-medium text-gray-900">
                    {{ $t('paymentDunning.customer.securityCard', { masked: billing.card_masked, expiry: billing.card_expiry ?? '—' }) }}
                </p>
                <p class="mt-1 text-xs text-gray-500">{{ $t('paymentDunning.customer.securityCardHelp') }}</p>
            </template>
            <ModulesUserBillingSecurityCardBanner v-else :inline="true" />

            <div v-if="canManage && billing.card_masked" class="mt-3">
                <div class="flex flex-wrap gap-2">
                    <Tooltip :text="$t('paymentDunning.customer.changeCardHelp')" position="top" wrap>
                        <FormButton type="button" buttonStyle="secondary" @click="state.isDialogOpen = true">
                            {{ $t('paymentDunning.customer.changeCard') }}
                        </FormButton>
                    </Tooltip>
                    <Tooltip :text="$t('paymentDunning.customer.removeCardHelp')" position="top" wrap>
                        <FormButton type="button" buttonStyle="danger" @click="state.isRemoveOpen = true">
                            {{ $t('paymentDunning.customer.removeCard') }}
                        </FormButton>
                    </Tooltip>
                </div>
            </div>
        </div>

        <DialogConfirmation :isModalOpen="state.isRemoveOpen" :title="$t('paymentDunning.customer.removeCard')"
            :message="$t('paymentDunning.customer.removeCardConfirm')" :confirmLabel="$t('paymentDunning.customer.removeCard')"
            @close="state.isRemoveOpen = false" @confirm="removeCard" />

        <Alert v-if="state.error" class="mt-3" type="danger" :text="state.error" />

        <ModulesUserBillingSecurityCardDialog :isOpen="state.isDialogOpen" @close="state.isDialogOpen = false"
            @saved="onSaved" />
    </div>
</template>

<script setup lang="ts">
import { billingService } from '@/components/api/user/BillingService'
import { errorMessageKey } from '@/composables/billingMethod'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
const { billing, isInvoice, load } = usePaymentMethod()
const { isAtLeast } = usePermissions()

// The API refuses anyone but an Admin; this only decides whether to show the button.
const canManage = computed(() => isAtLeast('Admin'))
const { t } = useI18n()
const { successAlert } = useAlert()
const state = reactive({ isDialogOpen: false, isRemoveOpen: false, error: '' as string })

// Withdraws the card. The API answers 404 while the feature is off (then nothing here shows
// at all, because the status carries no card_security) and refuses anyone but an admin.
async function removeCard() {
    state.isRemoveOpen = false
    state.error = ''
    try {
        await billingService.removeCardSecurity()
        successAlert(`${t('alert.success')}!`, t('paymentDunning.customer.cardRemoved'))
        await load(true)
    } catch (error: any) {
        const key = errorMessageKey(error)
        state.error = key ? t(key) : (error?.message ?? '')
    }
}

async function onSaved() {
    state.isDialogOpen = false
    await load(true)
}

onMounted(() => load())
</script>
