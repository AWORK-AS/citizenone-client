<template>
    <Head>
        <Title>{{ feed?.name ?? $t('infoScreenDisplay.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <div class="info-screen fixed inset-0 overflow-hidden bg-[#0a1f33] text-white" :class="{ 'cursor-none': !!feed }">
        <!-- Pairing: the TV is not connected to a screen yet -->
        <div v-if="mode === 'pair'" class="flex h-full flex-col items-center justify-center gap-8 px-6 text-center">
            <LogoWhite class="h-12" />
            <div>
                <h1 class="text-4xl font-light">{{ $t('infoScreenDisplay.pairTitle') }}</h1>
                <p class="mt-3 text-lg text-white/70">{{ $t('infoScreenDisplay.pairHint') }}</p>
            </div>
            <form class="flex flex-col items-center gap-4" @submit.prevent="pair">
                <input ref="codeInput" v-model="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6"
                    pattern="[0-9]*" :aria-label="$t('infoScreenDisplay.code')"
                    class="w-[28rem] rounded-2xl border border-white/20 bg-white/10 px-6 py-5 text-center text-6xl font-light tracking-[0.3em] text-white placeholder-white/30 focus:border-[#2dbab2] focus:outline-none"
                    placeholder="000000" @input="code = code.replace(/\D/g, '').slice(0, 6)" />
                <button type="submit" :disabled="code.length !== 6 || pairing"
                    class="rounded-lg bg-[#2dbab2] px-8 py-3 text-lg font-semibold text-white disabled:opacity-40">
                    {{ $t('infoScreenDisplay.connect') }}
                </button>
                <p v-if="pairError" class="text-lg text-[#fecaca]">{{ pairError }}</p>
            </form>
        </div>

        <!-- Connected, but the screen may not show anything right now -->
        <div v-else-if="mode === 'blocked'" class="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
            <LogoWhite class="h-12" />
            <p class="max-w-2xl text-2xl font-light text-white/80">{{ blockedText }}</p>
        </div>

        <!-- The screen -->
        <div v-else-if="feed" class="flex h-full flex-col gap-[2vh] p-[3vh]">
            <header class="flex items-start justify-between gap-8">
                <div>
                    <p class="text-[2.2vh] font-semibold uppercase tracking-widest text-[#2dbab2]">{{ feed.department_name ?? feed.name }}</p>
                    <p class="text-[3.6vh] font-light">{{ dateText }}</p>
                </div>
                <p v-if="feed.show_clock" class="text-[9vh] font-light leading-none tabular-nums">{{ clockText }}</p>
            </header>

            <main class="grid min-h-0 flex-1 gap-[2vh]" :class="hasSide && hasSlides ? 'grid-cols-[minmax(0,5fr)_minmax(0,7fr)]' : 'grid-cols-1'">
                <section v-if="hasSide" class="flex min-h-0 flex-col gap-[2vh]">
                    <div v-if="feed.show_activities" class="panel min-h-0 flex-1">
                        <h2 class="panel-title"><Icon name="ph:calendar-check" /> {{ $t('infoScreenDisplay.today') }}</h2>
                        <ul v-if="feed.activities.length" class="space-y-[1.4vh]">
                            <li v-for="(activity, index) in feed.activities" :key="index" class="flex gap-[2vh] text-[3vh]">
                                <span class="w-[11vh] shrink-0 font-semibold tabular-nums text-[#2dbab2]">{{ activity.time ?? '' }}</span>
                                <span class="font-light">{{ activity.title }}</span>
                            </li>
                        </ul>
                        <p v-else class="text-[2.6vh] font-light text-white/50">{{ $t('infoScreenDisplay.noActivities') }}</p>
                    </div>

                    <div v-if="feed.show_menu && feed.menu" class="panel">
                        <h2 class="panel-title"><Icon name="ph:fork-knife" /> {{ $t('infoScreenDisplay.menu') }}</h2>
                        <p class="whitespace-pre-line text-[3vh] font-light">{{ feed.menu }}</p>
                    </div>

                    <div v-if="feed.show_staff_on_duty && feed.staff_on_duty.length" class="panel">
                        <h2 class="panel-title"><Icon name="ph:users-three" /> {{ $t('infoScreenDisplay.onDuty') }}</h2>
                        <div class="flex flex-wrap gap-[1vh]">
                            <span v-for="person in feed.staff_on_duty" :key="person.firstname + person.until"
                                class="rounded-full bg-white/10 px-[2vh] py-[0.8vh] text-[2.6vh]">
                                {{ person.firstname }}
                                <span v-if="person.until" class="text-white/50">{{ $t('infoScreenDisplay.until', { time: person.until }) }}</span>
                            </span>
                        </div>
                    </div>
                </section>

                <section v-if="hasSlides" class="relative min-h-0 overflow-hidden rounded-2xl bg-black/30">
                    <!-- A news item takes the picture's place in turn -->
                    <Transition name="fade" mode="out-in">
                        <img v-if="current?.type === 'slide'" :key="'s' + current.key" :src="current.url" alt=""
                            class="absolute inset-0 h-full w-full object-contain" />
                        <div v-else-if="current?.type === 'news'" :key="'n' + current.key"
                            class="absolute inset-0 flex flex-col bg-cover bg-center"
                            :class="current.image ? 'justify-end' : 'justify-center'"
                            :style="current.image ? `background-image: url('${current.image}')` : ''">
                            <div class="p-[4vh]"
                                :class="current.image && 'bg-gradient-to-t from-[#0a1f33] via-[#0a1f33]/90 to-transparent pt-[12vh]'">
                                <p class="text-[2vh] font-semibold uppercase tracking-widest text-[#2dbab2]">{{ $t('infoScreenDisplay.news') }}</p>
                                <h3 class="mt-[1vh] text-[4.4vh] font-semibold leading-tight">{{ current.title }}</h3>
                                <p class="mt-[1.4vh] text-[2.8vh] font-light text-white/80">{{ current.preview }}</p>
                            </div>
                        </div>
                    </Transition>
                </section>
            </main>

            <footer v-if="feed.message" class="rounded-2xl bg-[#2dbab2] px-[3vh] py-[2vh] text-[3.2vh] font-semibold text-white">
                <Icon name="ph:megaphone-simple" class="mr-[1.5vh] align-[-0.3vh]" />{{ feed.message }}
            </footer>
        </div>

        <div v-else class="flex h-full items-center justify-center">
            <LogoWhite class="h-12 animate-pulse" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'

/**
 * The Info Screen display: opened on a TV in a common room. No login. The TV
 * pairs once with a code from Settings → Info screen and keeps the token it
 * gets. It asks for new content every minute and keeps showing the last good
 * content if the network drops.
 */
const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()
const userStore = useUserStore() as any

const TOKEN_KEY = 'citizenone-info-screen-token'
const REFRESH_MS = 60_000

const mode = ref<'loading' | 'pair' | 'blocked' | 'show'>('loading')
const feed = ref<any>(null)
const code = ref('')
const pairing = ref(false)
const pairError = ref('')
const blockedReason = ref('')
const codeInput = ref<HTMLInputElement | null>(null)

// The TV's own clock is often wrong; the server's time is used, kept in step locally.
const clockOffset = ref(0)
const now = ref(Date.now())

let refreshTimer: ReturnType<typeof setInterval> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null
let rotateTimer: ReturnType<typeof setTimeout> | null = null
let wakeLock: any = null

function readToken(): string | null {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

function writeToken(token: string | null) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token)
        else localStorage.removeItem(TOKEN_KEY)
    } catch { /* storage blocked: the TV pairs again after a reload */ }
}

const blockedText = computed(() => blockedReason.value === 'no_seat'
    ? t('infoScreenDisplay.noSeat')
    : t('infoScreenDisplay.appInactive'))

// The app's locale codes are not language tags.
const LANGUAGE_TAGS: Record<string, string> = { dk: 'da-DK', en: 'en-GB', no: 'nb-NO', sv: 'sv-SE' }

const screenNow = computed(() => new Date(now.value + clockOffset.value))
// 24-hour clock with a colon, like the program's times.
const clockText = computed(() => screenNow.value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Copenhagen' }))
const dateText = computed(() => {
    const text = screenNow.value.toLocaleDateString(LANGUAGE_TAGS[locale.value] ?? 'da-DK', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Copenhagen' })
    return text.charAt(0).toUpperCase() + text.slice(1)
})

const hasSide = computed(() => !!feed.value && (feed.value.show_activities
    || (feed.value.show_menu && feed.value.menu)
    || (feed.value.show_staff_on_duty && feed.value.staff_on_duty?.length)))

// Pictures and news share the big panel and take turns.
const rotation = computed(() => {
    if (!feed.value) return []
    const slides = (feed.value.slides ?? []).map((url: string, index: number) => ({ type: 'slide', key: `${index}-${url}`, url }))
    const news = (feed.value.news ?? []).map((item: any) => ({ type: 'news', key: item.uuid, ...item }))
    const items: any[] = []
    const longest = Math.max(slides.length, news.length)
    for (let i = 0; i < longest; i++) {
        if (slides[i]) items.push(slides[i])
        if (news[i]) items.push(news[i])
    }
    return items
})
const hasSlides = computed(() => rotation.value.length > 0)
const rotationIndex = ref(0)
const current = computed(() => rotation.value.length ? rotation.value[rotationIndex.value % rotation.value.length] : null)

function scheduleRotation() {
    if (rotateTimer) clearTimeout(rotateTimer)
    const item = current.value
    const seconds = Math.max(3, Number(feed.value?.slide_seconds) || 10)
    // News needs time to be read.
    const ms = (item?.type === 'news' ? Math.max(seconds, 15) : seconds) * 1000
    rotateTimer = setTimeout(() => {
        rotationIndex.value = rotation.value.length ? (rotationIndex.value + 1) % rotation.value.length : 0
        scheduleRotation()
    }, ms)
}

async function api(path: string, options: any = {}) {
    return await $fetch(path, { baseURL: runtimeConfig.public.apiBaseURL, headers: { Accept: 'application/json', ...(options.headers ?? {}) }, ...options })
}

async function loadFeed() {
    const token = readToken()
    if (!token) {
        showPair()
        return
    }

    try {
        const response: any = await api('/info-screen/feed', { headers: { Authorization: `Bearer ${token}` } })
        const data = response?.data
        if (!data) return
        if (data.server_time) clockOffset.value = new Date(data.server_time).getTime() - Date.now()
        const firstLoad = !feed.value
        // A screen has no user to pick a language: it speaks the staff's language.
        if (data.language && data.language !== locale.value) {
            userStore.setLanguage(data.language)
            locale.value = data.language
        }
        feed.value = data
        mode.value = 'show'
        if (firstLoad) scheduleRotation()
    } catch (error: any) {
        const status = error?.response?.status
        const reason = error?.response?._data?.reason
        if (status === 401) {
            // Unpaired or deleted in settings: start over.
            writeToken(null)
            feed.value = null
            showPair()
        } else if (status === 403) {
            feed.value = null
            blockedReason.value = reason ?? ''
            mode.value = 'blocked'
        }
        // Network errors and 5xx: keep showing what we have and try again later.
    }
}

function showPair() {
    mode.value = 'pair'
    nextTick(() => codeInput.value?.focus())
}

async function pair() {
    if (code.value.length !== 6) return
    pairing.value = true
    pairError.value = ''
    try {
        const response: any = await api('/info-screen/pair', { method: 'POST', body: { code: code.value } })
        writeToken(response?.data?.token ?? null)
        code.value = ''
        mode.value = 'loading'
        await loadFeed()
    } catch (error: any) {
        pairError.value = error?.response?.status === 429 ? t('infoScreenDisplay.tooManyTries') : t('infoScreenDisplay.wrongCode')
    }
    pairing.value = false
}

async function keepAwake() {
    try {
        wakeLock = await (navigator as any).wakeLock?.request('screen')
    } catch { /* not supported or not allowed: the TV's own settings decide */ }
}

function onVisible() {
    if (document.visibilityState === 'visible') {
        keepAwake()
        loadFeed()
    }
}

// Before pairing the screen does not know whose it is: it follows the TV's language.
function applyBrowserLanguage() {
    const tag = (navigator.language || '').toLowerCase()
    const code = tag.startsWith('da') ? 'dk' : (tag.startsWith('nb') || tag.startsWith('nn') || tag.startsWith('no')) ? 'no' : tag.startsWith('sv') ? 'sv' : null
    if (code && code !== locale.value) {
        userStore.setLanguage(code)
        locale.value = code
    }
}

onMounted(() => {
    if (!readToken()) applyBrowserLanguage()
    loadFeed()
    keepAwake()
    refreshTimer = setInterval(loadFeed, REFRESH_MS)
    clockTimer = setInterval(() => { now.value = Date.now() }, 1000)
    document.addEventListener('visibilitychange', onVisible)
})

onBeforeUnmount(() => {
    if (refreshTimer) clearInterval(refreshTimer)
    if (clockTimer) clearInterval(clockTimer)
    if (rotateTimer) clearTimeout(rotateTimer)
    document.removeEventListener('visibilitychange', onVisible)
    wakeLock?.release?.()
})
</script>

<style scoped>
.info-screen {
    font-family: 'Inter', sans-serif;
}

.panel {
    @apply rounded-2xl bg-white/[0.06] p-[3vh];
}

.panel-title {
    @apply mb-[2vh] flex items-center gap-[1.2vh] text-[2.2vh] font-semibold uppercase tracking-widest text-white/60;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
