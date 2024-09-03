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
                    <h1 class="text-3xl text-primary font-bold">
                        {{ state.journal?.data?.title }}
                    </h1>
                    <div class="text-sm truncate" v-html="state.journal?.data?.content" id="content" />
                    <div class="text-sm truncate" v-html="state.journal?.data?.content" id="note" />
                    <p class="mt-1 text-xs text-muted-400">
                        <span>{{ formatDateToReadable(state.journal?.data?.date) }}</span>
                    </p>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { journalService } from '@/components/api/JournalService'
import { notificationService } from '@/components/api/NotificationService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const { formatDateToReadable } = useDatetimeFormatter()
const router = useRouter()
const journalNotificationUuid = router?.currentRoute?.value?.params?.journalNotificationUuid

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    journal: [] as any,
})

onMounted(() => {
    fetchJournal()
    markNotificationAsRead()
})

async function fetchJournal() {
    state.error = {}
    try {
        const response = await journalService.getJournal(journalNotificationUuid)
        if (response) {
            state.journal = response
        }
    } catch (error: any) {
        state.error = error
    }
}

async function markNotificationAsRead() {
    state.error = {}
    try {
        const response = await notificationService.markAsRead(journalNotificationUuid)
        if (response) {
            state.journal = response
            userStore.minusUserNotificationCount()
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>