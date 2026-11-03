<template>
    <div>
        <!-- Before joining: a compact preview with the toggles on the picture. -->
        <div v-if="state.phase === 'prejoin' || state.phase === 'waiting'"
            class="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 md:gap-10 items-center">
            <div class="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0f2b46] shadow-sm">
                <video ref="previewEl" autoplay muted playsinline class="w-full h-full object-cover -scale-x-100"
                    v-show="state.cameraOn && state.hasPreview" />
                <div v-if="!state.cameraOn || !state.hasPreview"
                    class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
                    <Icon name="ph:video-camera-slash" class="h-10 w-10" />
                    <p class="text-sm">{{ $t('meetings.room.cameraIsOff') }}</p>
                </div>

                <div class="absolute inset-x-0 bottom-0 pt-10 pb-3 flex justify-center gap-3 bg-gradient-to-t from-black/60 to-transparent">
                    <button type="button" :class="roundButton(!state.microphoneOn, true)"
                        :title="state.microphoneOn ? $t('meetings.room.muteMicrophone') : $t('meetings.room.unmuteMicrophone')"
                        :aria-pressed="!state.microphoneOn" @click="state.microphoneOn = !state.microphoneOn">
                        <Icon :name="state.microphoneOn ? 'ph:microphone' : 'ph:microphone-slash'" class="h-5 w-5" />
                    </button>
                    <button type="button" :class="roundButton(!state.cameraOn, true)"
                        :title="state.cameraOn ? $t('meetings.room.turnCameraOff') : $t('meetings.room.turnCameraOn')"
                        :aria-pressed="!state.cameraOn" @click="state.cameraOn = !state.cameraOn">
                        <Icon :name="state.cameraOn ? 'ph:video-camera' : 'ph:video-camera-slash'" class="h-5 w-5" />
                    </button>
                    <button v-if="state.blurSupported" type="button" :class="roundButton(false, true, state.blur)"
                        :disabled="!state.cameraOn" :aria-pressed="state.blur"
                        :title="state.blur ? $t('meetings.room.blurOn') : $t('meetings.room.blurOff')" @click="toggleBlur">
                        <Icon name="ph:person-simple-circle" class="h-5 w-5" />
                    </button>
                    <button type="button" :class="roundButton(false, true, state.showSettings)" :aria-pressed="state.showSettings"
                        :title="$t('meetings.room.settings')" @click="state.showSettings = !state.showSettings">
                        <Icon name="ph:gear-six" class="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div class="space-y-5">
                <div class="space-y-1">
                    <h3 class="text-2xl font-semibold text-[#0f2b46]">{{ $t('meetings.room.ready') }}</h3>
                    <slot name="info" />
                </div>

                <div v-if="state.showSettings" class="space-y-3 rounded-xl border border-gray-200 p-4">
                    <label class="block space-y-1">
                        <span class="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <Icon name="ph:video-camera" class="h-4 w-4" /> {{ $t('meetings.room.camera') }}
                        </span>
                        <select v-model="state.cameraId" @change="startPreview"
                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                            <option v-for="d in state.cameras" :key="d.deviceId" :value="d.deviceId">
                                {{ d.label || $t('meetings.room.camera') }}
                            </option>
                        </select>
                    </label>
                    <label class="block space-y-1">
                        <span class="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <Icon name="ph:microphone" class="h-4 w-4" /> {{ $t('meetings.room.microphone') }}
                        </span>
                        <select v-model="state.microphoneId" @change="startPreview"
                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                            <option v-for="d in state.microphones" :key="d.deviceId" :value="d.deviceId">
                                {{ d.label || $t('meetings.room.microphone') }}
                            </option>
                        </select>
                    </label>
                </div>

                <!-- A meeting that is being recorded is only entered with consent. -->
                <label v-if="state.needsConsent" class="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <input type="checkbox" v-model="state.consent" class="mt-0.5" />
                    <span>{{ $t('meetings.room.consentToEnter') }}</span>
                </label>

                <Alert type="danger" :text="state.deviceError" v-if="state.deviceError" />
                <Alert type="danger" :text="state.joinError" v-if="state.joinError" />

                <div v-if="state.phase === 'waiting'" class="flex items-center gap-3 rounded-xl bg-[#f0faf9] px-4 py-3 text-sm text-[#0f2b46]">
                    <Icon name="ph:hourglass-medium" class="h-5 w-5 animate-pulse text-[#1b6d8a]" />
                    {{ waitingText || $t('meetings.room.waitingToBeLetIn') }}
                </div>
                <button v-else type="button"
                    class="w-full h-12 rounded-full bg-[#0f4c75] hover:bg-[#0f2b46] text-white font-semibold transition disabled:opacity-50"
                    :disabled="state.isJoining || (state.needsConsent && !state.consent)" @click="join">
                    {{ $t('meetings.room.join') }}
                </button>

                <p class="flex items-center gap-1.5 text-xs text-gray-500">
                    <Icon name="ph:lock-simple" class="h-3.5 w-3.5" /> {{ $t('meetings.room.privacyNote') }}
                </p>
            </div>
        </div>

        <!-- In the meeting: a dark stage with the people, chat beside, controls below. -->
        <div v-else-if="state.phase === 'connected' || state.phase === 'connecting'"
            class="relative rounded-2xl bg-[#0b1726] p-3 sm:p-4 space-y-3">
            <div class="flex items-center justify-between gap-3 text-white/80 text-sm min-h-7">
                <div class="flex items-center gap-2">
                    <span v-if="state.recording" class="inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-xs font-medium text-white">
                        <span class="h-2 w-2 rounded-full bg-white animate-pulse" /> {{ $t('meetings.room.recordingPill') }}
                    </span>
                    <span v-if="state.reconnecting" class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-medium text-black">
                        {{ $t('meetings.room.reconnecting') }}
                    </span>
                </div>
                <span class="inline-flex items-center gap-1.5 text-xs">
                    <Icon name="ph:users" class="h-4 w-4" /> {{ $t('meetings.room.participantsCount', { count: cameraTiles.length }) }}
                </span>
            </div>

            <div v-if="state.phase === 'connecting'" class="aspect-video rounded-xl flex flex-col items-center justify-center gap-3 text-white/70">
                <Icon name="ph:spinner" class="h-10 w-10 animate-spin" />
                <p>{{ $t('meetings.room.connecting') }}</p>
            </div>

            <div v-else class="flex flex-col lg:flex-row gap-3">
                <div class="flex-1 min-w-0 space-y-3">
                    <!-- A shared screen is shown large, everyone else beside it. -->
                    <div v-if="screenTile" class="grid grid-cols-1 xl:grid-cols-4 gap-3">
                        <MeetingTile class="xl:col-span-3" :key="screenTile.key" :track="screenTile.track" :label="screenTile.label"
                            :is-local="screenTile.isLocal" is-screen />
                        <div class="grid grid-cols-2 xl:grid-cols-1 gap-3 content-start">
                            <MeetingTile v-for="tile in cameraTiles" :key="tile.key" :track="tile.track" :label="tile.label"
                                :is-local="tile.isLocal" :microphone-muted="tile.microphoneMuted" :speaking="tile.speaking"
                                :hand-raised="tile.handRaised" />
                        </div>
                    </div>
                    <div v-else class="grid gap-3" :class="gridClass">
                        <MeetingTile v-for="tile in cameraTiles" :key="tile.key" :track="tile.track" :label="tile.label"
                            :is-local="tile.isLocal" :microphone-muted="tile.microphoneMuted" :speaking="tile.speaking"
                            :hand-raised="tile.handRaised" />
                    </div>
                    <p v-if="cameraTiles.length === 1" class="text-center text-sm text-white/60">
                        {{ $t('meetings.room.aloneInMeeting') }}
                    </p>
                </div>

                <!-- Chat and files: only in the call (LiveKit data channel), nothing is stored. -->
                <aside v-if="state.chatOpen"
                    class="lg:w-80 shrink-0 rounded-xl bg-white flex flex-col max-h-[60vh] lg:max-h-[70vh]">
                    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <p class="font-semibold text-sm text-[#0f2b46]">{{ $t('meetings.room.chat') }}</p>
                        <button type="button" class="text-gray-400 hover:text-gray-700" :title="$t('meetings.room.closeChat')" @click="state.chatOpen = false">
                            <Icon name="ph:x" class="h-4 w-4" />
                        </button>
                    </div>
                    <!-- With the chat open, polls live at its top instead of over the people. -->
                    <div v-if="state.polls.length" class="border-b border-gray-100 bg-gray-50/70 p-3 space-y-2 max-h-[45%] overflow-y-auto">
                        <MeetingPollCard v-for="poll in state.polls" :key="poll.id" :poll="poll" :me="me()" :mine="isMine(poll)" flat
                            @vote="(i: number) => vote(poll, i)" @close="closePoll(poll)" @save="emit('poll-result', pollResultText(poll))" @hide="removePoll(poll)" />
                    </div>
                    <div ref="chatList" class="flex-1 overflow-y-auto p-4 space-y-3 text-sm min-h-[12rem]">
                        <p v-if="!state.messages.length" class="text-gray-400 text-xs text-center pt-6">{{ $t('meetings.room.chatEmpty') }}</p>
                        <div v-for="(message, index) in state.messages" :key="index" class="flex flex-col"
                            :class="message.mine ? 'items-end' : 'items-start'">
                            <p class="text-[11px] text-gray-400 mb-0.5">{{ message.mine ? $t('meetings.you') : message.name }} · {{ message.time }}</p>
                            <a v-if="message.file" :href="message.file.url" :download="message.file.name"
                                class="inline-flex items-center gap-2 rounded-2xl px-3 py-2 max-w-full border"
                                :class="message.mine ? 'bg-[#0f4c75] text-white border-[#0f4c75]' : 'bg-gray-50 border-gray-200 text-[#0f2b46]'">
                                <Icon :name="message.file.sending ? 'ph:spinner' : 'ph:file-arrow-down'" class="h-5 w-5 shrink-0" :class="message.file.sending && 'animate-spin'" />
                                <span class="min-w-0">
                                    <span class="block truncate font-medium">{{ message.file.name }}</span>
                                    <span class="block text-[11px] opacity-70">{{ formatFileSize(message.file.size) }}</span>
                                </span>
                            </a>
                            <p v-else class="inline-block rounded-2xl px-3 py-2 whitespace-pre-wrap break-words max-w-full"
                                :class="message.mine ? 'bg-[#0f4c75] text-white' : 'bg-gray-100 text-gray-900'">{{ message.text }}</p>
                        </div>
                    </div>
                    <p v-if="state.fileError" class="px-4 pb-1 text-xs text-red-600">{{ state.fileError }}</p>
                    <form class="border-t border-gray-100 p-2 flex items-center gap-1.5" @submit.prevent="sendChat">
                        <input ref="fileInput" type="file" class="hidden" @change="sendFile" />
                        <slot name="chat-attach" />
                        <button type="button" class="h-9 w-9 shrink-0 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                            :title="$t('meetings.room.attachFile')" @click="fileInput?.click()">
                            <Icon name="ph:paperclip" class="h-5 w-5" />
                        </button>
                        <input v-model="state.draft" type="text" maxlength="1000" :placeholder="$t('meetings.room.chatPlaceholder')"
                            class="flex-1 min-w-0 border border-gray-200 rounded-full px-3 py-2 text-sm" />
                        <button type="submit" class="h-9 w-9 shrink-0 rounded-full bg-[#0f4c75] text-white flex items-center justify-center disabled:opacity-40"
                            :disabled="!state.draft.trim()" :title="$t('meetings.room.send')">
                            <Icon name="ph:paper-plane-right" class="h-4 w-4" />
                        </button>
                    </form>
                    <p class="px-4 pb-3 text-[11px] text-gray-400">{{ $t('meetings.room.chatNotSaved') }}</p>
                </aside>
            </div>

            <div ref="audioContainer" class="hidden" />

            <!-- Polls: the creator's draft, then every poll with its live result. -->
            <div v-if="state.pollDraft.open || (!state.chatOpen && state.polls.length)"
                :class="state.chatOpen ? 'lg:right-[21.5rem]' : ''"
                class="absolute right-3 top-12 z-10 w-[min(22rem,calc(100%-1.5rem))] max-h-[70%] overflow-y-auto space-y-2">
                <form v-if="state.pollDraft.open" class="rounded-xl bg-white shadow-lg p-4 space-y-3" @submit.prevent="createPoll">
                    <p class="text-sm font-semibold text-[#0f2b46]">{{ $t('meetings.polls.new') }}</p>
                    <input v-model="state.pollDraft.question" type="text" maxlength="200" :placeholder="$t('meetings.polls.question')"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                    <div v-for="(_, index) in state.pollDraft.options" :key="index" class="flex gap-1.5">
                        <input v-model="state.pollDraft.options[index]" type="text" maxlength="80"
                            :placeholder="$t('meetings.polls.option', { n: index + 1 })"
                            class="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
                        <button v-if="state.pollDraft.options.length > 2" type="button" class="text-gray-400 hover:text-red-600 px-1"
                            :title="$t('meetings.detail.remove')" @click="state.pollDraft.options.splice(index, 1)">
                            <Icon name="ph:x" class="h-4 w-4" />
                        </button>
                    </div>
                    <button v-if="state.pollDraft.options.length < 6" type="button" class="text-sm text-[#1b6d8a] hover:underline"
                        @click="state.pollDraft.options.push('')">+ {{ $t('meetings.polls.addOption') }}</button>
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" v-model="state.pollDraft.anonymous" /> {{ $t('meetings.polls.anonymous') }}
                    </label>
                    <div class="flex gap-2">
                        <FormButton type="submit" buttonStyle="primary" buttonSize="xs" :disabled="!pollDraftValid">{{ $t('meetings.polls.start') }}</FormButton>
                        <FormButton type="button" buttonStyle="cancel" buttonSize="xs" @click="state.pollDraft.open = false">{{ $t('cancel') }}</FormButton>
                    </div>
                </form>

                <template v-if="!state.chatOpen">
                    <MeetingPollCard v-for="poll in state.polls" :key="poll.id" :poll="poll" :me="me()" :mine="isMine(poll)"
                        @vote="(i: number) => vote(poll, i)" @close="closePoll(poll)" @save="emit('poll-result', pollResultText(poll))" @hide="removePoll(poll)" />
                </template>
            </div>

            <!-- Prompts float over the stage. -->
            <div v-if="state.consentRequestFrom || state.notice || state.audioBlocked"
                class="absolute left-1/2 -translate-x-1/2 top-14 z-10 w-[min(28rem,calc(100%-2rem))] space-y-2">
                <div v-if="state.consentRequestFrom" class="rounded-xl bg-white shadow-lg p-4 space-y-3">
                    <p class="text-sm text-gray-900">{{ $t('meetings.room.consentQuestion', { name: state.consentRequestFrom }) }}</p>
                    <div class="flex gap-2">
                        <FormButton type="button" buttonStyle="primary" @click="answerConsent(true)">{{ $t('meetings.room.consentYes') }}</FormButton>
                        <FormButton type="button" buttonStyle="cancel" @click="answerConsent(false)">{{ $t('meetings.room.consentNo') }}</FormButton>
                    </div>
                </div>
                <div v-if="state.audioBlocked" class="rounded-xl bg-white shadow-lg p-3 flex items-center justify-between gap-3 text-sm">
                    <span>{{ $t('meetings.room.soundBlocked') }}</span>
                    <FormButton type="button" buttonStyle="primary" @click="enableAudio">{{ $t('meetings.room.enableSound') }}</FormButton>
                </div>
                <div v-if="state.notice" class="rounded-xl bg-white/95 shadow-lg px-4 py-2.5 text-sm text-gray-800 flex items-start justify-between gap-3">
                    <span>{{ state.notice }}</span>
                    <button type="button" class="text-gray-400 hover:text-gray-700" @click="state.notice = ''"><Icon name="ph:x" class="h-4 w-4" /></button>
                </div>
            </div>

            <!-- Controls -->
            <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
                <button type="button" :class="roundButton(!state.microphoneOn)"
                    :title="state.microphoneOn ? $t('meetings.room.muteMicrophone') : $t('meetings.room.unmuteMicrophone')"
                    :aria-pressed="!state.microphoneOn" @click="toggleMicrophone">
                    <Icon :name="state.microphoneOn ? 'ph:microphone' : 'ph:microphone-slash'" class="h-5 w-5" />
                </button>
                <button type="button" :class="roundButton(!state.cameraOn)"
                    :title="state.cameraOn ? $t('meetings.room.turnCameraOff') : $t('meetings.room.turnCameraOn')"
                    :aria-pressed="!state.cameraOn" @click="toggleCamera">
                    <Icon :name="state.cameraOn ? 'ph:video-camera' : 'ph:video-camera-slash'" class="h-5 w-5" />
                </button>
                <button v-if="state.blurSupported && state.cameraOn" type="button" :class="roundButton(false, false, state.blur)"
                    :aria-pressed="state.blur" :title="state.blur ? $t('meetings.room.blurOn') : $t('meetings.room.blurOff')" @click="toggleBlur">
                    <Icon name="ph:person-simple-circle" class="h-5 w-5" />
                </button>
                <button v-if="screenShareAllowed" type="button" :class="roundButton(false, false, state.screenSharing)"
                    :aria-pressed="state.screenSharing"
                    :title="state.screenSharing ? $t('meetings.room.stopSharing') : $t('meetings.room.shareScreen')"
                    @click="toggleScreenShare">
                    <Icon name="ph:monitor-arrow-up" class="h-5 w-5" />
                </button>
                <button type="button" :class="roundButton(false, false, handRaisedByMe)" :aria-pressed="handRaisedByMe"
                    :title="handRaisedByMe ? $t('meetings.room.lowerHand') : $t('meetings.room.raiseHand')" @click="toggleHand">
                    <Icon :name="handRaisedByMe ? 'ph:hand-palm-fill' : 'ph:hand-palm'" class="h-5 w-5" />
                </button>
                <button type="button" class="relative" :class="roundButton(false, false, state.chatOpen)" :aria-pressed="state.chatOpen"
                    :title="$t('meetings.room.chat')" @click="toggleChat">
                    <Icon name="ph:chat-circle-text" class="h-5 w-5" />
                    <span v-if="state.unread" class="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                        {{ state.unread }}
                    </span>
                </button>
                <button v-if="canCreatePolls" type="button" :class="roundButton(false, false, state.pollDraft.open)"
                    :aria-pressed="state.pollDraft.open" :title="$t('meetings.polls.new')" @click="state.pollDraft.open = !state.pollDraft.open">
                    <Icon name="ph:chart-bar-horizontal" class="h-5 w-5" />
                </button>
                <slot name="controls" :recording="state.recording" />
                <button type="button" class="h-11 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 text-sm font-medium"
                    @click="leave">
                    <Icon name="ph:phone-disconnect" class="h-5 w-5" />
                    {{ $t('meetings.room.leave') }}
                </button>
            </div>
        </div>

        <!-- After the meeting. -->
        <div v-else class="py-12 flex flex-col items-center gap-3 text-center">
            <Icon :name="state.phase === 'error' ? 'ph:warning-circle' : 'ph:check-circle'" class="h-12 w-12"
                :class="state.phase === 'error' ? 'text-red-500' : 'text-[#2dbab2]'" />
            <p class="text-lg font-semibold text-[#0f2b46]">
                {{ state.phase === 'error' ? $t('meetings.room.couldNotConnect') : $t('meetings.room.left') }}
            </p>
            <p class="text-sm text-gray-500" v-if="state.phase === 'error'">{{ state.errorMessage }}</p>
            <button type="button" class="h-11 px-6 rounded-full bg-[#0f4c75] hover:bg-[#0f2b46] text-white font-medium" @click="backToPrejoin">
                {{ $t('meetings.room.rejoin') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
    ConnectionState,
    createLocalTracks,
    DisconnectReason,
    Room,
    RoomEvent,
    Track,
    VideoPresets,
    type LocalTrack,
    type LocalVideoTrack,
    type Participant,
    type RemoteParticipant,
} from 'livekit-client'
import MeetingTile from '@/components/modules/shared/meeting/tile.vue'
import MeetingPollCard from '@/components/modules/shared/meeting/poll-card.vue'
import { formatFileSize } from '@/utils/meetings'

/**
 * A CitizenOne Online Meeting with any number of participants, used by the
 * staff page and the guest link page alike.
 *
 * The page supplies `connect(consent)`: it asks the API for a join token
 * (for a guest that includes waiting in the lobby) and resolves with
 * { ws_url, token, room, identity }. If the meeting is being recorded the API
 * answers 409 meeting_recording_consent_required, and this component asks
 * for consent before trying again.
 *
 * Recording consent inside the call travels as LiveKit data messages
 * ("consent_request" / "consent_answer"); the answer itself is recorded by
 * the page's `giveConsent()`, which calls the API. The API, not this
 * component, decides whether recording may start.
 */
type Connection = { ws_url: string, token: string, room: string, identity: string }

// A poll lives only in the call. Votes are keyed by participant identity, so a
// changed vote replaces the earlier one.
type Poll = {
    id: string
    question: string
    options: string[]
    anonymous: boolean
    closed: boolean
    by: string
    votes: Record<string, number>
    names: Record<string, string>
}

const props = defineProps<{
    connect: (consent: boolean) => Promise<Connection>
    giveConsent: () => Promise<void>
    canShareScreen?: boolean
    canCreatePolls?: boolean
    waitingText?: string
    isWaiting?: boolean
}>()
const emit = defineEmits(['joined', 'left', 'consent-answer', 'poll-result'])
const { t } = useI18n()

const previewEl = ref<HTMLVideoElement>()
const chatList = ref<HTMLDivElement>()
const fileInput = ref<HTMLInputElement>()
const audioContainer = ref<HTMLDivElement>()
const room = shallowRef<Room | null>(null)
let previewTracks: LocalTrack[] = []

// LiveKit's TrackSource.SCREEN_SHARE in a participant's permission.
const TRACK_SOURCE_SCREEN_SHARE = 3

const state = reactive({
    // What LiveKit allows once connected; the host can change it during the meeting.
    screenAllowed: null as boolean | null,
    phase: 'prejoin' as 'prejoin' | 'waiting' | 'connecting' | 'connected' | 'left' | 'error',
    cameras: [] as MediaDeviceInfo[],
    microphones: [] as MediaDeviceInfo[],
    cameraId: '',
    microphoneId: '',
    cameraOn: true,
    microphoneOn: true,
    hasPreview: false,
    deviceError: '',
    joinError: '',
    isJoining: false,
    needsConsent: false,
    consent: false,
    screenSharing: false,
    reconnecting: false,
    audioBlocked: false,
    recording: false,
    consentRequestFrom: '',
    notice: '',
    errorMessage: '',
    blur: false,
    blurSupported: false,
    chatOpen: false,
    messages: [] as { name: string, text: string, time: string, mine: boolean, file?: { name: string, size: number, url: string, sending?: boolean } }[],
    showSettings: false,
    polls: [] as Poll[],
    pollDraft: { open: false, question: '', options: ['', ''] as string[], anonymous: true },
    fileError: '',
    draft: '',
    unread: 0,
    // Raised hands by participant identity.
    hands: {} as Record<string, boolean>,
    // Bumped on every room event; the tiles are recomputed from the room.
    version: 0,
})

watch(() => props.isWaiting, (waiting) => {
    if (waiting && state.phase === 'prejoin') state.phase = 'waiting'
})

type Tile = { key: string, track: any, label: string, isLocal: boolean, microphoneMuted: boolean, speaking: boolean, handRaised?: boolean }

function participants(): Participant[] {
    const r = room.value
    if (!r) return []
    return [r.localParticipant, ...Array.from(r.remoteParticipants.values())]
}

const cameraTiles = computed<Tile[]>(() => {
    void state.version
    const r = room.value
    return participants().map((participant) => ({
        key: participant.identity,
        track: participant.getTrackPublication(Track.Source.Camera)?.track ?? null,
        label: (participant === r?.localParticipant
            ? t('meetings.room.you', { name: participant.name || '' })
            : (participant.name || participant.identity))
            + (isInterpreter(participant) ? ` · ${t('meetings.interpreter')}` : ''),
        isLocal: participant === r?.localParticipant,
        microphoneMuted: !participant.isMicrophoneEnabled,
        speaking: participant.isSpeaking,
        handRaised: !!state.hands[participant.identity],
    }))
})

const screenTile = computed<Tile | null>(() => {
    void state.version
    for (const participant of participants()) {
        const track = participant.getTrackPublication(Track.Source.ScreenShare)?.track
        if (track) {
            return {
                key: `${participant.identity}-screen`,
                track,
                label: t('meetings.room.sharedBy', { name: participant.name || participant.identity }),
                isLocal: participant === room.value?.localParticipant,
                microphoneMuted: false,
                speaking: false,
            }
        }
    }
    return null
})

const gridClass = computed(() => {
    const count = cameraTiles.value.length
    if (count <= 1) return 'grid-cols-1 max-w-4xl mx-auto'
    if (count === 2) return 'grid-cols-1 md:grid-cols-2'
    if (count <= 4) return 'grid-cols-2'
    if (count <= 9) return 'grid-cols-2 lg:grid-cols-3'
    return 'grid-cols-3 lg:grid-cols-4'
})

onMounted(async () => {
    await loadDevices()
    await startPreview()
    try {
        state.blurSupported = (await loadBlurLibrary()).supportsBackgroundProcessors()
    } catch {
        state.blurSupported = false
    }
})

onBeforeUnmount(() => {
    stopPreview()
    fileUrls.forEach((url) => URL.revokeObjectURL(url))
    room.value?.disconnect()
})

watch(() => state.cameraOn, () => {
    if (state.phase === 'prejoin' || state.phase === 'waiting') startPreview()
})

async function loadDevices() {
    try {
        state.cameras = await Room.getLocalDevices('videoinput', true)
        state.microphones = await Room.getLocalDevices('audioinput', true)
        state.cameraId ||= state.cameras[0]?.deviceId ?? ''
        state.microphoneId ||= state.microphones[0]?.deviceId ?? ''
    } catch {
        state.deviceError = t('meetings.room.permissionDenied')
    }
}

async function startPreview() {
    stopPreview()
    state.deviceError = ''
    try {
        previewTracks = await createLocalTracks({
            audio: state.microphoneId ? { deviceId: state.microphoneId } : true,
            video: state.cameraOn
                ? { deviceId: state.cameraId || undefined, resolution: VideoPresets.h720.resolution }
                : false,
        })
        const video = previewTracks.find((track) => track.kind === Track.Kind.Video) as LocalVideoTrack | undefined
        if (video && state.blur) await applyBlur(video)
        state.hasPreview = !!video
        await nextTick()
        if (video && previewEl.value) video.attach(previewEl.value)
    } catch (error: any) {
        state.hasPreview = false
        state.deviceError = error?.name === 'NotAllowedError'
            ? t('meetings.room.permissionDenied')
            : t('meetings.room.deviceUnavailable')
    }
}

/*
 * Background blur runs in the browser (MediaPipe selfie segmentation via
 * @livekit/track-processors); only the blurred picture is sent. The library
 * and its model are loaded the first time blur is switched on.
 */
let blurLibrary: typeof import('@livekit/track-processors') | null = null

async function loadBlurLibrary() {
    blurLibrary ??= await import('@livekit/track-processors')
    return blurLibrary
}

function cameraTrack(): LocalVideoTrack | undefined {
    return room.value?.localParticipant.getTrackPublication(Track.Source.Camera)?.track as LocalVideoTrack | undefined
}

async function applyBlur(track?: LocalVideoTrack) {
    if (!track) return
    try {
        const { BackgroundProcessor } = await loadBlurLibrary()
        await track.setProcessor(BackgroundProcessor({ mode: 'background-blur', blurRadius: 12 }))
    } catch {
        state.blur = false
        state.notice = t('meetings.room.blurUnavailable')
    }
}

async function removeBlur(track?: LocalVideoTrack) {
    try {
        await track?.stopProcessor()
    } catch {
        // Nothing to stop.
    }
}

async function toggleBlur() {
    state.blur = !state.blur
    const track = state.phase === 'connected'
        ? cameraTrack()
        : previewTracks.find((t) => t.kind === Track.Kind.Video) as LocalVideoTrack | undefined
    if (state.blur) await applyBlur(track)
    else await removeBlur(track)
    refresh()
}

function stopPreview() {
    previewTracks.forEach((track) => track.stop())
    previewTracks = []
    state.hasPreview = false
}

async function join() {
    state.isJoining = true
    state.joinError = ''

    let connection: Connection
    try {
        connection = await props.connect(state.consent)
    } catch (error: any) {
        state.isJoining = false
        if (state.phase === 'waiting') state.phase = 'prejoin'
        if (error?.code === 'meeting_recording_consent_required' || error?.response?._data?.code === 'meeting_recording_consent_required') {
            state.needsConsent = true
            state.joinError = t('meetings.room.consentNeededToEnter')
            return
        }
        state.joinError = error?.message ?? t('meetings.room.couldNotConnect')
        return
    }

    state.phase = 'connecting'
    stopPreview()

    const r = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: { deviceId: state.cameraId || undefined, resolution: VideoPresets.h720.resolution },
        audioCaptureDefaults: { deviceId: state.microphoneId || undefined },
    })
    room.value = r
    bindRoomEvents(r)
    r.registerByteStreamHandler(FILE_TOPIC, (reader, participantInfo) => receiveFile(reader, participantInfo.identity))

    try {
        await r.connect(connection.ws_url, connection.token)
        state.phase = 'connected'
        readScreenPermission()
        // Being in the room does not depend on the devices: a camera or
        // microphone that fails is reported, and the person stays in.
        await enableDevices(r)
        state.recording = r.isRecording
        state.audioBlocked = !r.canPlaybackAudio
        refresh()
        emit('joined')
    } catch (error: any) {
        state.phase = 'error'
        state.errorMessage = error?.message ?? ''
    }
    state.isJoining = false
}

async function enableDevices(r: Room) {
    try {
        await r.localParticipant.setMicrophoneEnabled(state.microphoneOn)
    } catch {
        state.microphoneOn = false
        state.notice = t('meetings.room.microphoneFailed')
    }
    try {
        await r.localParticipant.setCameraEnabled(state.cameraOn)
        if (state.cameraOn && state.blur) await applyBlur(cameraTrack())
    } catch {
        state.cameraOn = false
        state.notice = t('meetings.room.cameraFailed')
    }
}

function refresh() {
    state.version++
}

function bindRoomEvents(r: Room) {
    r.on(RoomEvent.ParticipantConnected, () => {
        // Somebody new does not know who already has a hand up.
        if (handRaisedByMe.value) send({ type: 'hand', raised: true })
        // ...nor the polls this person started.
        const mine = state.polls.filter((poll) => isMine(poll))
        if (mine.length) send({ type: 'poll_state', polls: mine })
        refresh()
    })
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
            delete state.hands[participant.identity]
            refresh()
        })
        .on(RoomEvent.TrackSubscribed, (track) => {
            if (track.kind === Track.Kind.Audio) audioContainer.value?.appendChild(track.attach())
            refresh()
        })
        .on(RoomEvent.TrackUnsubscribed, (track) => {
            if (track.kind === Track.Kind.Audio) track.detach().forEach((element) => element.remove())
            refresh()
        })
        .on(RoomEvent.TrackMuted, refresh)
        .on(RoomEvent.TrackUnmuted, refresh)
        .on(RoomEvent.ParticipantPermissionsChanged, (_previous, participant) => {
            if (participant === room.value?.localParticipant) readScreenPermission()
        })
        .on(RoomEvent.LocalTrackPublished, refresh)
        .on(RoomEvent.LocalTrackUnpublished, (publication) => {
            if (publication.source === Track.Source.ScreenShare) state.screenSharing = false
            refresh()
        })
        .on(RoomEvent.ActiveSpeakersChanged, refresh)
        .on(RoomEvent.RecordingStatusChanged, (recording) => { state.recording = recording })
        .on(RoomEvent.DataReceived, (payload, participant) => onData(payload, participant))
        .on(RoomEvent.AudioPlaybackStatusChanged, () => { state.audioBlocked = !r.canPlaybackAudio })
        .on(RoomEvent.ConnectionStateChanged, (connectionState) => {
            state.reconnecting = connectionState === ConnectionState.Reconnecting
        })
        .on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
            if (state.phase === 'connected' || state.phase === 'connecting') {
                // The same person joined from another window or device: this
                // one was replaced, which is worth saying in so many words.
                if (reason === DisconnectReason.DUPLICATE_IDENTITY) {
                    state.phase = 'error'
                    state.errorMessage = t('meetings.room.joinedElsewhere')
                } else {
                    state.phase = 'left'
                }
                emit('left')
            }
        })
}

function onData(payload: Uint8Array, participant?: RemoteParticipant) {
    let message: any
    try {
        message = JSON.parse(new TextDecoder().decode(payload))
    } catch {
        return
    }

    if (message?.type === 'consent_request') {
        state.consentRequestFrom = participant?.name || t('meetings.room.theHost')
    }
    if (message?.type === 'consent_answer') {
        emit('consent-answer', { name: participant?.name ?? '', yes: !!message.yes })
        state.notice = message.yes
            ? t('meetings.room.consentGivenBy', { name: participant?.name ?? '' })
            : t('meetings.room.consentDeclinedBy', { name: participant?.name ?? '' })
    }
    if (message?.type === 'chat' && typeof message.text === 'string' && participant) {
        pushMessage(participant.name || participant.identity, message.text.slice(0, 1000), false)
    }
    if (participant) onPollMessage(message, participant)
    if (message?.type === 'hand' && participant) {
        state.hands[participant.identity] = !!message.raised
        refresh()
    }
}

async function send(message: object) {
    await room.value?.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(message)), { reliable: true })
}

function pushMessage(name: string, text: string, mine: boolean) {
    const now = new Date()
    state.messages.push({
        name,
        text,
        mine,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    })
    if (!mine && !state.chatOpen) state.unread++
    nextTick(() => chatList.value?.scrollTo({ top: chatList.value.scrollHeight }))
}

async function sendChat() {
    const text = state.draft.trim()
    if (!text) return
    state.draft = ''
    await send({ type: 'chat', text })
    pushMessage(room.value?.localParticipant.name ?? '', text, true)
}

/*
 * Files in the chat go straight to the others in the call over LiveKit's data
 * channel (byte streams). They are not uploaded anywhere or kept: a
 * participant who wants a file saves it from the chat during the meeting.
 */
const FILE_TOPIC = 'meeting-file'
const MAX_FILE_BYTES = 25 * 1024 * 1024
const fileUrls: string[] = []

async function sendFile(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (file) await shareFile(file)
}

async function receiveFile(reader: any, identity: string) {
    try {
        const chunks: Uint8Array[] = await reader.readAll()
        const info = reader.info ?? {}
        const blob = new Blob(chunks as BlobPart[], { type: info.mimeType || 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        fileUrls.push(url)
        const sender = room.value?.remoteParticipants.get(identity)
        pushFileMessage(sender?.name || identity, { name: info.name || 'file', size: blob.size, url }, false)
    } catch {
        // A file that did not arrive whole is dropped.
    }
}

function pushFileMessage(name: string, file: { name: string, size: number, url: string, sending?: boolean }, mine: boolean) {
    pushMessage(name, '', mine)
    const message = state.messages[state.messages.length - 1]
    message.file = file
    return message
}


/**
 * One look for every round control: red when something is off, teal when a
 * mode is on, translucent white otherwise (on the video or on the stage).
 */
function roundButton(off: boolean, onVideo = false, pressed = false) {
    const base = 'h-11 w-11 rounded-full flex items-center justify-center transition disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2dbab2]'
    if (off) return `${base} bg-red-600 text-white hover:bg-red-700`
    if (pressed) return `${base} bg-[#2dbab2] text-[#0b1726] hover:bg-[#25a39c]`
    return onVideo
        ? `${base} bg-white/20 text-white backdrop-blur hover:bg-white/30`
        : `${base} bg-white/10 text-white hover:bg-white/20`
}

function toggleChat() {
    state.chatOpen = !state.chatOpen
    if (state.chatOpen) {
        state.unread = 0
        nextTick(() => chatList.value?.scrollTo({ top: chatList.value.scrollHeight }))
    }
}

const handRaisedByMe = computed(() => {
    void state.version
    const identity = room.value?.localParticipant.identity
    return !!identity && !!state.hands[identity]
})

async function toggleHand() {
    const identity = room.value?.localParticipant.identity
    if (!identity) return
    const raised = !state.hands[identity]
    state.hands[identity] = raised
    refresh()
    await send({ type: 'hand', raised })
}


/*
 * Polls. The person who starts a poll keeps its state and sends it to anyone
 * who joins later; everyone tallies the votes they receive. Nothing is stored
 * unless the creator saves the result in the meeting notes.
 */
const me = () => room.value?.localParticipant.identity ?? ''

const pollDraftValid = computed(() => state.pollDraft.question.trim() !== ''
    && state.pollDraft.options.filter((option) => option.trim() !== '').length >= 2)

async function createPoll() {
    if (!pollDraftValid.value) return
    const poll: Poll = {
        id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
        question: state.pollDraft.question.trim(),
        options: state.pollDraft.options.map((option) => option.trim()).filter(Boolean).slice(0, 6),
        anonymous: state.pollDraft.anonymous,
        closed: false,
        by: me(),
        votes: {},
        names: {},
    }
    state.polls.unshift(poll)
    state.pollDraft = { open: false, question: '', options: ['', ''], anonymous: true }
    await send({ type: 'poll', poll })
}

async function vote(poll: Poll, index: number) {
    if (poll.closed) return
    poll.votes[me()] = index
    poll.names[me()] = room.value?.localParticipant.name ?? ''
    await send({ type: 'vote', id: poll.id, option: index })
}

async function closePoll(poll: Poll) {
    poll.closed = true
    await send({ type: 'poll_close', id: poll.id })
}

function removePoll(poll: Poll) {
    state.polls = state.polls.filter((p) => p.id !== poll.id)
}

function onPollMessage(message: any, participant: RemoteParticipant) {
    if (message?.type === 'poll' && message.poll?.id) addPoll(message.poll, participant.identity)
    if (message?.type === 'poll_state' && Array.isArray(message.polls)) {
        message.polls.forEach((poll: any) => addPoll(poll, participant.identity))
    }
    const poll = state.polls.find((p) => p.id === message?.id)
    if (!poll) return
    if (message.type === 'vote' && !poll.closed && Number.isInteger(message.option)
        && message.option >= 0 && message.option < poll.options.length) {
        poll.votes[participant.identity] = message.option
        poll.names[participant.identity] = participant.name || participant.identity
    }
    // Only the poll's creator can close it.
    if (message.type === 'poll_close' && poll.by === participant.identity) poll.closed = true
}

function addPoll(incoming: any, from: string) {
    if (typeof incoming?.question !== 'string' || !Array.isArray(incoming?.options)) return
    const existing = state.polls.find((p) => p.id === incoming.id)
    const poll: Poll = {
        id: String(incoming.id),
        question: incoming.question.slice(0, 200),
        options: incoming.options.slice(0, 6).map((o: any) => String(o).slice(0, 80)),
        anonymous: !!incoming.anonymous,
        closed: !!incoming.closed,
        // The sender is the creator: a poll cannot be passed off as someone else's.
        by: from,
        votes: { ...(incoming.votes ?? {}), ...(existing?.votes ?? {}) },
        names: { ...(incoming.names ?? {}), ...(existing?.names ?? {}) },
    }
    if (existing) Object.assign(existing, poll)
    else state.polls.unshift(poll)
}

const isMine = (poll: Poll) => poll.by === me()
const count = (poll: Poll, index: number) => Object.values(poll.votes).filter((v) => v === index).length

function voters(poll: Poll, index: number) {
    return Object.entries(poll.votes).filter(([, v]) => v === index).map(([identity]) => poll.names[identity] || '')
}

function pollResultText(poll: Poll) {
    const lines = poll.options.map((option, index) => {
        const names = poll.anonymous ? '' : voters(poll, index).filter(Boolean).join(', ')
        return `- ${option}: ${count(poll, index)}${names ? ` (${names})` : ''}`
    })
    return `${t('meetings.polls.resultTitle', { question: poll.question })}\n${lines.join('\n')}`
}

/**
 * Asks everyone in the room for consent to record. Called by the host's
 * controls when the API says some have not consented yet.
 */
async function requestConsent() {
    state.notice = t('meetings.room.consentRequested')
    await send({ type: 'consent_request' })
}

async function answerConsent(yes: boolean) {
    state.consentRequestFrom = ''
    if (yes) {
        try {
            await props.giveConsent()
        } catch (error: any) {
            state.notice = error?.message ?? ''
            return
        }
    }
    await send({ type: 'consent_answer', yes })
}

async function toggleMicrophone() {
    state.microphoneOn = !state.microphoneOn
    await room.value?.localParticipant.setMicrophoneEnabled(state.microphoneOn)
    refresh()
}

async function toggleCamera() {
    state.cameraOn = !state.cameraOn
    await room.value?.localParticipant.setCameraEnabled(state.cameraOn)
    if (state.cameraOn && state.blur) await applyBlur(cameraTrack())
    refresh()
}

const screenShareAllowed = computed(() => state.screenAllowed ?? !!props.canShareScreen)

function readScreenPermission() {
    const permissions = room.value?.localParticipant.permissions
    if (!permissions) return
    const sources = permissions.canPublishSources ?? []
    // An empty list means every source is allowed.
    state.screenAllowed = sources.length === 0 || sources.includes(TRACK_SOURCE_SCREEN_SHARE)
}

async function toggleScreenShare() {
    try {
        await room.value?.localParticipant.setScreenShareEnabled(!state.screenSharing)
        state.screenSharing = !state.screenSharing
    } catch {
        // Cancelled the browser's "choose what to share" dialog.
        state.screenSharing = false
    }
    refresh()
}

async function enableAudio() {
    await room.value?.startAudio()
    state.audioBlocked = !room.value?.canPlaybackAudio
}

async function leave() {
    await room.value?.disconnect()
    state.phase = 'left'
    emit('left')
}

async function backToPrejoin() {
    state.phase = 'prejoin'
    state.joinError = ''
    await startPreview()
}

function isInterpreter(participant: Participant) {
    try {
        return !!JSON.parse(participant.metadata || '{}')?.interpreter
    } catch {
        return false
    }
}

/**
 * Sends a file the page picked (e.g. from the citizen's documents) to the
 * others in the call, the same way as one chosen from the computer.
 */
async function shareFile(file: File) {
    if (!room.value) return
    state.chatOpen = true
    state.unread = 0
    state.fileError = ''
    if (file.size > MAX_FILE_BYTES) {
        state.fileError = t('meetings.room.fileTooLarge')
        return
    }
    const url = URL.createObjectURL(file)
    fileUrls.push(url)
    const message = pushFileMessage(room.value.localParticipant.name ?? '', { name: file.name, size: file.size, url, sending: true }, true)
    try {
        await room.value.localParticipant.sendFile(file, { topic: FILE_TOPIC })
    } catch {
        state.fileError = t('meetings.room.fileNotSent')
    }
    message.file!.sending = false
}

defineExpose({ requestConsent, leave, shareFile })
</script>
