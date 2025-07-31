<template>
    <div>
        <!-- Modal for Chatbot -->
        <Modal size="md" :title="$t('assistants.assistants')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-5 text-sm text-gray-700">

                    <!-- Chatbot Container -->
                    <div class="flex flex-col h-[60vh] overflow-hidden border border-gray-300 rounded-lg">
                        <!-- Chat messages -->
                        <div class="flex-1 overflow-y-auto p-4 space-y-3">
                            <div v-for="(message, index) in state.messages" :key="index"
                                :class="message.type === 'user' ? 'text-right' : 'text-left'">
                                <div
                                    :class="message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'">
                                    <p class="px-4 py-2 rounded-lg inline-block max-w-xs">
                                        {{ message.text }}
                                    </p>
                                </div>
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
import { reactive } from 'vue'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

// Using reactive for the state
const state = reactive({
    messages: [
        { type: 'bot', text: 'Hello, how can I assist you today?' },
    ],
    newMessage: '',
})

// Send message function
function sendMessage() {
    if (state.newMessage.trim()) {
        state.messages.push({ type: 'user', text: state.newMessage })
        state.newMessage = ''
        // Simulate bot response
        setTimeout(() => {
            state.messages.push({ type: 'bot', text: 'I am just a bot, but I received your message!' })
        }, 1000)
    }
}
</script>