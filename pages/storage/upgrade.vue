<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('storage.storage') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('storage.storage') }}</template>

            <div class="max-w-3xl">
                <div class="space-y-5">
                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                    <div class="space-y-2">
                        <p class="text-sm font-medium">Current Plan</p>
                        <div class="space-y-3">
                            <div class="bg-gray-50 p-4 rounded-md space-y-2">
                                <div>
                                    {{ $t('storage.storage') }}
                                    ({{ state.usage?.total_storage }})
                                </div>
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
                        <p class="text-sm font-medium">Upgrade Options</p>
                        <div class="space-y-3">
                            <div v-for="(deal, index) in state.storageDeals?.data" :key="index">
                                <div class="bg-gray-100 p-4 rounded-md flex items-center gap-x-3">
                                    <p>{{ deal?.name }}</p>
                                    <p class="grow">
                                        {{ formatAmount(deal?.monthly_price) }}
                                    </p>
                                    <div>
                                        <FormButton class="rounded-md">
                                            Upgrade
                                        </FormButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { addOnDealsService } from '@/components/api/AddOnDealsService'
import { storageService } from '@/components/api/StorageService'
import { useUserStore } from '@/store/user'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()

const state = reactive({
    error: [],
    isPageLoading: false,
    storageDeals: [],
    usage: [],
})

onMounted(() => {
    fetchStorageDeals()
    fetchCitizenFileFolderCurrentUsage()
})

const usedStoragePercentage = computed(() => {
    const availableStorage = state.usage?.available_storage?.replace(/\s+GB/g, '')
    const totalStorage = state.usage?.total_storage?.replace(/\s+GB/g, '')
    if (availableStorage && totalStorage) {
        return totalStorage - availableStorage
    }
})

async function fetchStorageDeals() {
    state.isPageLoading = true
    state.error = []
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
    return 'DKK' + formattedIntegerPart + ',' + decimalPart
}
</script>