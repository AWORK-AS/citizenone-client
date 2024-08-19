<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('journalNotifications.journalNotifications') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('journalNotifications.journalNotifications') }}</template>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>