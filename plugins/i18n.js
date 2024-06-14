import { createI18n } from 'vue-i18n'
import en from '../lang/en.json'
import dk from '../lang/dk.json'

export default defineNuxtPlugin(({ vueApp }) => {
    const i18n = createI18n({
        legacy: false,
        globalInjection: true,
        locale: 'en',
        fallbackLocale: 'en',
        messages: {
            en,
            dk,
        },
    })
    vueApp.use(i18n)
})