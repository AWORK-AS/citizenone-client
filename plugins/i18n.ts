import { createI18n } from 'vue-i18n'
import en from '../lang/en.json'
import dk from '../lang/dk.json'
import no from '../lang/no.json'
import sv from '../lang/sv.json'

export default defineNuxtPlugin(({ vueApp }) => {
    const i18n = createI18n({
        legacy: false,
        globalInjection: true,
        locale: 'en',
        fallbackLocale: 'en',
        messages: {
            en,
            dk,
            no,
            sv,
        },
    })
    vueApp.use(i18n)
})