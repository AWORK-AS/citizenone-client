<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-sm font-medium">{{ $t('dailyOverview.latestNews') }}</h3>
    </LoadingSpinner>
</template>

<script setup lang="ts">
const state = reactive({
    isPageLoading: false,
    error: null,
})
</script>