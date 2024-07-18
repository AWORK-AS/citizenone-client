<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('subscription.subscription') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('subscription.subscription') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div v-if="userStore.getUser?.user_subscription === null">
                    <div class="isolate mx-auto mt-10 grid max-w-lg">
                        <div class="ring-1 ring-gray-200 rounded-3xl p-8 xl:p-10">
                            <h3 class="text-xl font-semibold leading-7">
                                {{ $t('subscription.noSubscription.noActiveSubscription') }}
                            </h3>
                            <p class="mt-4 text-sm text-gray-600 leading-6">
                                {{
                                    $t('subscription.noSubscription.itLooksLikeYouDontHaveAnActiveSubscriptionAtTheMoment')
                                }}.
                            </p>
                            <p class="mt-2 text-sm text-gray-600 leading-6">
                                {{ $t('subscription.noSubscription.toEnjoyOurFullRangeOfServicesAndBenefits') }}.
                            </p>
                            <div class="mt-6">
                                <FormButton type="button" buttonStyle="primary" class="w-full"
                                    @click="navigateTo('/subscribe')">
                                    {{ $t('subscription.noSubscription.subscribeNow') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div class="lg:flex gap-8">
                        <div class="isolate mt-10 w-full max-w-md">
                            <h3 class="py-3 text-sm font-semibold">
                                {{ $t('subscription.currentSubscription') }}
                            </h3>
                            <div class="ring-1 ring-gray-200 rounded-3xl p-8 xl:p-10">
                                <div class="flex items-center justify-between gap-x-4">
                                    <h3 class="text-base font-semibold leading-7 text-tertiary">
                                        {{ userStore.getUser?.user_subscription?.deal?.name }}
                                    </h3>
                                </div>
                                <p class="text-gray-600 mt-6 text-base leading-7">
                                    <span v-if="userStore.getUser?.user_subscription?.deal?.name === 'Basis'">
                                        {{ $t('subscription.deal.thePerfectPlan') }}.
                                    </span>
                                    <span v-else>
                                        {{ $t('subscription.deal.aPlanThatScales') }}.
                                    </span>
                                </p>
                                <p class="mt-4 flex items-baseline gap-x-2">
                                    <span class="text-3xl font-bold tracking-tight text-gray-900">
                                        {{ userStore.getUser?.user_subscription?.type === 'monthly' ?
                                            formatAmount(userStore.getUser?.user_subscription?.deal?.monthly_price) :
                                            formatAmount(userStore.getUser?.user_subscription?.deal?.yearly_price) }}
                                    </span>
                                    <span class="text-base text-gray-500 lowercase">
                                        /{{ userStore.getUser?.user_subscription?.type === 'monthly' ?
                                            $t('subscription.deal.month') :
                                            $t('subscription.deal.year')
                                        }}
                                    </span>
                                </p>
                                <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600 sm:mt-10">
                                    <li class="flex gap-x-2">
                                        <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                            aria-hidden="true" />
                                        {{ userStore.getUser?.user_subscription?.deal?.storage_size }}
                                        {{ $t('subscription.deal.storageSize') }}
                                    </li>
                                    <li class="flex gap-x-2">
                                        <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                            aria-hidden="true" />
                                        {{ userStore.getUser?.user_subscription?.deal?.departments }}
                                        <span v-if="userStore.getUser?.user_subscription?.deal?.departments > 1">
                                            {{ $t('subscription.deal.departments') }}
                                        </span>
                                        <span v-else>
                                            {{ $t('subscription.deal.department') }}
                                        </span>
                                    </li>
                                    <li class="flex gap-x-2">
                                        <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                            aria-hidden="true" />
                                        {{ userStore.getUser?.user_subscription?.deal?.users }}
                                        <span v-if="userStore.getUser?.user_subscription?.deal?.users > 1">
                                            {{ $t('subscription.deal.users') }}
                                        </span>
                                        <span v-else>
                                            {{ $t('subscription.deal.user') }}
                                        </span>
                                    </li>
                                </ul>
                                <div class="mt-8">
                                    <FormButton type="button" buttonStyle="primary" class="w-full"
                                        @click="navigateTo('/subscribe')"
                                        v-if="!userStore.getUser?.user_subscription?.is_max">
                                        {{ $t('subscription.upgrade') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                        <div class="mt-10 w-full">
                            <h3 class="py-3 text-sm font-semibold">Add on deals</h3>
                            <div class="divide-y divide-gray-100 ring-1 ring-gray-200 rounded-3xl p-8 xl:p-10">
                                <div class="grid grid-cols-1 lg:grid-cols-3 items-center gap-x-6 gap-y-4 py-5">
                                    <div>
                                        <p class="font-semibold leading-6 text-tertiary">
                                            {{ state.addOnDeals.department?.data?.name }}
                                        </p>
                                        <div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                            <p>
                                                {{ formatAmount(state.addOnDeals.department?.data?.monthly_price) }}
                                                <span class="lowercase">/{{ $t('subscription.deal.month') }}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex items-center lg:justify-end">
                                        <FormNumberField name="department" placeholder="0"
                                            @input="validateDepartmentQuantity" />
                                    </div>
                                    <div class="flex items-center lg:justify-end">
                                        <p class="leading-6 text-gray-900">
                                            {{ formatAmount(state.addOnDeals.department?.data?.monthly_price *
                                                parseInt(state.formAddOn.department === '' ? '0' :
                                                    state.formAddOn.department)) }}
                                        </p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 lg:grid-cols-3 items-center gap-x-6 gap-y-4 py-5">
                                    <div>
                                        <p class="font-semibold leading-6 text-tertiary">
                                            {{ state.addOnDeals.user?.data?.name }}
                                        </p>
                                        <div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                            <p>
                                                {{ formatAmount(state.addOnDeals.user?.data?.monthly_price) }}
                                                <span class="lowercase">/{{ $t('subscription.deal.month') }}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex items-center lg:justify-end">
                                        <FormNumberField name="user" placeholder="0" @input="validateUserQuantity" />
                                    </div>
                                    <div class="flex items-center lg:justify-end">
                                        <p class="leading-6 text-gray-900">
                                            {{ formatAmount(state.addOnDeals.user?.data?.monthly_price *
                                                parseInt(state.formAddOn.user === '' ? '0' :
                                                    state.formAddOn.user)) }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex justify-between py-5">
                                    <p class="font-semibold">
                                        {{ $t('subscription.addOnDeals.total') }}
                                    </p>
                                    <p class="font-semibold">
                                        {{ formatAmount((state.addOnDeals.department?.data?.monthly_price *
                                            parseInt(state.formAddOn.department === '' ? '0' :
                                                state.formAddOn.department) + (state.addOnDeals.user?.data?.monthly_price *
                                                    parseInt(state.formAddOn.user === '' ? '0' :
                                                        state.formAddOn.user)))) }}
                                    </p>
                                </div>
                                <div class="mt-8">
                                    <FormButton type="button" buttonStyle="primary" class="w-full">
                                        {{ $t('subscription.addOnDeals.pay') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { addOnDealsService } from '@/components/api/AddOnDealsService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/src/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()

const state = reactive({
    error: {} as Error,
    addOnDeals: {
        department: [],
        user: []
    },
    formAddOn: {
        department: '',
        user: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchAddOnDepartment()
    fetchAddOnUser()
})

async function fetchAddOnDepartment() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await addOnDealsService.getDepartmentAddOnDeals()
        if (response) {
            state.addOnDeals.department = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAddOnUser() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await addOnDealsService.getUserAddOnDeals()
        if (response) {
            state.addOnDeals.user = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function validateDepartmentQuantity(event: Event) {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 10)
    state.formAddOn.department = input.value
}

function validateUserQuantity(event: Event) {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 10)
    state.formAddOn.user = input.value
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
    return 'DKK ' + formattedIntegerPart + ',' + decimalPart
}
</script>