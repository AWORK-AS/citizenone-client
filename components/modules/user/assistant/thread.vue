<template>
    <!-- Chat container. Messages are top-anchored, including the initial
    greeting, so the conversation always reads downward from the same starting
    point. -->
    <div class="flex-1 overflow-y-auto scroll-smooth">
        <div class="px-4 py-5 space-y-5">
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
                        :state="message.companyDataStatus && message.companyDataStatus !== 'ready' ? 'blocked' : 'idle'" />
                    <div class="flex-1 min-w-0">
                        <div class="ai-answer text-sm text-gray-800 leading-relaxed"
                            v-safe-html="formatMessage(message?.text)" />

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

                        <!-- What Cody read to get here. Kept with the answer, not only shown
                        while it was working: the receipt is what makes an answer checkable
                        after the fact. -->
                        <ModulesUserAssistantToolTrace v-if="message.receipts?.length" :receipts="message.receipts"
                            class="mt-2" />

                        <!-- What the answer was actually built from. The backend already
                        resolved these for the audit trail. -->
                        <p v-if="message.sources?.length"
                            class="mt-2 flex flex-wrap items-center gap-1 text-xs text-gray-400">
                            <Icon name="ph:database" class="size-3.5 shrink-0" aria-hidden="true" />
                            <span>{{ $t('assistants.basedOn') }}:</span>
                            <span v-for="source in message.sources" :key="source.uuid"
                                class="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">
                                {{ source.name }}
                            </span>
                        </p>

                        <!-- The answer used to be a dead end: read it, then retype it
                        somewhere else. Copy takes the rendered answer as plain text,
                        matching what's actually shown in the bubble above (not the raw HTML
                        string the backend returned). -->
                        <div v-if="index > 0" class="flex items-center gap-1 mt-2 -ml-1.5">
                            <button type="button" @click="copyAnswer(message, index)"
                                :title="$t('assistants.actions.copy')"
                                class="flex items-center gap-1 px-1.5 py-1 rounded text-xs text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                                <Icon :name="state.copiedIndex === index ? 'ph:check' : 'ph:copy'"
                                    class="h-3.5 w-3.5" />
                                {{ state.copiedIndex === index ? $t('assistants.actions.copied') :
                                    $t('assistants.actions.copy') }}
                            </button>
                            <button type="button" v-if="assistantStore.insertTargetLabel"
                                @click="assistantStore.requestInsert(formatMessage(message?.text))"
                                :title="assistantStore.insertTargetLabel"
                                class="flex items-center gap-1 px-1.5 py-1 rounded text-xs text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                                <Icon name="ph:arrow-line-down" class="h-3.5 w-3.5" />
                                {{ $t('assistants.actions.insert') }}
                            </button>
                            <button type="button"
                                v-if="index === state.messages.length - 1 && state.lastRequest.prompt"
                                @click="regenerateAnswer" :disabled="state.isGeneratingResponse"
                                :title="$t('assistants.actions.regenerate')"
                                class="flex items-center gap-1 px-1.5 py-1 rounded text-xs text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-40">
                                <Icon name="ph:arrow-clockwise" class="h-3.5 w-3.5" />
                                {{ $t('assistants.actions.regenerate') }}
                            </button>
                        </div>
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

                <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button v-for="action in QUICK_ACTIONS" :key="action.key" type="button"
                        @click="useStarter($t(`assistants.quickPrompts.${action.key}`))"
                        class="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-cody/50 hover:bg-cody-pale">
                        <Icon :name="action.icon" class="size-4 shrink-0 text-cody-deep" aria-hidden="true" />
                        <span class="min-w-0 text-[13px] font-medium leading-snug text-gray-700">
                            {{ $t(`assistants.quick.${action.key}`) }}
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
                <div v-if="state.activeTools.length || state.receipts.length" class="min-w-0 flex-1 pt-0.5">
                    <ModulesUserAssistantToolTrace :live="state.activeTools" :receipts="state.receipts" />
                </div>
                <div v-else class="flex items-center gap-0.5 pt-1">
                    <span class="dot1">.</span>
                    <span class="dot2">.</span>
                    <span class="dot3">.</span>
                    <span class="dot4">.</span>
                    <span class="dot5">.</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAssistantStore } from '@/store/assistant'
import { useUserStore } from '@/store/user'
import { useCodyChat } from '@/composables/useCodyChat'

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

const {
    state,
    showStarters,
    formatMessage,
    copyAnswer,
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
const QUICK_ACTIONS = [
    { key: 'overview', icon: 'ph:file-text' },
    { key: 'journal', icon: 'ph:pencil-simple-line' },
    { key: 'files', icon: 'ph:paperclip' },
    { key: 'shifts', icon: 'ph:calendar-blank' },
] as const

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
