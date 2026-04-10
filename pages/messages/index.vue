<template>
    <div class="flex-1 flex flex-col items-center justify-center bg-gray-50/30 h-full">
        <div class="text-center space-y-5 max-w-xs px-4">
            <div class="mx-auto w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Icon name="ph:chat-dots" class="w-10 h-10 text-gray-400" aria-hidden="true" />
            </div>
            <div>
                <h3 class="text-xl font-bold text-gray-900">{{ $t('messages.welcomeToChat') }}</h3>
                <p class="text-sm text-gray-500 mt-2 leading-relaxed">
                    {{ $t('messages.welcomeDescription') }}
                </p>
            </div>
            <button
                class="px-6 py-2.5 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary-600 transition-colors shadow-sm"
                @click="state.isNewChatOpen = true">
                {{ $t('messages.newConversation') }}
            </button>
        </div>

        <ModulesUserMessagesModalNewChat :isModalOpen="state.isNewChatOpen" @close="state.isNewChatOpen = false"
            @chatCreated="fetchChats?.()" />
    </div>
</template>

<script setup lang="ts">
const fetchChats = inject('fetchChats') as any

const state = reactive({
    isNewChatOpen: false,
})
</script>
