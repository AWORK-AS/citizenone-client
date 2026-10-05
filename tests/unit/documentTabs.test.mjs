/**
 * Unit tests for composables/documentTabs.ts -- opening one or many documents in
 * tabs of their own.
 *
 * A browser opens a tab only as the direct result of a click. The tabs used to
 * be opened after each file had downloaded, so the browser blocked them and the
 * file was saved instead. These tests hold that every tab is taken before the
 * first download is awaited, and that a refused tab is reported, not saved.
 *
 *   node --test tests/unit/documentTabs.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { openDocumentsInTabs, canOpenInBrowser, mayOpenInBrowser } = await import('../../composables/documentTabs.ts')

function fakeTab() {
    return {
        closed: false,
        location: { href: '' },
        document: { title: '', body: { textContent: '' } },
        close() { this.closed = true },
    }
}

// A browser that grants the first `allowed` tabs and refuses the rest, and
// records whether each request came before any download had started.
function fakeBrowser({ allowed = Infinity } = {}) {
    const browser = { tabs: [], requests: 0, downloadsStarted: 0, openedDuringDownload: 0, saved: [], revoked: [] }
    browser.openWindow = () => {
        browser.requests++
        if (browser.downloadsStarted > 0) browser.openedDuringDownload++
        if (browser.requests > allowed) return null
        const tab = fakeTab()
        browser.tabs.push(tab)
        return tab
    }
    browser.options = (load) => ({
        load: async (document) => {
            browser.downloadsStarted++
            await new Promise((resolve) => setTimeout(resolve, 1))
            return load(document)
        },
        fileName: (document) => document.name,
        save: (blob, name) => browser.saved.push(name),
        waitingText: 'Åbner dokument…',
        openWindow: browser.openWindow,
        createObjectURL: (blob) => `blob:test/${blob.type}`,
        revokeObjectURL: (url) => browser.revoked.push(url),
        schedule: (callback) => callback(),
    })
    return browser
}

const pdf = (name) => ({ name, blob: new Blob(['%PDF'], { type: 'application/pdf' }) })
const docx = (name) => ({ name, blob: new Blob(['PK'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }) })

describe('openDocumentsInTabs', () => {
    test('takes every tab before the first download is awaited', async () => {
        const browser = fakeBrowser()
        const documents = [pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')]

        const result = await openDocumentsInTabs(documents, browser.options((d) => d.blob))

        assert.equal(browser.requests, 3)
        assert.equal(browser.openedDuringDownload, 0)
        assert.deepEqual(result, { opened: 3, saved: 0, blocked: 0, failed: 0 })
        assert.deepEqual(browser.tabs.map((tab) => tab.location.href), Array(3).fill('blob:test/application/pdf'))
    })

    test('shows a waiting text in each tab while its file downloads', async () => {
        const browser = fakeBrowser()
        await openDocumentsInTabs([pdf('a.pdf')], browser.options((d) => d.blob))

        assert.equal(browser.tabs[0].document.title, 'Åbner dokument…')
    })

    test('reports a refused tab as blocked and does not save the file', async () => {
        const browser = fakeBrowser({ allowed: 1 })

        const result = await openDocumentsInTabs([pdf('a.pdf'), pdf('b.pdf')], browser.options((d) => d.blob))

        assert.deepEqual(result, { opened: 1, saved: 0, blocked: 1, failed: 0 })
        assert.deepEqual(browser.saved, [])
    })

    test('saves a Word file without taking a tab for it', async () => {
        const browser = fakeBrowser()

        const result = await openDocumentsInTabs([docx('notat.docx'), pdf('a.pdf')], browser.options((d) => d.blob))

        assert.equal(browser.requests, 1)
        assert.deepEqual(browser.saved, ['notat.docx'])
        assert.deepEqual(result, { opened: 1, saved: 1, blocked: 0, failed: 0 })
    })

    test('closes the tab and saves when a name without extension turns out to be a Word file', async () => {
        const browser = fakeBrowser()

        const result = await openDocumentsInTabs([docx('notat')], browser.options((d) => d.blob))

        assert.equal(browser.tabs[0].closed, true)
        assert.deepEqual(browser.saved, ['notat'])
        assert.deepEqual(result, { opened: 0, saved: 1, blocked: 0, failed: 0 })
    })

    test('gives a generic download its type from the file name', async () => {
        const browser = fakeBrowser()
        const generic = { name: 'scan.pdf', blob: new Blob(['%PDF'], { type: 'application/octet-stream' }) }

        await openDocumentsInTabs([generic], browser.options((d) => d.blob))

        assert.equal(browser.tabs[0].location.href, 'blob:test/application/pdf')
    })

    test('closes the tab of a download that fails and carries on with the rest', async () => {
        const browser = fakeBrowser()
        const load = (d) => {
            if (d.name === 'a.pdf') throw new Error('403')
            return d.blob
        }

        const result = await openDocumentsInTabs([pdf('a.pdf'), pdf('b.pdf')], browser.options(load))

        assert.equal(browser.tabs[0].closed, true)
        assert.equal(browser.tabs[1].location.href, 'blob:test/application/pdf')
        assert.deepEqual(result, { opened: 1, saved: 0, blocked: 0, failed: 1 })
    })

    test('frees each object URL after its tab has had time to load', async () => {
        const browser = fakeBrowser()
        await openDocumentsInTabs([pdf('a.pdf')], browser.options((d) => d.blob))

        assert.deepEqual(browser.revoked, ['blob:test/application/pdf'])
    })

    test('does nothing for an empty selection', async () => {
        const browser = fakeBrowser()
        const result = await openDocumentsInTabs([], browser.options((d) => d.blob))

        assert.equal(browser.requests, 0)
        assert.deepEqual(result, { opened: 0, saved: 0, blocked: 0, failed: 0 })
    })
})

describe('format checks', () => {
    test('a browser shows PDFs and images but not HTML or SVG', () => {
        assert.equal(canOpenInBrowser(new Blob([''], { type: 'application/pdf' })), true)
        assert.equal(canOpenInBrowser(new Blob([''], { type: 'image/png' })), true)
        assert.equal(canOpenInBrowser(new Blob([''], { type: 'text/html' }), 'side.html'), false)
        assert.equal(canOpenInBrowser(new Blob([''], { type: 'image/svg+xml' }), 'logo.svg'), false)
    })

    test('a tab is taken for viewable names and names without extension only', () => {
        assert.equal(mayOpenInBrowser('a.PDF'), true)
        assert.equal(mayOpenInBrowser('uden-endelse'), true)
        assert.equal(mayOpenInBrowser('regneark.xlsx'), false)
    })
})
