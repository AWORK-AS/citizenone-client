/**
 * The support chat (Milo) from inside the app: the Support button, and what
 * the chat is told about the page the user is on.
 *
 *   node --test tests/unit/supportChat.test.mjs
 */
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { SECTION_LABEL_KEYS, supportChatPage } from '../../composables/supportChatPage.ts'

const root = path.resolve(import.meta.dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const langs = Object.fromEntries(['dk', 'en', 'no', 'sv'].map((l) => [l, JSON.parse(read(`lang/${l}.json`))]))
const get = (o, k) => k.split('.').reduce((a, p) => a?.[p], o)

describe('what the chat is told about the page', () => {
    test('a section is named by its menu key, never by anything from the path itself', () => {
        assert.deepEqual(supportChatPage('/citizens/0b6f6c1e-8f3a-4a57-9a52-3f1f0c2c9d11/journal'), { hidden: false, labelKey: 'sidebar.citizens' })
        assert.deepEqual(supportChatPage('/schedules?week=42#monday'), { hidden: false, labelKey: 'sidebar.dutySchedules' })
        assert.deepEqual(supportChatPage('/overview'), { hidden: false, labelKey: 'sidebar.overview' })
    })

    test('a section without a name sends none, so the previous name is cleared', () => {
        assert.deepEqual(supportChatPage('/settings/roles'), { hidden: false, labelKey: null })
        assert.deepEqual(supportChatPage('/'), { hidden: false, labelKey: null })
        assert.deepEqual(supportChatPage(''), { hidden: false, labelKey: null })
    })

    test('an object property name in the path is not mistaken for a section', () => {
        assert.equal(supportChatPage('/constructor').labelKey, null)
        assert.equal(supportChatPage('/__proto__/x').labelKey, null)
    })

    test('the chat is hidden in superadmin and only there', () => {
        assert.equal(supportChatPage('/superadmin').hidden, true)
        assert.equal(supportChatPage('/superadmin/companies/12').hidden, true)
        assert.equal(supportChatPage('/citizens').hidden, false)
        assert.equal(supportChatPage('/my-superadmin-notes').hidden, false)
    })

    test('every section name exists in all four languages', () => {
        const missing = []
        for (const key of new Set(Object.values(SECTION_LABEL_KEYS))) {
            for (const [lang, messages] of Object.entries(langs)) {
                if (typeof get(messages, key) !== 'string') missing.push(`${lang}: ${key}`)
            }
        }
        assert.deepEqual(missing, [])
    })

    test('the plugin applies the page on start, on navigation and once the widget has arrived', () => {
        const plugin = read('plugins/obiyen-chat.client.ts')
        assert.match(plugin, /const \{ hidden, labelKey \} = supportChatPage\(path\)/)
        assert.match(plugin, /chat\.setHiddenHere\(hidden\)/)
        // Once the widget's bubble exists, on mount, and on every navigation.
        assert.equal(plugin.match(/followPage\(/g)?.length, 3)
        assert.match(plugin, /followPage\(to\.path\)/)
        assert.match(plugin, /\} catch \{ \/\* Milo just goes without the page name \*\/ \}/)
    })
})

describe('the Support button', () => {
    test('opens the chat in one click and falls back to the support panel when the chat is missing', () => {
        const layout = read('layouts/user.vue')
        assert.match(layout, /<button type="button" @click="openSupportChat"/)
        assert.match(layout, /\{\{ \$t\('support\.support'\) \}\}/)
        assert.match(layout, /function openSupportChat\(\) \{\n\s*if \(!useObiyenChat\(\)\.revealAndOpenChat\(\)\) openSupport\(\)\n\}/)
    })

    test('opening the chat reports failure when the widget has not loaded', () => {
        const chat = read('composables/useObiyenChat.ts')
        assert.match(chat, /function revealAndOpenChat\(\): boolean \{/)
        assert.match(chat, /if \(!bubble\) return false/)
    })

    test('the help menu keeps the guides under a name that is not "Support"', () => {
        const menu = read('components/modules/user/navbar/help-menu.vue')
        assert.match(menu, /\$t\('support\.helpAndResources'\)/)
        assert.doesNotMatch(menu, /\$t\('support\.support'\)/)
        for (const [lang, messages] of Object.entries(langs)) {
            assert.equal(typeof messages.support?.helpAndResources, 'string', lang)
            assert.notEqual(messages.support.helpAndResources, messages.support.support, lang)
        }
    })
})
