<template>
    <Transition name="cody-task" mode="out-in">
        <!-- Created: the normal task card, with a short confirmation above it. -->
        <div v-if="proposal.kind === 'created'" key="created">
            <p role="status" class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-green-700">
                <Icon name="ph:check-circle-fill" class="cody-task-check size-4" aria-hidden="true" />
                {{ $t('assistants.taskProposal.created') }}
            </p>
            <ModulesUserAssistantAnswerCard v-if="proposal.card" :card="proposal.card" />
        </div>

        <p v-else-if="proposal.kind === 'declined'" key="declined" role="status"
            class="rounded-xl border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-400">
            {{ $t('assistants.taskProposal.declined') }}
        </p>

        <div v-else key="proposal" role="group" :aria-label="$t('assistants.taskProposal.label')"
            :class="['rounded-xl border bg-white px-3 py-2.5',
                proposal.kind === 'expired' ? 'border-gray-200 opacity-70' : 'border-cody/40']">
            <div class="flex items-start gap-2.5">
                <Icon name="ph:check-square-offset" class="mt-0.5 size-4 shrink-0 text-cody-deep" aria-hidden="true" />
                <div class="min-w-0 flex-1">
                    <span class="mb-1 inline-block rounded-full bg-ai-bg px-2 py-0.5 text-[10.5px] font-medium text-ai-ink">
                        {{ $t('assistants.taskProposal.badge') }}
                    </span>
                    <p class="break-words text-[13px] font-semibold text-gray-900">{{ card.title }}</p>
                    <p v-if="card.subtitle" class="truncate text-xs text-gray-500">
                        {{ $t('assistants.taskProposal.board') }}: {{ card.subtitle }}
                    </p>
                    <p v-for="fact in card.facts ?? []" :key="fact.label" class="text-xs text-gray-500">
                        {{ $t(`assistants.cards.facts.${fact.label}`) }}: {{ fact.value }}
                    </p>
                </div>
            </div>

            <p v-if="proposal.kind === 'expired'" role="status" class="mt-2 pl-[26px] text-xs text-gray-500">
                {{ $t('assistants.taskProposal.expired') }}
            </p>
            <template v-else>
                <p v-if="proposal.failed" role="alert" class="mt-2 pl-[26px] text-xs text-amber-800">
                    {{ $t('assistants.taskProposal.failed') }}
                </p>
                <div class="mt-2.5 flex flex-wrap items-center gap-2 pl-[26px] text-xs">
                    <button type="button" :disabled="!actionable" :aria-busy="proposal.busy ? 'true' : undefined"
                        class="inline-flex items-center gap-1.5 rounded bg-primary px-2.5 py-1 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                        @click="confirm">
                        <Icon v-if="proposal.busy" name="ph:spinner" class="size-3.5 animate-spin" aria-hidden="true" />
                        {{ proposal.busy ? $t('assistants.taskProposal.creating') : $t('assistants.taskProposal.create') }}
                    </button>
                    <button type="button" :disabled="!actionable"
                        class="rounded border border-blue-200 bg-white px-2.5 py-1 font-medium text-blue-700 hover:border-blue-700 disabled:opacity-50"
                        @click="decline">
                        {{ $t('assistants.taskProposal.cancel') }}
                    </button>
                </div>
            </template>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { codyTaskProposalService } from '@/components/api/user/CodyTaskProposalService'
import { canAct, stateAfterConfirm, type TaskProposalState } from '@/composables/codyTaskProposal'
import type { AnswerCard } from '@/composables/useCodyChat'

/**
 * A task Cody AI proposed, with the button that creates it.
 *
 * Cody AI never creates a task itself: text it reads can be written to steer
 * it, so the tool only proposes, and this card is where the user decides.
 * Every field was built by the server from its own copy of the proposal; the
 * button sends back only the card's ref, the token the server issued.
 *
 * The outcome is kept per token in shared state rather than in the component,
 * because the same proposal is drawn twice - live while the answer streams,
 * then with the finished answer - and a remount must not offer the button
 * again for a task that already exists.
 */
const props = defineProps<{ card: AnswerCard }>()

const { state: chat } = useCodyChat()

const proposal = useState<TaskProposalState>(`cody-task-proposal:${props.card.ref}`, () => ({ kind: 'proposal' }))

// Not while this answer is still arriving: the finished answer re-draws the
// card, and pressing in between would race it.
const answering = computed(() =>
    (chat.isGeneratingResponse || chat.isStreaming) && chat.cards.some((card) => card.ref === props.card.ref))

const actionable = computed(() => canAct(proposal.value, answering.value))

async function confirm() {
    if (!actionable.value) return

    proposal.value = { kind: 'proposal', busy: true }
    try {
        proposal.value = stateAfterConfirm({ ok: true, body: await codyTaskProposalService.confirm(props.card.ref) })
    } catch (error: any) {
        proposal.value = stateAfterConfirm({ ok: false, error })
    }
}

function decline() {
    if (!actionable.value) return

    proposal.value = { kind: 'declined' }
    // Best effort: an unconfirmed proposal expires on its own anyway.
    codyTaskProposalService.decline(props.card.ref).catch(() => {})
}
</script>

<style scoped>
.cody-task-enter-active,
.cody-task-leave-active {
    transition: opacity 180ms ease, transform 180ms ease;
}

.cody-task-enter-from {
    opacity: 0;
    transform: translateY(4px);
}

.cody-task-leave-to {
    opacity: 0;
}

.cody-task-check {
    animation: cody-task-check-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes cody-task-check-in {
    from {
        opacity: 0;
        transform: scale(0.4);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .cody-task-enter-active,
    .cody-task-leave-active {
        transition: none;
    }

    .cody-task-enter-from {
        transform: none;
    }

    .cody-task-check {
        animation: none;
    }
}
</style>
