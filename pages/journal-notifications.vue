<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('journalNotifications.unreadJournalNotes') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('journalNotifications.unreadJournalNotes') }}</template>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>