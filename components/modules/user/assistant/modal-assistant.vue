<template>
    <div>
        <Modal size="xl" :title="$t('assistants.askAI')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="space-y-5 text-sm text-gray-700">
                    <!-- Chatbot Container -->
                    <div class="flex flex-col h-[60vh] overflow-hidden border border-gray-300 rounded-lg">
                        <!-- Chat messages -->
                        <div class="flex-1 overflow-y-auto p-4 space-y-3">
                            <div v-for="(message, index) in state.messages" :key="index"
                                :class="message.type === 'user' ? 'text-right' : 'text-left'">
                                <div
                                    :class="message.type === 'user' ? 'bg-secondary text-white p-1 rounded-lg' : 'bg-gray-200 p-1 rounded-lg'">
                                    <p class="px-4 py-2 rounded-lg inline-block"
                                        v-html="formatMessage(message?.text)" />
                                </div>
                            </div>
                            <div class="bg-gray-200 p-1 rounded-lg" v-if="state.isGeneratingResponse">
                                <span class="pl-4 py-2 rounded-lg inline-block">
                                    {{ $t('assistants.generatingResponse') }}
                                </span>
                                <span class="dot1">.</span>
                                <span class="dot2">.</span>
                                <span class="dot3">.</span>
                                <span class="dot4">.</span>
                                <span class="dot5">.</span>
                            </div>
                        </div>

                        <!-- Chat Input -->
                        <div class="flex items-center gap-x-2 p-2 border-t border-gray-300">
                            <FormTextField id="prompt" name="prompt" :placeholder="$t('assistants.askAnything')"
                                v-model="state.newMessage" @keydown.enter="sendMessage" />
                            <FormButton buttonStyle="primary" @click="sendMessage">
                                {{ $t('assistants.send') }}
                            </FormButton>
                        </div>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { aIAssistantService } from '@/components/api/user/AIAssistantService'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])
const { t } = useI18n()

function closeModal() {
    emit('close')
}

// Using reactive for the state
const state = reactive({
    error: {} as Error,
    isGeneratingResponse: false,
    messages: [] as any,
    newMessage: '',
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.messages = []
        state.messages.push({ type: 'bot', text: `${t('assistants.helloHowCanIAssistYouToday')}?` })
    }
})

async function sendMessage() {
    state.error = {}
    state.isGeneratingResponse = true
    try {
        state.messages.push({
            type: 'user',
            text: state.newMessage,
        })
        const params = {
            prompt: state.newMessage,
        }
        state.newMessage = ''
        const response = await aIAssistantService.sendMessage(params)
        if (response) {
            if (JSON.parse(response)?.output?.[0]?.content?.[0]?.text) {
                state.messages.push({
                    type: 'bot',
                    text: JSON.parse(response)?.output?.[0]?.content?.[0]?.text,
                })
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isGeneratingResponse = false
}

function formatMessage(messageText: string) {
    // Example format: If the message contains a structured citizen list, format it
    const formattedMessage = messageText.replace(/---/g, '<hr/>') // Replace "---" with horizontal line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold the text wrapped in **
        .replace(/\*\[(.*?)\]\(.*?\)/g, '<a href="#">$1</a>') // Make links clickable
        .replace(/\n/g, '<br/>') // Replace newlines with <br/>

    return formattedMessage
}
</script>

<style>
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