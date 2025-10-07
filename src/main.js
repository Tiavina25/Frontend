import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'ton_app_key',
    cluster: 'mt1',
    forceTLS: true
});

createApp(App)
  .use(router)
  .mount('#app');
