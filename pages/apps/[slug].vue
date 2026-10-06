<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ app?.name || $t('apps.apps') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ app?.name || $t('apps.apps') }}</template>

            <LoadingSpinner :isActive="state.isLoading">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <Alert type="danger" :text="activation.error?.message"
                    v-if="activation.error?.message && activation.error.message.length > 0" />

                <div id="app-page-checkout" class="mx-auto max-w-sm md:max-w-md"></div>

                <div v-if="app && !activation.isCheckoutOpen" class="space-y-8">
                    <!-- Header: what it is, who makes it, and what it costs. -->
                    <div class="flex flex-wrap items-start gap-6">
                        <div v-if="useIconTile"
                            class="brand-tile flex h-20 w-20 flex-none items-center justify-center rounded-2xl text-white shadow-sm">
                            <Icon :name="appIcon" class="h-10 w-10" />
                        </div>
                        <img v-else-if="app.logo" :src="app.logo" :alt="app.name"
                            class="h-20 w-20 flex-none rounded-2xl border border-gray-200 bg-white object-contain p-2" />

                        <div class="min-w-[15rem] flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <h1 class="text-2xl font-semibold text-muted-800">{{ app.name }}</h1>
                                <span v-if="badge" :class="['app-badge', `app-badge-${badge.tone}`]">
                                    {{ badge.key === 'apps.badge.discount' ? $t(badge.key, { percent: price.discountPercent }) : $t(badge.key) }}
                                </span>
                            </div>
                            <p class="mt-2 max-w-2xl text-base text-gray-600">{{ app.tagline || app.description }}</p>
                            <p class="mt-2 text-xs text-gray-500">{{ byline }}</p>
                        </div>

                        <div class="w-full space-y-3 rounded-2xl border border-gray-200 bg-white p-5 md:w-64">
                            <p class="text-xl font-semibold text-muted-800">
                                <template v-if="price.isFree">{{ $t('apps.free') }}</template>
                                <template v-else>
                                    <span v-if="price.hasDiscount" class="mr-1 text-base text-muted-400 line-through">
                                        {{ formatAmount(price.amount) }}
                                    </span>
                                    {{ formatAmount(price.discountedAmount) }}
                                    <span v-if="price.unit" class="text-sm lowercase text-gray-500">/{{ price.unit }}</span>
                                </template>
                            </p>
                            <p v-if="!price.isFree" class="text-xs text-gray-500">{{ $t('excludeVat') }}</p>
                            <p v-for="note in price.notes" :key="note" class="text-xs text-muted-500">{{ note }}</p>

                            <FormButton type="button" buttonStyle="action" class="w-full justify-center"
                                v-if="app.url_field" @click="openPartner(app.url_field)">
                                {{ $t('apps.goToPartner') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="w-full justify-center"
                                v-else-if="app.user_activated && destination" @click="navigateTo(destination.path)">
                                {{ destination.open ? $t('apps.openApp') : $t('apps.goToSetup') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="app-order-now" class="w-full justify-center"
                                v-else-if="app.user_activated && app.is_quantifiable" @click="requestActivation(app)">
                                {{ $t('apps.buyMoreLicenses') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="app-activated"
                                class="w-full cursor-not-allowed justify-center" v-else-if="app.user_activated" disabled>
                                {{ $t('apps.activated') }}
                            </FormButton>
                            <Tooltip v-else-if="app.plan_eligible === false" class="w-full [&>div]:w-full" wrap
                                :text="$t('apps.requiresPlanTooltip', { plan: app.required_plan })">
                                <FormButton type="button" buttonStyle="action" class="w-full justify-center"
                                    :aria-label="$t('apps.requiresPlanTooltip', { plan: app.required_plan })"
                                    @click="navigateTo('/subscription')">
                                    {{ $t('apps.upgradeToPlan', { plan: app.required_plan }) }}
                                </FormButton>
                            </Tooltip>
                            <FormButton type="button" buttonStyle="app-order-now" class="w-full justify-center" v-else
                                @click="requestActivation(app)">
                                {{ app.is_one_time_fee ? $t('apps.orderNow') : $t('apps.activate') }}
                            </FormButton>

                            <FormButton type="button" buttonStyle="action" class="w-full justify-center"
                                @click="state.isContactOpen = true">
                                {{ $t('apps.contactUs') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- The facts a buyer in this sector asks for before anything else. -->
                    <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 md:grid-cols-4 lg:grid-cols-6">
                        <div class="bg-white px-4 py-3" v-for="spec in specs" :key="spec.label">
                            <dt class="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{{ spec.label }}</dt>
                            <dd class="mt-1 text-sm font-semibold text-muted-800">{{ spec.value }}</dd>
                        </div>
                    </dl>

                    <!-- Screenshots -->
                    <section v-if="app.screenshots?.length">
                        <h2 class="mb-3 text-lg font-semibold text-muted-800">{{ $t('apps.howItLooks') }}</h2>
                        <div class="flex gap-4 overflow-x-auto pb-2">
                            <figure v-for="shot in app.screenshots" :key="shot.uuid"
                                class="w-64 flex-none overflow-hidden rounded-xl border border-gray-200 bg-white">
                                <img :src="shot.url" :alt="shot.caption || app.name" class="h-40 w-full object-cover" />
                                <figcaption v-if="shot.caption" class="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
                                    {{ shot.caption }}
                                </figcaption>
                            </figure>
                        </div>
                    </section>

                    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <section class="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
                            <h2 class="mb-3 text-lg font-semibold text-muted-800">{{ $t('apps.aboutTheApp') }}</h2>
                            <p class="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                                {{ app.long_description || app.description }}
                            </p>
                        </section>

                        <div class="space-y-6">
                            <section class="rounded-2xl border border-gray-200 bg-white p-6" v-if="app.whats_new">
                                <h2 class="mb-3 text-lg font-semibold text-muted-800">
                                    {{ app.version ? $t('apps.whatsNewIn', { version: app.version }) : $t('apps.whatsNew') }}
                                </h2>
                                <p class="whitespace-pre-line text-sm leading-relaxed text-gray-600">{{ app.whats_new }}</p>
                            </section>

                            <section class="rounded-2xl border border-gray-200 bg-white p-6">
                                <h2 class="mb-3 text-lg font-semibold text-muted-800">{{ $t('apps.priceHeading') }}</h2>
                                <dl class="text-sm">
                                    <div class="flex justify-between border-b border-gray-100 py-2" v-if="!app.is_one_time_fee">
                                        <dt class="text-gray-500">{{ $t('apps.monthly') }}</dt>
                                        <dd class="font-semibold text-muted-800">{{ formatAmount(app.monthly_price) }}</dd>
                                    </div>
                                    <div class="flex justify-between border-b border-gray-100 py-2" v-if="!app.is_one_time_fee">
                                        <dt class="text-gray-500">{{ $t('apps.yearly') }}</dt>
                                        <dd class="font-semibold text-muted-800">{{ formatAmount(app.yearly_price) }}</dd>
                                    </div>
                                    <div class="flex justify-between border-b border-gray-100 py-2" v-if="app.is_one_time_fee">
                                        <dt class="text-gray-500">{{ $t('apps.oneTime') }}</dt>
                                        <dd class="font-semibold text-muted-800">{{ formatAmount(app.price) }}</dd>
                                    </div>
                                    <div class="flex justify-between py-2">
                                        <dt class="text-gray-500">{{ $t('apps.setupFee') }}</dt>
                                        <dd class="font-semibold text-muted-800">{{ formatAmount(app.setup_fee || 0) }}</dd>
                                    </div>
                                </dl>
                            </section>
                        </div>
                    </div>
                </div>

                <div v-else-if="!state.isLoading && !app"
                    class="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                    <p class="text-sm text-gray-600">{{ $t('apps.notFound') }}</p>
                    <FormButton type="button" buttonStyle="primary" class="mt-4" @click="navigateTo('/apps')">
                        {{ $t('apps.myAppsBrowse') }}
                    </FormButton>
                </div>

                <ModulesUserAppModalContactUs :isModalOpen="state.isContactOpen" :selectedApp="app ?? {}"
                    @close="state.isContactOpen = false" />
                <ModulesUserAppModalTACConfirmation :isModalOpen="activation.isTermsOpen" :selectedApp="activation.selectedApp"
                    @close="activation.isTermsOpen = false" @confirmAppActivation="activate" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/user/AppService'
import { useI18n } from 'vue-i18n'
import { appBadgeFor, useAppPrice } from '@/composables/appPrice'
import { useAppActivation } from '@/composables/appActivation'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t, locale } = useI18n()
const { appPrice, formatAmount } = useAppPrice()
const { activation, requestActivation, activate } = useAppActivation({ checkoutContainerId: 'app-page-checkout' })

const state = reactive({
    app: null as any,
    error: {} as Error,
    isLoading: false,
    isContactOpen: false,
})

const app = computed(() => state.app)
const price = computed(() => appPrice(state.app ?? {}))
const badge = computed(() => appBadgeFor(state.app ?? {}))
const appIcon = computed(() => appIconFor(state.app ?? {}).icon)
const useIconTile = computed(() => appIconFor(state.app ?? {}).useTile)
const destination = computed(() => appDestinationFor(state.app ?? {}))

const breadcrumbLinks = computed(() => [
    { name: 'apps.apps', translate: true, href: '/apps' },
    { name: state.app?.name ?? '', translate: false, href: route.fullPath },
])

const byline = computed(() =>
    [
        state.app?.publisher,
        state.app?.category?.name,
        state.app?.install_count > 0 ? t('apps.usedBy', { count: state.app.install_count }) : null,
    ].filter(Boolean).join(' · ')
)

/**
 * The strip under the header. Only facts that are filled in are shown: an empty
 * "Version -" tells the reader nothing and makes the app look abandoned.
 */
const specs = computed(() => {
    const app = state.app
    if (!app) return []

    return [
        app.version ? { label: t('apps.version'), value: app.version } : null,
        app.released_at ? { label: t('apps.updated'), value: formatDate(app.released_at) } : null,
        app.category?.name ? { label: t('apps.category'), value: app.category.name } : null,
        app.publisher ? { label: t('apps.publisher'), value: app.publisher } : null,
        app.data_location ? { label: t('apps.dataLocation'), value: app.data_location } : null,
        { label: t('apps.billing'), value: app.is_one_time_fee ? t('apps.oneTime') : t('apps.subscription') },
    ].filter(Boolean) as { label: string; value: string }[]
})

function formatDate(value: string) {
    const date = new Date(value)
    if (isNaN(date.getTime())) return value

    return date.toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

async function openPartner(link: string) {
    if (link) {
        await navigateTo(link, { external: true, open: { target: '_blank' } })
    }
}

onMounted(fetchApp)

async function fetchApp() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await appService.getAppBySlug(String(route.params.slug))
        state.app = response?.data ?? null
    } catch (error: any) {
        state.error = error
        state.app = null
    }
    state.isLoading = false
}
</script>
