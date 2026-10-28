import { codyAdoptionService, type CodyAdoptionStatus } from '@/components/api/user/CodyAdoptionService'
import { useUserStore } from '@/store/user'
import { demandCount, isBannerDismissed, parseDismissRecord, type NudgeEvent, type NudgeSurface } from '@/composables/codyNudge'

/**
 * Everything the "get Cody" prompts share: the status, the two actions, and the
 * dismissal memory. The status is fetched once per session and shared between
 * the banner, the topbar prompt and the app page.
 *
 * None of this is access control. The backend decides who may start a trial or
 * send a request; the UI only reflects the answer.
 */
export function useCodyAdoption() {
    const userStore = useUserStore() as any

    const status = useState<CodyAdoptionStatus | null>('cody-adoption-status', () => null)
    const loaded = useState<boolean>('cody-adoption-loaded', () => false)
    const requestState = useState<'idle' | 'sending' | 'sent' | 'recent' | 'no_admin' | 'error'>('cody-adoption-request', () => 'idle')
    const promptOpen = useState<boolean>('cody-adoption-prompt-open', () => false)
    const dismissTick = useState<number>('cody-adoption-dismiss-tick', () => 0)

    const userKey = computed(() => String(userStore.getUser?.uuid ?? userStore.getUser?.id ?? 'user'))

    async function load(force = false) {
        if (loaded.value && !force) return
        loaded.value = true
        try {
            status.value = await codyAdoptionService.getStatus()
            if (status.value?.requested_recently) requestState.value = 'recent'
        } catch (_) {
            // A missing reading must never block the page.
            status.value = null
        }
    }

    async function requestFromAdmin() {
        requestState.value = 'sending'
        try {
            const result = await codyAdoptionService.requestFromAdmin()
            if (result?.sent) requestState.value = 'sent'
            else if (result?.reason === 'no_admin') requestState.value = 'no_admin'
            else requestState.value = 'recent'
        } catch (_) {
            requestState.value = 'error'
        }
    }

    // Dismissal lives in localStorage per user. Storage can be blocked, so every
    // access is wrapped: a failure just means the banner shows again.
    function storageKey(kind: string) {
        return `cody-adoption-dismissed:${kind}:${userKey.value}`
    }

    // The banner and the seats banner remember the demand they were closed at, and come back
    // when more staff have asked since (codyNudge.isBannerDismissed).
    function isDismissed(kind: 'banner' | 'trial' | 'seats'): boolean {
        void dismissTick.value
        try {
            const raw = localStorage.getItem(storageKey(kind))
            if (!raw) return false
            if (kind === 'trial') return raw === new Date().toDateString()
            return isBannerDismissed(parseDismissRecord(raw), demandCount(status.value), Date.now())
        } catch (_) {
            return false
        }
    }

    function dismiss(kind: 'banner' | 'trial' | 'seats') {
        try {
            localStorage.setItem(storageKey(kind), kind === 'trial'
                ? new Date().toDateString()
                : JSON.stringify({ at: Date.now(), count: demandCount(status.value) }))
        } catch (_) { /* ignore */ }
        dismissTick.value++
    }

    // Measuring the nudges. Impressions are sent once per surface per session (the backend
    // also keeps one per day); a failure is ignored, a metric never blocks the page. A company
    // that has Cody is not in the buy funnel, so nothing but the seats banner is sent for it.
    const sentImpressions = useState<string[]>('cody-adoption-impressions', () => [])
    function recordNudge(event: NudgeEvent, surface: NudgeSurface) {
        const s = status.value
        if (!s) return
        if (surface !== 'seats' && s.company_has_cody) return
        if (event === 'impression') {
            if (sentImpressions.value.includes(surface)) return
            sentImpressions.value = [...sentImpressions.value, surface]
        }
        codyAdoptionService.recordEvent(event, surface).catch(() => { /* ignore */ })
    }

    const isAdmin = computed(() => !!status.value?.can_manage)
    const trialActive = computed(() => !!status.value?.trial?.active)
    const trialAvailable = computed(() => !!status.value?.trial?.available)
    const hasAccess = computed(() => !!userStore.getUser?.has_ai_access)

    // The Cody app page, where a trial is started (a card is needed) or Cody is
    // bought. Falls back to the store while the backend does not say which app.
    const appPath = computed(() => {
        const s: any = status.value
        const ref = s?.app_slug ?? s?.app_uuid
        return ref ? `/apps/${ref}` : '/apps'
    })

    return {
        appPath,
        status, isAdmin, trialActive, trialAvailable, hasAccess,
        requestState, promptOpen,
        load, requestFromAdmin, isDismissed, dismiss, recordNudge,
    }
}
