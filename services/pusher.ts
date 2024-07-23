import Pusher from 'pusher-js'

const pusher = new Pusher('3a64571ebf28710480fe', {
    cluster: 'eu'
})

export default pusher