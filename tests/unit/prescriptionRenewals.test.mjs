/**
 * Unit tests for composables/prescriptionRenewals.ts - the prescription renewal statuses as the staff inbox
 * and the patient's Prescriptions page use them.
 *
 *   node --test tests/unit/prescriptionRenewals.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    RENEWAL_STATUSES,
    canDecide,
    canPrescribe,
    patientRenewalAction,
    prescribeLink,
    renewalBadgeClass,
} from '../../composables/prescriptionRenewals.ts'

describe('the staff inbox', () => {
    test('lists the requests waiting for staff first', () => {
        assert.equal(RENEWAL_STATUSES[0], 'pending')
        assert.equal(new Set(RENEWAL_STATUSES).size, 5)
    })

    test('only a waiting request can be approved or rejected', () => {
        assert.equal(canDecide('pending'), true)
        for (const status of ['awaiting_answers', 'approved', 'rejected', 'prescribed', undefined]) {
            assert.equal(canDecide(status), false, String(status))
        }
    })

    test('the prescription is made once the request is approved', () => {
        assert.equal(canPrescribe('approved'), true)
        assert.equal(canPrescribe('pending'), false)
        assert.equal(canPrescribe('prescribed'), false)
    })

    test('"Create prescription" opens the patient\'s medicine card for the request', () => {
        assert.equal(
            prescribeLink({ uuid: 'r-1', citizen: { uuid: 'c-1' } }),
            '/citizens/c-1/medicine-journals?renewal=r-1',
        )
        assert.equal(prescribeLink({ uuid: 'r-1', citizen: null }), null)
        assert.equal(prescribeLink(null), null)
    })

    test('every status has a badge, and an unknown one a neutral badge', () => {
        assert.equal(renewalBadgeClass('rejected'), 'badge-red')
        assert.equal(renewalBadgeClass('prescribed'), 'badge-green')
        assert.equal(renewalBadgeClass('something else'), 'badge-gray')
    })
})

describe('the patient\'s prescriptions', () => {
    test('without an open request the patient can ask for a renewal', () => {
        assert.equal(patientRenewalAction({ open_request: null }), 'request')
        assert.equal(patientRenewalAction({}), 'request')
    })

    test('a request waiting for its questionnaire sends the patient to it', () => {
        assert.equal(patientRenewalAction({ open_request: { status: 'awaiting_answers', survey_assignment_uuid: 'a-1' } }), 'answer')
    })

    test('otherwise the patient waits for the clinic', () => {
        assert.equal(patientRenewalAction({ open_request: { status: 'pending' } }), 'waiting')
        assert.equal(patientRenewalAction({ open_request: { status: 'approved' } }), 'waiting')
    })
})
