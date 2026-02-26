<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('journalNotifications.unreadJournalNotes') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('journalNotifications.unreadJournalNotes') }}</template>

            <div class="min-h-44 space-y-3">
                <Alert type="danger" :text="state?.errorSelectedJournal?.message"
                    v-if="state.errorSelectedJournal?.message && state.errorSelectedJournal.message.length > 0" />
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="state.notifications?.data?.length > 0">
                        <div class="flex justify-end">
                            <FormButton buttonStyle="primary" buttonSize="xs" @click="markAllAsRead"
                                class="w-fit rounded-md">
                                {{ $t('journalNotifications.markAllAsRead') }}
                            </FormButton>
                        </div>

                        <!-- Notification List Container -->
                        <ul class="mt-5 space-y-5">
                            <!-- Notification Item -->
                            <li class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary mt cursor-pointer"
                                v-for="(notification, index) in state.notifications?.data" :key="index"
                                @click="viewNotification(notification)">
                                <Badge type="primary" class="w-fit">
                                    <p class="text-xs px-2">
                                        {{ notification?.data?.citizen?.firstname }}
                                        {{ notification?.data?.citizen?.lastname }}
                                    </p>
                                </Badge>
                                <p class="text-xs py-1"
                                    v-if="notification?.data?.user?.firstname && notification?.data?.user?.lastname">
                                    {{ $t('journalNotifications.createdBy') }}
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
                            </li>
                            <Pagination :data="state.notifications" @previous="previous" @next="next" />
                        </ul>
                    </div>
                    <div v-else class="min-h-44 flex items-center">
                        <p class="text-center grow">
                            {{ $t('journalNotifications.youDontHaveUnreadJournalNotes') }}.
                        </p>
                    </div>
                </LoadingSpinner>
            </div>
            <ModulesUserCitizenJournalModalEdit :isModalOpen="state.modal.isEditJournalOpen"
                :selectedJournal="state.selectedJournal" @close="state.modal.isEditJournalOpen = false"
                @refreshJournal="" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { journalService } from '@/components/api/user/JournalService'
import { notificationService } from '@/components/api/user/NotificationService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const userStore = useUserStore()
const breadcrumbLinks = [
    {
        name: 'journalNotifications.unreadJournalNotes',
        translate: true,
        href: '/journal-notifications',
    },
]
let currentTablePage = 1

const state = reactive({
    error: {} as Error,
    errorSelectedJournal: {} as Error,
    isPageLoading: false,
    modal: {
        isEditJournalOpen: false,
    },
    notifications: [] as any,
    selectedJournal: {} as any,
    selectedNotification: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchNotifications()
})

async function fetchNotifications() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await notificationService.getNotifications(params)
        if (response) {
            state.notifications = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage = currentTablePage - 1
    fetchNotifications()
}

function next() {
    currentTablePage = currentTablePage + 1
    fetchNotifications()
}

function viewNotification(notification: any) {
    // const notificationId = notification?.id
    // navigateTo(`/journal-notifications/${notificationId}`)
    state.selectedNotification = notification
    fetchSelectedJournal()
}

async function fetchSelectedJournal() {
    state.error = {}
    state.errorSelectedJournal = {}
    state.isPageLoading = true
    try {
        const journalUuid = state.selectedNotification?.data?.uuid
        const response = await journalService.getJournal(journalUuid)
        if (response) {
            state.modal.isEditJournalOpen = true
            state.selectedJournal = response?.data
        }
    } catch (error: any) {
        state.errorSelectedJournal = error
        state.modal.isEditJournalOpen = false
        markNotificationAsRead()
    }
    state.isPageLoading = false
}

async function markNotificationAsRead() {
    state.error = {}
    state.isPageLoading = true
    try {
        const journalNotificationId = state.selectedNotification?.id
        const response = await notificationService.markAsRead(journalNotificationId)
        if (response) {
            userStore.minusUserNotificationCount()
            fetchNotifications()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function markAllAsRead() {
    state.isPageLoading = true
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
    state.isPageLoading = false
}
</script>