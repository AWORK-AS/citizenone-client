<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('apps.apps') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('apps.apps') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div v-if="state.apps?.data">
                    <div class="ltablet:grid-cols-3 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div v-for="(app, index) in state.apps?.data" :key="index"
                            class="bg-white p-6 border rounded-md">
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
                                        {{ $t('excludeVat') }}
                                    </p>
                                </div>
                                <p class="text-muted-800 dark:text-muted-100 font-sans text-sm">
                                    {{ app?.description }}
                                </p>
                                <p class="cursor-pointer text-xs text-tertiary hover:text-tertiary/90"
                                    @click="navigateToTAC">
                                    {{ $t('apps.termsAndConditions') }}
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <FormButton type="button" buttonStyle="action" class="w-full" @click="readMore(app)">
                                    {{ $t('apps.readMore') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="action" class="w-full" color="primary">
                                    {{ $t('apps.activate') }}
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
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1

const state = reactive({
    apps: [] as any,
    error: {} as Error,
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
    state.error = {}
    state.isPageLoading = true
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
    // Convert the number to a string with two decimal places
    let numberStr = parseFloat(amount).toFixed(2)

    // Split the string into integer and decimal parts
    let parts = numberStr.split('.')
    let integerPart = parts[0]
    let decimalPart = parts[1]

    // Add the thousands separators
    let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Combine the integer part with the decimal part
    return 'DKK ' + formattedIntegerPart + ',' + decimalPart
}

async function navigateToTAC() {
    await navigateTo('https://citizenone.dk/vilkaarogbetingelser/', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>