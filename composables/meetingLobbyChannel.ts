import Pusher from 'pusher-js'

/**
 * Live lobby for an online meeting: the host hears the moment a guest asks
 * to come in (private channel `meeting.{uuid}`, event `meeting.lobby`),
 * instead of waiting for the next poll.
 *
 * A separate Pusher connection from services/pusher.ts, because this channel
 * is private and needs the staff member's bearer token for
 * /user/meetings/broadcasting/auth. Without Reverb configured (no app key)
 * nothing connects and the page keeps polling, just less often.
 */
export function useMeetingLobbyChannel(meetingUuid: string, onChange: (event: { participant_uuid: string, name: string, waiting: boolean }) => void) {
    const config = useRuntimeConfig()
    const connected = ref(false)
    let client: Pusher | null = null

    function start() {
        const key = config.public.reverbAppKey as string
        const token = localStorage.getItem('_token')
        if (!key || !token || client) return

        const scheme = config.public.reverbScheme || 'http'
        client = new Pusher(key, {
            cluster: '',
            wsHost: config.public.reverbHost as string,
            wsPort: Number(config.public.reverbPort) || 8080,
            wssPort: Number(config.public.reverbPort) || 8080,
            forceTLS: scheme === 'https',
            enabledTransports: ['ws', 'wss'],
            channelAuthorization: {
                endpoint: `${config.public.apiBaseURL}/user/meetings/broadcasting/auth`,
                transport: 'ajax',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            },
        })

        const channel = client.subscribe(`private-meeting.${meetingUuid}`)
        channel.bind('pusher:subscription_succeeded', () => { connected.value = true })
        channel.bind('pusher:subscription_error', () => { connected.value = false })
        channel.bind('meeting.lobby', onChange)
    }

    function stop() {
        client?.unsubscribe(`private-meeting.${meetingUuid}`)
        client?.disconnect()
        client = null
        connected.value = false
    }

    return { start, stop, connected }
}
