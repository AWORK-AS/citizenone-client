/**
 * Unit tests for composables/citizenFieldVisibility.ts -- which citizen fields
 * a company shows, and to which roles. The citizen card header and the hover
 * card on the citizen list both read it.
 *
 *   node --test tests/unit/citizenFieldVisibility.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { showsCitizenFieldFor, mayRoleSeeCitizenField } = await import('../../composables/citizenFieldVisibility.ts')

const user = (company, roleIds = [3]) => ({ company, roles: roleIds.map((id) => ({ id })) })
const shown = (...names) => names.map((en_name) => ({ en_name }))

describe('a company that has not chosen its fields', () => {
    test('shows the fields everyone saw before, and the rest to admins only', () => {
        const staff = user({ citizen_displays: [] })
        assert.equal(showsCitizenFieldFor(staff, false, 'Phone'), true)
        assert.equal(showsCitizenFieldFor(staff, false, 'Birthday'), false)
        assert.equal(showsCitizenFieldFor(staff, true, 'Birthday'), true)
    })
})

describe('a company that has chosen its fields', () => {
    test('hides a field it did not choose, from admins too', () => {
        const u = user({ citizen_displays: shown('Birthday') })
        assert.equal(showsCitizenFieldFor(u, true, 'Phone'), false)
        assert.equal(showsCitizenFieldFor(u, false, 'Birthday'), true)
    })

    test('shows a field limited to roles only to those roles, and to admins', () => {
        const company = { citizen_displays: shown('Phone'), citizen_display_roles: { Phone: [7] } }
        assert.equal(showsCitizenFieldFor(user(company, [3]), false, 'Phone'), false)
        assert.equal(showsCitizenFieldFor(user(company, [3, 7]), false, 'Phone'), true)
        assert.equal(showsCitizenFieldFor(user(company, [3]), true, 'Phone'), true)
    })

    test('compares role ids whatever their type', () => {
        const company = { citizen_displays: shown('Phone'), citizen_display_roles: { Phone: ['7'] } }
        assert.equal(mayRoleSeeCitizenField(user(company, [7]), false, 'Phone'), true)
    })
})
