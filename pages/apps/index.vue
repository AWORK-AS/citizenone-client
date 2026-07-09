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
                                state.filter.type === '' && 'text-secondary border-b-2 border-secondary',
                                'flex items-center gap-1.5 text-gray-700 text-base cursor-pointer px-2 pb-3 hover:text-primary whitespace-nowrap'
                            ]" @click="changeCategory('')">
                                <Icon name="ic:baseline-grid-view" class="w-4 h-4" />
                                {{ $t('apps.categories.all') }}
                            </li>
                            <li v-for="category in state.categories" :key="category.id" :class="[
                                state.filter.type === category.slug && 'text-secondary border-b-2 border-secondary',
                                'flex items-center gap-1.5 text-gray-700 text-base cursor-pointer px-2 pb-3 hover:text-primary whitespace-nowrap'
                            ]" @click="changeCategory(category.slug)">
                                <Icon v-if="category?.icon" :name="category.icon" class="w-4 h-4" />
                                {{ category.name }}
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
                                        {{ activeCategoryName }}
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

                    <!-- Recommended for you (only on the "All apps" view) -->
                    <div class="mt-8 rounded-xl bg-secondary/5 border border-secondary/20 p-6"
                        v-if="state.filter.type === '' && recommendedApps.length">
                        <div class="flex items-center gap-x-2 mb-5">
                            <Icon name="ic:round-star" class="w-5 h-5 text-secondary" />
                            <h3 class="text-lg font-semibold">
                                {{ $t('apps.recommendedForYou') }}
                            </h3>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ModulesUserAppCard v-for="(app, index) in recommendedApps" :key="`rec-${index}`"
                                :app="app" @readMore="readMore" @goToPartner="navigateToExternalLink"
                                @activate="confirmTACAcceptance" />
                        </div>
                    </div>

                    <div class="mt-8 max-w-3xl">
                        <div class="space-y-3" v-if="activeCategoryName">
                            <h3 class="text-lg font-semibold">
                                {{ activeCategoryName }}
                            </h3>
                        </div>
                    </div>

                    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ModulesUserAppCard v-for="(app, index) in state.apps?.data" :key="index" :app="app"
                            @readMore="readMore" @goToPartner="navigateToExternalLink"
                            @activate="confirmTACAcceptance" />
                    </div>
                    <div class="mt-6">
                        <Pagination :data="state.apps" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesUserAppModalAppDetails :isModalOpen="state.modal.showAppDetails"
                    :selectedApp="state.selectedApp" :apps="state.apps?.data" @close="state.modal.showAppDetails = false"
                    @confirmAppActivation="activateApp" @selectApp="readMore" />
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
    categories: [] as any[],
    error: {} as Error,
    filter: {
        type: '',
    },
    isAppsHidden: false,
    isPageLoading: false,
    modal: {
        isAcceptTACOpen: false,
        showAppDetails: false,
    },
    selectedApp: [] as any,
})

const activeCategoryName = computed(() =>
    state.categories.find((category: any) => category.slug === state.filter.type)?.name ?? ''
)

const recommendedApps = computed(() =>
    (state.apps?.data ?? []).filter((app: any) => app?.is_recommended === true)
)

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

    await fetchCategories()
    fetchApps()
})

async function fetchCategories() {
    try {
        const response = await appService.getCategories()
        state.categories = response?.data ?? []
        // Keep the "All apps" default ('' ) valid; only reset a stale category slug.
        if (state.filter.type && !state.categories.some((category: any) => category.slug === state.filter.type)) {
            state.filter.type = ''
        }
    } catch (error: any) {
        state.categories = []
    }
}

async function fetchApps() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            page: currentTablePage,
        }
        // Empty type = the "All apps" tab: send no filter so the whole catalog shows.
        if (state.filter.type) {
            params.type = state.filter.type
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
            if (response?.authUrl || response?.auth_url) {
                const authUrl = response?.authUrl || response?.auth_url
                window.open(authUrl, 'Google Drive Authentication', 'width=500,height=600')
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
                const cat = state.selectedApp?.category?.slug ?? ''
                navigateTo(`/apps/activated-successfully?category=${cat}&exclude=${state.selectedApp?.uuid ?? ''}`)
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
                    const cat = state.selectedApp?.category?.slug ?? ''
                    navigateTo(`/apps/purchased-successfully?paymentId=${paymentId}&category=${cat}&exclude=${state.selectedApp?.uuid ?? ''}`)
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

</script>