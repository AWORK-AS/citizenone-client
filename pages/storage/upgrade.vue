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
                    <div class="max-w-3xl" v-if="!state.isDealsHidden">
                        <div class="space-y-5">
                            <div class="space-y-2">
                                <p class="text-sm font-medium">
                                    {{ $t('storage.currentPlan') }}
                                </p>
                                <div class="space-y-3">
                                    <div class="bg-white shadow-md p-6 rounded-md space-y-2">
                                        <h2 class="text-sm mb-2 text-primary flex items-center gap-1">
                                            {{ $t('storage.storage') }}
                                            ({{ state.usage?.total_storage }})
                                            <button @click="state.isInfoOpen = true" class="text-gray-400 hover:text-primary-600 ml-1">
                                                <Icon name="ph:question" class="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        </h2>
                                        <div class="space-y-2 text-xs text-primary">
                                            <div class="w-full bg-gray-200 rounded-full overflow-hidden flex">
                                                <div class="h-4 bg-yellow-500" :style="{ width: `${localUsedPercent}%` }"></div>
                                                <div class="h-4 bg-blue-500" :style="{ width: `${oneDriveUsedPercent}%` }"></div>
                                            </div>
                                            <div class="flex items-center">
                                                <span class="inline-block w-3 h-3 bg-yellow-500 mr-2"></span>
                                                {{ $t('storage.documents') }} {{ state.usage?.used_storage }}
                                            </div>
                                            <div v-if="state.oneDriveQuota" class="flex items-center">
                                                <span class="inline-block w-3 h-3 bg-blue-500 mr-2"></span>
                                                OneDrive dokumenter {{ formatBytes(state.oneDriveQuota.used) }}
                                            </div>
                                            <div class="flex items-center">
                                                <span class="inline-block w-3 h-3 bg-gray-300 mr-2"></span>
                                                {{ $t('storage.available') }} {{ state.usage?.available_storage }}
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
            <Modal size="sm" :show="state.isInfoOpen" @close="state.isInfoOpen = false">
                <template #modal-body>
                    <ul class="space-y-3">
                        <li><p class="text-sm">{{ $t('storage.upgrade-info-1') }}</p></li>
                        <li><p class="text-sm">{{ $t('storage.upgrade-info-2') }}</p></li>
                    </ul>
                    <div class="mt-5 flex justify-end">
                        <FormButton buttonStyle="cancel" @click="state.isInfoOpen = false" class="rounded-md">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { addOnDealsService } from '@/components/api/user/AddOnDealsService'
import { userSubscriptionService } from '@/components/api/user/UserSubscriptionService'
import { storageService } from '@/components/api/user/StorageService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const userStore = useUserStore() as any

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const language = useI18n()
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
        isContactUsOpen: false
    },
    storageDeals: [] as any,
    usage: [] as any,
    oneDriveQuota: null as any,
    isInfoOpen: false,
})

onMounted(() => {
    fetchStorageDeals()
    fetchCitizenFileFolderCurrentUsage()
    fetchOneDriveQuota()
})

onUnmounted(() => {
    // Cleanup checkout instance when component is unmounted
    if (checkout) {
        checkout.cleanup()
    }
})

function formatBytes(bytes: number): string {
    if (!bytes) return '0 B'
    const gb = bytes / (1024 * 1024 * 1024)
    if (gb >= 1) return `${gb.toFixed(2)} GB`
    const mb = bytes / (1024 * 1024)
    if (mb >= 1) return `${mb.toFixed(1)} MB`
    const kb = bytes / 1024
    return `${kb.toFixed(0)} KB`
}

const localUsedBytes = computed(() => {
    const totalGB = parseFloat(state.usage?.total_storage?.replace(/[^0-9.]/g, '') ?? '0')
    const availableGB = parseFloat(state.usage?.available_storage?.replace(/[^0-9.]/g, '') ?? '0')
    return (totalGB - availableGB) * 1024 * 1024 * 1024
})

const totalCombinedBytes = computed(() => {
    const totalGB = parseFloat(state.usage?.total_storage?.replace(/[^0-9.]/g, '') ?? '0')
    const localTotal = totalGB * 1024 * 1024 * 1024
    const oneDriveTotal = state.oneDriveQuota?.total ?? 0
    return localTotal + oneDriveTotal
})

const localUsedPercent = computed(() => {
    if (!totalCombinedBytes.value) return 0
    return Math.min(100, (localUsedBytes.value / totalCombinedBytes.value) * 100)
})

const oneDriveUsedPercent = computed(() => {
    if (!totalCombinedBytes.value || !state.oneDriveQuota?.used) return 0
    return Math.min(100, (state.oneDriveQuota.used / totalCombinedBytes.value) * 100)
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

async function fetchOneDriveQuota() {
    const token = localStorage.getItem('_token')
    const userId = userStore.getUser?.id || localStorage.getItem('user_id')
    if (!token || !userId) return
    try {
        const response: any = await $fetch('/api/user/onedrive/storage-quota', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'X-User-Id': userId,
                Accept: 'application/json',
            },
        })
        if (response?.used !== undefined) {
            state.oneDriveQuota = response
        }
    } catch {
        // OneDrive not connected
    }
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