/**
 * Sign out of a suspended company's session.
 *
 * Clearing the local token alone leaves the Sanctum token alive on the server, so it is
 * revoked first (`/auth/logout` still answers for a suspended company) and the local token
 * is cleared whether or not that call worked: an unreachable server must not trap the user.
 *
 * Takes its collaborators as arguments so the order can be tested without Nuxt.
 */
export async function signOutRevoking(deps: {
    logout: () => Promise<unknown>
    clearLocal: () => Promise<unknown> | unknown
    done: () => void
}): Promise<{ revoked: boolean }> {
    let revoked = false

    try {
        await deps.logout()
        revoked = true
    } catch (_) {
        // The server could not be told; the local session still ends below.
    }

    try {
        await deps.clearLocal()
    } finally {
        deps.done()
    }

    return { revoked }
}
