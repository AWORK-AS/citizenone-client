<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('subscription.subscription') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                    <div class="sm:mx-auto sm:w-full sm:max-w-lg">
                        <div class="text-center">
                            <h2 class="text-3xl font-extrabold text-gray-900">
                                {{ $t('subscription.subscribed.subscriptionSuccessful') }}!
                            </h2>
                            <p class="mt-2 text-sm text-gray-600">
                                {{ $t('subscription.subscribed.thankYouForSubscribing') }}.
                                {{ $t('subscription.subscribed.yourSubscriptionIsNowActive') }}
                            </p>
                        </div>
                        <div class="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                            <div class="rounded-md bg-green-50 p-4">
                                <div class="flex">
                                    <div class="flex-shrink-0">
                                        <Icon name="ph:check-bold" class="h-10 w-10 text-green-400"
                                            aria-hidden="true" />
                                    </div>
                                    <div class="ml-3">
                                        <h3 class="text-sm font-medium text-green-800">
                                            {{ $t('subscription.subscribed.paymentSuccessful') }}
                                        </h3>
                                        <div class="mt-2 text-sm text-green-700">
                                            <p>
                                                {{ $t('subscription.subscribed.yourPaymentHasBeenSuccessfullyProcessed')
                                                }}.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-6">
                                <FormButton type="submit" buttonStyle="primary" class="w-full"
                                    @click="navigateTo('/citizens')">
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
import { userSubscriptionService } from '@/components/api/UserSubscriptionService'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const paymentId = router?.currentRoute?.value?.query?.paymentId

const state = reactive({
    error: [],
    isPageLoading: false,
})

onMounted(() => {
    fetchDeals()
})

async function fetchDeals() {
    state.isPageLoading = true
    state.error = []
    try {
        await userSubscriptionService.validateSubscription(paymentId)
    } catch (error: any) {
        state.error = error
        if (error?.message === 'Payment is invalid.') {
            navigateTo(`/subscribe?error=Invalid payment details`)
        }
    }
    state.isPageLoading = false
}
</script>