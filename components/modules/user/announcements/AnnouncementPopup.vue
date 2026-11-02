<template>
    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-y-3"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100" leave-to-class="opacity-0 translate-y-3">
        <section v-if="visible && item" :aria-label="$t(eyebrowKey(item.kind))"
            class="fixed bottom-5 left-4 z-[60] w-[368px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-xl"
            :class="props.leftOffsetClass">

            <!-- Feature or news with an image -->
            <div v-if="showsImage(item)" class="relative h-[148px] bg-[#f0faf9]">
                <img :src="item.image_url!" alt="" class="h-full w-full object-cover" />
                <button type="button" @click="dismiss" :aria-label="$t('close')"
                    class="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/85 text-slate-500 hover:bg-white hover:text-slate-800 transition-colors">
                    <Icon name="heroicons:x-mark" class="h-4 w-4" />
                </button>
            </div>

            <div class="flex items-start gap-x-3 p-4" :class="showsImage(item) ? 'pt-3' : ''">
                <div v-if="!showsImage(item)"
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon :name="item.kind === 'tip' ? 'ph:lightbulb' : item.kind === 'feature' ? 'ph:sparkle' : 'ph:megaphone'" class="h-5 w-5" />
                </div>
                <div class="min-w-0 flex-1">
                    <p class="text-[11px] font-semibold uppercase tracking-wider text-tertiary">
                        {{ item.kind === 'feature' && item.app_name ? item.app_name : $t(eyebrowKey(item.kind)) }}
                        <span v-if="queue" class="font-normal normal-case tracking-normal text-slate-400">
                            · {{ $t('announcements.queue', queue) }}
                        </span>
                    </p>
                    <p class="mt-0.5 text-[15px] font-semibold leading-snug text-slate-900">{{ item.title }}</p>
                    <p class="mt-1 text-sm leading-relaxed text-slate-600">{{ item.body }}</p>

                    <div class="mt-3 flex flex-wrap items-center gap-2">
                        <button v-if="primary" type="button" @click="act"
                            class="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
                            {{ primary.literal ?? $t(primary.key, primary.values ?? {}) }}
                        </button>
                        <button v-if="item.kind === 'tip'" type="button" @click="dismiss"
                            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-surface-100 transition-colors">
                            {{ $t('announcements.gotIt') }}
                        </button>
                        <button v-else type="button" @click="snooze"
                            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-surface-100 transition-colors">
                            {{ $t('announcements.later') }}
                        </button>
                    </div>
                </div>
                <button v-if="!showsImage(item)" type="button" @click="dismiss" :aria-label="$t('close')"
                    class="-mr-1 -mt-1 ml-auto rounded p-1 text-slate-400 hover:bg-surface-100 transition-colors">
                    <Icon name="heroicons:x-mark" class="h-4 w-4" />
                </button>
            </div>
        </section>
    </Transition>
</template>

<script setup lang="ts">
import { announcementService } from '@/components/api/user/AnnouncementService'
import { ctaTarget, ctaText, eyebrowKey, queueLabel, showsImage, type UserAnnouncement } from '@/composables/announcements'

/**
 * "Nyt fra CitizenOne" in the lower left corner: try the new app, a news item or a tip.
 *
 * It waits its turn in the shared prompt slot (usePromptSlot), so it never stacks on the
 * ⌘K tip, a tour or a survey, and it is held back while the layout says the corner is
 * busy. The backend already allows at most one a day; this shows that one, once.
 */
const props = defineProps({
    /** Moves the card past the sidebar, which the layout knows the width of. */
    leftOffsetClass: { type: String, default: '' },
    /** The layout's own reasons to wait, e.g. a missed-medicine alert. */
    heldBack: { type: Boolean, default: false },
})

// After the page has settled: never the first thing in front of someone who just logged in.
const START_DELAY_MS = 5000

const item = useState<UserAnnouncement | null>('announcement-popup-item', () => null)
const queued = useState<number>('announcement-popup-queued', () => 0)
const loaded = useState<boolean>('announcement-popup-loaded', () => false)
const done = useState<boolean>('announcement-popup-done', () => false)
const seenSent = useState<string | null>('announcement-popup-seen', () => null)

const wants = computed(() => !!item.value && !done.value)
const granted = usePromptSlot('announcement', wants)
const visible = computed(() => wants.value && granted.value && !props.heldBack)

const primary = computed(() => ctaText(item.value?.cta))
const queue = computed(() => queueLabel(queued.value))

let timer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
    if (loaded.value) return
    loaded.value = true
    timer = setTimeout(load, START_DELAY_MS)
})

onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
})

async function load() {
    try {
        const response = await announcementService.getNext()
        item.value = response?.data ?? null
        queued.value = response?.queued ?? 0
    } catch {
        // A message from us must never get in the way of the work.
        item.value = null
    }
}

// Counted as seen when it is actually on screen, not when it was fetched.
watch(visible, (now) => {
    if (now && item.value && seenSent.value !== item.value.uuid) {
        seenSent.value = item.value.uuid
        announcementService.markSeen(item.value.uuid).catch(() => {})
    }
}, { immediate: true })

function finish() {
    done.value = true
}

function dismiss() {
    const uuid = item.value?.uuid
    finish()
    if (uuid) announcementService.dismiss(uuid).catch(() => {})
}

function snooze() {
    const uuid = item.value?.uuid
    finish()
    if (uuid) announcementService.snooze(uuid).catch(() => {})
}

async function act() {
    const current = item.value
    if (!current?.cta) return
    const target = ctaTarget(current.cta.url)
    finish()
    announcementService.markClicked(current.uuid, current.cta.action).catch(() => {})
    if (!target) return
    if (target.kind === 'external') {
        window.open(target.url, '_blank', 'noopener')
    } else {
        await navigateTo(target.url)
    }
}
</script>
