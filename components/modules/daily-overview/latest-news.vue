<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-base font-medium py-2">{{ $t('dailyOverview.latestNews') }}</h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <Carousel v-bind="state.carouselSettings">
            <Slide v-for="(news, index) in state.news?.data" :key="index">
                <div class="w-full p-2 space-y-2">
                    <div class="bg-white shadow-md p-6 rounded-md">
                        <div class="bg-no-repeat w-full h-60 bg-cover"
                            :style="`background-image: url(${news?.image});`">
                        </div>
                        <h3 class="font-semibold text-lg py-2">{{ news?.title }}</h3>
                        <p class="text-sm text-gray-400 line-clamp-3">
                            {{ news?.content }}
                        </p>
                    </div>
                </div>
            </Slide>
        </Carousel>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import type { Error } from '@/types'

const state = reactive({
    carouselSettings: {
        autoplay: 2000,
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
                itemsToShow: 2,
                snapAlign: "start",
            },
            // 1367px and up
            1367: {
                itemsToShow: 2,
                snapAlign: "start",
            },
        },
        pauseAutoplayOnHover: true,
        wrapAround: true,
    },
    isPageLoading: false,
    error: {} as Error,
    news: [] as any,
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
</script>

<style>
.carousel__slide {
    align-items: start;
}
</style>