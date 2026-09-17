<template>
    <div class="border-t border-gray-100 bg-white px-4 py-4">
        <div>
            <!-- Audit P2.1/P2.2/P2.4: the transparency notices. All three used to
            stand open above the field on every single open - a fifth of the panel
            spent on small print nobody re-reads. The one that has to be seen stays
            visible; search scope and the governance link sit one click away, which
            is also where someone actually goes looking for them. -->
            <div class="mb-2 flex items-center gap-2 text-[11.5px] text-gray-400">
                <span class="size-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true"></span>
                <span class="min-w-0 flex-1 truncate">{{ $t('assistants.reviewShort') }}</span>
                <button type="button" @click="state.showDataNotice = !state.showDataNotice"
                    class="shrink-0 border-b border-gray-200 text-gray-500 transition-colors hover:border-primary/40 hover:text-primary">
                    {{ $t('assistants.dataAndAccess') }}
                </button>
            </div>

            <div v-if="state.showDataNotice"
                class="mb-2 flex flex-col gap-1.5 rounded-lg bg-gray-50 px-3 py-2.5 text-[11.5px] text-gray-500">
                <div class="flex items-start gap-1.5">
                    <Icon name="ph:info" class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    <span>{{ $t('assistants.searchScopeHint') }}</span>
                </div>
                <div class="flex items-start gap-1.5">
                    <Icon name="ph:shield-check" class="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    <span>
                        {{ $t('assistants.dataGovernanceNotice') }}
                        <a :href="aiGovernanceUrl" target="_blank" rel="noopener noreferrer" class="underline"
                            style="color: #104c75">AI Governance</a>
                    </span>
                </div>
            </div>

            <div v-if="state.files.length > 0" class="flex flex-wrap gap-1.5 mb-2">
                <div v-for="(file, index) in state.files" :key="index"
                    class="flex items-center gap-1.5 bg-gray-100 text-xs text-gray-600 pl-2.5 pr-1.5 py-1.5 rounded-md">
                    <Icon name="ph:file" class="h-3.5 w-3.5 text-gray-400" />
                    <span class="max-w-[150px] truncate">{{ file.name }}</span>
                    <button type="button" @click="removeFile(index)"
                        class="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition-colors">
                        <Icon name="ph:x" class="h-3 w-3" />
                    </button>
                </div>
            </div>

            <div v-if="state.mentionedEntities.length > 0" class="flex flex-wrap gap-1.5 mb-2">
                <div v-for="entity in state.mentionedEntities" :key="entity.uuid"
                    class="flex items-center gap-1.5 bg-primary/10 text-xs text-primary pl-2.5 pr-1.5 py-1.5 rounded-md">
                    <Icon :name="entity.type === 'employee' ? 'ph:identification-badge' : 'ph:at'"
                        class="h-3.5 w-3.5" />
                    <span class="max-w-[150px] truncate">{{ entity.label }}</span>
                    <button type="button" @click="removeMentionedEntity(entity.uuid)"
                        class="text-primary/50 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition-colors">
                        <Icon name="ph:x" class="h-3 w-3" />
                    </button>
                </div>
            </div>

            <div
                class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md
                focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all px-3 py-1.5">
                <input ref="fileInput" type="file" multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png" class="hidden"
                    @change="onFilesSelected" />
                <button type="button" @click="fileInput?.click()"
                    class="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                    <Icon name="ph:paperclip" class="h-5 w-5" />
                </button>
                <button type="button" @click="insertMentionTrigger" :title="$t('assistants.mentionSomeone')"
                    class="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                    <Icon name="ph:at" class="h-5 w-5" />
                </button>
                <button type="button" @click="togglePreview" :title="$t('assistants.previewBeforeSending')"
                    :disabled="!state.newMessage.trim()"
                    class="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
                    <Icon name="ph:eye" class="h-5 w-5" />
                </button>
                <div class="relative flex-1">
                    <textarea ref="promptTextarea" v-model="state.newMessage"
                        :placeholder="$t('assistants.askAnything')" rows="1"
                        class="block w-full bg-transparent border-none shadow-none ring-0 focus:ring-0 focus:outline-none resize-none py-1.5 px-0 text-sm text-gray-900 placeholder-gray-400"
                        @keydown.enter.exact.prevent="handleEnterKey"
                        @keydown.esc="state.mention.isOpen = false" />
                    <div v-if="state.mention.isOpen && state.mention.results.length > 0" @mousedown.prevent
                        class="absolute bottom-full left-0 mb-1 w-64 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button v-for="entity in state.mention.results" :key="entity.uuid" type="button"
                            @click="selectMention(entity)"
                            class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                            <Icon :name="entity.type === 'employee' ? 'ph:identification-badge' : 'ph:user'"
                                class="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span class="truncate">{{ entity.label }}</span>
                        </button>
                    </div>

                    <!-- Audit P2.3: on-demand preview of exactly what will be redacted
                    out of the typed prompt before it's sent, plus the currently
                    tagged records. Not a mandatory gate on every send - that would
                    be disruptive chat UX - just available if the user wants to check. -->
                    <div v-if="state.preview.isOpen" @mousedown.prevent
                        class="absolute bottom-full left-0 mb-1 w-80 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-medium text-gray-500">{{ $t('assistants.preview.title') }}</span>
                            <button type="button" @click="state.preview.isOpen = false"
                                class="text-gray-300 hover:text-gray-500">
                                <Icon name="ph:x" class="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <div v-if="state.preview.isLoading" class="text-xs text-gray-400 py-2">
                            {{ $t('assistants.preview.loading') }}
                        </div>
                        <template v-else>
                            <p class="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-2 mb-2">{{
                                state.preview.redactedPrompt }}</p>
                            <p v-if="state.mentionedEntities.length > 0" class="text-xs text-gray-500">
                                {{ $t('assistants.preview.taggedRecords') }}:
                                {{ state.mentionedEntities.map(e => e.label).join(', ') }}
                            </p>
                        </template>
                    </div>
                </div>
                <button type="button" @click="sendMessage"
                    :disabled="!state.newMessage.trim() && state.files.length === 0"
                    class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:cursor-not-allowed"
                    :class="state.newMessage.trim() || state.files.length > 0
                        ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                        : 'bg-gray-200 text-gray-400'">
                    <Icon name="ph:paper-plane-tilt" class="h-5 w-5" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCodyChat } from '@/composables/useCodyChat'

/**
 * Where the question gets written: the prompt field and everything attached to
 * it - files, tagged people, the redaction preview and the send button.
 *
 * This component owns the textarea, so it is also the one that says how to
 * focus it. Half the chat's actions end in "and put the cursor back in the
 * field", and they ask for that through the chat rather than by passing a DOM
 * ref around.
 */
const { locale } = useI18n()

const {
    state,
    onComposerFocusRequest,
    sendMessage,
    handleEnterKey,
    onFilesSelected,
    removeFile,
    selectMention,
    removeMentionedEntity,
    insertMentionTrigger,
    togglePreview,
} = useCodyChat()

const fileInput = ref<HTMLInputElement | null>(null)
const promptTextarea = ref<HTMLTextAreaElement | null>(null)

onComposerFocusRequest(() => promptTextarea.value?.focus())

const AI_GOVERNANCE_URLS: Record<string, string> = {
    dk: 'https://citizenone.dk/ai-governance',
    en: 'https://citizenone.eu/ai-governance',
    sv: 'https://citizenone.eu/sv/ai-governance',
    no: 'https://citizenone.eu/nb/ai-governance',
}

const aiGovernanceUrl = computed(() => AI_GOVERNANCE_URLS[locale.value] ?? AI_GOVERNANCE_URLS.en)
</script>
