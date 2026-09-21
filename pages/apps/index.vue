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

            <LoadingSpinner :isActive="state.isPageLoading || activation.isBusy">
                <div class="space-y-2">
                    <Alert type="danger" :text="error" v-if="error && error.length > 0" />
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <Alert type="danger" :text="activation.error?.message"
                        v-if="activation.error?.message && activation.error.message.length > 0" />
                </div>

                <div id="apps-checkout" class="mx-auto max-w-sm md:max-w-md"></div>

                <div v-if="!activation.isCheckoutOpen" class="space-y-10">
                    <!-- Search and category filter. Searching drops the shelves and
                         shows one list, because a shelf of one is not a shelf. -->
                    <div class="space-y-4">
                        <div class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
                            <Icon name="ph:magnifying-glass" class="h-4 w-4 text-gray-400" />
                            <input v-model="state.search" type="search" id="app-store-search"
                                :placeholder="$t('apps.searchPlaceholder')"
                                class="w-full border-0 bg-transparent p-0 text-sm text-muted-800 placeholder:text-gray-400 focus:outline-none focus:ring-0" />
                            <button type="button" v-if="state.search" @click="state.search = ''"
                                class="text-gray-400 hover:text-gray-600" :aria-label="$t('clear')">
                                <Icon name="ph:x" class="h-4 w-4" />
                            </button>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            <button type="button" @click="selectCategory('')" :class="chipClass(state.category === '')">
                                {{ $t('apps.categories.all') }}
                            </button>
                            <button type="button" v-if="activatedApps.length" @click="selectCategory('mine')"
                                :class="chipClass(state.category === 'mine')">
                                {{ $t('apps.myApps') }} · {{ activatedApps.length }}
                            </button>
                            <button type="button" v-for="category in categoriesWithApps" :key="category.id"
                                @click="selectCategory(category.slug)" :class="chipClass(state.category === category.slug)">
                                {{ category.name }} · {{ appsByCategory(category.slug).length }}
                            </button>
                        </div>
                    </div>

                    <!-- The store front: one editorial card and what arrived lately. -->
                    <div class="grid grid-cols-1 gap-5 lg:grid-cols-3" v-if="showFront">
                        <div class="lg:col-span-2" v-if="featuredApp">
                            <NuxtLink :to="`/apps/${featuredApp.slug || featuredApp.uuid}`"
                                class="relative flex min-h-[17rem] flex-col justify-end gap-3 overflow-hidden rounded-2xl p-7 text-white"
                                :style="featuredBackground">
                                <span class="absolute -right-6 -top-10 z-0 h-40 w-40 rounded-full bg-white/10" />
                                <span
                                    class="relative w-fit rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
                                    {{ featuredApp.is_popular ? $t('apps.mostPopular') : $t('apps.editorsPick') }}
                                </span>
                                <h2 class="relative text-2xl font-semibold leading-tight">{{ featuredApp.name }}</h2>
                                <p class="relative line-clamp-3 max-w-xl text-sm text-white/80">
                                    {{ featuredApp.tagline || featuredApp.description }}
                                </p>
                                <span class="relative flex flex-wrap items-center gap-3 pt-1">
                                    <span class="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary">
                                        {{ $t('apps.readMore') }}
                                    </span>
                                    <span class="text-sm text-white/80">{{ headlinePriceOf(featuredApp) }}</span>
                                </span>
                            </NuxtLink>
                        </div>

                        <div class="rounded-2xl border border-gray-200 bg-white p-5" v-if="newApps.length">
                            <h2 class="mb-3 text-base font-semibold text-muted-800">{{ $t('apps.newInStore') }}</h2>
                            <NuxtLink v-for="app in newApps" :key="app.uuid" :to="`/apps/${app.slug || app.uuid}`"
                                class="flex items-center gap-3 border-t border-gray-100 py-3 first:border-t-0 hover:opacity-80">
                                <span v-if="appIconFor(app).useTile"
                                    class="brand-tile flex h-9 w-9 flex-none items-center justify-center rounded-lg text-white">
                                    <Icon :name="appIconFor(app).icon" class="h-4 w-4" />
                                </span>
                                <img v-else-if="app.logo" :src="app.logo" :alt="app.name"
                                    class="h-9 w-9 flex-none rounded-lg border border-gray-100 object-contain p-1" />
                                <span class="min-w-0">
                                    <span class="block truncate text-sm font-semibold text-muted-800">{{ app.name }}</span>
                                    <span class="block truncate text-xs text-gray-500">{{ app.tagline || app.category?.name }}</span>
                                </span>
                            </NuxtLink>
                        </div>
                    </div>

                    <!-- Searching, or one category picked: a single list. -->
                    <section v-if="!showShelves">
                        <h2 class="mb-4 text-lg font-semibold text-muted-800">{{ listHeading }}</h2>
                        <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            <ModulesUserAppCard v-for="app in listedApps" :key="app.uuid" :app="app"
                                @goToPartner="navigateToExternalLink" @activate="requestActivation" />
                        </div>
                        <div v-if="!listedApps.length"
                            class="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                            <p class="text-sm text-gray-600">
                                {{ state.search ? $t('apps.noSearchResults', { query: state.search }) : $t('apps.myAppsEmpty') }}
                            </p>
                            <FormButton type="button" buttonStyle="primary" class="mt-4" @click="resetFilters">
                                {{ $t('apps.myAppsBrowse') }}
                            </FormButton>
                        </div>
                    </section>

                    <!-- The shelves: one per category, in the order superadmin set. -->
                    <template v-else>
                        <section v-if="activatedApps.length">
                            <div class="mb-4 flex items-baseline justify-between gap-3">
                                <h2 class="text-lg font-semibold text-muted-800">{{ $t('apps.myApps') }}</h2>
                                <p class="text-xs text-gray-500">{{ $t('apps.myAppsHint') }}</p>
                            </div>
                            <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                <ModulesUserAppCard v-for="app in activatedApps" :key="`mine-${app.uuid}`" :app="app"
                                    @goToPartner="navigateToExternalLink" @activate="requestActivation" />
                            </div>
                        </section>

                        <section v-for="category in categoriesWithApps" :key="`shelf-${category.id}`">
                            <div class="mb-4 flex items-baseline justify-between gap-3">
                                <h2 class="flex items-center gap-2 text-lg font-semibold text-muted-800">
                                    <Icon v-if="category.icon" :name="category.icon" class="h-4 w-4 text-primary" />
                                    {{ category.name }}
                                </h2>
                                <button type="button" class="text-xs font-medium text-primary"
                                    @click="selectCategory(category.slug)">
                                    {{ $t('apps.seeAll') }}
                                </button>
                            </div>
                            <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                                <ModulesUserAppCard v-for="app in appsByCategory(category.slug).slice(0, 3)"
                                    :key="app.uuid" :app="app" @goToPartner="navigateToExternalLink"
                                    @activate="requestActivation" />
                            </div>
                        </section>
                    </template>
                </div>

                <ModulesUserAppModalTACConfirmation :isModalOpen="activation.isTermsOpen"
                    :selectedApp="activation.selectedApp" @close="activation.isTermsOpen = false"
                    @confirmAppActivation="activate" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/user/AppService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useAppActivation } from '@/composables/appActivation'
import { useAppPrice } from '@/composables/appPrice'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const { appPrice, formatAmount } = useAppPrice()
const { activation, requestActivation, activate } = useAppActivation({ checkoutContainerId: 'apps-checkout' })
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
    apps: [] as any[],
    categories: [] as any[],
    error: {} as Error,
    category: '',
    search: '',
    isPageLoading: false,
})

const activatedApps = computed(() => state.apps.filter((app: any) => app?.user_activated))

const categoriesWithApps = computed(() =>
    state.categories.filter((category: any) => appsByCategory(category.slug).length > 0)
)

const searchTerm = computed(() => state.search.trim().toLowerCase())

const showShelves = computed(() => !searchTerm.value && state.category === '')

const showFront = computed(() => showShelves.value && !!(featuredApp.value || newApps.value.length))

const searchResults = computed(() => {
    if (!searchTerm.value) return []
    return state.apps.filter((app: any) =>
        [app?.name, app?.tagline, app?.description, app?.publisher, app?.category?.name]
            .filter(Boolean)
            .some((field: string) => String(field).toLowerCase().includes(searchTerm.value))
    )
})

const listedApps = computed(() => {
    if (searchTerm.value) return searchResults.value
    if (state.category === 'mine') return activatedApps.value
    return appsByCategory(state.category)
})

const listHeading = computed(() => {
    if (searchTerm.value) return t('apps.searchResults', { count: searchResults.value.length })
    if (state.category === 'mine') return t('apps.myApps')
    return state.categories.find((category: any) => category.slug === state.category)?.name ?? t('apps.categories.all')
})

/**
 * The card the store leads with. It is whatever the editor marked, not a guess:
 * most popular first, then recommended, and nothing at all if neither is set.
 */
const featuredApp = computed(() =>
    state.apps.find((app: any) => app?.is_popular) ?? state.apps.find((app: any) => app?.is_recommended) ?? null
)

const newApps = computed(() =>
    state.apps.filter((app: any) => app?.is_news && app?.uuid !== featuredApp.value?.uuid).slice(0, 4)
)

const featuredBackground = computed(() =>
    featuredApp.value?.background_image
        ? `background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${featuredApp.value.background_image}) no-repeat center center; background-size: cover;`
        : 'background: linear-gradient(145deg, #0A1F33 0%, #205E77 58%, #1B6D8A 100%);'
)

function appsByCategory(slug: string) {
    if (!slug) return state.apps
    return state.apps.filter((app: any) => app?.category?.slug === slug)
}

function headlinePriceOf(app: any) {
    const price = appPrice(app)
    if (price.isFree) return t('apps.free')
    return `${formatAmount(price.discountedAmount)}${price.unit ? '/' + price.unit.toLowerCase() : ''}`
}

function chipClass(isActive: boolean) {
    return [
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        isActive
            ? 'border-primary bg-primary text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary',
    ]
}

function selectCategory(slug: string) {
    state.category = slug
    state.search = ''
}

function resetFilters() {
    state.category = ''
    state.search = ''
}

onMounted(async () => {
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

    // Lets another page link straight into a category (e.g. /apps?category=integrations)
    // instead of landing on "All apps" and making the admin find it themselves.
    const categoryQuery = router.currentRoute.value.query.category
    if (typeof categoryQuery === 'string' && categoryQuery) {
        state.category = categoryQuery
    }

    await fetchCategories()
    fetchApps()
})

async function fetchCategories() {
    try {
        const response = await appService.getCategories()
        state.categories = response?.data ?? []
        if (state.category && state.category !== 'mine'
            && !state.categories.some((category: any) => category.slug === state.category)) {
            state.category = ''
        }
    } catch (error: any) {
        state.categories = []
    }
}

async function fetchApps() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await appService.getApps({})
        state.apps = response?.data ?? []
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
