<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-sm font-medium py-2">{{ $t('dailyOverview.latestNews') }}</h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import type { Error } from '@/types'

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
})
</script>