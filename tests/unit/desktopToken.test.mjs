/**
 * Unit tests for composables/useDesktopToken.ts -- the desktop "logged out
 * again" reports: a 401 from any single request cleared the session, and on
 * desktop that also deleted the token the Electron shell keeps on disk, so one
 * refused request out of the dozen a page fires ended the session for good.
 *
 * The shell now verifies an unauthorized clear against the API and answers
 * false when the session turned out to still be alive. These pin that the
 * composable passes the reason through, honours that answer, and that none of
 * it changed anything on the web.
 *
 * No server, no browser, no build step: Node 22+ strips the composable's type
 * annotations at import time. Run with:
 *
 *   node --test tests/unit/desktopToken.test.mjs
 */
import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

function fakeLocalStorage() {
    const store = new Map()

    return {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
        has: (key) => store.has(key),
    }
}

/** The bridge citizenone-desktop's preload exposes, with the calls recorded. */
function fakeDesktop({ clearAnswer = true } = {}) {
    const calls = []

    return {
        calls,
        bridge: {
            isDesktop: true,
            auth: {
                setToken: async (token) => { calls.push(['setToken', token]) },
                clearToken: async (reason) => {
                    calls.push(['clearToken', reason])

                    return clearAnswer
                },
            },
        },
    }
}

let clearSessionToken
let setSessionToken

beforeEach(async () => {
    globalThis.localStorage = fakeLocalStorage()
    globalThis.window = { localStorage: globalThis.localStorage }

    // Module state is per-import and there is none here, but re-importing keeps
    // each test honest about what it set up.
    const composable = await import('../../composables/useDesktopToken.ts')
    clearSessionToken = composable.clearSessionToken
    setSessionToken = composable.setSessionToken
})

describe('clearSessionToken on the web', () => {
    test('clears the token and reports that it did', async () => {
        localStorage.setItem('_token', 'a-web-session-token')

        assert.equal(await clearSessionToken(), true)
        assert.equal(localStorage.getItem('_token'), null)
    })

    test('a 401-driven clear behaves exactly like a sign-out', async () => {
        localStorage.setItem('_token', 'a-web-session-token')

        assert.equal(await clearSessionToken('unauthorized'), true)
        assert.equal(localStorage.getItem('_token'), null)
    })
})

describe('clearSessionToken on the desktop', () => {
    test('signing out is carried out as asked', async () => {
        const desktop = fakeDesktop()
        window.citizenOneDesktop = desktop.bridge
        await setSessionToken('a-desktop-session-token')

        assert.equal(await clearSessionToken('logout'), true)
        assert.deepEqual(desktop.calls.at(-1), ['clearToken', 'logout'])
        assert.equal(localStorage.getItem('_token'), null)
    })

    test('defaults to a sign-out when no reason is given', async () => {
        const desktop = fakeDesktop()
        window.citizenOneDesktop = desktop.bridge

        await clearSessionToken()

        assert.deepEqual(desktop.calls.at(-1), ['clearToken', 'logout'])
    })

    test('a 401 the shell could not confirm leaves the session alone', async () => {
        const desktop = fakeDesktop({ clearAnswer: false })
        window.citizenOneDesktop = desktop.bridge
        await setSessionToken('a-desktop-session-token')

        assert.equal(await clearSessionToken('unauthorized'), false)
        assert.deepEqual(desktop.calls.at(-1), ['clearToken', 'unauthorized'])
        assert.equal(
            localStorage.getItem('_token'),
            'desktop-managed',
            'the placeholder must stay, or the next request goes out unauthenticated'
        )
    })

    test('a 401 the shell confirmed clears the session', async () => {
        const desktop = fakeDesktop({ clearAnswer: true })
        window.citizenOneDesktop = desktop.bridge
        await setSessionToken('a-desktop-session-token')

        assert.equal(await clearSessionToken('unauthorized'), true)
        assert.equal(localStorage.getItem('_token'), null)
    })

    test('a desktop build that predates the check still clears', async () => {
        const old = fakeDesktop()
        old.bridge.auth.clearToken = async () => undefined
        window.citizenOneDesktop = old.bridge
        await setSessionToken('a-desktop-session-token')

        assert.equal(await clearSessionToken('unauthorized'), true)
        assert.equal(localStorage.getItem('_token'), null)
    })
})
