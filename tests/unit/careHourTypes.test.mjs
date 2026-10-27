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
    checkInHourTypeChoices, defaultHourTypeUuid, extraLineHourTypeUuid, firstLineTakesVisit, hourTypeChoices, hourTypePayload,
    isCareHourTypesOn, journalCareHoursRequest, nextLineStart,
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

describe('checkInHourTypeChoices', () => {
    test('every type when transport has no button of its own', () => {
        assert.deepEqual(checkInHourTypeChoices([contact, admin, transport, own], false), [contact, admin, transport, own])
    })
    test('without the transport type when transport has its own button', () => {
        assert.deepEqual(checkInHourTypeChoices([contact, admin, transport, own], true), [contact, admin, own])
    })
    test('nothing without types', () => {
        assert.deepEqual(checkInHourTypeChoices([], true), [])
        assert.deepEqual(checkInHourTypeChoices(undefined, false), [])
    })
})

describe('extraLineHourTypeUuid', () => {
    test('administration when the company has it', () => {
        assert.equal(extraLineHourTypeUuid([contact, admin, transport]), 'a-1')
    })
    test('else the default type', () => {
        assert.equal(extraLineHourTypeUuid([own, contact]), 'c-1')
        assert.equal(extraLineHourTypeUuid([own]), 'o-1')
    })
    test('none without types', () => {
        assert.equal(extraLineHourTypeUuid([]), '')
        assert.equal(extraLineHourTypeUuid(undefined), '')
    })
})

const line = (key, start, end, type = '') => ({ key, start, end, type })

describe('journalCareHoursRequest', () => {
    test('a visit and its admin become two lines on the date, each with its type', () => {
        const request = journalCareHoursRequest([line(1, '12:00', '13:00', 'c-1'), line(2, '13:00', '13:30', 'a-1')], '2026-10-26', true)
        assert.deepEqual(request.lines, [
            { date_time_start: '2026-10-26 12:00', date_time_end: '2026-10-26 13:00', contract_hour_type_uuid: 'c-1' },
            { date_time_start: '2026-10-26 13:00', date_time_end: '2026-10-26 13:30', contract_hour_type_uuid: 'a-1' },
        ])
        assert.deepEqual(request.keys, [1, 2])
    })
    test('no type is sent when the picker was not shown', () => {
        const request = journalCareHoursRequest([line(1, '12:00', '13:00', 'c-1')], '2026-10-26', false)
        assert.deepEqual(request.lines, [{ date_time_start: '2026-10-26 12:00', date_time_end: '2026-10-26 13:00' }])
    })
    test('an empty line is left out and the keys say which lines were sent', () => {
        const request = journalCareHoursRequest([line(1, '', ''), line(2, '13:00', '13:30'), line(3, '', '')], '2026-10-26', false)
        assert.equal(request.lines.length, 1)
        // The server's care_hours.0.* is about line key 2, not the first line on screen.
        assert.deepEqual(request.keys, [2])
    })
    test('a line with only a start is sent, so the server can say the end is missing', () => {
        const request = journalCareHoursRequest([line(1, '12:00', '')], '2026-10-26', false)
        assert.deepEqual(request.keys, [1])
        assert.equal(request.lines[0].date_time_end, '2026-10-26 ')
    })
    test('nothing to send without lines', () => {
        assert.deepEqual(journalCareHoursRequest([], '2026-10-26', true), { lines: [], keys: [] })
        assert.deepEqual(journalCareHoursRequest(undefined, '2026-10-26', true), { lines: [], keys: [] })
    })
})

describe('firstLineTakesVisit', () => {
    const before = { start: '12:00', end: '13:00' }
    test('an empty first line takes the visit time', () => {
        assert.equal(firstLineTakesVisit({ start: '', end: '' }, null), true)
    })
    test('a first line still holding the old visit time follows the change', () => {
        assert.equal(firstLineTakesVisit({ start: '12:00', end: '13:00' }, before), true)
    })
    test('a time someone typed is left alone', () => {
        assert.equal(firstLineTakesVisit({ start: '12:00', end: '12:30' }, before), false)
        assert.equal(firstLineTakesVisit({ start: '12:00', end: '' }, before), false)
    })
    test('a typed time with no earlier visit time is left alone', () => {
        assert.equal(firstLineTakesVisit({ start: '08:00', end: '09:00' }, null), false)
    })
    test('no first line, nothing to fill', () => {
        assert.equal(firstLineTakesVisit(undefined, before), false)
    })
})

describe('nextLineStart', () => {
    test('starts where the last line ended', () => {
        assert.equal(nextLineStart([{ end: '13:00' }, { end: '13:30' }]), '13:30')
    })
    test('empty when there is no line or no end yet', () => {
        assert.equal(nextLineStart([]), '')
        assert.equal(nextLineStart([{ end: '' }]), '')
        assert.equal(nextLineStart(undefined), '')
    })
})

