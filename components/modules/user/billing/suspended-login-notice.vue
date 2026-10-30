<template>
    <div v-if="suspended" role="alert" data-testid="suspended-login-notice"
        class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900">
        <p class="text-sm font-semibold">
            {{ suspended.view === 'update_card' ? $t('paymentDunning.suspended.title') : $t('paymentDunning.suspended.contactTitle') }}
        </p>
        <p class="text-sm mt-1">
            {{ suspended.view === 'update_card' ? $t('paymentDunning.suspended.adminBody') : $t('paymentDunning.suspended.contactBody') }}
        </p>
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

/**
 * Shown on the login page when the company is closed for non-payment. The API
 * decides who is an Admin and hands only an Admin the one-time renewal token;
 * the token opens paying the outstanding invoice with a new card and nothing
 * else, so there is no session to protect here.
 */
const props = defineProps({ error: { type: Object as () => any, default: null } })

const suspended = computed(() => suspendedLogin(props.error))

function goToRenewal() {
    if (!suspended.value?.token) return
    navigateTo({ path: '/subscription/renew', query: { token: suspended.value.token } })
}
</script>
