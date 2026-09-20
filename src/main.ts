import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { loadPracticeState } from './services/practice'

document.documentElement.dataset.theme = loadPracticeState().preferences.darkMode ? 'dark' : 'light'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
