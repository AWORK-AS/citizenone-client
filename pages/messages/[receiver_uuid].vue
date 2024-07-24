<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('messages.messages') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('messages.messages') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">

                    <div class="grid grid-cols-12">
                        <div>

                        </div>
                    </div>

                    <!-- Chat Messages -->
                    <div class="p-4 overflow-y-auto">
                        <div v-for="(message, index) in state.messages" :key="index">
                            <!-- Message (Right) -->
                            <div class="flex items-start justify-end mb-4"
                                v-if="message?.sender_id === userStore.getUser.id">
                                <div class="mr-2">
                                    <div class="bg-primary text-white p-3 rounded-lg">
                                        <p>{{ message?.message }}</p>
                                    </div>
                                    <span class="text-xs text-gray-500 mt-1">
                                        {{ formatTimeToReadable(message?.created_at) }}
                                    </span>
                                </div>
                                <div class="flex-shrink-0 flex items-center">
                                    <img class="h-10 w-10 rounded-full mt-1" src="/img/avatars/user.svg" alt="User">
                                </div>
                            </div>
                            <!-- Message (Left) -->
                            <div class="flex items-start mb-4" v-else>
                                <div class="flex-shrink-0">
                                    <img class="h-10 w-10 rounded-full mt-1" src="/img/avatars/user.svg" alt="User">
                                </div>
                                <div class="ml-2">
                                    <div class="bg-gray-200 p-3 rounded-lg">
                                        <p class="text-gray-700">
                                        <p>{{ message?.message }}</p>
                                        </p>
                                    </div>
                                    <span class="text-xs text-gray-500 mt-1">
                                        {{ formatTimeToReadable(message?.created_at) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Chat Input -->
                    <div>
                        <div class="flex">
                            <input
                                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                type="text" placeholder="Type a message..." v-model="state.message"
                                @keydown.enter="sendMessage">
                            <button type="button"
                                class="ml-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-opacity-50"
                                @click="sendMessage">
                                Send
                            </button>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import pusher from '@/services/pusher'
import { messageService } from '@/components/api/MessageService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const router = useRouter()
const receiverUuid = router?.currentRoute?.value?.params?.receiver_uuid

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    message: '',
    messages: [] as any
})

onMounted(() => {
    const channel = pusher.subscribe('citizenone.' + userStore.getUser.id)
    channel.bind('chat-message', (response: any) => {
        state.messages.push(response?.data)
    })
})

async function sendMessage() {
    if (state.message !== '') {
        state.isPageLoading = true
        try {
            const params = {
                message: state.message,
                receiver_uuid: receiverUuid
            }
            const response = await messageService.sendMessage(params)
            if (response) {
                state.messages.push(response?.data)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
        state.message = ''
    }
}

function formatTimeToReadable(datetime: string) {
    return moment(datetime).format('HH:mm')
}
</script>