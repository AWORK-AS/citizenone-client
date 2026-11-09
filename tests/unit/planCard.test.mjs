/**
 * Unit tests for composables/planCard.ts - the plan cards say what the CitizenOne homepage says.
 *
 *   node --test tests/unit/planCard.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
    formatWholeAmount,
    planBilledYearly,
    planFeatures,
    planMonthlyPrice,
    planTaglineKey,
} from '../../composables/planCard.ts'

// As the deals are after the November 2026 price change (UpdateDealPricesNov2026Seeder, UpdateDealUserSeatsSeeder).
const basis = { name: 'Basis', users: 2, departments: 1, storage_size: '1 GB', monthly_price: '299.00', yearly_price: '2988.00', extra_users: 99, extra_departments: 149 }
const pro = { name: 'Pro', users: 4, departments: 3, storage_size: '3 GB', monthly_price: '699.00', yearly_price: '6948.00' }

describe('the price', () => {
    test('on the yearly plan is the yearly price per month, as on the homepage', () => {
        assert.equal(planMonthlyPrice(basis, 'annually'), 249)
        assert.equal(planMonthlyPrice(pro, 'annually'), 579)
        assert.equal(planBilledYearly(basis, 'annually'), 2988)
        assert.equal(planBilledYearly(pro, 'annually'), 6948)
    })

    test('on the monthly plan is the monthly price, with nothing billed yearly', () => {
        assert.equal(planMonthlyPrice(basis, 'monthly'), 299)
        assert.equal(planBilledYearly(basis, 'monthly'), null)
    })

    test('is written in whole kroner with the language\'s thousands separator', () => {
        assert.equal(formatWholeAmount(2988, 'dk'), '2.988')
        assert.equal(formatWholeAmount(6948, 'en'), '6,948')
        assert.equal(formatWholeAmount(249, 'dk'), '249')
    })

    test('copes with a plan without prices', () => {
        assert.equal(planMonthlyPrice(null, 'annually'), 0)
        assert.equal(planMonthlyPrice({ monthly_price: null }, 'monthly'), 0)
    })
})

describe('what the plan includes', () => {
    test('Basis: two users, up to four in all, one department', () => {
        const features = planFeatures(basis)
        assert.deepEqual(features.map((f) => f.key), [
            'subscription.plan.usersIncludedUpTo',
            'subscription.plan.departmentsIncluded',
            'subscription.plan.unlimitedCitizens',
            'subscription.plan.storage',
            'subscription.plan.support',
        ])
        assert.deepEqual(features[0].params, { count: 2, max: 4 })
        assert.equal(features[0].extraPrice, 99)
        assert.deepEqual(features[1].params, { count: 1 })
        assert.deepEqual(features[3].params, { size: '1 GB' })
    })

    test('Pro: four users with no cap, three departments, no admin or FMK lines', () => {
        const features = planFeatures(pro)
        assert.equal(features[0].key, 'subscription.plan.usersIncluded')
        assert.deepEqual(features[0].params, { count: 4 })
        assert.deepEqual(features[1].params, { count: 3 })
        assert.deepEqual(features[3].params, { size: '3 GB' })
        assert.equal(features.length, 5)
    })

    test('counts the admin in, as the plans list sends it apart (1 admin + 1 user on Basis, 1 + 3 on Pro)', () => {
        assert.deepEqual(planFeatures({ ...basis, admin: 1, users: 1 })[0].params, { count: 2, max: 4 })
        assert.deepEqual(planFeatures({ ...pro, admin: 1, users: 3 })[0].params, { count: 4 })
    })

    test('a cap the deal carries itself wins', () => {
        assert.deepEqual(planFeatures({ ...pro, max_users: 10 })[0].params, { count: 4, max: 10 })
    })

    test('who it is for', () => {
        assert.equal(planTaglineKey(basis), 'subscription.plan.taglineBasis')
        assert.equal(planTaglineKey(pro), 'subscription.plan.taglinePro')
    })
})
