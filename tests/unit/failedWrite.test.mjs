/**
 * A write that fails without the screen showing why gets one shared notice, so a
 * form never looks saved when it was not.
 *
 *   node --test tests/unit/failedWrite.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { createNoticeThrottle, isUnexplainedFailure, isUserChange, shouldNoticeFailedWrite } from '../../composables/failedWrite.ts'

describe('which failures the screen does not explain', () => {
    test('no response, a refused session and server errors', () => {
        for (const status of [undefined, null, 0, 401, 408, 500, 502, 503]) {
            assert.equal(isUnexplainedFailure(status), true, String(status))
        }
    })

    test('validation and business rules carry their own message', () => {
        for (const status of [400, 402, 403, 404, 409, 422, 429]) {
            assert.equal(isUnexplainedFailure(status), false, String(status))
        }
    })
})

describe('which requests are a user change', () => {
    test('writes to the app are', () => {
        assert.equal(isUserChange('POST', '/user/citizens/abc/update'), true)
        assert.equal(isUserChange('PUT', '/user/citizen-journals/abc'), true)
        assert.equal(isUserChange('DELETE', '/user/citizen-medicines/abc'), true)
    })

    test('reads, sign-in, previews, read receipts and the location log are not', () => {
        assert.equal(isUserChange('GET', '/user/citizens'), false)
        assert.equal(isUserChange('POST', '/auth/login'), false)
        assert.equal(isUserChange('POST', '/auth/logout'), false)
        assert.equal(isUserChange('PUT', '/public/forms/x/submit'), false)
        assert.equal(isUserChange('POST', '/user/chat-gpt/preview-prompt'), false)
        assert.equal(isUserChange('POST', '/user/cody/nudge-events'), false)
        assert.equal(isUserChange('PUT', '/user/emails/5/mark-read'), false)
        assert.equal(isUserChange('PUT', '/user/entra/5/mark-as-read'), false)
        assert.equal(isUserChange('PUT', '/patient/notifications/5/read'), false)
        assert.equal(isUserChange('POST', '/user/citizen-care-hour-location-logs/batch'), false)
    })
})

test('the desktop case: a write answered 401 gets the notice', () => {
    assert.equal(shouldNoticeFailedWrite('PUT', '/user/employees/set/daily-overview/dates', 401), true)
    assert.equal(shouldNoticeFailedWrite('POST', '/user/citizens/abc/update', 422), false)
})

test('a burst of failures shows one notice', () => {
    const allow = createNoticeThrottle(10_000)
    assert.equal(allow(0), true)
    assert.equal(allow(3_000), false)
    assert.equal(allow(9_999), false)
    assert.equal(allow(10_000), true)
})
