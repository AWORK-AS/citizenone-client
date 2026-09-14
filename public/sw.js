/*
 * Service worker til CitizenOne som installerbar app.
 *
 * Den er med vilje næsten tom, og det er den vigtigste beslutning i filen.
 *
 * En service worker findes her, fordi den er forudsætningen for at browseren tilbyder
 * "Installer CitizenOne". Den findes ikke for at cache appen. CitizenOne er en autentificeret
 * SPA, der bliver brugt til journalføring og medicin, og en cache foran den koster to ting, der
 * begge er værre end den gevinst, offline ville give:
 *
 * - **Gammel kode efter et deploy.** Precaching af JS-bundtet betyder, at en medarbejder kan
 *   sidde med gårsdagens frontend mod dagens API, indtil hun lukker hver eneste fane. Det er en
 *   fejlklasse, der er svær at se og svær at fejlsøge.
 * - **Cachede svar med persondata.** Alt her er følsomt. Et API-svar, der bliver liggende i
 *   Cache Storage på en delt tablet på et vagtkontor, er ikke noget nogen har bedt om.
 *
 * Derfor: `fetch` går direkte på nettet, og der bliver ikke gemt et svar. Det eneste, der
 * caches, er en enkelt offline-side, så en navigation uden net møder noget der forklarer sig
 * frem for browserens fejlside.
 *
 * Vil man have rigtig offline senere, er det ikke den her fil, der skal udvides lidt. Det er en
 * beslutning om hvilke data der må ligge på enheden, og den hører sammen med den native app,
 * hvor det spørgsmål allerede er stillet.
 */

const OFFLINE_URL = '/offline.html'
const CACHE = 'citizenone-shell-v1'

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL, '/icons/icon-192.png'])),
    )

    // Tag over med det samme. Uden den venter en ny worker på at hver fane er lukket, og da der
    // ikke ligger noget cachet indhold at komme i konflikt med, er der intet at vente på.
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim()),
    )
})

self.addEventListener('fetch', (event) => {
    const { request } = event

    // Kun sidenavigationer får en fallback. Alt andet, API-kald, billeder, bundter, går
    // uberørt på nettet, og et fejlet kald skal fejle som det ville uden en service worker.
    if (request.mode !== 'navigate') {
        return
    }

    event.respondWith(
        fetch(request).catch(() => caches.match(OFFLINE_URL).then((r) => r ?? Response.error())),
    )
})
