<template>
    <div v-if="suspended && suspended.view !== 'two_factor'" role="alert" data-testid="suspended-login-notice"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900">
        <p class="text-sm font-semibold">
            {{ titleKey }}
        </p>
        <p class="text-sm mt-1">
            {{ bodyKey }}
        </p>
        <Tooltip v-if="suspended.view === 'invoice_overdue'" :text="$t('paymentDunning.invoiceOverdue.contactHelp')"
            position="top" wrap class="!block mt-3">
            <a href="mailto:support@citizenone.dk"
                class="block w-full text-center rounded-lg bg-[#0F4C75] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0A3B5C]">
                {{ $t('paymentDunning.invoiceOverdue.contact') }}
            </a>
        </Tooltip>
        <Tooltip v-if="suspended.view === 'update_card' && suspended.token"
            :text="$t('paymentDunning.suspended.updateCardHelp')" position="top" wrap class="!block mt-3">
            <button type="button"
                class="w-full rounded-lg bg-[#0F4C75] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0A3B5C]"
                @click="goToRenewal">
                {{ $t('paymentDunning.suspended.updateCard') }}
            </button>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import { suspendedLogin } from '@/composables/billingMethod'
import { useI18n } from 'vue-i18n'

/**
 * Shown on the login page when the company is closed for non-payment. The API
 * decides who is an Admin and hands only an Admin the one-time renewal token;
 * the token opens paying the outstanding invoice with a new card and nothing
 * else, so there is no session to protect here.
 */
const props = defineProps({ error: { type: Object as () => any, default: null } })

const { t } = useI18n()
const suspended = computed(() => suspendedLogin(props.error))
const titleKey = computed(() => ({
    update_card: t('paymentDunning.suspended.title'),
    invoice_overdue: t('paymentDunning.invoiceOverdue.title'),
    contact_admin: t('paymentDunning.suspended.contactTitle'),
}[suspended.value?.view ?? 'contact_admin']))
const bodyKey = computed(() => ({
    update_card: t('paymentDunning.suspended.adminBody'),
    invoice_overdue: t('paymentDunning.invoiceOverdue.body'),
    contact_admin: t('paymentDunning.suspended.contactBody'),
}[suspended.value?.view ?? 'contact_admin']))

function goToRenewal() {
    if (!suspended.value?.token) return
    navigateTo({ path: '/subscription/renew', query: { token: suspended.value.token } })
}
</script>
