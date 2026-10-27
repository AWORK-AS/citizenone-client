/**
 * Policy for AI-generated HTML (composables/aiHtmlPolicy.ts). DOMPurify needs a
 * DOM (jsdom is not installed for the unit suite), so this tests the config
 * handed to DOMPurify and the allow/deny helpers, not DOMPurify's own output.
 * The browser-side sanitize call is a thin wrapper over AI_SANITIZE_CONFIG.
 *
 *   node --test tests/unit/aiHtmlPolicy.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    AI_SANITIZE_CONFIG, AI_FORBID_TAGS, AI_FORBID_ATTR, AI_LINK_REL,
    isAiTagAllowed, isAiAttrAllowed, isAiUriAllowed, hardenAiLink,
} from '../../composables/aiHtmlPolicy.ts'

test('every element that can load a remote resource is forbidden', () => {
    for (const t of ['img', 'picture', 'source', 'video', 'audio', 'iframe', 'object', 'embed', 'svg', 'math', 'style', 'link', 'IMG']) {
        assert.equal(isAiTagAllowed(t), false, t)
        if (t === t.toLowerCase()) assert.ok(AI_SANITIZE_CONFIG.FORBID_TAGS.includes(t), t)
    }
})

test('ordinary formatting and links stay allowed', () => {
    for (const t of ['a', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'h3', 'table', 'code']) {
        assert.equal(isAiTagAllowed(t), true, t)
    }
})

test('style and resource-loading attributes are stripped', () => {
    for (const a of ['style', 'src', 'srcset', 'background', 'poster', 'xlink:href', 'SRC', 'onerror', 'onclick']) {
        assert.equal(isAiAttrAllowed(a), false, a)
    }
    assert.equal(isAiAttrAllowed('href'), true)
    assert.equal(isAiAttrAllowed('target'), true)
    assert.deepEqual(AI_SANITIZE_CONFIG.FORBID_ATTR, AI_FORBID_ATTR)
    assert.deepEqual(AI_SANITIZE_CONFIG.FORBID_TAGS, AI_FORBID_TAGS)
})

test('only http, https and mailto URLs are allowed', () => {
    assert.equal(isAiUriAllowed('https://example.com/a?b=1'), true)
    assert.equal(isAiUriAllowed('http://example.com'), true)
    assert.equal(isAiUriAllowed('mailto:a@example.com'), true)
    assert.equal(isAiUriAllowed('javascript:alert(1)'), false)
    assert.equal(isAiUriAllowed('java\tscript:alert(1)'), false)
    assert.equal(isAiUriAllowed('data:text/html;base64,AAAA'), false)
    assert.equal(isAiUriAllowed('tel:+4500000000'), false)
    assert.equal(isAiUriAllowed('//evil.example/x'), false)
})

test('links are forced to open safely', () => {
    const attrs = {}
    hardenAiLink({ setAttribute: (k, v) => { attrs[k] = v } })
    assert.deepEqual(attrs, { target: '_blank', rel: 'noopener noreferrer nofollow' })
    assert.equal(AI_LINK_REL, 'noopener noreferrer nofollow')
})

test('data attributes are not allowed', () => {
    assert.equal(AI_SANITIZE_CONFIG.ALLOW_DATA_ATTR, false)
})
