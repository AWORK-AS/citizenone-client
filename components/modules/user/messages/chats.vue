<template>
    <div>
        <ul class="space-y-1">
            <li class="flex justify-end px-4 pt-4 pb-3">
                <button
                    class="bg-secondary text-white text-xs px-4 py-3 rounded-md flex items-center justify-center gap-x-2 outline-none"
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
                                    <img :src="chatMember?.user?.profile_image ?? '/img/avatars/user.svg'" alt="Item 1"
                                        class="w-11 h-11 rounded-full object-cover">
                                </div>
                                <div class="col-span-10">
                                    <Tooltip :text="chatMember?.user?.firstname + ' ' + chatMember?.user?.lastname">
                                        <h4 class="font-semibold text-sm">
                                            {{ chatMember?.user?.firstname + " " +
                                                chatMember?.user?.lastname }}
                                        </h4>
                                    </Tooltip>
                                    <p class="text-xxs" v-if="chat?.unread_messages > 0">
                                        {{ chat?.unread_messages }}
                                        <span class="lowercase">{{ $t('messages.unreadMessages') }}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="grid grid-cols-12 items-center">
                            <div class="col-span-2">
                                <img :src="chatToSelf(chat?.chat_members)[0]?.user?.profile_image ?? '/img/avatars/user.svg'"
                                    alt="Item 1" class="w-11 h-11 rounded-full object-cover">
                            </div>
                            <div class="col-span-10">
                                <Tooltip :text="chatToSelf(chat?.chat_members)[0]?.user?.firstname + ' ' +
                                    chatToSelf(chat?.chat_members)[0]?.user?.lastname">
                                    <h4 class="font-semibold text-sm">
                                        {{ chatToSelf(chat?.chat_members)[0]?.user?.firstname + " " +
                                            chatToSelf(chat?.chat_members)[0]?.user?.lastname }}
                                    </h4>
                                </Tooltip>
                                <p class="text-xxs" v-if="chat?.unread_messages > 0">
                                    {{ chat?.unread_messages }}
                                    <span class="lowercase">{{ $t('messages.unreadMessages') }}</span>
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
        <ModulesUserMessagesModalNewChat :isModalOpen="state.modal.isNewChatOpen"
            @close="state.modal.isNewChatOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"

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
    const members = excludeCurrentUserFromChatMembers(chat?.chat_members || [])
        .map((chatMember: any) => `${chatMember?.user?.firstname} ${chatMember?.user?.lastname}`)

    if (members.length === 0) return ''

    if (members.length <= 3) return members.join(', ')

    const remaining = members.length - 1
    return `${members[0]}, ${members[1]}, ${t('messages.and')?.toLowerCase()} ${remaining} ${t('messages.more')?.toLowerCase()}`
}

function openChat(chat: any) {
    navigateTo(`/messages/${chat.uuid}`)
}
</script>