/**
 * Unit tests for composables/welcomeTour.ts - when Milo's welcome tour shows,
 * which steps it has, and how the Discover checklist maps onto the backend's.
 *
 * The backend contract (tours_seen, tour_route, GET /user/onboarding/checklist)
 * may not be deployed yet, so the "field absent" cases matter as much as the
 * others: they must keep today's modal sequence.
 *
 *   node --test tests/unit/welcomeTour.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    welcomeTourMode,
    isFirstSession,
    buildWelcomeSteps,
    checklistDone,
    restartRoute,
} from '../../composables/welcomeTour.ts'

const seen = (welcome_web, tour_route, extra = {}) =>
    ({ tours_seen: { welcome_web, welcome_mobile: null }, tour_route, ...extra })

describe('welcomeTourMode', () => {
    test('tours_seen absent and first login -> legacy modal sequence', () => {
        assert.equal(welcomeTourMode({ is_first_login: true }), 'legacy')
    })
    test('tours_seen absent and not first login -> nothing', () => {
        assert.equal(welcomeTourMode({ is_first_login: false }), 'none')
        assert.equal(welcomeTourMode({}), 'none')
    })
    test('tours_seen absent ignores a tour_route on its own', () => {
        assert.equal(welcomeTourMode({ tour_route: 'staff', is_first_login: false }), 'none')
    })
    test('unseen with a route -> tour, and is_first_login is not consulted', () => {
        assert.equal(welcomeTourMode(seen(null, 'care_home_admin', { is_first_login: true })), 'tour')
        assert.equal(welcomeTourMode(seen(null, 'clinic_admin', { is_first_login: false })), 'tour')
        assert.equal(welcomeTourMode(seen(null, 'staff')), 'tour')
    })
    test('seen -> nothing, even with a route', () => {
        assert.equal(welcomeTourMode(seen('2026-10-09T08:00:00Z', 'staff')), 'none')
    })
    test('null or unknown route -> nothing, never the legacy modal', () => {
        assert.equal(welcomeTourMode(seen(null, null, { is_first_login: true })), 'none')
        assert.equal(welcomeTourMode(seen(null, 'future_route', { is_first_login: true })), 'none')
    })
    test('no user -> nothing', () => {
        assert.equal(welcomeTourMode(null), 'none')
        assert.equal(welcomeTourMode(undefined), 'none')
    })
    test('an array or string is not a tours_seen map', () => {
        assert.equal(welcomeTourMode({ tours_seen: [], is_first_login: true }), 'legacy')
        assert.equal(welcomeTourMode({ tours_seen: 'x', is_first_login: false }), 'none')
    })
})

describe('isFirstSession', () => {
    test('follows the tour where tours_seen exists', () => {
        assert.equal(isFirstSession(seen(null, 'staff', { is_first_login: true })), true)
        assert.equal(isFirstSession(seen('2026-10-09', 'staff', { is_first_login: true })), false)
        assert.equal(isFirstSession(seen(null, null, { is_first_login: true })), false)
    })
    test('follows is_first_login on an older backend', () => {
        assert.equal(isFirstSession({ is_first_login: true }), true)
        assert.equal(isFirstSession({ is_first_login: false }), false)
        assert.equal(isFirstSession(null), false)
    })
})

describe('buildWelcomeSteps', () => {
    const all = { hasModule: () => true, hasInvoiceApp: true }
    const keys = (steps) => steps.map(s => s.textKey.replace('welcomeTour.', ''))

    test('care home admin gets its five steps, ending on Discover and Milo', () => {
        const steps = buildWelcomeSteps('care_home_admin', all)
        assert.deepEqual(keys(steps), ['careHome.citizens', 'careHome.colleagues', 'careHome.today', 'careHome.journal', 'careHome.end'])
        assert.equal(steps.at(-1).route, '/discover')
        assert.equal(steps.at(-1).openChat, true)
    })
    test('clinic admin gets its five steps', () => {
        assert.deepEqual(keys(buildWelcomeSteps('clinic_admin', all)),
            ['clinic.calendar', 'clinic.booking', 'clinic.clients', 'clinic.invoices', 'clinic.end'])
    })
    test('staff starts centred and ends on Milo', () => {
        const steps = buildWelcomeSteps('staff', all)
        assert.deepEqual(keys(steps), ['staff.welcome', 'staff.day', 'staff.messages', 'staff.end'])
        assert.equal(steps[0].selector, undefined)
        assert.equal(steps.at(-1).openChat, true)
    })
    test('a company without the Calendar module loses the calendar and booking steps', () => {
        const ctx = { hasModule: (n) => n !== 'Calendar', hasInvoiceApp: true }
        assert.deepEqual(keys(buildWelcomeSteps('clinic_admin', ctx)), ['clinic.clients', 'clinic.invoices', 'clinic.end'])
    })
    test('no invoicing app drops the invoice step', () => {
        const ctx = { hasModule: () => true, hasInvoiceApp: false }
        assert.ok(!keys(buildWelcomeSteps('clinic_admin', ctx)).includes('clinic.invoices'))
    })
    test('unknown or null route -> no steps', () => {
        assert.deepEqual(buildWelcomeSteps(null, all), [])
        assert.deepEqual(buildWelcomeSteps('nope', all), [])
    })
    test('every spotlighted step names a data-tour selector', () => {
        for (const route of ['care_home_admin', 'clinic_admin', 'staff']) {
            for (const s of buildWelcomeSteps(route, all)) {
                if (s.selector) assert.match(s.selector, /^\[data-tour="[a-z-]+"\]$/)
            }
        }
    })
})

describe('checklistDone', () => {
    const care = {
        route: 'care_home_admin',
        steps: [
            { key: 'citizens_added', done: true },
            { key: 'colleagues_invited', done: false },
            { key: 'journal_note_written', done: true },
            { key: 'duty_schedule_created', done: false },
            { key: 'medicine_added', done: true },
        ],
    }
    const clinic = {
        route: 'clinic_admin',
        steps: [
            { key: 'services_created', done: true },
            { key: 'clients_added', done: true },
            { key: 'colleagues_invited', done: false },
            // online_booking_enabled may be absent
        ],
    }

    test('maps Discover steps onto backend keys for a care home', () => {
        assert.equal(checklistDone(care, 'citizens'), true)
        assert.equal(checklistDone(care, 'employees'), false)
        assert.equal(checklistDone(care, 'schedule'), false)
        assert.equal(checklistDone(care, 'medicine'), true)
    })
    test('maps the clinic journey: patients -> clients_added', () => {
        assert.equal(checklistDone(clinic, 'patients'), true)
        assert.equal(checklistDone(clinic, 'employees'), false)
    })
    test('an unmapped step falls back (null)', () => {
        assert.equal(checklistDone(care, 'departments'), null)
        assert.equal(checklistDone(care, 'shiftTags'), null)
        assert.equal(checklistDone(clinic, 'citizens'), null)
    })
    test('a backend key that is absent falls back (null)', () => {
        assert.equal(checklistDone({ route: 'clinic_admin', steps: [] }, 'patients'), null)
    })
    test('no checklist, a staff checklist or garbage falls back (null)', () => {
        assert.equal(checklistDone(null, 'citizens'), null)
        assert.equal(checklistDone(undefined, 'citizens'), null)
        assert.equal(checklistDone({ route: 'staff', steps: [{ key: 'profile_completed', done: true }] }, 'citizens'), null)
        assert.equal(checklistDone({ route: 'care_home_admin' }, 'citizens'), null)
        assert.equal(checklistDone({ route: 'care_home_admin', steps: [{ key: 'citizens_added', done: 'yes' }] }, 'citizens'), null)
    })
})

describe('restartRoute', () => {
    test('the backend route wins', () => {
        assert.equal(restartRoute({ tour_route: 'clinic_admin' }, false), 'clinic_admin')
    })
    test('otherwise derived from role and industry', () => {
        assert.equal(restartRoute({}, false), 'staff')
        assert.equal(restartRoute({ company: { industry: { system_name: 'dental' } } }, true), 'clinic_admin')
        assert.equal(restartRoute({ company: { industry: { system_name: 'social_welfare' } } }, true), 'care_home_admin')
        assert.equal(restartRoute({ company: { industry: { system_name: 'x', en_name: 'Social welfare services' } } }, true), 'care_home_admin')
        assert.equal(restartRoute({ tour_route: null }, true), 'care_home_admin')
        assert.equal(restartRoute({ company: { industry: null } }, true), 'care_home_admin')
    })
    test('a non-dental, non-social-welfare industry is a clinic', () => {
        assert.equal(restartRoute({ company: { industry: { system_name: 'physio', en_name: 'Physiotherapy' } } }, true), 'clinic_admin')
    })
    test('below Manager is staff whatever the industry', () => {
        assert.equal(restartRoute({ company: { industry: { system_name: 'dental' } } }, false), 'staff')
    })
})
