// "See the system as a role": an Admin looks at the app as one of the
// company's roles, read-only. Kept for the tab only (sessionStorage), and sent
// on every API request as X-Preview-Role (BaseAPIService.authHeader).
const KEY = 'previewRole'

export type PreviewRole = { id: number, name: string }

export function readPreviewRole(): PreviewRole | null {
    try {
        const raw = sessionStorage.getItem(KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

export function startPreviewRole(role: PreviewRole) {
    sessionStorage.setItem(KEY, JSON.stringify(role))
    // A full reload, so every cached list and the menu are read as the role.
    window.location.assign('/')
}

export function endPreviewRole() {
    sessionStorage.removeItem(KEY)
    window.location.assign('/settings/roles')
}
