<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.gender.gender') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div
            class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-6 pb-6 pl-6 mr-1">
            <div class="space-y-1">
                <div class="flex items-center justify-between">
                    <p class="text-sm">
                        {{ $t('dailyOverview.gender.male') }}
                    </p>
                    <p class="text-sm">0</p>
                </div>
                <div class="flex items-center justify-between">
                    <p class="text-sm">
                        {{ $t('dailyOverview.gender.female') }}
                    </p>
                    <p class="text-sm">0</p>
                </div>
                <div class="flex items-center justify-between">
                    <p class="text-sm">
                        {{ $t('dailyOverview.gender.willNotDisclose') }}
                    </p>
                    <p class="text-sm">0</p>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import type { Error } from '@/types'

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
})
</script>