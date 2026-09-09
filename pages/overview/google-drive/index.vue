<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('overview.googleDriveTab') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                <OverviewTabs active="google-drive" />
            </template>

            <ModulesUserGoogleDriveBrowser />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const breadcrumbLinks = [
    {
        name: 'overview.overview',
        translate: true,
        href: '/overview',
    },
    {
        name: 'overview.googleDriveTab',
        translate: true,
        href: '/overview/google-drive',
    },
]
</script>
