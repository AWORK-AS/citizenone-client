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

    // useI18n()'s $t global injection only reaches component setup - route
    // middleware and plugins run outside that context, so they need the
    // underlying instance directly to translate anything.
    return {
        provide: {
            i18nGlobal: i18n.global,
        },
    }
})