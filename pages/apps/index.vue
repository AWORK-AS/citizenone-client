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
                <div id="apps-checkout" class="mx-auto max-w-sm md:max-w-md"></div>
                <div v-if="!state.isAppsHidden">
                    <div class="border-b-1.5 border-gray-200">
                        <ul class="flex item-center gap-x-5 overflow-x-auto touch-auto">
                            <li :class="[
                                !state.filter.onlyActivated && state.filter.type === '' && 'text-secondary border-b-2 border-secondary',
                                'flex items-center gap-1.5 text-gray-700 text-base cursor-pointer px-2 pb-3 hover:text-primary whitespace-nowrap'
                            ]" @click="changeCategory('')">
                                <Icon name="ic:baseline-grid-view" class="w-4 h-4" />
                                {{ $t('apps.categories.all') }}
                            </li>
                            <li :class="[
                                state.filter.onlyActivated && 'text-secondary border-b-2 border-secondary',
                                'flex items-center gap-1.5 text-gray-700 text-base cursor-pointer px-2 pb-3 hover:text-primary whitespace-nowrap'
                            ]" @click="showMyApps()">
                                <Icon name="ph:squares-four" class="w-4 h-4" />
                                {{ $t('apps.myApps') }}
                                <span v-if="activatedApps.length"
                                    class="text-xxs font-medium rounded-full bg-primary/10 text-primary px-1.5">
                                    {{ activatedApps.length }}
                                </span>
                            </li>
                            <li v-for="category in state.categories" :key="category.id" :class="[
                                !state.filter.onlyActivated && state.filter.type === category.slug && 'text-secondary border-b-2 border-secondary',
                                'flex items-center gap-1.5 text-gray-700 text-base cursor-pointer px-2 pb-3 hover:text-primary whitespace-nowrap'
                            ]" @click="changeCategory(category.slug)">
                                <Icon v-if="category?.icon" :name="category.icon" class="w-4 h-4" />
                                {{ category.name }}
                            </li>
                        </ul>
                    </div>

                    <div class="mt-8 space-y-5" v-if="!state.filter.onlyActivated">
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
                        v-if="!state.filter.onlyActivated && state.filter.type === '' && recommendedApps.length">
                        <div class="flex items-center gap-x-2 mb-5">
                            <Icon name="ic:round-star" class="w-5 h-5 text-secondary" />
                            <h3 class="text-lg font-semibold">
                                {{ $t('apps.recommendedForYou') }}
                            </h3>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div v-for="(app, index) in recommendedApps" :key="`rec-${index}`" class="relative">
                                <ModulesUserAppSettingsMenu v-if="app.generic_name === 'salary.dk' && app.user_activated"
                                    app-generic-name="salary.dk" disconnect-label-key="apps.salaryDk.disconnect"
                                    @disconnect="openSalaryDkDisconnectModal(app)" />
                                <ModulesUserAppSettingsMenu v-if="app.generic_name === 'danlon' && app.user_activated"
                                    app-generic-name="danlon"
                                    @disconnect="openDanlonDisconnectModal(app)" />
                                <ModulesUserAppCard :app="app" @readMore="readMore"
                                    @goToPartner="navigateToExternalLink" @activate="confirmTACAcceptance" />
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 max-w-3xl">
                        <div class="space-y-3" v-if="activeCategoryName">
                            <h3 class="text-lg font-semibold">
                                {{ activeCategoryName }}
                            </h3>
                        </div>
                    </div>

                    <div class="mt-8 space-y-3" v-if="state.filter.onlyActivated">
                        <h3 class="text-lg font-semibold">{{ $t('apps.myApps') }}</h3>
                        <p class="text-sm text-gray-500">{{ $t('apps.myAppsHint') }}.</p>
                    </div>

                    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div v-for="(app, index) in visibleApps" :key="index" class="relative">
                            <ModulesUserAppSettingsMenu v-if="app.generic_name === 'salary.dk' && app.user_activated"
                                app-generic-name="salary.dk" disconnect-label-key="apps.salaryDk.disconnect"
                                @disconnect="openSalaryDkDisconnectModal(app)" />
                            <ModulesUserAppSettingsMenu v-if="app.generic_name === 'danlon' && app.user_activated"
                                app-generic-name="danlon"
                                @disconnect="openDanlonDisconnectModal(app)" />
                            <ModulesUserAppCard :app="app" @readMore="readMore"
                                @goToPartner="navigateToExternalLink" @activate="confirmTACAcceptance" />
                        </div>
                    </div>
                    <div class="mt-8 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center"
                        v-if="state.filter.onlyActivated && visibleApps.length === 0">
                        <p class="text-sm text-gray-600">{{ $t('apps.myAppsEmpty') }}.</p>
                        <FormButton type="button" buttonStyle="primary" class="mt-4"
                            @click="changeCategory('')">
                            {{ $t('apps.myAppsBrowse') }}
                        </FormButton>
                    </div>
                    <div class="mt-6" v-if="!state.filter.onlyActivated">
                        <Pagination :data="state.apps" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesUserAppModalAppDetails :isModalOpen="state.modal.showAppDetails"
                    :selectedApp="state.selectedApp" :apps="state.apps?.data" @close="state.modal.showAppDetails = false"
                    @confirmAppActivation="activateApp" @selectApp="readMore" />
                <ModulesUserAppModalTACConfirmation :isModalOpen="state.modal.isAcceptTACOpen"
                    :selectedApp="state.selectedApp" @close="state.modal.isAcceptTACOpen = false"
                    @confirmAppActivation="activateApp" />

                <!-- Salary.dk Connect Modal (API key input) -->
                <Modal size="sm" :title="$t('apps.salaryDk.connectTitle')" :show="state.modal.isSalaryDkConnectOpen"
                    @close="state.modal.isSalaryDkConnectOpen = false">
                    <template #modal-body>
                        <div class="space-y-4">
                            <p class="text-sm text-gray-500">{{ $t('apps.salaryDk.connectDescription') }}</p>
                            <div class="space-y-1">
                                <FormLabel :label="$t('apps.salaryDk.apiKey')" />
                                <FormTextField name="salary_dk_api_key" :placeholder="$t('apps.salaryDk.apiKeyPlaceholder')"
                                    v-model="state.salaryDkApiKey" />
                            </div>
                            <Alert type="danger" :text="state.salaryDkConnectError"
                                v-if="state.salaryDkConnectError" />
                            <div class="grid grid-cols-2 gap-3">
                                <FormButton buttonStyle="cancel"
                                    @click="state.modal.isSalaryDkConnectOpen = false">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton buttonStyle="primary" :disabled="!state.salaryDkApiKey.trim()"
                                    @click="connectSalaryDk">
                                    {{ $t('apps.salaryDk.connect') }}
                                </FormButton>
                            </div>
                        </div>
                    </template>
                </Modal>

                <!-- Salary.dk Disconnect Dialog -->
                <DialogConfirmation :isModalOpen="state.modal.isSalaryDkDisconnectOpen"
                    :message="$t('apps.salaryDk.disconnectConfirmation')"
                    :title="$t('apps.salaryDk.disconnectTitle')"
                    @close="state.modal.isSalaryDkDisconnectOpen = false" @confirm="disconnectSalaryDk" />

                <!-- Danløn Disconnect Dialog -->
                <DialogConfirmation
                    :isModalOpen="state.modal.isDanlonDisconnectOpen"
                    :message="$t('apps.danlon.disconnectConfirmation')"
                    :title="$t('apps.danlon.disconnectTitle')"
                    @close="state.modal.isDanlonDisconnectOpen = false"
                    @confirm="disconnectDanlon"
                />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/user/AppService'
import { googledriveService } from '@/components/api/user/GoogleDriveService'
import OneDriveService from '@/components/api/oneDrive/OneDriveService'
const onedriveService = new OneDriveService()
import { salaryDkService } from '@/components/api/user/SalaryDkService'
import { danlonService } from '@/components/api/user/DanlonService'
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
        onlyActivated: false,
        type: '',
    },
    isAppsHidden: false,
    isPageLoading: false,
    modal: {
        isAcceptTACOpen: false,
        showAppDetails: false,
        isSalaryDkConnectOpen: false,
        isSalaryDkDisconnectOpen: false,
        isDanlonDisconnectOpen: false,
    },
    selectedApp: [] as any,
    salaryDkApiKey: '' as string,
    salaryDkConnectError: '' as string,
})

const activeCategoryName = computed(() =>
    state.categories.find((category: any) => category.slug === state.filter.type)?.name ?? ''
)

const recommendedApps = computed(() =>
    (state.apps?.data ?? []).filter((app: any) => app?.is_recommended === true)
)

onMounted(async () => {
    // Set up message listener for Google Drive and Danløn popup callbacks
    const handlePopupMessage = (event: MessageEvent) => {
        if (event.data?.type === 'google-drive-auth-complete') {
            fetchApps()
            successAlert(`${t('alert.success')}!`, 'Google Drive connection updated.')
        }
        if (event.data?.type === 'danlon-auth-complete') {
            fetchApps()
            successAlert(`${t('alert.success')}!`, t('apps.danlon.connected'))
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

    // Lets another page link straight into a category (e.g. /apps?category=integrations)
    // instead of landing on "All apps" and making the admin find it themselves.
    const categoryQuery = router.currentRoute.value.query.category
    if (typeof categoryQuery === 'string' && categoryQuery) {
        state.filter.type = categoryQuery
    }

    await fetchCategories()
    await fetchApps()

    // Lets another page link straight into one app's purchase (e.g. the AI usage
    // screen's "Buy more"), instead of landing on the catalogue and making the
    // admin find the tile. Fetched by uuid rather than looked up in the loaded
    // page, because the catalogue is paginated and the app linked to may not be
    // on the page that happens to be showing.
    const appQuery = router.currentRoute.value.query.app
    if (typeof appQuery === 'string' && appQuery) {
        router.replace({ query: { ...router.currentRoute.value.query, app: undefined } })
        try {
            const response = await appService.getApp(appQuery)
            const app = response?.data ?? response
            // A one-time fee is bought again and again - prepaid capacity is the
            // whole point - so owning it already is not a reason to refuse. Only
            // a subscription the company is already on gets skipped.
            if (app?.uuid && (app?.is_one_time_fee || !app?.user_activated)) {
                confirmTACAcceptance(app)
            }
        } catch (error) {
            // A stale or wrong uuid leaves the admin on the catalogue, which is
            // where they were going anyway.
        }
    }
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

    // Check connection statuses after loading indicator is cleared
    updateGoogleDriveStatus()
    updateDanlonStatus()
    updateSalaryDkStatus()
}

function previous() {
    currentTablePage--
    fetchApps()
}

function next() {
    currentTablePage++
    fetchApps()
}

// Apps the company has bought. The store list already carries user_activated,
// so this needs no extra request.
const activatedApps = computed(() =>
    (state.apps?.data ?? []).filter((app: any) => app?.user_activated))

const visibleApps = computed(() =>
    state.filter.onlyActivated ? activatedApps.value : (state.apps?.data ?? []))

function showMyApps() {
    state.filter.onlyActivated = true
    state.filter.type = ''
    fetchApps()
}

function changeCategory(category: any) {
    state.filter.onlyActivated = false
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
        if (state.selectedApp?.generic_name === 'salary.dk') {
            state.modal.isAcceptTACOpen = false
            state.salaryDkApiKey = ''
            state.salaryDkConnectError = ''
            state.modal.isSalaryDkConnectOpen = true
            state.isPageLoading = false
            return
        } else if (state.selectedApp?.generic_name === 'danlon') {
            state.modal.isAcceptTACOpen = false

            const response = await danlonService.authorize()
            if (response?.url) {
                const popup = window.open(
                    response.url,
                    'DanlonAuth',
                    'width=600,height=700,left=200,top=100'
                )
            }
            state.isPageLoading = false
            return
        } else if (state.selectedApp?.generic_name === 'google-drive') {
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
                // FST is installed via the same generic free-app flow as any other
                // integration (plan §9/§14) — installing it only makes the manage/
                // configure screen reachable, it does not activate anything by
                // itself, so send the admin straight there instead of the generic
                // "activated successfully" page.
                if (state.selectedApp?.generic_name === 'fst') {
                    navigateTo('/settings/fst')
                    state.isPageLoading = false
                    return
                }
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

async function updateSalaryDkStatus() {
    try {
        const status = await salaryDkService.getSalaryDkStatus()
        const isConnected = status?.connected || false
        const app = state.apps?.data?.find(
            (a: any) => a.generic_name === 'salary.dk'
        )
        if (app) app.user_activated = isConnected
    } catch {
        // Silently fail
    }
}

function openSalaryDkDisconnectModal(app: any) {
    state.selectedApp = app
    state.modal.isSalaryDkDisconnectOpen = true
}

async function disconnectSalaryDk() {
    state.error = {}
    state.isPageLoading = true
    try {
        await salaryDkService.disconnectSalaryDk()
        successAlert(`${t('alert.success')}!`, t('apps.salaryDk.disconnected'))
        state.modal.isSalaryDkDisconnectOpen = false
        fetchApps()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function connectSalaryDk() {
    state.salaryDkConnectError = ''
    state.isPageLoading = true
    try {
        await salaryDkService.connect(state.salaryDkApiKey.trim())
        state.modal.isSalaryDkConnectOpen = false
        state.salaryDkApiKey = ''
        successAlert(`${t('alert.success')}!`, t('apps.salaryDk.connected'))
        fetchApps()
    } catch (error: any) {
        state.salaryDkConnectError = error?.data?.message || error?.message || t('apps.salaryDk.connectError')
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

async function updateDanlonStatus() {
    try {
        const status = await danlonService.getStatus()
        const isConnected = status?.connected || false
        const app = state.apps?.data?.find(
            (a: any) => a.generic_name === 'danlon'
        )
        if (app) app.user_activated = isConnected
    } catch {
        // Silently fail
    }
}

function openDanlonDisconnectModal(app: any) {
    state.selectedApp = app
    state.modal.isDanlonDisconnectOpen = true
}

async function disconnectDanlon() {
    state.error = {}
    state.isPageLoading = true
    try {
        await danlonService.disconnect()
        successAlert(`${t('alert.success')}!`, t('apps.danlon.disconnected'))
        state.modal.isDanlonDisconnectOpen = false
        fetchApps()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>