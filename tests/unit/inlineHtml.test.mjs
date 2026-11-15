/**
 * Escaping for the HTML pages the OAuth callback routes answer with
 * (server/utils/inlineHtml.ts). /api/danlon/callback put ?error= straight into
 * the page and into an inline script, on the app's own origin and without login.
 *
 *   node --test tests/unit/inlineHtml.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { escapeHtml, jsStringLiteral } from '../../server/utils/inlineHtml.ts'

test('markup in text is shown, not parsed', () => {
    assert.equal(
        escapeHtml('<img src=x onerror=alert(1)>'),
        '&lt;img src=x onerror=alert(1)&gt;',
    )
    assert.equal(escapeHtml(`"a" & 'b'`), '&quot;a&quot; &amp; &#39;b&#39;')
    assert.equal(escapeHtml(undefined), '')
})

test('a value cannot leave its string literal', () => {
    for (const hostile of [`';alert(1);//`, `\\';alert(1);//`, '"+alert(1)+"', 'line\nbreak', 'a\u2028b']) {
        const context = { alerted: false, alert: () => { context.alerted = true } }
        const result = vm.runInNewContext(`(${jsStringLiteral(hostile)})`, context)

        assert.equal(result, hostile)
        assert.equal(context.alerted, false, hostile)
    }
})

test('a value cannot close the script block', () => {
    const literal = jsStringLiteral('</script><script>alert(1)</script>')

    assert.ok(!literal.includes('<'), literal)
    assert.ok(!literal.includes('>'), literal)
    assert.equal(vm.runInNewContext(`(${literal})`), '</script><script>alert(1)</script>')
})

test('an encoded redirect target stays one string', () => {
    // encodeURIComponent leaves the apostrophe alone, which ended the old '...' literal.
    const target = '/apps?error=' + encodeURIComponent(`';alert(1);//`)
    const context = { alerted: false, alert: () => { context.alerted = true } }

    assert.equal(vm.runInNewContext(`(${jsStringLiteral(target)})`, context), target)
    assert.equal(context.alerted, false)
})
