<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('apps.apps') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="mx-auto mt-10 w-full max-w-xl">
                    <div class="ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                        <div class="mx-auto max-w-fit bg-green-600 rounded-full p-4 flex items-center justify-center">
                            <Icon name="ph:check-bold" class="h-7 w-7 text-white" aria-hidden="true" />
                        </div>
                        <div class="mt-4 text-center">
                            <h2 class="text-3xl font-extrabold text-gray-900">
                                {{ $t('apps.purchased.paymentSuccessful') }}!
                            </h2>
                            <p class="mt-2 text-sm text-gray-600">
                                {{ $t('apps.purchased.thankYouForPurchasing') }}.
                            </p>
                        </div>
                        <div class="mt-8">
                            <div class="rounded-md bg-green-50 py-4 px-8">
                                <h3 class="text-sm font-semibold text-green-800">
                                    {{ $t('apps.purchased.paymentSuccessful') }}
                                </h3>
                                <div class="mt-2 text-sm text-green-700">
                                    <p>
                                        {{ $t('apps.purchased.yourPaymentHasBeenSuccessfullyProcessed')
                                        }}.
                                    </p>
                                </div>
                            </div>
                            <div class="mt-6 space-y-3">
                                <FormButton v-if="setupRoute" type="button" buttonStyle="primary" class="w-full"
                                    @click="navigateTo(setupRoute)">
                                    {{ $t('apps.activation.goToSetup') }}
                                </FormButton>
                                <FormButton type="submit" :buttonStyle="setupRoute ? 'cancel' : 'primary'"
                                    class="w-full" @click="navigateTo('/overview')">
                                    {{ $t('subscription.subscribed.goHome') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Post-purchase cross-sell: related apps in the same category -->
                        <ModulesUserAppCrossSell :categorySlug="category" :excludeUuid="exclude" />
                    </div>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/user/AppService'
import { useAppTours } from '@/composables/useAppTours'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const paymentId = router?.currentRoute?.value?.query?.paymentId
const category = (router?.currentRoute?.value?.query?.category as string) || ''
const exclude = (router?.currentRoute?.value?.query?.exclude as string) || ''
const breadcrumbLinks = [
    {
        name: 'apps.apps',
        translate: true,
        href: '/apps',
    },
    {
        name: 'apps.purchased.paymentSuccessful',
        translate: true,
        href: `/apps/purchased-successfully?paymentId=${paymentId}`,
    },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

// Apps with an in-product setup page the user can jump to after purchase
const appSetupRoutes: Record<string, string> = {
    'surveys': '/surveys',
}

const { getTour } = useAppTours()

const setupRoute = ref('')

onMounted(() => {
    validateSubscription()
    resolveSetupRoute()
})

async function resolveSetupRoute() {
    if (!exclude) return
    try {
        const response = await appService.getApp(exclude)
        const genericName = response?.data?.generic_name
        if (genericName && appSetupRoutes[genericName]) {
            const route = appSetupRoutes[genericName]
            setupRoute.value = getTour(genericName)
                ? `${route}${route.includes('?') ? '&' : '?'}tour=${genericName}`
                : route
        }
    } catch {
        // No setup shortcut; the home button still works
    }
}

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