/**
 * Roadmap #375: the helpers behind the pinned-message banner
 * (composables/pinnedMessages.ts), shared by the staff chat and the four
 * portal chats.
 *
 *   node --test tests/unit/pinnedMessages.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    pinnedMessagesOf, pinnedPreviewText, nextPinIndex, clampPinIndex, syncPinnedAt,
    jumpToPinnedMessage, MAX_PAGES_TO_FIND_PIN,
} from '../../composables/pinnedMessages.ts'

test('a chat without pinned_messages (older backend, failed fetch) has no pins', () => {
    assert.deepEqual(pinnedMessagesOf(undefined), [])
    assert.deepEqual(pinnedMessagesOf({ data: {} }), [])
    assert.deepEqual(pinnedMessagesOf({ data: { pinned_messages: null } }), [])
    assert.deepEqual(pinnedMessagesOf({ data: { pinned_messages: 'x' } }), [])
    assert.deepEqual(pinnedMessagesOf({ data: { pinned_messages: [{ uuid: 'a' }, null, {}] } }), [{ uuid: 'a' }])
})

test('the preview is one line of plain text, shortened', () => {
    assert.equal(pinnedPreviewText({ message: 'Hello<br>there\n  <b>you</b> &amp; me' }), 'Hello there you & me')
    assert.equal(pinnedPreviewText({ message: null }), '')
    assert.equal(pinnedPreviewText(undefined), '')
    const long = pinnedPreviewText({ message: 'a'.repeat(300) }, 20)
    assert.equal(long.length, 20)
    assert.ok(long.endsWith('…'))
})

test('the banner cycles through the pins and stays in range', () => {
    assert.equal(nextPinIndex(0, 3), 1)
    assert.equal(nextPinIndex(2, 3), 0)
    assert.equal(nextPinIndex(0, 0), 0)
    assert.equal(clampPinIndex(2, 2), 1)
    assert.equal(clampPinIndex(-1, 2), 0)
    assert.equal(clampPinIndex(5, 0), 0)
})

test('loaded messages follow the pin list', () => {
    const messages = [
        { uuid: 'a', pinned_at: null },
        { uuid: 'b', pinned_at: '2026-11-23T10:00:00Z' },
        { uuid: 'c' },
    ]
    const changed = syncPinnedAt(messages, [{ uuid: 'a', pinned_at: '2026-11-23T11:00:00Z' }])
    assert.equal(changed, 2)
    assert.equal(messages[0].pinned_at, '2026-11-23T11:00:00Z')
    assert.equal(messages[1].pinned_at, null)
    assert.equal(messages[2].pinned_at, undefined, 'untouched when already not pinned')
})

function fakeList(pages, { found = true } = {}) {
    const loaded = [...pages[0]]
    let page = 0
    const scrolled = []
    return {
        scrolled,
        options: {
            container: () => ({
                querySelector: (selector) => {
                    const uuid = selector.match(/data-uuid="([^"]+)"/)[1]
                    return found && loaded.includes(uuid) ? { scrollIntoView: () => scrolled.push(uuid) } : null
                },
            }),
            hasMessage: (uuid) => loaded.includes(uuid),
            isLastPage: () => page >= pages.length - 1,
            loadOlder: async () => { page++; loaded.unshift(...(pages[page] ?? [])) },
            settle: async () => {},
        },
        pagesLoaded: () => page,
    }
}

test('go to message loads older pages until the message is there', async () => {
    const list = fakeList([['m5', 'm6'], ['m3', 'm4'], ['m1', 'm2']])
    assert.equal(await jumpToPinnedMessage('m3', list.options), true)
    assert.equal(list.pagesLoaded(), 1)
    assert.deepEqual(list.scrolled, ['m3'])
})

test('go to message stops at the last page when the message is gone', async () => {
    const list = fakeList([['m5'], ['m3'], ['m1']])
    assert.equal(await jumpToPinnedMessage('deleted', list.options), false)
    assert.equal(list.pagesLoaded(), 2)
    assert.deepEqual(list.scrolled, [])
})

test('go to message never loops forever on broken paging', async () => {
    let loads = 0
    const ok = await jumpToPinnedMessage('x', {
        container: () => null,
        hasMessage: () => false,
        isLastPage: () => false,
        loadOlder: async () => { loads++ },
        settle: async () => {},
    })
    assert.equal(ok, false)
    assert.equal(loads, MAX_PAGES_TO_FIND_PIN)
})

test('go to message stops at the first page that fails to load', async () => {
    let loads = 0
    const ok = await jumpToPinnedMessage('x', {
        container: () => null,
        hasMessage: () => false,
        isLastPage: () => false,
        loadOlder: async () => { loads++; return false },
        settle: async () => {},
    })
    assert.equal(ok, false)
    assert.equal(loads, 1)
})
