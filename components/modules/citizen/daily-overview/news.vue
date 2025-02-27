<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.news') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center h-80 text-sm mt-10"
            v-if="state.salesCampaigns?.data?.length === 0">
            {{ $t('dailyOverview.noNewsToShow') }}
        </div>

        <div class="min-h-96" v-else>
            <Carousel v-bind="state.carouselSettings">
                <Slide v-for="(salesCampaign, index) in state.salesCampaigns?.data" :key="index">
                    <div class="w-full space-y-2">
                        <div class="w-full h-full p-2 space-y-2">
                            <div class="bg-white rounded-md shadow-md w-full h-full">
                                <div class="bg-no-repeat w-full h-52 bg-cover rounded-t-md"
                                    :style="`background-image: url(${salesCampaign?.image});`">
                                </div>
                                <div class="pb-6 px-5 mt-3 text-left">
                                    <h3 class="font-semibold text-lg">{{ salesCampaign?.title }}</h3>
                                    <p class="text-xs text-gray-400 line-clamp-3 mt-1">
                                        {{ salesCampaign?.content }}
                                    </p>
                                    <div class="mt-4" v-if="salesCampaign?.link">
                                        <FormButton buttonStyle="primary"
                                            @click="navigateToExternalLink(salesCampaign?.link)"
                                            class="w-full rounded-md">
                                            {{ $t('dailyOverview.openLink') }}
                                        </FormButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Slide>

                <template #addons>
                    <pagination v-if="state.salesCampaigns?.data?.length > 2" />
                </template>
            </Carousel>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { Carousel, Slide, Pagination } from 'vue3-carousel'
import { dailyOverviewService } from '@/components/api/citizen/DailyOverviewService'
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
    salesCampaigns: [] as any,
})

onMounted(() => {
    fetchSalesCampaign()
})

async function fetchSalesCampaign() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dailyOverviewService.getSalesCampaigns()
        if (response) {
            state.salesCampaigns = response
            if (state.salesCampaigns?.data?.length > 2) {
                state.carouselSettings.autoplay = 2000
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
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
</style>