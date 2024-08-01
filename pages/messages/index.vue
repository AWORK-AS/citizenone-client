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

                <ul>
                    <li v-for="file in files" :key="file.name">{{ file.name }}</li>
                </ul>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4">
                        <div class="md:col-span-5 xl:col-span-4 bg-white rounded-md p-6 overflow-y-auto"
                            style="height: 80vh;">
                            <ul>
                                <li class="flex items-center space-x-4 border-b border-gray-100 px-1 py-3 cursor-pointer"
                                    v-for="(chattedUser, index) in state.chattedUsers" :key="index"
                                    @click="messageEmployee(chattedUser)">
                                    <img src="/img/avatars/user.svg" alt="Item 1" class="w-12 h-12 rounded-full">
                                    <div>
                                        <h4 class="font-semibold text-sm">
                                            {{ chattedUser?.firstname + " " + chattedUser?.lastname }}
                                        </h4>
                                        <p class="text-gray-600 text-xs">
                                            {{ chattedUser?.email }}
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import pusher from '@/services/pusher'
import { messageService } from '@/components/api/MessageService'
import { useEmployeeStore } from '@/store/employee'
import { useUserStore } from '@/store/user'
import type { ChattedUser, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const employeeStore = useEmployeeStore() as any
const userStore = useUserStore() as any
const fileInput = ref<HTMLInputElement | null>(null)
const files = ref<File[]>([])

const state = reactive({
    chattedUsers: [] as ChattedUser[],
    error: {} as Error,
    isPageLoading: false,
})

onMounted(() => {
    const channel = pusher.subscribe('citizenone.' + userStore.getUser?.id)
    channel.bind('chat-message', (response: any) => {
        fetchChattedUsers()
    })
    fetchChattedUsers()
})

async function fetchChattedUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await messageService.fetchChattedUsers()
        if (response) {
            state.chattedUsers = response?.data
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}

function messageEmployee(employee: any) {
    employeeStore.setSelectedEmployee(employee)
    navigateTo(`/messages/${employee.uuid}`)
}
</script>