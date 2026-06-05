import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import VueI18nVitePlugin from '@intlify/unplugin-vue-i18n/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: process.env.CHECKOUT_SCRIPT_URL,
          type: 'text/javascript',
          async: true,
          defer: true,
        },
        // Google Tag Manager
        {
          innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-THK4R7KD');`,
          tagPosition: 'head',
        },
      ],
      // Google Tag Manager (noscript) — placed immediately after <body>
      noscript: [
        {
          innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-THK4R7KD" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          tagPosition: 'bodyOpen',
        },
      ],
    }
  },

  build: {
    filenames: {
      app: '[name].[contenthash].js',
      chunk: '[name].[contenthash].js',
      css: '[name].[contenthash].css'
    }
  },

  css: [
    '~/assets/css/main.css',
    '~/assets/css/superadmin.css',
  ],
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxt/icon',
    'vue3-carousel-nuxt',
    'nuxt-echarts',
  ],

  piniaPersistedstate: {
    storage: 'localStorage',
  },

  echarts: {
    renderer: ['canvas'],
    charts: ['LineChart'],
    components: [
      'DatasetComponent',
      'GridComponent',
      'TooltipComponent',
      'TitleComponent',
      'LegendComponent',
      'DataZoomComponent',
      'MarkLineComponent',
    ],
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
      azureClientId: process.env.AZURE_CLIENT_ID,
      azureRedirectUri: process.env.AZURE_REDIRECT_URI,
      azureScopes: process.env.AZURE_SCOPES,
      azureTenantId: process.env.AZURE_TENANT_ID,
      checkoutKey: process.env.CHECKOUT_KEY,
      cmp: process.env.CMP_API_SRC,
      // OneDrive miljøvariabler
      VITE_ONEDRIVE_CLIENT_ID: process.env.VITE_ONEDRIVE_CLIENT_ID,
      VITE_ONEDRIVE_REDIRECT_URI: process.env.VITE_ONEDRIVE_REDIRECT_URI,
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