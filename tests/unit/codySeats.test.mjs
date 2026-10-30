import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canGiveAiAccess, seatsActionOnPage } from '../../composables/codySeats.ts'

test('an admin without a seat in a company with Cody may assign seats', () => {
    assert.equal(canGiveAiAccess({ has_ai_access: false }, { company_has_cody: true, can_manage: true }), true)
})

test('a user holding a seat may assign, as before', () => {
    assert.equal(canGiveAiAccess({ has_ai_access: true }, null), true)
})

test('an employee who cannot manage seats may not', () => {
    assert.equal(canGiveAiAccess({ has_ai_access: false }, { company_has_cody: true, can_manage: false }), false)
})

test('a company without Cody shows nothing to assign', () => {
    assert.equal(canGiveAiAccess({ has_ai_access: false }, { company_has_cody: false, can_manage: true }), false)
})

test('before the status has loaded nothing is offered', () => {
    assert.equal(canGiveAiAccess({ has_ai_access: false }, null), false)
    assert.equal(canGiveAiAccess(null, undefined), false)
})

test('on the employee list the banner button scrolls instead of navigating', () => {
    assert.equal(seatsActionOnPage('/employees', '/employees'), 'scroll')
    assert.equal(seatsActionOnPage('/employees/', '/employees'), 'scroll')
})

test('anywhere else it navigates to the employee list', () => {
    assert.equal(seatsActionOnPage('/overview', '/employees'), 'navigate')
    assert.equal(seatsActionOnPage('/employees/archived', '/employees'), 'navigate')
})
