import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8')
const langs = ['dk', 'en', 'no', 'sv'].map((code) => [code, JSON.parse(read(`lang/${code}.json`))])

const { roadmapItemBrief, wishBrief, roadmapReference } = await import('../../utils/roadmapBrief.ts')

describe('the brief to hand to Claude', () => {
    const item = {
        number: 218,
        title: 'Tidslinje på borgeren',
        status: 'planned',
        description: '<p>Se alt om borgeren <strong>samlet</strong>.</p><ul><li>Hændelser</li></ul>',
        expected_period: 'Q1 2027',
        industries: [{ dk_name: 'Bosteder' }],
        internal: { stage: 'idea', priority: 'high', is_important: true, category: 'feature', original_text: 'Timeline please', notes: 'Kodetjek: delvist' },
        requests: [{ company: { name: 'Fonden Testhus' } }, { customer_name: 'Ukendt ApS' }],
        wishes: [{ number: 12, company: 'Fonden Testhus', message: 'Vi vil se alt på én side' }],
    }

    test('starts with the fixed reference and says to use it in the commit', () => {
        const brief = roadmapItemBrief(item)
        assert.match(brief, /^# Roadmap #218: Tidslinje på borgeren\n/)
        assert.match(brief, /Skriv "Roadmap #218" i commit og PR/)
        assert.match(brief, /PR til dev/)
    })

    test('carries the facts, plain description, original text, wishes, customers and notes', () => {
        const brief = roadmapItemBrief(item)
        for (const expected of ['- Status: Planlagt', '- Prioritet: high (vigtig)', '- Forventet: Q1 2027', '- Brancher: Bosteder',
            'Se alt om borgeren samlet.', '- Hændelser', 'Timeline please', '- Ønske #12 (Fonden Testhus): Vi vil se alt på én side',
            'Fonden Testhus, Ukendt ApS', 'Kodetjek: delvist']) {
            assert.ok(brief.includes(expected), `missing: ${expected}`)
        }
        assert.doesNotMatch(brief, /<\/?(p|strong|li|ul)>/)
    })

    test('leaves out empty sections', () => {
        const brief = roadmapItemBrief({ number: 5, title: 'Kort', status: 'in_progress' })
        assert.doesNotMatch(brief, /## Beskrivelse|## Oprindelig tekst|## Kunder|## Interne noter|undefined|null/)
        assert.match(brief, /- Status: I gang/)
    })

    test('a wish uses its roadmap number once it has one', () => {
        const wish = { number: 7, message: 'Eksport til Excel', company: { name: 'Hjem ApS' }, user: { name: 'Helle' }, created_at: '2026-11-10T09:00:00Z', images: [] }
        assert.match(wishBrief(wish), /^# Ønske #7: ønske fra Hjem ApS/)
        assert.match(wishBrief(wish), /Ikke på roadmap endnu/)
        const linked = wishBrief({ ...wish, roadmap_item: { number: 651, title: 'Excel-eksport' } })
        assert.match(linked, /^# Roadmap #651:/)
        assert.match(linked, /Skriv "Roadmap #651" i commit/)
    })

    test('reference without a number does not say "#undefined"', () => {
        assert.equal(roadmapReference({}), 'Roadmap')
    })
})

describe('the roadmap page', () => {
    const page = read('pages/superadmin/roadmap/index.vue')
    const wishes = read('components/modules/superadmin/roadmap/wishes.vue')
    const userModal = read('components/modules/user/wish-list/modal-contact-us.vue')

    test('shows the number, can be searched by it, and copies the brief', () => {
        assert.match(page, /#\{\{ item\.number \}\}/)
        assert.match(page, /item\.number \? `#\$\{item\.number\}` : ''/)
        assert.match(page, /copyBrief\(roadmapItemBrief\(item\)\)/)
        assert.match(page, /navigator\.clipboard\.writeText\(text\)/)
    })

    test('has a wishes tab that can put a wish on the roadmap or decline it', () => {
        assert.match(page, /<ModulesSuperadminRoadmapWishes v-if="state\.activeStatus === 'wishes'"/)
        assert.match(wishes, /roadmapItemService\.wishToRoadmap\(/)
        assert.match(wishes, /roadmapItemService\.updateWishStatus\(wish\.uuid, status\)/)
        assert.match(wishes, /emit\('copy', wishBrief\(wish\)\)/)
    })

    test('the sender sees what became of the wish', () => {
        assert.match(userModal, /wish\.status === 'on_roadmap'/)
        assert.match(userModal, /wish\.status === 'declined'/)
    })
})

describe('every language has the new texts', () => {
    for (const [code, lang] of langs) {
        test(code, () => {
            const roadmap = lang.superadmin?.roadmap ?? {}
            for (const value of [roadmap.copyBrief, roadmap.copyBriefHint, roadmap.copied, roadmap.copyFailed,
                roadmap.wishes?.tab, roadmap.wishes?.toRoadmap, roadmap.wishes?.status?.new, roadmap.wishes?.status?.on_roadmap,
                roadmap.wishes?.status?.declined, roadmap.wishes?.newItemHint,
                lang.wish?.previousRequests?.onRoadmap, lang.wish?.previousRequests?.read]) {
                assert.equal(typeof value, 'string')
                assert.ok(value.length > 0)
            }
            assert.match(lang.wish.previousRequests.onRoadmapAs, /\{title\}/)
        })
    }
})
