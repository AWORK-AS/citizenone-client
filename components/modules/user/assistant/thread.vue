<template>
    <!-- Chat container. Messages are top-anchored, including the initial
    greeting, so the conversation always reads downward from the same starting
    point. -->
    <div class="flex-1 overflow-y-auto scroll-smooth">
        <div class="cody-thread px-4 py-5 space-y-5">
            <div v-for="(message, index) in state.messages" :key="index">
                <!-- What you said. A bubble only as wide as its text, hung on the
                right: the full-width dark slab it used to be read as a banner or a
                button, not as something a person had said. -->
                <div v-if="message.type === 'user'" class="flex justify-end">
                    <div class="max-w-[85%] rounded-[15px] rounded-br-[4px] bg-primary px-3.5 py-2">
                    <div v-if="message.files && message.files.length > 0"
                        class="flex flex-wrap gap-1.5 justify-end mb-2">
                        <div v-for="(file, fIdx) in message.files" :key="fIdx"
                            class="flex items-center gap-1.5 text-xs bg-white/20 text-white px-2.5 py-1.5 rounded-md">
                            <Icon name="ph:file" class="h-3.5 w-3.5 shrink-0" />
                            <span class="max-w-[150px] truncate">{{ file.name }}</span>
                        </div>
                    </div>
                    <div class="text-sm text-white leading-relaxed whitespace-pre-wrap">{{ message?.text }}</div>
                    </div>
                </div>

                <!-- Cody's answer. The card, the border and the name above every
                reply were three layers of chrome that made the panel read as a form;
                without them the text gets the full width and Cody sounds like a
                colleague rather than a system returning a record. -->
                <div v-else class="flex items-start gap-2.5">
                    <ModulesUserNavbarCodyMark :size="20" class="mt-0.5 shrink-0"
                        :state="message.failed || (message.companyDataStatus && message.companyDataStatus !== 'ready') ? 'blocked' : 'idle'" />
                    <div class="flex-1 min-w-0">
                        <!-- A refusal is something Cody says, so it sits where the
                        answer would have been rather than in a red banner at the top
                        of the panel, detached from the question that caused it. -->
                        <p v-if="message.failed" class="text-sm leading-relaxed text-gray-600">{{ message.text }}</p>
                        <div v-else class="ai-answer text-sm text-gray-800 leading-relaxed"
                            v-safe-ai-html="formatMessage(shownText(message, index))" />

                        <!-- An answer with no company data behind it is not the same as an
                        answer that found nothing, and it used to look identical. -->
                        <p v-if="message.companyDataStatus && message.companyDataStatus !== 'ready'"
                            class="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                            <Icon name="ph:warning-circle" class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                            <span>
                                {{ message.companyDataStatus === 'missing'
                                    ? $t('assistants.companyDataMissing')
                                    : $t('assistants.companyDataBuilding') }}
                            </span>
                        </p>

                        <!-- What Cody AI asks to remember. Never stored on its own: the
                        sentence is shown as a question, and only "Ja" keeps it. Teal, since
                        it is the AI speaking about itself; the answer buttons are actions,
                        so blue. -->
                        <div v-if="message.memoryNote?.kind === 'proposal'" role="group"
                            :aria-label="$t('assistants.memory.askLabel')"
                            class="mt-2 rounded-md bg-ai-bg px-2.5 py-2 text-xs text-ai-ink">
                            <p class="flex items-start gap-1.5">
                                <Icon name="ph:brain" class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                                <span>{{ $t('assistants.memory.ask', { content: message.memoryNote.content }) }}</span>
                            </p>
                            <p v-if="message.memoryNote.failed" class="mt-1 text-amber-800">
                                {{ $t('assistants.memory.failed') }}
                            </p>
                            <div class="mt-1.5 flex items-center gap-2 pl-5">
                                <button type="button" :disabled="message.memoryNote.busy"
                                    class="rounded bg-primary px-2.5 py-1 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                                    @click="confirmMemory(message)">
                                    {{ $t('assistants.memory.yes') }}
                                </button>
                                <button type="button" :disabled="message.memoryNote.busy"
                                    class="rounded border border-blue-200 bg-white px-2.5 py-1 font-medium text-blue-700 hover:border-blue-700 disabled:opacity-50"
                                    @click="declineMemory(message)">
                                    {{ $t('assistants.memory.no') }}
                                </button>
                            </div>
                        </div>

                        <!-- The very first memory gets a small moment of its own: it is when
                        Cody AI starts to know this person, and where to find and delete what
                        it knows is worth saying once, clearly. The server says which save is
                        the first (first_saved), so it shows once per user on any device. -->
                        <p v-else-if="message.memoryNote?.kind === 'saved' || message.memoryNote?.kind === 'already_known'"
                            role="status"
                            :class="['mt-2 flex items-start gap-1.5 rounded-md bg-ai-bg px-2 py-1.5 text-xs text-ai-ink',
                                message.memoryNote.kind === 'saved' && message.memoryNote.firstSaved && 'cody-first-memory']">
                            <Icon :name="message.memoryNote.kind === 'saved' && message.memoryNote.firstSaved ? 'ph:sparkle-fill' : 'ph:brain'"
                                :class="['mt-0.5 size-3.5 shrink-0', message.memoryNote.kind === 'saved' && message.memoryNote.firstSaved && 'cody-pop']"
                                aria-hidden="true" />
                            <span>
                                {{ message.memoryNote.kind === 'already_known'
                                    ? $t('assistants.memory.alreadyKnown')
                                    : (message.memoryNote.firstSaved ? $t('assistants.memory.firstSaved') : $t('assistants.memory.saved')) }}
                                <NuxtLink :to="CODY_MEMORY_PAGE" class="font-medium underline underline-offset-2">
                                    {{ $t('assistants.memory.seeWhat') }}
                                </NuxtLink>
                            </span>
                        </p>

                        <p v-else-if="message.memoryNote?.kind === 'refused' || message.memoryNote?.kind === 'expired'"
                            role="status" class="mt-2 text-xs text-gray-600">
                            {{ message.memoryNote.kind === 'refused' ? $t('assistants.memory.refused') : $t('assistants.memory.expired') }}
                        </p>

                        <!-- Cannot remember: the organisation's storage is full. The answer
                        above is complete; only the memory was skipped. Upgrading is an
                        action, so blue, and only offered to whoever may buy. -->
                        <div v-else-if="message.memoryNote?.kind === 'storage_full'" role="status"
                            class="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                            <Icon name="ph:hard-drives" class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                            <div class="min-w-0">
                                <p>{{ $t('assistants.memory.storageFull') }}</p>
                                <p v-if="message.memoryNote.message" class="mt-0.5">{{ message.memoryNote.message }}</p>
                                <button v-if="message.memoryNote.upgradeUrl" type="button"
                                    class="mt-1 font-medium text-blue-700 underline underline-offset-2 hover:text-blue-800"
                                    @click="navigateTo(message.memoryNote.upgradeUrl)">
                                    {{ $t('citizens.documents.upgradeStorage') }}
                                </button>
                            </div>
                        </div>

                        <!-- The records the answer is about, drawn as the product draws
                        them. Every field was built by the server from a reference - the
                        model supplies neither the values nor the link. -->
                        <div v-if="message.cards?.length" class="mt-2.5 grid gap-2">
                            <template v-for="(card, cardIndex) in message.cards" :key="`${card.ref}-${cardIndex}`">
                                <ModulesUserAssistantMiloCard v-if="card.type === 'milo'" :card="card" />
                                <ModulesUserAssistantChatDraftCard v-else-if="card.type === 'chat_message'" :card="card" />
                                <ModulesUserAssistantAnswerCard v-else :card="card" />
                            </template>
                        </div>

                        <!-- What Cody read to get here. Kept with the answer, not only shown
                        while it was working: the receipt is what makes an answer checkable
                        after the fact. -->
                        <ModulesUserAssistantToolTrace v-if="message.receipts?.length" :receipts="message.receipts"
                            class="mt-2" />

                        <!-- Kilde: the journal entry, plan, goal, task, shift or chat the
                        answer rests on. The server chose them and built the links, only
                        for records this user may open; the model names none of it. -->
                        <p v-if="message.sourceLinks?.length"
                            class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                            <span>{{ $t('assistants.sourceLinks.label') }}:</span>
                            <NuxtLink v-for="source in message.sourceLinks" :key="source.link" :to="source.link"
                                :title="$t(`assistants.sourceLinks.kinds.${source.type}`)"
                                class="inline-flex min-w-0 max-w-full items-center gap-1 text-blue-700 underline-offset-2 hover:underline">
                                <Icon :name="SOURCE_ICONS[source.type]" class="size-3.5 shrink-0" aria-hidden="true" />
                                <span class="sr-only">{{ $t(`assistants.sourceLinks.kinds.${source.type}`) }}:</span>
                                <span class="truncate">{{ source.label }}</span>
                            </NuxtLink>
                        </p>

                        <!-- What the answer was actually built from. The backend already
                        resolved these for the audit trail. -->
                        <p v-if="message.sources?.length"
                            class="mt-2 flex flex-wrap items-center gap-1 text-xs text-gray-500">
                            <Icon name="ph:database" class="size-3.5 shrink-0" aria-hidden="true" />
                            <span>{{ $t('assistants.basedOn') }}:</span>
                            <span v-for="source in message.sources" :key="source.uuid"
                                class="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
                                {{ source.name }}
                            </span>
                        </p>

                        <!-- The answer used to be a dead end: read it, then retype it
                        somewhere else. Copy takes the rendered answer as plain text,
                        matching what's actually shown in the bubble above (not the raw HTML
                        string the backend returned). -->
                        <div v-if="index > 0 && !message.failed" class="flex items-center gap-1 mt-2 -ml-1.5">
                            <button type="button" @click="copyAnswer(message, index)"
                                :title="$t('assistants.actions.copy')"
                                class="flex items-center gap-1 px-1.5 py-1 rounded text-xs text-gray-500 hover:text-ai-ink hover:bg-ai-bg transition-colors">
                                <Icon :name="state.copiedIndex === index ? 'ph:check' : 'ph:copy'"
                                    :class="['h-3.5 w-3.5', state.copiedIndex === index && 'cody-pop']" />
                                {{ state.copiedIndex === index ? $t('assistants.actions.copied') :
                                    $t('assistants.actions.copy') }}
                            </button>
                            <button type="button" v-if="assistantStore.insertTargetLabel"
                                @click="assistantStore.requestInsert(formatMessage(message?.text))"
                                :title="assistantStore.insertTargetLabel"
                                class="flex items-center gap-1 px-1.5 py-1 rounded text-xs text-gray-500 hover:text-ai-ink hover:bg-ai-bg transition-colors">
                                <Icon name="ph:arrow-line-down" class="h-3.5 w-3.5" />
                                {{ $t('assistants.actions.insert') }}
                            </button>
                            <button type="button"
                                v-if="index === state.messages.length - 1 && state.lastRequest.prompt"
                                @click="regenerateAnswer" :disabled="state.isGeneratingResponse"
                                :title="$t('assistants.actions.regenerate')"
                                class="flex items-center gap-1 px-1.5 py-1 rounded text-xs text-gray-500 hover:text-ai-ink hover:bg-ai-bg transition-colors disabled:opacity-40">
                                <Icon name="ph:arrow-clockwise" class="h-3.5 w-3.5" />
                                {{ $t('assistants.actions.regenerate') }}
                            </button>
                            <template v-if="message.uuid">
                                <button v-for="rating in RATINGS" :key="rating.value" type="button"
                                    @click="rateAnswer(message, rating.value)"
                                    :aria-label="$t(`assistants.feedback.${rating.value}`)"
                                    :aria-pressed="message.feedback === rating.value"
                                    :title="$t(`assistants.feedback.${rating.value}`)"
                                    :class="['flex size-7 items-center justify-center rounded transition-colors hover:bg-ai-bg',
                                        message.feedback === rating.value ? 'text-ai-ink' : 'text-gray-500 hover:text-ai-ink',
                                        rating.value === 'up' && 'ml-auto']">
                                    <Icon :name="message.feedback === rating.value ? `${rating.icon}-fill` : rating.icon"
                                        :class="['h-3.5 w-3.5', message.feedback === rating.value && 'cody-pop']" aria-hidden="true" />
                                </button>
                            </template>
                        </div>

                        <!-- Why it was bad, in one tap. Asked only right after the thumbs
                        down, and never required: the thumbs alone is already saved. -->
                        <div v-if="message.feedbackGiven && message.feedback === 'down'"
                            class="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span class="text-xs text-gray-600">{{ $t('assistants.feedback.question') }}</span>
                            <button v-for="reason in ANSWER_FEEDBACK_REASONS" :key="reason" type="button"
                                @click="rateAnswer(message, 'down', reason)"
                                :aria-pressed="message.feedbackReason === reason"
                                :class="['rounded-full border px-2.5 py-1 text-xs transition-colors',
                                    message.feedbackReason === reason
                                        ? 'border-ai bg-ai-bg text-ai-ink'
                                        : 'border-gray-200 text-gray-600 hover:border-ai-border']">
                                {{ $t(`assistants.feedback.reasons.${reason}`) }}
                            </button>
                        </div>
                        <p v-if="message.feedbackGiven && (message.feedback === 'up' || message.feedbackReason)"
                            role="status" class="mt-1.5 text-xs text-gray-600">
                            {{ $t('assistants.feedback.thanks') }}
                        </p>
                        <button v-if="message.failed && state.lastRequest.prompt" type="button"
                            @click="regenerateAnswer" :disabled="state.isGeneratingResponse"
                            class="mt-2 -ml-1.5 flex items-center gap-1 rounded px-1.5 py-1 text-xs text-gray-500 transition-colors hover:bg-ai-bg hover:text-ai-ink disabled:opacity-40">
                            <Icon name="ph:arrow-clockwise" class="h-3.5 w-3.5" />
                            {{ $t('assistants.actions.regenerate') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Cody's opening. A blank box says nothing about what an assistant
            is for, and a greeting that is also the first chat message says hello
            twice. The figure appears here and in no other part of the thread:
            somewhere with time to notice it. -->
            <div v-if="showStarters" class="pt-1">
                <div class="flex items-start gap-3 rounded-xl bg-cody-pale px-4 py-3.5 ring-1 ring-cody/15">
                    <ModulesUserAssistantCodyFigure :size="40" waving class="shrink-0" />
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-gray-900">{{ greeting }}</p>
                        <p class="text-sm text-gray-600">{{ $t('assistants.greeting.help') }}</p>
                    </div>
                </div>

                <ModulesUserAssistantBrief />

                <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <!-- Chosen by the page that is open, and only what the company's
                    modules and apps let Cody AI answer (codyStarters.ts). -->
                    <button v-for="(action, actionIndex) in starters" :key="action.key" type="button"
                        @click="onStarter($t(`assistants.quickPrompts.${action.key}`))"
                        :class="actionIndex === starters.length - 1 && starters.length % 2 === 1 && 'sm:col-span-2'"
                        class="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-cody/50 hover:bg-cody-pale">
                        <Icon :name="action.icon" class="size-4 shrink-0 text-cody-deep" aria-hidden="true" />
                        <span class="min-w-0 text-[13px] font-medium leading-snug text-gray-700">
                            {{ $t(`assistants.quick.${action.key}`) }}
                        </span>
                        <!-- An unfinished prompt says so: it will wait for a name. -->
                        <span v-if="starterMode($t(`assistants.quickPrompts.${action.key}`)) === 'fill'"
                            class="ml-auto shrink-0 text-xs text-gray-500">
                            {{ $t('assistants.quick.fillHint') }} ...
                        </span>
                    </button>
                </div>
            </div>

            <!-- While the answer is being written, the tools still get to say what they
            are doing. -->
            <ModulesUserAssistantToolTrace v-if="state.isStreaming && state.activeTools.length"
                :live="state.activeTools" class="px-1" />

            <div v-if="state.isStreaming" class="flex justify-center">
                <button type="button" @click="stopGenerating"
                    class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors">
                    <Icon name="ph:stop-circle" class="h-3.5 w-3.5" />
                    {{ $t('assistants.actions.stop') }}
                </button>
            </div>

            <div v-if="state.isGeneratingResponse" class="flex items-start gap-2.5">
                <ModulesUserNavbarCodyMark :size="20" state="working" class="mt-0.5 shrink-0" />
                <!-- The dots are what waiting looks like when there is nothing to
                say. As soon as a tool is running, the tool says it instead. -->
                <div v-if="state.activeTools.length || state.receipts.length || state.cards.length"
                    class="min-w-0 flex-1 pt-0.5">
                    <ModulesUserAssistantToolTrace :live="state.activeTools" :receipts="state.receipts" />
                    <!-- A card lands the moment the tool that touched it finishes,
                    so the row is on screen while the model is still writing about it. -->
                    <div v-if="state.cards.length" class="mt-2 grid gap-2">
                        <template v-for="(card, cardIndex) in state.cards" :key="`${card.ref}-${cardIndex}`">
                            <ModulesUserAssistantMiloCard v-if="card.type === 'milo'" :card="card" />
                            <ModulesUserAssistantChatDraftCard v-else-if="card.type === 'chat_message'" :card="card" />
                            <ModulesUserAssistantAnswerCard v-else :card="card" />
                        </template>
                    </div>
                </div>
                <!-- Three dots in Cody's colour that hop in turn: the five blinking
                full stops read as a loading bar, not as someone about to speak. -->
                <div v-else class="cody-dots flex h-5 items-center gap-1" role="status"
                    :aria-label="$t('assistants.generatingResponse')">
                    <span /><span /><span />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAssistantStore } from '@/store/assistant'
import { useUserStore } from '@/store/user'
import { useCodyChat, ANSWER_FEEDBACK_REASONS } from '@/composables/useCodyChat'
import type { CodyMessage } from '@/composables/useCodyChat'
import { starterMode, starterGroup, startersFor } from '@/composables/codyStarters'
import { splitWords, nextShown, revealedText } from '@/composables/codyReveal'
import { companyHasModule } from '@/composables/pageAccess'
import { CODY_MEMORY_PAGE } from '@/composables/codyMemory'
import { SOURCE_ICONS } from '@/composables/codySources'

/**
 * The conversation itself: what was asked, what Cody answered, what it read to
 * get there, and what is happening right now.
 *
 * Presentational. Everything it shows and every action it fires comes from the
 * chat the panel provides, so this file can be read on its own - which was the
 * whole problem with the 1,235-line panel it came out of.
 */
const assistantStore = useAssistantStore()

const { t } = useI18n()
const userStore = useUserStore() as any

const route = useRoute()

const {
    state,
    page,
    showStarters,
    formatMessage,
    copyAnswer,
    rateAnswer,
    confirmMemory,
    declineMemory,
    regenerateAnswer,
    useStarter,
    stopGenerating,
} = useCodyChat()

/**
 * Four things worth asking, and only things Cody can actually do. The icon
 * guide's fourth card was "summarise a meeting", which it has no tool for -
 * offering a capability that does not exist is the fastest way to make an
 * assistant look stupid, so shifts took that place.
 */
// Starters behave like "Spørg Cody AI" on a brief line (see codyStarters.ts):
// a complete prompt is asked at once, through the store so the panel adds the
// page context exactly as it does for the brief; one that needs a name is put
// in the field with the cursor at the end, and the button says so.
function onStarter(prompt: string) {
    if (starterMode(prompt) === 'send') assistantStore.askAbout(prompt)
    else useStarter(prompt)
}

const starters = computed(() => {
    const company = userStore.getUser?.company

    return startersFor(starterGroup(page.value?.key, String(route.name ?? '')), {
        hasModule: (name: string) => companyHasModule(company?.module_pages, name),
        tasksEnabled: !!company?.tasks_workflow_enabled,
    })
})

const RATINGS = [
    { value: 'up', icon: 'ph:thumbs-up' },
    { value: 'down', icon: 'ph:thumbs-down' },
] as const

/**
 * The newest answer, rolled out a few words at a time (codyReveal.ts). A
 * streamed answer chases the stream, so the uneven lumps it arrives in read as
 * steady writing; one that arrives whole is played out in under a second. Only
 * the text waits: cards, receipts and the buttons under it are there at once,
 * and copy always takes the whole answer. Nobody who asked their system for
 * less motion sees any of it.
 */
const reducedMotion = typeof window !== 'undefined'
    && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const reveal = reactive({ index: -1, words: [] as string[], shown: 0, arrivedAt: 0 })
let revealFrame = 0
let lastTick = 0

function shownText(message: CodyMessage, index: number): string {
    if (!message?.live || index !== reveal.index || reveal.shown >= reveal.words.length) return message?.text ?? ''

    return revealedText(reveal.words, reveal.shown)
}

function tick(now: number) {
    reveal.shown = nextShown(reveal.shown, reveal.words.length, now - lastTick, now - reveal.arrivedAt)
    lastTick = now
    revealFrame = reveal.shown < reveal.words.length ? requestAnimationFrame(tick) : 0
}

watch(() => {
    const index = state.messages.length - 1
    const message = state.messages[index]

    return message?.type === 'bot' && message.live && !message.failed ? [index, message.text ?? ''] as const : null
}, (latest) => {
    // Nothing to roll out right now. Left as it is rather than reset: a
    // streamed answer is taken off for a moment while its finished version
    // replaces it, and starting over then would write the answer twice.
    if (!latest || reducedMotion) return

    const [index, text] = latest
    const words = splitWords(text)
    // The same answer growing, or the finished answer replacing its own
    // stream, carries on from where it is. Anything else is a new answer.
    const sameAnswer = index === reveal.index && text.startsWith(revealedText(reveal.words, reveal.shown))
    if (!sameAnswer) {
        reveal.index = index
        reveal.shown = 0
    }
    if (!sameAnswer || words.length > reveal.words.length) reveal.arrivedAt = performance.now()
    reveal.words = words

    if (!revealFrame && reveal.shown < words.length) {
        lastTick = performance.now()
        revealFrame = requestAnimationFrame(tick)
    }
})

onBeforeUnmount(() => {
    if (revealFrame) cancelAnimationFrame(revealFrame)
})

// Greets by the clock, and by first name only: the surname makes it read like
// a letter from the municipality.
const greeting = computed(() => {
    const hour = new Date().getHours()
    const part = hour < 10 ? 'morning' : hour < 12 ? 'forenoon' : hour < 18 ? 'afternoon' : 'evening'

    return t(`assistants.greeting.${part}`, { name: userStore.getUser?.firstname ?? '' }).trim().replace(/,$/, '')
})
</script>

<style scoped>
/* Styling for the markdown the assistant returns. Scoped to the answer bubble
   so it can't leak into the rest of the chat. */
.ai-answer :deep(p) {
    margin: 0 0 0.6rem;
}

.ai-answer :deep(p:last-child) {
    margin-bottom: 0;
}

.ai-answer :deep(h3),
.ai-answer :deep(h4),
.ai-answer :deep(h5),
.ai-answer :deep(h6) {
    font-weight: 600;
    color: #111827;
    margin: 0.9rem 0 0.4rem;
}

.ai-answer :deep(h3) {
    font-size: 0.95rem;
}

.ai-answer :deep(h4),
.ai-answer :deep(h5),
.ai-answer :deep(h6) {
    font-size: 0.875rem;
}

.ai-answer :deep(> :first-child) {
    margin-top: 0;
}

.ai-answer :deep(ul),
.ai-answer :deep(ol) {
    margin: 0 0 0.6rem;
    padding-left: 1.25rem;
}

.ai-answer :deep(ul) {
    list-style: disc;
}

.ai-answer :deep(ol) {
    list-style: decimal;
}

.ai-answer :deep(li) {
    margin: 0.15rem 0;
}

.ai-answer :deep(a) {
    color: #0f4c75;
    text-decoration: underline;
}

.ai-answer :deep(strong) {
    font-weight: 600;
    color: #111827;
}

.ai-answer :deep(code) {
    background: #f3f4f6;
    border-radius: 0.25rem;
    padding: 0.05rem 0.3rem;
    font-size: 0.8125rem;
}

.ai-answer :deep(pre) {
    background: #f3f4f6;
    border-radius: 0.5rem;
    padding: 0.6rem 0.75rem;
    margin: 0 0 0.6rem;
    overflow-x: auto;
}

.ai-answer :deep(pre code) {
    background: transparent;
    padding: 0;
}

.ai-answer :deep(blockquote) {
    border-left: 3px solid #d1d5db;
    padding-left: 0.75rem;
    color: #4b5563;
    margin: 0 0 0.6rem;
}

.ai-answer :deep(hr) {
    border: 0;
    border-top: 1px solid #e5e7eb;
    margin: 0.75rem 0;
}

/* Wide tables scroll inside the bubble rather than stretching the chat. */
.ai-answer :deep(table) {
    display: block;
    overflow-x: auto;
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 0.6rem;
    font-size: 0.8125rem;
}

.ai-answer :deep(th),
.ai-answer :deep(td) {
    border: 1px solid #e5e7eb;
    padding: 0.35rem 0.55rem;
    text-align: left;
    vertical-align: top;
}

.ai-answer :deep(th) {
    background: #f9fafb;
    font-weight: 600;
}

/* Motion. Small and quick, so the panel feels alive without making anyone
   wait: a new message rises into place, cards and starters land one after
   another, a pressed copy or thumbs gives a small pop. Nothing moves for
   people who asked their system for less motion. */
.cody-dots span {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: #0ea5a8;
    opacity: 0.45;
}

@media (prefers-reduced-motion: no-preference) {
    .cody-thread > * {
        animation: cody-rise 220ms ease-out backwards;
    }

    .cody-thread .grid > * {
        animation: cody-rise 260ms ease-out backwards;
    }

    .cody-thread .grid > :nth-child(2) { animation-delay: 60ms; }
    .cody-thread .grid > :nth-child(3) { animation-delay: 120ms; }
    .cody-thread .grid > :nth-child(4) { animation-delay: 180ms; }
    .cody-thread .grid > :nth-child(5) { animation-delay: 240ms; }

    /* Starters and cards lift a little under the pointer: they are things to
       press, and the border colour alone barely said so. */
    .cody-thread .grid > :is(a, button) {
        transition: transform 150ms ease-out, box-shadow 150ms ease-out, border-color 150ms, background-color 150ms;
    }

    .cody-thread .grid > :is(a, button):hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px -2px rgb(11 77 107 / 0.15);
    }

    .cody-pop {
        animation: cody-pop 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* The first memory: one soft ring of Cody's colour, once. */
    .cody-first-memory {
        animation: cody-glow 1.2s ease-out 1;
    }

    .cody-dots span {
        animation: cody-hop 1.1s ease-in-out infinite;
    }

    .cody-dots span:nth-child(2) { animation-delay: 0.15s; }
    .cody-dots span:nth-child(3) { animation-delay: 0.3s; }
}

@keyframes cody-rise {
    from {
        opacity: 0;
        transform: translateY(6px);
    }
    to {
        opacity: 1;
        transform: none;
    }
}

@keyframes cody-glow {
    0% { box-shadow: 0 0 0 0 rgb(14 165 168 / 0.45); }
    100% { box-shadow: 0 0 0 8px rgb(14 165 168 / 0); }
}

@keyframes cody-pop {
    0% { transform: scale(0.6); }
    100% { transform: scale(1); }
}

@keyframes cody-hop {
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.45;
    }
    30% {
        transform: translateY(-4px);
        opacity: 1;
    }
}
</style>

<style>
/* Unscoped, as it was on the panel: several other screens (mail, chat,
   journal) use .dot1-.dot5 and never define the animation themselves, so
   scoping it here would quietly stop their typing indicators. */
@keyframes blink {
    0% {
        opacity: 0;
    }

    33% {
        opacity: 1;
    }

    66% {
        opacity: 0;
    }

    100% {
        opacity: 0;
    }
}

.dot1 {
    animation: blink 1.4s infinite both;
}

.dot2 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.2s;
}

.dot3 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.4s;
}

.dot4 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.6s;
}

.dot5 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.8s;
}
</style>
