<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('apps.apps') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('apps.apps') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-2">
                    <Alert type="danger" :text="error" v-if="error && error.length > 0" />
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                </div>
                <div id="apps-checkout"></div>
                <div v-if="!state.isAppsHidden">
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
                                    <div class="font-sans text-sm" v-if="app?.is_one_time_fee">
                                        {{ formatAmount(app?.price) }}
                                        {{ $t('excludeVat') }}
                                    </div>
                                    <div class="font-sans text-sm" v-else>
                                        {{ formatAmount(app?.monthly_price) }}
                                        <span class="lowercase">/{{ $t('apps.month') }}</span>
                                        <span>
                                            ({{ formatAmount(app?.yearly_price) }}
                                            <span class="lowercase">/{{ $t('apps.year') }}</span>)
                                        </span>
                                        {{ $t('excludeVat') }}
                                    </div>
                                </div>
                                <p class="text-muted-800 dark:text-muted-100 font-sans text-sm line-clamp-1">
                                    {{ app?.description }}
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <FormButton type="button" buttonStyle="action" class="w-full" @click="readMore(app)">
                                    {{ $t('apps.readMore') }}
                                </FormButton>
                                <FormButton type="button" :buttonStyle="app?.is_active ? 'warning' : 'action'" :class="[
                                    app?.is_active && 'cursor-not-allowed',
                                    'w-full'
                                ]" color="primary" @click="!app?.is_active && confirmTACAcceptance(app)">
                                    {{ app?.is_active ? $t('apps.activated') : $t('apps.activate') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6">
                        <Pagination :data="state.apps" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesAppModalAppDetails :isModalOpen="state.modal.showAppDetails" :selectedApp="state.selectedApp"
                    @close="state.modal.showAppDetails = false" @activateApp="activateApp" />
                <ModulesAppModalTACConfirmation :isModalOpen="state.modal.isAcceptTACOpen"
                    :selectedApp="state.selectedApp" @close="state.modal.isAcceptTACOpen = false"
                    @confirm="activateApp" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/AppService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1
let checkout = null as any
const router = useRouter()
let error: string | undefined = router?.currentRoute?.value?.query?.error as string | undefined

const state = reactive({
    apps: [] as any,
    error: {} as Error,
    isAppsHidden: false,
    isPageLoading: false,
    modal: {
        isAcceptTACOpen: false,
        showAppDetails: false,
    },
    selectedApp: [] as any,
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

function confirmTACAcceptance(app: any) {
    state.selectedApp = app
    state.modal.isAcceptTACOpen = true
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

async function activateApp(frequency: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {} as any
        if (!state.selectedApp?.is_one_time_fee) {
            params.terms = frequency.value === 'monthly' ? 'monthly' : 'yearly'
        }
        const appUuid = state.selectedApp?.uuid
        const response = await appService.activateApp(appUuid, params)
        if (response) {
            const checkoutOptions = {
                checkoutKey: runtimeConfig?.public?.checkoutKey,
                paymentId: response?.paymentId,
                containerId: "apps-checkout",
                language: "da-DK",
                theme: {
                    buttonRadius: "5px"
                }
            }
            checkout = new Dibs.Checkout(checkoutOptions)
            checkout.on('payment-completed', function (response: any) {
                checkout.cleanup()
                const paymentId = response['paymentId']
                navigateTo(`/apps/purchased-successfully?paymentId=${paymentId}`)
            })
            state.isAppsHidden = true
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>