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