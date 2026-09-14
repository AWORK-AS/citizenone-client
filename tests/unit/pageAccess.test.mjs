/**
 * Unit tests for composables/pageAccess.ts — the decision behind both the nav
 * link and the route guard.
 *
 * The regression this suite pins down: middleware/require-page.ts demanded
 * `inquiry_pipeline_enabled` of every page it guarded, because Inquiries was
 * the only page using it when it was written. The guard is the one place a
 * module set can be enforced rather than merely displayed, so the next page put
 * behind it - the medicine card, say, which an industry profile leaves out for
 * therapists - would have been refused to every company without an inquiry
 * pipeline, for a reason nobody could have guessed from the screen.
 *
 * No server, no browser, no build step: Node 22+ strips the composable's type
 * annotations at import time. Run with:
 *
 *   node --test tests/unit/pageAccess.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { canOpenPage, companyHasModule, userHasPage } from '../../composables/pageAccess.ts'

const user = (modulePages, pages, company = {}) => ({
    company: { module_pages: modulePages, ...company },
    pages: pages.map((name) => ({ name })),
})

describe('companyHasModule — the company\'s own module set', () => {
    test('no rows means every module', () => {
        // The default for a company that has never opened Settings -> Company ->
        // Moduler. Reading it as "nothing" would lock every existing customer out
        // of their whole product.
        assert.equal(companyHasModule(undefined, 'Medicine card'), true)
        assert.equal(companyHasModule(null, 'Medicine card'), true)
        assert.equal(companyHasModule([], 'Medicine card'), true)
    })

    test('a set restricts to what it names', () => {
        assert.equal(companyHasModule(['Journals', 'Calendar'], 'Journals'), true)
        assert.equal(companyHasModule(['Journals', 'Calendar'], 'Medicine card'), false)
    })
})

describe('userHasPage — what the roles were granted', () => {
    test('answers on the page name', () => {
        assert.equal(userHasPage([{ name: 'Journals' }], 'Journals'), true)
        assert.equal(userHasPage([{ name: 'Journals' }], 'Inquiries'), false)
    })

    test('a missing list is not access', () => {
        // The opposite reading of an empty module set, and deliberately so: no
        // pages is what a brand-new role has, and it may not open everything.
        assert.equal(userHasPage(undefined, 'Journals'), false)
        assert.equal(userHasPage([], 'Journals'), false)
    })
})

describe('canOpenPage', () => {
    test('needs both the module and the page', () => {
        assert.equal(canOpenPage(user(['Journals'], ['Journals']), 'Journals'), true)
        assert.equal(canOpenPage(user(['Journals'], []), 'Journals'), false)
        assert.equal(canOpenPage(user(['Calendar'], ['Journals']), 'Journals'), false)
    })

    test('a therapist whose industry left the medicine card out cannot reach it', () => {
        const therapist = user(['Journals', 'Calendar', 'Documents'], ['Journals', 'Medicine card'])

        assert.equal(canOpenPage(therapist, 'Medicine card'), false)
        assert.equal(canOpenPage(therapist, 'Journals'), true)
    })

    test('a page that names no company flag is not asked for one', () => {
        // The bug. `inquiry_pipeline_enabled` is false here, and for any page
        // other than Inquiries that must not matter.
        const clinic = user(['Medicine card'], ['Medicine card'], { inquiry_pipeline_enabled: false })

        assert.equal(canOpenPage(clinic, 'Medicine card'), true)
    })

    test('a page that names one still needs it', () => {
        const withPipeline = user(['Inquiries'], ['Inquiries'], { inquiry_pipeline_enabled: true })
        const without = user(['Inquiries'], ['Inquiries'], { inquiry_pipeline_enabled: false })

        assert.equal(canOpenPage(withPipeline, 'Inquiries', 'inquiry_pipeline_enabled'), true)
        assert.equal(canOpenPage(without, 'Inquiries', 'inquiry_pipeline_enabled'), false)
    })

    test('no user is no access', () => {
        assert.equal(canOpenPage(undefined, 'Journals'), false)
        assert.equal(canOpenPage(null, 'Journals'), false)
    })
})
