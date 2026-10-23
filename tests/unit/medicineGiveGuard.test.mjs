/**
 * "Giv medicin" must not register doses when it does not know which are already given.
 * Until 2026-10-19 a failed history lookup was swallowed and every slot looked not given.
 *
 *   node --test tests/unit/medicineGiveGuard.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { doseRegistrationBlocked } from '../../composables/medicineGiveGuard.ts'

const root = path.resolve(import.meta.dirname, '../..')
const dialog = fs.readFileSync(path.join(root, 'components/modules/user/citizen/medicine/modal-give-medicine.vue'), 'utf8')

describe('doseRegistrationBlocked', () => {
    test('a failed history lookup blocks the single-date save', () => {
        assert.equal(doseRegistrationBlocked({ multiDateMode: false, historyFailed: true, monthStatusFailed: false }), true)
        assert.equal(doseRegistrationBlocked({ multiDateMode: false, historyFailed: false, monthStatusFailed: true }), false)
    })
    test('a failed month status blocks the multi-date save', () => {
        assert.equal(doseRegistrationBlocked({ multiDateMode: true, historyFailed: false, monthStatusFailed: true }), true)
        assert.equal(doseRegistrationBlocked({ multiDateMode: true, historyFailed: true, monthStatusFailed: false }), false)
    })
    test('nothing failed, nothing blocked', () => {
        assert.equal(doseRegistrationBlocked({ multiDateMode: false, historyFailed: false, monthStatusFailed: false }), false)
    })
})

describe('the dialog', () => {
    test('no history lookup error is swallowed any more', () => {
        assert.ok(!dialog.includes('catch (e) { /* ignore */ }'))
        assert.ok(dialog.includes('state.historyFailed = true'))
        assert.ok(dialog.includes('state.monthStatusFailed = true'))
    })
    test('both save buttons and both save functions honour the block', () => {
        assert.equal((dialog.match(/state\.isSaving \|\| registrationBlocked/g) || []).length, 2)
        assert.equal((dialog.match(/if \(registrationBlocked\.value\) return/g) || []).length, 2)
    })
    test('the warning exists in all four languages', () => {
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const g = JSON.parse(fs.readFileSync(path.join(root, 'lang', `${lang}.json`), 'utf8')).citizens.medicineJournals.giveMedicineModal
            assert.ok(g.historyUnavailable && g.retry, lang)
            assert.ok(!g.historyUnavailable.includes('—'), lang)
        }
    })
})
