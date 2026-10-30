<template>
    <div v-if="visible" role="status" data-testid="security-card-banner"
        class="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
        :class="props.inline ? '' : 'mb-4'">
        <Icon name="ph:shield-warning" class="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div class="min-w-0 flex-1">
            <p class="text-sm font-medium">{{ $t('paymentDunning.customer.bannerTitle') }}</p>
            <p class="text-sm mt-0.5 opacity-90">
                {{ canManage ? $t('paymentDunning.customer.bannerBody') : $t('paymentDunning.customer.bannerAdminOnly') }}
            </p>
        </div>
        <Tooltip v-if="canManage" :text="$t('paymentDunning.customer.changeCardHelp')" position="top" wrap>
            <FormButton type="button" buttonStyle="primary" @click="state.isDialogOpen = true">
                {{ $t('paymentDunning.customer.attachCard') }}
            </FormButton>
        </Tooltip>

        <ModulesUserBillingSecurityCardDialog :isOpen="state.isDialogOpen" @close="state.isDialogOpen = false"
            @saved="onSaved" />
    </div>
</template>

<script setup lang="ts">
/**
 * Asks an invoice customer with "kort som sikkerhed" to attach the card. Only an
 * Admin gets the button; everyone else is told an administrator has to. Elite
 * (agreement) customers never see it, and a failed load shows nothing.
 */
const props = defineProps({ inline: { type: Boolean, default: false } })

const { billing, isInvoice, load } = usePaymentMethod()
const { isAtLeast } = usePermissions()

const canManage = computed(() => isAtLeast('Admin'))
const state = reactive({ isDialogOpen: false })

const visible = computed(() =>
    isInvoice.value && !!billing.value?.invoice_card_security && !billing.value?.card_masked)

async function onSaved() {
    state.isDialogOpen = false
    await load(true)
}

onMounted(() => load())
</script>
