<template>
    <div class="flex flex-col h-full" @click="state.openChatMenuUuid = null">
        <!-- Sidebar Header -->
        <div class="px-5 pt-5 pb-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="font-bold text-gray-900 text-base leading-tight">{{ $t('messages.messages') }}</h2>
                    <p class="text-xs text-gray-400 mt-0.5">{{ $t('messages.conversationsAndMessaging') }}</p>
                </div>
                <button
                    class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    @click.stop="state.modal.isNewChatOpen = true" :title="$t('messages.newMessage')">
                    <Icon name="ph:plus" class="w-4 h-4 text-gray-600" aria-hidden="true" />
                </button>
            </div>
        </div>

        <!-- Search -->
        <div class="px-4 py-3 border-b border-gray-100">
            <div class="relative">
                <Icon name="ph:magnifying-glass"
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    aria-hidden="true" />
                <input v-model="state.searchQuery" type="text" :placeholder="$t('messages.searchConversations')"
                    class="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 border-0 transition-all" />
            </div>
        </div>

        <!-- Chat List -->
        <ul ref="chatListRef" class="flex-1 overflow-y-auto py-1">
            <li v-for="(chat, index) in filteredChats" :key="index" @click="openChat(chat)" :class="[
                'flex items-center gap-3 px-4 py-4 md:py-3 cursor-pointer transition-all relative group/chat',
                props.activeChatUuid === chat.uuid
                    ? 'bg-primary/8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary'
                    : 'hover:bg-gray-50',
                chat?.unread_messages > 0 && props.activeChatUuid !== chat.uuid ? 'bg-blue-50/40' : ''
            ]">
                <!-- Icon / Avatar -->
                <div class="flex-shrink-0">
                    <!-- Group Chat -->
                    <div v-if="chat.type === 'group'"
                        class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="ph:users-three" class="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <!-- Direct Message -->
                    <div v-else class="relative w-9 h-9">
                        <img :src="getChatAvatar(chat)" alt="avatar" class="w-9 h-9 rounded-full object-cover" />
                        <span :class="[
                            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white',
                            getChatOnlineStatus(chat) ? 'bg-green-500' : 'bg-gray-300'
                        ]" />
                    </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-1">
                        <h4 :class="[
                            'text-sm truncate',
                            chat?.unread_messages > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                        ]">
                            {{ getChatDisplayName(chat) }}
                        </h4>
                        <!-- Time (hidden on hover) / Menu button (shown on hover) -->
                        <div class="flex-shrink-0 relative">
                            <span class="text-xs text-gray-400 group-hover/chat:hidden">
                                {{ formatChatTime(chat?.updated_at) }}
                            </span>
                            <button
                                class="hidden group-hover/chat:flex w-6 h-6 rounded-md hover:bg-gray-200 items-center justify-center transition-colors"
                                @click.stop="toggleChatMenu(chat.uuid)"
                                :title="$t('messages.actions.more')">
                                <Icon name="ph:dots-three" class="w-4 h-4 text-gray-500" aria-hidden="true" />
                            </button>
                            <!-- Dropdown -->
                            <div v-if="state.openChatMenuUuid === chat.uuid"
                                class="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                                @click.stop>
                                <button
                                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                    @click="confirmDeleteChat(chat)">
                                    <Icon name="ph:trash" class="h-4 w-4 text-red-500" aria-hidden="true" />
                                    {{ $t('messages.deleteChat') }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between mt-0.5">
                        <p class="text-xs text-gray-400 truncate">
                            <span v-if="chat.type === 'direct'">{{ $t('messages.directMessage') }}</span>
                            <span v-else>{{ chat?.chat_members?.length || 0 }} {{ $t('messages.members') }}</span>
                        </p>
                        <span v-if="chat?.unread_messages > 0"
                            class="flex-shrink-0 ml-1 bg-primary text-white text-xxs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-semibold">
                            {{ chat.unread_messages > 9 ? '9+' : chat.unread_messages }}
                        </span>
                    </div>
                </div>
            </li>

            <!-- Empty search result -->
            <li v-if="filteredChats.length === 0 && state.searchQuery" class="px-4 py-8 text-center">
                <p class="text-sm text-gray-400">{{ $t('messages.noConversationsFound') }}</p>
            </li>

            <!-- Load More -->
            <li v-if="props.chats?.links?.next !== null && props.chats?.links">
                <button
                    class="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-xs text-gray-400 hover:text-primary transition-colors group"
                    @click="$emit('loadMoreMessages')">
                    <span class="flex-1 h-px bg-gray-100 group-hover:bg-primary/20 transition-colors" />
                    <Icon name="ph:caret-down" class="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    <span class="flex-shrink-0">{{ $t('mail.loadMore') }}</span>
                    <Icon name="ph:caret-down" class="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    <span class="flex-1 h-px bg-gray-100 group-hover:bg-primary/20 transition-colors" />
                </button>
            </li>
        </ul>

        <ModulesUserMessagesModalNewChat :isModalOpen="state.modal.isNewChatOpen"
            @close="state.modal.isNewChatOpen = false" @chatCreated="fetchChats?.()" />

        <DialogConfirmation :isModalOpen="state.modal.isDeleteChatOpen"
            :message="$t('messages.confirmation.deleteChatConfirmation') + '?'"
            @close="state.modal.isDeleteChatOpen = false"
            @confirm="deleteChat" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { messageService } from '@/components/api/user/MessageService'
import { useAlert } from '@/composables/alert'

const router = useRouter()
const { t } = useI18n()
const { successAlert } = useAlert()
const userUuid = router?.currentRoute?.value?.query?.user_uuid
const fetchChats = inject('fetchChats') as any
const chatListRef = ref<HTMLElement | null>(null)

const props = defineProps({
    error: { type: Object, required: false },
    chats: { type: Object, required: true },
    activeChatUuid: { type: String, default: '' },
})

const userStore = useUserStore() as any

watch(() => props.chats?.data?.[0]?.uuid, () => {
    nextTick(() => {
        if (chatListRef.value) chatListRef.value.scrollTop = 0
    })
})

const state = reactive({
    isPageLoading: false,
    openChatMenuUuid: null as string | null,
    selectedChat: null as any,
    modal: {
        isNewChatOpen: false,
        isDeleteChatOpen: false,
    },
    searchQuery: '',
})

onMounted(() => {
    if (userUuid) state.modal.isNewChatOpen = true
})

function toggleChatMenu(uuid: string) {
    state.openChatMenuUuid = state.openChatMenuUuid === uuid ? null : uuid
}

function confirmDeleteChat(chat: any) {
    state.selectedChat = chat
    state.openChatMenuUuid = null
    state.modal.isDeleteChatOpen = true
}

async function deleteChat() {
    if (!state.selectedChat) return
    state.isPageLoading = true
    try {
        const response = await messageService.deleteChatHistory(state.selectedChat.uuid)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('messages.alert.chatSuccessfullyDeleted')}.`)
            fetchChats?.()
            if (router?.currentRoute?.value?.params?.chat_uuid === state.selectedChat.uuid) {
                navigateTo('/messages')
            }
        }
    } catch (error: any) { }
    state.isPageLoading = false
    state.modal.isDeleteChatOpen = false
    state.selectedChat = null
}

const filteredChats = computed(() => {
    const chats = props.chats?.data || []
    if (!state.searchQuery) return chats
    const q = state.searchQuery.toLowerCase()
    return chats.filter((chat: any) => {
        return getChatDisplayName(chat).toLowerCase().includes(q)
    })
})

function getChatDisplayName(chat: any): string {
    if (chat.type === 'group') {
        if (chat.name) return chat.name
        return chatGroupMembers(chat)
    }
    const others = excludeCurrentUserFromChatMembers(chat?.chat_members || [])
    if (others.length > 0) {
        return `${others[0]?.user?.firstname} ${others[0]?.user?.lastname ?? ''}`
    }
    const self = chatToSelf(chat?.chat_members || [])
    return self[0] ? `${self[0]?.user?.firstname} ${self[0]?.user?.lastname ?? ''}` : ''
}

function getChatAvatar(chat: any): string {
    const others = excludeCurrentUserFromChatMembers(chat?.chat_members || [])
    if (others.length > 0) return others[0]?.user?.profile_image ?? '/img/avatars/user.svg'
    const self = chatToSelf(chat?.chat_members || [])
    return self[0]?.user?.profile_image ?? '/img/avatars/user.svg'
}

function getChatOnlineStatus(chat: any): boolean {
    const others = excludeCurrentUserFromChatMembers(chat?.chat_members || [])
    if (others.length > 0) return others[0]?.user?.is_online ?? false
    return true
}

function formatChatTime(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function chatToSelf(chatMembers: any) {
    return chatMembers.filter((m: any) => m.user_id === userStore.getUser?.id)
}

function excludeCurrentUserFromChatMembers(chatMembers: any) {
    return chatMembers.filter((m: any) => m.user_id !== userStore.getUser?.id)
}

function chatGroupMembers(chat: any): string {
    const members = excludeCurrentUserFromChatMembers(chat?.chat_members || [])
        .map((m: any) => `${m?.user?.firstname} ${m?.user?.lastname ?? ''}`)
    if (members.length === 0) return ''
    if (members.length <= 3) return members.join(', ')
    const remaining = members.length - 1
    return `${members[0]}, ${members[1]}, ${t('messages.and')?.toLowerCase()} ${remaining} ${t('messages.more')?.toLowerCase()}`
}

function openChat(chat: any) {
    navigateTo(`/messages/${chat.uuid}`)
}
</script>
