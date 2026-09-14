import Pusher from 'pusher-js'

const config = useRuntimeConfig()
const scheme = config.public.reverbScheme || 'http'

const pusher = new Pusher(config.public.reverbAppKey as string, {
    cluster: '', // unused: wsHost/wsPort below override the connection target (required by pusher-js regardless)
    wsHost: config.public.reverbHost as string,
    wsPort: Number(config.public.reverbPort) || 8080,
    wssPort: Number(config.public.reverbPort) || 8080,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
})

export default pusher
