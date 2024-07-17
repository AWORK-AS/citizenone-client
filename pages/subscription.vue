<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('subscription.subscription') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('subscription.subscription') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">

            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const state = reactive({
    error: [],
    isPageLoading: false,
})
</script>