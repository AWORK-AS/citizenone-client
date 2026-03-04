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
                                <div class="min-h-72 space-y-3 bg-gradient-to-r p-7 md:col-span-2 z-10 rounded-xl"
                                    style="background: linear-gradient(48deg,rgba(59, 164, 190, 1) 0%, rgba(41, 130, 155, 1) 50%, rgba(26, 99, 122, 1) 100%);">
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
                                <!-- <img src="/img/icons/asset-01.svg" :alt="$t('imageFailedToLoad')"
                                    class="w-20 absolute right-0 top-5 z-20"> -->
                            </div>
                            <div v-if="getRecommendedApp()">
                                <div class="min-h-72 space-y-3 bg-gradient-to-r p-7 md:col-span-2 z-10 rounded-xl"
                                    style="background: linear-gradient(38deg,rgba(92, 148, 139, 1) 0%, rgba(76, 159, 168, 1) 50%, rgba(67, 166, 190, 1) 100%);">
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

                    <!-- <div id="marketing"
                        class="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-11 border-b border-gray-900/10">
                        <div class="md:col-span-2">
                            <h2 class="text-base font-semibold leading-7 text-gray-900">
                                {{ $t('apps.categories.marketing') }}
                            </h2>
                            <p class="mt-1 text-sm leading-6 text-gray-600" v-if="language.locale.value === 'en'">
                                Tools and solutions designed to enhance brand visibility, optimize campaigns, and drive
                                customer engagement.
                            </p>
                            <p class="mt-1 text-sm leading-6 text-gray-600" v-if="language.locale.value === 'dk'">
                                Værktøjer og løsninger designet til at øge brandets synlighed, optimere kampagner og
                                engagere kunder.
                            </p>
                        </div>
                        <div class="md:col-span-9 space-y-3 px-4 py-6 sm:px-8 sm:py-6">
                            <div class="ltablet:grid-cols-3 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                <div v-for="(app, index) in state.apps?.marketing" :key="index"
                                    class="bg-white p-6 border rounded-md">
                                    <div class="mb-3 flex justify-between">
                                        <div class="flex items-center gap-3">
                                            <img :src="app.logo" alt="App logo" class="w-10" />
                                            <div class="leading-none">
                                                <h4 class="text-muted-800 text-sm font-medium">
                                                    {{ app.name }}
                                                </h4>
                                                <p class="text-muted-800 text-xs">
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
                                        <Badge type="primary" class="text-xxs truncate w-fit h-fit"
                                            v-if="app?.is_thirdparty">
                                            {{ $t('apps.thirdPartyApp') }}
                                        </Badge>
                                    </div>
                                    <div class="my-4 space-y-3">
                                        <p class="text-muted-800 dark:text-muted-100 font-sans text-sm line-clamp-2">
                                            {{ app?.description }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <FormButton type="button" buttonStyle="action" class="w-full"
                                            @click="readMore(app)">
                                            {{ $t('apps.readMore') }}
                                        </FormButton>
                                        <FormButton type="button" buttonStyle="action" class="w-full"
                                            @click="navigateToExternalLink(app?.url_field)" v-if="app?.url_field">
                                            {{ $t('apps.goToPartner') }}
                                        </FormButton>
                                        <FormButton type="button"
                                            :buttonStyle="app?.user_activated ? 'warning' : 'action'" :class="[
                                                app?.user_activated && 'cursor-not-allowed',
                                                'w-full'
                                            ]" color="primary"
                                            @click="!app?.user_activated && confirmTACAcceptance(app)" v-else>
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
                        </div>
                    </div>

                    <div id="visual"
                        class="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-11 border-b border-gray-900/10">
                        <div class="md:col-span-2">
                            <h2 class="text-base font-semibold leading-7 text-gray-900">
                                {{ $t('apps.categories.visual') }}
                            </h2>
                            <p class="mt-1 text-sm leading-6 text-gray-600" v-if="language.locale.value === 'en'">
                                Applications focused on design, creativity, and media, enabling stunning graphics,
                                videos, and interactive experiences.
                            </p>
                            <p class="mt-1 text-sm leading-6 text-gray-600" v-if="language.locale.value === 'dk'">
                                Applikationer med fokus på design, kreativitet og medier, der muliggør imponerende
                                grafik, videoer og interaktive oplevelser.
                            </p>
                        </div>
                        <div class="md:col-span-9 space-y-3 px-4 py-6 sm:px-8 sm:py-6">
                            <div class="ltablet:grid-cols-3 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                <div v-for="(app, index) in state.apps?.visual" :key="index"
                                    class="bg-white p-6 border rounded-md">
                                    <div class="mb-3 flex justify-between">
                                        <div class="flex items-center gap-3">
                                            <img :src="app.logo" alt="App logo" class="w-10" />
                                            <div class="leading-none">
                                                <h4
                                                    class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium">
                                                    {{ app.name }}
                                                </h4>
                                                <p class="text-muted-800 text-xs">
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
                                        <Badge type="primary" class="text-xxs truncate w-fit h-fit"
                                            v-if="app?.is_thirdparty">
                                            {{ $t('apps.thirdPartyApp') }}
                                        </Badge>
                                    </div>
                                    <div class="my-4 space-y-3">
                                        <p class="text-muted-800 dark:text-muted-100 font-sans text-sm line-clamp-2">
                                            {{ app?.description }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <FormButton type="button" buttonStyle="action" class="w-full"
                                            @click="readMore(app)">
                                            {{ $t('apps.readMore') }}
                                        </FormButton>
                                        <FormButton type="button" buttonStyle="action" class="w-full"
                                            @click="navigateToExternalLink(app?.url_field)" v-if="app?.url_field">
                                            {{ $t('apps.goToPartner') }}
                                        </FormButton>
                                        <FormButton type="button"
                                            :buttonStyle="app?.user_activated ? 'warning' : 'action'" :class="[
                                                app?.user_activated && 'cursor-not-allowed',
                                                'w-full'
                                            ]" color="primary"
                                            @click="!app?.user_activated && confirmTACAcceptance(app)" v-else>
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
                        </div>
                    </div>

                    <div id="other"
                        class="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-11 border-b border-gray-900/10">
                        <div class="md:col-span-2">
                            <h2 class="text-base font-semibold leading-7 text-gray-900">
                                {{ $t('apps.categories.other') }}
                            </h2>
                            <p class="mt-1 text-sm leading-6 text-gray-600" v-if="language.locale.value === 'en'">
                                A collection of versatile apps catering to various needs, from productivity and
                                organization to niche solutions.
                            </p>
                            <p class="mt-1 text-sm leading-6 text-gray-600" v-if="language.locale.value === 'dk'">
                                En samling alsidige apps, der dækker forskellige behov, fra produktivitet og
                                organisering til nicheløsninger.
                            </p>
                        </div>
                        <div class="md:col-span-9 space-y-3 px-4 py-6 sm:px-8 sm:py-6">
                            <div class="ltablet:grid-cols-3 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                <div v-for="(app, index) in state.apps?.other" :key="index"
                                    class="bg-white p-6 border rounded-md">
                                    <div class="mb-3 flex justify-between">
                                        <div class="flex items-center gap-3">
                                            <img :src="app.logo" alt="App logo" class="w-10" />
                                            <div class="leading-none">
                                                <h4
                                                    class="text-muted-800 dark:text-muted-100 font-sans text-sm font-medium">
                                                    {{ app.name }}
                                                </h4>
                                                <p class="text-muted-800 text-xs">
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
                                        <Badge type="primary" class="text-xxs truncate w-fit h-fit"
                                            v-if="app?.is_thirdparty">
                                            {{ $t('apps.thirdPartyApp') }}
                                        </Badge>
                                    </div>
                                    <div class="my-4 space-y-3">
                                        <p class="text-muted-800 dark:text-muted-100 font-sans text-sm line-clamp-2">
                                            {{ app?.description }}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <FormButton type="button" buttonStyle="action" class="w-full"
                                            @click="readMore(app)">
                                            {{ $t('apps.readMore') }}
                                        </FormButton>
                                        <FormButton type="button" buttonStyle="action" class="w-full"
                                            @click="navigateToExternalLink(app?.url_field)" v-if="app?.url_field">
                                            {{ $t('apps.goToPartner') }}
                                        </FormButton>
                                        <FormButton type="button"
                                            :buttonStyle="app?.user_activated ? 'warning' : 'action'" :class="[
                                                !(!app?.user_activated || app?.is_quantifiable) && 'cursor-not-allowed',
                                                'w-full'
                                            ]" color="primary"
                                            @click="(!app?.user_activated || app?.is_quantifiable) && confirmTACAcceptance(app)"
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
                        </div>
                    </div> -->

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
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const language = useI18n()
const { formatAmount } = useAmountFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
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
    apps: {
        citizenone: [] as any,
        fst: [] as any,
        marketing: [] as any,
        other: [] as any,
        visual: [] as any,
    },
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
    // const handlePopupMessage = (event: MessageEvent) => {
    //     console.log('Message received from popup:', event.data, 'origin:', event.origin)

    //     if (event.data?.type === 'google-drive-auth-complete') {
    //         console.log('Google Drive auth complete, refreshing apps...')
    //         fetchApps()
    //         successAlert(`${t('alert.success')}!`, 'Google Drive connection updated.')
    //     }
    // }

    // window.addEventListener('message', handlePopupMessage)

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
            // const apps = response?.data
            // state.apps.marketing = filterAppsByType(apps, 'marketing')
            // state.apps.visual = filterAppsByType(apps, 'visual')
            // state.apps.other = filterAppsByType(apps, 'other')
            state.apps = response

            // Check real Google Drive connection status
            // await updateGoogleDriveStatus()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function changeCategory(category: any) {
    state.filter.type = category
    fetchApps()
}

function getPopularApp() {
    return state.apps?.data?.find(app => app.is_popular === true)
}

function getRecommendedApp() {
    return state.apps?.data?.find(app => app.is_recommended === true)
}

// async function updateGoogleDriveStatus() {
//     try {
//         const status = await googledriveService.getGoogleDriveStatus()
//         const isConnected = status?.connected || false


//         const categories = ['marketing', 'visual', 'other']
//         categories.forEach(category => {
//             const googleDriveApp = state.apps[category]?.find(
//                 (app: any) => app.generic_name === 'google-drive'
//             )
//             if (googleDriveApp) {
//                 googleDriveApp.user_activated = isConnected
//             }
//         })
//     } catch (error) {
//         // Silently fail - if status check fails, rely on database value
//         console.error('Failed to check Google Drive status:', error)
//     }
// }

function filterAppsByType(apps: any, type: string) {
    return apps.filter((app: any) => app.type === type)
}

function scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId)
    if (section) {
        if (sectionId === 'marketing') {
            window.scrollTo({
                top: section.offsetTop + 70, // Adjust offset if needed
                behavior: "smooth"
            })

        } else {
            window.scrollTo({
                top: section.offsetTop + 50, // Adjust offset if needed
                behavior: "smooth"
            })
        }
    }
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
    if (!userStore.getUser?.user_subscription) {
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
        } else if (state.selectedApp?.is_free) {
            const params = {
                app_uuid: state.selectedApp?.uuid,
            }
            const response = await appService.activateFreeApp(params)
        } else if (state.selectedApp?.generic_name === 'leads') {
            const response = await appService.activateLeadsApp()
            if (response) {
                successAlert(`${t('alert.success')}!`, `${t('apps.alert.appSuccessfullyActivated')}.`)
                fetchApps()
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
</script>