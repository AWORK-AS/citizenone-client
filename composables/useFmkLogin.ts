import { shallowRef } from 'vue'
import { fMKService } from '@/components/api/user/FMKService'

export interface FmkLoginChoice { key: string, type: 'national_role' | 'authorisation', label: string }
export interface FmkLoginSession {
    logged_in: boolean
    name: string | null
    role_label: string | null
    expires_at: string | null
    choices: FmkLoginChoice[] | null
}

/**
 * The staff member's FMK login (MitID Erhverv via SEB). Logging in leaves the
 * app for SEB and comes back to `returnPath` with ?fmk_login=ok|choose|error.
 */
export function useFmkLogin() {
    const session = shallowRef<FmkLoginSession | null>(null)
    const pending = shallowRef(false)
    const error = shallowRef<string | null>(null)

    async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
        pending.value = true
        error.value = null
        try {
            return await action()
        } catch (cause: any) {
            error.value = cause?.message ?? String(cause)
        } finally {
            pending.value = false
        }
    }

    async function refresh() {
        await run(async () => {
            const response = await fMKService.getLoginSession()
            session.value = (response?.data ?? response) as FmkLoginSession
        })
    }

    async function login(returnPath: string) {
        const response = await run(() => fMKService.startLogin(returnPath))
        if (response?.redirect_url) window.location.assign(response.redirect_url)
    }

    async function chooseRole(key: string) {
        await run(async () => {
            const response = await fMKService.chooseLoginRole(key)
            session.value = (response?.data ?? response) as FmkLoginSession
        })
    }

    async function logout() {
        await run(async () => {
            await fMKService.logout()
            session.value = { logged_in: false, name: null, role_label: null, expires_at: null, choices: null }
        })
    }

    return { session, pending, error, refresh, login, chooseRole, logout }
}
