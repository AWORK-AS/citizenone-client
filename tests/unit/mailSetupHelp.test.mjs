import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Roadmap #260: a question mark with help text on every field of Mail -> Connect mail.

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8')
const langs = ['dk', 'en', 'no', 'sv'].map((code) => [code, JSON.parse(read(`lang/${code}.json`))])
const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)

const modal = read('components/modules/user/mail/modal-configure-smtp.vue')
const label = read('components/form/LabelWithHelp.vue')

const FIELDS = [
    ['smtp_host', 'smtpHost'], ['smtp_port', 'smtpPort'], ['smtp_username', 'smtpUsername'],
    ['smtp_password', 'smtpPassword'], ['smtp_encryption', 'smtpEncryption'], ['imap_host', 'imapHost'],
    ['imap_port', 'imapPort'], ['imap_username', 'imapUsername'], ['imap_password', 'imapPassword'],
    ['imap_encryption', 'imapEncryption'],
]

describe('mail setup help', () => {
    test('every one of the 10 fields has a help label tied to its own help text', () => {
        assert.equal((modal.match(/<FormLabelWithHelp\b/g) || []).length, FIELDS.length)
        assert.doesNotMatch(modal, /<FormLabel\b/)
        for (const [id, key] of FIELDS) {
            const pattern = new RegExp(`<FormLabelWithHelp for="${id}"[^>]*?:help="\\$t\\('mail\\.settings\\.help\\.${key}'\\)"`)
            assert.match(modal, pattern, id)
        }
    })

    test('the question mark never submits the form and can be used by keyboard and touch', () => {
        assert.match(label, /<button type="button"/)
        assert.match(label, /:aria-label="props\.helpLabel"/)
        assert.match(label, /@click\.stop\.prevent="toggle"/)
        // A finger also fires pointerenter before the tap, so only a mouse opens it by hovering.
        assert.match(label, /event\.pointerType === 'mouse'/)
        assert.match(label, /event\.key !== 'Escape'/)
    })

    test('the line at the top and the two grey hints are there, and the provider buttons stay', () => {
        assert.match(modal, /\$t\('mail\.settings\.help\.findSettings'\)/)
        assert.match(modal, /\$t\('mail\.settings\.hint\.smtpHost'\)/)
        assert.match(modal, /\$t\('mail\.settings\.hint\.smtpPort'\)/)
        assert.match(modal, /@click="useProvider\(provider\)"/)
    })

    test('picking Gmail or Outlook opens its guide', () => {
        assert.match(modal, /provider\.guide === 'gmail'\) state\.isGuideOpen = true/)
        assert.match(modal, /provider\.guide === 'microsoft'\) state\.isMicrosoftGuideOpen = true/)
        assert.match(modal, /name: 'Outlook \/ Microsoft 365', guide: 'microsoft'/)
    })

    for (const [code, lang] of langs) {
        test(`all help texts and the Microsoft guide exist in ${code}`, () => {
            const keys = [
                ...FIELDS.map(([, key]) => `mail.settings.help.${key}`),
                'mail.settings.help.findSettings', 'mail.settings.help.ariaLabel',
                'mail.settings.hint.smtpHost', 'mail.settings.hint.smtpPort',
                ...['title', 'intro', 'step1', 'step2', 'step3', 'step4', 'workAccountNote'].map((k) => `mail.settings.microsoftGuide.${k}`),
            ]
            for (const path of keys) {
                const value = get(lang, path)
                assert.equal(typeof value, 'string', `${code} ${path}`)
                assert.ok(value.trim().length > 0, `${code} ${path}`)
            }
            assert.match(get(lang, 'mail.settings.help.ariaLabel'), /\{field\}/)
        })
    }
})
