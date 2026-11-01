<template>
    <div v-if="state.recordings.length" class="px-4 py-5 sm:p-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg space-y-3">
        <h3 class="font-semibold flex items-center gap-2">
            <Icon name="ph:video-conference" class="h-5 w-5" /> {{ $t('meetings.citizen.title') }}
        </h3>
        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
        <ul class="divide-y divide-gray-100">
            <li v-for="recording in state.recordings" :key="recording.uuid" class="py-2 flex flex-wrap items-center gap-3 text-sm">
                <div class="flex-1 min-w-0">
                    <NuxtLink :to="`/meetings/${recording.meeting?.uuid}`" class="font-medium hover:underline">
                        {{ recording.meeting?.title }}
                    </NuxtLink>
                    <p class="text-gray-500">
                        {{ formatDateTime(recording.started_at) }}
                        <span v-if="recording.duration_seconds"> · {{ Math.round(recording.duration_seconds / 60) }} min</span>
                        <span v-if="recording.summary_status === 'ready'"> · {{ $t('meetings.citizen.hasSummary') }}</span>
                    </p>
                </div>
                <FormButton type="button" buttonStyle="secondary" @click="play(recording)">
                    <Icon name="ph:play" class="h-4 w-4 mr-1" /> {{ $t('meetings.detail.play') }}
                </FormButton>
            </li>
        </ul>
        <video v-if="state.playUrl" :src="state.playUrl" controls autoplay class="w-full rounded-lg bg-black" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { meetingService } from '@/components/api/user/MeetingService'

/**
 * Recordings of online meetings about a citizen, shown on the citizen's
 * documents page. The files stay in the recordings bucket; playback is a
 * short-lived link, and the API only lists them for staff who can see the
 * citizen.
 */
const props = defineProps<{ citizenUuid: string }>()

const state = reactive({ recordings: [] as any[], playUrl: '', error: {} as any })

onMounted(async () => {
    try {
        const response = await meetingService.citizenRecordings(props.citizenUuid)
        state.recordings = response?.data ?? []
    } catch {
        // No access or no app: the section simply is not shown.
        state.recordings = []
    }
})

async function play(recording: any) {
    try {
        const response = await meetingService.recordingUrl(recording.uuid)
        state.playUrl = response?.data?.url ?? ''
    } catch (error: any) {
        state.error = error
    }
}

const formatDateTime = (value: string) => value ? moment(value).format('DD-MM-YYYY HH:mm') : ''
</script>
