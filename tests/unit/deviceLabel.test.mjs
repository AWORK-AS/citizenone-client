/**
 * Unit tests for utils/deviceLabel.ts - the readable device name on the
 * approved-devices list (task 613). User-Agents are real headers from current
 * browsers.
 *
 *   node --test tests/unit/deviceLabel.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

const { deviceLabel } = await import('../../utils/deviceLabel.ts')

describe('deviceLabel', () => {
    const cases = [
        ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 'Chrome · macOS'],
        ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0', 'Edge · Windows'],
        ['Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0', 'Firefox · Windows'],
        ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', 'Safari · macOS'],
        ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', 'Safari · iOS'],
        ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1', 'Safari · iOS'],
        ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.0.0 Mobile/15E148 Safari/604.1', 'Chrome · iOS'],
        ['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', 'Chrome · Android'],
        ['Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36', 'Samsung Internet · Android'],
        ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/120.0.0.0', 'Opera · Windows'],
        ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) citizenone-desktop/1.4.0 Chrome/138.0.0.0 Electron/37.2.0 Safari/537.36', 'CitizenOne desktop · Windows'],
        ['Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0', 'Firefox · Linux'],
    ]

    for (const [ua, expected] of cases) {
        test(expected, () => assert.equal(deviceLabel(ua), expected))
    }

    test('the app\'s own readable user_agent is shown as it is', () => {
        assert.equal(deviceLabel('CitizenOne app · iOS 18 · iPhone'), 'CitizenOne app · iOS 18 · iPhone')
    })

    test('empty or missing gives an empty string', () => {
        assert.equal(deviceLabel(''), '')
        assert.equal(deviceLabel('   '), '')
        assert.equal(deviceLabel(null), '')
        assert.equal(deviceLabel(undefined), '')
    })

    test('an unknown header gives what it can, or nothing', () => {
        assert.equal(deviceLabel('curl/8.7.1'), '')
        assert.equal(deviceLabel('SomeBot/1.0 (Windows NT 10.0)'), 'Windows')
    })
})
