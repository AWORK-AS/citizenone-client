<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('meetings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('meetings.title') }}</template>

            <div class="p-1">
                <MeetingWorkspace :uuid="uuid" staff />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import MeetingWorkspace from '@/components/modules/user/meetings/workspace.vue'

/**
 * Superadmin: holding one of our own meetings with the usual login. The API
 * answers as the colleague's host in our account (ActAsSalesHost), so there
 * is no second user to log in as and no second browser profile.
 */
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const uuid = route.params.uuid as string
</script>
