export default defineNuxtConfig({
  extends: [
    // '../layers/tairo-layout-sidebar',
    '../layers/tairo-layout-collapse',
    // '../layers/tairo-layout-topnav',
    '../layers/tairo',
  ],
  /**
   * Load local font with @fontsource packages
   * @see https://fontsource.org/
   */
  css: [
    '@fontsource-variable/inter/index.css',
    '@fontsource-variable/karla/index.css',
  ],
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
  ],
  runtimeConfig: {
    public: {
      appName: process.env.APP_NAME,
      apiBaseURL: process.env.API_BASE_URL,
    },
  },
  ssr: false,
})
