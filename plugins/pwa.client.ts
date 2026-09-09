/*
 * Registrerer service workeren, som er det, der gør browseren i stand til at tilbyde
 * "Installer CitizenOne" i adresselinjen.
 *
 * Tre forbehold, og de er alle tre grunden til at det er en klientplugin og ikke en linje i
 * nuxt.config:
 *
 * - **Ikke i udvikling.** En service worker foran Vites dev-server serverer gamle moduler og
 *   får hot reload til at opføre sig uforklarligt. `import.meta.dev` holder den ude.
 * - **Ikke uden understøttelse.** Safari på macOS og ældre browsere melder ikke fejl, de har
 *   bare ikke `serviceWorker`. Så tjekket er en betingelse og ikke en try/catch.
 * - **Aldrig blokerende.** Registreringen kan fejle, for eksempel hvis siden køres fra en
 *   kontekst der ikke er sikker. Appen skal virke præcis som før i det tilfælde, så fejlen
 *   bliver logget og slugt. En installerbar app er en bekvemmelighed, ikke en forudsætning.
 *
 * Selve workeren cacher ikke appen. Se public/sw.js for hvorfor det ville være en dårlig idé
 * på et journalsystem.
 */
export default defineNuxtPlugin(() => {
    if (import.meta.dev || !('serviceWorker' in navigator)) {
        return
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
            console.warn('[pwa] service worker blev ikke registreret', error)
        })
    })
})
