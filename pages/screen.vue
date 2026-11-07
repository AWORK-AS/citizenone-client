<template>
    <Head>
        <Title>{{ feed?.name ?? $t('infoScreenDisplay.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <div class="info-screen fixed inset-0 overflow-hidden bg-[#0a1f33] text-white" :class="{ 'cursor-none': !!feed }">
        <!-- Living background: slow drifting light, so the picture is never quite still -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div class="blob blob-a" />
            <div class="blob blob-b" />
            <div class="blob blob-c" />
        </div>

        <!-- Pairing: the TV is not connected to a screen yet -->
        <div v-if="mode === 'pair'" class="relative flex h-full flex-col items-center justify-center gap-8 px-6 text-center">
            <LogoWhite class="panel-in h-12" />
            <div class="panel-in" style="animation-delay: 0.1s">
                <h1 class="text-4xl font-light">{{ $t('infoScreenDisplay.pairTitle') }}</h1>
                <p class="mt-3 text-lg text-white/70">{{ $t('infoScreenDisplay.pairHint') }}</p>
            </div>
            <form class="panel-in flex flex-col items-center gap-4" style="animation-delay: 0.2s" @submit.prevent="pair">
                <input ref="codeInput" v-model="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6"
                    pattern="[0-9]*" :aria-label="$t('infoScreenDisplay.code')"
                    class="w-[28rem] rounded-2xl border border-white/20 bg-white/10 px-6 py-5 text-center text-6xl font-light tracking-[0.3em] text-white placeholder-white/30 focus:border-[#2dbab2] focus:outline-none"
                    :class="{ shake: !!pairError }"
                    placeholder="000000" @input="code = code.replace(/\D/g, '').slice(0, 6)" />
                <button type="submit" :disabled="code.length !== 6 || pairing"
                    class="rounded-lg bg-[#2dbab2] px-8 py-3 text-lg font-semibold text-white transition disabled:opacity-40">
                    {{ $t('infoScreenDisplay.connect') }}
                </button>
                <p v-if="pairError" class="text-lg text-[#fecaca]">{{ pairError }}</p>
            </form>
        </div>

        <!-- Connected, but the screen may not show anything right now -->
        <div v-else-if="mode === 'blocked'" class="relative flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
            <LogoWhite class="h-12" />
            <p class="max-w-2xl text-2xl font-light text-white/80">{{ blockedText }}</p>
        </div>

        <!-- The screen. The whole picture drifts a few pixels over the hours against burn-in. -->
        <div v-else-if="feed" class="burn-in-shift relative flex h-full flex-col gap-[2vh] p-[3vh]">
            <header class="panel-in flex items-start justify-between gap-8">
                <div>
                    <p class="text-[2.2vh] font-semibold uppercase tracking-widest text-[#2dbab2]">{{ feed.department_name ?? feed.name }}</p>
                    <p class="text-[3.6vh] font-light">{{ dateText }}</p>
                </div>
                <div class="flex items-center gap-[4vh]">
                    <div v-if="feed.show_weather && feed.weather" class="flex items-center gap-[1.4vh] text-[5vh] font-light">
                        <Icon :name="weatherIcon(feed.weather.now.symbol)" class="text-[5.5vh]" />
                        <span class="tabular-nums">{{ Math.round(feed.weather.now.temperature) }}°</span>
                    </div>
                    <p v-if="feed.show_clock" class="text-[9vh] font-light leading-none tabular-nums">
                        {{ clockParts[0] }}<span class="colon">:</span>{{ clockParts[1] }}
                    </p>
                </div>
            </header>

            <DayTimeline v-if="feed.show_timeline && activities.length" :activities="activities" :nowMinutes="nowMinutes"
                class="panel-in" style="animation-delay: 0.1s" />

            <main class="grid min-h-0 flex-1 gap-[2vh]" :class="hasSide && hasStage ? 'grid-cols-[minmax(0,5fr)_minmax(0,7fr)]' : 'grid-cols-1'">
                <section v-if="hasSide" class="flex min-h-0 flex-col gap-[2vh]">
                    <div v-if="feed.show_activities" class="panel panel-in min-h-0 flex-1 overflow-hidden" style="animation-delay: 0.15s">
                        <h2 class="panel-title"><Icon name="ph:calendar-check" /> {{ $t('infoScreenDisplay.today') }}</h2>
                        <TransitionGroup v-if="activities.length" tag="ul" name="list" class="space-y-[0.6vh]">
                            <li v-for="activity in visibleActivities" :key="activity.time + activity.title"
                                class="activity flex items-center gap-[2vh] rounded-xl px-[1.6vh] py-[1vh] text-[3vh]"
                                :class="{
                                    'opacity-35': activity.state === 'past',
                                    'activity-now bg-[#2dbab2]/15': activity.state === 'now',
                                }">
                                <span class="w-[10vh] shrink-0 font-semibold tabular-nums"
                                    :class="activity.state === 'past' ? 'text-white' : 'text-[#2dbab2]'">{{ activity.time ?? '' }}</span>
                                <span class="min-w-0 flex-1 truncate font-light">{{ activity.title }}</span>
                                <span v-if="activity.state === 'now'"
                                    class="shrink-0 rounded-full bg-[#2dbab2] px-[1.4vh] py-[0.3vh] text-[1.9vh] font-semibold uppercase tracking-wider">
                                    {{ $t('infoScreenDisplay.now') }}
                                </span>
                                <span v-else-if="activity.state === 'next' && activity.minutesUntil !== null"
                                    class="next-chip shrink-0 rounded-full border border-[#2dbab2]/60 px-[1.4vh] py-[0.3vh] text-[1.9vh] font-semibold text-[#2dbab2]">
                                    {{ inText(activity.minutesUntil) }}
                                </span>
                            </li>
                        </TransitionGroup>
                        <p v-else class="text-[2.6vh] font-light text-white/50">{{ $t('infoScreenDisplay.noActivities') }}</p>
                    </div>

                    <div v-if="feed.show_menu && feed.menu" class="panel panel-in" style="animation-delay: 0.25s">
                        <h2 class="panel-title"><Icon name="ph:fork-knife" /> {{ $t('infoScreenDisplay.menu') }}</h2>
                        <p class="whitespace-pre-line text-[3vh] font-light">{{ feed.menu }}</p>
                    </div>

                    <div v-if="feed.show_staff_on_duty && feed.staff_on_duty.length" class="panel panel-in" style="animation-delay: 0.35s">
                        <h2 class="panel-title"><Icon name="ph:users-three" /> {{ $t('infoScreenDisplay.onDuty') }}</h2>
                        <div class="flex flex-wrap gap-[1vh]">
                            <span v-for="(person, index) in feed.staff_on_duty" :key="person.firstname + person.until"
                                class="panel-in rounded-full bg-white/10 px-[2vh] py-[0.8vh] text-[2.6vh]"
                                :style="{ animationDelay: `${0.45 + index * 0.06}s` }">
                                {{ person.firstname }}
                                <span v-if="person.until" class="text-white/50">{{ $t('infoScreenDisplay.until', { time: person.until }) }}</span>
                            </span>
                        </div>
                    </div>
                </section>

                <section v-if="hasStage" class="panel-in relative min-h-0 overflow-hidden rounded-2xl bg-black/30" style="animation-delay: 0.2s">
                    <Transition name="stage">
                        <div :key="current?.key" class="absolute inset-0">
                            <!-- Picture, slowly zooming (Ken Burns) -->
                            <div v-if="current?.type === 'slide'" class="absolute inset-0 overflow-hidden">
                                <img :src="current.url" alt="" aria-hidden="true" class="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
                                <img :src="current.url" alt="" class="ken-burns absolute inset-0 h-full w-full object-contain"
                                    :class="current.index % 2 ? 'ken-burns-b' : 'ken-burns-a'"
                                    :style="{ animationDuration: `${slideSeconds + 2}s` }" />
                            </div>

                            <!-- News -->
                            <div v-else-if="current?.type === 'news'" class="absolute inset-0 flex flex-col bg-cover bg-center"
                                :class="current.image ? 'justify-end' : 'justify-center'"
                                :style="current.image ? `background-image: url('${current.image}')` : ''">
                                <div class="news-text p-[4vh]"
                                    :class="current.image && 'bg-gradient-to-t from-[#0a1f33] via-[#0a1f33]/90 to-transparent pt-[12vh]'">
                                    <p class="text-[2vh] font-semibold uppercase tracking-widest text-[#2dbab2]">{{ $t('infoScreenDisplay.news') }}</p>
                                    <h3 class="mt-[1vh] text-[4.4vh] font-semibold leading-tight">{{ current.title }}</h3>
                                    <p class="mt-[1.4vh] text-[2.8vh] font-light text-white/80">{{ current.preview }}</p>
                                </div>
                            </div>

                            <WeatherCard v-else-if="current?.type === 'weather'" :weather="feed.weather" :place="feed.weather_place" />

                            <PollCard v-else-if="current?.type === 'poll'" :poll="feed.poll" :voteUrl="voteUrl" />
                        </div>
                    </Transition>

                    <!-- Where we are in the rotation -->
                    <div v-if="rotation.length > 1" class="absolute bottom-[1.6vh] left-1/2 flex -translate-x-1/2 gap-[0.8vh]">
                        <span v-for="(item, index) in rotation" :key="item.key"
                            class="h-[0.7vh] rounded-full transition-all duration-500"
                            :class="index === rotationIndex % rotation.length ? 'w-[3vh] bg-white' : 'w-[0.7vh] bg-white/30'" />
                    </div>
                </section>
            </main>

            <footer v-if="feed.message" class="panel-in message overflow-hidden rounded-2xl bg-[#2dbab2] py-[2vh] text-[3.2vh] font-semibold text-white"
                style="animation-delay: 0.3s">
                <div v-if="feed.message.length > MARQUEE_FROM" class="marquee flex w-max gap-[12vh] whitespace-nowrap"
                    :style="{ animationDuration: `${Math.max(20, feed.message.length / 4)}s` }">
                    <span v-for="copy in 2" :key="copy"><Icon name="ph:megaphone-simple" class="mr-[1.5vh] align-[-0.3vh]" />{{ feed.message }}</span>
                </div>
                <p v-else class="px-[3vh]"><Icon name="ph:megaphone-simple" class="mr-[1.5vh] align-[-0.3vh]" /><span class="shimmer">{{ feed.message }}</span></p>
            </footer>
        </div>

        <div v-else class="relative flex h-full items-center justify-center">
            <LogoWhite class="h-12 animate-pulse" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import { activityStates, weatherIcon } from '@/composables/infoScreen'
import DayTimeline from '@/components/modules/info-screen/day-timeline.vue'
import WeatherCard from '@/components/modules/info-screen/weather-card.vue'
import PollCard from '@/components/modules/info-screen/poll-card.vue'

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
const MARQUEE_FROM = 70
const POLL_SECONDS = 20
const WEATHER_SECONDS = 15
const NEWS_SECONDS = 15

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
const clockParts = computed(() => clockText.value.split(':'))
const nowMinutes = computed(() => Number(clockParts.value[0]) * 60 + Number(clockParts.value[1]))
const dateText = computed(() => {
    const text = screenNow.value.toLocaleDateString(LANGUAGE_TAGS[locale.value] ?? 'da-DK', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Copenhagen' })
    return text.charAt(0).toUpperCase() + text.slice(1)
})

const activities = computed(() => activityStates(feed.value?.activities ?? [], nowMinutes.value))

// The list holds about four rows; when the day is fuller, what is over goes first.
const MAX_ROWS = 4
const visibleActivities = computed(() => {
    const list = [...activities.value]
    while (list.length > MAX_ROWS && list[0]?.state === 'past') list.shift()
    return list.slice(0, MAX_ROWS)
})

function inText(minutes: number): string {
    if (minutes < 60) return t('infoScreenDisplay.inMinutes', { count: minutes })
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest ? t('infoScreenDisplay.inHoursMinutes', { hours, minutes: rest }) : t('infoScreenDisplay.inHours', { count: hours })
}

const hasSide = computed(() => !!feed.value && (feed.value.show_activities
    || (feed.value.show_menu && feed.value.menu)
    || (feed.value.show_staff_on_duty && feed.value.staff_on_duty?.length)))

const slideSeconds = computed(() => Math.max(3, Number(feed.value?.slide_seconds) || 10))

const voteUrl = computed(() => feed.value?.poll_token && import.meta.client
    ? `${window.location.origin}/screen-vote/${feed.value.poll_token}`
    : null)

/**
 * The big panel's turns: pictures and news alternate, the weather comes once
 * a round, and the poll every third turn so people see it often enough to vote.
 */
const rotation = computed(() => {
    if (!feed.value) return []
    const slides = (feed.value.slides ?? []).map((url: string, index: number) => ({ type: 'slide', key: `s${index}-${url}`, url, index }))
    const news = (feed.value.news ?? []).map((item: any) => ({ type: 'news', ...item, key: `n${item.uuid}` }))
    const content: any[] = []
    for (let i = 0; i < Math.max(slides.length, news.length); i++) {
        if (slides[i]) content.push(slides[i])
        if (news[i]) content.push(news[i])
    }
    if (feed.value.show_weather && feed.value.weather?.hours?.length > 1) content.push({ type: 'weather', key: 'weather' })

    if (!feed.value.poll) return content
    const items: any[] = []
    content.forEach((item, index) => {
        if (index % 3 === 0) items.push({ type: 'poll', key: `poll${index}` })
        items.push(item)
    })
    return items.length ? items : [{ type: 'poll', key: 'poll0' }]
})
const hasStage = computed(() => rotation.value.length > 0)
const rotationIndex = ref(0)
const current = computed(() => rotation.value.length ? rotation.value[rotationIndex.value % rotation.value.length] : null)

function scheduleRotation() {
    if (rotateTimer) clearTimeout(rotateTimer)
    const seconds = {
        news: Math.max(slideSeconds.value, NEWS_SECONDS),
        weather: WEATHER_SECONDS,
        poll: POLL_SECONDS,
    }[current.value?.type as string] ?? slideSeconds.value
    rotateTimer = setTimeout(() => {
        rotationIndex.value = rotation.value.length ? (rotationIndex.value + 1) % rotation.value.length : 0
        scheduleRotation()
    }, seconds * 1000)
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
.panel {
    @apply rounded-2xl bg-white/[0.06] p-[3vh] backdrop-blur-sm;
}

.panel-title {
    @apply mb-[2vh] flex items-center gap-[1.2vh] text-[2.2vh] font-semibold uppercase tracking-widest text-white/60;
}

/* Entrance: each part rises in, one after the other */
.panel-in {
    animation: rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes rise {
    from {
        opacity: 0;
        transform: translateY(2.5vh);
    }
}

/* Background light */
.blob {
    position: absolute;
    border-radius: 9999px;
    filter: blur(10vh);
    opacity: 0.35;
}

.blob-a {
    width: 70vh;
    height: 70vh;
    left: -15vh;
    top: -20vh;
    background: #1b6d8a;
    animation: drift-a 70s ease-in-out infinite alternate;
}

.blob-b {
    width: 60vh;
    height: 60vh;
    right: -10vh;
    bottom: -25vh;
    background: #2dbab2;
    opacity: 0.18;
    animation: drift-b 90s ease-in-out infinite alternate;
}

.blob-c {
    width: 50vh;
    height: 50vh;
    left: 45%;
    top: 30%;
    background: #0f4c75;
    animation: drift-a 110s ease-in-out infinite alternate-reverse;
}

@keyframes drift-a {
    to {
        transform: translate(40vh, 25vh) scale(1.2);
    }
}

@keyframes drift-b {
    to {
        transform: translate(-50vh, -20vh) scale(0.9);
    }
}

/* Against burn-in: the whole picture moves a few pixels over half an hour */
.burn-in-shift {
    animation: shift 1800s ease-in-out infinite alternate;
}

@keyframes shift {
    25% {
        transform: translate(4px, -3px);
    }

    50% {
        transform: translate(-3px, 4px);
    }

    75% {
        transform: translate(3px, 3px);
    }

    100% {
        transform: translate(-4px, -2px);
    }
}

/* Clock */
.colon {
    animation: blink 2s steps(1) infinite;
}

@keyframes blink {
    50% {
        opacity: 0.35;
    }
}

/* Program: now and next */
.activity {
    transition: opacity 1s ease, background-color 1s ease;
}

.activity-now {
    box-shadow: inset 0.5vh 0 0 #2dbab2;
}

.next-chip {
    animation: breathe 2.5s ease-in-out infinite;
}

@keyframes breathe {
    50% {
        background-color: rgba(45, 186, 178, 0.18);
    }
}

.list-move {
    transition: transform 0.8s ease;
}

/* The big panel's turns */
.stage-enter-active,
.stage-leave-active {
    transition: opacity 1s ease, transform 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.stage-enter-from {
    opacity: 0;
    transform: translateX(4%) scale(1.02);
}

.stage-leave-to {
    opacity: 0;
    transform: translateX(-3%) scale(0.98);
}

.ken-burns {
    animation-timing-function: linear;
    animation-fill-mode: both;
}

.ken-burns-a {
    animation-name: ken-burns-a;
}

.ken-burns-b {
    animation-name: ken-burns-b;
}

@keyframes ken-burns-a {
    from {
        transform: scale(1) translate(0, 0);
    }

    to {
        transform: scale(1.12) translate(-2%, -1.5%);
    }
}

@keyframes ken-burns-b {
    from {
        transform: scale(1.12) translate(2%, 1%);
    }

    to {
        transform: scale(1) translate(0, 0);
    }
}

.news-text > * {
    animation: rise 1s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.news-text > *:nth-child(2) {
    animation-delay: 0.15s;
}

.news-text > *:nth-child(3) {
    animation-delay: 0.3s;
}

/* Message band */
.marquee {
    animation: marquee linear infinite;
}

@keyframes marquee {
    to {
        transform: translateX(calc(-50% - 6vh));
    }
}

.shimmer {
    background: linear-gradient(100deg, #fff 40%, rgba(255, 255, 255, 0.55) 50%, #fff 60%) 0 0 / 300% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: shimmer 8s linear infinite;
}

@keyframes shimmer {
    from {
        background-position: 100% 0;
    }

    to {
        background-position: -200% 0;
    }
}

.shake {
    animation: shake 0.4s ease;
}

@keyframes shake {
    25% {
        transform: translateX(-1rem);
    }

    75% {
        transform: translateX(1rem);
    }
}

@media (prefers-reduced-motion: reduce) {
    .panel-in,
    .blob,
    .burn-in-shift,
    .colon,
    .next-chip,
    .ken-burns,
    .news-text > *,
    .marquee,
    .shimmer,
    .shake {
        animation: none !important;
    }

    .shimmer {
        color: #fff;
        background: none;
    }
}
</style>
