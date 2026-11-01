<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('meetings.newMeeting') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('meetings.newMeeting') }}</template>

            <button type="button" class="flex items-center gap-x-2 mb-3 max-w-fit" @click="router.back()">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </button>

            <div class="px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg max-w-3xl">
                <MeetingForm @saved="onSaved" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-application', requiredApplication: 'meetings_enabled' })

import MeetingForm from '@/components/modules/user/meetings/form.vue'
import { useMeetingJoinLinks } from '@/composables/meetingJoinLinks'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const joinLinks = useMeetingJoinLinks()

// Guest links are only returned once, by the create call. They are handed to
// the meeting page through memory so the host can copy them there.
function onSaved(meeting: any) {
    if (!meeting?.uuid) return
    joinLinks.remember(meeting)
    navigateTo(`/meetings/${meeting.uuid}`)
}
</script>
