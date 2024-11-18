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
                <div class="mx-auto max-w-sm md:max-w-md mt-16 relative" v-if="!state.isDealsHidden">
                    <div class="flex justify-center">
                        <fieldset aria-label="Payment frequency">
                            <RadioGroup v-model="frequency"
                                class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                <RadioGroupOption as="template" v-for="option in frequencies" :key="option.value"
                                    :value="option" v-slot="{ checked }">
                                    <div
                                        :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-2.5 py-1']">
                                        <span v-if="option.label === 'Monthly'">
                                            {{ $t('subscription.deal.monthly') }}
                                        </span>
                                        <span v-else-if="option.label === 'Annually'">
                                            {{ $t('subscription.deal.annually') }}
                                        </span>
                                        <span v-else>
                                            {{ option.label }}
                                        </span>
                                    </div>
                                </RadioGroupOption>
                            </RadioGroup>
                        </fieldset>
                    </div>
                    <div class="absolute right-11 -top-10 sm:right-16 sm:-top-10 md:right-24 md:-top-11">
                        <div class="relative">
                            <img src="/img/icons/discount-badge.svg" alt="Discount" width="73px">
                            <div class="text-xxs text-center font-semibold text-white absolute top-8 right-5 w-10">
                                <p class="text-center" :class="language.locale.value === 'dk' && 'ml-1.5'">
                                    {{ $t('subscription.discount.discount') }}
                                </p>
                            </div>
                        </div>
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

                            <p class="mt-4 flex items-baseline gap-x-2">
                                <span class="text-3xl font-bold tracking-tight text-gray-900">
                                    {{ frequency.value === 'monthly' ? formatAmount(deal.monthly_price) :
                                        formatAmount(deal.yearly_price) }}
                                </span>
                                <span class="text-base text-gray-500 lowercase">
                                    /{{ frequency.value === 'monthly' ? $t('subscription.deal.month') :
                                        $t('subscription.deal.year')
                                    }}
                                    {{ $t('excludeVat') }}
                                </span>
                            </p>

                            <p class="mt-0.5 text-sm text-primary font-semibold">
                                {{ $t('subscription.discount.save') }}
                                <span v-if="deal.name === 'Basis'">20</span>
                                <span v-if="deal.name === 'Pro'">10</span>%
                                <span class="lowercase">{{ $t('subscription.discount.whenChoosingYearly') }}</span>
                            </p>

                            <p :class="[index === 1 ? 'text-white' : 'text-gray-600', 'mt-6 text-base leading-7']">
                                <span v-if="deal.name === 'Basis'">
                                    {{ $t('subscription.deal.goodForTheSmallerSocialOffer') }}.
                                </span>
                                <span v-else>
                                    {{ $t('subscription.deal.perfectForTheLargerSocialOffer') }}.
                                </span>
                            </p>

                            <ul role="list"
                                :class="[index === 1 ? 'text-gray-300' : 'text-gray-600', 'mt-8 space-y-3 text-sm leading-6 sm:mt-10']">
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2 lowercase']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span>
                                        {{ deal?.users }}
                                        {{ deal?.users > 1 ? $t('subscription.deal.users') :
                                            $t('subscription.deal.user') }}
                                        ({{ $t('subscription.deal.additionalPurchaseFor') }} {{
                                            formatKrAmount(deal?.extra_users) }})
                                    </span>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2 lowercase']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span>
                                        {{ deal?.users }}
                                        {{ deal?.departments > 1 ? $t('subscription.deal.departments') :
                                            $t('subscription.deal.department') }}
                                        ({{ $t('subscription.deal.additionalPurchaseFor') }} {{
                                            formatKrAmount(deal?.extra_departments) }})
                                    </span>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span>{{ deal?.storage_size }}</span>
                                    <span class="lowecase">
                                        {{ $t('subscription.deal.storageSpace') }}
                                    </span>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    {{ $t('subscription.deal.telephoneSupport') }}
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2']"
                                    v-if="deal.name === 'Pro'">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    {{ $t('subscription.deal.automaticSynchronizationWithFMK') }}
                                </li>
                            </ul>
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
                    <div
                        class="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
                        <div v-for="(deal, index) in state.deals?.data" :key="index"
                            :class="[index === 1 ? 'relative bg-tertiary shadow-2xl' : 'bg-white/60 sm:mx-8 lg:mx-0', index === 1 ? '' : index === 0 ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-bl-3xl lg:rounded-tr-none' : 'sm:rounded-t-none lg:rounded-bl-none lg:rounded-tr-3xl', 'rounded-md p-8 ring-1 ring-gray-900/10 sm:p-10']">
                            <h3 :id="deal.id"
                                :class="[index === 1 ? 'text-white' : 'text-tertiary', 'text-base font-semibold leading-7']">
                                {{ deal.name }}
                            </h3>
                            <div class="mt-4 flex items-baseline gap-x-2">
                                <span
                                    :class="[index === 1 ? 'text-white' : 'text-gray-900', 'text-2xl font-bold tracking-tight']">
                                    <span>
                                        {{ frequency.value === 'monthly' ? formatAmount(deal.monthly_price) :
                                            formatAmount(deal.yearly_price) }}
                                    </span>
                                </span>
                                <span :class="[index === 1 ? 'text-gray-100' : 'text-gray-500', 'text-base lowercase']">
                                    /{{ frequency.value === 'monthly' ? $t('subscription.deal.month') :
                                        $t('subscription.deal.year')
                                    }}
                                    {{ $t('excludeVat') }}
                                </span>
                            </div>

                            <p :class="[index === 1 ? 'text-white' : 'text-primary', 'mt-0.5 text-sm font-semibold']">
                                {{ $t('subscription.discount.save') }}
                                <span v-if="deal.name === 'Basis'">20</span>
                                <span v-if="deal.name === 'Pro'">10</span>%
                                <span class="lowercase">{{ $t('subscription.discount.whenChoosingYearly') }}</span>
                            </p>

                            <p :class="[index === 1 ? 'text-white' : 'text-gray-600', 'mt-6 text-base leading-7']">
                                <span v-if="deal.name === 'Basis'">
                                    {{ $t('subscription.deal.goodForTheSmallerSocialOffer') }}.
                                </span>
                                <span v-else>
                                    {{ $t('subscription.deal.perfectForTheLargerSocialOffer') }}.
                                </span>
                            </p>
                            <ul role="list"
                                :class="[index === 1 ? 'text-gray-300' : 'text-gray-600', 'mt-8 space-y-3 text-sm leading-6 sm:mt-10']">
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2 lowercase']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span>
                                        {{ deal?.users }}
                                        {{ deal?.users > 1 ? $t('subscription.deal.users') :
                                            $t('subscription.deal.user') }}
                                        ({{ $t('subscription.deal.additionalPurchaseFor') }} {{
                                            formatKrAmount(deal?.extra_users) }})
                                    </span>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2 lowercase']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span>
                                        {{ deal?.users }}
                                        {{ deal?.departments > 1 ? $t('subscription.deal.departments') :
                                            $t('subscription.deal.department') }}
                                        ({{ $t('subscription.deal.additionalPurchaseFor') }} {{
                                            formatKrAmount(deal?.extra_departments) }})
                                    </span>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span>{{ deal?.storage_size }}</span>
                                    <span class="lowecase">
                                        {{ $t('subscription.deal.storageSpace') }}
                                    </span>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    {{ $t('subscription.deal.telephoneSupport') }}
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2']"
                                    v-if="deal.name === 'Pro'">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    {{ $t('subscription.deal.automaticSynchronizationWithFMK') }}
                                </li>
                            </ul>
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
                            <p class="mt-4 flex items-baseline gap-x-2">
                                <span class="text-3xl font-bold tracking-tight text-gray-900">
                                    {{ frequency.value === 'monthly' ? formatAmount(deal.monthly_price) :
                                        formatAmount(deal.yearly_price) }}
                                </span>
                                <span class="text-base text-gray-500 lowercase">
                                    /{{ frequency.value === 'monthly' ? $t('subscription.deal.month') :
                                        $t('subscription.deal.year')
                                    }}
                                    {{ $t('excludeVat') }}
                                </span>
                            </p>

                            <p class="mt-0.5 text-sm text-primary font-semibold">
                                {{ $t('subscription.discount.save') }}
                                <span v-if="deal.name === 'Basis'">20</span>
                                <span v-if="deal.name === 'Pro'">10</span>%
                                <span class="lowercase">{{ $t('subscription.discount.whenChoosingYearly') }}</span>
                            </p>

                            <p class="text-gray-600 mt-6 text-base leading-7">
                                <span v-if="deal.name === 'Basis'">
                                    {{ $t('subscription.deal.goodForTheSmallerSocialOffer') }}.
                                </span>
                                <span v-else>
                                    {{ $t('subscription.deal.perfectForTheLargerSocialOffer') }}.
                                </span>
                            </p>

                            <ul role="list"
                                :class="[index === 1 ? 'text-gray-300' : 'text-gray-600', 'mt-8 space-y-3 text-sm leading-6 sm:mt-10']">
                                <li class="text-primary flex gap-x-2 lowercase">
                                    <Icon name="ph:check" class="text-primary h-6 w-5 flex-none" aria-hidden="true" />
                                    <span>
                                        {{ deal?.users }}
                                        {{ deal?.users > 1 ? $t('subscription.deal.users') :
                                            $t('subscription.deal.user') }}
                                        ({{ $t('subscription.deal.additionalPurchaseFor') }} {{
                                            formatKrAmount(deal?.extra_users) }})
                                    </span>
                                </li>
                                <li class="text-primary flex gap-x-2 lowercase">
                                    <Icon name="ph:check" class="text-primary h-6 w-5 flex-none" aria-hidden="true" />
                                    <span>
                                        {{ deal?.users }}
                                        {{ deal?.departments > 1 ? $t('subscription.deal.departments') :
                                            $t('subscription.deal.department') }}
                                        ({{ $t('subscription.deal.additionalPurchaseFor') }} {{
                                            formatKrAmount(deal?.extra_departments) }})
                                    </span>
                                </li>
                                <li class="text-primary flex gap-x-2 lowercase">
                                    <Icon name="ph:check" class="text-primary h-6 w-5 flex-none" aria-hidden="true" />
                                    <span>{{ deal?.storage_size }}</span>
                                    <span class="lowecase">
                                        {{ $t('subscription.deal.storageSpace') }}
                                    </span>
                                </li>
                                <li class="text-primary flex gap-x-2 lowercase">
                                    <Icon name="ph:check" class="text-primary h-6 w-5 flex-none" aria-hidden="true" />
                                    {{ $t('subscription.deal.telephoneSupport') }}
                                </li>
                                <li class="text-primary flex gap-x-2 lowercase" v-if="deal.name === 'Pro'">
                                    <Icon name="ph:check" class="text-primary h-6 w-5 flex-none" aria-hidden="true" />
                                    {{ $t('subscription.deal.automaticSynchronizationWithFMK') }}
                                </li>
                            </ul>
                            <div class="mt-8">
                                <FormButton type="button" buttonStyle="primary" class="w-full" @click="subscribe(deal)">
                                    {{ $t('subscription.deal.selectPackage') }}
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
import { dealService } from '@/components/api/DealService'
import { userSubscriptionService } from '@/components/api/UserSubscriptionService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const language = useI18n()
const router = useRouter()
let error: string | undefined = router?.currentRoute?.value?.query?.error as string | undefined
let checkout = null as any

const state = reactive({
    error: {} as Error,
    deals: [] as any,
    isDealsHidden: false,
    isPageLoading: false,
})

const frequencies = [
    { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
    { value: 'annually', label: 'Annually', priceSuffix: '/year' },
]
const frequency = ref(frequencies[0])

onMounted(() => {
    fetchDeals()
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
            'deal_uuid': deal.uuid,
            'type': frequency.value.value === 'monthly' ? 'monthly' : 'yearly',
        }
        const response = await userSubscriptionService.subscribe(params)
        if (response) {
            const checkoutOptions = {
                checkoutKey: runtimeConfig?.public?.checkoutKey,
                paymentId: response?.paymentId,
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
            state.isDealsHidden = true
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function formatKrAmount(amount: any) {
    // Convert the number to a string with two decimal places
    let numberStr = parseFloat(amount).toFixed(2)

    // Split the string into integer and decimal parts
    let parts = numberStr.split('.')
    let integerPart = parts[0]
    let decimalPart = parts[1]

    // Add the thousands separators
    let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Combine the integer part with the decimal part
    return 'kr. ' + formattedIntegerPart + ',' + (decimalPart === '00' ? '-' : decimalPart)
}
</script>