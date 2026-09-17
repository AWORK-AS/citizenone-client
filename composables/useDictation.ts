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
    const error = ref<string | null>(null)

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

        try {
            activeStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        } catch {
            // Refused, or no microphone. Either way the caller shows one line;
            // there is nothing to retry automatically.
            error.value = 'permission'

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
        } catch {
            error.value = 'failed'
        }
        isTranscribing.value = false
    }

    // Leaving the page mid-recording must not leave the microphone open.
    onScopeDispose(() => {
        stop()
        releaseMicrophone()
    })

    return { isRecording, isTranscribing, error, toggle, stop }
}
