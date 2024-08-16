<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.tabs.storage') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

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
            <ModulesStorageModalContactUs :isModalOpen="state.modal.isContactUsOpen"
                @close="state.modal.isContactUsOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { addOnDealsService } from '@/components/api/AddOnDealsService'
import { userSubscriptionService } from '@/components/api/UserSubscriptionService'
import { storageService } from '@/components/api/StorageService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let checkout = null as any
const router = useRouter()
let error: string | undefined = router?.currentRoute?.value?.query?.error as string | undefined

const state = reactive({
    error: {} as Error,
    isDealsHidden: false,
    isPageLoading: false,
    modal: {
        isContactUsOpen: false
    },
    storageDeals: [] as any,
    usage: [] as any,
})

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

async function upgrade(deal: any) {
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
</script>