/**
 * Unit tests for composables/contractPeriod.ts - how the contract period form
 * maps to and from the API: hours per hour type, the three preset lines and the
 * company's own contract fields.
 *
 * No server, no browser, no build step: Node 22+ strips the type annotations at
 * import time. Run with:
 *
 *   node --test tests/unit/contractPeriod.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    PRESET_KINDS, blankPresets, customFieldValues, customFieldsPayload, grantedTotal,
    hourEntriesFromPeriod, hoursPayload, linesPayload, splitLines,
} from '../../composables/contractPeriod.ts'

const types = [
    { uuid: 't-contact', system_key: 'contact' },
    { uuid: 't-admin', system_key: 'admin' },
    { uuid: 't-transport', system_key: 'transport' },
    { uuid: 't-own', system_key: null },
]

describe('hours per type', () => {
    test('a period with an hours array maps one entry per row', () => {
        const entries = hourEntriesFromPeriod({
            hours: [{ hour_type_uuid: 't-own', hours: 2.5 }, { hour_type_uuid: 't-contact', hours: 10 }],
        }, types)

        assert.deepEqual(entries, [
            { hour_type_uuid: 't-own', selected: true, hours: 2.5 },
            { hour_type_uuid: 't-contact', selected: true, hours: 10 },
        ])
    })

    test('a legacy period maps its three fields onto the system types', () => {
        const entries = hourEntriesFromPeriod({ contact_hours: 5, admin_hours: null, transport_hours: 1 }, types)

        assert.deepEqual(entries.map(e => [e.hour_type_uuid, e.hours]), [['t-contact', 5], ['t-transport', 1]])
    })

    test('only ticked types are sent, as numbers', () => {
        const payload = hoursPayload([
            { hour_type_uuid: 'a', selected: true, hours: '3.5' },
            { hour_type_uuid: 'b', selected: false, hours: 9 },
            { hour_type_uuid: 'c', selected: true, hours: '' },
        ])

        assert.deepEqual(payload, [{ hour_type_uuid: 'a', hours: 3.5 }, { hour_type_uuid: 'c', hours: 0 }])
    })

    test('the granted total only counts ticked types', () => {
        assert.equal(grantedTotal([
            { hour_type_uuid: 'a', selected: true, hours: '1.25' },
            { hour_type_uuid: 'b', selected: true, hours: 2 },
            { hour_type_uuid: 'c', selected: false, hours: 100 },
        ]), 3.25)
    })

    test('no ticked type sends an empty array, which clears the hours', () => {
        assert.deepEqual(hoursPayload([]), [])
    })
})

describe('lines', () => {
    const lines = [
        { uuid: 'l1', kind: 'startup_fee', description: 'Start', amount: 1000, recurrence: 'one_off', economic_product_number: '' },
        { uuid: 'l2', kind: 'room_rent', description: 'Rent', amount: 500, recurrence: 'recurring', economic_product_number: '12' },
        { uuid: 'l3', kind: 'custom', description: 'Other', amount: 75, recurrence: 'recurring' },
        { uuid: 'l4', description: 'Legacy line without a kind', amount: 10, recurrence: 'one_off' },
    ]

    test('presets and custom lines are told apart by kind; a missing kind is custom', () => {
        const { presets, custom } = splitLines(lines, false)

        assert.equal(presets.startup_fee.enabled, true)
        assert.equal(presets.startup_fee.uuid, 'l1')
        assert.equal(presets.room_rent.amount, 500)
        assert.equal(presets.status_report.enabled, false)
        assert.deepEqual(custom.map(l => l.uuid), ['l3', 'l4'])
    })

    test('a new period only inherits recurring lines', () => {
        const { presets, custom } = splitLines(lines, true)

        assert.equal(presets.startup_fee.enabled, false)
        assert.equal(presets.room_rent.enabled, true)
        assert.equal(presets.room_rent.uuid, null)
        assert.deepEqual(custom.map(l => l.uuid), ['l3'])
    })

    test('the payload carries the kind, preset lines first, with the right defaults', () => {
        const presets = blankPresets()
        presets.status_report.enabled = true
        presets.status_report.amount = '250'
        presets.room_rent.enabled = true
        presets.room_rent.amount = 400

        const payload = linesPayload(presets, [
            { uuid: null, description: 'Own', amount: '5', recurrence: 'one_off', economic_product_number: '' },
        ])

        assert.deepEqual(payload.map(l => l.kind), ['room_rent', 'status_report', 'custom'])
        assert.equal(payload[0].recurrence, 'recurring')
        assert.equal(payload[1].recurrence, 'one_off')
        assert.equal(payload[1].amount, 250)
        // A preset sends no text; the server writes its translated default.
        assert.equal(payload[0].description, null)
        assert.equal(payload[1].description, null)
        assert.equal(payload[2].description, 'Own')
        assert.equal(payload[2].economic_product_number, null)
    })

    test('an unticked preset is not sent, so it is removed', () => {
        const payload = linesPayload(blankPresets(), [])

        assert.deepEqual(payload, [])
        assert.deepEqual(PRESET_KINDS, ['startup_fee', 'room_rent', 'status_report'])
    })
})

describe('custom fields', () => {
    const definitions = [
        { uuid: 'f-text', field_type: 'text' },
        { uuid: 'f-num', field_type: 'number' },
    ]

    test('values are read back keyed by field uuid', () => {
        assert.deepEqual(customFieldValues({ custom_fields: [{ field_uuid: 'f-text', value: 'abc' }, { field_uuid: 'f-num', value: 4 }] }),
            { 'f-text': 'abc', 'f-num': 4 })
    })

    test('numbers are numeric, text is text and empty is null', () => {
        assert.deepEqual(customFieldsPayload(definitions, { 'f-text': '', 'f-num': '12.5' }), [
            { field_uuid: 'f-text', value: null },
            { field_uuid: 'f-num', value: 12.5 },
        ])
    })
})
