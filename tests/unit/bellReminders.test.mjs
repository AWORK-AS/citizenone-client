/**
 * Task #335: reminders and plan, goal and subgoal notifications show in the bell,
 * and unread journal notes have a note icon of their own instead of a bell.
 *
 *   node --test tests/unit/bellReminders.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

test('the bell knows reminders and plans, goals and subgoals', () => {
    const bell = read('components/modules/user/navbar/notification-bell.vue')
    assert.match(bell, /includes\('plangoalsubgoal'\)\) return 'plan_goal'/)
    assert.match(bell, /=== 'remindernotification'\) return 'reminder'/)
    assert.match(bell, /reminder: \{ bg: [^}]*icon: 'ph:alarm'/)
    assert.match(bell, /plan_goal: \{ bg: [^}]*icon: 'ph:target'/)
})

test('a click opens the reminders, the employment cases or the plans and goals', () => {
    const bell = read('components/modules/user/navbar/notification-bell.vue')
    assert.ok(bell.includes("navigateTo(citizenUuid ? `/citizens/${citizenUuid}/employment-cases` : '/reminders')"))
    assert.ok(bell.includes('navigateTo(`/citizens/${citizenUuid}/plans-and-goals/active`)'))
})

test('the reminder check does not catch the other reminders already in the bell', () => {
    // Certificate, CV and deletion reminders keep their own categories: only
    // the plain ReminderNotification is a reminder.
    const bell = read('components/modules/user/navbar/notification-bell.vue')
    const order = ['certificateexpiry', 'cvoutdated', 'employeedeletionreminder', 'remindernotification']
        .map((key) => bell.indexOf(`'${key}'`))
    assert.ok(order.every((index) => index > 0))
    assert.deepEqual([...order].sort((a, b) => a - b), order)
})

test('unread journal notes use the note icon, and the bell sits beside them, in both layouts', () => {
    for (const [layout, link] of [['layouts/user.vue', "'/journal-notifications'"], ['layouts/dentist.vue', "'/dentist/journal-notifications'"]]) {
        const source = read(layout)
        const button = source.slice(source.indexOf(`navigateTo(${link})`), source.indexOf(`navigateTo(${link})`) + 300)
        assert.match(button, /<Icon name="ph:note"/, layout)
        assert.ok(source.includes('<ModulesUserNavbarNotificationBell'), layout)
    }
})
