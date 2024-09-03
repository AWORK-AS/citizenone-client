<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('journalNotifications.unreadJournalNotes') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('journalNotifications.unreadJournalNotes') }}</template>

            <div class="min-h-44 space-y-3">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="max-w-3xl">
                        <div class="flex justify-end">
                            <FormButton buttonStyle="primary" buttonSize="xs" @click="markAllAsRead"
                                class="w-fit rounded-md">
                                {{ $t('journalNotifications.markAllAsRead') }}
                            </FormButton>
                        </div>

                        <!-- Notification List Container -->
                        <ul class="divide-y divide-gray-200">
                            <!-- Notification Item -->
                            <li class="py-4 cursor-pointer" v-for="(notification, index) in state.notifications?.data"
                                :key="index" @click="viewNotification(notification)">
                                <div class="flex items-center space-x-4">
                                    <div>
                                        <Icon name="ph:note-duotone" class="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900 truncate">
                                            {{ notification?.data?.journal?.title }}
                                        </p>
                                        <p class="mt-1 text-xs text-muted-400">
                                            <span>{{ formatDateToReadable(notification?.data?.journal?.date)
                                                }}</span>
                                        </p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { notificationService } from '@/components/api/NotificationService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const userStore = useUserStore()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    notifications: [] as any,
})

onMounted(() => {
    fetchNotifications()
})

async function fetchNotifications() {
    state.error = {}
    try {
        const response = await notificationService.getNotifications()
        if (response) {
            state.notifications = response
        }
    } catch (error: any) {
        state.error = error
    }
}

function viewNotification(notification: any) {
    const notificationUuid = notification?.data?.journal?.uuid
    navigateTo(`/journal-notifications/${notificationUuid}`)
}

async function markAllAsRead() {
    state.error = {}
    try {
        const response = await notificationService.markAllAsRead()
        if (response) {
            fetchNotifications()
            userStore.resetUserNotificationCount()
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>