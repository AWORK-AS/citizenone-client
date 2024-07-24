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
                    <div class="h-64 overflow-y-auto mb-4">
                        <div v-for="(message, index) in state.messages" :key="index" class="mb-2">
                            <div class="text-gray-800">{{ message }}</div>
                        </div>
                    </div>
                    <input v-model="state.message" @keydown.enter="sendMessage" placeholder="Type a message..."
                        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none" />
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
    console.log('userStore.getUser.id', userStore.getUser.id)
    const channel = pusher.subscribe('citizenone.' + userStore.getUser.id)
    channel.bind('chat-message', (data: any) => {
        state.messages.push(data)
        console.log('state.messages', state.messages)
        console.log('data', data)
    })
})

async function sendMessage() {
    if (state.message !== '') {
        state.messages.push(state.message)
        // You would also send this message to your backend here
        state.isPageLoading = true
        try {
            const params = {
                message: state.message,
                receiver_uuid: receiverUuid
            }
            const response = await messageService.sendMessage(params)
            if (response) {
                console.log('response', response)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
        state.message = ''
    }
}

function formatDateTimeToReadable(datetime: string) {
    return moment(datetime).format('DD. MMM YYYY HH:mm:ss')
}
</script>