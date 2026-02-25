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
                <div id="subscribe-checkout"></div>
                <div class="mx-auto max-w-sm md:max-w-md mt-8" v-if="!state.isDealsHidden">
                    <div class="flex justify-center">
                        <fieldset aria-label="Payment method">
                            <RadioGroup v-model="paymentMethod"
                                class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                <RadioGroupOption as="template" v-for="option in paymentMethods" :key="option.value"
                                    :value="option.value" v-slot="{ checked }">
                                    <div
                                        :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-2.5 py-1']">
                                        {{ option.label }}
                                    </div>
                                </RadioGroupOption>
                            </RadioGroup>
                        </fieldset>
                    </div>
                </div>
                <div class="mx-auto max-w-sm md:max-w-md mt-16 relative"
                    v-if="!state.isDealsHidden && userStore.getUser?.user_subscription?.type !== 'yearly'">
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
                                    {{ $t('subscription.deal.goodForASmallTeam') }} 🤝
                                </span>
                                <span v-else>
                                    {{ $t('subscription.deal.perfectForLargerCompanies') }} 🚀
                                </span>
                            </p>

                            <ul role="list"
                                :class="[index === 1 ? 'text-gray-300' : 'text-gray-600', 'mt-8 space-y-3 text-sm leading-6 sm:mt-10']">
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2 lowercase']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span>
                                        {{ deal?.admin }}
                                        {{ deal?.admin > 1 ? $t('subscription.deal.admins') :
                                            $t('subscription.deal.admin') }}
                                    </span>
                                    <Tooltip :text="$t('subscription.deal.youCanHaveMultipleAdmins')"
                                        class="cursor-help flex items-center">
                                        <Icon name="ph:info" class="h-4 w-4" aria-hidden="true" />
                                    </Tooltip>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2 lowercase']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span>
                                        {{ deal?.users }}
                                        {{ deal?.users > 1 ? $t('subscription.deal.users') :
                                            $t('subscription.deal.user') }}
                                        {{ $t('subscription.deal.included') }}.
                                    </span>
                                    <Tooltip
                                        :text="$t('subscription.deal.additionalPurchaseFor') + ' ' + formatKrAmount(deal?.extra_users) + ' /md'"
                                        class="cursor-help flex items-center">
                                        <Icon name="ph:info" class="h-4 w-4" aria-hidden="true" />
                                    </Tooltip>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2 lowercase']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span class="lowercase">
                                        {{ deal?.users }}
                                        {{ deal?.departments > 1 ? $t('subscription.deal.departments') :
                                            $t('subscription.deal.department') }}
                                        {{ $t('subscription.deal.included') }}.
                                    </span>
                                    <Tooltip
                                        :text="$t('subscription.deal.additionalPurchaseFor') + ' ' + formatKrAmount(deal?.extra_departments) + ' /md'"
                                        class="cursor-help flex items-center">
                                        <Icon name="ph:info" class="h-4 w-4" aria-hidden="true" />
                                    </Tooltip>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    {{ $t('subscription.deal.unlimitedNumberOfCitizens') }}
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
                    <!-- Done here -->
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
                                    {{ $t('subscription.deal.goodForASmallTeam') }} 🤝
                                </span>
                                <span v-else>
                                    {{ $t('subscription.deal.perfectForLargerCompanies') }} 🚀
                                </span>
                            </p>

                            <ul role="list"
                                :class="[index === 1 ? 'text-gray-300' : 'text-gray-600', 'mt-8 space-y-3 text-sm leading-6 sm:mt-10']">
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2 lowercase']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span>
                                        {{ deal?.admin }}
                                        {{ deal?.admin > 1 ? $t('subscription.deal.admins') :
                                            $t('subscription.deal.admin') }}
                                    </span>
                                    <Tooltip :text="$t('subscription.deal.youCanHaveMultipleAdmins')"
                                        class="cursor-help flex items-center">
                                        <Icon name="ph:info" class="h-4 w-4" aria-hidden="true" />
                                    </Tooltip>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2 lowercase']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span>
                                        {{ deal?.users }}
                                        {{ deal?.users > 1 ? $t('subscription.deal.users') :
                                            $t('subscription.deal.user') }}
                                        {{ $t('subscription.deal.included') }}.
                                    </span>
                                    <Tooltip
                                        :text="$t('subscription.deal.additionalPurchaseFor') + ' ' + formatKrAmount(deal?.extra_users) + ' /md'"
                                        class="cursor-help flex items-center">
                                        <Icon name="ph:info" class="h-4 w-4" aria-hidden="true" />
                                    </Tooltip>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2 lowercase']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    <span class="lowercase">
                                        {{ deal?.users }}
                                        {{ deal?.departments > 1 ? $t('subscription.deal.departments') :
                                            $t('subscription.deal.department') }}
                                        {{ $t('subscription.deal.included') }}.
                                    </span>
                                    <Tooltip
                                        :text="$t('subscription.deal.additionalPurchaseFor') + ' ' + formatKrAmount(deal?.extra_departments) + ' /md'"
                                        class="cursor-help flex items-center">
                                        <Icon name="ph:info" class="h-4 w-4" aria-hidden="true" />
                                    </Tooltip>
                                </li>
                                <li :class="[index === 1 ? 'text-white' : 'text-primary', 'flex gap-x-2']">
                                    <Icon name="ph:check"
                                        :class="[index === 1 ? 'text-white' : 'text-primary', 'h-6 w-5 flex-none']"
                                        aria-hidden="true" />
                                    {{ $t('subscription.deal.unlimitedNumberOfCitizens') }}
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
                                    {{ $t('subscription.deal.goodForASmallTeam') }} 🤝
                                </span>
                                <span v-else>
                                    {{ $t('subscription.deal.perfectForLargerCompanies') }} 🚀
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
            <StripePaymentModal
                :isOpen="state.modal.isStripePaymentOpen"
                :amount="state.stripe.amount"
                :invoiceId="state.stripe.reference"
                :citizenId="state.stripe.citizenId"
                :metadata="state.stripe.metadata"
                :clientSecret="state.stripe.clientSecret"
                @close="state.modal.isStripePaymentOpen = false"
                @paymentSuccess="handleStripeSuccess"
                @paymentError="handleStripeError"
            />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { dealService } from '@/components/api/user/DealService'
import { userSubscriptionService } from '@/components/api/user/UserSubscriptionService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useI18n } from "vue-i18n"
import { useCouponStore } from '@/store/coupon'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
import StripePaymentModal from '@/components/stripe/StripePaymentModal.vue'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
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
        isStripePaymentOpen: false,
    },
        stripe: {
        amount: 0,
        citizenId: '',
        reference: '',
        metadata: {} as Record<string, string | number | boolean | null>,
        clientSecret: '',
    }
})

const paymentMethods = [
    { value: 'dibs', label: 'DIBS' },
    { value: 'stripe', label: 'Stripe' },
]
const paymentMethod = ref(paymentMethods[0].value)

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
    if (paymentMethod.value === 'stripe') {
        openStripePayment(deal)
        return
    }
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
        if (response) {
            const checkoutOptions = {
                checkoutKey: runtimeConfig?.public?.checkoutKey,
                paymentId: response?.paymentId,
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
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function openStripePayment(deal: any) {
    state.isPageLoading = true
    state.error = {}

    try {
        const response = await userSubscriptionService.createStripePayment({
            deal_uuid: deal.uuid, // backend forventer deal_uuid
            payment_type: frequency.value.value === 'monthly' ? 'monthly' : 'yearly',
            citizen_id: userStore.getUser?.citizen_id ?? null,
        })

        if (!response?.client_secret) {
            throw new Error('Failed to initialize Stripe payment.')
        }

        state.stripe = {
            amount: response.amount,
            citizenId: userStore.getUser?.citizen_id ?? '',
            reference: deal?.name ?? 'Subscription',
            metadata: {
                type: 'subscription',
                deal_uuid: deal.uuid,
                frequency: frequency.value.value,
                coupon_code: couponStore.getDealCouponCode ?? null,
            },
            clientSecret: response.client_secret,
        }

        state.modal.isStripePaymentOpen = true

    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}


function getDealAmountKroner(deal: any): number {
    const isMonthly = frequency.value.value === 'monthly'
    const price = isMonthly ? Number(deal?.monthly_price ?? 0) : Number(deal?.yearly_price ?? 0)
    return Math.round(price * 100)
}

function handleStripeSuccess() {
    state.modal.isStripePaymentOpen = false
    navigateTo('/subscription/subscribed-successfully?paymentMethod=stripe')
}

function handleStripeError(message: string) {
    state.error = { message } as Error
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