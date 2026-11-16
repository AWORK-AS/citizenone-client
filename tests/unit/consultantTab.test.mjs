/**
 * Unit tests for composables/consultantTab.ts - who gets the consultant tab.
 *
 *   node --test tests/unit/consultantTab.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { consultantTabRedirect, showsConsultantTab } from '../../composables/consultantTab.ts'

describe('showsConsultantTab', () => {
    test('a consultant gets the tab', () => {
        assert.equal(showsConsultantTab({ data: { is_consultant: true } }), true)
    })

    test('a permanent employee does not', () => {
        assert.equal(showsConsultantTab({ data: { is_consultant: false } }), false)
    })

    test('an older backend without the flag keeps the tab', () => {
        assert.equal(showsConsultantTab({ data: { uuid: 'u1' } }), true)
    })

    test('no answer keeps the tab', () => {
        assert.equal(showsConsultantTab(undefined), true)
        assert.equal(showsConsultantTab(null), true)
    })
})

describe('consultantTabRedirect', () => {
    test('a non-consultant on the consultant tab goes to the details page', () => {
        assert.equal(consultantTabRedirect('/employees/u1/consultant-profile', 'u1', false), '/employees/u1/view-details')
        assert.equal(consultantTabRedirect('/employees/u1/consultant-profile/', 'u1', false), '/employees/u1/view-details')
    })

    test('a consultant stays', () => {
        assert.equal(consultantTabRedirect('/employees/u1/consultant-profile', 'u1', true), null)
    })

    test('any other tab stays', () => {
        assert.equal(consultantTabRedirect('/employees/u1/hr-details', 'u1', false), null)
    })

    test('another employee\'s consultant tab is not touched', () => {
        assert.equal(consultantTabRedirect('/employees/u2/consultant-profile', 'u1', false), null)
    })

    test('no employee, no redirect', () => {
        assert.equal(consultantTabRedirect('/employees//consultant-profile', '', false), null)
    })
})
