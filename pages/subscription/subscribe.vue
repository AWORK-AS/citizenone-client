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
                <!-- Laid out and worded as the pricing on the CitizenOne homepage. -->
                <div class="mt-12 flex justify-center"
                    v-if="!state.isDealsHidden && userStore.getUser?.user_subscription?.type !== 'yearly'">
                    <fieldset :aria-label="$t('subscription.plan.frequency')">
                        <RadioGroup v-model="frequency"
                            class="flex gap-x-1 rounded-full bg-white p-1 text-sm font-semibold leading-5 ring-1 ring-inset ring-gray-200 shadow-sm">
                            <RadioGroupOption as="template" v-for="option in frequencies" :key="option.value"
                                :value="option" v-slot="{ checked }">
                                <div :data-testid="`plan-frequency-${option.value}`"
                                    :class="[checked ? 'bg-primary-900 text-white' : 'text-gray-600 hover:text-gray-900', 'cursor-pointer rounded-full px-5 py-2 flex items-center gap-x-2 whitespace-nowrap']">
                                    <template v-if="option.value === 'annually'">
                                        <span>{{ $t('subscription.plan.annually') }}</span>
                                        <!-- The yearly plan costs ten months. -->
                                        <span class="rounded-full bg-secondary-400 px-2 py-0.5 text-xs font-semibold text-primary-900">
                                            {{ $t('subscription.plan.saveTwoMonths') }}
                                        </span>
                                    </template>
                                    <span v-else>{{ $t('subscription.plan.monthly') }}</span>
                                </div>
                            </RadioGroupOption>
                        </RadioGroup>
                    </fieldset>
                </div>
                <div v-if="!state.isDealsHidden && (state.deals?.data?.length ?? 0) > 0"
                    :class="['isolate mx-auto mt-10 grid grid-cols-1 gap-6',
                        state.deals.data.length === 1 ? 'max-w-md' : state.deals.data.length === 2 ? 'max-w-md lg:max-w-4xl lg:grid-cols-2' : 'max-w-md lg:max-w-6xl lg:grid-cols-3']">
                    <div v-for="deal in state.deals.data" :key="deal.uuid ?? deal.id" :data-testid="`plan-card-${deal.name}`"
                        :class="[isHighlighted(deal) ? 'bg-primary-900 ring-primary-900' : 'bg-white ring-gray-200', 'rounded-2xl p-8 ring-1 shadow-sm']">
                        <h3 :id="deal.id" :class="[isHighlighted(deal) ? 'text-white' : 'text-gray-900', 'text-lg font-semibold leading-7']">
                            {{ deal.name }}
                        </h3>
                        <ModulesUserSubscriptionPlanDetails :deal="deal" :frequency="frequency.value" :dark="isHighlighted(deal)">
                            <button type="button" @click="subscribe(deal)"
                                :class="[isHighlighted(deal) ? 'bg-secondary-400 text-primary-900 hover:bg-secondary-300' : 'bg-primary text-white hover:bg-primary-600', 'w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors']">
                                {{ $t('subscription.deal.selectPackage') }}
                            </button>
                        </ModulesUserSubscriptionPlanDetails>
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

// The dark, highlighted card, as Pro is on the homepage.
function isHighlighted(deal: any) {
    return deal?.name === 'Pro'
}

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