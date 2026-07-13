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
                :style="popoverStyle" v-if="currentStep">
                <div class="flex items-start gap-x-3">
                    <div class="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon :name="currentStep.icon" class="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div class="grow">
                        <h3 class="text-base font-semibold text-gray-900">{{ $t(currentStep.titleKey) }}</h3>
                        <p class="mt-1 text-sm text-gray-600">{{ $t(currentStep.textKey) }}</p>
                    </div>
                    <button type="button" class="shrink-0 text-gray-400 hover:text-gray-600" @click="close">
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
                            @click="goTo(state.stepIndex - 1)">
                            {{ $t('back') }}
                        </FormButton>
                        <FormButton v-if="state.stepIndex < steps.length - 1" buttonStyle="primary" class="w-fit px-4"
                            @click="goTo(state.stepIndex + 1)">
                            {{ $t('next') }}
                        </FormButton>
                        <FormButton v-else buttonStyle="primary" class="w-fit px-4" @click="close">
                            {{ $t('appTours.getStarted') }}
                        </FormButton>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { useAppTours } from '@/composables/useAppTours'

const props = defineProps({
    appKey: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['close'])

const { getTour } = useAppTours()

const POPOVER_WIDTH = 380
const POPOVER_HEIGHT_ESTIMATE = 190
const SPOTLIGHT_PADDING = 8
const EDGE_MARGIN = 16

const state = reactive({
    stepIndex: 0,
    targetRect: null as { top: number, left: number, width: number, height: number } | null,
})

// Retry timers for a target that renders after the page settles, plus the
// live scroll/resize reposition handler - all tracked so we can clean up.
let retryTimers: ReturnType<typeof setTimeout>[] = []
let stopped = false

const steps = computed(() => getTour(props.appKey)?.steps ?? [])
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

// Reposition against the current target without scrolling the page. Keeps the
// previous rect if the element is briefly gone so the spotlight never flickers.
function reposition() {
    if (stopped) return
    const selector = currentStep.value?.selector
    if (!selector) {
        state.targetRect = null
        return
    }
    const element = document.querySelector(selector) as HTMLElement | null
    if (!element) return
    const rect = element.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
        state.targetRect = { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    }
}

// Called on step change: scroll the target into view once, then reposition and
// keep retrying for a while in case it renders after an API round-trip.
function focusStep() {
    clearRetries()
    state.targetRect = null
    const selector = currentStep.value?.selector
    if (!selector) return

    const tryFocus = (doScroll: boolean) => {
        if (stopped) return
        const element = document.querySelector(selector) as HTMLElement | null
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
}

function clearRetries() {
    retryTimers.forEach(clearTimeout)
    retryTimers = []
}

function goTo(index: number) {
    state.stepIndex = index
    focusStep()
}

watch([() => props.appKey, isOpen], () => {
    if (!isOpen.value) return
    state.stepIndex = 0
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

function close() {
    emit('close')
}
</script>
