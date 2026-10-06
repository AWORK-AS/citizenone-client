import { aIAssistantService } from '@/components/api/user/AIAssistantService'

/**
 * Speak instead of type: record, send the audio for transcription, hand back
 * the text.
 *
 * Lifted out of the journal note form, which had the only copy. Cody's composer
 * needs the same three states and the same cleanup, and two copies of
 * MediaRecorder handling is the kind of thing that drifts until one of them
 * forgets to release the microphone.
 *
 * What happens with the transcript is the caller's business and differs: the
 * journal runs it through an AI pass that structures it into a note, while the
 * assistant just puts the words in the field where the user can edit them
 * before sending. So this returns text and decides nothing.
 *
 * The track is always stopped. A page that keeps the microphone open after
 * recording leaves the browser's recording indicator on, which in a care
 * setting is a room full of people who reasonably assume they are being taped.
 */
export function useDictation(onTranscript: (text: string) => void) {
    const isRecording = ref(false)
    const isTranscribing = ref(false)
    // Named rather than boolean: "no microphone" and "you said no" are fixed
    // in different places, and a single message for both is a dead end.
    const error = ref<'insecure' | 'denied' | 'missing' | 'failed' | 'limit' | 'budget' | null>(null)

    let recorder: MediaRecorder | null = null
    let chunks: Blob[] = []
    let activeStream: MediaStream | null = null

    async function toggle() {
        if (isRecording.value) {
            stop()

            return
        }

        await start()
    }

    async function start() {
        error.value = null

        // Browsers refuse the microphone outside a secure context, and the
        // refusal looks exactly like the user saying no - which sends people
        // hunting through their own settings for something they cannot fix.
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            error.value = window?.isSecureContext === false ? 'insecure' : 'missing'

            return
        }

        try {
            activeStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        } catch (problem: any) {
            // The three that mean different things to whoever is standing
            // there: they said no, there is no microphone, or the page was
            // never allowed to ask.
            error.value = problem?.name === 'NotAllowedError' || problem?.name === 'SecurityError'
                ? 'denied'
                : (problem?.name === 'NotFoundError' || problem?.name === 'OverconstrainedError'
                    ? 'missing'
                    : 'failed')

            return
        }

        chunks = []
        recorder = new MediaRecorder(activeStream)

        recorder.ondataavailable = (event: BlobEvent) => {
            if (event.data?.size) chunks.push(event.data)
        }

        recorder.onstop = async () => {
            releaseMicrophone()
            await transcribe()
        }

        recorder.start()
        isRecording.value = true
    }

    function stop() {
        if (recorder && recorder.state !== 'inactive') recorder.stop()
        isRecording.value = false
    }

    function releaseMicrophone() {
        activeStream?.getTracks().forEach((track) => track.stop())
        activeStream = null
    }

    async function transcribe() {
        if (!chunks.length) return

        isTranscribing.value = true
        try {
            const formData = new FormData()
            formData.append('audio', new Blob(chunks, { type: 'audio/webm' }), 'dictation.webm')

            const response = await aIAssistantService.transcribeAudio(formData)
            const transcript = (response?.data?.text ?? '').trim()

            if (transcript) onTranscript(transcript)
        } catch (problem: any) {
            // A limit is not a failure: "try again" would not help, and the
            // person needs to know the day's dictation or the balance ran out.
            error.value = problem?.status === 402 ? 'budget'
                : problem?.status === 429 ? 'limit'
                    : 'failed'
        }
        isTranscribing.value = false
    }

    // Leaving the page mid-recording must not leave the microphone open.
    onScopeDispose(() => {
        stop()
        releaseMicrophone()
    })

    /**
     * Whether the browser can record at all, so a button that cannot work is
     * not offered. Undefined on the server, where there is no navigator.
     */
    const isSupported = computed(() => typeof navigator !== 'undefined'
        && Boolean(navigator.mediaDevices?.getUserMedia))

    return { isRecording, isTranscribing, error, isSupported, toggle, stop }
}
