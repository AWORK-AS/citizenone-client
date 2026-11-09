/**
 * Unit tests for composables/codyTaskProposal.ts and the card that uses it.
 *
 * Cody AI never creates a task on its own: create_task only proposes, and the
 * task exists once the user presses "Opret opgave". The cases that would
 * quietly go wrong: a used or expired proposal offering the button again, a
 * failed request losing the proposal, the card not being drawn at all (the
 * client drops unknown card types), and a language missing the copy.
 *
 *   node --test tests/unit/codyTaskProposal.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { canAct, stateAfterConfirm, TASK_PROPOSAL_CARD, TASK_PROPOSAL_EXPIRED } from '../../composables/codyTaskProposal.ts'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

const taskCard = { type: 'task', ref: 'uuid-1', title: 'Ring til apoteket', subtitle: 'Visitation', facts: [], link: '/tasks' }

describe('stateAfterConfirm - what the card shows after "Opret opgave"', () => {
    test('a created task becomes the normal task card', () => {
        assert.deepEqual(stateAfterConfirm({ ok: true, body: { data: taskCard } }), { kind: 'created', card: taskCard })
    })

    test('a created task the server could not draw still says it was created', () => {
        assert.deepEqual(stateAfterConfirm({ ok: true, body: { data: null } }), { kind: 'created', card: null })
        assert.deepEqual(stateAfterConfirm({ ok: true, body: { data: { type: 'journal_note', ref: 'x', title: 'y' } } }), { kind: 'created', card: null })
    })

    test('a used, expired or foreign proposal is expired, never offered again', () => {
        assert.deepEqual(stateAfterConfirm({ ok: false, error: { code: TASK_PROPOSAL_EXPIRED, status: 404 } }), { kind: 'expired' })
        assert.deepEqual(stateAfterConfirm({ ok: false, error: { status: 404 } }), { kind: 'expired' })
    })

    test('any other failure keeps the proposal and says it failed', () => {
        assert.deepEqual(stateAfterConfirm({ ok: false, error: { status: 400, message: 'no app' } }), { kind: 'proposal', failed: true })
        assert.deepEqual(stateAfterConfirm({ ok: false, error: undefined }), { kind: 'proposal', failed: true })
    })
})

describe('canAct - when the buttons work', () => {
    test('only an idle proposal on a finished answer', () => {
        assert.equal(canAct({ kind: 'proposal' }, false), true)
        assert.equal(canAct({ kind: 'proposal', failed: true }, false), true)
        assert.equal(canAct({ kind: 'proposal', busy: true }, false), false, 'a double click makes one request')
        assert.equal(canAct({ kind: 'proposal' }, true), false, 'not while the answer is still arriving')
        assert.equal(canAct({ kind: 'created', card: null }, false), false)
        assert.equal(canAct({ kind: 'expired' }, false), false)
        assert.equal(canAct({ kind: 'declined' }, false), false)
    })
})

describe('wiring', () => {
    test('the client keeps the card type and the answer card hands it to the proposal card', () => {
        assert.equal(TASK_PROPOSAL_CARD, 'task_proposal')
        const chat = read('composables/useCodyChat.ts')
        assert.match(chat, /type === TASK_PROPOSAL_CARD/)
        assert.equal(chat.split('isDrawnCard(').length - 1, 3, 'defined once, used for streamed and buffered cards')
        assert.match(read('components/modules/user/assistant/answer-card.vue'),
            /<ModulesUserAssistantTaskProposalCard v-if="card.type === TASK_PROPOSAL_CARD" :card="card" \/>/)
    })

    test('the button sends only the token', () => {
        const service = read('components/api/user/CodyTaskProposalService.ts')
        assert.match(service, /\$\{BASE\}\/\$\{encodeURIComponent\(token\)\}`, 'POST'\)/)
        assert.match(read('components/modules/user/assistant/task-proposal-card.vue'), /codyTaskProposalService\.confirm\(props\.card\.ref\)/)
    })

    test('the confirm animation is off for reduced motion', () => {
        assert.match(read('components/modules/user/assistant/task-proposal-card.vue'), /@media \(prefers-reduced-motion: reduce\)/)
    })

    test('every language has the card copy', () => {
        const keys = ['label', 'badge', 'board', 'create', 'creating', 'cancel', 'created', 'declined', 'expired', 'failed']
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const copy = JSON.parse(read(`lang/${lang}.json`)).assistants.taskProposal
            for (const key of keys) assert.ok(copy?.[key], `${lang}: assistants.taskProposal.${key}`)
        }
        const dk = JSON.parse(read('lang/dk.json')).assistants.taskProposal
        assert.equal(dk.create, 'Opret opgave')
        assert.equal(dk.cancel, 'Annullér')
        assert.equal(dk.badge, 'Forslag fra Cody AI')
    })
})
