/**
 * Unit tests for composables/linkedChat.ts (Roadmap #501): group chats linked
 * to a department or an employee group.
 *
 *   node --test tests/unit/linkedChat.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { isArchivedChat, isManagedChat, linkableOptions, linkedChatLabel, linkedChatPayload } from '../../composables/linkedChat.ts'

const t = (key, values) => key === 'messages.linkedChat.groupLabel' ? `Gruppe: ${values.name}` : key

describe('linkedChatLabel', () => {
    test('a department shows its name', () => {
        assert.equal(linkedChatLabel({ linked_to: { type: 'department', name: 'Afdeling Nord' } }, t), 'Afdeling Nord')
    })
    test('an employee group says it is a group', () => {
        assert.equal(linkedChatLabel({ linked_to: { type: 'employee_group', name: 'Nattevagter' } }, t), 'Gruppe: Nattevagter')
    })
    test('an ordinary chat has none', () => {
        assert.equal(linkedChatLabel({ linked_to: null }, t), '')
        assert.equal(linkedChatLabel(null, t), '')
        assert.equal(linkedChatLabel({ linked_to: { type: 'department', name: '  ' } }, t), '')
    })
})

describe('managed and archived', () => {
    test('only an explicit true is managed', () => {
        assert.equal(isManagedChat({ is_managed: true }), true)
        assert.equal(isManagedChat({ is_managed: false }), false)
        assert.equal(isManagedChat(undefined), false)
    })
    test('archived when archived_at is set', () => {
        assert.equal(isArchivedChat({ archived_at: '2026-11-26T10:00:00Z' }), true)
        assert.equal(isArchivedChat({ archived_at: null }), false)
    })
})

describe('linkedChatPayload', () => {
    test('a department, with or without a name', () => {
        assert.deepEqual(linkedChatPayload('department', 'd-1', ' Nord-chat '), { type: 'group', department_uuid: 'd-1', name: 'Nord-chat' })
        assert.deepEqual(linkedChatPayload('department', 'd-1', ''), { type: 'group', department_uuid: 'd-1' })
    })
    test('an employee group', () => {
        assert.deepEqual(linkedChatPayload('employee_group', 'g-1', null), { type: 'group', employee_group_uuid: 'g-1' })
    })
    test('nothing until the choice is complete', () => {
        assert.equal(linkedChatPayload('none', 'd-1', 'x'), null)
        assert.equal(linkedChatPayload('department', '', 'x'), null)
    })
})

describe('linkableOptions', () => {
    const departments = [{ uuid: 'a', id: 1 }, { uuid: 'b', id: 2 }]
    const groups = [
        { uuid: 'g1', department: { id: 1 } },
        { uuid: 'g2', department_id: 2 },
        { uuid: 'g3', department: null },
    ]

    test('an admin may link anything', () => {
        assert.equal(linkableOptions(departments, 'department', true, []).length, 2)
        assert.equal(linkableOptions(groups, 'employee_group', true, []).length, 3)
    })
    test('a manager only their own departments and their groups', () => {
        assert.deepEqual(linkableOptions(departments, 'department', false, [1]).map((d) => d.uuid), ['a'])
        assert.deepEqual(linkableOptions(groups, 'employee_group', false, [1]).map((g) => g.uuid), ['g1'])
        assert.deepEqual(linkableOptions(groups, 'employee_group', false, [2]).map((g) => g.uuid), ['g2'])
    })
})
