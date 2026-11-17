// AW-2026-10212: the duty schedule's "Send email on changes" switch, shared by the
// page toolbar, the four schedule views (move-shift calls) and the edit form.
import { useUserStore } from '@/store/user'
import { readEmailOnChanges, writeEmailOnChanges } from '@/utils/scheduleEmailPreference'

function browserStorage(): Storage | null {
    try {
        return typeof window === 'undefined' ? null : window.localStorage
    } catch (e) {
        return null
    }
}

export function useScheduleEmailPreference() {
    const userStore = useUserStore() as any
    // Keyed by user, so signing in as someone else in the same tab never carries
    // the previous planner's choice over.
    const chosen = useState<Record<string, boolean>>('schedule-email-on-changes', () => ({}))
    const userId = computed<string>(() => userStore.getUser?.uuid ?? '')

    const emailOnChanges = computed<boolean>({
        get: () => userId.value in chosen.value
            ? chosen.value[userId.value]
            : readEmailOnChanges(browserStorage(), userId.value),
        set: (on: boolean) => {
            chosen.value[userId.value] = on
            writeEmailOnChanges(browserStorage(), userId.value, on)
        },
    })

    return { emailOnChanges }
}
