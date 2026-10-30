<template>

    <Head>
        <Title>{{ title }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <div class="bg-[#f9fafaff] flex min-h-screen flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-center">
            <Logo />
        </div>

        <div class="mt-10 mx-auto w-full max-w-lg">
            <div class="bg-white shadow rounded-lg p-6" data-testid="suspended-page">
                <p v-if="state.isLoading" class="text-sm text-gray-600 flex items-center gap-2">
                    <Icon name="ph:spinner" class="h-4 w-4 animate-spin" aria-hidden="true" />
                    {{ $t('paymentDunning.suspendedPage.loading') }}
                </p>

                <template v-else>
                    <h1 class="text-lg font-semibold text-[#1F2533]">{{ title }}</h1>
                    <p class="mt-2 text-sm text-gray-600">{{ body }}</p>

                    <Tooltip v-if="mode === 'update_card' && state.status?.renewal_token" :text="$t('paymentDunning.suspended.updateCardHelp')"
                        position="top" wrap class="!block mt-5">
                        <button type="button"
                            class="w-full rounded-lg bg-[#0F4C75] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0A3B5C]"
                            @click="updateCard">
                            {{ $t('paymentDunning.suspended.updateCard') }}
                        </button>
                    </Tooltip>

                    <Tooltip v-if="mode === 'invoice_overdue'" :text="$t('paymentDunning.invoiceOverdue.contactHelp')"
                        position="top" wrap class="!block mt-5">
                        <a href="mailto:support@citizenone.dk"
                            class="block w-full text-center rounded-lg bg-[#0F4C75] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0A3B5C]">
                            {{ $t('paymentDunning.invoiceOverdue.contact') }}
                        </a>
                    </Tooltip>
                </template>
            </div>

            <p class="mt-4 text-center text-sm">
                <button type="button" class="text-gray-500 underline underline-offset-2" @click="logout">
                    {{ $t('paymentStatus.logOut') }}
                </button>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { billingService } from '@/components/api/user/BillingService'
import { latestRenewalToken, wallMode } from '@/composables/billingMethod'
import { useI18n } from 'vue-i18n'
import { authService } from '@/components/api/user/AuthService'
import { signOutRevoking } from '@/composables/signOutRevoking'

/**
 * Where a signed-in user lands when their company has been closed for non-payment: any
 * /user/* call answers 400 `subscription_suspended` and the API layer sends them here.
 * Billing standing is one of the routes that stays open, so the page asks it who may fix
 * what. Outside the user layout on purpose: the layout fires calls that would all be refused.
 */
const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

const state = reactive({ isLoading: true, status: null as any })

// A suspended standing whose status could not be read still says "contact your administrator".
const mode = computed(() => state.status ? wallMode({ ...state.status, status: 'suspended' }) : 'contact_admin')

const title = computed(() => ({
    update_card: t('paymentDunning.suspended.title'),
    invoice_overdue: t('paymentDunning.invoiceOverdue.title'),
    contact_admin: t('paymentDunning.suspended.contactTitle'),
    notice: t('paymentDunning.suspended.contactTitle'),
    none: t('paymentDunning.suspended.contactTitle'),
}[mode.value]))

const body = computed(() => ({
    update_card: t('paymentDunning.suspended.adminBody'),
    invoice_overdue: t('paymentDunning.invoiceOverdue.body'),
    contact_admin: t('paymentDunning.suspended.contactBody'),
    notice: t('paymentDunning.suspended.contactBody'),
    none: t('paymentDunning.suspended.contactBody'),
}[mode.value]))

// Renewal tokens rotate on every issue, so the one read when the page loaded may already be
// dead (the status call that loaded it minted it, and any later one replaces it). Ask again
// and use only what that answer carries.
async function updateCard() {
    try {
        const response = await billingService.getStatus()
        const token = latestRenewalToken(response?.data ?? response)
        if (token) navigateTo({ path: '/subscription/renew', query: { token } })
    } catch (_) {
        // The standing could not be read; the button stays and can be pressed again.
    }
}

// Revokes the token on the server first, then clears the local one.
async function logout() {
    await signOutRevoking({
        logout: () => authService.logout(),
        clearLocal: () => clearSessionToken(),
        done: () => {
            localStorage.removeItem('rememberMe')
            navigateTo('/')
        },
    })
}

onMounted(async () => {
    try {
        const response = await billingService.getStatus()
        state.status = response?.data ?? response ?? null
    } catch (_) {
        state.status = null
    }
    state.isLoading = false
})
</script>
