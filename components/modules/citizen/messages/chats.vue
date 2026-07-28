<template>
    <div>
        <ul class="space-y-1">
            <li class="flex justify-end px-4 pt-4 pb-3">
                <button class="bg-primary text-white text-xs p-2 rounded-md flex items-center justify-center gap-x-2"
                    @click="state.modal.isNewChatOpen = true">
                    <Icon name="mdi:square-edit-outline" class="w-4 h-4 text-white" aria-hidden="true" />
                    {{ $t('messages.newMessage') }}
                </button>
            </li>
            <li v-for="(chat, index) in props.chats?.data" :key="index" @click="openChat(chat)" :class="[
                chat?.unread_messages > 0 && 'bg-primary/5',
                'border-b border-gray-100 px-5 py-3 cursor-pointer'
            ]">
                <div v-if="chat?.type === 'direct'">
                    <div>
                        <div v-if="excludeCurrentUserFromChatMembers(chat?.chat_members)?.length > 0">
                            <div v-for="(chatMember, index) in excludeCurrentUserFromChatMembers(chat?.chat_members)"
                                :index="index" class="grid grid-cols-12 items-center">
                                <div class="col-span-2">
                                    <img :src="memberAvatar(chatMember)" alt="Item 1"
                                        class="w-11 h-11 rounded-full object-cover">
                                </div>
                                <div class="col-span-10 min-w-0">
                                    <div class="flex items-baseline justify-between gap-x-2">
                                        <Tooltip :text="memberDisplayName(chatMember)">
                                            <h4 class="font-semibold text-sm truncate">{{ memberDisplayName(chatMember) }}</h4>
                                        </Tooltip>
                                        <span class="text-xxs text-gray-400 shrink-0" v-if="chat?.latest_message">
                                            {{ shortTime(chat.latest_message.created_at) }}
                                        </span>
                                    </div>
                                    <p class="text-xxs text-primary font-semibold" v-if="chat?.unread_messages > 0">
                                        {{ chat?.unread_messages }}
                                        <span class="lowercase">{{ $t('messages.unreadMessages') }}</span>
                                    </p>
                                    <p class="text-xs text-gray-500 truncate" v-else-if="chat?.latest_message?.body">
                                        {{ chat.latest_message.body }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="grid grid-cols-12 items-center">
                            <div class="col-span-2">
                                <img :src="memberAvatar(chatToSelf(chat?.chat_members)[0])"
                                    alt="Item 1" class="w-11 h-11 rounded-full object-cover">
                            </div>
                            <div class="col-span-10 min-w-0">
                                <div class="flex items-baseline justify-between gap-x-2">
                                    <Tooltip :text="memberDisplayName(chatToSelf(chat?.chat_members)[0])">
                                        <h4 class="font-semibold text-sm truncate">{{ memberDisplayName(chatToSelf(chat?.chat_members)[0]) }}</h4>
                                    </Tooltip>
                                    <span class="text-xxs text-gray-400 shrink-0" v-if="chat?.latest_message">
                                        {{ shortTime(chat.latest_message.created_at) }}
                                    </span>
                                </div>
                                <p class="text-xxs text-primary font-semibold" v-if="chat?.unread_messages > 0">
                                    {{ chat?.unread_messages }}
                                    <span class="lowercase">{{ $t('messages.unreadMessages') }}</span>
                                </p>
                                <p class="text-xs text-gray-500 truncate" v-else-if="chat?.latest_message?.body">
                                    {{ chat.latest_message.body }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="chat?.type === 'group'">
                    <div class="grid grid-cols-12 items-center">
                        <div class="relative col-span-2">
                            <img src="/img/avatars/user.svg" alt="Item 1"
                                class="w-6 h-6 rounded-full object-cover relative top-1">
                            <img src="/img/avatars/user.svg" alt="Item 1"
                                class="w-6 h-6 rounded-full object-cover absolute -top-3.5 left-3">
                            <img src="/img/avatars/user.svg" alt="Item 1"
                                class="w-6 h-6 rounded-full object-cover absolute top-1.5 left-5">
                        </div>
                        <div class="col-span-10">
                            <h4 class="font-semibold text-sm" v-if="chat?.name">
                                {{ chat?.name }}
                            </h4>
                            <Tooltip :text="`${chatGroupMembers(chat)}.`" v-else>
                                <h4 class="font-semibold text-sm line-clamp-1">
                                    {{ chatGroupMembers(chat) }}.
                                </h4>
                            </Tooltip>
                            <p class="text-xxs" v-if="chat?.unread_messages > 0">
                                {{ chat?.unread_messages }}
                                <span class="lowercase">{{ $t('messages.unreadMessages') }}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
        <ModulesCitizenMessagesModalNewChat :isModalOpen="state.modal.isNewChatOpen"
            @close="state.modal.isNewChatOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'

const router = useRouter()
const { t } = useI18n()
const userUuid = router?.currentRoute?.value?.query?.user_uuid

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    chats: {
        type: Object,
        required: true,
    },
})

const userStore = useUserStore() as any

const state = reactive({
    modal: {
        isNewChatOpen: false
    }
})

onMounted(() => {
    if (userUuid) {
        state.modal.isNewChatOpen = true
    }
})

function chatToSelf(chatMembers: any) {
    return chatMembers.filter((chatMember: any) => chatMember.user_id === userStore.getUser?.id)
}

function excludeCurrentUserFromChatMembers(chatMembers: any) {
    return chatMembers.filter((chatMember: any) => chatMember.user_id !== userStore.getUser?.id)
}

function chatGroupMembers(chat: any) {
    return excludeCurrentUserFromChatMembers(chat?.chat_members)
        ?.map((chatMember: any) => memberDisplayName(chatMember))
        ?.join(', ')
}

function openChat(chat: any) {
    navigateTo(`/citizen/messages/${chat.uuid}`)
}

function memberDisplayName(member: any) {
    if (!member) return ''
    const user = member.user || {}
    const userType = member.user_type || ''
    if (userType.includes('CaseworkerLicenseConfig') || userType.toLowerCase().includes('caseworker')) {
        return user.name || `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim()
    }
    return `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() || user.name || ''
}

function memberAvatar(member: any) {
    if (!member) return '/img/avatars/user.svg'
    const user = member.user || {}
    const userType = member.user_type || ''
    if (userType.includes('CaseworkerLicenseConfig') || userType.toLowerCase().includes('caseworker')) {
        return user.profile_image ?? user.logo ?? '/img/avatars/user.svg'
    }
    return user.profile_image ?? '/img/avatars/user.svg'
}

// Compact stamp for the conversation list: time today, "yesterday", else date.
function shortTime(value: string) {
    if (!value) return ''

    const date = new Date(value)
    const today = new Date()
    const isSameDay = date.toDateString() === today.toDateString()

    if (isSameDay) {
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }

    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === yesterday.toDateString()) {
        return t('messages.yesterday')
    }

    return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
}
</script>
