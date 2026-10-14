/**
 * Unit tests for utils/platformShare.ts -- the links behind "Del CitizenOne" (task #16).
 *
 *   node --test tests/unit/platformShare.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { platformShareTargets, shareCodeFromQuery } = await import('../../utils/platformShare.ts')

const URL_ = 'https://app.citizenone.dk/register?share=abc23xyz9k'

describe('platformShareTargets', () => {
    const targets = platformShareTargets(URL_, 'Prøv CitizenOne', 'Vi bruger CitizenOne & er glade')

    test('the mail carries the subject and the message with the link', () => {
        assert.ok(targets.email.startsWith('mailto:?subject=Pr%C3%B8v%20CitizenOne&body='))
        const body = decodeURIComponent(targets.email.split('&body=')[1])
        assert.equal(body, `Vi bruger CitizenOne & er glade\n\n${URL_}`)
    })

    test('an ampersand in the message does not cut the mail short', () => {
        assert.equal(targets.email.split('&').length, 2)
    })

    test('the text message carries the link', () => {
        assert.ok(targets.sms.startsWith('sms:?&body='))
        assert.ok(decodeURIComponent(targets.sms).endsWith(URL_))
    })

    test('LinkedIn and Facebook get the link itself, encoded', () => {
        assert.equal(targets.linkedin, `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(URL_)}`)
        assert.equal(targets.facebook, `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL_)}`)
    })
})

describe('shareCodeFromQuery', () => {
    test('reads the code', () => {
        assert.equal(shareCodeFromQuery('?share=abc23xyz9k&utm_source=x'), 'abc23xyz9k')
    })

    test('retyped in capitals or with spaces', () => {
        assert.equal(shareCodeFromQuery('?share=%20ABC23XYZ9K%20'), 'abc23xyz9k')
    })

    test('nothing, or something that is not a code', () => {
        assert.equal(shareCodeFromQuery(''), null)
        assert.equal(shareCodeFromQuery('?share='), null)
        assert.equal(shareCodeFromQuery('?share=<script>'), null)
    })
})
