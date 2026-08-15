<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Head>
            <Title>{{ $t('payment.done.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <div class="w-full max-w-md rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-gray-900/5">
            <div class="mx-auto flex size-14 items-center justify-center rounded-full"
                :class="state.isPending ? 'bg-amber-100' : 'bg-green-100'">
                <Icon :name="state.isPending ? 'ph:clock' : 'ph:check'" class="size-7"
                    :class="state.isPending ? 'text-amber-700' : 'text-green-700'" />
            </div>

            <h1 class="mt-5 text-xl font-semibold text-gray-900">
                {{ state.isPending ? $t('payment.done.pendingTitle') : $t('payment.done.title') }}
            </h1>

            <!-- What was paid, to whom. Enough to recognise the payment, and
                 nothing that would matter if the link were forwarded. -->
            <p class="mt-4 text-3xl font-semibold text-gray-900 tabular-nums" v-if="state.payment.amount">
                {{ formatAmount(state.payment.amount) }} {{ state.payment.currency }}
            </p>
            <p class="mt-1 text-sm text-gray-600" v-if="state.payment.company">
                {{ $t('payment.done.paidTo', { company: state.payment.company }) }}
            </p>
            <p class="mt-1 text-sm text-gray-500" v-if="state.payment.invoice_number">
                {{ $t('citizens.invoices.invoice') }} {{ state.payment.invoice_number }}
            </p>

            <p class="mt-5 text-sm text-gray-600">
                {{ state.isPending ? $t('payment.done.pendingText') : $t('payment.done.text') }}
            </p>

            <p class="mt-6 text-xs text-gray-400">{{ $t('payment.done.receipt') }}</p>
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
