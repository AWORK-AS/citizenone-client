import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import VueI18nVitePlugin from '@intlify/unplugin-vue-i18n/vite'

// Audit C-07: baseline security response headers applied to every route.
// These are safe to enforce (no known breakage). The CSP is shipped as
// Report-Only for now because several allowed hosts are env-driven (checkout
// script, API/Azure/OneDrive endpoints) and must be validated in staging before
// flipping to an enforcing `Content-Security-Policy`.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  // The last three carry release-note videos, which are linked rather than
  // uploaded; without them the embed breaks the day this policy is enforced.
  "frame-src 'self' https://www.googletagmanager.com https://login.microsoftonline.com https://www.youtube.com https://player.vimeo.com https://www.loom.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy-Report-Only': contentSecurityPolicy,
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      // Overridden per locale in app.vue; this is what the document says before
      // i18n is ready.
      htmlAttrs: { lang: 'da' },
      link: [
        // Crisp SVG favicon (the CitizenOne circle mark); .ico kept as fallback.
        { rel: 'icon', type: 'image/svg+xml', href: '/icon-citizenone.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/icon-citizenone.svg' },
        { rel: 'mask-icon', href: '/icon-citizenone.svg', color: '#00607a' },
      ],
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
    // Ships with the ckeditor5 package; the old prebuilt bundle inlined it.
    'ckeditor5/ckeditor5.css',
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
    charts: ['LineChart', 'BarChart'],

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
    { src: '~/plugins/obiyen-chat.client.ts', mode: 'client' }
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
      // Adressevælger (Klimadatastyrelsen) — DAWA's official autocomplete
      // replacement (DAWA's address endpoints close 2026-08-17). The token
      // below is the publicly-documented shared token; KDS has said per-user
      // tokens are coming later, so this is env-overridable rather than
      // hard-coded so it can be swapped without a code change.
      adressevaelgerToken: process.env.ADRESSEVAELGER_TOKEN || 'adressevaelger123',
      reverbAppKey: process.env.REVERB_APP_KEY,
      reverbHost: process.env.REVERB_HOST,
      reverbPort: process.env.REVERB_PORT,
      reverbScheme: process.env.REVERB_SCHEME,
    },
  },

  routeRules: {
    // Audit C-07: security headers on every route.
    '/**': {
      headers: securityHeaders,
    },
    '/fst-register': {
      redirect: { to: '/register', statusCode: 301 },
    },
    '/.well-known/apple-app-site-association': {
      headers: { 'content-type': 'application/json' },
    },
    '/.well-known/assetlinks.json': {
      headers: { 'content-type': 'application/json' },
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