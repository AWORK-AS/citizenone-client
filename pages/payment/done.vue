<template>
    <div class="payment-page">
        <Head>
            <Title>{{ $t('payment.done.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <div class="payment-card">
            <img src="/img/logo.svg" class="payment-logo" alt="CitizenOne" />

            <div class="payment-mark" :class="state.isPending ? 'is-pending' : 'is-done'">
                <Icon :name="state.isPending ? 'ph:clock' : 'ph:check'" class="size-8" />
            </div>

            <h1 class="payment-title">
                {{ state.isPending ? $t('payment.done.pendingTitle') : $t('payment.done.title') }}
            </h1>

            <!-- What was paid, to whom. Enough to recognise the payment, and
                 nothing that would matter if the link were forwarded. -->
            <p class="payment-amount" v-if="state.payment.amount">
                {{ formatAmount(state.payment.amount) }}
                <span class="payment-currency">{{ state.payment.currency }}</span>
            </p>

            <div class="payment-meta" v-if="state.payment.company || state.payment.invoice_number">
                <p v-if="state.payment.company">{{ $t('payment.done.paidTo', { company: state.payment.company }) }}</p>
                <p v-if="state.payment.invoice_number">
                    {{ $t('citizens.invoices.invoice') }} {{ state.payment.invoice_number }}
                </p>
            </div>

            <p class="payment-text">
                {{ state.isPending ? $t('payment.done.pendingText') : $t('payment.done.text') }}
            </p>

            <p class="payment-note">{{ $t('payment.done.receipt') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
// The person paying is a patient, not a user of the system, so this page
// stands on its own without a layout or a login.
definePageMeta({ layout: false })

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const state = reactive({
    payment: {} as any,
    isPending: false,
})

function formatAmount(amount: number): string {
    return new Intl.NumberFormat('da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0)
}

// The provider sends the payer back the moment the card goes through, which is
// often a breath before it tells us. Rather than claim the invoice is settled
// too early, the page waits a few seconds for the news to arrive and says so
// while it does.
async function load(attempt = 0) {
    const reference = route.query.reference

    if (!reference) return

    try {
        const response = await $fetch<any>(`${runtimeConfig.public.apiBaseURL}/payment-links/${reference}`)
        state.payment = response?.data || {}
        state.isPending = state.payment.status !== 'paid'

        if (state.isPending && attempt < 5) {
            setTimeout(() => load(attempt + 1), 2000)
        }
    } catch (error) {
        // A reference that means nothing here gets the plain thank you rather
        // than an error the payer can do nothing about.
    }
}

onMounted(() => load())
</script>

<style scoped>
/* CitizenOne's own colours: the deep navy of the brand cover, with the teal
   reserved for the one thing that matters here, that the payment landed. */
.payment-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(160deg, #0f2b46 0%, #0a1f33 60%, #071520 100%);
    font-family: Inter, sans-serif;
}

.payment-card {
    width: 100%;
    max-width: 420px;
    background: #ffffff;
    border-radius: 16px;
    padding: 40px 32px;
    text-align: center;
    box-shadow: 0 24px 60px rgba(7, 21, 32, 0.35);
}

.payment-logo {
    height: 28px;
    margin: 0 auto 28px auto;
}

.payment-mark {
    width: 64px;
    height: 64px;
    margin: 0 auto;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.payment-mark.is-done {
    background: #ecfdf5;
    color: #047857;
}

.payment-mark.is-pending {
    background: #f8fafc;
    color: #64748b;
}

.payment-title {
    margin-top: 20px;
    font-size: 20px;
    font-weight: 600;
    color: #1a2332;
}

.payment-amount {
    margin-top: 20px;
    font-size: 36px;
    font-weight: 600;
    color: #0f2b46;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
}

.payment-currency {
    font-size: 18px;
    font-weight: 500;
    color: #64748b;
    margin-left: 4px;
}

.payment-meta {
    margin-top: 8px;
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
}

.payment-text {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
    font-size: 14px;
    color: #1a2332;
}

.payment-note {
    margin-top: 12px;
    font-size: 12px;
    color: #94a3b8;
}
</style>
