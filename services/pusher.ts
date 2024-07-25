import Pusher from 'pusher-js'

const pusherAppKey = '8257a5564e11f06c087c'
const pusher = new Pusher(pusherAppKey, {
    cluster: 'eu'
})

export default pusher