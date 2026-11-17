/**
 * Unit tests for composables/inquiryRecruitmentSettings.ts - the recruitment
 * team settings and the switch that turns the messages off.
 *
 *   node --test tests/unit/inquiryRecruitmentSettings.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { recruitmentFormFrom, recruitmentPayload, recruitmentStatus } from '../../composables/inquiryRecruitmentSettings.ts'

describe('recruitmentStatus', () => {
    test('off wins, even with a team', () => {
        assert.equal(recruitmentStatus(false, 12), 'off')
    })
    test('on without anyone says nobody', () => {
        assert.equal(recruitmentStatus(true, 0), 'nobody')
    })
    test('on with a team gives the count', () => {
        assert.equal(recruitmentStatus(true, 3), 'count')
    })
})

describe('recruitmentFormFrom', () => {
    test('maps the answer and keeps the switch', () => {
        const form = recruitmentFormFrom({
            enabled: false,
            email_enabled: true,
            employee_groups: [{ uuid: 'g1', name: 'Rekruttering' }],
            users: [{ uuid: 'u1', name: 'Rikke' }],
            task_board: { uuid: 'b1', name: 'Tavle' },
        })
        assert.deepEqual(form, { enabled: false, email_enabled: true, employee_group_uuids: ['g1'], user_uuids: ['u1'], task_board_uuid: 'b1' })
    })
    test('an older backend without the switch reads as on', () => {
        assert.equal(recruitmentFormFrom({ employee_groups: [] }).enabled, true)
    })
    test('mail is off unless the answer says it is on', () => {
        assert.equal(recruitmentFormFrom({ employee_groups: [] }).email_enabled, false)
        assert.equal(recruitmentFormFrom({ email_enabled: false }).email_enabled, false)
        assert.equal(recruitmentFormFrom({ email_enabled: true }).email_enabled, true)
    })
    test('no answer gives an empty, switched-on form', () => {
        assert.deepEqual(recruitmentFormFrom(undefined), { enabled: true, email_enabled: false, employee_group_uuids: [], user_uuids: [], task_board_uuid: '' })
    })
})

describe('recruitmentPayload', () => {
    test('sends the switch and no board as null', () => {
        assert.deepEqual(recruitmentPayload({ enabled: false, email_enabled: true, employee_group_uuids: ['g1'], user_uuids: [], task_board_uuid: '' }),
            { enabled: false, email_enabled: true, employee_group_uuids: ['g1'], user_uuids: [], task_board_uuid: null })
    })
})
