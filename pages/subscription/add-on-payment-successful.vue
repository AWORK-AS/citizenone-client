<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('subscription.subscription') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="isolate mx-auto mt-10 grid max-w-lg">
                    <div class="ring-1 ring-gray-200 rounded-3xl p-8 xl:p-10">
                        <div class="mx-auto max-w-fit bg-green-600 rounded-full p-4 flex items-center justify-center">
                            <Icon name="ph:check-bold" class="h-7 w-7 text-white" aria-hidden="true" />
                        </div>
                        <div class="mt-4 text-center">
                            <h2 class="text-3xl font-extrabold text-gray-900">
                                {{ $t('subscription.subscribed.paymentSuccessful') }}!
                            </h2>
                            <p class="mt-2 text-sm text-gray-600">
                                {{ $t('subscription.subscribed.yourPaymentHasBeenSuccessfullyProcessed')
                                }}.
                            </p>
                        </div>
                        <div class="mt-8">
                            <FormButton type="submit" buttonStyle="primary" class="w-full"
                                @click="navigateTo('/citizens')">
                                {{ $t('subscription.subscribed.goHome') }}
                            </FormButton>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { addOnDealsService } from '@/components/api/AddOnDealsService'

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
        await addOnDealsService.validatePayment(paymentId)
    } catch (error: any) {
        state.error = error
        if (error?.message === 'Payment is invalid.') {
            navigateTo(`/subscription?error=Invalid payment details`)
        }
    }
    state.isPageLoading = false
}
</script>