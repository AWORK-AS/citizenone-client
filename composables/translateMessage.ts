/**
 * Translates a message outside component setup (API service classes, plain
 * helpers), through the app's global vue-i18n instance from plugins/i18n.ts.
 * Falls back to the English text when i18n is not available yet, so an error
 * can always be shown.
 */
export function translateMessage(key: string, fallback: string, params?: Record<string, unknown>): string {
    try {
        const i18n = (useNuxtApp() as any).$i18nGlobal
        if (i18n?.t) {
            const text = String(i18n.t(key, params ?? {}))
            if (text && text !== key) return text
        }
    } catch {
        // No Nuxt context (tests, very early boot): use the fallback.
    }

    return fallback.replace(/\{(\w+)\}/g, (_, name) => String(params?.[name] ?? ''))
}
