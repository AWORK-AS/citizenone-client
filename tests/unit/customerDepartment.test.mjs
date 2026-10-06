/**
 * Unit tests for composables/customerDepartment.ts - form mapping, list filter
 * and import helpers.
 *
 *   node --test tests/unit/customerDepartment.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    applyCount, departmentPayload, emptyDepartmentForm, filterDepartments, formFromDepartment, isImportFile,
} from '../../composables/customerDepartment.ts'

describe('form mapping', () => {
    test('a department maps onto the form, nulls become empty strings', () => {
        const form = formFromDepartment({
            name: 'Born og Familie', external_id: '2', has_special_contract: true, payment_terms_days: 30,
            cooperation_status_date: '2026-01-02', region: null, is_active: false, municipality_uuid: 'm1',
        })

        assert.equal(form.external_id, '2')
        assert.equal(form.has_special_contract, true)
        assert.equal(form.region, '')
        assert.equal(form.payment_terms_days, 30)
        assert.equal(form.is_active, false)
        assert.equal(form.municipality_uuid, 'm1')
    })

    test('no department gives the empty form', () => {
        assert.deepEqual(formFromDepartment(null), emptyDepartmentForm())
    })

    test('the payload nulls empty text, strips EAN spaces and numbers the days', () => {
        const form = formFromDepartment({ name: 'X', ean_number: '5798 0000 0000 1', payment_terms_days: '14' })
        const payload = departmentPayload(form)

        assert.equal(payload.ean_number, '5798000000001')
        assert.equal(payload.payment_terms_days, 14)
        assert.equal(payload.street, null)
        assert.equal(payload.cooperation_protection_end, null)
        assert.equal(payload.has_special_contract, false)
        assert.equal(payload.name, 'X')
    })

    test('empty terms and EAN are sent as null', () => {
        const payload = departmentPayload(emptyDepartmentForm())

        assert.equal(payload.payment_terms_days, null)
        assert.equal(payload.ean_number, null)
    })
})

describe('filterDepartments', () => {
    const list = [
        { name: 'A', customer_label: 'Aabenraa', ean_number: '111', customer_number: '9001', external_id: '2' },
        { name: 'B', customer_label: 'Odense', ean_number: '222', customer_number: '9002', external_id: 'WZ-77' },
    ]

    test('matches name, EAN, customer number and WorkZone id', () => {
        assert.deepEqual(filterDepartments(list, 'aaben').map(d => d.name), ['A'])
        assert.deepEqual(filterDepartments(list, '222').map(d => d.name), ['B'])
        assert.deepEqual(filterDepartments(list, '9001').map(d => d.name), ['A'])
        assert.deepEqual(filterDepartments(list, 'wz-77').map(d => d.name), ['B'])
    })

    test('empty query returns everything', () => {
        assert.equal(filterDepartments(list, '  ').length, 2)
    })
})

describe('import helpers', () => {
    test('file types', () => {
        assert.equal(isImportFile('Kommuner.XLSX'), true)
        assert.equal(isImportFile('x.csv'), true)
        assert.equal(isImportFile('x.pdf'), false)
    })

    test('apply count is creates plus updates', () => {
        assert.equal(applyCount({ create: 190, update: 3, skip: 6 }), 193)
        assert.equal(applyCount(null), 0)
    })
})
