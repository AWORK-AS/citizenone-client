<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>Apps - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>Apps</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div v-if="state.apps?.data">
                    <div class="ltablet:grid-cols-3 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div v-for="(app, index) in state.apps?.data" :key="index" class="p-6 border rounded-md">
                            <div class="mb-3 flex items-center gap-3">
                                <img :src="app.logo" alt="App logo" class="w-10" />
                                <div class="leading-none">
                                    <h4 class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium">
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
                                <FormButton type="button" buttonStyle="action" class="w-full" @click="readMore(app)">
                                    Read More
                                </FormButton>
                                <FormButton type="button" buttonStyle="action" class="w-full" color="primary">
                                    Activate
                                </FormButton>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6">
                        <Pagination :data="state.apps" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesAppModalAppDetails :isModalOpen="state.modal.showAppDetails" :selectedApp="state.selectedApp"
                    @close="state.modal.showAppDetails = false" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/AppService'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1

const state = reactive({
    apps: [],
    error: [],
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
    state.error = []
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