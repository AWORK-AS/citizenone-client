<template>
    <div>
        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

        <LoadingSpinner :isActive="state.isLoading">
            <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg divide-y divide-gray-100">
                <p v-if="!state.recordings.length" class="p-6 text-sm text-gray-500">{{ $t('meetings.recordingsTab.empty') }}</p>
                <div v-for="recording in state.recordings" :key="recording.uuid"
                    class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                    <div class="w-36 shrink-0 text-sm">
                        <p class="font-semibold">{{ formatDate(recording.started_at) }}</p>
                        <p class="text-gray-500">
                            {{ formatTime(recording.started_at) }}<span v-if="recording.duration_seconds"> · {{ formatDuration(recording.duration_seconds) }}</span>
                        </p>
                    </div>

                    <div class="flex-1 min-w-0">
                        <NuxtLink :to="`/meetings/${recording.meeting?.uuid}`" class="font-medium truncate hover:underline block">
                            {{ recording.meeting?.title }}
                        </NuxtLink>
                        <p class="text-sm text-gray-500 truncate">
                            <NuxtLink v-if="recording.meeting?.citizen" :to="`/citizens/${recording.meeting.citizen.uuid}`" class="hover:underline">
                                {{ recording.meeting.citizen.name }}
                            </NuxtLink>
                            <span v-else>{{ $t('meetings.recordingsTab.noCitizen') }}</span>
                            <span v-if="recording.started_by"> · {{ $t('meetings.recordingsTab.recordedBy', { name: recording.started_by.name }) }}</span>
                        </p>
                    </div>

                    <div class="flex flex-wrap items-center justify-end gap-2 sm:w-72">
                    <!-- What came of it: a Cody summary, in the journal or not. -->
                    <span class="text-xs rounded-full px-2 py-0.5" :class="summaryClass(recording)">
                        {{ summaryLabel(recording) }}
                    </span>

                    <!-- When it goes. A warning when soon and nothing was kept. -->
                    <span v-if="recording.purge_at" class="text-xs rounded-full px-2 py-0.5 inline-flex items-center gap-1"
                        :class="warnBeforePurge(recording) ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'"
                        :title="formatDate(recording.purge_at)">
                        <Icon v-if="warnBeforePurge(recording)" name="ph:warning" class="h-3.5 w-3.5" />
                        {{ purgeLabel(recording) }}
                    </span>
                    </div>

                    <div class="flex items-center gap-2">
                        <FormButton v-if="recording.status === 'ready'" type="button" buttonStyle="secondary" @click="play(recording)">
                            <Icon name="ph:play" class="h-4 w-4 mr-1" /> {{ $t('meetings.detail.play') }}
                        </FormButton>
                        <span v-else class="text-sm text-gray-500">{{ $t(`meetings.detail.recordingStatus.${recording.status}`) }}</span>
                        <button v-if="recording.can_delete && ['ready', 'failed'].includes(recording.status)" type="button"
                            class="text-sm px-2 py-1 rounded text-red-600 hover:bg-red-50"
                            :aria-label="$t('meetings.recordingsTab.delete')" @click="state.toDelete = recording">
                            <Icon name="ph:trash" class="h-4 w-4" />
                        </button>
                    </div>

                    <video v-if="state.playing === recording.uuid && state.playUrl" :src="state.playUrl" controls autoplay
                        class="basis-full w-full max-w-3xl rounded-lg bg-black" />
                </div>
            </div>

            <div class="mt-4 flex justify-center gap-2" v-if="state.lastPage > 1">
                <FormButton type="button" buttonStyle="cancel" :disabled="state.page <= 1" @click="load(state.page - 1)">‹</FormButton>
                <span class="self-center text-sm">{{ state.page }} / {{ state.lastPage }}</span>
                <FormButton type="button" buttonStyle="cancel" :disabled="state.page >= state.lastPage" @click="load(state.page + 1)">›</FormButton>
            </div>
        </LoadingSpinner>

        <DialogConfirmation :isModalOpen="!!state.toDelete" :message="$t('meetings.detail.deleteRecordingConfirm')"
            @close="state.toDelete = null" @confirm="remove" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { meetingService } from '@/components/api/user/MeetingService'
import { daysUntilPurge, warnBeforePurge } from '@/composables/meetingRecordingPurge'

/**
 * Every recording the user may see, across meetings: which meeting and
 * citizen, whether a Cody summary was made and reached the journal, and when
 * the recording is deleted automatically (the company's retention setting).
 * The API applies the same access rule as a single meeting's recordings.
 */
const { t } = useI18n()

const state = reactive({
    recordings: [] as any[],
    page: 1,
    lastPage: 1,
    isLoading: false,
    error: {} as any,
    playing: '',
    playUrl: '',
    toDelete: null as any,
})

onMounted(() => load(1))

async function load(page: number) {
    state.isLoading = true
    state.error = {}
    try {
        const response = await meetingService.allRecordings(page)
        state.recordings = response?.data ?? []
        state.page = response?.meta?.current_page ?? page
        state.lastPage = response?.meta?.last_page ?? 1
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function play(recording: any) {
    state.error = {}
    try {
        const response = await meetingService.recordingUrl(recording.uuid)
        state.playing = recording.uuid
        state.playUrl = response?.data?.url ?? ''
    } catch (error: any) {
        state.error = error
    }
}

async function remove() {
    const recording = state.toDelete
    state.toDelete = null
    if (!recording) return
    try {
        await meetingService.deleteRecording(recording.uuid)
        await load(state.page)
    } catch (error: any) {
        state.error = error
    }
}

function summaryLabel(recording: any): string {
    if (recording.summary_journal) return t('meetings.recordingsTab.inJournal')
    if (recording.summary_status === 'ready') return t('meetings.recordingsTab.summaryReady')
    if (recording.summary_status === 'queued') return t('meetings.recordingsTab.summaryRunning')
    if (recording.summary_status === 'failed') return t('meetings.recordingsTab.summaryFailed')
    return t('meetings.recordingsTab.noSummary')
}

function summaryClass(recording: any): string {
    if (recording.summary_journal) return 'bg-green-50 text-green-700'
    if (recording.summary_status === 'ready') return 'bg-blue-50 text-blue-700'
    if (recording.summary_status === 'failed') return 'bg-red-50 text-red-700'
    return 'bg-gray-100 text-gray-600'
}

function purgeLabel(recording: any): string {
    const days = daysUntilPurge(recording.purge_at)
    if (days === null) return ''
    if (days <= 1) return t('meetings.recordingsTab.deletedTomorrow')
    return t('meetings.recordingsTab.deletedIn', { days })
}

const formatDate = (value: string) => value ? moment(value).format('DD-MM-YYYY') : ''
const formatTime = (value: string) => value ? moment(value).format('HH:mm') : ''

function formatDuration(seconds: number): string {
    const minutes = Math.max(1, Math.round(seconds / 60))
    return minutes >= 60
        ? t('meetings.stats.hoursMinutes', { h: Math.floor(minutes / 60), m: minutes % 60 })
        : t('meetings.stats.minutes', { m: minutes })
}
</script>
