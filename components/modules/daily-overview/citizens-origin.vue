<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.citizensOrigin') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.citizensOrigin?.length === 0">
            {{ $t('dailyOverview.noDataToDisplay') }}
        </div>
        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 divide-y overflow-scroll min-h-96 max-h-96 pr-5 pt-6 pb-6 pl-6 mr-1"
            v-else>

        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import type { Error } from '@/types'

const state = reactive({
    citizensOrigin: [] as any,
    isPageLoading: false,
    error: {} as Error,
})
</script>