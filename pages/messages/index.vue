<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('messages.messages') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <!-- Two-Panel Chat Layout -->
            <div class="flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                style="height: 82vh;">

                <!-- Left Sidebar: full-width on mobile, fixed width on md+ -->
                <div
                    class="w-full md:w-72 flex-shrink-0 md:border-r border-gray-100 flex flex-col relative overflow-hidden">
                    <div :class="state.isPageLoading ? 'opacity-20 pointer-events-none' : ''"
                        class="flex flex-col h-full">
                        <ModulesUserMessagesChats :chats="state.chats" :activeChatUuid="''"
                            @loadMoreMessages="fetchAdditionalChats" />
                    </div>
                    <div v-if="state.isPageLoading"
                        class="absolute inset-0 bg-white/60 z-10 flex items-center justify-center pointer-events-none">
                        <div class="w-8 h-8 border-b-2 border-gray-400 rounded-full animate-spin"></div>
                    </div>
                </div>

                <!-- Right Panel: Welcome Empty State — hidden on mobile -->
                <div class="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50/30">
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

                    <ModulesUserMessagesModalNewChat :isModalOpen="state.isNewChatOpen"
                        @close="state.isNewChatOpen = false" />
                </div>
            </div>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import pusher from '@/services/pusher'
import { messageService } from '@/components/api/user/MessageService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const userStore = useUserStore() as any
const chatUuid = router?.currentRoute?.value?.params?.chat_uuid
let currentTablePage = 1

const state = reactive({
    chats: [] as any,
    error: {} as Error,
    isPageLoading: false,
    isNewChatOpen: false,
})

onMounted(() => {
    const channel = pusher.subscribe('citizenone.' + chatUuid)
    channel.bind('chat-message', () => {
        fetchChats()
    })
    fetchChats()
})

async function fetchChats() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = { page: currentTablePage }
        const response = await messageService.fetchChats(params)
        if (response) {
            state.chats = response
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}

async function fetchAdditionalChats() {
    state.error = {}
    state.isPageLoading = true
    try {
        currentTablePage = currentTablePage + 1
        const params = { page: currentTablePage }
        const response = await messageService.fetchChats(params)
        if (response) {
            state.chats.data?.push(...response?.data)
            if (response?.meta) state.chats.meta = response?.meta
            if (response?.links) state.chats.links = response?.links
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}
</script>
