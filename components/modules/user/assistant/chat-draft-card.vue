<template>
    <div class="rounded-xl border border-gray-200 bg-white px-3 py-2.5" data-testid="cody-chat-draft-card">
        <div class="flex items-start gap-2.5">
            <Icon :name="card.recipient === 'group' ? 'ph:users-three' : 'ph:chat-circle-text'"
                class="mt-0.5 size-4 shrink-0 text-cody-deep" aria-hidden="true" />
            <div class="min-w-0 flex-1">
                <p class="text-xs text-gray-500">
                    {{ $t(card.recipient === 'group' ? 'assistants.chatDraft.toGroup' : 'assistants.chatDraft.to') }}
                </p>
                <!-- Who it goes to, said plainly: a colleague or a group chat, never a citizen. -->
                <p class="flex min-w-0 items-center gap-1.5">
                    <span class="truncate text-[13px] font-semibold text-gray-900">{{ card.title }}</span>
                    <span class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] font-medium text-gray-600"
                        data-testid="cody-chat-draft-recipient-kind">
                        {{ $t(card.recipient === 'group' ? 'assistants.chatDraft.groupChat' : 'assistants.chatDraft.colleague') }}
                    </span>
                </p>
            </div>
            <span class="shrink-0 rounded-full bg-ai-bg px-2 py-0.5 text-[10.5px] font-medium text-ai-ink">
                {{ $t('assistants.cards.badges.draft') }}
            </span>
        </div>

        <!-- Text, not markup: interpolated, so the draft is escaped like any other value. -->
        <p class="mt-2 whitespace-pre-line break-words rounded-lg bg-gray-50 px-3 py-2 text-[13px] leading-relaxed text-gray-800"
            data-testid="cody-chat-draft-text">{{ card.draft }}</p>

        <div class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <button type="button" @click="openInChat" :disabled="!prefill"
                class="inline-flex items-center gap-1.5 rounded-lg bg-ai-ink px-3 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                <Icon name="ph:arrow-square-out" class="size-3.5" aria-hidden="true" />
                {{ $t('assistants.chatDraft.open') }}
            </button>
            <button type="button" @click="copy"
                class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-100">
                <Icon :name="copied ? 'ph:check' : 'ph:copy'" class="size-3.5" aria-hidden="true" />
                {{ $t(copied ? 'assistants.chatDraft.copied' : 'assistants.chatDraft.copy') }}
            </button>
            <!-- Said on the card, because the obvious assumption is that Cody AI sent it. -->
            <span class="text-[11px] text-gray-400">{{ $t('assistants.chatDraft.notSent') }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AnswerCard } from '@/composables/useCodyChat'
import { chatPathFor, prefillFromCard } from '@/composables/codyChatDraft'
import { useChatDraftStore } from '@/store/chat-draft'
import { useAssistantStore } from '@/store/assistant'
import { useAlert } from '@/composables/alert'

/**
 * A chat message Cody AI drafted, and the way to send it: in the normal chat.
 *
 * The recipient and the target were resolved by the server for the person
 * asking (see CardResolver::chatMessage). "Åbn i chat" hands the text to the
 * chat through the store - never through the URL - and the chat puts it in its
 * field. Nothing is sent from here.
 */
const props = defineProps<{ card: AnswerCard }>()

const { t } = useI18n()
const { errorAlert } = useAlert()
const chatDraftStore = useChatDraftStore()
const assistantStore = useAssistantStore()

const card = computed(() => props.card)
const prefill = computed(() => prefillFromCard(props.card))
const copied = ref(false)

// Below this width Cody covers the page, so it steps aside for the chat.
const FULL_WIDTH_BELOW_PX = 640

function openInChat() {
    // Made fresh on the click, so the age limit counts from when it was asked for.
    const fresh = prefillFromCard(props.card)
    if (!fresh) return

    chatDraftStore.hand(fresh)
    if (window.innerWidth < FULL_WIDTH_BELOW_PX) assistantStore.close()
    navigateTo(chatPathFor(fresh.target))
}

async function copy() {
    try {
        await navigator.clipboard.writeText(props.card.draft ?? '')
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
    } catch {
        errorAlert(`${t('alert.somethingWentWrong')}!`, t('assistants.chatDraft.copyFailed'))
    }
}
</script>
