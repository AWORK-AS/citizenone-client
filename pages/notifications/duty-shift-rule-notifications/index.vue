<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dutyShiftRuleNotifications.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('dutyShiftRuleNotifications.title') }}</template>

            <div class="min-h-44 space-y-3">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="state.notifications?.data?.length > 0">
                        <div class="flex justify-end">
                            <FormButton buttonStyle="primary" buttonSize="xs" @click="markAllAsRead"
                                class="w-fit rounded-md">
                                {{ $t('dutyShiftRuleNotifications.markAllAsRead') }}
                            </FormButton>
                        </div>

                        <ul class="mt-5 space-y-5">
                            <li v-for="(notification, index) in state.notifications?.data" :key="index" :class="[
                                'bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors',
                                !notification.read_at ? 'border-secondary' : 'border-transparent'
                            ]" @click="viewNotification(notification)">

                                <div class="flex items-start justify-between gap-3">
                                    <div class="space-y-1.5 flex-1">
                                        <Badge type="primary" class="w-fit">
                                            <p class="text-xs px-2">{{ notification?.data?.content?.rule?.name }}</p>
                                        </Badge>

                                        <p class="text-xs text-gray-600"
                                            v-if="notification?.data?.content?.triggered_employee">
                                            {{ $t('dutyShiftRuleNotifications.triggeredEmployee') }}:
                                            {{ notification.data.content.triggered_employee.firstname }}
                                            {{ notification.data.content.triggered_employee.lastname }}
                                        </p>

                                        <p class="text-xs text-gray-500" v-if="notification?.data?.content?.shift_type">
                                            {{ $t('dutyShiftRuleNotifications.shiftType') }}:
                                            {{ notification.data.content.shift_type.en_name }}
                                        </p>

                                        <p class="text-xs text-gray-500"
                                            v-if="notification?.data?.content?.time_window">
                                            {{ $t('dutyShiftRuleNotifications.timeWindow') }}:
                                            {{ formatDateToReadable(notification.data.content.time_window.start) }}
                                            –
                                            {{ formatDateToReadable(notification.data.content.time_window.end) }}
                                        </p>

                                        <p class="text-xs text-gray-400 mt-1">
                                            {{ formatDateToReadable(notification?.created_at) }}
                                        </p>
                                    </div>

                                    <div v-if="!notification.read_at"
                                        class="flex-shrink-0 w-2 h-2 rounded-full bg-secondary mt-1.5" />
                                </div>
                            </li>

                            <Pagination :data="state.notifications" @previous="previous" @next="next" />
                        </ul>
                    </div>

                    <div v-else class="min-h-44 flex items-center">
                        <p class="text-center grow">{{ $t('dutyShiftRuleNotifications.empty') }}.</p>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { notificationService } from '@/components/api/user/NotificationService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const userStore = useUserStore() as any

const breadcrumbLinks = [
    { name: 'dutyShiftRuleNotifications.title', translate: true, href: '/duty-shift-rule-notifications' },
]

let currentTablePage = 1

const PAGE_LENGTH = 30

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    notifications: [] as any,
})

onMounted(() => fetchNotifications())

async function fetchNotifications() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            type: 'DutyShiftRule',
            page: currentTablePage,
            page_length: PAGE_LENGTH,
        }
        const response = await notificationService.getNotifications(params)
        console.log('Fetched notifications:', response)
        if (response) state.notifications = response
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() { currentTablePage--; fetchNotifications() }
function next() { currentTablePage++; fetchNotifications() }

async function refreshUnreadCount() {
    try {
        const response = await notificationService.getNotifications({ page_length: 1 })
        userStore.setUserSystemNotificationCount(response?.total ?? 0)
    } catch { }
}

async function viewNotification(notification: any) {
    if (!notification.read_at) {
        state.error = {}
        try {
            const response = await notificationService.markAsRead(notification.id)
            if (response) {
                await refreshUnreadCount()
                fetchNotifications()
            }
        } catch (error: any) {
            state.error = error
        }
    }
}

async function markAllAsRead() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await notificationService.markAllAsRead()
        if (response) {
            await refreshUnreadCount()
            fetchNotifications()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
