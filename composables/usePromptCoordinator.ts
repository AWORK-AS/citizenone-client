// Shared "one prompt at a time" slot. The user layout is rebuilt on every page change, so the
// state lives in useState. Usage in a component that shows something unasked:
//
//   const granted = usePromptSlot('cmdkTip', wantsToShow)   // Ref<boolean>
//   <div v-if="wantsToShow && granted">
//
// Dismissing (wantsToShow going false) hands the slot on. None of this is access control.

import {
    arbitrate,
    initialPromptState,
    release,
    type PromptId,
    type PromptState,
} from '@/composables/promptQueue'

export function usePromptSlot(id: PromptId, wants: Ref<boolean>): ComputedRef<boolean> {
    const state = useState<PromptState>('promptQueue', () => initialPromptState())
    const requested = useState<PromptId[]>('promptQueueRequested', () => [])
    const sessionStart = useState<number>('promptQueueStart', () => Date.now())

    function evaluate() {
        state.value = arbitrate(state.value, requested.value, Date.now(), sessionStart.value)
    }

    let timer: ReturnType<typeof setInterval> | null = null
    function stopTimer() {
        if (timer) clearInterval(timer)
        timer = null
    }

    // Waiting prompts re-check now and then: a cooldown or a minimum age runs out with time.
    watch(wants, (value, previous) => {
        requested.value = value
            ? [...requested.value.filter(r => r !== id), id]
            : requested.value.filter(r => r !== id)
        if (value) {
            evaluate()
            if (state.value.active !== id && !timer) timer = setInterval(() => {
                evaluate()
                if (state.value.active === id) stopTimer()
            }, 5000)
        } else {
            stopTimer()
            // Also when this is a fresh layout that no longer wants what the old one held.
            if (previous || state.value.active === id) state.value = release(state.value, id, Date.now())
            evaluate()
        }
    }, { immediate: true })

    // A navigation unmounts the layout: stop asking, but keep the slot, so the prompt is
    // still there on the next page.
    onBeforeUnmount(() => {
        stopTimer()
        requested.value = requested.value.filter(r => r !== id)
    })

    return computed(() => state.value.active === id)
}
