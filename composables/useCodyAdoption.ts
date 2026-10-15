import { codyAdoptionService, type CodyAdoptionStatus } from '@/components/api/user/CodyAdoptionService'
import { userService } from '@/components/api/user/UserService'
import { useUserStore } from '@/store/user'

const DISMISS_DAYS = 14

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
    const trialBusy = useState<boolean>('cody-adoption-trial-busy', () => false)
    const trialError = useState<string>('cody-adoption-trial-error', () => '')
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

    // The user object carries has_ai_access, so Cody appears once it is re-read.
    async function refreshUser() {
        try {
            const response = await userService.getUser()
            if (response?.data) userStore.setUser(response.data)
        } catch (_) { /* the next request will pick it up */ }
    }

    async function startTrial(): Promise<boolean> {
        trialBusy.value = true
        trialError.value = ''
        try {
            await codyAdoptionService.startTrial()
            await refreshUser()
            await load(true)
            promptOpen.value = false
            return true
        } catch (error: any) {
            trialError.value = error?.status === 422 ? 'notAllowed' : 'failed'
            return false
        } finally {
            trialBusy.value = false
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

    function isDismissed(kind: 'banner' | 'trial'): boolean {
        void dismissTick.value
        try {
            const raw = localStorage.getItem(storageKey(kind))
            if (!raw) return false
            if (kind === 'trial') return raw === new Date().toDateString()
            return Date.now() - Number(raw) < DISMISS_DAYS * 86400000
        } catch (_) {
            return false
        }
    }

    function dismiss(kind: 'banner' | 'trial') {
        try {
            localStorage.setItem(storageKey(kind), kind === 'trial' ? new Date().toDateString() : String(Date.now()))
        } catch (_) { /* ignore */ }
        dismissTick.value++
    }

    const isAdmin = computed(() => !!status.value?.can_manage)
    const trialActive = computed(() => !!status.value?.trial?.active)
    const trialAvailable = computed(() => !!status.value?.trial?.available)
    const hasAccess = computed(() => !!userStore.getUser?.has_ai_access)

    return {
        status, isAdmin, trialActive, trialAvailable, hasAccess,
        requestState, trialBusy, trialError, promptOpen,
        load, startTrial, requestFromAdmin, isDismissed, dismiss,
    }
}
