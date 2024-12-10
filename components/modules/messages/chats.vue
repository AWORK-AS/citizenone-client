<template>
    <div>
        <ul>
            <li class="flex justify-end">
                <button class="bg-primary rounded-full w-8 h-8 flex items-center justify-center"
                    @click="state.modal.isNewChatOpen = true">
                    <Icon name="mdi:square-edit-outline" class="w-5 h-5 text-white" aria-hidden="true" />
                </button>
            </li>
            <li class="border-b border-gray-100 px-1 py-3 cursor-pointer" v-for="(chat, index) in props.chats?.data"
                :key="index" @click="openChat(chat)">
                <div v-if="chat?.type === 'direct'">
                    <div>
                        <div v-for="(chatMember, index) in excludeCurrentUserFromChatMembers(chat?.chat_members)"
                            :index="index" class="flex items-center space-x-4">
                            <img :src="chatMember?.user?.profile_image ?? '/img/avatars/user.svg'" alt="Item 1"
                                class="w-12 h-12 rounded-full object-cover">
                            <div>
                                <h4 class="font-semibold text-sm">
                                    {{ chatMember?.user?.firstname + " " +
                                        chatMember?.user?.lastname }}
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="chat?.type === 'group'">
                    <div class="flex items-center space-x-4">
                        <img src="/img/avatars/user.svg" alt="Item 1" class="w-12 h-12 rounded-full object-cover">
                        <div class="flex gap-x-1 truncate">
                            <div v-for="(chatMember, index) in excludeCurrentUserFromChatMembers(chat?.chat_members)"
                                :index="index">
                                <h4 class="font-semibold text-sm">
                                    {{ chatMember?.user?.firstname }}
                                    {{ chatMember?.user?.lastname }}<span
                                        v-if="index !== excludeCurrentUserFromChatMembers(chat?.chat_members).length - 1">,</span><span
                                        v-else>...</span>
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
        <ModulesMessagesModalNewChat :isModalOpen="state.modal.isNewChatOpen"
            @close="state.modal.isNewChatOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const router = useRouter()
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

function excludeCurrentUserFromChatMembers(chatMembers: any) {
    return chatMembers.filter((chatMember: any) => chatMember.user_id !== userStore.getUser?.id)
}

function openChat(chat: any) {
    navigateTo(`/messages/${chat.uuid}`)
}
</script>