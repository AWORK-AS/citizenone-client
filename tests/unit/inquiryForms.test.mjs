/**
 * Unit tests for composables/inquiryForms.ts -- the forms "Ny henvendelse"
 * offers. A company switches the built-in forms off, builds its own, and hides
 * fields such as "Navn på spørger"; what the § 110/§ 109 registration reads
 * cannot be hidden on a built-in form.
 *
 *   node --test tests/unit/inquiryForms.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { formLabel, activeForms, asksFor, lockReason, toggleField } = await import('../../composables/inquiryForms.ts')

const names = { shelter: 'Herberg', crisisCenter: 'Krisecenter' }

const shelter = {
    uuid: 's', name: null, builtin: 'shelter', base: 'shelter', inquiry_type: 'shelter',
    core_fields: ['inquiry_date', 'inquirer_name', 'cpr', 'referral_destination'],
    available_core_fields: ['inquiry_date', 'inquirer_name', 'cpr', 'referral_destination', 'notes'],
    locked_core_fields: ['inquiry_date', 'cpr', 'referral_destination'],
    registration_fields: ['referral_destination'],
    is_active: true, sort_order: 0,
}

const own = {
    uuid: 'o', name: 'Henvisning fra kommune', builtin: null, base: 'general', inquiry_type: 'crisis_center',
    core_fields: ['inquiry_date', 'cpr'],
    available_core_fields: ['inquiry_date', 'inquirer_name', 'cpr', 'topic'],
    locked_core_fields: ['inquiry_date', 'cpr'],
    registration_fields: [],
    is_active: true, sort_order: 5,
}

describe('formLabel', () => {
    test('names a built-in form by the company word for it', () => {
        assert.equal(formLabel(shelter, names), 'Herberg')
        assert.equal(formLabel({ name: null, builtin: 'crisis_center' }, names), 'Krisecenter')
    })

    test('names a company form by its own name', () => {
        assert.equal(formLabel(own, names), 'Henvisning fra kommune')
        assert.equal(formLabel(null, names), '')
    })
})

describe('activeForms', () => {
    test('offers only switched-on forms, in the company order', () => {
        const off = { ...shelter, uuid: 'off', is_active: false }
        assert.deepEqual(activeForms([own, off, shelter]).map((f) => f.uuid), ['s', 'o'])
        assert.deepEqual(activeForms(undefined), [])
    })
})

describe('asksFor', () => {
    test('a form asks for what is on its list and nothing else', () => {
        assert.equal(asksFor('inquirer_name', own), false)
        assert.equal(asksFor('cpr', own), true)
    })

    test('the form decides over a service type', () => {
        assert.equal(asksFor('inquirer_name', own, { core_fields: ['inquirer_name'] }), false)
    })

    test('without a form a configured service type decides, and otherwise everything is asked', () => {
        assert.equal(asksFor('inquirer_name', null, { core_fields: ['cpr'] }), false)
        assert.equal(asksFor('inquirer_name', null, { core_fields: null }), true)
        assert.equal(asksFor('inquirer_name', null, null), true)
    })
})

describe('lockReason and toggleField', () => {
    test('says why a field is locked', () => {
        assert.equal(lockReason(shelter, 'referral_destination'), 'registration')
        assert.equal(lockReason(shelter, 'cpr'), 'always')
        assert.equal(lockReason(shelter, 'inquirer_name'), null)
    })

    test('hides the inquirer name on the shelter form', () => {
        assert.deepEqual(toggleField(shelter, 'inquirer_name'), ['inquiry_date', 'cpr', 'referral_destination'])
    })

    test('never takes a registration field off', () => {
        assert.deepEqual(toggleField(shelter, 'referral_destination'), shelter.core_fields)
    })

    test('adds a field back in the order the form shows it', () => {
        assert.deepEqual(toggleField(own, 'topic'), ['inquiry_date', 'cpr', 'topic'])
        assert.deepEqual(toggleField(own, 'inquirer_name'), ['inquiry_date', 'inquirer_name', 'cpr'])
    })
})
