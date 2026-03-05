<template>
    <div>
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="isolate mx-auto mt-10 grid max-w-lg">
                <div class="ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                    <div class="mx-auto max-w-fit bg-green-600 rounded-full p-4 flex items-center justify-center">
                        <Icon name="ph:check-bold" class="h-7 w-7 text-white" aria-hidden="true" />
                    </div>
                    <div class="mt-4 text-center">
                        <h2 class="text-3xl font-extrabold text-gray-900">
                            {{ $t('payment.paymentSuccessful') || 'Payment Successful' }}!
                        </h2>
                        <p class="mt-2 text-sm text-gray-600">
                            {{ $t('payment.thankYouForYourPayment') || 'Thank you for your payment' }}.
                        </p>
                    </div>
                    <div class="mt-8">
                        <div class="rounded-md bg-green-50 py-4 px-8">
                            <h3 class="text-sm font-semibold text-green-800">
                                {{ $t('payment.paymentCompleted') || 'Payment Completed' }}
                            </h3>
                            <div class="mt-2 text-sm text-green-700">
                                <p>
                                    {{ $t('payment.yourPaymentHasBeenSuccessfullyProcessed') || 'Your payment has been successfully processed' }}.
                                </p>
                            </div>
                        </div>
                        <div class="mt-6 space-y-3">
                            <FormButton type="button" buttonStyle="primary" class="w-full"
                                @click="navigateTo('/overview')">
                                {{ $t('subscription.subscribed.goHome') || 'Go to Dashboard' }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="secondary" class="w-full"
                                @click="navigateTo('/invoices')">
                                {{ $t('payment.viewInvoices') || 'View Invoices' }}
                            </FormButton>
                        </div>
                    </div>
                </div>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const sessionId = router?.currentRoute?.value?.query?.session_id

useHead({
    title: `Payment Successful - ${runtimeConfig?.public?.appName || 'CitizenOne'}`,
})

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

// Auto-redirect after 3 seconds to ensure payment is processed and invoice is updated
onMounted(() => {
    setTimeout(() => {
        navigateTo('/invoices')
    }, 3000)
})

definePageMeta({
    layout: 'user',
})
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
