<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="bg-white shadow-md p-6 rounded-md space-y-2">
            <h2 class="text-sm mb-2 text-primary flex justify-between">
                <div class="flex items-center gap-1">
                    {{ $t('storage.storage') }}
                    ({{ state.usage?.total_storage }})
                    <button @click="state.isInfoOpen = true" class="text-gray-400 hover:text-primary-600 ml-1">
                        <Icon name="ph:question" class="h-4 w-4" aria-hidden="true" />
                    </button>
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
                <div class="w-full bg-gray-200 rounded-full overflow-hidden flex">
                    <div class="h-4 bg-yellow-500" :style="{ width: `${localUsedPercent}%` }"></div>
                    <div class="h-4 bg-blue-500" :style="{ width: `${oneDriveUsedPercent}%` }"></div>
                </div>
                <div class="flex items-center">
                    <span class="inline-block w-3 h-3 bg-yellow-500 mr-2"></span>
                    {{ $t('storage.documents') }} {{ state.usage?.used_storage }}
                </div>
                <div v-if="state.oneDriveConnected && state.oneDriveQuota" class="flex items-center">
                    <span class="inline-block w-3 h-3 bg-blue-500 mr-2"></span>
                    OneDrive dokumenter {{ formatBytes(state.oneDriveQuota.used) }}
                </div>
                <div class="flex items-center">
                    <span class="inline-block w-3 h-3 bg-gray-300 mr-2"></span>
                    {{ $t('storage.available') }} {{ state.usage?.available_storage }}
                </div>
            </div>
        </div>
    </LoadingSpinner>

    <Modal size="sm" :show="state.isInfoOpen" @close="state.isInfoOpen = false">
        <template #modal-body>
            <ul class="space-y-3">
                <li><p class="text-sm">{{ $t('storage.info-1') }}</p></li>
                <li><p class="text-sm">{{ $t('storage.info-2') }}</p></li>
                <li><p class="text-sm">{{ $t('storage.info-3') }}</p></li>
            </ul>
            <div class="mt-5 flex justify-end">
                <FormButton buttonStyle="cancel" @click="state.isInfoOpen = false" class="rounded-md">
                    {{ $t('close') }}
                </FormButton>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { storageService } from '@/components/api/user/StorageService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const userStore = useUserStore() as any

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    usage: [] as any,
    oneDriveConnected: false,
    oneDriveQuota: null as any,
    isOneDriveQuotaLoading: false,
    isInfoOpen: false,
})

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

function formatBytes(bytes: number): string {
    if (!bytes) return '0 B'
    const gb = bytes / (1024 * 1024 * 1024)
    if (gb >= 1) return `${gb.toFixed(2)} GB`
    const mb = bytes / (1024 * 1024)
    if (mb >= 1) return `${mb.toFixed(1)} MB`
    const kb = bytes / 1024
    return `${kb.toFixed(0)} KB`
}

onMounted(() => {
    fetchCitizenFileFolderCurrentUsage()
    fetchOneDriveQuota()
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

async function fetchOneDriveQuota() {
    const token = localStorage.getItem('_token')
    const userId = userStore.getUser?.id || localStorage.getItem('user_id')
    if (!token || !userId) return

    state.isOneDriveQuotaLoading = true
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
            state.oneDriveConnected = true
        }
    } catch {
        // OneDrive not connected or quota unavailable — hide section
    }
    state.isOneDriveQuotaLoading = false
}
</script>
