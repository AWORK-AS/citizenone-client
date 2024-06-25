<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="mt-4">
            <h2 class="text-sm mb-2 text-white flex justify-between">
                <span>Storage</span>
                <span>{{ state.usage?.total_storage }}</span>
            </h2>
            <div class="w-full bg-gray-200 rounded-full h-4 mb-4 relative">
                <div class="absolute top-0 h-full bg-yellow-500 rounded-l-full" style="width: 70%;">
                </div>
                <div class="absolute top-0 -right-0 h-full bg-gray-300 rounded-r-full" style="width: 30%;">
                </div>
            </div>
            <div class="space-y-2 text-xs text-white">
                <div class="flex items-center">
                    <span class="inline-block w-3 h-3 bg-yellow-500 mr-2"></span>
                    Documents {{ state.usage?.used_storage }}
                </div>
                <div class="flex items-center">
                    <span class="inline-block w-3 h-3 bg-gray-300 mr-2"></span>
                    Available {{ state.usage?.available_storage }}
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