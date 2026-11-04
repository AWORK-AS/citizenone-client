/**
 * "Slet min konto" (App Store guideline 5.1.1(v)) in Settings > Profile.
 *
 *   node --test tests/unit/accountDeletion.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

test('the profile page offers account deletion', () => {
    assert.match(read('pages/settings/profile.vue'), /<ModulesUserSettingsAccountDeletion \/>/)
})

test('the request goes to the backend endpoint, and only after a confirmation', () => {
    assert.match(read('components/api/user/AccountDeletionService.ts'), /\/user\/account-deletion-request`, 'POST'/)
    const component = read('components/modules/user/settings/account-deletion.vue')
    assert.match(component, /@click="state\.isConfirmOpen = true"/)
    assert.match(component, /@confirm="send"/)
})

test('every string exists in all four languages', () => {
    const keys = Object.keys(JSON.parse(read('lang/dk.json')).settings.profile.accountDeletion)
    assert.ok(keys.length >= 10)
    for (const lang of ['en', 'no', 'sv']) {
        const strings = JSON.parse(read(`lang/${lang}.json`)).settings.profile.accountDeletion
        for (const key of keys) assert.ok(strings?.[key], `${lang}: ${key}`)
    }
})
