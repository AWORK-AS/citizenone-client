<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('apps.apps') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('apps.apps') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-2">
                    <Alert type="danger" :text="error" v-if="error && error.length > 0" />
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                </div>
                <div id="apps-checkout"></div>
                <div v-if="!state.isAppsHidden">
                    <div class="border-b-1.5 border-gray-200">
                        <ul class="flex item-center gap-x-5 overflow-x-auto touch-auto">
                            <li :class="[
                                state.filter.type === 'citizenone' && 'text-secondary border-b-2 border-secondary',
                                'text-gray-700 text-base cursor-pointer px-2 pb-3 hover:text-primary'
                            ]" @click="changeCategory('citizenone')">
                                {{ $t('apps.categories.citizenone') }}
                            </li>
                            <li :class="[
                                state.filter.type === 'fst' && 'text-secondary border-b-2 border-secondary',
                                'text-gray-700 text-base px-2 pb-3 cursor-pointer hover:text-primary'
                            ]" @click="changeCategory('fst')">
                                {{ $t('apps.categories.fst') }}
                            </li>
                            <li :class="[
                                state.filter.type === 'marketing' && 'text-secondary border-b-2 border-secondary',
                                'text-gray-700 text-base cursor-pointer px-2 pb-3 hover:text-primary'
                            ]" @click="changeCategory('marketing')">
                                {{ $t('apps.categories.marketing') }}
                            </li>
                            <li :class="[
                                state.filter.type === 'visual' && 'text-secondary border-b-2 border-secondary',
                                'text-gray-700 text-base px-2 pb-3 cursor-pointer hover:text-primary'
                            ]" @click="changeCategory('visual')">
                                {{ $t('apps.categories.visual') }}
                            </li>
                            <li :class="[
                                state.filter.type === 'other' && 'text-secondary border-b-2 border-secondary',
                                'text-gray-700 text-base px-2 pb-3 cursor-pointer hover:text-primary'
                            ]" @click="changeCategory('other')">
                                {{ $t('apps.categories.other') }}
                            </li>
                        </ul>
                    </div>

                    <div class="mt-8 space-y-5">
                        <div class="flex items-center gap-x-2">
                            <img src="/img/icons/featured-stars.svg" :alt="$t('imageFailedToLoad')">
                            <h3 class="text-lg font-semibold">
                                {{ $t('apps.featuredApps') }}
                            </h3>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div class="md:col-span-2 relative" v-if="getPopularApp()">
                                <div class="relative min-h-72 space-y-3 bg-gradient-to-r p-7 md:col-span-2 rounded-xl overflow-hidden"
                                    :style="getPopularApp()?.background_image
                                        ? `background: linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${getPopularApp().background_image}) no-repeat center center; background-size: cover;`
                                        : `background: linear-gradient(48deg,rgba(59, 164, 190, 1) 0%, rgba(41, 130, 155, 1) 50%, rgba(26, 99, 122, 1) 100%);`">
                                    <div class="w-40 h-40 bg-white/10 absolute -right-4 -top-10 z-20 rounded-full" />
                                    <div
                                        class="flex items-center gap-x-2 bg-white/30 text-white w-fit px-4 py-1 rounded-full">
                                        <Icon name="ic:sharp-trending-up" class="w-5 h-5" />
                                        <span class="text-xs">
                                            {{ $t('apps.mostPopular') }}
                                        </span>
                                    </div>
                                    <p class="text-white text-sm">
                                        <span v-if="state.filter.type === 'citizenone'">
                                            {{ $t('apps.categories.citizenone') }}
                                        </span>
                                        <span v-if="state.filter.type === 'fst'">
                                            {{ $t('apps.categories.fst') }}
                                        </span>
                                        <span v-if="state.filter.type === 'marketing'">
                                            {{ $t('apps.categories.marketing') }}
                                        </span>
                                        <span v-if="state.filter.type === 'visual'">
                                            {{ $t('apps.categories.visual') }}
                                        </span>
                                        <span v-if="state.filter.type === 'other'">
                                            {{ $t('apps.categories.other') }}
                                        </span>
                                    </p>
                                    <h3 class="text-white text-xl font-semibold">
                                        {{ getPopularApp()?.name }}
                                    </h3>
                                    <p class="text-gray-100 text-sm line-clamp-3">
                                        {{ getPopularApp()?.description }}
                                    </p>
                                    <FormButton type="button" buttonStyle="app-white"
                                        @click="readMore(getPopularApp())">
                                        {{ $t('apps.readMore') }}
                                    </FormButton>
                                </div>
                            </div>
                            <div v-if="getRecommendedApp()">
                                <div class="relative min-h-72 space-y-3 bg-gradient-to-r p-7 md:col-span-2 z-10 rounded-xl overflow-hidden"
                                    :style="getRecommendedApp()?.background_image
                                        ? `background: linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${getRecommendedApp().background_image}) no-repeat center center; background-size: cover;`
                                        : `background: linear-gradient(38deg,rgba(92, 148, 139, 1) 0%, rgba(76, 159, 168, 1) 50%, rgba(67, 166, 190, 1) 100%);`">
                                    <div class="w-32 h-32 bg-white/10 absolute -right-6 -top-7 z-20 rounded-full" />
                                    <div
                                        class="flex items-center gap-x-2 bg-white/30 text-white w-fit px-4 py-1 rounded-full">
                                        <Icon name="ic:sharp-trending-up" class="w-5 h-5" />
                                        <span class="text-xs">
                                            {{ $t('apps.recommended') }}
                                        </span>
                                    </div>
                                    <h3 class="text-white text-xl font-semibold">
                                        {{ getRecommendedApp()?.name }}
                                    </h3>
                                    <p class="text-gray-100 text-sm line-clamp-4">
                                        {{ getRecommendedApp()?.description }}
                                    </p>
                                    <FormButton type="button" buttonStyle="app-white"
                                        @click="readMore(getRecommendedApp())">
                                        {{ $t('apps.readMore') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 max-w-3xl">
                        <div class="space-y-3" v-if="state.filter.type === 'citizenone'">
                            <h3 class="text-lg font-semibold">
                                {{ $t('apps.categories.citizenone') }}
                            </h3>
                            <p class="text-gray-600">
                                {{ $t('apps.description.citizenone') }}.
                            </p>
                        </div>
                        <div class="space-y-3" v-if="state.filter.type === 'fst'">
                            <h3 class="text-lg font-semibold">
                                {{ $t('apps.categories.fst') }}
                            </h3>
                            <p class="text-gray-600">
                                {{ $t('apps.description.fst') }}.
                            </p>
                        </div>
                        <div class="space-y-3" v-if="state.filter.type === 'marketing'">
                            <h3 class="text-lg font-semibold">
                                {{ $t('apps.categories.marketing') }}
                            </h3>
                            <p class="text-gray-600">
                                {{ $t('apps.description.marketing') }}.
                            </p>
                        </div>
                        <div class="space-y-3" v-if="state.filter.type === 'visual'">
                            <h3 class="text-lg font-semibold">
                                {{ $t('apps.categories.visual') }}
                            </h3>
                            <p class="text-gray-600">
                                {{ $t('apps.description.visual') }}.
                            </p>
                        </div>
                        <div class="space-y-3" v-if="state.filter.type === 'other'">
                            <h3 class="text-lg font-semibold">
                                {{ $t('apps.categories.other') }}
                            </h3>
                            <p class="text-gray-600">
                                {{ $t('apps.description.other') }}.
                            </p>
                        </div>
                    </div>

                    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div v-for="(app, index) in state.apps?.data" :key="index"
                            class="relative bg-white px-7 py-6 border rounded-xl">
                            <div v-if="app?.is_news">
                                <img src="/img/icons/ribbon.svg" class="absolute -right-1.5 -top-0" />
                                <p :class="[
                                    language.locale.value === 'en' ? 'right-1.5 top-5' : 'right-1 top-5',
                                    'text-white font-semibold text-xs absolute'
                                ]">
                                    {{ $t('apps.news') }}
                                </p>
                            </div>
                            <div class="mb-3 flex justify-between">
                                <div class="flex items-center gap-3">
                                    <img :src="app.logo" alt="App logo" class="w-14" />
                                    <div class="leading-none">
                                        <div class="flex flex-wrap items-center gap-x-1">
                                            <h4 class="text-muted-800 text-lg font-semibold pr-10">
                                                {{ app.name }}
                                            </h4>
                                            <Badge type="primary" class="text-xxs truncate w-fit h-fit"
                                                v-if="app?.is_thirdparty">
                                                {{ $t('apps.thirdPartyApp') }}
                                            </Badge>
                                        </div>
                                        <p class="mt-1 text-muted-800 text-sm">
                                            <span v-if="app?.is_one_time_fee">
                                                {{ formatAmount(app?.price) }}
                                            </span>
                                            <span v-else>
                                                {{ formatAmount(app?.monthly_price) }}
                                                <span class="lowercase">/{{ $t('apps.month') }}</span>
                                            </span>
                                            {{ $t('excludeVat') }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="my-6 space-y-3">
                                <p class="text-gray-600 font-sans text-base line-clamp-2">
                                    {{ app?.description }}
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <FormButton type="button" buttonStyle="action" class="w-full" @click="readMore(app)">
                                    {{ $t('apps.readMore') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="action" class="w-full"
                                    @click="navigateToExternalLink(app?.url_field)" v-if="app?.url_field">
                                    {{ $t('apps.goToPartner') }}
                                </FormButton>
                                <FormButton type="button"
                                    :buttonStyle="app?.user_activated ? 'app-activated' : 'app-order-now'" :class="[
                                        app?.user_activated && 'cursor-not-allowed',
                                        'w-full'
                                    ]" color="primary" @click="!app?.user_activated && confirmTACAcceptance(app)"
                                    v-else>
                                    <span v-if="app?.user_activated">
                                        {{ $t('apps.activated') }}
                                    </span>
                                    <span v-if="!app?.user_activated && app?.is_one_time_fee">
                                        {{ $t('apps.orderNow') }}
                                    </span>
                                    <span v-if="!app?.user_activated && !app?.is_one_time_fee">
                                        {{ $t('apps.activate') }}
                                    </span>
                                </FormButton>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6">
                        <Pagination :data="state.apps" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesUserAppModalAppDetails :isModalOpen="state.modal.showAppDetails"
                    :selectedApp="state.selectedApp" @close="state.modal.showAppDetails = false"
                    @confirmAppActivation="activateApp" />
                <ModulesUserAppModalTACConfirmation :isModalOpen="state.modal.isAcceptTACOpen"
                    :selectedApp="state.selectedApp" @close="state.modal.isAcceptTACOpen = false"
                    @confirmAppActivation="activateApp" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/user/AppService'
import { googledriveService } from '@/components/api/user/GoogleDriveService'
import OneDriveService from '@/components/api/oneDrive/OneDriveService'
const onedriveService = new OneDriveService()
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const userStore = useUserStore() as any
let currentTablePage = 1
let checkout = null as any
const router = useRouter()
let error: string | undefined = router?.currentRoute?.value?.query?.error as string | undefined

const breadcrumbLinks = [
    {
        name: 'apps.apps',
        translate: true,
        href: '/apps',
    },
]


const state = reactive({
    apps: [] as any,
    error: {} as Error,
    filter: {
        type: 'citizenone',
    },
    isAppsHidden: false,
    isPageLoading: false,
    modal: {
        isAcceptTACOpen: false,
        showAppDetails: false,
    },
    selectedApp: [] as any,
})

onMounted(async () => {
    // Set up message listener for Google Drive popup callback
    const handlePopupMessage = (event: MessageEvent) => {
        if (event.data?.type === 'google-drive-auth-complete') {
            fetchApps()
            successAlert(`${t('alert.success')}!`, 'Google Drive connection updated.')
        }
    }

    window.addEventListener('message', handlePopupMessage)

    // Vis success besked og aktiver app hvis bruger kommer tilbage fra OneDrive OAuth
    if (router.currentRoute.value.query.onedrive_connected === '1') {
        router.replace({ query: { ...router.currentRoute.value.query, onedrive_connected: undefined } })
        const savedUuid = localStorage.getItem('onedrive_app_uuid')
        localStorage.removeItem('onedrive_app_uuid')
        if (savedUuid) {
            try {
                await appService.activateFreeApp({ app_uuid: savedUuid })
            } catch (e1: any) {
                try {
                    await appService.activateApp(savedUuid as any, {})
                } catch (e2) { }
            }
        }
        successAlert(`${t('alert.success')}!`, 'OneDrive forbindelse opdateret.')
    }

    fetchApps()
})

async function fetchApps() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            type: state.filter.type,
            page: currentTablePage,
        }
        const response = await appService.getApps(params)
        if (response) {
            state.apps = response

            // Check real Google Drive connection status
            await updateGoogleDriveStatus()
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

function changeCategory(category: any) {
    state.filter.type = category
    fetchApps()
}

function getPopularApp() {
    return state.apps?.data?.find((app: any) => app.is_popular === true)
}

function getRecommendedApp() {
    return state.apps?.data?.find((app: any) => app.is_recommended === true)
}

function readMore(app: any) {
    state.selectedApp = app
    state.modal.showAppDetails = true
}

function confirmTACAcceptance(app: any) {
    if (
        app?.generic_name !== 'onedrive' &&
        !userStore.getUser?.user_subscription
    ) {
        navigateTo(`/subscription/subscribe?error=${t('apps.subscriptionRequired')}.`)
    } else {
        state.selectedApp = app
        state.modal.isAcceptTACOpen = true
    }
}

async function activateApp(formApp: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        if (state.selectedApp?.generic_name === 'google-drive') {
            const response = await googledriveService.getGoogleDriveAuthUrl()
            console.log('Google Drive response:', response)
            if (response?.authUrl || response?.auth_url) {
                const authUrl = response?.authUrl || response?.auth_url

                // Open Google OAuth in a popup
                const popup = window.open(
                    authUrl,
                    'GoogleDriveAuth',
                    'width=600,height=700,left=200,top=100'
                )

                console.log('Google Drive popup opened')
            } else {
                console.error('No authUrl in response:', response)
            }
        } else if (state.selectedApp?.generic_name === 'onedrive') {
            const response = await onedriveService.getOneDriveAuthUrl()
            if (response?.authUrl || response?.auth_url) {
                const authUrl = response?.authUrl || response?.auth_url
                // Gem user_id og app UUID inden redirect
                if (userStore.getUser?.id) {
                    localStorage.setItem('user_id', userStore.getUser.id)
                }
                if (state.selectedApp?.uuid) {
                    localStorage.setItem('onedrive_app_uuid', state.selectedApp.uuid)
                }
                // Full-page redirect i stedet for popup - Microsoft COOP headers blokerer window.close() i popup
                window.location.href = authUrl
            } else {
                state.error = { message: 'Kunne ikke hente OneDrive login URL' } as Error
            }
        } else if (state.selectedApp?.is_free) {
            const params = {
                app_uuid: state.selectedApp?.uuid,
            }
            const response = await appService.activateFreeApp(params)
            if (response) {
                navigateTo(`/apps/activated-successfully`)
            }
        } else {
            const params = {} as any
            if (!state.selectedApp?.is_one_time_fee) {
                params.terms = formApp?.frequency.value === 'monthly' ? 'monthly' : 'yearly'
            }
            params.quantity = formApp?.quantity
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
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function navigateToExternalLink(link: any) {
    if (link) {
        await navigateTo(link, {
            external: true,
            open: {
                target: '_blank',
            }
        })
    }
}

async function updateGoogleDriveStatus() {
    try {
        const status = await googledriveService.getGoogleDriveStatus()
        const isConnected = status?.connected || false

        const googleDriveApp = state.apps?.data?.find(
            (app: any) => app.generic_name === 'google-drive'
        )
        if (googleDriveApp) {
            googleDriveApp.user_activated = isConnected
        }
    } catch (error) {
        // Silently fail - if status check fails, rely on database value
        console.error('Failed to check Google Drive status:', error)
    }
}
</script>