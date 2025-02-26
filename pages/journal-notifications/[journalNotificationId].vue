<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ state.journal?.data?.title }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="state.breadcrumbLinks" />
            </template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/journal-notifications">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <div class="min-h-44 space-y-3">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div
                        class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary cursor-pointer">
                        <Badge type="primary" class="w-fit">
                            <p class="text-xs px-2">
                                {{ state.journal?.data?.citizen?.firstname }}
                                {{ state.journal?.data?.citizen?.lastname }}
                            </p>
                        </Badge>
                        <p class="text-xs py-1"
                            v-if="state.journal?.data?.user?.firstname && state.journal?.data?.user?.lastname">
                            {{ $t('journalNotifications.createdBy') }}
                            {{ state.journal?.data?.user?.firstname + ' ' +
                                state.journal?.data?.user?.lastname }}
                        </p>
                        <h1 class="text-3xl text-primary font-bold">
                            {{ state.journal?.data?.title }}
                        </h1>
                        <div class="content text-sm" v-html="state.journal?.data?.content" />
                        <div class="content text-sm" v-html="state.journal?.data?.note" />
                        <p class="mt-1 text-xs text-muted-400">
                            <span>{{ formatDateToReadable(state.journal?.data?.date) }}</span>
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
import { journalService } from '@/components/api/JournalService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const router = useRouter()
const journalNotificationId = router?.currentRoute?.value?.params?.journalNotificationId

const state = reactive({
    breadcrumbLinks: [
        {
            name: 'journalNotifications.unreadJournalNotes',
            translate: true,
            href: '/journal-notifications',
        },
    ],
    error: {} as Error,
    isPageLoading: false,
    notification: [] as any,
    journal: [] as any,
})

onMounted(() => {
    markNotificationAsRead()
    fetchNotification()
})

async function markNotificationAsRead() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await notificationService.markAsRead(journalNotificationId)
        if (response) {
            state.journal = response
            userStore.minusUserNotificationCount()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchNotification() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await notificationService.getNotification(journalNotificationId)
        if (response) {
            state.notification = response
            fetchJournal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchJournal() {
    state.error = {}
    state.isPageLoading = true
    try {
        const journalUuid = state.notification?.data?.uuid
        const response = await journalService.getJournal(journalUuid)
        if (response) {
            state.journal = response
            state.breadcrumbLinks.push({
                name: response?.data?.title ?? '',
                translate: false,
                href: `/journal-notifications/${journalNotificationId}`,
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>