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
                <div class="grid grid-cols-12 items-center">
                    <div class="col-span-2">
                        <img :src="memberAvatar(otherMember(chat?.chat_members))" alt="Item 1"
                            class="w-11 h-11 rounded-full object-cover">
                    </div>
                    <div class="col-span-10">
                        <Tooltip :text="memberDisplayName(otherMember(chat?.chat_members))">
                            <h4 class="font-semibold text-sm">{{ memberDisplayName(otherMember(chat?.chat_members)) }}</h4>
                        </Tooltip>
                        <p class="text-xxs" v-if="chat?.unread_messages > 0">
                            {{ chat?.unread_messages }}
                            <span class="lowercase">{{ $t('messages.unreadMessages') }}</span>
                        </p>
                    </div>
                </div>
            </li>
        </ul>
        <ModulesRelativeMessagesModalNewChat :isModalOpen="state.modal.isNewChatOpen"
            @close="state.modal.isNewChatOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

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

function otherMember(chatMembers: any) {
    return chatMembers?.find((chatMember: any) => chatMember.user_id !== userStore.getUser?.id) ?? chatMembers?.[0]
}

function openChat(chat: any) {
    navigateTo(`/relative/messages/${chat.uuid}`)
}

function memberDisplayName(member: any) {
    if (!member) return ''
    const user = member.user || {}

    return `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim()
}

function memberAvatar(member: any) {
    return member?.user?.profile_image ?? '/img/avatars/user.svg'
}
</script>
