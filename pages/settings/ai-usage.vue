<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('aiUsage.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('aiUsage.title') }}</template>

            <ModulesUserSettingsBillingSubTab class="mt-5" />

            <div class="mt-8 max-w-3xl">
                <ModulesUserSettingsAiUsagePanel />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const breadcrumbLinks = [
    {
        name: 'aiUsage.title',
        translate: true,
        href: '/settings/ai-usage',
    },
]
</script>
