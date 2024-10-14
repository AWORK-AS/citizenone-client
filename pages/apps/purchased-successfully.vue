<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('subscription.subscription') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="isolate mx-auto mt-10 grid max-w-lg">
                    <div class="ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                        <div class="mx-auto max-w-fit bg-green-600 rounded-full p-4 flex items-center justify-center">
                            <Icon name="ph:check-bold" class="h-7 w-7 text-white" aria-hidden="true" />
                        </div>
                        <div class="mt-4 text-center">
                            <h2 class="text-3xl font-extrabold text-gray-900">
                                {{ $t('subscription.subscribed.subscriptionSuccessful') }}!
                            </h2>
                            <p class="mt-2 text-sm text-gray-600">
                                {{ $t('subscription.subscribed.thankYouForSubscribing') }}.
                                {{ $t('subscription.subscribed.yourSubscriptionIsNowActive') }}
                            </p>
                        </div>
                        <div class="mt-8">
                            <div class="rounded-md bg-green-50 py-4 px-8">
                                <h3 class="text-sm font-semibold text-green-800">
                                    {{ $t('subscription.subscribed.paymentSuccessful') }}
                                </h3>
                                <div class="mt-2 text-sm text-green-700">
                                    <p>
                                        {{ $t('subscription.subscribed.yourPaymentHasBeenSuccessfullyProcessed')
                                        }}.
                                    </p>
                                </div>
                            </div>
                            <div class="mt-6">
                                <FormButton type="submit" buttonStyle="primary" class="w-full"
                                    @click="navigateTo('/daily-overview')">
                                    {{ $t('subscription.subscribed.goHome') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/AppService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const paymentId = router?.currentRoute?.value?.query?.paymentId

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

onMounted(() => {
    validateSubscription()
})

async function validateSubscription() {
    state.error = {}
    state.isPageLoading = true
    try {
        await appService.validatePurchase(paymentId)
    } catch (error: any) {
        state.error = error
        if (error?.message === 'Payment is invalid.') {
            navigateTo(`/apps?error=Invalid payment details`)
        } else if (error?.message === 'Betaling er ugyldig.') {
            navigateTo(`/apps?error=Ugyldige betalingsoplysninger.`)
        }
    }
    state.isPageLoading = false
}
</script>