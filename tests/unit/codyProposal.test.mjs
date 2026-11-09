/**
 * Unit tests for composables/codyProposal.ts and the card that uses it.
 *
 * Cody AI never writes a record on its own: create_task and
 * draft_journal_note only propose, and the record exists once the user
 * presses the button. The cases that would quietly go wrong: a used or
 * expired proposal offering the button again, a failed request losing the
 * proposal, the card not being drawn at all (the client drops unknown card
 * types), and a language missing the copy.
 *
 *   node --test tests/unit/codyProposal.test.mjs
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
    canAct, isProposalCard, stateAfterConfirm, PROPOSAL_CARDS, PROPOSAL_EXPIRED_CODES,
    TASK_PROPOSAL_CARD, JOURNAL_PROPOSAL_CARD,
} from '../../composables/codyProposal.ts'

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

const taskCard = { type: 'task', ref: 'uuid-1', title: 'Ring til apoteket', subtitle: 'Visitation', facts: [], link: '/tasks' }
const journalCard = { type: 'journal_note', ref: 'uuid-2', title: 'Observation', subtitle: 'Ingrid', badges: ['draft', 'ai'], link: '/citizens/c/journals' }

describe('isProposalCard - which cards carry a button', () => {
    test('the task and the journal draft proposal, nothing else', () => {
        assert.equal(isProposalCard(TASK_PROPOSAL_CARD), true)
        assert.equal(isProposalCard(JOURNAL_PROPOSAL_CARD), true)
        for (const type of ['task', 'journal_note', 'shift_day', 'milo', 'toString', '__proto__', undefined, null, 42]) {
            assert.equal(isProposalCard(type), false, String(type))
        }
    })

    test('each proposal becomes the card the product already draws', () => {
        assert.equal(PROPOSAL_CARDS.task_proposal.created, 'task')
        assert.equal(PROPOSAL_CARDS.journal_note_proposal.created, 'journal_note')
    })
})

describe('stateAfterConfirm - what the card shows after the button', () => {
    test('a created task becomes the normal task card', () => {
        assert.deepEqual(stateAfterConfirm({ ok: true, body: { data: taskCard } }, TASK_PROPOSAL_CARD), { kind: 'created', card: taskCard })
        assert.deepEqual(stateAfterConfirm({ ok: true, body: { data: taskCard } }), { kind: 'created', card: taskCard }, 'task by default')
    })

    test('a saved journal draft becomes the journal note card', () => {
        assert.deepEqual(stateAfterConfirm({ ok: true, body: { data: journalCard } }, JOURNAL_PROPOSAL_CARD), { kind: 'created', card: journalCard })
    })

    test('a card of the wrong type is not drawn, but the write is still reported', () => {
        assert.deepEqual(stateAfterConfirm({ ok: true, body: { data: null } }, TASK_PROPOSAL_CARD), { kind: 'created', card: null })
        assert.deepEqual(stateAfterConfirm({ ok: true, body: { data: journalCard } }, TASK_PROPOSAL_CARD), { kind: 'created', card: null })
        assert.deepEqual(stateAfterConfirm({ ok: true, body: { data: taskCard } }, JOURNAL_PROPOSAL_CARD), { kind: 'created', card: null })
    })

    test('a used, expired or foreign proposal is expired, never offered again', () => {
        for (const code of PROPOSAL_EXPIRED_CODES) {
            assert.deepEqual(stateAfterConfirm({ ok: false, error: { code, status: 404 } }, JOURNAL_PROPOSAL_CARD), { kind: 'expired' })
        }
        assert.deepEqual(stateAfterConfirm({ ok: false, error: { status: 404 } }), { kind: 'expired' })
    })

    test('any other failure keeps the proposal and says it failed', () => {
        assert.deepEqual(stateAfterConfirm({ ok: false, error: { status: 400, message: 'no app' } }), { kind: 'proposal', failed: true })
        assert.deepEqual(stateAfterConfirm({ ok: false, error: { status: 403 } }, JOURNAL_PROPOSAL_CARD), { kind: 'proposal', failed: true })
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
    test('the client keeps proposal cards and the answer card hands them to the proposal card', () => {
        const chat = read('composables/useCodyChat.ts')
        assert.match(chat, /isProposalCard\(type\)/)
        assert.equal(chat.split('isDrawnCard(').length - 1, 3, 'defined once, used for streamed and buffered cards')
        assert.match(read('components/modules/user/assistant/answer-card.vue'),
            /<ModulesUserAssistantProposalCard v-if="isProposalCard\(card.type\)" :card="card" \/>/)
    })

    test('the button sends only the token, to the one proposals endpoint', () => {
        const service = read('components/api/user/CodyProposalService.ts')
        assert.match(service, /const BASE = '\/user\/cody\/proposals'/)
        assert.match(service, /\$\{BASE\}\/\$\{encodeURIComponent\(token\)\}`, 'POST'\)/)
        assert.match(read('components/modules/user/assistant/proposal-card.vue'), /codyProposalService\.confirm\(props\.card\.ref\)/)
    })

    test('the draft preview is shown as text, never as markup', () => {
        const card = read('components/modules/user/assistant/proposal-card.vue')
        assert.match(card, /\{\{ card\.preview \}\}/)
        assert.doesNotMatch(card, /v-(safe-)?html/)
    })

    test('the confirm animation is off for reduced motion', () => {
        assert.match(read('components/modules/user/assistant/proposal-card.vue'), /@media \(prefers-reduced-motion: reduce\)/)
    })

    test('every language has the copy for every proposal', () => {
        const keys = ['label', 'badge', 'subject', 'create', 'creating', 'cancel', 'created', 'declined', 'expired', 'failed']
        for (const lang of ['dk', 'en', 'no', 'sv']) {
            const assistants = JSON.parse(read(`lang/${lang}.json`)).assistants
            for (const { copy } of Object.values(PROPOSAL_CARDS)) {
                for (const key of keys) assert.ok(assistants[copy]?.[key], `${lang}: assistants.${copy}.${key}`)
            }
        }
        const dk = JSON.parse(read('lang/dk.json')).assistants
        assert.equal(dk.taskProposal.create, 'Opret opgave')
        assert.equal(dk.taskProposal.cancel, 'Annullér')
        assert.equal(dk.taskProposal.badge, 'Forslag fra Cody AI')
        assert.equal(dk.journalProposal.create, 'Gem kladde')
        assert.equal(dk.journalProposal.cancel, 'Annullér')
    })
})
