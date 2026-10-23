/**
 * Unit tests for composables/chatRecipients.ts - colleagues and citizens as two separate recipient lists in
 * a new chat.
 *
 *   node --test tests/unit/chatRecipients.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { citizenRecipientOptions, employeeRecipientOptions, recipientTypeOf, staffRecipientOptions } from '../../composables/chatRecipients.ts'

describe('two separate recipient lists', () => {
    test('colleagues come from the employee list', () => {
        assert.deepEqual(employeeRecipientOptions([
            { uuid: 'all-employees', firstname: 'All', lastname: 'employees' },
            { uuid: 'u-1', firstname: 'Lise', lastname: 'Leder' },
            { firstname: 'No uuid' },
        ]), [
            { value: 'all-employees', label: 'All employees' },
            { value: 'u-1', label: 'Lise Leder' },
        ])
    })

    test('citizens are only the people with the Citizen role, never staff', () => {
        assert.deepEqual(citizenRecipientOptions([
            { uuid: 'c-1', firstname: 'Karl', lastname: 'Borger', role: 'Citizen' },
            { uuid: 'u-1', firstname: 'Lise', lastname: 'Leder', role: 'Admin' },
            { uuid: 'u-2', firstname: 'Uden', lastname: 'Rolle', role: null },
        ]), [{ value: 'c-1', label: 'Karl Borger' }])
    })

    test('adding to a group chat: colleagues are everyone in the members list who is not a citizen', () => {
        assert.deepEqual(staffRecipientOptions([
            { uuid: 'c-1', firstname: 'Karl', lastname: 'Borger', role: 'Citizen' },
            { uuid: 'u-1', firstname: 'Lise', lastname: 'Leder', role: 'Admin' },
            { uuid: 'u-2', firstname: 'Uden', lastname: 'Rolle', role: null },
        ]).map((option) => option.value), ['u-1', 'u-2'])
    })

    test('copes with nothing loaded', () => {
        assert.deepEqual(employeeRecipientOptions(undefined), [])
        assert.deepEqual(citizenRecipientOptions(null), [])
    })

    test('a pre-selected recipient opens on the right list', () => {
        const citizens = [{ value: 'c-1', label: 'Karl Borger' }]
        assert.equal(recipientTypeOf('c-1', citizens), 'citizens')
        assert.equal(recipientTypeOf('u-1', citizens), 'employees')
        assert.equal(recipientTypeOf(undefined, citizens), null)
    })
})
