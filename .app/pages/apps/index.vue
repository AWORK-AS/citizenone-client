<template>
    <div>

        <Head>
            <Title>Apps - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <LoadingSpinner :isActive="state.isPageLoading">
            <TairoContentWrapper>
                <div>
                    <div v-if="state.apps?.data">
                        <div class="ltablet:grid-cols-3 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <TransitionGroup enter-active-class="transform-gpu"
                                enter-from-class="opacity-0 -translate-x-full"
                                enter-to-class="opacity-100 translate-x-0" leave-active-class="absolute transform-gpu"
                                leave-from-class="opacity-100 translate-x-0"
                                leave-to-class="opacity-0 -translate-x-full">
                                <BaseCard v-for="(app, index) in state.apps?.data" :key="index" rounded="lg"
                                    class="p-4">
                                    <div class="mb-3 flex items-center gap-3">
                                        <BaseAvatar :src="app.logo" :text="app.name" size="md"
                                            class="bg-muted-500/20 text-muted-500" />
                                        <div class="leading-none">
                                            <h4
                                                class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium">
                                                {{ app.name }}
                                            </h4>
                                        </div>
                                    </div>
                                    <div class="my-4 space-y-3">
                                        <div class="text-muted-400 flex items-center gap-1">
                                            <Icon name="material-symbols:receipt" class="size-4" />
                                            <p class="font-sans text-sm">
                                                {{ formatAmount(app?.price) }}
                                            </p>
                                        </div>
                                        <p class="text-muted-800 dark:text-muted-100 font-sans text-sm">
                                            {{ app?.description }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <BaseButton rounded="md" class="w-full" @click="readMore(app)">
                                            Read More
                                        </BaseButton>
                                        <BaseButton rounded="md" class="w-full" color="primary">
                                            Activate
                                        </BaseButton>
                                    </div>
                                </BaseCard>
                            </TransitionGroup>
                        </div>
                        <div class="mt-6">
                            <Pagination :data="state.apps" @previous="previous" @next="next" />
                        </div>
                    </div>
                    <div v-else>
                        <BasePlaceholderPage title="No data available"
                            subtitle="There is no data to show you right now.">
                            <template #image>
                                <img class="block dark:hidden"
                                    src="/img/illustrations/placeholders/flat/placeholder-projects.svg"
                                    alt="Placeholder image" />
                                <img class="hidden dark:block"
                                    src="/img/illustrations/placeholders/flat/placeholder-projects-dark.svg"
                                    alt="Placeholder image" />
                            </template>
                        </BasePlaceholderPage>
                    </div>
                </div>
                <ModulesAppModalAppDetails :isModalOpen="state.modal.showAppDetails" :selectedApp="state.selectedApp"
                    @close="state.modal.showAppDetails = false" />
            </TairoContentWrapper>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/AppService'

definePageMeta({
    layout: 'user',
    title: 'Apps',
})

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1

const state = reactive({
    apps: [],
    error: null,
    isPageLoading: false,
    modal: {
        showAppDetails: false,
    },
    selectedApp: []
})

onMounted(() => {
    fetchApps()
})

async function fetchApps() {
    state.isPageLoading = true
    state.error = null
    try {
        const params = {
            page: currentTablePage,
        }
        const response = await appService.getApps(params)
        if (response) {
            state.apps = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchApps()
}

function next() {
    currentTablePage++
    fetchApps()
}

function readMore(app: any) {
    state.selectedApp = app
    state.modal.showAppDetails = true
}

function formatAmount(amount: any) {
    return 'DKK' + numberWithCommas(parseFloat(amount).toFixed(2))
}

function numberWithCommas(number: string) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
</script>