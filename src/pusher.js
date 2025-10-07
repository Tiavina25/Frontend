import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const echo = new Echo({
    broadcaster: 'pusher',
    key: '923431f581214865abef', // Remplace par ta clé Pusher
    cluster: 'mt1',
    forceTLS: true
})

export default echo
