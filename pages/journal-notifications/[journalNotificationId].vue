<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ state.journal?.data?.title }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/journal-notifications">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <div class="min-h-44 space-y-3">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div
                        class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-8 border-secondary mt cursor-pointer">
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
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const { formatDateToReadable } = useDatetimeFormatter()
const router = useRouter()
const journalNotificationId = router?.currentRoute?.value?.params?.journalNotificationId

const state = reactive({
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
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>