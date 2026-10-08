import { userService } from '@/components/api/user/UserService'
import { useUserStore } from '@/store/user'

const POLL_MS = 60_000

/**
 * "Your shift ended - are you still working?" prompt for the clock-in timer.
 *
 * Shared state, so the single modal in the layout is the only thing that renders it - the
 * clock widget itself is mounted several times and must not each show a popup.
 * The server decides when the prompt is due (its clock and timezone are the ones the schedule
 * uses), so the browser only asks it and never compares times itself.
 */
export function useShiftEndPrompt() {
    const userStore = useUserStore() as any
    const isOpen = useState<boolean>('shiftEndPromptOpen', () => false)
    const shiftEndAt = useState<string | null>('shiftEndPromptShiftEnd', () => null)
    const isAnswering = useState<boolean>('shiftEndPromptAnswering', () => false)
    const hasAnswerFailed = useState<boolean>('shiftEndPromptAnswerFailed', () => false)

    let pollTimer: number | null = null

    // Every running timer, not only ones already linked to a shift: the server links a timer
    // to a shift added after clock-in, and this page would not hear about it until a reload.
    const isWatching = () => !!userStore.getUser?.is_checked_in

    async function refreshUser() {
        const response = await userService.getUser()
        if (response?.data) {
            userStore.setUser(response.data)
        }
    }

    async function check() {
        if (!isWatching() || isAnswering.value) return
        try {
            const response = await userService.shiftEndStatus()
            const status = response?.data
            if (isOpen.value) {
                // Answered elsewhere (a "Yes" on the phone, another tab): nothing left to ask here.
                if (status && !status.prompt_due) {
                    isOpen.value = false
                    await refreshUser()
                }
                return
            }
            if (status?.prompt_due) {
                shiftEndAt.value = status.shift_end_at ?? null
                hasAnswerFailed.value = false
                isOpen.value = true
            } else if (status && !status.is_checked_in) {
                // Stopped elsewhere (another tab, the phone, or automatically).
                await refreshUser()
            }
        } catch {
            // A failed check is retried on the next tick.
        }
    }

    async function answer(stillWorking: boolean) {
        isAnswering.value = true
        hasAnswerFailed.value = false
        try {
            await userService.shiftEndResponse({ still_working: stillWorking })
            isOpen.value = false
            await refreshUser()
        } catch {
            // Not saved: keep the question up so it can be answered again.
            hasAnswerFailed.value = true
        } finally {
            isAnswering.value = false
        }
    }

    function onVisible() {
        if (document.visibilityState === 'visible') check()
    }

    function start() {
        if (pollTimer) return
        pollTimer = window.setInterval(check, POLL_MS)
        document.addEventListener('visibilitychange', onVisible)
        window.addEventListener('focus', check)
        check()
    }

    function stop() {
        if (pollTimer) {
            clearInterval(pollTimer)
            pollTimer = null
        }
        document.removeEventListener('visibilitychange', onVisible)
        window.removeEventListener('focus', check)
    }

    return { isOpen, shiftEndAt, isAnswering, hasAnswerFailed, start, stop, check, answer }
}
