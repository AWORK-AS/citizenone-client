<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('subscription.subscription') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('subscription.subscription') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="max-w-4xl mx-auto space-y-2">
                    <Alert type="danger" :text="error" v-if="error && error.length > 0" />
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error && state.error.length > 0 || state.error?.message" />
                </div>
                <div id="checkout-container-div"></div>
                <div class="mt-16 flex justify-center" v-if="!state.isDealsHidden">
                    <fieldset aria-label="Payment frequency">
                        <RadioGroup v-model="frequency"
                            class="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
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
                <div v-if="state.deals?.data?.length <= 2 && !state.isDealsHidden">
                    <div
                        class="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
                        <div v-for="(deal, index) in state.deals?.data" :key="index"
                            :class="[index === 1 ? 'relative bg-tertiary shadow-2xl' : 'bg-white/60 sm:mx-8 lg:mx-0', index === 1 ? '' : index === 0 ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-bl-3xl lg:rounded-tr-none' : 'sm:rounded-t-none lg:rounded-bl-none lg:rounded-tr-3xl', 'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10']">
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
                                <span :class="[index === 1 ? 'text-gray-100' : 'text-gray-500', 'text-base']">
                                    /{{ frequency.value === 'monthly' ? $t('subscription.deal.month') :
                                        $t('subscription.deal.year')
                                    }}
                                </span>
                            </div>
                            <p :class="[index === 1 ? 'text-white' : 'text-gray-600', 'mt-6 text-base leading-7']">
                                <span v-if="index === 0">
                                    {{ $t('subscription.deal.thePerfectPlan') }}.
                                </span>
                                <span v-else>
                                    {{ $t('subscription.deal.aPlanThatScales') }}.
                                </span>
                            </p>
                            <ul role="list"
                                :class="[index === 1 ? 'text-gray-300' : 'text-gray-600', 'mt-8 space-y-3 text-sm leading-6 sm:mt-10']">
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-3']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    {{ deal?.storage_size }} {{ $t('subscription.deal.storageSize') }}
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-3']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    {{ deal?.departments }}
                                    <span v-if="deal?.departments > 1">
                                        {{ $t('subscription.deal.departments') }}
                                    </span>
                                    <span v-else>
                                        {{ $t('subscription.deal.department') }}
                                    </span>

                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-3']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    {{ formatAmount(deal?.extra_users ?? 0) }} {{ $t('subscription.deal.forExtraUser')
                                    }}
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-3']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    {{ formatAmount(deal?.extra_departments ?? 0) }}
                                    {{ $t('subscription.deal.forExtraDepartment') }}
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-3']"
                                    v-if="index === 1">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    {{ $t('subscription.deal.recommended') }}
                                </li>
                            </ul>
                            <div class="mt-8">
                                <FormButton type="button" class="w-full" buttonStyle="primary" @click="subscribe(deal)"
                                    v-if="index === 0">
                                    {{ $t('subscription.deal.subscribe') }}
                                </FormButton>
                                <FormButton type="button" class="w-full" buttonStyle="white" @click="subscribe(deal)"
                                    v-else>
                                    {{ $t('subscription.deal.subscribe') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else v-if="!state.isDealsHidden">
                    <div
                        class="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        <div v-for="(deal, index) in state.deals?.data" :key="index"
                            :class="[deal.mostPopular ? 'ring-2 ring-indigo-600' : 'ring-1 ring-gray-200', 'rounded-3xl p-8 xl:p-10']">
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
                                <span class="text-base text-gray-500">
                                    /{{ frequency.value === 'monthly' ? $t('subscription.deal.month') :
                                        $t('subscription.deal.year')
                                    }}
                                </span>
                            </p>
                            <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600 sm:mt-10">
                                <li class="flex gap-x-3">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ deal?.storage_size }} {{ $t('subscription.deal.storageSize') }}
                                </li>
                                <li class="flex gap-x-3">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ formatAmount(deal?.extra_users) }}
                                    {{ $t('subscription.deal.forExtraUser') }}
                                </li>
                                <li class="flex gap-x-3">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ formatAmount(deal?.departments) }}
                                    {{ $t('subscription.deal.forExtraDepartment') }}
                                </li>
                            </ul>
                            <div class="mt-8">
                                <FormButton type="button" buttonStyle="primary" class="w-full" v-if="index === 0"
                                    @click="subscribe(deal)">
                                    {{ $t('subscription.deal.subscribe') }}
                                </FormButton>
                                <FormButton type="button" class="w-full" v-else @click="subscribe(deal)">
                                    {{ $t('subscription.deal.subscribe') }}
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

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
let error = router?.currentRoute?.value?.query?.error

const state = reactive({
    error: [],
    deals: [],
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

async function fetchDeals() {
    state.isPageLoading = true
    state.error = []
    try {
        const response = await dealService.getDeals()
        if (response) {
            state.deals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function subscribe(deal: any) {
    state.isPageLoading = true
    state.error = []
    error = ''
    try {
        const params = {
            'deal_uuid': deal.uuid,
            'type': frequency.value.value === 'monthly' ? 'monthly' : 'yearly',
        }
        const response = await userSubscriptionService.subscribe(params)
        if (response) {
            var checkoutOptions = {
                checkoutKey: runtimeConfig?.public?.checkoutKey,
                paymentId: response?.paymentId,
                containerId: "checkout-container-div",
                language: "en-GB",
                theme: {
                    buttonRadius: "5px"
                }
            }
            var checkout = new Dibs.Checkout(checkoutOptions)
            checkout.on('payment-completed', function (response: any) {
                const paymentId = response['paymentId']
                navigateTo(`/subscribed?paymentId=${paymentId}`)
            })
            state.isDealsHidden = true
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function formatAmount(amount: any) {
    // Convert the number to a string with two decimal places
    let numberStr = parseFloat(amount).toFixed(2)

    // Split the string into integer and decimal parts
    let parts = numberStr.split('.')
    let integerPart = parts[0]
    let decimalPart = parts[1]

    // Add the thousands separators
    let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Combine the integer part with the decimal part
    return 'DKK' + formattedIntegerPart + ',' + decimalPart
}
</script>