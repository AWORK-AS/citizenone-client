<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('meetings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('meetings.title') }}</template>

            <NuxtLink to="/meetings" class="inline-flex items-center gap-1.5 mb-4 text-sm text-gray-500 hover:text-[#0f2b46]">
                <Icon name="ph:arrow-left" class="h-4 w-4" /> {{ $t('meetings.title') }}
            </NuxtLink>

            <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
            <Alert type="default" :text="state.notice" v-if="state.notice" />

            <LoadingSpinner :isActive="state.isLoading && !meeting">
                <div v-if="meeting" class="space-y-6">
                    <!-- Header: what, when, who - one compact block, actions on the right. -->
                    <div class="flex flex-wrap items-start justify-between gap-4">
                        <div class="min-w-0 space-y-2">
                            <div class="flex flex-wrap items-center gap-3">
                                <h2 class="text-2xl font-semibold text-[#0f2b46] truncate">{{ meeting.title }}</h2>
                                <span class="text-xs font-medium rounded-full px-2.5 py-0.5" :class="statusClass(meeting.status)">
                                    {{ $t(`meetings.status.${meeting.status}`) }}
                                </span>
                            </div>
                            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                <span class="inline-flex items-center gap-1.5">
                                    <Icon name="ph:calendar-blank" class="h-4 w-4 text-gray-400" />
                                    {{ formatDate(meeting.next_starts_at || meeting.starts_at) }}
                                </span>
                                <span class="inline-flex items-center gap-1.5">
                                    <Icon name="ph:clock" class="h-4 w-4 text-gray-400" />
                                    {{ formatTime(meeting.next_starts_at || meeting.starts_at) }}-{{ formatTime(meeting.next_ends_at || meeting.ends_at) }}
                                </span>
                                <span v-if="meeting.recurrence" class="inline-flex items-center gap-1.5">
                                    <Icon name="ph:repeat" class="h-4 w-4 text-gray-400" />
                                    {{ $t(`meetings.recurrence.${meeting.recurrence}`) }} {{ $t('meetings.recurrence.until', { date: formatDate(meeting.recurrence_until) }) }}
                                </span>
                                <span class="inline-flex items-center gap-1.5">
                                    <Icon name="ph:user-circle" class="h-4 w-4 text-gray-400" />
                                    {{ $t('meetings.host') }}: {{ meeting.is_host ? $t('meetings.you') : meeting.host?.name }}
                                </span>
                                <span v-if="meeting.citizen || meeting.has_citizen" class="inline-flex items-center gap-1.5">
                                    <Icon name="ph:identification-badge" class="h-4 w-4 text-gray-400" />
                                    {{ meeting.citizen ? meeting.citizen.name : $t('meetings.detail.aboutCitizen') }}
                                </span>
                            </div>
                            <p v-if="meeting.description" class="text-sm text-gray-600 whitespace-pre-line max-w-3xl">{{ meeting.description }}</p>
                        </div>
                        <div class="flex items-center gap-2" v-if="isOpen && !state.inRoom">
                            <button v-if="!state.showRoom" type="button"
                                class="h-10 px-5 rounded-full bg-[#0f4c75] hover:bg-[#0f2b46] text-white text-sm font-semibold inline-flex items-center gap-2"
                                @click="state.showRoom = true">
                                <Icon name="ph:video-camera" class="h-4 w-4" /> {{ $t('meetings.detail.join') }}
                            </button>
                            <ModulesUserCitizenRowActionMenu v-if="meeting.is_host" :items="headerActions" buttonSize="sm" />
                        </div>
                    </div>

                    <div v-if="state.editing" class="px-4 py-5 sm:p-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl max-w-3xl">
                        <MeetingForm :meeting="meeting" @saved="onEdited" />
                    </div>

                    <!-- Lobby: guests waiting to be let in (host). -->
                    <div v-if="meeting.is_host && waiting.length" class="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p class="text-sm font-semibold text-[#0f2b46] mb-2 flex items-center gap-2">
                            <Icon name="ph:door-open" class="h-4 w-4" /> {{ $t('meetings.lobby.title') }}
                        </p>
                        <div v-for="participant in waiting" :key="participant.uuid" class="flex items-center justify-between gap-3 py-1.5">
                            <span class="flex items-center gap-2 text-sm">
                                <span class="h-8 w-8 rounded-full bg-white text-[#0f2b46] text-xs font-semibold flex items-center justify-center ring-1 ring-amber-200">
                                    {{ initials(participant.name) }}
                                </span>
                                {{ participant.name }}
                            </span>
                            <div class="flex gap-2">
                                <button type="button" class="h-9 px-4 rounded-full bg-[#0f4c75] hover:bg-[#0f2b46] text-white text-sm font-medium" @click="admit(participant)">{{ $t('meetings.lobby.admit') }}</button>
                                <button type="button" class="h-9 px-4 rounded-full bg-white ring-1 ring-gray-200 hover:bg-gray-50 text-sm" @click="deny(participant)">{{ $t('meetings.lobby.deny') }}</button>
                            </div>
                        </div>
                    </div>

                    <!-- The room: a card before joining, the dark stage on its own while in the call. -->
                    <div v-if="state.showRoom && isOpen"
                        :class="state.inRoom ? '' : 'px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl'">
                        <MeetingRoom ref="roomRef" :connect="connect" :give-consent="giveConsent" can-share-screen
                            @joined="onJoined" @left="onLeft">
                            <template #info>
                                <p class="text-sm text-gray-600 flex items-center gap-1.5">
                                    <Icon name="ph:calendar-blank" class="h-4 w-4 text-gray-400" />
                                    {{ meeting.title }} · {{ formatTime(meeting.next_starts_at || meeting.starts_at) }}-{{ formatTime(meeting.next_ends_at || meeting.ends_at) }}
                                </p>
                                <p v-if="inRoomNames.length" class="text-sm text-gray-500">
                                    {{ $t('meetings.room.alreadyIn', { names: inRoomNames.join(', ') }) }}
                                </p>
                            </template>
                            <template #chat-attach>
                                <button v-if="meeting.citizen" type="button"
                                    class="h-9 w-9 shrink-0 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                                    :title="$t('meetings.files.fromCitizen')" @click="state.pickFile = true">
                                    <Icon name="ph:folder-open" class="h-5 w-5" />
                                </button>
                            </template>
                            <template #controls="{ recording }">
                                <button type="button" class="h-11 w-11 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20"
                                    :title="$t('meetings.notes.title')" @click="scrollToNotes">
                                    <Icon name="ph:note-pencil" class="h-5 w-5" />
                                </button>
                                <template v-if="meeting.is_host">
                                    <button type="button" class="h-11 px-4 rounded-full flex items-center gap-2 text-sm font-medium transition"
                                        :class="recording ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white/10 text-white hover:bg-white/20'"
                                        :disabled="state.recordingBusy" @click="recording ? stopRecording() : startRecording()">
                                        <Icon name="ph:record-fill" class="h-5 w-5" :class="recording ? 'text-white' : 'text-red-500'" />
                                        {{ recording ? $t('meetings.host_controls.stopRecording') : $t('meetings.host_controls.record') }}
                                    </button>
                                    <button type="button" class="h-11 px-4 rounded-full ring-1 ring-red-400/50 text-red-300 hover:bg-red-500/10 text-sm"
                                        @click="finishForEveryone">
                                        {{ $t('meetings.host_controls.endForEveryone') }}
                                    </button>
                                </template>
                            </template>
                        </MeetingRoom>
                    </div>

                    <!-- Agenda and shared notes (staff only). -->
                    <div ref="notesEl">
                        <MeetingNotesPanel :meeting="meeting" @filed="load" />
                    </div>

                    <MeetingCitizenFilePicker v-if="meeting.citizen" :show="state.pickFile" :citizenUuid="meeting.citizen.uuid"
                        @close="state.pickFile = false" @picked="(file: File) => roomRef?.shareFile(file)" />

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
                                            <span v-if="participant.is_interpreter" class="ml-1 text-[11px] font-medium rounded-full px-2 py-0.5 bg-[#f0faf9] text-[#1b6d8a]">{{ $t('meetings.interpreter') }}</span>
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
                                    <FormButton v-if="recording.status === 'ready' && recording.has_audio && !recording.summary_status"
                                        type="button" buttonStyle="secondary" :disabled="state.summaryBusy === recording.uuid"
                                        @click="requestSummary(recording)">
                                        <Icon name="ph:sparkle" class="h-4 w-4 mr-1" /> {{ $t('meetings.summary.make') }}
                                    </FormButton>
                                    <button v-if="meeting.is_host && ['ready', 'failed'].includes(recording.status)" type="button"
                                        class="text-sm px-2 py-1 rounded text-red-600 hover:bg-red-50" @click="state.deleteRecording = recording">
                                        {{ $t('meetings.detail.delete') }}
                                    </button>

                                    <!-- Cody's summary -->
                                    <div v-if="recording.summary_status" class="basis-full text-sm">
                                        <p v-if="recording.summary_status === 'queued'" class="flex items-center gap-2 text-gray-600">
                                            <Icon name="ph:spinner" class="h-4 w-4 animate-spin" /> {{ $t('meetings.summary.working') }}
                                        </p>
                                        <div v-else-if="recording.summary_status === 'failed'" class="flex flex-wrap items-center gap-2 text-red-700">
                                            <span>{{ $t(`meetings.summary.errors.${recording.summary_error || 'ai_error'}`) }}</span>
                                            <button v-if="!['too_long', 'no_audio'].includes(recording.summary_error)" type="button"
                                                class="underline" @click="requestSummary(recording)">{{ $t('meetings.summary.retry') }}</button>
                                        </div>
                                        <div v-else-if="recording.summary" class="mt-1 border border-gray-200 rounded-md p-3 bg-gray-50">
                                            <p class="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                <Icon name="ph:sparkle" class="h-3.5 w-3.5" /> {{ $t('meetings.summary.byCody') }}
                                            </p>
                                            <div class="prose prose-sm max-w-none" v-safe-ai-html="recording.summary" />
                                            <NuxtLink v-if="recording.summary_journal && meeting.citizen" class="inline-block mt-2 text-primary underline"
                                                :to="`/citizens/${meeting.citizen.uuid}/journals`">
                                                {{ $t('meetings.summary.openDraft') }}
                                            </NuxtLink>
                                            <p v-else-if="recording.summary_journal" class="mt-2 text-xs text-gray-500">{{ $t('meetings.summary.draftCreated') }}</p>
                                        </div>
                                    </div>
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
import { initials } from '@/utils/meetings'
import MeetingNotesPanel from '@/components/modules/user/meetings/notes-panel.vue'
import MeetingCitizenFilePicker from '@/components/modules/user/meetings/citizen-file-picker.vue'
import { meetingService } from '@/components/api/user/MeetingService'
import { userService } from '@/components/api/user/UserService'
import { useMeetingJoinLinks } from '@/composables/meetingJoinLinks'
import { useMeetingLobbyChannel } from '@/composables/meetingLobbyChannel'
import { useCodyAdoption } from '@/composables/useCodyAdoption'
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
const notesEl = ref<HTMLElement>()

function scrollToNotes() {
    notesEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
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
    summaryBusy: '',
    pickFile: false,
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
    // "Start now" and the calendar send people straight to the pre-join.
    if (route.query.join && isOpen.value) state.showRoom = true
    await loadRecordings()
    if (state.recordings.some((r: any) => r.summary_status === 'queued')) watchSummaries()
    if (state.meeting?.is_host) loadUsers()
})

onBeforeUnmount(() => {
    stopPolling()
    lobby.stop()
    stopSummaryPoll()
})

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
// With the live lobby channel connected, a guest knocking refreshes at once
// and the poll only catches the rest, so it runs less often.
const lobby = useMeetingLobbyChannel(uuid, () => load())

function startPolling() {
    stopPolling()
    poll = setInterval(async () => {
        await load()
        loadRecordings()
    }, lobby.connected.value ? 15000 : 4000)
}

watch(lobby.connected, () => { if (poll) startPolling() })

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
    if (state.meeting?.is_host) lobby.start()
    startPolling()
}

function onLeft() {
    state.inRoom = false
    stopPolling()
    lobby.stop()
    load()
    loadRecordings()
}

// Cody's summary. Without Cody (not bought, or no seat) the API says which,
// and the app's own Cody screen opens: buy or start the trial for whoever
// may buy, ask the administrator for everyone else.
const codyAdoption = useCodyAdoption()
let summaryPoll: ReturnType<typeof setInterval> | null = null

async function requestSummary(recording: any) {
    state.summaryBusy = recording.uuid
    try {
        const response = await meetingService.requestSummary(recording.uuid)
        Object.assign(recording, response?.data ?? {})
        watchSummaries()
    } catch (error: any) {
        if (['meeting_summary_cody_required', 'meeting_summary_cody_seat_required'].includes(error?.code)) {
            codyAdoption.promptOpen.value = true
        } else {
            state.error = error
        }
    }
    state.summaryBusy = ''
}

function watchSummaries() {
    stopSummaryPoll()
    summaryPoll = setInterval(async () => {
        await loadRecordings()
        if (!state.recordings.some((r: any) => r.summary_status === 'queued')) stopSummaryPoll()
    }, 10000)
}

function stopSummaryPoll() {
    if (summaryPoll) clearInterval(summaryPoll)
    summaryPoll = null
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

const headerActions = computed(() => [
    { key: 'edit', label: t('meetings.detail.edit'), icon: 'ph:pencil-simple', run: () => { state.editing = !state.editing } },
    { key: 'cancel', label: t('meetings.detail.cancelMeeting'), icon: 'ph:x-circle', danger: true, run: () => { state.confirmCancel = true } },
])

// Who is already in the room, shown before joining.
const inRoomNames = computed(() => (state.meeting?.participants ?? [])
    .filter((p: any) => p.state === 'in_room')
    .map((p: any) => p.name))


function statusClass(status: string) {
    return {
        scheduled: 'bg-[#f0faf9] text-[#1b6d8a]',
        live: 'bg-green-50 text-green-700',
        finished: 'bg-gray-100 text-gray-600',
        cancelled: 'bg-red-50 text-red-700',
    }[status] ?? 'bg-gray-100 text-gray-600'
}

const formatDate = (value: string) => moment(value).format('DD-MM-YYYY')
const formatTime = (value: string) => moment(value).format('HH:mm')

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}
</script>
