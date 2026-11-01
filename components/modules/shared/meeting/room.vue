<template>
    <div class="space-y-4">
        <!-- Before joining: see yourself, pick camera and microphone. -->
        <div v-if="state.phase === 'prejoin' || state.phase === 'waiting'" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div class="lg:col-span-2 relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video ref="previewEl" autoplay muted playsinline class="w-full h-full object-cover -scale-x-100"
                    v-show="state.cameraOn && state.hasPreview" />
                <div v-if="!state.cameraOn || !state.hasPreview"
                    class="absolute inset-0 flex items-center justify-center text-gray-300">
                    <Icon name="ph:video-camera-slash" class="h-12 w-12" />
                </div>
            </div>
            <div class="space-y-4">
                <slot name="info" />
                <div class="space-y-1">
                    <FormLabel for="meeting-camera" :label="$t('meetings.room.camera')" />
                    <select id="meeting-camera" v-model="state.cameraId" @change="startPreview"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option v-for="d in state.cameras" :key="d.deviceId" :value="d.deviceId">
                            {{ d.label || $t('meetings.room.camera') }}
                        </option>
                    </select>
                </div>
                <div class="space-y-1">
                    <FormLabel for="meeting-microphone" :label="$t('meetings.room.microphone')" />
                    <select id="meeting-microphone" v-model="state.microphoneId" @change="startPreview"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option v-for="d in state.microphones" :key="d.deviceId" :value="d.deviceId">
                            {{ d.label || $t('meetings.room.microphone') }}
                        </option>
                    </select>
                </div>
                <div class="flex gap-2">
                    <button type="button" class="flex-1 flex items-center justify-center gap-2 border rounded-md py-2 text-sm"
                        :class="state.cameraOn ? 'border-gray-300' : 'border-red-300 bg-red-50 text-red-700'"
                        @click="state.cameraOn = !state.cameraOn">
                        <Icon :name="state.cameraOn ? 'ph:video-camera' : 'ph:video-camera-slash'" class="h-5 w-5" />
                        {{ state.cameraOn ? $t('meetings.room.cameraOn') : $t('meetings.room.cameraOff') }}
                    </button>
                    <button type="button" class="flex-1 flex items-center justify-center gap-2 border rounded-md py-2 text-sm"
                        :class="state.microphoneOn ? 'border-gray-300' : 'border-red-300 bg-red-50 text-red-700'"
                        @click="state.microphoneOn = !state.microphoneOn">
                        <Icon :name="state.microphoneOn ? 'ph:microphone' : 'ph:microphone-slash'" class="h-5 w-5" />
                        {{ state.microphoneOn ? $t('meetings.room.microphoneOn') : $t('meetings.room.microphoneOff') }}
                    </button>
                </div>

                <!-- A meeting that is being recorded is only entered with consent. -->
                <label v-if="state.needsConsent" class="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 rounded-md p-3">
                    <input type="checkbox" v-model="state.consent" class="mt-0.5" />
                    <span>{{ $t('meetings.room.consentToEnter') }}</span>
                </label>

                <Alert type="danger" :text="state.deviceError" v-if="state.deviceError" />
                <Alert type="danger" :text="state.joinError" v-if="state.joinError" />

                <div v-if="state.phase === 'waiting'" class="flex items-center gap-2 text-sm text-gray-600">
                    <Icon name="ph:hourglass-medium" class="h-5 w-5 animate-pulse" />
                    {{ waitingText || $t('meetings.room.waitingToBeLetIn') }}
                </div>
                <FormButton v-else type="button" buttonStyle="primary" class="w-full"
                    :disabled="state.isJoining || (state.needsConsent && !state.consent)" @click="join">
                    {{ $t('meetings.room.join') }}
                </FormButton>
                <p class="text-xs text-gray-500">{{ $t('meetings.room.privacyNote') }}</p>
            </div>
        </div>

        <!-- In the meeting. -->
        <div v-else-if="state.phase === 'connected' || state.phase === 'connecting'" class="space-y-3">
            <div v-if="state.recording" class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-md px-3 py-2 text-sm">
                <span class="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
                {{ $t('meetings.room.recordingNow') }}
            </div>

            <div v-if="state.phase === 'connecting'" class="aspect-video bg-gray-900 rounded-lg flex flex-col items-center justify-center gap-3 text-gray-200">
                <Icon name="ph:spinner" class="h-10 w-10 animate-spin" />
                <p>{{ $t('meetings.room.connecting') }}</p>
            </div>

            <template v-else>
                <!-- A shared screen is shown large, everyone else beside it. -->
                <div v-if="screenTile" class="grid grid-cols-1 xl:grid-cols-4 gap-3">
                    <MeetingTile class="xl:col-span-3" :key="screenTile.key" :track="screenTile.track" :label="screenTile.label"
                        :is-local="screenTile.isLocal" is-screen />
                    <div class="grid grid-cols-2 xl:grid-cols-1 gap-3 content-start">
                        <MeetingTile v-for="tile in cameraTiles" :key="tile.key" :track="tile.track" :label="tile.label"
                            :is-local="tile.isLocal" :microphone-muted="tile.microphoneMuted" :speaking="tile.speaking" />
                    </div>
                </div>
                <div v-else class="grid gap-3" :class="gridClass">
                    <MeetingTile v-for="tile in cameraTiles" :key="tile.key" :track="tile.track" :label="tile.label"
                        :is-local="tile.isLocal" :microphone-muted="tile.microphoneMuted" :speaking="tile.speaking" />
                </div>
                <p v-if="cameraTiles.length === 1" class="text-center text-sm text-gray-500">
                    {{ $t('meetings.room.aloneInMeeting') }}
                </p>
            </template>

            <div ref="audioContainer" class="hidden" />

            <Alert type="warning" :text="$t('meetings.room.reconnecting')" v-if="state.reconnecting" />
            <div v-if="state.audioBlocked" class="flex justify-center">
                <FormButton type="button" buttonStyle="primary" @click="enableAudio">
                    {{ $t('meetings.room.enableSound') }}
                </FormButton>
            </div>

            <!-- Somebody asked to record: everyone else answers here. -->
            <div v-if="state.consentRequestFrom" class="border border-amber-300 bg-amber-50 rounded-md p-4 space-y-3">
                <p class="text-sm">{{ $t('meetings.room.consentQuestion', { name: state.consentRequestFrom }) }}</p>
                <div class="flex gap-2">
                    <FormButton type="button" buttonStyle="primary" @click="answerConsent(true)">
                        {{ $t('meetings.room.consentYes') }}
                    </FormButton>
                    <FormButton type="button" buttonStyle="secondary" @click="answerConsent(false)">
                        {{ $t('meetings.room.consentNo') }}
                    </FormButton>
                </div>
            </div>

            <div v-if="state.notice" class="text-center text-sm text-gray-600">{{ state.notice }}</div>

            <div class="flex flex-wrap items-center justify-center gap-3">
                <button type="button" class="h-12 w-12 rounded-full flex items-center justify-center"
                    :class="state.microphoneOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-600 text-white'"
                    :title="state.microphoneOn ? $t('meetings.room.muteMicrophone') : $t('meetings.room.unmuteMicrophone')"
                    @click="toggleMicrophone">
                    <Icon :name="state.microphoneOn ? 'ph:microphone' : 'ph:microphone-slash'" class="h-6 w-6" />
                </button>
                <button type="button" class="h-12 w-12 rounded-full flex items-center justify-center"
                    :class="state.cameraOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-600 text-white'"
                    :title="state.cameraOn ? $t('meetings.room.turnCameraOff') : $t('meetings.room.turnCameraOn')"
                    @click="toggleCamera">
                    <Icon :name="state.cameraOn ? 'ph:video-camera' : 'ph:video-camera-slash'" class="h-6 w-6" />
                </button>
                <button v-if="canShareScreen" type="button"
                    class="h-12 w-12 rounded-full flex items-center justify-center"
                    :class="state.screenSharing ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'"
                    :title="state.screenSharing ? $t('meetings.room.stopSharing') : $t('meetings.room.shareScreen')"
                    @click="toggleScreenShare">
                    <Icon name="ph:monitor-arrow-up" class="h-6 w-6" />
                </button>
                <slot name="controls" :recording="state.recording" />
                <button type="button" class="h-12 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    @click="leave">
                    <Icon name="ph:phone-disconnect" class="h-6 w-6" />
                    {{ $t('meetings.room.leave') }}
                </button>
            </div>
        </div>

        <!-- After the meeting. -->
        <div v-else class="py-12 flex flex-col items-center gap-3 text-center">
            <Icon :name="state.phase === 'error' ? 'ph:warning-circle' : 'ph:check-circle'" class="h-12 w-12"
                :class="state.phase === 'error' ? 'text-red-500' : 'text-primary'" />
            <p class="text-lg font-semibold">
                {{ state.phase === 'error' ? $t('meetings.room.couldNotConnect') : $t('meetings.room.left') }}
            </p>
            <p class="text-sm text-gray-500" v-if="state.phase === 'error'">{{ state.errorMessage }}</p>
            <FormButton type="button" buttonStyle="primary" @click="backToPrejoin">
                {{ $t('meetings.room.rejoin') }}
            </FormButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
    ConnectionState,
    createLocalTracks,
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

const props = defineProps<{
    connect: (consent: boolean) => Promise<Connection>
    giveConsent: () => Promise<void>
    canShareScreen?: boolean
    waitingText?: string
    isWaiting?: boolean
}>()
const emit = defineEmits(['joined', 'left', 'consent-answer'])
const { t } = useI18n()

const previewEl = ref<HTMLVideoElement>()
const audioContainer = ref<HTMLDivElement>()
const room = shallowRef<Room | null>(null)
let previewTracks: LocalTrack[] = []

const state = reactive({
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
    // Bumped on every room event; the tiles are recomputed from the room.
    version: 0,
})

watch(() => props.isWaiting, (waiting) => {
    if (waiting && state.phase === 'prejoin') state.phase = 'waiting'
})

type Tile = { key: string, track: any, label: string, isLocal: boolean, microphoneMuted: boolean, speaking: boolean }

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
        label: participant === r?.localParticipant
            ? t('meetings.room.you', { name: participant.name || '' })
            : (participant.name || participant.identity),
        isLocal: participant === r?.localParticipant,
        microphoneMuted: !participant.isMicrophoneEnabled,
        speaking: participant.isSpeaking,
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
})

onBeforeUnmount(() => {
    stopPreview()
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

    try {
        await r.connect(connection.ws_url, connection.token)
        state.phase = 'connected'
        await r.localParticipant.setMicrophoneEnabled(state.microphoneOn)
        await r.localParticipant.setCameraEnabled(state.cameraOn)
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

function refresh() {
    state.version++
}

function bindRoomEvents(r: Room) {
    r.on(RoomEvent.ParticipantConnected, refresh)
        .on(RoomEvent.ParticipantDisconnected, refresh)
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
        .on(RoomEvent.Disconnected, () => {
            if (state.phase === 'connected' || state.phase === 'connecting') {
                state.phase = 'left'
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
}

async function send(message: object) {
    await room.value?.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(message)), { reliable: true })
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
    refresh()
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

defineExpose({ requestConsent, leave })
</script>
