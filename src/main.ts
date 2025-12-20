/**
 * main.ts
 *
 * Application entry point
 */

import { createApp } from 'vue'

import { registerPlugins } from '@/app/index'
import App from './App.vue'

import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
