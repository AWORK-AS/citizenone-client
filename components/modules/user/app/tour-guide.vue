<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-[130]" @wheel.prevent @touchmove.prevent>
            <!-- Spotlight cutout around the target; the huge shadow dims the rest -->
            <div v-if="state.targetRect" class="absolute rounded-lg pointer-events-none transition-all duration-200"
                :style="spotlightStyle"></div>
            <!-- No target: plain dim overlay -->
            <div v-else class="absolute inset-0 bg-slate-900/60"></div>

            <!-- Popover anchored to the target (or centered without one) -->
            <div class="absolute w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl p-6 transition-all duration-200"
                :style="popoverStyle" v-if="currentStep && !state.waiting">
                <div class="flex items-start gap-x-3">
                    <!-- Milo's welcome tour: the bubble speaks as Milo -->
                    <div v-if="mascot" aria-hidden="true"
                        class="w-10 h-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center text-base font-semibold">
                        M
                    </div>
                    <div v-else class="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon :name="currentStep.icon" class="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div class="grow">
                        <h3 v-if="mascot" class="text-base font-semibold text-gray-900">{{ $t('welcomeTour.name') }}</h3>
                        <h3 v-else class="text-base font-semibold text-gray-900">{{ $t(currentStep.titleKey) }}</h3>
                        <p class="mt-1 text-sm text-gray-600">{{ $t(currentStep.textKey) }}</p>
                    </div>
                    <Tooltip v-if="mascot" :text="$t('welcomeTour.skipHelp')" position="left">
                        <button type="button" class="shrink-0 text-gray-400 hover:text-gray-600"
                            :aria-label="$t('welcomeTour.skip')" @click="close(false)">
                            <Icon name="heroicons:x-mark" class="h-5 w-5" aria-hidden="true" />
                        </button>
                    </Tooltip>
                    <button v-else type="button" class="shrink-0 text-gray-400 hover:text-gray-600" @click="close(false)">
                        <Icon name="heroicons:x-mark" class="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                <div class="mt-4 flex items-center justify-between">
                    <div class="flex items-center gap-x-1.5">
                        <span v-for="(step, index) in steps" :key="index"
                            class="h-1.5 rounded-full transition-all"
                            :class="index === state.stepIndex ? 'w-5 bg-primary' : 'w-1.5 bg-gray-300'" />
                    </div>
                    <div class="flex gap-x-2">
                        <FormButton v-if="state.stepIndex > 0" buttonStyle="cancel" class="w-fit px-4"
                            @click="goTo(state.stepIndex - 1, -1)">
                            {{ $t('back') }}
                        </FormButton>
                        <FormButton v-if="state.stepIndex < steps.length - 1" buttonStyle="primary" class="w-fit px-4"
                            @click="goTo(state.stepIndex + 1, 1)">
                            {{ $t('next') }}
                        </FormButton>
                        <Tooltip v-else-if="mascot" :text="$t('welcomeTour.finishHelp')" position="top">
                            <FormButton buttonStyle="primary" class="w-fit px-4" @click="close(true)">
                                {{ $t('welcomeTour.finish') }}
                            </FormButton>
                        </Tooltip>
                        <FormButton v-else buttonStyle="primary" class="w-fit px-4" @click="close(true)">
                            {{ $t('appTours.getStarted') }}
                        </FormButton>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useAppTours } from '@/composables/useAppTours'

const props = defineProps({
    appKey: {
        type: String,
        default: '',
    },
    // Steps handed in by the caller instead of looked up by appKey (Milo's
    // welcome tour). These may name a `route` and are skipped when their target
    // never shows up.
    customSteps: {
        type: Array as PropType<any[] | null>,
        default: null,
    },
    // The bubble speaks as Milo: name and an "M" avatar, text only.
    mascot: {
        type: Boolean,
        default: false,
    },
    // Where to resume after the layout was rebuilt by a page change.
    startIndex: {
        type: Number,
        default: 0,
    },
})

// close(true) = reached the end, close(false) = dismissed.
const emit = defineEmits<{ (e: 'close', finished: boolean): void, (e: 'step', index: number): void }>()

const { getTour } = useAppTours()
const router = useRouter()

const POPOVER_WIDTH = 380
const POPOVER_HEIGHT_ESTIMATE = 190
const SPOTLIGHT_PADDING = 8
const EDGE_MARGIN = 16

const state = reactive({
    stepIndex: props.startIndex,
    targetRect: null as { top: number, left: number, width: number, height: number } | null,
    // A welcome-tour step whose target has not rendered yet: show the dim page
    // without the bubble, so the words never sit over the page they don't describe.
    waiting: false,
})

// Retry timers for a target that renders after the page settles, plus the
// live scroll/resize reposition handler - all tracked so we can clean up.
let retryTimers: ReturnType<typeof setTimeout>[] = []
let stopped = false

const steps = computed<any[]>(() => props.customSteps ?? getTour(props.appKey)?.steps ?? [])
const skipMissing = computed(() => !!props.customSteps)
let direction = 1
const currentStep = computed(() => steps.value[state.stepIndex])
const isOpen = computed(() => steps.value.length > 0)

const spotlightStyle = computed(() => {
    const rect = state.targetRect
    if (!rect) return {}
    return {
        top: `${rect.top - SPOTLIGHT_PADDING}px`,
        left: `${rect.left - SPOTLIGHT_PADDING}px`,
        width: `${rect.width + SPOTLIGHT_PADDING * 2}px`,
        height: `${rect.height + SPOTLIGHT_PADDING * 2}px`,
        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.6)',
        border: '2px solid rgba(255, 255, 255, 0.9)',
    }
})

const popoverStyle = computed(() => {
    const rect = state.targetRect
    if (!rect || typeof window === 'undefined') {
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    // Guard the inverted range on very narrow viewports (upper < lower).
    const maxLeft = Math.max(EDGE_MARGIN, viewportWidth - POPOVER_WIDTH - EDGE_MARGIN)
    const left = Math.max(EDGE_MARGIN, Math.min(rect.left + rect.width / 2 - POPOVER_WIDTH / 2, maxLeft))
    const spaceBelow = viewportHeight - (rect.top + rect.height)
    if (spaceBelow > POPOVER_HEIGHT_ESTIMATE + 32) {
        return { top: `${rect.top + rect.height + 20}px`, left: `${left}px` }
    }
    return { bottom: `${viewportHeight - rect.top + 20}px`, left: `${left}px` }
})

// The first match that is actually on screen: the sidebar renders once for the
// desktop rail and once for the mobile drawer, and only one of them has a size.
function findTarget(selector: string): HTMLElement | null {
    const all = Array.from(document.querySelectorAll(selector)) as HTMLElement[]
    return all.find((el) => {
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0
    }) ?? null
}

// Reposition against the current target without scrolling the page. Keeps the
// previous rect if the element is briefly gone so the spotlight never flickers.
function reposition() {
    if (stopped) return
    const selector = currentStep.value?.selector
    if (!selector) {
        state.targetRect = null
        return
    }
    const element = findTarget(selector)
    if (!element) return
    const rect = element.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
        state.targetRect = { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        state.waiting = false
    }
}

// Called on step change: scroll the target into view once, then reposition and
// keep retrying for a while in case it renders after an API round-trip.
// Bumped on every step change, so a navigation that resolves after the user
// has moved on doesn't start timers for a step that is no longer showing.
let focusToken = 0

async function focusStep() {
    clearRetries()
    state.targetRect = null
    const token = ++focusToken
    const selector = currentStep.value?.selector
    state.waiting = !!selector && skipMissing.value
    // The wait for the target starts once the page is there: a cold page can
    // take seconds to load, and counting from the click skipped steps whose
    // target was simply still on its way.
    const route = currentStep.value?.route
    if (route && router.currentRoute.value.path !== route) {
        try { await navigateTo(route) } catch (e) { /* the skip timer below handles it */ }
        if (stopped || token !== focusToken) return
    }
    if (!selector) return

    const tryFocus = (doScroll: boolean) => {
        if (stopped) return
        const element = findTarget(selector)
        if (element) {
            if (doScroll) element.scrollIntoView({ block: 'center', behavior: 'smooth' })
            reposition()
        }
    }

    tryFocus(true)
    // Retry for targets that mount late (cold page load right after purchase).
    ;[150, 400, 800, 1500, 2500].forEach((delay) => {
        retryTimers.push(setTimeout(() => tryFocus(!state.targetRect), delay))
    })
    // A target that never appears (module off, no permission, small screen)
    // must not leave the user staring at a dim page.
    if (skipMissing.value) {
        retryTimers.push(setTimeout(() => {
            if (stopped || state.targetRect) return
            skipStep()
        }, 3200))
    }
}

function skipStep() {
    const next = state.stepIndex + direction
    if (next >= 0 && next < steps.value.length) goTo(next, direction)
    else if (direction > 0) close(true)
    else goTo(Math.min(1, steps.value.length - 1), 1)
}

function clearRetries() {
    retryTimers.forEach(clearTimeout)
    retryTimers = []
}

function goTo(index: number, dir = 1) {
    direction = dir
    state.stepIndex = index
    emit('step', index)
    focusStep()
}

// A different app's tour starts from its first step.
watch(() => props.appKey, () => { state.stepIndex = props.startIndex })

watch(isOpen, () => {
    if (!isOpen.value) return
    if (state.stepIndex >= steps.value.length) state.stepIndex = 0
    nextTick(focusStep)
}, { immediate: true })

onMounted(() => {
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    nextTick(focusStep)
})

onUnmounted(() => {
    stopped = true
    clearRetries()
    window.removeEventListener('resize', reposition)
    window.removeEventListener('scroll', reposition, true)
})

function close(finished = false) {
    emit('close', finished)
}
</script>
