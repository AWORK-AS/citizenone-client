import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import VueI18nVitePlugin from '@intlify/unplugin-vue-i18n/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-icon',
  ],
  plugins: [
    '@/plugins/vue-notification.js'
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      appName: process.env.APP_NAME,
      apiBaseURL: process.env.API_BASE_URL,
    },
  },
  ssr: false,
  sourcemap: false,
  vite: {
    plugins: [
      VueI18nVitePlugin({
        include: [resolve(dirname(fileURLToPath(import.meta.url)), './lang/*.json')],
      }),
    ],
  },
})
