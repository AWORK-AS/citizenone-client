/**
 * Unit tests for utils/pdfFormEditorHtml.ts - the page the KRAP worksheets are filled in on (task #94),
 * shared with the mobile app.
 *
 *   node --test tests/unit/pdfFormEditorHtml.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { pdfFormEditorHtml } from '../../utils/pdfFormEditorHtml.ts'

const labels = {
    addText: 'Tilføj tekst',
    addTextHint: 'Tryk der, hvor teksten skal stå.',
    done: 'Færdig',
    remove: 'Fjern',
    textPlaceholder: 'Skriv her',
    noFields: 'Skemaet har ingen felter.',
}

describe('the PDF editor page', () => {
    test('gets the worksheet as data, not as a URL it would need a token for', () => {
        const html = pdfFormEditorHtml('JVBERi0xLjQK', labels)
        assert.ok(html.includes("atob('JVBERi0xLjQK')"))
        assert.doesNotMatch(html, /getDocument\(\s*['"]https?:/)
    })

    test('accepts only base64, so nothing can break out of the script', () => {
        assert.throws(() => pdfFormEditorHtml("abc');alert(1);//", labels))
    })

    test('a label cannot close the script it is written into', () => {
        const closings = (html) => html.match(/<\/script>/g).length
        const plain = pdfFormEditorHtml('JVBERi0xLjQK', labels)
        const hostile = pdfFormEditorHtml('JVBERi0xLjQK', { ...labels, done: '</script><script>alert(1)</script>' })
        assert.equal(closings(hostile), closings(plain))
    })

    test('answers the host on both the web (frame) and the app (WebView)', () => {
        const html = pdfFormEditorHtml('JVBERi0xLjQK', labels)
        assert.ok(html.includes('window.ReactNativeWebView.postMessage'))
        assert.ok(html.includes('window.parent.postMessage'))
        assert.ok(html.includes("message.type === 'save'"))
        assert.ok(html.includes('window.ctxEditor = { save: save }'))
    })

    test('writes the answers into the PDF\'s own fields, so the copy stays editable', () => {
        const html = pdfFormEditorHtml('JVBERi0xLjQK', labels)
        assert.ok(html.includes('target.setText('))
        assert.ok(html.includes('target.check()'))
        assert.ok(html.includes('form.createTextField('))
        assert.doesNotMatch(html, /\.flatten\(/)
    })
})
