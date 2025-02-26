<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('storage.storage') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

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

const breadcrumbLinks = [
    {
        name: 'storage.storage',
        translate: true,
        href: '/settings/storage',
    },
]
</script>