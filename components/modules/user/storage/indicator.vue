<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="bg-white shadow-md p-6 rounded-md space-y-2">
            <h2 class="text-sm mb-2 text-primary flex justify-between">
                <div>
                    {{ $t('storage.storage') }}
                    ({{ state.usage?.total_storage }})
                </div>
                <div class="cursor-pointer hover:text-primary-600 flex items-center gap-1"
                    @click="navigateTo('/storage/upgrade')">
                    <Icon name="ph:arrow-circle-up" class="h-5 w-5" aria-hidden="true" />
                    <span class="text-xs">
                        {{ $t('storage.upgrade') }}
                    </span>
                </div>
            </h2>
            <div class="space-y-2 text-xs text-primary">
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
import { storageService } from '@/components/api/user/StorageService'
import type { Error } from '@/types'

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    usage: [] as any,
})

const usedStoragePercentage = computed(() => {
    const availableStorage = state.usage?.available_storage?.replace(/\s+GB/g, '')
    const totalStorage = state.usage?.total_storage?.replace(/\s+GB/g, '')
    if (availableStorage && totalStorage) {
        return (totalStorage - availableStorage) * 100
    }
})

onMounted(() => {
    fetchCitizenFileFolderCurrentUsage()
})

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
</script>