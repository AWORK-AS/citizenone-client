<template>
    <div class="space-y-4">
        <!-- Before joining: see yourself, pick camera and microphone. -->
        <div v-if="state.phase === 'prejoin'" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div class="lg:col-span-2 relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video ref="previewEl" autoplay muted playsinline class="w-full h-full object-cover -scale-x-100"
                    v-show="state.cameraOn && state.hasPreview" />
                <div v-if="!state.cameraOn || !state.hasPreview"
                    class="absolute inset-0 flex items-center justify-center text-gray-300">
                    <Icon name="ph:video-camera-slash" class="h-12 w-12" />
                </div>
            </div>
            <div class="space-y-4">
                <div>
                    <p class="text-lg font-semibold">{{ session.title }}</p>
                    <p class="text-sm text-gray-500">{{ formattedStart }}</p>
                    <p class="text-sm text-gray-500" v-if="counterpartName">
                        {{ $t('videoConsultation.with', { name: counterpartName }) }}
                    </p>
                </div>
                <div class="space-y-1">
                    <FormLabel for="camera" :label="$t('videoConsultation.camera')" />
                    <select id="camera" v-model="state.cameraId" @change="startPreview"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option v-for="d in state.cameras" :key="d.deviceId" :value="d.deviceId">
                            {{ d.label || $t('videoConsultation.camera') }}
                        </option>
                    </select>
                </div>
                <div class="space-y-1">
                    <FormLabel for="microphone" :label="$t('videoConsultation.microphone')" />
                    <select id="microphone" v-model="state.microphoneId" @change="startPreview"
                        class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option v-for="d in state.microphones" :key="d.deviceId" :value="d.deviceId">
                            {{ d.label || $t('videoConsultation.microphone') }}
                        </option>
                    </select>
                </div>
                <div class="flex gap-2">
                    <button type="button" class="flex-1 flex items-center justify-center gap-2 border rounded-md py-2 text-sm"
                        :class="state.cameraOn ? 'border-gray-300' : 'border-red-300 bg-red-50 text-red-700'"
                        @click="state.cameraOn = !state.cameraOn">
                        <Icon :name="state.cameraOn ? 'ph:video-camera' : 'ph:video-camera-slash'" class="h-5 w-5" />
                        {{ state.cameraOn ? $t('videoConsultation.cameraOn') : $t('videoConsultation.cameraOff') }}
                    </button>
                    <button type="button" class="flex-1 flex items-center justify-center gap-2 border rounded-md py-2 text-sm"
                        :class="state.microphoneOn ? 'border-gray-300' : 'border-red-300 bg-red-50 text-red-700'"
                        @click="state.microphoneOn = !state.microphoneOn">
                        <Icon :name="state.microphoneOn ? 'ph:microphone' : 'ph:microphone-slash'" class="h-5 w-5" />
                        {{ state.microphoneOn ? $t('videoConsultation.microphoneOn') : $t('videoConsultation.microphoneOff') }}
                    </button>
                </div>
                <Alert type="danger" :text="state.deviceError" v-if="state.deviceError" />
                <FormButton type="button" buttonStyle="primary" class="w-full" :disabled="state.isJoining" @click="join">
                    {{ $t('videoConsultation.join') }}
                </FormButton>
                <p class="text-xs text-gray-500">{{ $t('videoConsultation.privacyNote') }}</p>
            </div>
        </div>

        <!-- In the call. -->
        <div v-else-if="state.phase === 'connected' || state.phase === 'connecting'" class="space-y-3">
            <div class="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video ref="remoteEl" autoplay playsinline class="w-full h-full object-contain"
                    v-show="state.remote.hasVideo" />
                <div v-if="!state.remote.hasVideo"
                    class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-200 text-center px-6">
                    <template v-if="state.phase === 'connecting'">
                        <Icon name="ph:spinner" class="h-10 w-10 animate-spin" />
                        <p>{{ $t('videoConsultation.connecting') }}</p>
                    </template>
                    <template v-else-if="!state.remote.present">
                        <Icon name="ph:hourglass-medium" class="h-10 w-10" />
                        <p>{{ waitingText }}</p>
                    </template>
                    <template v-else>
                        <div class="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-semibold">
                            {{ initials(state.remote.name) }}
                        </div>
                        <p>{{ state.remote.name }}</p>
                    </template>
                </div>
                <div v-if="state.remote.present" class="absolute left-3 bottom-3 flex items-center gap-1.5 bg-black/60 text-white text-sm rounded px-2 py-1">
                    <Icon v-if="state.remote.microphoneMuted" name="ph:microphone-slash" class="h-4 w-4 text-red-400" />
                    {{ state.remote.name }}
                </div>

                <!-- yourself, small -->
                <div class="absolute right-3 bottom-3 w-32 sm:w-48 aspect-video bg-gray-800 rounded-md overflow-hidden ring-2 ring-white/30">
                    <video ref="localEl" autoplay muted playsinline class="w-full h-full object-cover -scale-x-100"
                        v-show="state.cameraOn" />
                    <div v-if="!state.cameraOn" class="absolute inset-0 flex items-center justify-center text-gray-400">
                        <Icon name="ph:video-camera-slash" class="h-6 w-6" />
                    </div>
                </div>
            </div>

            <div ref="audioContainer" class="hidden" />

            <Alert type="warning" :text="$t('videoConsultation.reconnecting')" v-if="state.reconnecting" />
            <div v-if="state.audioBlocked" class="flex justify-center">
                <FormButton type="button" buttonStyle="primary" @click="enableAudio">
                    {{ $t('videoConsultation.enableSound') }}
                </FormButton>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-3">
                <button type="button" class="h-12 w-12 rounded-full flex items-center justify-center"
                    :class="state.microphoneOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-600 text-white'"
                    :title="state.microphoneOn ? $t('videoConsultation.muteMicrophone') : $t('videoConsultation.unmuteMicrophone')"
                    @click="toggleMicrophone">
                    <Icon :name="state.microphoneOn ? 'ph:microphone' : 'ph:microphone-slash'" class="h-6 w-6" />
                </button>
                <button type="button" class="h-12 w-12 rounded-full flex items-center justify-center"
                    :class="state.cameraOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-600 text-white'"
                    :title="state.cameraOn ? $t('videoConsultation.turnCameraOff') : $t('videoConsultation.turnCameraOn')"
                    @click="toggleCamera">
                    <Icon :name="state.cameraOn ? 'ph:video-camera' : 'ph:video-camera-slash'" class="h-6 w-6" />
                </button>
                <button v-if="session.role === 'clinician'" type="button"
                    class="h-12 w-12 rounded-full flex items-center justify-center"
                    :class="state.screenSharing ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'"
                    :title="state.screenSharing ? $t('videoConsultation.stopSharing') : $t('videoConsultation.shareScreen')"
                    @click="toggleScreenShare">
                    <Icon name="ph:monitor-arrow-up" class="h-6 w-6" />
                </button>
                <button type="button" class="h-12 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    @click="leave">
                    <Icon name="ph:phone-disconnect" class="h-6 w-6" />
                    {{ $t('videoConsultation.leave') }}
                </button>
                <button v-if="session.role === 'clinician'" type="button"
                    class="h-12 px-4 rounded-full border border-red-300 text-red-700 hover:bg-red-50 text-sm"
                    @click="endForEveryone">
                    {{ $t('videoConsultation.endForEveryone') }}
                </button>
            </div>
        </div>

        <!-- After the call. -->
        <div v-else class="py-12 flex flex-col items-center gap-3 text-center">
            <Icon :name="state.phase === 'error' ? 'ph:warning-circle' : 'ph:check-circle'" class="h-12 w-12"
                :class="state.phase === 'error' ? 'text-red-500' : 'text-primary'" />
            <p class="text-lg font-semibold">
                {{ state.phase === 'error' ? $t('videoConsultation.couldNotConnect') : $t('videoConsultation.ended') }}
            </p>
            <p class="text-sm text-gray-500" v-if="state.phase === 'error'">{{ state.errorMessage }}</p>
            <FormButton type="button" buttonStyle="primary" @click="emit('rejoin')">
                {{ $t('videoConsultation.rejoin') }}
            </FormButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
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
    type RemoteTrack,
} from 'livekit-client'

/**
 * One video consultation between a clinician and a patient, used by both the
 * staff page and the patient portal. The page asks the API for a join token;
 * this component does the rest: a camera/microphone check before joining,
 * then the call itself (the other person large, yourself small).
 *
 * `session` is the join endpoint's answer: livekit_url, token, role
 * ('clinician' | 'patient'), title, date_time_start, clinician_name,
 * patient_name.
 */
const props = defineProps({
    session: { type: Object as any, required: true },
})
const emit = defineEmits(['rejoin', 'end'])
const { t } = useI18n()

const previewEl = ref<HTMLVideoElement>()
const remoteEl = ref<HTMLVideoElement>()
const localEl = ref<HTMLVideoElement>()
const audioContainer = ref<HTMLDivElement>()

const room = shallowRef<Room | null>(null)
let previewTracks: LocalTrack[] = []

const state = reactive({
    phase: 'prejoin' as 'prejoin' | 'connecting' | 'connected' | 'left' | 'error',
    cameras: [] as MediaDeviceInfo[],
    microphones: [] as MediaDeviceInfo[],
    cameraId: '',
    microphoneId: '',
    cameraOn: true,
    microphoneOn: true,
    hasPreview: false,
    deviceError: '',
    isJoining: false,
    screenSharing: false,
    reconnecting: false,
    audioBlocked: false,
    errorMessage: '',
    remote: { present: false, name: '', hasVideo: false, microphoneMuted: false },
})

const counterpartName = computed(() =>
    props.session.role === 'clinician' ? props.session.patient_name : props.session.clinician_name)

const waitingText = computed(() => props.session.role === 'clinician'
    ? t('videoConsultation.waitingForPatient')
    : t('videoConsultation.waitingForClinician', { name: props.session.clinician_name || t('videoConsultation.yourClinician') }))

const formattedStart = computed(() => props.session.date_time_start
    ? moment(props.session.date_time_start).format('DD-MM-YYYY HH:mm')
    : '')

onMounted(async () => {
    await loadDevices()
    await startPreview()
})

onBeforeUnmount(() => {
    stopPreview()
    room.value?.disconnect()
})

watch(() => state.cameraOn, () => {
    if (state.phase === 'prejoin') startPreview()
})

async function loadDevices() {
    try {
        state.cameras = await Room.getLocalDevices('videoinput', true)
        state.microphones = await Room.getLocalDevices('audioinput', true)
        state.cameraId ||= state.cameras[0]?.deviceId ?? ''
        state.microphoneId ||= state.microphones[0]?.deviceId ?? ''
    } catch {
        state.deviceError = t('videoConsultation.permissionDenied')
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
            ? t('videoConsultation.permissionDenied')
            : t('videoConsultation.deviceUnavailable')
    }
}

function stopPreview() {
    previewTracks.forEach((track) => track.stop())
    previewTracks = []
    state.hasPreview = false
}

async function join() {
    state.isJoining = true
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
        await r.connect(props.session.livekit_url, props.session.token)
        state.phase = 'connected'
        await r.localParticipant.setMicrophoneEnabled(state.microphoneOn)
        await r.localParticipant.setCameraEnabled(state.cameraOn)
        attachLocalVideo()
        r.remoteParticipants.forEach((participant) => showRemote(participant))
        state.audioBlocked = !r.canPlaybackAudio
    } catch (error: any) {
        state.phase = 'error'
        state.errorMessage = error?.message ?? ''
    }
    state.isJoining = false
}

function bindRoomEvents(r: Room) {
    r.on(RoomEvent.ParticipantConnected, (participant) => showRemote(participant))
        .on(RoomEvent.ParticipantDisconnected, (participant) => {
            if (participant.identity === currentRemoteIdentity) clearRemote()
        })
        .on(RoomEvent.TrackSubscribed, (track, _publication, participant) => attachRemoteTrack(track, participant))
        .on(RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
            track.detach()
            if (track.kind === Track.Kind.Video && participant.identity === currentRemoteIdentity) {
                state.remote.hasVideo = false
                refreshRemoteVideo(participant)
            }
        })
        .on(RoomEvent.TrackMuted, (publication, participant) => updateMuteState(participant))
        .on(RoomEvent.TrackUnmuted, (publication, participant) => updateMuteState(participant))
        .on(RoomEvent.LocalTrackPublished, () => attachLocalVideo())
        .on(RoomEvent.LocalTrackUnpublished, (publication) => {
            if (publication.source === Track.Source.ScreenShare) state.screenSharing = false
        })
        .on(RoomEvent.AudioPlaybackStatusChanged, () => { state.audioBlocked = !r.canPlaybackAudio })
        .on(RoomEvent.ConnectionStateChanged, (connectionState) => {
            state.reconnecting = connectionState === ConnectionState.Reconnecting
        })
        .on(RoomEvent.Disconnected, () => {
            clearRemote()
            if (state.phase === 'connected' || state.phase === 'connecting') state.phase = 'left'
        })
}

let currentRemoteIdentity = ''

function roleOf(participant: Participant) {
    try {
        return JSON.parse(participant.metadata || '{}')?.role ?? ''
    } catch {
        return ''
    }
}

// The other side of the consultation: for the patient the clinician, for the
// clinician the patient. A second clinician (an invited colleague) does not
// replace the patient on screen.
function showRemote(participant: RemoteParticipant | Participant) {
    if (currentRemoteIdentity && currentRemoteIdentity !== participant.identity) return
    if (props.session.role === 'clinician' && roleOf(participant) === 'clinician') return
    currentRemoteIdentity = participant.identity
    state.remote.present = true
    state.remote.name = participant.name || participant.identity
    updateMuteState(participant)
    refreshRemoteVideo(participant)
}

function attachRemoteTrack(track: RemoteTrack, participant: RemoteParticipant) {
    if (track.kind === Track.Kind.Audio) {
        const element = track.attach()
        audioContainer.value?.appendChild(element)
        return
    }
    if (!currentRemoteIdentity) showRemote(participant)
    if (participant.identity === currentRemoteIdentity) refreshRemoteVideo(participant)
}

// Screen share wins over the camera, so the patient sees what is shown.
async function refreshRemoteVideo(participant: Participant) {
    const publication = participant.getTrackPublication(Track.Source.ScreenShare)?.track
        ? participant.getTrackPublication(Track.Source.ScreenShare)
        : participant.getTrackPublication(Track.Source.Camera)
    const track = publication?.track
    state.remote.hasVideo = !!track && !publication?.isMuted
    await nextTick()
    if (track && remoteEl.value) track.attach(remoteEl.value)
}

function updateMuteState(participant: Participant) {
    if (participant.identity !== currentRemoteIdentity) return
    state.remote.microphoneMuted = !participant.isMicrophoneEnabled
    refreshRemoteVideo(participant)
}

function clearRemote() {
    currentRemoteIdentity = ''
    state.remote = { present: false, name: '', hasVideo: false, microphoneMuted: false }
    // Somebody else (the patient rejoining from another device) may still be there.
    room.value?.remoteParticipants.forEach((participant) => showRemote(participant))
}

async function attachLocalVideo() {
    await nextTick()
    const track = room.value?.localParticipant.getTrackPublication(Track.Source.Camera)?.track as LocalVideoTrack | undefined
    if (track && localEl.value) track.attach(localEl.value)
}

async function toggleMicrophone() {
    state.microphoneOn = !state.microphoneOn
    await room.value?.localParticipant.setMicrophoneEnabled(state.microphoneOn)
}

async function toggleCamera() {
    state.cameraOn = !state.cameraOn
    await room.value?.localParticipant.setCameraEnabled(state.cameraOn)
    attachLocalVideo()
}

async function toggleScreenShare() {
    try {
        await room.value?.localParticipant.setScreenShareEnabled(!state.screenSharing)
        state.screenSharing = !state.screenSharing
    } catch {
        // The clinician cancelled the browser's "choose what to share" dialog.
        state.screenSharing = false
    }
}

async function enableAudio() {
    await room.value?.startAudio()
    state.audioBlocked = !room.value?.canPlaybackAudio
}

async function leave() {
    await room.value?.disconnect()
    state.phase = 'left'
}

async function endForEveryone() {
    emit('end')
    await leave()
}

function initials(name: string) {
    return (name || '?').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}
</script>
