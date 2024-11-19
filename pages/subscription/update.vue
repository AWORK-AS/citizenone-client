<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('subscription.updateSubscription') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('subscription.updateSubscription') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="max-w-4xl mx-auto space-y-2">
                    <Alert type="danger" :text="error" v-if="error && error.length > 0" />
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                </div>
                <div id="update-subscription-checkout"></div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const paymentId = router?.currentRoute?.value?.query?.paymentId
let error: string | undefined = router?.currentRoute?.value?.query?.error as string | undefined
let checkout = null as any

const state = reactive({
    error: {} as Error,
    deals: [] as any,
    isDealsHidden: false,
    isPageLoading: true,
})

onMounted(() => {
    subscribe()
})

onUnmounted(() => {
    // Cleanup checkout instance when component is unmounted
    if (checkout) {
        checkout.cleanup()
    }
})

async function subscribe() {
    state.isPageLoading = false
    const checkoutOptions = {
        checkoutKey: runtimeConfig?.public?.checkoutKey,
        paymentId: paymentId,
        containerId: "update-subscription-checkout",
        language: "da-DK",
        theme: {
            buttonRadius: "5px"
        }
    }
    checkout = new Dibs.Checkout(checkoutOptions)
    checkout.on('payment-completed', function (response: any) {
        checkout.cleanup()
        const paymentId = response['paymentId']
        navigateTo(`/subscription/subscribed-successfully?paymentId=${paymentId}`)
    })
}
</script>