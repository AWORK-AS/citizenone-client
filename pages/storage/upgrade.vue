<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.tabs.storage') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.tabs.storage') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-5">
                    <div class="max-w-3xl">
                        <div class="space-y-5">
                            <Alert type="danger" :text="error" v-if="error && error.length > 0" />
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                        </div>
                    </div>
                    <div id="upgrade-checkout"></div>
                    <div class="max-w-3xl" v-if="!state.isDealsHidden && paymentMethods.length > 1">
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
                    <div class="max-w-3xl" v-if="!state.isDealsHidden">
                        <div class="space-y-5">
                            <div class="space-y-2">
                                <p class="text-sm font-medium">
                                    {{ $t('storage.currentPlan') }}
                                </p>
                                <div class="space-y-3">
                                    <div class="bg-white shadow-md p-6 rounded-md space-y-2">
                                        <h2 class="text-sm mb-2 text-primary flex justify-between">
                                            {{ $t('storage.storage') }}
                                            ({{ state.usage?.total_storage }})
                                        </h2>
                                        <div class="space-y-2 text-xs text-white">
                                            <div class="w-full bg-gray-200 rounded-full overflow-hidden">
                                                <div class="h-4 bg-yellow-500 rounded-full"
                                                    :style="{ width: `${usedStoragePercentage}%` }">
                                                </div>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="inline-block w-3 h-3 bg-yellow-500 mr-2"></span>
                                                <span class="text-gray-800">
                                                    {{ $t('storage.documents') }} {{ state.usage?.used_storage }}
                                                </span>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="inline-block w-3 h-3 bg-gray-300 mr-2"></span>
                                                <span class="text-gray-800">
                                                    {{ $t('storage.available') }} {{ state.usage?.available_storage }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="bg-white shadow-md p-6 rounded-md space-y-2">
                                        <ul class="list-disc list-inside text-sm text-gray-600"
                                            v-if="language.locale.value === 'en'">
                                            <li>
                                                1 GB is around 5,000 files
                                            </li>
                                            <li>
                                                3 GB is around 15,000 files
                                            </li>
                                            <li>
                                                5 GB is around 25,000 files
                                            </li>
                                            <li>
                                                10 GB is around 50,000 files
                                            </li>
                                            <li>
                                                20 GB is around 100,000 files
                                            </li>
                                        </ul>
                                        <ul class="list-disc list-inside text-sm text-gray-600"
                                            v-if="language.locale.value === 'dk'">
                                            <li>
                                                1 GB er omkring 5.000 filer
                                            </li>
                                            <li>
                                                3 GB er omkring 15.000 filer
                                            </li>
                                            <li>
                                                5 GB er omkring 25.000 filer
                                            </li>
                                            <li>
                                                10 GB er omkring 50.000 filer
                                            </li>
                                            <li>
                                                20 GB er omkring 100.000 filer
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <div class="space-y-5">
                                    <div v-for="(deal, index) in state.storageDeals?.data" :key="index">
                                        <div
                                            class="bg-white shadow-md p-6 rounded-md flex justify-between items-center gap-x-3">
                                            <div>
                                                <h3 class="text-base font-semibold leading-7 text-tertiary">
                                                    {{ deal?.name }}
                                                </h3>
                                                <div>
                                                    <span class="text-lg font-bold tracking-tight">
                                                        {{ formatAmount(deal?.monthly_price) }}
                                                    </span>
                                                    <span class="text-gray-500 text-sm leading-7 lowercase">
                                                        /{{ $t('storage.month') }}
                                                        {{ $t('excludeVat') }}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <FormButton class="rounded-md" @click="upgrade(deal)">
                                                    {{ $t('storage.upgrade') }}
                                                </FormButton>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="bg-white shadow-md p-6 rounded-md flex justify-between items-center gap-x-3">
                                        <p>{{ $t('storage.doYouNeedMoreStorage') }}?</p>
                                        <div>
                                            <FormButton class="rounded-md" @click="state.modal.isContactUsOpen = true">
                                                {{ $t('storage.contactUs') }}
                                            </FormButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
            <ModulesUserStorageModalContactUs :isModalOpen="state.modal.isContactUsOpen"
                @close="state.modal.isContactUsOpen = false" />
            <StripePaymentModal
                :isOpen="state.modal.isStripePaymentOpen"
                :clientSecret="state.stripe.clientSecret"
                :amount="state.stripe.amount"
                :invoiceId="state.stripe.invoiceId"
                :invoiceStripeId="state.stripe.invoiceId"
                :itemDescription="state.stripe.itemDescription"
                :citizenId="state.stripe.citizenId"
                :dealUuid="state.stripe.dealUuid"
                :paymentType="state.stripe.paymentType"
                :metadata="state.stripe.metadata"
                @close="state.modal.isStripePaymentOpen = false"
                @paymentSuccess="handleStripeSuccess"
                @paymentError="handleStripeError"
            />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { addOnDealsService } from '@/components/api/user/AddOnDealsService'
import { userSubscriptionService } from '@/components/api/user/UserSubscriptionService'
import { storageService } from '@/components/api/user/StorageService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useUserStore } from '@/store/user'
import StripePaymentModal from '@/components/stripe/StripePaymentModal.vue'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const language = useI18n()
const userStore = useUserStore() as any
let checkout = null as any
const router = useRouter()
let error: string | undefined = router?.currentRoute?.value?.query?.error as string | undefined
const breadcrumbLinks = [
    {
        name: 'settings.tabs.storage',
        translate: true,
        href: '/storage/upgrade',
    },
]

const state = reactive({
    error: {} as Error,
    isDealsHidden: false,
    isPageLoading: false,
    modal: {
        isContactUsOpen: false,
        isStripePaymentOpen: false,
    },
    storageDeals: [] as any,
    usage: [] as any,

    stripe: {
        amount: 0,
        citizenId: '',
        reference: '',
        dealUuid: '',
        paymentType: '',
        invoiceId: '',
        itemDescription: '',
        metadata: {} as Record<string, string | number | boolean | null>,
        clientSecret: '',
    },
})

// Only show Stripe if it's activated (publishable key configured)
const isStripeEnabled = computed(() => !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const paymentMethods = computed(() => {
    const methods = [{ value: 'dibs', label: 'DIBS' }]
    if (isStripeEnabled.value) {
        methods.push({ value: 'stripe', label: 'Stripe' })
    }
    return methods
})

const paymentMethod = ref<'dibs' | 'stripe'>('dibs')

onMounted(() => {
    fetchStorageDeals()
    fetchCitizenFileFolderCurrentUsage()
})

onUnmounted(() => {
    // Cleanup checkout instance when component is unmounted
    if (checkout) {
        checkout.cleanup()
    }
})

const usedStoragePercentage = computed(() => {
    const availableStorage = state.usage?.available_storage?.replace(/\s+GB/g, '')
    const totalStorage = state.usage?.total_storage?.replace(/\s+GB/g, '')
    if (availableStorage && totalStorage) {
        return (totalStorage - availableStorage) * 100
    }
})

async function fetchStorageDeals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await addOnDealsService.getStorageAddOnDeals()
        if (response) {
            state.storageDeals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchCitizenFileFolderCurrentUsage() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await storageService.getCitizenFileFolderCurrentUsage()
        if (response?.data) {
            state.usage = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function upgrade(deal: any) {
    if (paymentMethod.value === 'stripe') {
        await openStripePayment(deal)
        return
    }
    state.error = {}
    state.isPageLoading = true
    error = ''
    try {
        const params = {
            'deal_uuid': deal.uuid,
            'type': 'monthly',
        }
        const response = await userSubscriptionService.subscribe(params)
        if (response) {
            const checkoutOptions = {
                checkoutKey: runtimeConfig?.public?.checkoutKey,
                paymentId: response?.paymentId,
                containerId: "upgrade-checkout",
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

async function openStripePayment(deal: any) {
    try{
        state.isPageLoading = true
        state.error = {}
    
        const response = await userSubscriptionService.createStripePayment({
            deal_uuid: deal.uuid, // backend forventer deal_uuid
            payment_type: 'monthly', // backend forventer payment_type
            citizen_id: userStore.getUser?.citizen_id ?? null,
        })
        

    if (!response?.client_secret) {
        throw new Error('Failed to initialize Stripe payment. No client secret returned.')
    }

    state.stripe = {
        amount: response.amount,
        citizenId: userStore.getUser?.citizen_id ?? '',
        reference: response?.invoice_id ?? deal?.name ?? 'Storage upgrade',
        dealUuid: deal?.uuid ? String(deal?.uuid) : '',
        paymentType: 'one_time',
        invoiceId: response?.invoice_id ?? '',
        itemDescription: deal?.name ?? 'Storage upgrade',
        metadata: {
            type: 'storage',
            deal_uuid: deal?.uuid ? String(deal?.uuid) : '',
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


function handleStripeSuccess() {
    fetchStorageDeals()
    fetchCitizenFileFolderCurrentUsage()
}

function handleStripeError(message: string) {
    state.error = { message } as Error
}
</script>