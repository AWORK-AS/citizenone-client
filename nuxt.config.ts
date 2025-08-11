import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import VueI18nVitePlugin from '@intlify/unplugin-vue-i18n/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: process.env.CHECKOUT_SCRIPT_URL, // URL of the external script
          type: 'text/javascript',
          async: true, // Optional: Use async or defer if needed
          defer: true  // Optional: Use async or defer if needed
        },
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=AW-16858750370',
          async: true
        },
        {
          type: 'text/javascript',
          children: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16858750370');
          `
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxt/icon',
    'vue3-carousel-nuxt',
    "nuxt-echarts"
  ],

  echarts: {
    charts: ['BarChart'],
    components: ['DatasetComponent', 'GridComponent', 'TooltipComponent'],
  },

  plugins: [
    '@/plugins/vue-notification.ts',
    '@/plugins/ckeditor.ts',
    { src: '~/plugins/zoho-salesiq.client.ts', mode: 'client' }
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
      appBaseURL: process.env.APP_BASE_URL,
      azureTenantId: process.env.AZURE_TENANT_ID,
      checkoutKey: process.env.CHECKOUT_KEY,
      cmp: process.env.CMP_API_SRC,
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

  compatibilityDate: '2024-07-10',
})