/**
 * Unit tests for composables/superadminSearch.ts - the pure logic behind the
 * superadmin search palette (⌘K / Ctrl+K).
 *
 *   node --test tests/unit/superadminSearch.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    normalizeSearchText,
    highlightMatch,
    navPageEntries,
    matchNavPages,
    scoreNavPage,
    searchApiSections,
    searchHrefFor,
    buildPaletteSections,
    flattenPaletteSections,
    movePaletteIndex,
    paletteKeyAction,
    isPaletteShortcut,
    paletteShortcutLabel,
    addRecentPick,
    parseRecentPicks,
    readRecentPicks,
    writeRecentPicks,
    SEARCH_RECENT_STORAGE_KEY,
} from '../../composables/superadminSearch.ts'

const dk = {
    'superadmin.sidebar.dashboard': 'Dashboard',
    'superadmin.sidebar.companies': 'Virksomheder',
    'superadmin.sidebar.invoices': 'Fakturaer',
    'superadmin.sidebar.orders': 'Ordrer',
    'superadmin.sidebar.news': 'Nyheder',
    'superadmin.sidebar.announcements': 'Beskeder',
    'superadmin.sidebar.roadmap': 'Roadmap',
    'paymentDunning.nav.billingProblems': 'Betalingsproblemer',
}
const t = (key) => dk[key] ?? key

const nav = {
    oversigt: [
        { name: 'Dashboard', label: 'superadmin.sidebar.dashboard', href: '/superadmin/dashboard', icon: 'a' },
        { name: 'Companies', label: 'superadmin.sidebar.companies', href: '/superadmin/companies', icon: 'b' },
    ],
    okonomi: [
        { name: 'Invoices', label: 'superadmin.sidebar.invoices', href: '/superadmin/invoices', icon: 'c' },
        { name: 'BillingProblems', label: 'paymentDunning.nav.billingProblems', href: '/superadmin/billing-problems', icon: 'd' },
        { name: 'Orders', label: 'superadmin.sidebar.orders', href: '/superadmin/orders', icon: 'e' },
    ],
    platform: [],
    kommunikation: [
        {
            name: 'News', label: 'superadmin.sidebar.news', href: '/superadmin/announcements', icon: 'f',
            tabs: [
                { name: 'Announcements', label: 'superadmin.sidebar.announcements', href: '/superadmin/announcements', icon: 'g' },
                { name: 'Roadmap', label: 'superadmin.sidebar.roadmap', href: '/superadmin/roadmap', icon: 'h' },
            ],
        },
    ],
}

describe('text', () => {
    test('normalizeSearchText lowercases and strips accents', () => {
        assert.equal(normalizeSearchText('  Café ÆØÅ '), 'cafe æøå')
        assert.equal(normalizeSearchText(null), '')
    })

    test('highlightMatch splits around the first case-insensitive hit', () => {
        assert.deepEqual(highlightMatch('Løveskoven Bosted', 'skov'), [
            { text: 'Løve', match: false },
            { text: 'skov', match: true },
            { text: 'en Bosted', match: false },
        ])
        assert.deepEqual(highlightMatch('Anna', 'an'), [{ text: 'An', match: true }, { text: 'na', match: false }])
        assert.deepEqual(highlightMatch('Anna', 'xyz'), [{ text: 'Anna', match: false }])
        assert.deepEqual(highlightMatch('Anna', ''), [{ text: 'Anna', match: false }])
        assert.deepEqual(highlightMatch(null, 'a'), [])
    })
})

describe('menu pages', () => {
    const entries = navPageEntries(nav, t)

    test('flattens hubs into their tabs, translated, without duplicates', () => {
        assert.deepEqual(entries.map((e) => e.href), [
            '/superadmin/dashboard',
            '/superadmin/companies',
            '/superadmin/invoices',
            '/superadmin/billing-problems',
            '/superadmin/orders',
            '/superadmin/announcements',
            '/superadmin/roadmap',
        ])
        const roadmap = entries.find((e) => e.href === '/superadmin/roadmap')
        assert.equal(roadmap.title, 'Roadmap')
        assert.equal(roadmap.parent, 'Nyheder')
    })

    test('"faktura" offers Fakturaer', () => {
        const hits = matchNavPages(entries, 'faktura')
        assert.equal(hits[0].href, '/superadmin/invoices')
        assert.equal(hits[0].title, 'Fakturaer')
        assert.equal(hits[0].group, 'pages')
        assert.equal(hits[0].id, 'pages:/superadmin/invoices')
    })

    test('the English name and the hub name find a page too', () => {
        assert.equal(matchNavPages(entries, 'invoice')[0].href, '/superadmin/invoices')
        assert.deepEqual(matchNavPages(entries, 'nyheder').map((h) => h.href), ['/superadmin/announcements', '/superadmin/roadmap'])
    })

    test('ranks exact before prefix before word prefix before contains', () => {
        const pages = [
            { href: '/a', icon: '', title: 'Rapport om ordrer', keywords: [] },
            { href: '/b', icon: '', title: 'Ordrebog', keywords: [] },
            { href: '/c', icon: '', title: 'Ordrer', keywords: [] },
            { href: '/d', icon: '', title: 'Alle kundeordrer', keywords: [] },
        ]
        assert.deepEqual(matchNavPages(pages, 'ordrer').map((h) => h.href), ['/c', '/a', '/d'])
        assert.equal(scoreNavPage(pages[1], 'ordre'), 1)
        assert.equal(scoreNavPage(pages[0], 'ordre'), 2)
        assert.equal(scoreNavPage(pages[3], 'ordre'), 3)
        assert.equal(scoreNavPage(pages[0], ''), null)
    })

    test('limits the number of pages', () => {
        assert.equal(matchNavPages(entries, 'e', 2).length, 2)
    })
})

describe('API results', () => {
    const groups = {
        team: [{ uuid: 't1', name: 'Mette Staff', email: 'm@citizenone.dk', role: 'Supporter', is_active: true }],
        companies: [{ uuid: 'c1', name: 'Løveskoven', cvr: '12345678', economic_customer_number: 40123, status: 'closed', billing_method: 'invoice' }],
        invoices: [
            { uuid: 'i1', invoice_number: '2026001', economic_invoice_number: 9001, economic_draft_number: 77, is_paid: true, status: 'paid', company_uuid: 'c1', company_name: 'Løveskoven' },
            { uuid: 'i2', invoice_number: '2026002', economic_invoice_number: null, economic_draft_number: 78, is_paid: false, status: 'pending', company_uuid: 'c1', company_name: 'Løveskoven' },
        ],
        accounts: [{ uuid: 'u1', name: 'Mette F', email: 'mette@x.dk', company_uuid: 'c1', company_name: 'Løveskoven', is_active: true, is_archived: true }],
        agreements: [],
    }

    test('orders groups, drops empty ones, builds rows', () => {
        const sections = searchApiSections(groups)
        assert.deepEqual(sections.map((s) => s.key), ['companies', 'accounts', 'invoices', 'team'])

        const company = sections[0].items[0]
        assert.equal(company.href, '/superadmin/companies/c1/overview')
        assert.equal(company.subtitle, 'CVR 12345678 · e-conomic 40123')
        assert.deepEqual(company.badges, ['closed', 'billingInvoice'])

        const account = sections[1].items[0]
        assert.equal(account.href, '/superadmin/companies/c1/accounts/u1/edit')
        assert.equal(account.subtitle, 'mette@x.dk · Løveskoven')
        assert.deepEqual(account.badges, ['archived'])

        const [booked, draft] = sections[2].items
        assert.equal(booked.title, '#2026001')
        assert.equal(booked.href, '/superadmin/invoices/i1/invoice-details')
        assert.equal(booked.subtitle, 'Løveskoven · e-conomic 9001')
        assert.deepEqual(booked.badges, ['paid'])
        assert.deepEqual(draft.badges, ['unpaid', 'economicDraft'])

        assert.equal(sections[3].items[0].href, '/superadmin/users/edit/t1')
        assert.equal(sections[3].items[0].subtitle, 'm@citizenone.dk · Supporter')
    })

    test('tolerates nothing', () => {
        assert.deepEqual(searchApiSections(null), [])
        assert.deepEqual(searchApiSections({}), [])
    })

    test('agreement links to the company agreements page', () => {
        assert.equal(searchHrefFor('agreements', { uuid: 'a1', company_uuid: 'c9' }), '/superadmin/companies/c9/agreements')
    })
})

describe('sections', () => {
    const recent = [{ id: 'pages:/x', group: 'pages', title: 'X', href: '/superadmin/x', icon: 'i' }]
    const pages = [{ id: 'pages:/y', group: 'pages', title: 'Y', href: '/superadmin/y', icon: 'i' }]
    const api = [{ key: 'companies', items: [{ id: 'companies:c1', group: 'companies', title: 'C', href: '/superadmin/c', icon: 'i' }] }]

    test('an empty query shows the recent picks only', () => {
        assert.deepEqual(buildPaletteSections('  ', pages, api, recent), [{ key: 'recent', items: recent }])
        assert.deepEqual(buildPaletteSections('', pages, api, []), [])
    })

    test('a query shows pages first, then API groups', () => {
        const sections = buildPaletteSections('y', pages, api, recent)
        assert.deepEqual(sections.map((s) => s.key), ['pages', 'companies'])
        assert.deepEqual(flattenPaletteSections(sections).map((i) => i.id), ['pages:/y', 'companies:c1'])
    })
})

describe('keyboard', () => {
    test('movePaletteIndex wraps and starts at the right end', () => {
        assert.equal(movePaletteIndex(0, 1, 3), 1)
        assert.equal(movePaletteIndex(2, 1, 3), 0)
        assert.equal(movePaletteIndex(0, -1, 3), 2)
        assert.equal(movePaletteIndex(-1, 1, 3), 0)
        assert.equal(movePaletteIndex(-1, -1, 3), 2)
        assert.equal(movePaletteIndex(5, 1, 3), 0)
        assert.equal(movePaletteIndex(0, 1, 0), -1)
    })

    test('paletteKeyAction maps keys', () => {
        assert.equal(paletteKeyAction({ key: 'ArrowDown' }), 'next')
        assert.equal(paletteKeyAction({ key: 'ArrowUp' }), 'prev')
        assert.equal(paletteKeyAction({ key: 'Enter' }), 'select')
        assert.equal(paletteKeyAction({ key: 'Escape' }), 'close')
        assert.equal(paletteKeyAction({ key: 'n', ctrlKey: true }), 'next')
        assert.equal(paletteKeyAction({ key: 'p', ctrlKey: true }), 'prev')
        assert.equal(paletteKeyAction({ key: 'n' }), null)
        assert.equal(paletteKeyAction({ key: 'Home' }), null)
        assert.equal(paletteKeyAction({ key: 'Home', ctrlKey: true }), 'first')
        assert.equal(paletteKeyAction({ key: 'a' }), null)
    })

    test('isPaletteShortcut is ⌘K or Ctrl+K, nothing else', () => {
        assert.equal(isPaletteShortcut({ key: 'k', metaKey: true }), true)
        assert.equal(isPaletteShortcut({ key: 'K', ctrlKey: true }), true)
        assert.equal(isPaletteShortcut({ key: 'k' }), false)
        assert.equal(isPaletteShortcut({ key: 'k', ctrlKey: true, shiftKey: true }), false)
        assert.equal(isPaletteShortcut({ key: 'j', metaKey: true }), false)
    })

    test('paletteShortcutLabel per platform', () => {
        assert.equal(paletteShortcutLabel('MacIntel'), '⌘K')
        assert.equal(paletteShortcutLabel('iPad'), '⌘K')
        assert.equal(paletteShortcutLabel('Win32'), 'Ctrl K')
        assert.equal(paletteShortcutLabel(undefined), 'Ctrl K')
    })
})

describe('recent picks', () => {
    const item = (id, extra = {}) => ({ id, group: 'pages', title: id, href: `/superadmin/${id}`, icon: 'i', ...extra })

    test('newest first, deduplicated, capped at five', () => {
        let list = []
        for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) list = addRecentPick(list, item(id))
        assert.deepEqual(list.map((i) => i.id), ['f', 'e', 'd', 'c', 'b'])
        list = addRecentPick(list, item('c'))
        assert.deepEqual(list.map((i) => i.id), ['c', 'f', 'e', 'd', 'b'])
    })

    test('stores only the fields it needs', () => {
        const [stored] = addRecentPick([], item('a', { extra: 'nope', subtitle: 's' }))
        assert.deepEqual(Object.keys(stored).sort(), ['badges', 'group', 'href', 'icon', 'id', 'subtitle', 'title'])
    })

    test('parseRecentPicks ignores junk', () => {
        assert.deepEqual(parseRecentPicks(null), [])
        assert.deepEqual(parseRecentPicks('{not json'), [])
        assert.deepEqual(parseRecentPicks('{"a":1}'), [])
        const raw = JSON.stringify([item('a'), { id: 'x' }, item('b', { href: 'https://evil.example' }), item('c')])
        assert.deepEqual(parseRecentPicks(raw).map((i) => i.id), ['a', 'c'])
    })

    test('read/write survive storage that throws or is missing', () => {
        const throwing = { getItem() { throw new Error('denied') }, setItem() { throw new Error('quota') } }
        assert.deepEqual(readRecentPicks(throwing), [])
        assert.equal(writeRecentPicks(throwing, [item('a')]), false)
        assert.deepEqual(readRecentPicks(null), [])
        assert.equal(writeRecentPicks(undefined, []), false)
    })

    test('round-trips through storage', () => {
        const store = new Map()
        const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) }
        assert.equal(writeRecentPicks(storage, [item('a'), item('b')]), true)
        assert.ok(store.has(SEARCH_RECENT_STORAGE_KEY))
        assert.deepEqual(readRecentPicks(storage).map((i) => i.id), ['a', 'b'])
    })
})
