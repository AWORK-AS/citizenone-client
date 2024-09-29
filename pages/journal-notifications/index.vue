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
                    <div class="max-w-3xl" v-if="state.notifications.length > 0">
                        <div class="flex justify-end">
                            <FormButton buttonStyle="primary" buttonSize="xs" @click="markAllAsRead"
                                class="w-fit rounded-md">
                                {{ $t('journalNotifications.markAllAsRead') }}
                            </FormButton>
                        </div>

                        <!-- Notification List Container -->
                        <ul class="mt-5 space-y-5">
                            <!-- Notification Item -->
                            <li class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-8 border-secondary mt cursor-pointer"
                                v-for="(notification, index) in state.notifications" :key="index"
                                @click="viewNotification(notification)">
                                <Badge type="primary" class="w-fit">
                                    <p class="text-xs px-2">
                                        asdasd
                                    </p>
                                </Badge>
                                <p class="text-xs py-1"
                                    v-if="notification?.data?.user?.firstname && notification?.data?.user?.lastname">
                                    {{ $t('dailyOverview.createdBy') }}
                                    {{ notification?.data?.user?.firstname + ' ' +
                                        notification?.data?.user?.lastname }}
                                </p>
                                <div class="px-1">
                                    <h3 class="text-base font-semibold">
                                        {{ notification?.data?.title }}
                                    </h3>
                                    <div v-html="notification?.data?.content" class="text-sm line-clamp-2" />
                                    <p class="content text-xs text-muted-400 mt-1">
                                        <span>{{ formatDateToReadable(notification?.data?.date) }}</span>
                                    </p>
                                </div>
                                <!-- <div class="mt-2 flex items-center space-x-4">
                                    <div>
                                        <Icon name="ph:note-duotone" class="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900 truncate">
                                            {{ notification?.data?.title }}
                                        </p>
                                        <p class="mt-1 text-xs text-muted-400">
                                            <span>
                                                {{ formatDateToReadable(notification?.data?.date) }}
                                            </span>
                                        </p>
                                    </div>
                                </div> -->
                            </li>
                        </ul>
                    </div>
                    <div v-else class="min-h-44 flex items-center">
                        <p class="text-center grow">
                            {{ $t('journalNotifications.youDontHaveUnreadJournalNotes') }}.
                        </p>
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
    const notificationId = notification?.id
    navigateTo(`/journal-notifications/${notificationId}`)
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