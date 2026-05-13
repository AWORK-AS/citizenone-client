<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">{{ $t('overview.bulletBoard') }}</h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.news?.data?.length === 0">
            {{ $t('overview.noBulletBoardToShow') }}
        </div>

        <div class="min-h-96 max-h-96 overflow-y-auto mt-2 space-y-2 pr-1" v-else>
            <div
                v-for="(news, index) in state.news?.data"
                :key="index"
                class="bg-white rounded-md shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                :class="news?.is_featured ? 'border-l-4 border-l-primary' : ''"
                @click="viewSelectedNews(news)"
            >
                <div class="flex items-start gap-3 p-3">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <Icon
                                v-if="news?.is_featured"
                                name="ph:push-pin-fill"
                                class="w-4 h-4 text-primary flex-shrink-0"
                            />
                            <h3 class="font-semibold text-sm text-gray-800 truncate">
                                {{ news?.title }}
                            </h3>
                        </div>
                        <p class="text-xs text-gray-500 line-clamp-2">
                            {{ news?.preview || stripHtml(news?.content) }}
                        </p>
                        <div class="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <Icon name="ph:user" class="w-3 h-3" />
                            <span>{{ [news?.user?.firstname, news?.user?.lastname].filter(Boolean).join(' ') }}</span>
                            <span class="text-gray-300">·</span>
                            <Icon name="ph:calendar" class="w-3 h-3" />
                            <span>{{ formatDateToReadable(news?.created_at) }}</span>
                        </div>
                    </div>
                    <img
                        v-if="news?.image"
                        :src="news.image"
                        class="w-14 h-14 object-cover rounded-md flex-shrink-0"
                        alt=""
                    />
                </div>
            </div>
        </div>

        <ModulesCitizenDailyOverviewBulletBoardModalView
            :isModalOpen="state.modal.isViewSelectedNews"
            :selectedNews="state.selectedNews"
            @close="state.modal.isViewSelectedNews = false"
        />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/citizen/DailyOverviewService'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    modal: {
        isViewSelectedNews: false,
    },
    news: [] as any,
    selectedNews: {},
})

onMounted(() => {
    fetchNews()
})

async function fetchNews() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dailyOverviewService.getNews()
        if (response) {
            state.news = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function viewSelectedNews(news: any) {
    state.selectedNews = news
    state.modal.isViewSelectedNews = true
}

function stripHtml(html: string): string {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim()
}
</script>
