<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.settings') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('settings.settings') }}</template>

            <ModulesSettingsTab />

            <div class="max-w-3xl">
                <ModulesStorageIndicator />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>