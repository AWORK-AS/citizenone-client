<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div id="cart-checkout" class="mx-auto max-w-sm md:max-w-md"></div>
        <div v-if="!state.isDealsHidden">
            <h3 class="py-3 text-sm font-semibold">
                {{ $t('subscription.addOnDeals.addOnDeals') }}
            </h3>
            <div class="bg-white divide-y divide-gray-100 ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_5rem_auto] items-center gap-x-3 gap-y-4 py-5">
                    <div>
                        <p class="font-semibold leading-6 text-tertiary">
                            {{ $t('subscription.addOnDeals.extraDepartment') }}
                        </p>
                        <div class="mt-1 flex flex-wrap items-center gap-x-1 text-xs leading-5 text-gray-500">
                            <p>
                                {{ formatAmount(isMonthly
                                    ? state.addOnDeals.department?.data?.monthly_price
                                    : state.addOnDeals.department?.data?.yearly_price) }}
                                <span class="lowercase">
                                    /{{ isMonthly ? $t('subscription.deal.month') : $t('subscription.deal.year') }}
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
                        <p class="leading-6 text-gray-900">
                            {{ formatAmount((isMonthly
                                ? state.addOnDeals.department?.data?.monthly_price
                                : state.addOnDeals.department?.data?.yearly_price) *
                                parseInt(state.formAddOn.department || '0')) }}
                        </p>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_5rem_auto] items-center gap-x-3 gap-y-4 py-5">
                    <div>
                        <p class="font-semibold leading-6 text-tertiary">
                            {{ $t('subscription.addOnDeals.extraUser') }}
                        </p>
                        <div class="mt-1 flex flex-wrap items-center gap-x-1 text-xs leading-5 text-gray-500">
                            <p>
                                {{ formatAmount(isMonthly
                                    ? state.addOnDeals.user?.data?.monthly_price
                                    : state.addOnDeals.user?.data?.yearly_price) }}
                                <span class="lowercase">
                                    /{{ isMonthly ? $t('subscription.deal.month') : $t('subscription.deal.year') }}
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
                        <p class="leading-6 text-gray-900">
                            {{ formatAmount((isMonthly
                                ? state.addOnDeals.user?.data?.monthly_price
                                : state.addOnDeals.user?.data?.yearly_price) *
                                parseInt(state.formAddOn.user || '0')) }}
                        </p>
                    </div>
                </div>
                <div class="flex justify-between py-5">
                    <p class="font-semibold">
                        {{ $t('subscription.addOnDeals.total') }}
                    </p>
                    <p>
                        <span class="font-semibold">{{ formatAmount(totalAmount) }}</span>
                        <span class="lowercase text-xs">
                            /{{ isMonthly ? $t('subscription.deal.month') : $t('subscription.deal.year') }}
                            {{ $t('excludeVat') }}
                        </span>
                    </p>
                </div>
                <fieldset v-if="canInvoice" class="pt-5" data-testid="add-on-pay-by">
                    <legend class="text-sm font-semibold text-gray-700">{{ $t('subscription.addOnDeals.invoiceOrder.payBy') }}</legend>
                    <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label v-for="option in (['card', 'invoice'] as const)" :key="option"
                            class="flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors"
                            :class="state.payBy === option ? 'border-[#0F4C75] bg-[#EEF4FB]' : 'border-gray-200 hover:bg-gray-50'">
                            <input type="radio" name="add_on_pay_by" :value="option" v-model="state.payBy" />
                            <Icon :name="option === 'card' ? 'ph:credit-card' : 'ph:file-text'" class="w-4 h-4 text-gray-500" aria-hidden="true" />
                            <span class="text-sm font-medium text-gray-800">{{ $t(`subscription.addOnDeals.invoiceOrder.${option}`) }}</span>
                        </label>
                    </div>
                    <p v-if="state.payBy === 'invoice'" class="mt-2 text-xs text-gray-500">
                        {{ $t(followsAgreement ? 'subscription.addOnDeals.invoiceOrder.helpAgreement' : 'subscription.addOnDeals.invoiceOrder.help') }}
                    </p>
                </fieldset>
                <div class="mt-8">
                    <FormButton v-if="payingByInvoice" type="button" buttonStyle="primary" class="w-full"
                        @click="handleInvoiceQuote" :disabled="!hasItemOnCart()" data-testid="add-on-order-invoice">
                        {{ $t('subscription.addOnDeals.invoiceOrder.order') }}
                    </FormButton>
                    <FormButton v-else type="button" buttonStyle="primary" class="w-full" @click="handleSaveCart"
                        :disabled="!hasItemOnCart()">
                        {{ $t('subscription.addOnDeals.checkout') }}
                    </FormButton>
                </div>
            </div>
            <div class="mt-5" v-if="!state.isDealsHidden && !payingByInvoice" @click="state.modal.isEnterCouponShow = true">
                <p class="text-center text-sm text-primary cursor-pointer hover:text-primary-700">
                    <span>{{ $t('subscription.coupon.enterYourCouponCodeHereForExclusiveSavings') }}!</span>
                </p>
            </div>
            <p class="text-center text-primary font-semibold"
                v-if="!state.isDealsHidden && couponStore.getAddOnCouponCode">
                {{ $t('subscription.coupon.form.couponCode') }}:
                {{ couponStore.getAddOnCouponCode }}
                <span class="text-xxs cursor-pointer hover:underline" @click="couponStore.resetAddOnCouponCode">
                    {{ $t('subscription.coupon.remove') }}
                </span>
            </p>
        </div>
        <DialogConfirmation :isModalOpen="state.modal.isInvoiceConfirmOpen"
            :title="$t('subscription.addOnDeals.invoiceOrder.confirmTitle')"
            :message="$t('subscription.addOnDeals.invoiceOrder.confirmIntro')"
            :confirmLabel="$t('subscription.addOnDeals.invoiceOrder.confirm')"
            @close="state.modal.isInvoiceConfirmOpen = false" @confirm="handleInvoiceOrder">
            <template #extra>
                <dl v-if="state.quote" class="mt-4 space-y-2 text-sm" data-testid="add-on-invoice-quote">
                    <div v-for="line in state.quote.lines" :key="line.type" class="flex justify-between gap-4">
                        <dt class="text-gray-600">
                            {{ line.quantity }} × {{ $t(line.type === 'user' ? 'subscription.addOnDeals.extraUser' : 'subscription.addOnDeals.extraDepartment') }}
                            <span v-if="line.free > 0" class="block text-xs text-gray-500">
                                {{ $t('subscription.addOnDeals.invoiceOrder.includedFree', { count: line.free }) }}
                            </span>
                        </dt>
                        <dd class="text-gray-900">{{ formatAmount(line.amount) }}</dd>
                    </div>
                    <div v-if="state.quote.fee > 0" class="flex justify-between gap-4">
                        <dt class="text-gray-600">{{ $t('subscription.addOnDeals.invoiceOrder.fee') }}</dt>
                        <dd class="text-gray-900">{{ formatAmount(state.quote.fee) }}</dd>
                    </div>
                    <div class="flex justify-between gap-4 border-t border-gray-200 pt-2">
                        <dt class="text-gray-600">{{ $t('subscription.addOnDeals.invoiceOrder.totalExclVat') }}</dt>
                        <dd class="text-gray-900">{{ formatAmount(state.quote.total_excl_vat) }}</dd>
                    </div>
                    <div class="flex justify-between gap-4 font-semibold">
                        <dt>{{ $t('subscription.addOnDeals.invoiceOrder.totalInclVat') }}</dt>
                        <dd>{{ formatAmount(state.quote.total_amount) }}</dd>
                    </div>
                    <p class="pt-2 text-xs text-gray-500">
                        {{ $t(state.quote.prorated ? 'subscription.addOnDeals.invoiceOrder.periodProrated' : 'subscription.addOnDeals.invoiceOrder.period', {
                            from: danishDate(state.quote.period_from), to: danishDate(state.quote.period_to) }) }}
                        {{ $t('subscription.addOnDeals.invoiceOrder.activatedNow') }}
                    </p>
                </dl>
            </template>
        </DialogConfirmation>
        <ModulesUserSubscriptionModalAddOnCoupon :isModalOpen="state.modal.isEnterCouponShow"
            @close="state.modal.isEnterCouponShow = false" />
        <DialogConfirmation :isModalOpen="state.modal.isUpgradeToProOpen" :title="$t('subscription.basisUserLimit.title')"
            :message="state.error?.message + ' ' + $t('subscription.basisUserLimit.confirmUpgrade')"
            @close="state.modal.isUpgradeToProOpen = false" @confirm="navigateTo('/subscription/subscribe')" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { addOnDealsService } from '@/components/api/user/AddOnDealsService'
import { billingService } from '@/components/api/user/BillingService'
import {
    canOrderByInvoice,
    danishDate,
    errorMessageKey,
    licenseOrderPayload,
    type LicenseOrderQuote,
} from '@/composables/billingMethod'
import { useAlert } from '@/composables/alert'
import { cartService } from '@/components/api/user/CartService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useUserStore } from '@/store/user'
import { useCouponStore } from '@/store/coupon'
import { isBasisUserLimitError } from '@/utils/basisUserLimit'
import type { Error } from '@/types'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { formatAmount } = useAmountFormatter()
const couponStore = useCouponStore()
const { successAlert } = useAlert()
const userStore = useUserStore() as any
let checkout = null as any

const isMonthly = computed(() => ['monthly', 'custom_monthly'].includes(userStore.getUser?.user_subscription?.type))

const totalAmount = computed(() => {
    const deptPrice = isMonthly.value
        ? state.addOnDeals.department?.data?.monthly_price
        : state.addOnDeals.department?.data?.yearly_price
    const userPrice = isMonthly.value
        ? state.addOnDeals.user?.data?.monthly_price
        : state.addOnDeals.user?.data?.yearly_price
    return (deptPrice ?? 0) * parseInt(state.formAddOn.department || '0')
        + (userPrice ?? 0) * parseInt(state.formAddOn.user || '0')
})

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
    modal: {
        isEnterCouponShow: false,
        isUpgradeToProOpen: false,
        isInvoiceConfirmOpen: false,
    },
    // Invoice ordering, offered next to the card cart when the API says so.
    billingStatus: null as any,
    payBy: 'card' as 'card' | 'invoice',
    quote: null as LicenseOrderQuote | null,
    // One key per confirmation: a double click or a retry never raises a second invoice.
    orderKey: '',
})

const canInvoice = computed(() => canOrderByInvoice(state.billingStatus))
const followsAgreement = computed(() => state.billingStatus?.license_orders_follow_agreement === true)
const payingByInvoice = computed(() => canInvoice.value && state.payBy === 'invoice')

onMounted(() => {
    fetchAddOnDepartment()
    fetchAddOnUser()
    fetchCart()
    fetchBillingStatus()
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
        if (state.formAddOn.department !== '' && parseInt(state.formAddOn.department) > -1) {
            const params = {
                addon_uuid: state.addOnDeals.department?.data?.uuid,
                quantity: state.formAddOn.department,
            }
            await cartService.saveCart(params)
        }
        if (state.formAddOn.user !== '' && parseInt(state.formAddOn.user) > -1) {
            const params = {
                addon_uuid: state.addOnDeals.user?.data?.uuid,
                quantity: state.formAddOn.user,
            }
            await cartService.saveCart(params)
        }
        const params = {
            coupon_code: couponStore.getAddOnCouponCode,
        }
        const response = await cartService.checkoutCart(params)
        if (response?.paymentId) {
            const checkoutOptions = {
                checkoutKey: runtimeConfig?.public?.checkoutKey,
                paymentId: response.paymentId,
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
        } else {
            state.error = { message: t('subscription.addOnDeals.couldNotStartCheckout') } as Error
        }
    } catch (error: any) {
        state.error = error
        if (isBasisUserLimitError(error?.message)) {
            state.modal.isUpgradeToProOpen = true
        }
    }
    state.isPageLoading = false
}

async function fetchBillingStatus() {
    try {
        const response = await billingService.getStatus()
        state.billingStatus = response?.data ?? response ?? null
    } catch (_) {
        // Without the standing only the card cart is offered, as before.
        state.billingStatus = null
    }
}

function orderError(error: any): Error {
    const key = errorMessageKey(error)
    return { message: key ? t(key) : (error?.message || t('subscription.addOnDeals.invoiceOrder.failed')) } as Error
}

async function handleInvoiceQuote() {
    state.isPageLoading = true
    state.error = {}
    try {
        const { users, departments } = licenseOrderPayload(state.formAddOn, '')
        state.quote = await billingService.getLicenseOrderQuote({ users, departments })
        state.orderKey = crypto.randomUUID()
        state.modal.isInvoiceConfirmOpen = true
    } catch (error: any) {
        state.error = orderError(error)
        if (isBasisUserLimitError(error?.message)) {
            state.modal.isUpgradeToProOpen = true
        }
    }
    state.isPageLoading = false
}

async function handleInvoiceOrder() {
    state.isPageLoading = true
    state.error = {}
    try {
        const result = await billingService.orderLicenses(licenseOrderPayload(state.formAddOn, state.orderKey))
        successAlert(`${t('alert.success')}!`, result?.invoice_number
            ? t('subscription.addOnDeals.invoiceOrder.done', { number: result.invoice_number, date: danishDate(result.due_on) })
            : t('subscription.addOnDeals.invoiceOrder.doneFree'))

        // The card cart may still hold the same quantities; empty it so they are not bought twice.
        await Promise.allSettled([
            state.addOnDeals.department?.data?.uuid && cartService.saveCart({ addon_uuid: state.addOnDeals.department.data.uuid, quantity: 0 }),
            state.addOnDeals.user?.data?.uuid && cartService.saveCart({ addon_uuid: state.addOnDeals.user.data.uuid, quantity: 0 }),
        ])
        state.formAddOn.department = ''
        state.formAddOn.user = ''
        state.quote = null
        state.orderKey = ''
        await refreshNuxtData()
    } catch (error: any) {
        state.error = orderError(error)
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
    return totalAmount.value > 0
}
</script>