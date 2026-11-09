<template>
    <div ref="root" class="flex h-full flex-col p-[4vh]">
        <p class="flex items-center gap-[1.2vh] text-[2vh] font-semibold uppercase tracking-widest text-[#2dbab2]">
            <Icon name="ph:calendar-dots" /> {{ $t('infoScreenDisplay.week') }}
        </p>
        <div class="mt-[2.4vh] grid min-h-0 flex-1 grid-cols-7 gap-[1vh]">
            <div v-for="(day, index) in week" :key="day.weekday"
                class="day flex min-h-0 flex-col overflow-hidden rounded-xl px-[1vh] py-[1.4vh]"
                :class="day.weekday === today ? 'bg-[#2dbab2]/20 ring-1 ring-[#2dbab2]/60' : 'bg-white/[0.04]'"
                :style="{ animationDelay: `${index * 0.07}s` }">
                <p class="text-center text-[2vh] font-semibold uppercase tracking-wider"
                    :class="day.weekday === today ? 'text-[#2dbab2]' : 'text-white/60'">{{ dayName(day.weekday) }}</p>
                <ul class="mt-[1.2vh] space-y-[1vh]">
                    <li v-for="activity in day.activities.slice(0, MAX_PER_DAY)" :key="`${activity.time}${activity.title}`" class="text-[1.7vh] leading-tight">
                        <span class="block font-semibold tabular-nums text-white/60">{{ activity.time ?? '' }}</span>
                        <span class="flex items-start gap-[0.5vh] font-light">
                            <Icon v-if="activityIcon(activity.icon)" :name="activityIcon(activity.icon)!" class="mt-[0.2vh] shrink-0" />
                            <span data-fit class="line-clamp-2 min-w-0 flex-1 hyphens-auto" :lang="lang">{{ activity.title }}</span>
                        </span>
                    </li>
                    <li v-if="day.activities.length > MAX_PER_DAY" class="text-[1.6vh] text-white/40">
                        +{{ day.activities.length - MAX_PER_DAY }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { activityIcon, type ScreenActivity } from '@/composables/infoScreen'

/** The whole week's program, Monday first, today marked. */
const props = defineProps<{
    week: { weekday: number; activities: ScreenActivity[] }[]
    today: number
    locale: string
}>()

const MAX_PER_DAY = 5

// For hyphenation of long words in the narrow columns.
const lang = computed(() => props.locale.split('-')[0])

/**
 * Long words in the narrow columns are hyphenated where the browser has a
 * dictionary for the language (Danish, Swedish and Norwegian in Chrome). Where it
 * has none (English in some browsers), a word too wide for its column would be cut
 * without a hyphen, so that title's text is made just small enough to fit instead.
 */
const root = ref<HTMLElement | null>(null)
const MIN_SCALE = 0.6

/** Width of a word in the title's own font, measured inside the title so the font is inherited. */
function wordWidth(el: HTMLElement, word: string): number {
    const probe = document.createElement('span')
    probe.textContent = word
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap'
    el.appendChild(probe)
    const width = probe.offsetWidth
    probe.remove()
    return width
}

/** Whether the browser hyphenates this word to fit `width` (it has a dictionary for the language). */
function hyphenates(el: HTMLElement, word: string, width: number): boolean {
    const probe = document.createElement('div')
    probe.textContent = word
    probe.style.cssText = `position:absolute;visibility:hidden;width:${width}px;hyphens:auto;overflow-wrap:normal;white-space:normal`
    el.appendChild(probe)
    const fits = probe.scrollWidth <= width + 1
    probe.remove()
    return fits
}

function fitTitles() {
    root.value?.querySelectorAll<HTMLElement>('[data-fit]').forEach((el) => {
        el.style.fontSize = ''
        const width = el.clientWidth
        if (!width) return
        const words = (el.textContent ?? '').split(/\s+/).filter(Boolean)
        const longest = words.reduce((best, word) => Math.max(best, wordWidth(el, word)), 0)
        const widest = words.find((word) => wordWidth(el, word) === longest) ?? ''
        if (longest <= width || hyphenates(el, widest, width)) return
        const size = parseFloat(getComputedStyle(el).fontSize)
        el.style.fontSize = `${Math.max(MIN_SCALE, (width - 1) / longest) * size}px`
    })
}

// Again once the web font has loaded: the fallback font is narrower, so a word that
// fits at first can be too wide afterwards.
let refitTimer: ReturnType<typeof setTimeout> | null = null
onMounted(() => {
    nextTick(fitTitles)
    document.fonts?.ready.then(fitTitles)
    document.fonts?.addEventListener('loadingdone', fitTitles)
    refitTimer = setTimeout(fitTitles, 1500)
})
onBeforeUnmount(() => {
    document.fonts?.removeEventListener('loadingdone', fitTitles)
    if (refitTimer) clearTimeout(refitTimer)
})
watch(() => [props.week, props.locale], () => nextTick(fitTitles), { deep: true })

// ISO weekday to a short local name: 2024-01-01 was a Monday.
function dayName(weekday: number): string {
    return new Date(Date.UTC(2024, 0, weekday)).toLocaleDateString(props.locale, { weekday: 'short', timeZone: 'UTC' }).replace('.', '')
}
</script>

<style scoped>
.day {
    animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes rise {
    from {
        opacity: 0;
        transform: translateY(2vh);
    }
}

@media (prefers-reduced-motion: reduce) {
    .day {
        animation: none;
    }
}
</style>
