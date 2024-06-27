<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="mt-4">
            <h2 class="text-sm mb-2 text-white flex justify-between">
                <span>{{ $t('storage.storage') }}</span>
                <span>{{ state.usage?.total_storage }}</span>
            </h2>
            <div class="space-y-2 text-xs text-white">
                <div class="w-full bg-gray-200 rounded-full overflow-hidden">
                    <div class="h-4 bg-yellow-500 rounded-full" :style="{ width: `${usedStoragePercentage}%` }"></div>
                </div>
                <div class="flex items-center">
                    <span class="inline-block w-3 h-3 bg-yellow-500 mr-2"></span>
                    {{ $t('storage.documents') }} {{ state.usage?.used_storage }}
                </div>
                <div class="flex items-center">
                    <span class="inline-block w-3 h-3 bg-gray-300 mr-2"></span>
                    {{ $t('storage.available') }} {{ state.usage?.available_storage }}
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { storageService } from '@/components/api/StorageService'

const state = reactive({
    error: [],
    isPageLoading: false,
    usage: []
})

const usedStoragePercentage = computed(() => {
    const availableStorage = state.usage?.available_storage?.replace(/\s+GB/g, '')
    const totalStorage = state.usage?.total_storage?.replace(/\s+GB/g, '')
    if (availableStorage && totalStorage) {
        return totalStorage - availableStorage
    }
})

onMounted(() => {
    fetchCitizenFileFolderCurrentUsage()
})

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
</script>