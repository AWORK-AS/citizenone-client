<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('storage.storage') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('storage.storage') }}</template>

            <ModulesSettingsTab />

            <div class="mt-8 max-w-3xl">
                <ModulesStorageIndicator />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>