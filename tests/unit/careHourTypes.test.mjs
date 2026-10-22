/**
 * Unit tests for composables/careHourTypes.ts and composables/citizenRates.ts:
 * the hour type on a hand-made time registration, and whether a citizen's
 * rate and margin are kept from the signed-in person.
 *
 *   node --test tests/unit/careHourTypes.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    defaultHourTypeUuid, hourTypeChoices, hourTypePayload, isCareHourTypesOn,
} from '../../composables/careHourTypes.ts'
import { areCitizenRatesHidden } from '../../composables/citizenRates.ts'

const contact = { uuid: 'c-1', name: 'Kontakttimer (ATA)', system_key: 'contact' }
const admin = { uuid: 'a-1', name: 'Administrationstid', system_key: 'admin' }
const transport = { uuid: 't-1', name: 'Transporttid', system_key: 'transport' }
const own = { uuid: 'o-1', name: 'Supervision', system_key: null }

describe('isCareHourTypesOn', () => {
    test('only an explicit true counts', () => {
        assert.equal(isCareHourTypesOn({ care_hour_types_enabled: true }), true)
        assert.equal(isCareHourTypesOn({ care_hour_types_enabled: false }), false)
        assert.equal(isCareHourTypesOn({ care_hour_types_enabled: 1 }), false)
        assert.equal(isCareHourTypesOn({}), false)
        assert.equal(isCareHourTypesOn(null), false)
        assert.equal(isCareHourTypesOn(undefined), false)
    })
})

describe('hourTypeChoices', () => {
    test('the company types as options, in the order given', () => {
        assert.deepEqual(hourTypeChoices([contact, admin, transport]), [
            { value: 'c-1', label: 'Kontakttimer (ATA)' },
            { value: 'a-1', label: 'Administrationstid' },
            { value: 't-1', label: 'Transporttid' },
        ])
    })

    test("a row's type made inactive since is still offered", () => {
        const choices = hourTypeChoices([contact], { uuid: 'old-1', name: 'Old type' })
        assert.deepEqual(choices.map((c) => c.value), ['c-1', 'old-1'])
    })

    test("a row's type already listed is not repeated, and no types gives no options", () => {
        assert.equal(hourTypeChoices([contact], { uuid: 'c-1', name: 'Kontakttimer (ATA)' }).length, 1)
        assert.deepEqual(hourTypeChoices([], null), [])
        assert.deepEqual(hourTypeChoices(undefined, undefined), [])
    })
})

describe('defaultHourTypeUuid', () => {
    test('contact time when the company has it, wherever it is listed', () => {
        assert.equal(defaultHourTypeUuid([admin, transport, contact]), 'c-1')
    })

    test('else the first type, else none', () => {
        assert.equal(defaultHourTypeUuid([own, admin]), 'o-1')
        assert.equal(defaultHourTypeUuid([]), '')
        assert.equal(defaultHourTypeUuid(undefined), '')
    })
})

describe('hourTypePayload', () => {
    test('sends the chosen type only when the picker showed', () => {
        assert.deepEqual(hourTypePayload(true, 'a-1'), { contract_hour_type_uuid: 'a-1' })
        assert.deepEqual(hourTypePayload(false, 'a-1'), {})
    })

    test('nothing chosen sends nothing, so an older row keeps its type', () => {
        assert.deepEqual(hourTypePayload(true, ''), {})
        assert.deepEqual(hourTypePayload(true, null), {})
        assert.deepEqual(hourTypePayload(true, undefined), {})
    })
})

describe('areCitizenRatesHidden', () => {
    test('hidden when the citizen names hourly_rate in hidden_fields', () => {
        assert.equal(areCitizenRatesHidden({ hourly_rate: null, hidden_fields: ['hourly_rate', 'pricing'] }), true)
    })

    test('hidden when the margin answer says so', () => {
        assert.equal(areCitizenRatesHidden({ hidden_fields: [] }, { data: { contribution_margin: null, is_hidden: true } }), true)
    })

    test('a citizen without a rate, or another hidden field, is not hidden', () => {
        assert.equal(areCitizenRatesHidden({ hourly_rate: null, hidden_fields: [] }), false)
        assert.equal(areCitizenRatesHidden({ hidden_fields: ['social_security_number'] }), false)
        assert.equal(areCitizenRatesHidden({ hourly_rate: null }, { message: 'The citizen has no hourly rate.' }), false)
        assert.equal(areCitizenRatesHidden(null, undefined), false)
        assert.equal(areCitizenRatesHidden({}, { data: { contribution_margin: '-12.000,00' } }), false)
    })
})
