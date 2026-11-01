<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('meetings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('meetings.title') }}</template>

            <button type="button" class="flex items-center gap-x-2 mb-3 max-w-fit" @click="navigateTo('/meetings')">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </button>

            <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
            <Alert type="default" :text="state.notice" v-if="state.notice" />

            <LoadingSpinner :isActive="state.isLoading && !meeting">
                <div v-if="meeting" class="space-y-5">
                    <!-- Summary -->
                    <div class="px-4 py-5 sm:p-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                        <div class="flex flex-wrap items-start justify-between gap-4">
                            <div class="space-y-1">
                                <h2 class="text-xl font-semibold text-[#0f2b46]">{{ meeting.title }}</h2>
                                <p class="text-sm text-gray-600">
                                    {{ formatDate(meeting.starts_at) }} · {{ formatTime(meeting.starts_at) }}-{{ formatTime(meeting.ends_at) }}
                                </p>
                                <p class="text-sm text-gray-600">
                                    {{ $t('meetings.host') }}: {{ meeting.is_host ? $t('meetings.you') : meeting.host?.name }}
                                    <span v-if="meeting.citizen"> · {{ meeting.citizen.name }}</span>
                                    <span v-else-if="meeting.has_citizen"> · {{ $t('meetings.detail.aboutCitizen') }}</span>
                                </p>
                                <p v-if="meeting.description" class="text-sm text-gray-700 whitespace-pre-line pt-1">{{ meeting.description }}</p>
                                <span class="inline-block text-xs rounded-full px-2 py-0.5 bg-gray-100">
                                    {{ $t(`meetings.status.${meeting.status}`) }}
                                </span>
                            </div>
                            <div class="flex flex-wrap gap-2" v-if="isOpen && !state.inRoom">
                                <FormButton type="button" buttonStyle="primary" @click="state.showRoom = true">
                                    <Icon name="ph:video-camera" class="h-4 w-4 mr-1" /> {{ $t('meetings.detail.join') }}
                                </FormButton>
                                <template v-if="meeting.is_host">
                                    <FormButton type="button" buttonStyle="secondary" @click="state.editing = !state.editing">
                                        {{ $t('meetings.detail.edit') }}
                                    </FormButton>
                                    <FormButton type="button" buttonStyle="danger" @click="state.confirmCancel = true">
                                        {{ $t('meetings.detail.cancelMeeting') }}
                                    </FormButton>
                                </template>
                            </div>
                        </div>
                        <div v-if="state.editing" class="mt-6 border-t pt-6 max-w-3xl">
                            <MeetingForm :meeting="meeting" @saved="onEdited" />
                        </div>
                    </div>

                    <!-- The room -->
                    <div v-if="state.showRoom && isOpen" class="px-4 py-5 sm:p-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                        <MeetingRoom ref="roomRef" :connect="connect" :give-consent="giveConsent" can-share-screen
                            @joined="onJoined" @left="onLeft">
                            <template #info>
                                <p class="text-lg font-semibold">{{ meeting.title }}</p>
                                <p class="text-sm text-gray-500">{{ formatTime(meeting.starts_at) }}-{{ formatTime(meeting.ends_at) }}</p>
                            </template>
                            <template #controls="{ recording }">
                                <template v-if="meeting.is_host">
                                    <button type="button" class="h-12 px-4 rounded-full flex items-center gap-2 text-sm"
                                        :class="recording ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300'"
                                        :disabled="state.recordingBusy" @click="recording ? stopRecording() : startRecording()">
                                        <Icon name="ph:record-fill" class="h-5 w-5" :class="recording ? 'text-white' : 'text-red-600'" />
                                        {{ recording ? $t('meetings.host_controls.stopRecording') : $t('meetings.host_controls.record') }}
                                    </button>
                                    <button type="button" class="h-12 px-4 rounded-full border border-red-300 text-red-700 hover:bg-red-50 text-sm"
                                        @click="finishForEveryone">
                                        {{ $t('meetings.host_controls.endForEveryone') }}
                                    </button>
                                </template>
                            </template>
                        </MeetingRoom>

                        <!-- Lobby: guests waiting to be let in -->
                        <div v-if="meeting.is_host && waiting.length" class="mt-4 border border-amber-300 bg-amber-50 rounded-md p-4">
                            <p class="font-medium mb-2">{{ $t('meetings.lobby.title') }}</p>
                            <div v-for="participant in waiting" :key="participant.uuid" class="flex items-center justify-between gap-3 py-1">
                                <span>{{ participant.name }}</span>
                                <div class="flex gap-2">
                                    <FormButton type="button" buttonStyle="primary" @click="admit(participant)">{{ $t('meetings.lobby.admit') }}</FormButton>
                                    <FormButton type="button" buttonStyle="cancel" @click="deny(participant)">{{ $t('meetings.lobby.deny') }}</FormButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        <!-- Participants -->
                        <div class="px-4 py-5 sm:p-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg space-y-4">
                            <h3 class="font-semibold">{{ $t('meetings.detail.participants') }}</h3>
                            <p v-if="meeting.is_host && hasFreshLinks" class="text-xs text-gray-500">{{ $t('meetings.detail.linkOnce') }}</p>
                            <ul class="divide-y divide-gray-100">
                                <li v-for="participant in meeting.participants" :key="participant.uuid"
                                    class="py-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <div class="flex-1 min-w-0">
                                        <p class="font-medium truncate">
                                            {{ participant.name }}
                                            <span v-if="participant.role === 'host'" class="text-xs text-gray-500">({{ $t('meetings.host') }})</span>
                                        </p>
                                        <p class="text-xs text-gray-500 truncate">
                                            {{ $t(`meetings.participantState.${participant.state}`) }}
                                            <span v-if="participant.email"> · {{ participant.email }}</span>
                                            <span v-if="participant.recording_consent"> · {{ $t('meetings.detail.consent') }} ✓</span>
                                        </p>
                                    </div>
                                    <div v-if="meeting.is_host && participant.role !== 'host' && isOpen" class="flex gap-1">
                                        <button v-if="joinLinks.linkFor(meeting.uuid, participant.uuid)" type="button"
                                            class="text-sm px-2 py-1 rounded hover:bg-gray-100" @click="copyLink(participant)">
                                            <Icon name="ph:link" class="h-4 w-4" /> {{ $t('meetings.detail.copyLink') }}
                                        </button>
                                        <button type="button" class="text-sm px-2 py-1 rounded hover:bg-gray-100" @click="resend(participant)">
                                            {{ $t('meetings.detail.resend') }}
                                        </button>
                                        <button type="button" class="text-sm px-2 py-1 rounded text-red-600 hover:bg-red-50" @click="remove(participant)">
                                            {{ $t('meetings.detail.remove') }}
                                        </button>
                                    </div>
                                </li>
                            </ul>

                            <div v-if="meeting.is_host && isOpen" class="border-t pt-4 space-y-3">
                                <p class="text-sm font-medium">{{ $t('meetings.detail.invite') }}</p>
                                <FormSelectMultiple v-model="state.invite.colleagues" :options="state.options.users" />
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <FormTextField name="invite-name" v-model="state.invite.name" :placeholder="$t('meetings.form.guestName')" />
                                    <FormTextField name="invite-email" v-model="state.invite.email" :placeholder="$t('meetings.form.guestEmail')" />
                                </div>
                                <FormButton type="button" buttonStyle="secondary" :disabled="!canInvite" @click="invite">
                                    {{ $t('meetings.detail.invite') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Recordings -->
                        <div class="px-4 py-5 sm:p-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg space-y-3">
                            <h3 class="font-semibold">{{ $t('meetings.detail.recordings') }}</h3>
                            <p v-if="!state.recordings.length" class="text-sm text-gray-500">{{ $t('meetings.detail.noRecordings') }}</p>
                            <ul class="divide-y divide-gray-100">
                                <li v-for="recording in state.recordings" :key="recording.uuid" class="py-2 flex flex-wrap items-center gap-3">
                                    <div class="flex-1 min-w-0 text-sm">
                                        <p class="font-medium">{{ recording.started_at ? formatDate(recording.started_at) + ' ' + formatTime(recording.started_at) : '' }}</p>
                                        <p class="text-gray-500">
                                            {{ $t(`meetings.detail.recordingStatus.${recording.status}`) }}
                                            <span v-if="recording.duration_seconds"> · {{ formatDuration(recording.duration_seconds) }}</span>
                                            <span v-if="recording.started_by"> · {{ recording.started_by.name }}</span>
                                        </p>
                                    </div>
                                    <FormButton v-if="recording.status === 'ready'" type="button" buttonStyle="secondary" @click="play(recording)">
                                        <Icon name="ph:play" class="h-4 w-4 mr-1" /> {{ $t('meetings.detail.play') }}
                                    </FormButton>
                                    <button v-if="meeting.is_host && ['ready', 'failed'].includes(recording.status)" type="button"
                                        class="text-sm px-2 py-1 rounded text-red-600 hover:bg-red-50" @click="state.deleteRecording = recording">
                                        {{ $t('meetings.detail.delete') }}
                                    </button>
                                </li>
                            </ul>
                            <video v-if="state.playUrl" :src="state.playUrl" controls autoplay class="w-full rounded-lg bg-black" />
                        </div>
                    </div>
                </div>
            </LoadingSpinner>

            <DialogConfirmation :isModalOpen="state.confirmCancel" :message="$t('meetings.detail.cancelConfirm')"
                @close="state.confirmCancel = false" @confirm="cancelMeeting" />
            <DialogConfirmation :isModalOpen="!!state.deleteRecording" :message="$t('meetings.detail.deleteRecordingConfirm')"
                @close="state.deleteRecording = null" @confirm="deleteRecording" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-application', requiredApplication: 'meetings_enabled' })

import moment from 'moment'
import { useI18n } from 'vue-i18n'
import MeetingRoom from '@/components/modules/shared/meeting/room.vue'
import MeetingForm from '@/components/modules/user/meetings/form.vue'
import { meetingService } from '@/components/api/user/MeetingService'
import { userService } from '@/components/api/user/UserService'
import { useMeetingJoinLinks } from '@/composables/meetingJoinLinks'
import { useDepartmentStore } from '@/store/department'

/**
 * One online meeting: who is invited, recordings, and the room itself. The
 * host also lets guests in from the lobby, records (with everyone's consent)
 * and invites more people. Invitation emails link colleagues here.
 */
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t } = useI18n()
const joinLinks = useMeetingJoinLinks()
const departmentStore = useDepartmentStore() as any
const uuid = route.params.uuid as string

const roomRef = ref<InstanceType<typeof MeetingRoom> | null>(null)
let poll: ReturnType<typeof setInterval> | null = null

const state = reactive({
    meeting: null as any,
    recordings: [] as any[],
    isLoading: false,
    error: {} as any,
    notice: '',
    editing: false,
    showRoom: false,
    inRoom: false,
    recordingBusy: false,
    confirmCancel: false,
    deleteRecording: null as any,
    playUrl: '',
    invite: { colleagues: [] as string[], name: '', email: '' },
    options: { users: [] as any[] },
})

const meeting = computed(() => state.meeting)
const isOpen = computed(() => ['scheduled', 'live'].includes(state.meeting?.status))
const waiting = computed(() => (state.meeting?.participants ?? []).filter((p: any) => p.state === 'waiting'))
const hasFreshLinks = computed(() => (state.meeting?.participants ?? []).some((p: any) => joinLinks.linkFor(uuid, p.uuid)))
const canInvite = computed(() => state.invite.colleagues.length > 0 || state.invite.name.trim().length > 0)

onMounted(async () => {
    await load()
    loadRecordings()
    if (state.meeting?.is_host) loadUsers()
})

onBeforeUnmount(stopPolling)

async function load() {
    state.isLoading = true
    try {
        const response = await meetingService.get(uuid)
        state.meeting = response?.data ?? null
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function loadRecordings() {
    try {
        const response = await meetingService.recordings(uuid)
        state.recordings = response?.data ?? []
    } catch {
        state.recordings = []
    }
}

async function loadUsers() {
    try {
        const response = await userService.getAllUsers({ department: departmentStore.getSelectedDepartmentName })
        const invited = new Set((state.meeting?.participants ?? []).map((p: any) => p.uuid))
        state.options.users = (response?.data ?? [])
            .filter((user: any) => !invited.has(user.uuid))
            .map((user: any) => ({ value: user.uuid, label: `${user.firstname} ${user.lastname ?? ''}`.trim() }))
    } catch {
        state.options.users = []
    }
}

// While in the room the page refreshes the meeting, so the host sees guests
// arrive in the lobby and everyone sees consent and recording state change.
function startPolling() {
    stopPolling()
    poll = setInterval(async () => {
        await load()
        loadRecordings()
    }, 4000)
}

function stopPolling() {
    if (poll) clearInterval(poll)
    poll = null
}

async function connect(consent: boolean) {
    const response = await meetingService.join(uuid, consent)
    return response.data
}

async function giveConsent() {
    await meetingService.consent(uuid)
}

function onJoined() {
    state.inRoom = true
    startPolling()
}

function onLeft() {
    state.inRoom = false
    stopPolling()
    load()
    loadRecordings()
}

async function startRecording() {
    state.recordingBusy = true
    state.notice = ''
    try {
        await meetingService.startRecording(uuid)
        state.notice = t('meetings.host_controls.recordingStarted')
        loadRecordings()
    } catch (error: any) {
        if (error?.code === 'meeting_recording_consent_required') {
            const names = (error?.missing ?? []).map((p: any) => p.name).join(', ')
            state.notice = t('meetings.host_controls.missingConsent', { names })
            await roomRef.value?.requestConsent()
        } else {
            state.error = error
        }
    }
    state.recordingBusy = false
}

async function stopRecording() {
    state.recordingBusy = true
    try {
        await meetingService.stopRecording(uuid)
        state.notice = t('meetings.host_controls.recordingStopped')
        loadRecordings()
    } catch (error: any) {
        state.error = error
    }
    state.recordingBusy = false
}

async function finishForEveryone() {
    try {
        await meetingService.finish(uuid)
    } catch (error: any) {
        state.error = error
    }
    await roomRef.value?.leave()
}

async function admit(participant: any) {
    try {
        await meetingService.admit(uuid, participant.uuid)
        await load()
    } catch (error: any) {
        state.error = error
    }
}

async function deny(participant: any) {
    try {
        await meetingService.deny(uuid, participant.uuid)
        await load()
    } catch (error: any) {
        state.error = error
    }
}

async function invite() {
    const participants: any[] = state.invite.colleagues.map((value) => ({ type: 'user', uuid: value }))
    if (state.invite.name.trim()) {
        participants.push({ type: 'guest', name: state.invite.name.trim(), email: state.invite.email.trim() || null })
    }
    try {
        const response = await meetingService.addParticipants(uuid, participants)
        joinLinks.remember(response?.data)
        state.meeting = response?.data
        state.invite = { colleagues: [], name: '', email: '' }
        loadUsers()
    } catch (error: any) {
        state.error = error
    }
}

async function resend(participant: any) {
    try {
        const response = await meetingService.resendInvite(uuid, participant.uuid)
        if (response?.join_url) joinLinks.set(uuid, participant.uuid, response.join_url)
        await load()
    } catch (error: any) {
        state.error = error
    }
}

async function remove(participant: any) {
    try {
        await meetingService.removeParticipant(uuid, participant.uuid)
        await load()
    } catch (error: any) {
        state.error = error
    }
}

async function copyLink(participant: any) {
    const link = joinLinks.linkFor(uuid, participant.uuid)
    if (!link) return
    await navigator.clipboard.writeText(link)
    state.notice = t('meetings.detail.linkCopied')
}

async function cancelMeeting() {
    state.confirmCancel = false
    try {
        const response = await meetingService.cancel(uuid)
        state.meeting = response?.data ?? state.meeting
    } catch (error: any) {
        state.error = error
    }
}

function onEdited(updated: any) {
    state.editing = false
    if (updated) state.meeting = updated
}

async function play(recording: any) {
    try {
        const response = await meetingService.recordingUrl(recording.uuid)
        state.playUrl = response?.data?.url ?? ''
    } catch (error: any) {
        state.error = error
    }
}

async function deleteRecording() {
    const recording = state.deleteRecording
    state.deleteRecording = null
    try {
        await meetingService.deleteRecording(recording.uuid)
        state.playUrl = ''
        loadRecordings()
    } catch (error: any) {
        state.error = error
    }
}

const formatDate = (value: string) => moment(value).format('DD-MM-YYYY')
const formatTime = (value: string) => moment(value).format('HH:mm')

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}
</script>
