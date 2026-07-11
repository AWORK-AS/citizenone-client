<template>
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-[100]">
            <!-- Spotlight cutout around the target; the huge shadow dims the rest -->
            <div v-if="state.targetRect" class="absolute rounded-lg pointer-events-none transition-all duration-300"
                :style="spotlightStyle"></div>
            <!-- No target: plain dim overlay -->
            <div v-else class="absolute inset-0 bg-slate-900/60"></div>

            <!-- Click blocker so the page cannot be used mid-tour -->
            <div class="absolute inset-0" @click.self="close"></div>

            <!-- Popover anchored to the target (or centered without one) -->
            <div class="absolute w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl p-6 transition-all duration-300"
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
                            @click="state.stepIndex--">
                            {{ $t('back') }}
                        </FormButton>
                        <FormButton v-if="state.stepIndex < steps.length - 1" buttonStyle="primary" class="w-fit px-4"
                            @click="state.stepIndex++">
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

const state = reactive({
    stepIndex: 0,
    targetRect: null as { top: number, left: number, width: number, height: number } | null,
})

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
    if (!rect) {
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const left = Math.min(Math.max(rect.left + rect.width / 2 - POPOVER_WIDTH / 2, 16), viewportWidth - POPOVER_WIDTH - 16)
    const spaceBelow = viewportHeight - (rect.top + rect.height)
    if (spaceBelow > POPOVER_HEIGHT_ESTIMATE + 32) {
        return { top: `${rect.top + rect.height + 20}px`, left: `${left}px` }
    }
    return { bottom: `${viewportHeight - rect.top + 20}px`, left: `${left}px` }
})

async function measure() {
    state.targetRect = null
    const selector = currentStep.value?.selector
    if (!selector) return
    const element = document.querySelector(selector) as HTMLElement | null
    if (!element) return
    element.scrollIntoView({ block: 'center' })
    await nextTick()
    // Wait a beat for scroll/layout to settle before measuring
    await new Promise((resolve) => setTimeout(resolve, 150))
    const rect = element.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
        state.targetRect = { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    }
}

watch([() => state.stepIndex, () => props.appKey, isOpen], () => {
    state.stepIndex = Math.min(state.stepIndex, Math.max(steps.value.length - 1, 0))
    // The target may render after the page settles (tables, async data)
    setTimeout(measure, 100)
    setTimeout(measure, 800)
}, { immediate: true })

function handleResize() {
    measure()
}

onMounted(() => {
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

function close() {
    emit('close')
}
</script>
