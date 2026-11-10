<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('meetings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('meetings.title') }}</template>

            <MeetingWorkspace :uuid="uuid" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import MeetingWorkspace from '@/components/modules/user/meetings/workspace.vue'

/** One online meeting in the app. See the workspace component. */
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const uuid = route.params.uuid as string
</script>
