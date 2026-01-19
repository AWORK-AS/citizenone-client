<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">{{ $t('overview.bulletBoard') }}</h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.news?.data?.length === 0">
            {{ $t('overview.noBulletBoardToShow') }}
        </div>

        <div class="min-h-96" v-else>
            <Carousel v-bind="state.carouselSettings">
                <Slide v-for="(news, index) in state.news?.data" :key="index">
                    <div class="w-full h-full p-2 space-y-2">
                        <div class="relative bg-white rounded-md shadow-md w-full h-full">
                            <div class="bg-no-repeat w-full h-52 bg-cover rounded-t-md"
                                :style="`background-image: url(${news?.image});`" v-if="news?.image">
                            </div>
                            <div class="absolute top-3 right-0 bg-secondary px-3 py-1 rounded-tl-md rounded-bl-md"
                                v-if="news?.is_featured">
                                <p class="text-sm text-white">
                                    {{ $t('bulletBoard.featured') }}
                                </p>
                            </div>
                            <div :class="[
                                !news?.image ? 'pt-5' : 'mt-3',
                                'pb-6 px-5 text-left'
                            ]">
                                <h3 class="font-semibold text-lg cursor-pointer" @click="viewSelectedNews(news)">
                                    {{ news?.title }}
                                </h3>
                                <p :class="[
                                    news?.image && 'line-clamp-3',
                                    'text-xs text-gray-400 mt-1 cursor-pointer'
                                ]" v-html="news?.content?.replace(/\n/g, '<br>')" @click="viewSelectedNews(news)" />
                                
                                <!-- Attachments Section -->
                                <div v-if="news?.attachments && news.attachments.length > 0" class="mt-4">
                                    <div class="flex items-center gap-1 mb-2">
                                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <span class="text-xs font-medium text-gray-600">
                                            {{ $t('overview.bulletBoardAttachments') }} ({{ news.attachments.length }})
                                        </span>
                                    </div>
                                    <div class="space-y-2 max-h-32 overflow-y-auto">
                                        <a 
                                            v-for="(attachment, attIndex) in news.attachments" 
                                            :key="attIndex"
                                            :href="attachment.original_url"
                                            target="_blank"
                                            class="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors group"
                                        >
                                            <Icon name="ph:file" class="w-6 h-6 text-primary flex-shrink-0" />
                                            
                                            <div class="flex-1 min-w-0">
                                                <p class="text-xs text-gray-700 group-hover:text-gray-900 truncate font-medium">
                                                    {{ attachment.name }}
                                                </p>
                                                <p class="text-xs text-gray-400">
                                                    {{ formatFileSize(attachment.size) }}
                                                </p>
                                            </div>
                                            
                                            <!-- Download Icon -->
                                             <Icon name="ph:download" class="w-4 h-4 text-primary flex-shrink-0" />
                                        </a>
                                    </div>
                                </div>
                                
                                <div class="mt-4" v-if="news?.link">
                                    <FormButton buttonStyle="primary" @click="navigateToExternalLink(news?.link)"
                                        class="w-full rounded-md">
                                        {{ $t('overview.openLink') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </Slide>

                <template #addons>
                    <navigation v-if="state.news?.data?.length > 1" />
                    <pagination v-if="state.news?.data?.length > 1" />
                </template>
            </Carousel>
            <ModulesUserDailyOverviewBulletBoardModalView :isModalOpen="state.modal.isViewSelectedNews"
                :selectedNews="state.selectedNews" @close="state.modal.isViewSelectedNews = false" />
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination } from 'vue3-carousel'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import type { Error } from '@/types'

const state = reactive({
    carouselSettings: {
        autoplay: 0,
        breakpoints: {
            // 280px and up
            280: {
                itemsToShow: 1,
                snapAlign: "start",
            },
            // 640px and up
            640: {
                itemsToShow: 1,
                snapAlign: "start",
            },
            // 768px and up
            768: {
                itemsToShow: 1,
                snapAlign: "start",
            },
            // 1025px and up
            1025: {
                itemsToShow: 1,
                snapAlign: "start",
            },
            // 1367px and up
            1367: {
                itemsToShow: 1,
                snapAlign: "start",
            },
        },
        pauseAutoplayOnHover: true,
        wrapAround: true,
    },
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
            if (state.news?.data?.length > 1) {
                const isFeatured = state.news?.data.find((news: any) => news?.is_featured)
                if (isFeatured === undefined) {
                    state.carouselSettings.autoplay = 2000
                }
            }
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

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

function formatFileSize(bytes: number): string {
    if (! bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style>
.carousel__slide {
    align-items: start;
}

.carousel__prev,
.carousel__next {
    top: 7rem;
    color: white;
}

.carousel__prev:hover,
.carousel__next:hover {
    color: white;
}
</style>