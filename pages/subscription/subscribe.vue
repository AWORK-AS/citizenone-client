<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('subscription.subscription') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('subscription.subscription') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="max-w-4xl mx-auto space-y-2">
                    <Alert type="danger" :text="error" v-if="error && error.length > 0" />
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                </div>
                <div id="subscribe-checkout" class="mx-auto max-w-sm md:max-w-md"></div>
                <div class="mx-auto max-w-sm md:max-w-md mt-16 relative"
                    v-if="!state.isDealsHidden && userStore.getUser?.user_subscription?.type !== 'yearly'">
                    <div class="flex justify-center">
                        <fieldset aria-label="Payment frequency">
                            <RadioGroup v-model="frequency"
                                class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                <RadioGroupOption as="template" v-for="option in frequencies" :key="option.value"
                                    :value="option" v-slot="{ checked }">
                                    <div
                                        :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-3 py-1 flex items-center justify-center gap-x-2']">
                                        <span v-if="option.label === 'Monthly'">
                                            {{ $t('subscription.deal.monthly') }}
                                        </span>
                                        <template v-else-if="option.label === 'Annually'">
                                            <span>{{ $t('subscription.deal.annually') }}</span>
                                            <!-- As on the homepage: the yearly plan costs ten months. -->
                                            <span class="rounded-full bg-secondary px-2 py-0.5 text-xxs font-semibold text-tertiary whitespace-nowrap">
                                                {{ $t('subscription.plan.saveTwoMonths') }}
                                            </span>
                                        </template>
                                        <span v-else>
                                            {{ option.label }}
                                        </span>
                                    </div>
                                </RadioGroupOption>
                            </RadioGroup>
                        </fieldset>
                    </div>
                </div>
                <div v-if="state.deals?.data?.length === 1 && !state.isDealsHidden">
                    <div class="isolate mx-auto mt-10 grid max-w-md">
                        <div v-for="(deal, index) in state.deals?.data" :key="index"
                            class="ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                            <div class="flex items-center justify-between gap-x-4">
                                <h3 :id="deal.id" class="text-base font-semibold leading-7 text-tertiary">
                                    {{ deal.name }}
                                </h3>
                            </div>

                            <ModulesUserSubscriptionPlanDetails :deal="deal" :frequency="frequency.value" :dark="false" />
                            <div class="mt-8">
                                <FormButton type="button" buttonStyle="primary" class="w-full" v-if="index === 0"
                                    @click="subscribe(deal)">
                                    {{ $t('subscription.deal.selectPackage') }}
                                </FormButton>
                                <FormButton type="button" class="w-full" v-else @click="subscribe(deal)">
                                    {{ $t('subscription.deal.selectPackage') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else-if="state.deals?.data?.length === 2 && !state.isDealsHidden">
                    <!-- Done here -->
                    <div
                        class="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
                        <div v-for="(deal, index) in state.deals?.data" :key="index"
                            :class="[index === 1 ? 'relative bg-tertiary shadow-2xl' : 'bg-white/60 sm:mx-8 lg:mx-0', index === 1 ? '' : index === 0 ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-bl-3xl lg:rounded-tr-none' : 'sm:rounded-t-none lg:rounded-bl-none lg:rounded-tr-3xl', 'rounded-md p-8 ring-1 ring-gray-900/10 sm:p-10']">
                            <h3 :id="deal.id"
                                :class="[index === 1 ? 'text-white' : 'text-tertiary', 'text-base font-semibold leading-7']">
                                {{ deal.name }}
                            </h3>
                            <ModulesUserSubscriptionPlanDetails :deal="deal" :frequency="frequency.value" :dark="index === 1" />
                            <div class="mt-8">
                                <FormButton type="button" class="w-full" buttonStyle="primary" @click="subscribe(deal)"
                                    v-if="index === 0">
                                    {{ $t('subscription.deal.selectPackage') }}
                                </FormButton>
                                <FormButton type="button" class="w-full" buttonStyle="white" @click="subscribe(deal)"
                                    v-else>
                                    {{ $t('subscription.deal.selectPackage') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else v-if="!state.isDealsHidden">
                    <div
                        class="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        <div v-for="(deal, index) in state.deals?.data" :key="index"
                            class="ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                            <div class="flex items-center justify-between gap-x-4">
                                <h3 :id="deal.id" class="text-base font-semibold leading-7 text-tertiary">
                                    {{ deal.name }}
                                </h3>
                            </div>
                            <ModulesUserSubscriptionPlanDetails :deal="deal" :frequency="frequency.value" :dark="false" />
                            <div class="mt-8">
                                <FormButton type="button" buttonStyle="primary" class="w-full" @click="subscribe(deal)">
                                    {{ $t('subscription.deal.selectPackage') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-5" v-if="!state.isDealsHidden" @click="state.modal.isEnterCouponShow = true">
                    <p class="text-center text-sm text-primary cursor-pointer hover:text-primary-700">
                        <span>{{ $t('subscription.coupon.enterYourCouponCodeHereForExclusiveSavings') }}!</span>
                    </p>
                </div>
                <p class="text-center text-primary font-semibold"
                    v-if="!state.isDealsHidden && couponStore.getDealCouponCode">
                    {{ $t('subscription.coupon.form.couponCode') }}:
                    {{ couponStore.getDealCouponCode }}
                    <span class="text-xxs cursor-pointer hover:underline" @click="couponStore.resetDealCouponCode">
                        {{ $t('subscription.coupon.remove') }}
                    </span>
                </p>
            </LoadingSpinner>
            <ModulesUserSubscriptionModalDealCoupon :isModalOpen="state.modal.isEnterCouponShow"
                @close="state.modal.isEnterCouponShow = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { dealService } from '@/components/api/user/DealService'
import { userSubscriptionService } from '@/components/api/user/UserSubscriptionService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useI18n } from "vue-i18n"
import { useCouponStore } from '@/store/coupon'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const couponStore = useCouponStore()
const userStore = useUserStore() as any
const language = useI18n()
const router = useRouter()
let error: string | undefined = router?.currentRoute?.value?.query?.error as string | undefined
let checkout = null as any
const breadcrumbLinks = [
    {
        name: 'subscription.subscription',
        translate: true,
        href: '/subscription/subscribe',
    },
]

const state = reactive({
    error: {} as Error,
    deals: [] as any,
    isDealsHidden: false,
    isPageLoading: false,
    modal: {
        isEnterCouponShow: false,
    }
})

const frequencies = [
    { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
    { value: 'annually', label: 'Annually', priceSuffix: '/year' },
]
const frequency = ref(frequencies[0])

onMounted(() => {
    fetchDeals()
})

watch(() => userStore.getUser, (user: any) => {
    if (user.user_subscription?.type === 'yearly') {
        frequency.value = frequencies.find(f => f.value === 'annually')!
    }
})

onUnmounted(() => {
    // Cleanup checkout instance when component is unmounted
    if (checkout) {
        checkout.cleanup()
    }
})

async function fetchDeals() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await dealService.getDeals()
        if (response) {
            state.deals = response
            if (response?.data?.length === 0) {
                navigateTo('/subscription')
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function subscribe(deal: any) {
    state.isPageLoading = true
    state.error = {}
    error = ''
    try {
        const params = {
            deal_uuid: deal.uuid,
            type: frequency.value.value === 'monthly' ? 'monthly' : 'yearly',
            coupon_code: couponStore.getDealCouponCode,
        }
        if (userStore.getUser?.user_subscription?.type === 'yearly') {
            params.type = 'yearly'
        }
        const response = await userSubscriptionService.subscribe(params)
        if (response?.paymentId) {
            const checkoutOptions = {
                checkoutKey: runtimeConfig?.public?.checkoutKey,
                paymentId: response.paymentId,
                containerId: "subscribe-checkout",
                language: "da-DK",
                theme: {
                    buttonRadius: "5px"
                }
            }
            checkout = new Dibs.Checkout(checkoutOptions)
            checkout.on('payment-completed', function (response: any) {
                checkout.cleanup()
                couponStore.resetDealCouponCode
                const paymentId = response['paymentId']
                navigateTo(`/subscription/subscribed-successfully?paymentId=${paymentId}`)
            })
            state.isDealsHidden = true
        } else {
            state.error = { message: language.t('subscription.couldNotStartCheckout') }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

</script>