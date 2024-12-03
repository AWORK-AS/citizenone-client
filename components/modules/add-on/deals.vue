<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div id="cart-checkout"></div>
        <div v-if="!state.isDealsHidden">
            <h3 class="py-3 text-sm font-semibold">
                {{ $t('subscription.addOnDeals.addOnDeals') }}
            </h3>
            <div class="bg-white divide-y divide-gray-100 ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                <div class="grid grid-cols-1 lg:grid-cols-3 items-center gap-x-6 gap-y-4 py-5">
                    <div>
                        <p class="font-semibold leading-6 text-tertiary">
                            {{ $t('subscription.addOnDeals.extraDepartment') }}
                        </p>
                        <div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                            <p v-if="userStore.getUser?.user_subscription?.type === 'monthly'">
                                {{ formatAmount(state.addOnDeals.department?.data?.monthly_price) }}
                                <span class="lowercase">
                                    /{{ $t('subscription.deal.month') }}
                                    {{ $t('excludeVat') }}
                                </span>
                            </p>
                            <p v-if="userStore.getUser?.user_subscription?.type === 'yearly'">
                                {{ formatAmount(state.addOnDeals.department?.data?.yearly_price) }}
                                <span class="lowercase">
                                    /{{ $t('subscription.deal.year') }}
                                    {{ $t('excludeVat') }}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center lg:justify-end">
                        <FormNumberField name="department" placeholder="0" v-model="state.formAddOn.department"
                            @input="validateDepartmentQuantity" />
                    </div>
                    <div class="flex items-center lg:justify-end">
                        <p class="leading-6 text-gray-900"
                            v-if="userStore.getUser?.user_subscription?.type === 'monthly'">
                            {{ formatAmount(state.addOnDeals.department?.data?.monthly_price *
                                parseInt(state.formAddOn.department === '' ? '0' :
                                    state.formAddOn.department)) }}
                        </p>
                        <p class="leading-6 text-gray-900"
                            v-if="userStore.getUser?.user_subscription?.type === 'yearly'">
                            {{ formatAmount(state.addOnDeals.department?.data?.yearly_price *
                                parseInt(state.formAddOn.department === '' ? '0' :
                                    state.formAddOn.department)) }}
                        </p>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 items-center gap-x-6 gap-y-4 py-5">
                    <div>
                        <p class="font-semibold leading-6 text-tertiary">
                            {{ $t('subscription.addOnDeals.extraUser') }}
                        </p>
                        <div class="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                            <p v-if="userStore.getUser?.user_subscription?.type === 'monthly'">
                                {{ formatAmount(state.addOnDeals.user?.data?.monthly_price) }}
                                <span class="lowercase">
                                    /{{ $t('subscription.deal.month') }}
                                    {{ $t('excludeVat') }}
                                </span>
                            </p>
                            <p v-if="userStore.getUser?.user_subscription?.type === 'yearly'">
                                {{ formatAmount(state.addOnDeals.user?.data?.yearly_price) }}
                                <span class="lowercase">
                                    /{{ $t('subscription.deal.year') }}
                                    {{ $t('excludeVat') }}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center lg:justify-end">
                        <FormNumberField name="user" placeholder="0" v-model="state.formAddOn.user"
                            @input="validateUserQuantity" />
                    </div>
                    <div class="flex items-center lg:justify-end">
                        <p class="leading-6 text-gray-900"
                            v-if="userStore.getUser?.user_subscription?.type === 'monthly'">
                            {{ formatAmount(state.addOnDeals.user?.data?.monthly_price *
                                parseInt(state.formAddOn.user === '' ? '0' :
                                    state.formAddOn.user)) }}
                        </p>
                        <p class="leading-6 text-gray-900"
                            v-if="userStore.getUser?.user_subscription?.type === 'yearly'">
                            {{ formatAmount(state.addOnDeals.user?.data?.yearly_price *
                                parseInt(state.formAddOn.user === '' ? '0' :
                                    state.formAddOn.user)) }}
                        </p>
                    </div>
                </div>
                <div class="flex justify-between py-5">
                    <p class="font-semibold">
                        {{ $t('subscription.addOnDeals.total') }}
                    </p>
                    <p v-if="userStore.getUser?.user_subscription?.type === 'monthly'">
                        <span class="font-semibold">
                            {{ formatAmount((state.addOnDeals.department?.data?.monthly_price *
                                parseInt(state.formAddOn.department === '' ? '0' :
                                    state.formAddOn.department) + (state.addOnDeals.user?.data?.monthly_price *
                                        parseInt(state.formAddOn.user === '' ? '0' :
                                            state.formAddOn.user)))) }}
                        </span>
                        <span class="lowercase text-xs">
                            /{{ $t('subscription.deal.month') }}
                            {{ $t('excludeVat') }}
                        </span>
                    </p>
                    <p v-if="userStore.getUser?.user_subscription?.type === 'yearly'">
                        <span class="font-semibold">
                            {{ formatAmount((state.addOnDeals.department?.data?.yearly_price *
                                parseInt(state.formAddOn.department === '' ? '0' :
                                    state.formAddOn.department) + (state.addOnDeals.user?.data?.yearly_price *
                                        parseInt(state.formAddOn.user === '' ? '0' :
                                            state.formAddOn.user)))) }}
                        </span>
                        <span class="lowercase text-xs">
                            /{{ $t('subscription.deal.year') }}
                            {{ $t('excludeVat') }}
                        </span>
                    </p>
                </div>
                <div class="mt-8">
                    <FormButton type="button" buttonStyle="primary" class="w-full" @click="handleSaveCart"
                        :disabled="!hasItemOnCart()">
                        {{ $t('subscription.addOnDeals.checkout') }}
                    </FormButton>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { addOnDealsService } from '@/components/api/AddOnDealsService'
import { cartService } from '@/components/api/CartService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const userStore = useUserStore() as any
let checkout = null as any

const state = reactive({
    error: {} as Error,
    addOnDeals: {
        department: [],
        user: []
    } as any,
    isDealsHidden: false,
    formAddOn: {
        department: '',
        user: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchAddOnDepartment()
    fetchAddOnUser()
    fetchCart()
})

onUnmounted(() => {
    // Cleanup checkout instance when component is unmounted
    if (checkout) {
        checkout.cleanup()
    }
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

async function fetchCart() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await cartService.getCart()
        if (response) {
            response?.data?.forEach((cart: any) => {
                if (cart?.add_on?.type === 'department') {
                    state.formAddOn.department = cart?.quantity.toString()
                } else if (cart?.add_on?.type === 'user') {
                    state.formAddOn.user = cart?.quantity.toString()
                }
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function handleSaveCart() {
    state.isPageLoading = true
    state.error = {}
    try {
        if (state.formAddOn.department !== '' && parseInt(state.formAddOn.department) > 0) {
            const params = {
                'addon_uuid': state.addOnDeals.department?.data?.uuid,
                'quantity': state.formAddOn.department
            }
            await cartService.saveCart(params)
        }
        if (state.formAddOn.user !== '' && parseInt(state.formAddOn.user) > 0) {
            const params = {
                'addon_uuid': state.addOnDeals.user?.data?.uuid,
                'quantity': state.formAddOn.user
            }
            await cartService.saveCart(params)
        }
        const response = await cartService.checkoutCart()
        if (response) {
            const checkoutOptions = {
                checkoutKey: runtimeConfig?.public?.checkoutKey,
                paymentId: response?.paymentId,
                containerId: "cart-checkout",
                language: "da-DK",
                theme: {
                    buttonRadius: "5px"
                }
            }
            checkout = new Dibs.Checkout(checkoutOptions)
            checkout.on('payment-completed', function (response: any) {
                checkout.cleanup()
                const paymentId = response['paymentId']
                navigateTo(`/subscription/add-on-payment-successful?paymentId=${paymentId}`)
            })
            state.isDealsHidden = true
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

function hasItemOnCart() {
    return (state.addOnDeals.department?.data?.monthly_price *
        parseInt(state.formAddOn.department === '' ? '0' :
            state.formAddOn.department) + (state.addOnDeals.user?.data?.monthly_price *
                parseInt(state.formAddOn.user === '' ? '0' :
                    state.formAddOn.user))) > 0
}
</script>